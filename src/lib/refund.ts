import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/log";
import { dispatchEvent } from "@/lib/webhooks";
import { refundPayment, centavosToReal } from "@/lib/asaas/client";
import type { Consultation, Transaction } from "@/types/database";

/**
 * Refund reusavel (Edge auto, admin manual, futuras rotas).
 *
 * Trata: idempotencia, valor parcial, canal (Asaas vs balance_cents),
 * dispatch de webhook consultation.failed/refunded, audit_logs.
 */

export type RefundReason = "no_data_found" | "partial_data_failure" | "admin_manual" | string;

export interface RefundOptions {
  consultationId: string;
  reason: RefundReason;
  /**
   * Se setado, faz refund parcial no valor exato (em centavos).
   * Deve ser <= amount_cents original. Se undefined, refund cheio.
   */
  partialAmountCents?: number;
  failedApis?: string[];
  /**
   * ID do admin que solicitou (pra audit_logs). Vazio se automatico.
   */
  actorId?: string;
  actorEmail?: string;
  /**
   * IP/UA pra audit_logs (quando disparado por rota interna com session).
   */
  ipAddress?: string;
  userAgent?: string;
}

export type RefundMethod = "asaas" | "balance_cents" | "none";

export interface RefundResult {
  ok: true;
  consultationId: string;
  refundMethod: RefundMethod;
  amountCentsRefunded: number;
  reason: string;
  refundedAt: string;
  idempotent?: boolean;
}

export type RefundError =
  | { ok: false; status: 404; error: "consultation_not_found" }
  | { ok: false; status: 400; error: "invalid_status" | "invalid_partial_amount" | "no_refund_channel" }
  | { ok: false; status: 502; error: "asaas_refund_failed"; details?: string }
  | { ok: false; status: 500; error: "balance_credit_failed" | "db_update_failed"; details?: string };

