import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/log";
import type { AsaasWebhookEvent } from "@/lib/asaas/types";
import { dispatchEvent } from "@/lib/webhooks";
import { findPacoteManada } from "@/lib/consultas/planos";

/**
 * Webhook Asaas — recebe eventos de pagamento.
 *
 * Configurar no painel Asaas com URL:
 *   https://suacapivara.com.br/api/asaas/webhook
 *
 * Header esperado: `asaas-access-token` = ASAAS_WEBHOOK_SECRET
 *
 * Fixes (auditoria 2026-07-23):
 *  - Timing-safe compare do token
 *  - Dedup por event.id via capivara.asaas_webhook_events (migration 0013)
 *  - Valida payment.value >= consulta.amount_cents antes de marcar paid
 *  - Retorna 500 em erro de DB pro Asaas reentregar (era 200 sempre)
 *  - PAYMENT_REFUNDED parcial: so marca refunded se valor cheio
 *  - paid_at = COALESCE (nao sobrescreve se ja setado)
 *
 * Eventos tratados:
 *   PAYMENT_CONFIRMED, PAYMENT_RECEIVED   → marca paga + valida valor + dispara Edge
 *   PAYMENT_OVERDUE                       → status='expired'
 *   PAYMENT_DELETED                       → status='expired' + cancela
 *   PAYMENT_REFUNDED                      → status='refunded' se valor cheio
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  // 1. Validar assinatura (timing-safe)
  const token = request.headers.get("asaas-access-token") ?? "";
  const expected = process.env.ASAAS_WEBHOOK_SECRET;

  if (!expected) {
    await logError({
      context: "asaas_webhook",
      severity: "critical",
      message: "ASAAS_WEBHOOK_SECRET nao configurado",
    });
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (!safeEqual(token, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse payload
  let event: AsaasWebhookEvent;
  try {
    event = (await request.json()) as AsaasWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const payment = event.payment;
  if (!payment?.id) {
    return NextResponse.json({ ok: true });
  }

  const admin = createAdminClient();

  // 3. Dedup por event.id (idempotencia). Asaas ja reenvia o mesmo event
  // em cenarios de retry — sem isso, PAYMENT_REFUNDED replay dispara refund 2x.
  // Alguns eventos Asaas podem nao ter id proprio; nesse caso derivamos.
  const eventId =
    (event as { id?: string; eventId?: string }).id ??
    (event as { id?: string; eventId?: string }).eventId ??
    // Fallback (raro): compõe com event+payment.id — nao ideal mas evita replay obvio
    `${event.event}:${payment.id}`;

  const { error: dedupErr } = await admin
    .from("asaas_webhook_events")
    .insert({
      event_id: eventId,
      event_type: event.event,
      payment_id: payment.id,
      raw_payload: event as unknown as Record<string, unknown>,
    });

  // 23505 = unique_violation → evento ja processado. Retorna 200 sem re-agir.
  if (dedupErr && (dedupErr as { code?: string }).code === "23505") {
    console.log(`[asaas_webhook] evento ${eventId} ja processado, ignorando`);
    return NextResponse.json({ ok: true, duplicate: true });
  }

  // 4. Buscar referencia: pode ser consulta (B2C avulso) ou recarga (B2B)
  const externalRef = payment.externalReference ?? "";

  // ---- RECARGA B2B: recharge:companyId:pacoteId ----
  if (externalRef.startsWith("recharge:")) {
    const [, companyId, pacoteId] = externalRef.split(":");
    if (!companyId || !pacoteId) return NextResponse.json({ ok: true });

    try {
      switch (event.event) {
        case "PAYMENT_CONFIRMED":
        case "PAYMENT_RECEIVED": {
          // Antes da race fix: 2 eventos com event_id diferente (PAYMENT_CONFIRMED
          // + PAYMENT_RECEIVED) passam pelo dedup de asaas_webhook_events, e 2
          // handlers concorrentes viam tx.status!='paid' antes do primeiro commit
          // → add_balance_cents chamado 2x → saldo dobrado.
          //
          // Fix: UPDATE atomico com WHERE status != 'paid' RETURNING. Se
          // retornar row, ESTE handler ganhou a race — credita saldo. Se
          // vier vazio, outro handler ja processou — no-op.
          const { data: tx } = await admin
            .from("transactions")
            .select("id, amount_cents, status")
            .eq("asaas_payment_id", payment.id)
            .maybeSingle();

          if (!tx || tx.status === "paid") break;

          // Valida valor pago >= valor esperado (evita replay de valor menor)
          const valorRecebidoCentavos = Math.round(Number(payment.value ?? 0) * 100);
          if (tx.amount_cents && valorRecebidoCentavos < tx.amount_cents) {
            await logError({
              context: "asaas_webhook.recharge",
              severity: "critical",
              message: `Valor recebido (R$ ${payment.value}) menor que amount_cents ${tx.amount_cents} — possivel fraude`,
              metadata: { paymentId: payment.id, companyId, pacoteId, txId: tx.id },
            });
            return NextResponse.json({ error: "Valor divergente" }, { status: 400 });
          }

          // UPDATE atomico: so muda status pra 'paid' se atualmente NAO for.
          // .select() retorna as rows que foram efetivamente atualizadas.
          const { data: claimed, error: claimErr } = await admin
            .from("transactions")
            .update({
              status: "paid",
              paid_at: new Date().toISOString(),
              asaas_response: payment as unknown as Record<string, unknown>,
            })
            .eq("id", tx.id)
            .neq("status", "paid")
            .select("id");

          if (claimErr) throw claimErr;

          // Se vazio: outro handler concorrente ja marcou paid. No-op idempotente.
          if (!claimed || claimed.length === 0) {
            console.log(`[asaas_webhook.recharge] tx ${tx.id} ja marcada paid por outro handler, skip credit`);
            break;
          }

          const pacote = findPacoteManada(pacoteId);
          const saldoTotalCentavos =
            pacote?.saldoTotal_centavos ?? tx.amount_cents ?? 0;

          if (saldoTotalCentavos > 0) {
            const { error: rpcErr } = await admin.rpc("add_balance_cents", {
              p_company_id: companyId,
              p_amount_cents: saldoTotalCentavos,
            });
            if (rpcErr) throw rpcErr;
          }
          break;
        }

        case "PAYMENT_OVERDUE":
        case "PAYMENT_DELETED": {
          await admin
            .from("transactions")
            .update({
              status: event.event === "PAYMENT_OVERDUE" ? "expired" : "cancelled",
              expired_at: event.event === "PAYMENT_OVERDUE" ? new Date().toISOString() : null,
            })
            .eq("asaas_payment_id", payment.id);
          break;
        }
      }
    } catch (err) {
      await logError({
        context: "asaas_webhook.recharge",
        severity: "error",
        message: `Falha processando recarga ${event.event}`,
        error: err instanceof Error ? err : new Error(String(err)),
        metadata: { event: event.event, paymentId: payment.id, companyId, pacoteId },
      });
      // Retorna 500 pra Asaas retentar (era 200 antes — cobrança confirmada podia ficar sem processamento)
      return NextResponse.json({ error: "Retry" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // ---- CONSULTA B2C: consultation:consultaId ----
  if (!externalRef.startsWith("consultation:")) {
    return NextResponse.json({ ok: true });
  }
  const consultaId = externalRef.slice("consultation:".length);

  try {
    switch (event.event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        // Valida valor pago >= amount_cents da consulta antes de marcar paid
        const { data: c0 } = await admin
          .from("consultations")
          .select("amount_cents, status, paid_at")
          .eq("id", consultaId)
          .maybeSingle();

        if (!c0) {
          return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
        }

        const valorRecebidoCentavos = Math.round(Number(payment.value ?? 0) * 100);
        if (c0.amount_cents && valorRecebidoCentavos < c0.amount_cents) {
          await logError({
            context: "asaas_webhook.consultation",
            severity: "critical",
            message: `Valor recebido (R$ ${payment.value}) menor que amount_cents ${c0.amount_cents} — possivel fraude`,
            consultationId: consultaId,
            metadata: { paymentId: payment.id },
          });
          return NextResponse.json({ error: "Valor divergente" }, { status: 400 });
        }

        // Ja marcada paid? entao webhook duplicado (dedup ja pegou eventId, mas
        // idempotencia defensiva). Nao dispara Edge de novo.
        if (c0.status !== "pending_payment") {
          console.log(`[asaas_webhook] consulta ${consultaId} status=${c0.status}, ignorando`);
          return NextResponse.json({ ok: true, already_paid: true });
        }

        // COALESCE paid_at (nao sobrescreve se ja setado)
        const paidAtISO = c0.paid_at ?? new Date().toISOString();

        const { error: e1 } = await admin
          .from("consultations")
          .update({ status: "paid", paid_at: paidAtISO })
          .eq("id", consultaId);
        if (e1) throw e1;

        const { error: e2 } = await admin
          .from("transactions")
          .update({
            status: "paid",
            paid_at: paidAtISO,
            asaas_response: payment as unknown as Record<string, unknown>,
          })
          .eq("asaas_payment_id", payment.id);
        if (e2) throw e2;

        // Dispara Edge Function (aguarda pra saber se disparo saiu)
        await disparaProcessamento(consultaId);

        // Dispatch webhook B2B payment.confirmed
        try {
          const { data: c } = await admin
            .from("consultations")
            .select("company_id, external_reference, plan_tier, category, target_value")
            .eq("id", consultaId)
            .maybeSingle();
          if (c?.company_id) {
            await dispatchEvent(c.company_id, "payment.confirmed", {
              consultation_id: consultaId,
              external_reference: c.external_reference ?? null,
              plan_id: c.plan_tier,
              category: c.category,
              target: c.target_value,
              confirmed_at: paidAtISO,
            });
          }
        } catch (e) {
          console.error("[asaas_webhook] dispatch payment.confirmed:", e);
        }

        break;
      }

      case "PAYMENT_OVERDUE": {
        await admin
          .from("consultations")
          .update({ status: "expired" })
          .eq("id", consultaId);
        await admin
          .from("transactions")
          .update({ status: "expired", expired_at: new Date().toISOString() })
          .eq("asaas_payment_id", payment.id);
        break;
      }

      case "PAYMENT_DELETED": {
        await admin
          .from("consultations")
          .update({ status: "expired" })
          .eq("id", consultaId);
        await admin
          .from("transactions")
          .update({ status: "cancelled" })
          .eq("asaas_payment_id", payment.id);
        break;
      }

      case "PAYMENT_REFUNDED": {
        // Refund parcial: Asaas suporta. Se valor devolvido < amount_cents,
        // marca com status especial "refunded_partial" e loga.
        const { data: cRef } = await admin
          .from("consultations")
          .select("amount_cents")
          .eq("id", consultaId)
          .maybeSingle();

        const valorDevolvidoCentavos = Math.round(Number(payment.value ?? 0) * 100);
        const eParcial =
          cRef?.amount_cents &&
          valorDevolvidoCentavos > 0 &&
          valorDevolvidoCentavos < cRef.amount_cents;

        if (eParcial) {
          // Nao mudamos pra 'refunded' (que significa refund total). Logamos
          // como incidente pra revisao manual do admin.
          await logError({
            context: "asaas_webhook.refund_partial",
            severity: "warning",
            message: `Refund parcial recebido: R$ ${payment.value} de R$ ${(cRef.amount_cents ?? 0) / 100}`,
            consultationId: consultaId,
            metadata: { paymentId: payment.id, valorDevolvidoCentavos, amountCents: cRef.amount_cents },
          });
          // Transaction ganha refund_partial (nao no CHECK, so metadado no asaas_response)
          await admin
            .from("transactions")
            .update({
              asaas_response: payment as unknown as Record<string, unknown>,
            })
            .eq("asaas_payment_id", payment.id);
        } else {
          // Refund total
          await admin
            .from("consultations")
            .update({ status: "refunded" })
            .eq("id", consultaId);
          await admin
            .from("transactions")
            .update({ status: "refunded" })
            .eq("asaas_payment_id", payment.id);
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    await logError({
      context: "asaas_webhook",
      severity: "error",
      message: `Falha processando webhook ${event.event}`,
      error: err instanceof Error ? err : new Error(String(err)),
      consultationId: consultaId,
      metadata: { event: event.event, paymentId: payment.id },
    });
    // Retorna 500 pra Asaas retentar — antes retornava 200 e cobrança confirmada
    // ficava sem processamento se DB estava down.
    return NextResponse.json({ error: "Retry" }, { status: 500 });
  }
}

async function disparaProcessamento(consultaId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) return;

  // Chamada assincrona — nao bloqueia o webhook mas garante que saiu antes do return
  // (fetch em Node runtime nao e' droppado como em Deno Edge)
  try {
    await fetch(`${baseUrl}/functions/v1/process-consultation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ consultationId: consultaId }),
      // 5s de timeout pro dispatch — se Edge demorar mais, ok, ela continua rodando
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error("[asaas_webhook] falha ao disparar Edge Function:", e);
  }
}
