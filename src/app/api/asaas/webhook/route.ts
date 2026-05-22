import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/log";
import type { AsaasWebhookEvent } from "@/lib/asaas/types";
import { dispatchEvent } from "@/lib/webhooks";

/**
 * Webhook Asaas — recebe eventos de pagamento.
 *
 * Configurar no painel Asaas com URL:
 *   https://capivara-green.vercel.app/api/asaas/webhook
 *
 * Header esperado: `asaas-access-token` = ASAAS_WEBHOOK_SECRET
 *
 * Eventos tratados:
 *   PAYMENT_CONFIRMED, PAYMENT_RECEIVED   → marca paga + dispara Edge Function
 *   PAYMENT_OVERDUE                       → status='expired'
 *   PAYMENT_DELETED                       → status='expired' + cancela
 *   PAYMENT_REFUNDED                      → status='refunded'
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // 1. Validar assinatura
  const token = request.headers.get("asaas-access-token");
  const expected = process.env.ASAAS_WEBHOOK_SECRET;

  if (!expected) {
    await logError({
      context: "asaas_webhook",
      severity: "critical",
      message: "ASAAS_WEBHOOK_SECRET nao configurado",
    });
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (token !== expected) {
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

  // 3. Buscar consulta pela ref
  const externalRef = payment.externalReference ?? "";
  if (!externalRef.startsWith("consultation:")) {
    // Pode ser recharge B2B ou outra origem — futuro
    return NextResponse.json({ ok: true });
  }
  const consultaId = externalRef.slice("consultation:".length);

  try {
    switch (event.event) {
      case "PAYMENT_CONFIRMED":
      case "PAYMENT_RECEIVED": {
        // Marca consulta como paga + transaction
        await admin
          .from("consultations")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("id", consultaId);

        await admin
          .from("transactions")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            asaas_response: payment as unknown as Record<string, unknown>,
          })
          .eq("asaas_payment_id", payment.id);

        // Dispara Edge Function para processar (em background, fire-and-forget)
        await disparaProcessamento(consultaId);

        // Dispara webhook B2B payment.confirmed (se for consulta de empresa)
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
              confirmed_at: new Date().toISOString(),
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
        await admin
          .from("consultations")
          .update({ status: "refunded" })
          .eq("id", consultaId);
        await admin
          .from("transactions")
          .update({ status: "refunded" })
          .eq("asaas_payment_id", payment.id);
        break;
      }

      default:
        // Ignorar outros eventos por enquanto
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
    return NextResponse.json({ ok: true }); // Retorna 200 mesmo em erro pra Asaas não ficar reentregando
  }
}

async function disparaProcessamento(consultaId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) return;

  // Fire and forget — nao espera resposta da Edge Function
  fetch(`${baseUrl}/functions/v1/process-consultation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ consultationId: consultaId }),
  }).catch((e) => {
    console.error("[asaas_webhook] falha ao disparar Edge Function:", e);
  });
}
