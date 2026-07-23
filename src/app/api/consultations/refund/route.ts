import { NextResponse, type NextRequest } from "next/server";
import { performRefund } from "@/lib/refund";
import { isInternalKeyValid } from "@/lib/auth/internal";

// =========================================================================
// POST /api/consultations/refund — refund automatico (Edge Function → refund)
//
// Auth: header `x-internal-key` = INTERNAL_WEBHOOK_SECRET (dedicado).
// Fallback legado: SUPABASE_SERVICE_ROLE_KEY (remover apos migracao).
//
// Novo em v2 (auditoria 2026-07-23):
//   - Timing-safe compare via isInternalKeyValid
//   - Suporte a partial refund via partialAmountCents
//   - Logica extraida pra src/lib/refund.ts (reusa em admin route)
// =========================================================================

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RefundBody {
  consultationId: string;
  reason?: string;
  failedApis?: string[];
  /** Valor em centavos pra refund parcial. Omitir = refund total. */
  partialAmountCents?: number;
}

export async function POST(request: NextRequest) {
  if (!isInternalKeyValid(request.headers.get("x-internal-key"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const result = await performRefund({
    consultationId: body.consultationId,
    reason: body.reason ?? "no_data_found",
    failedApis: body.failedApis,
    partialAmountCents: body.partialAmountCents,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    consultation_id: result.consultationId,
    refund_method: result.refundMethod,
    amount_cents_refunded: result.amountCentsRefunded,
    reason: result.reason,
    refunded_at: result.refundedAt,
    idempotent: result.idempotent,
  });
}
