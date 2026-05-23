import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  validateApiKey,
  extractApiKeyFromRequest,
  touchApiKey,
} from "@/lib/api-keys";

/**
 * GET /v1/consultations/:id
 *
 * Retorna a consulta com PDF (signed url) + resultado estruturado caso
 * `include=result` esteja na querystring.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const rawKey = extractApiKeyFromRequest(req);
  const auth = await validateApiKey(rawKey);
  if (!auth.ok || !auth.apiKey) {
    return NextResponse.json(
      { error: `unauthorized:${auth.reason ?? "unknown"}` },
      { status: 401 }
    );
  }

  if (!auth.apiKey.scopes.includes("consultations:read")) {
    return NextResponse.json(
      { error: "scope_required", details: { scope: "consultations:read" } },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const includeResult = url.searchParams.get("include") === "result";

  const admin = createAdminClient();
  const selectCols = includeResult
    ? "id, status, created_at, plan_tier, category, target_value, pdf_url, completed_at, external_reference, result_jsonb, api_total_cost_cents, amount_cents, folhas_used"
    : "id, status, created_at, plan_tier, category, target_value, pdf_url, completed_at, external_reference, api_total_cost_cents, amount_cents, folhas_used";

  const { data, error } = await admin
    .from("consultations")
    .select(selectCols)
    .eq("id", id)
    .eq("company_id", auth.apiKey.company_id) // garante isolamento por empresa
    .maybeSingle<{
      id: string;
      status: string;
      created_at: string;
      plan_tier: string;
      category: string;
      target_value: string;
      pdf_url: string | null;
      completed_at: string | null;
      external_reference: string | null;
      api_total_cost_cents: number;
      amount_cents: number;
      folhas_used: number;
      result_jsonb?: unknown;
    }>();

  if (error || !data) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  await touchApiKey(auth.apiKey.id);

  const body: Record<string, unknown> = {
    id: data.id,
    status: data.status,
    category: data.category,
    plan_id: data.plan_tier,
    target: data.target_value,
    external_reference: data.external_reference,
    pdf_url: data.pdf_url,
    // amount_cents = valor debitado do saldo da empresa (preco B2B do plano).
    amount_cents: data.amount_cents,
    // folhas_used: campo legado, mantido pra retrocompat. Sempre 0 no modelo
    // atual (saldo em R$ direto, sem creditos).
    folhas_used: data.folhas_used ?? 0,
    created_at: data.created_at,
    completed_at: data.completed_at,
  };

  if (includeResult && data.result_jsonb) {
    body.result = data.result_jsonb;
  }

  return NextResponse.json(body);
}
