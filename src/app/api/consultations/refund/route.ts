import { NextResponse, type NextRequest } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/log";
import { dispatchEvent } from "@/lib/webhooks";
import { refundPayment, centavosToReal } from "@/lib/asaas/client";
import type { Consultation, Transaction } from "@/types/database";

// =========================================================================
// POST /api/consultations/refund — reembolso automatico de consulta sem dados
//
// Disparada por:
//   - Edge Function process-consultation quando 0 APIs trouxeram dados uteis
//   - Manualmente pelo admin (via /admin/financeiro, futuramente)
//
// Auth: header `x-internal-key` deve bater com SUPABASE_SERVICE_ROLE_KEY.
//
// Fluxo:
//   1. Verifica idempotencia (consulta ja em status refunded?)
//   2. Decide canal de devolucao:
//        B2C -> Asaas refund (paymentId obrigatorio)
//        B2B (payment_type='folhas') -> re-credita balance_cents
//   3. Atualiza status consulta='refunded' + transaction(s) relacionada(s)
//   4. Cria transaction tipo='refund' (rastreabilidade)
//   5. Dispatch webhook B2B consultation.refunded
//   6. Audita em error_logs (severity='info', context='refund')
// =========================================================================

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RefundBody {
  consultationId: string;
  reason?: string; // motivo livre, default = "no_data_found"
  /**
   * APIs que falharam — dispara webhook `consultation.failed` antes de
   * processar o refund (so quando vier preenchido). Edge Function usa
   * isso pra notificar parceiros B2B do motivo da falha.
   */
  failedApis?: string[];
}