export async function performRefund(opts: RefundOptions): Promise<RefundResult | RefundError> {
  const admin = createAdminClient();

  // ---- 1. Carrega consulta ----
  const { data: consultaRaw, error: loadErr } = await admin
    .from("consultations")
    .select("*")
    .eq("id", opts.consultationId)
    .maybeSingle();

  if (loadErr || !consultaRaw) {
    return { ok: false, status: 404, error: "consultation_not_found" };
  }

  const consulta = consultaRaw as Consultation & {
    api_key_id?: string | null;
    external_reference?: string | null;
  };

  // Idempotencia total: ja refundada
  if (consulta.status === "refunded") {
    return {
      ok: true,
      consultationId: consulta.id,
      refundMethod: "none",
      amountCentsRefunded: 0,
      reason: opts.reason,
      refundedAt: new Date().toISOString(),
      idempotent: true,
    };
  }

  const elegiveis = ["paid", "processing", "completed"];
  if (!elegiveis.includes(consulta.status)) {
    return { ok: false, status: 400, error: "invalid_status" };
  }

  const totalCents = consulta.amount_cents ?? 0;
  const refundAmountCents = opts.partialAmountCents ?? totalCents;

  if (refundAmountCents <= 0 || refundAmountCents > totalCents) {
    return { ok: false, status: 400, error: "invalid_partial_amount" };
  }

  const isPartial = refundAmountCents < totalCents;

  // ---- 2. Dispatch consultation.failed ANTES do refund (so pra B2B) ----
  if (consulta.company_id) {
    try {
      await dispatchEvent(consulta.company_id, "consultation.failed", {
        consultation_id: consulta.id,
        external_reference: consulta.external_reference ?? null,
        plan_id: consulta.plan_tier,
        category: consulta.category,
        target: consulta.target_value,
        reason: opts.reason,
        failed_apis: opts.failedApis ?? [],
        failed_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("[refund] dispatch consultation.failed:", e);
    }
  }

  // ---- 3. B2B: re-credita saldo ----
  let refundMethod: RefundMethod = "none";

  if (consulta.payment_type === "folhas" && consulta.company_id) {
    refundMethod = "balance_cents";
    const { error: rpcErr } = await admin.rpc("add_balance_cents", {
      p_company_id: consulta.company_id,
      p_amount_cents: refundAmountCents,
    });
    if (rpcErr) {
      await logError({
        context: "refund.balance_cents",
        severity: "error",
        message: "Falha add_balance_cents",
        error: rpcErr,
        consultationId: consulta.id,
        metadata: { companyId: consulta.company_id, refundAmountCents },
      });
      return { ok: false, status: 500, error: "balance_credit_failed", details: String(rpcErr.message) };
    }
  }

  // ---- 4. B2C: Asaas refund ----
  if (consulta.asaas_payment_id) {
    refundMethod = "asaas";
    try {
      await refundPayment(
        consulta.asaas_payment_id,
        centavosToReal(refundAmountCents),
        `Reembolso Capivara — ${opts.reason}`
      );

      // Marca transaction original como refundada (apenas em refund total)
      if (!isPartial) {
        await admin
          .from("transactions")
          .update({ status: "refunded" })
          .eq("asaas_payment_id", consulta.asaas_payment_id);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
      // Se Asaas retorna "already refunded", trata como sucesso idempotente
      if (msg.includes("already refunded") || msg.includes("ja reembolsado")) {
        console.log("[refund] Asaas ja tinha refundado — idempotente");
      } else {
        await logError({
          context: "refund.asaas",
          severity: "error",
          message: "Falha Asaas refund",
          error: err instanceof Error ? err : new Error(String(err)),
          consultationId: consulta.id,
          metadata: { paymentId: consulta.asaas_payment_id, refundAmountCents },
        });
        return { ok: false, status: 502, error: "asaas_refund_failed", details: msg };
      }
    }
  }

  if (refundMethod === "none") {
    return { ok: false, status: 400, error: "no_refund_channel" };
  }

  // ---- 5. Atualiza consulta (so em refund total; parcial mantem status atual) ----
  const now = new Date().toISOString();

  const newResult = {
    ...(consulta.result_jsonb ?? {}),
    _refunded: !isPartial,
    _partial_refund: isPartial,
    _refund_reason: opts.reason,
    _refunded_at: now,
    _refund_method: refundMethod,
    _refund_amount_cents: refundAmountCents,
  };

  const updates: Record<string, unknown> = {
    result_jsonb: newResult,
  };
  if (!isPartial) {
    updates.status = "refunded";
  }

  const { error: updErr } = await admin
    .from("consultations")
    .update(updates)
    .eq("id", consulta.id);

  if (updErr) {
    await logError({
      context: "refund.update_consulta",
      severity: "error",
      message: "Falha update consulta refunded",
      error: updErr,
      consultationId: consulta.id,
    });
    return { ok: false, status: 500, error: "db_update_failed", details: String(updErr.message) };
  }

  // ---- 6. Cria entrada em transactions tipo='refund' pra rastreabilidade ----
  // Fix: payment_method correto — 'balance_cents' pra B2B, payment_type original pra B2C
  const paymentMethodTx: Transaction["payment_method"] =
    refundMethod === "balance_cents"
      ? "balance_cents"
      : (consulta.payment_type === "folhas" ? "balance_cents" : consulta.payment_type as Transaction["payment_method"]);

  const refundTx: Partial<Transaction> = {
    user_id: consulta.user_id,
    company_id: consulta.company_id,
    type: "refund",
    reference_id: consulta.id,
    payment_method: paymentMethodTx,
    amount_cents: refundAmountCents,
    asaas_payment_id: consulta.asaas_payment_id ?? null,
    status: "refunded",
    paid_at: now,
    asaas_response: {
      _refund: true,
      _partial: isPartial,
      _reason: opts.reason,
      _method: refundMethod,
      _actor_id: opts.actorId ?? null,
    } as Record<string, unknown>,
  };

  await admin.from("transactions").insert(refundTx);

  // ---- 7. Webhook consultation.refunded ----
  if (consulta.company_id) {
    try {
      await dispatchEvent(consulta.company_id, "consultation.refunded", {
        consultation_id: consulta.id,
        external_reference: consulta.external_reference ?? null,
        plan_id: consulta.plan_tier,
        amount_cents_refunded: refundAmountCents,
        partial: isPartial,
        refund_method: refundMethod,
        reason: opts.reason,
        refunded_at: now,
      });
    } catch (e) {
      console.error("[refund] dispatch consultation.refunded:", e);
    }
  }

  // ---- 8. Auditoria: error_logs (rastro operacional) + audit_logs (rastro LGPD) ----
  await logError({
    context: "refund",
    severity: "info",
    message: `Refund processado (${refundMethod}) — ${opts.reason}${isPartial ? " [parcial]" : ""}`,
    consultationId: consulta.id,
    metadata: {
      reason: opts.reason,
      method: refundMethod,
      amount_cents: refundAmountCents,
      partial: isPartial,
      asaas_payment_id: consulta.asaas_payment_id,
      company_id: consulta.company_id,
      actor_id: opts.actorId ?? null,
    },
  });

  // Grava em audit_logs quando ha actor (admin manual)
  if (opts.actorId) {
    await admin.from("audit_logs").insert({
      actor_id: opts.actorId,
      actor_email: opts.actorEmail ?? null,
      action: isPartial ? "refund_partial" : "refund_full",
      resource_type: "consultation",
      resource_id: consulta.id,
      changes: {
        reason: opts.reason,
        amount_cents_refunded: refundAmountCents,
        refund_method: refundMethod,
      },
      ip_address: opts.ipAddress ?? null,
      user_agent: opts.userAgent ?? null,
    });
  }

  return {
    ok: true,
    consultationId: consulta.id,
    refundMethod,
    amountCentsRefunded: refundAmountCents,
    reason: opts.reason,
    refundedAt: now,
  };
}