export async function POST(request: NextRequest) {
  // ---- 1. Auth: chave interna ----
  const key = request.headers.get("x-internal-key");
  const expected = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!expected || key !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ---- 2. Parse body ----
  let body: RefundBody;
  try {
    body = (await request.json()) as RefundBody;
  } catch {
    return NextResponse.json({ error: "JSON invalido" }, { status: 400 });
  }

  if (!body?.consultationId) {
    return NextResponse.json(
      { error: "consultationId obrigatorio" },
      { status: 400 }
    );
  }

  const reason = body.reason ?? "no_data_found";
  const admin = createAdminClient();

  // ---- 3. Carrega consulta ----
  const { data: consultaRaw, error: loadErr } = await admin
    .from("consultations")
    .select("*")
    .eq("id", body.consultationId)
    .maybeSingle();

  if (loadErr || !consultaRaw) {
    return NextResponse.json(
      { error: "Consulta nao encontrada" },
      { status: 404 }
    );
  }

  const consulta = consultaRaw as Consultation & {
    api_key_id?: string | null;
    external_reference?: string | null;
  };

  // Idempotencia: ja foi refundada
  if (consulta.status === "refunded") {
    return NextResponse.json({
      ok: true,
      idempotent: true,
      message: "Consulta ja estava refundada",
    });
  }

  // So consultas em paid|processing|completed sao elegiveis pra refund
  const elegiveis = ["paid", "processing", "completed"];
  if (!elegiveis.includes(consulta.status)) {
    return NextResponse.json(
      {
        error: `Status "${consulta.status}" nao e elegivel pra refund`,
        elegiveis,
      },
      { status: 400 }
    );
  }

  const amountCents = consulta.amount_cents ?? 0;
  let refundMethod: "asaas" | "balance_cents" | "none" = "none";

  // ---- 3b. Dispara webhook consultation.failed (antes do refund) ----
  // Permite que o cliente B2B reaja a falha (logar, notificar usuario, etc)
  // antes mesmo do reembolso entrar nos extratos.
  if (consulta.company_id) {
    try {
      await dispatchEvent(consulta.company_id, "consultation.failed", {
        consultation_id: consulta.id,
        external_reference: consulta.external_reference ?? null,
        plan_id: consulta.plan_tier,
        category: consulta.category,
        target: consulta.target_value,
        reason,
        failed_apis: body.failedApis ?? [],
        failed_at: new Date().toISOString(),
      });
    } catch (e) {
      console.error("[refund] dispatch consultation.failed:", e);
    }
  }

  // ---- 4a. B2B: re-credita saldo da empresa ----
  if (consulta.payment_type === "folhas" && consulta.company_id) {
    refundMethod = "balance_cents";
    try {
      const { error: rpcErr } = await admin.rpc("add_balance_cents", {
        p_company_id: consulta.company_id,
        p_amount_cents: amountCents,
      });
      if (rpcErr) throw rpcErr;
    } catch (err) {
      await logError({
        context: "refund.balance_cents",
        severity: "error",
        message: "Falha ao re-creditar balance_cents",
        error: err instanceof Error ? err : new Error(String(err)),
        consultationId: consulta.id,
        metadata: { companyId: consulta.company_id, amountCents },
      });
      return NextResponse.json(
        { error: "Falha ao re-creditar saldo da empresa" },
        { status: 500 }
      );
    }
  }

  // ---- 4b. B2C: refund no Asaas ----
  if (consulta.asaas_payment_id) {
    refundMethod = "asaas";
    try {
      await refundPayment(
        consulta.asaas_payment_id,
        centavosToReal(amountCents),
        `Reembolso automatico Capivara — ${reason}`
      );

      // Marca transaction original como refundada
      await admin
        .from("transactions")
        .update({ status: "refunded" })
        .eq("asaas_payment_id", consulta.asaas_payment_id);
    } catch (err) {
      await logError({
        context: "refund.asaas",
        severity: "error",
        message: "Falha ao chamar Asaas refund",
        error: err instanceof Error ? err : new Error(String(err)),
        consultationId: consulta.id,
        metadata: { paymentId: consulta.asaas_payment_id, amountCents },
      });
      return NextResponse.json(
        { error: "Falha ao processar refund no Asaas" },
        { status: 502 }
      );
    }
  }

  if (refundMethod === "none") {
    return NextResponse.json(
      {
        error:
          "Consulta nao tem nem asaas_payment_id nem company_id+folhas — nada pra reembolsar",
      },
      { status: 400 }
    );
  }

  // ---- 5. Atualiza consulta + transactions ----
  const now = new Date().toISOString();

  const newResult = {
    ...(consulta.result_jsonb ?? {}),
    _refunded: true,
    _refund_reason: reason,
    _refunded_at: now,
    _refund_method: refundMethod,
  };

  const { error: updErr } = await admin
    .from("consultations")
    .update({
      status: "refunded",
      result_jsonb: newResult,
    })
    .eq("id", consulta.id);

  if (updErr) {
    await logError({
      context: "refund.update_consulta",
      severity: "error",
      message: "Falha update consulta refunded",
      error: updErr,
      consultationId: consulta.id,
    });
  }

  // ---- 6. Cria entrada em transactions tipo='refund' pra rastreabilidade ----
  const refundTx: Partial<Transaction> = {
    user_id: consulta.user_id,
    company_id: consulta.company_id,
    type: "refund",
    reference_id: consulta.id,
    payment_method: consulta.payment_type === "folhas" ? "pix" : consulta.payment_type,
    amount_cents: amountCents,
    asaas_payment_id: consulta.asaas_payment_id ?? null,
    status: "refunded",
    paid_at: now,
    asaas_response: {
      _refund: true,
      _reason: reason,
      _method: refundMethod,
    } as Record<string, unknown>,
  };

  await admin.from("transactions").insert(refundTx);

  // ---- 7. Webhook B2B consultation.refunded ----
  if (consulta.company_id) {
    try {
      await dispatchEvent(consulta.company_id, "consultation.refunded", {
        consultation_id: consulta.id,
        external_reference: consulta.external_reference ?? null,
        plan_id: consulta.plan_tier,
        amount_cents_refunded: amountCents,
        refund_method: refundMethod,
        reason,
        refunded_at: now,
      });
    } catch (e) {
      console.error("[refund] dispatch consultation.refunded falhou:", e);
    }
  }

  // ---- 8. Auditoria ----
  await logError({
    context: "refund",
    severity: "info",
    message: `Refund processado (${refundMethod}) — ${reason}`,
    consultationId: consulta.id,
    metadata: {
      reason,
      method: refundMethod,
      amount_cents: amountCents,
      asaas_payment_id: consulta.asaas_payment_id,
      company_id: consulta.company_id,
    },
  });

  return NextResponse.json({
    ok: true,
    consultation_id: consulta.id,
    refund_method: refundMethod,
    amount_cents_refunded: amountCents,
    reason,
    refunded_at: now,
  });
}
