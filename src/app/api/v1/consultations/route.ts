import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "crypto";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  validateApiKey,
  extractApiKeyFromRequest,
  touchApiKey,
} from "@/lib/api-keys";
import { findPlano } from "@/lib/consultas/planos";
import {
  normalizeCPF,
  normalizeCNPJ,
  normalizePlaca,
  isValidCPF,
  isValidCNPJ,
  isValidPlaca,
} from "@/lib/formatters";
import { logError } from "@/lib/log";

/**
 * API publica B2B v1 — Consultations
 *
 * POST /v1/consultations  → cria consulta cobrando em folhas (creditos B2B)
 * GET  /v1/consultations  → lista consultas da empresa (paginado)
 *
 * Auth: header `Authorization: Bearer cap_live_...` ou `x-api-key`
 *
 * Idempotencia: enviar `external_reference` reutiliza a consulta existente
 * com a mesma referencia (mesma empresa).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CreateBody {
  plan_id?: string;
  target?: string;
  external_reference?: string;
  callback_url?: string;
  cost_center?: string;
  finality?: string;
}

const FINALITY_DEFAULT_API = "due_diligence";

// =============================================================================
// POST /v1/consultations
// =============================================================================
export async function POST(req: NextRequest) {
  const rawKey = extractApiKeyFromRequest(req);
  const auth = await validateApiKey(rawKey);
  if (!auth.ok || !auth.apiKey) {
    return errResponse(401, `unauthorized:${auth.reason ?? "unknown"}`);
  }

  // Rate limiting: conta consultas criadas pela mesma chave no ultimo minuto.
  // Limite default 60/min, configuravel por chave em api_keys.rate_limit_per_min.
  const adminRL = createAdminClient();
  const oneMinAgo = new Date(Date.now() - 60_000).toISOString();
  const { count: recentCount } = await adminRL
    .from("consultations")
    .select("id", { count: "exact", head: true })
    .eq("api_key_id", auth.apiKey.id)
    .gte("created_at", oneMinAgo);

  if ((recentCount ?? 0) >= auth.apiKey.rate_limit_per_min) {
    return NextResponse.json(
      {
        error: "rate_limited",
        details: {
          limit: auth.apiKey.rate_limit_per_min,
          window: "60s",
          retry_after: 60,
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Limit": String(auth.apiKey.rate_limit_per_min),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 60),
        },
      }
    );
  }

  let body: CreateBody;
  try {
    body = (await req.json()) as CreateBody;
  } catch {
    return errResponse(400, "invalid_json");
  }

  if (!body.plan_id || !body.target) {
    return errResponse(400, "missing_fields", {
      required: ["plan_id", "target"],
    });
  }

  const plano = findPlano(body.plan_id);
  if (!plano) {
    return errResponse(404, "plan_not_found", { plan_id: body.plan_id });
  }

  // Normalizar + validar target
  let targetNormalized: string;
  let valid = false;
  if (plano.categoria === "cpf") {
    targetNormalized = normalizeCPF(body.target);
    valid = isValidCPF(targetNormalized);
  } else if (plano.categoria === "cnpj") {
    targetNormalized = normalizeCNPJ(body.target);
    valid = isValidCNPJ(targetNormalized);
  } else {
    targetNormalized = normalizePlaca(body.target);
    valid = isValidPlaca(targetNormalized);
  }

  if (!valid) {
    return errResponse(422, "invalid_target", {
      category: plano.categoria,
      received: body.target,
    });
  }

  if (!auth.apiKey.scopes.includes("consultations:write")) {
    return errResponse(403, "scope_required", { scope: "consultations:write" });
  }

  const admin = createAdminClient();

  // Idempotencia: external_reference + company
  if (body.external_reference) {
    const { data: existing } = await admin
      .from("consultations")
      .select("id, status, created_at, plan_tier, target_value, pdf_url, completed_at, external_reference")
      .eq("company_id", auth.apiKey.company_id)
      .eq("external_reference", body.external_reference)
      .maybeSingle();

    if (existing) {
      await touchApiKey(auth.apiKey.id);
      return NextResponse.json(serializeConsultation(existing), { status: 200 });
    }
  }

  // Verificar saldo de folhas
  const { data: company, error: cErr } = await admin
    .from("companies")
    .select("id, folhas_balance, plan_tier, name")
    .eq("id", auth.apiKey.company_id)
    .maybeSingle();

  if (cErr || !company) {
    return errResponse(404, "company_not_found");
  }

  if ((company.folhas_balance ?? 0) < plano.custoFolhasB2B) {
    return errResponse(402, "insufficient_credits", {
      required: plano.custoFolhasB2B,
      available: company.folhas_balance ?? 0,
    });
  }

  const targetHash = createHash("sha256")
    .update(`${plano.id}:${targetNormalized}`)
    .digest("hex");

  // Owner_id: criador da api_key OU owner da company
  const { data: keyOwner } = await admin
    .from("api_keys")
    .select("created_by")
    .eq("id", auth.apiKey.id)
    .maybeSingle();

  const userId = keyOwner?.created_by ?? company.id; // fallback: pode dar erro de FK
  const { data: ownerCheck } = await admin
    .from("companies")
    .select("owner_id")
    .eq("id", company.id)
    .maybeSingle();

  const effectiveUserId = keyOwner?.created_by ?? ownerCheck?.owner_id ?? userId;

  // Criar consulta + debit transacional
  const { data: consulta, error: insertErr } = await admin
    .from("consultations")
    .insert({
      user_id: effectiveUserId,
      company_id: company.id,
      api_key_id: auth.apiKey.id,
      source: "api",
      category: plano.categoria,
      plan_tier: plano.id,
      target_value: body.target,
      target_normalized: targetNormalized,
      target_hash: targetHash,
      finality: body.finality ?? FINALITY_DEFAULT_API,
      payment_type: "folhas",
      amount_cents: 0,
      folhas_used: plano.custoFolhasB2B,
      status: "paid", // B2B ja paga via folhas, vai direto pra fila
      paid_at: new Date().toISOString(),
      external_reference: body.external_reference ?? null,
      callback_url: body.callback_url ?? null,
      cost_center: body.cost_center ?? null,
    })
    .select(
      "id, status, created_at, plan_tier, target_value, pdf_url, completed_at, external_reference"
    )
    .single();

  if (insertErr || !consulta) {
    await logError({
      context: "api_v1_consultations.create",
      severity: "error",
      message: "Falha ao criar consulta via API",
      error: insertErr ?? undefined,
      metadata: { company_id: company.id, plan_id: plano.id },
    });
    return errResponse(500, "create_failed");
  }

  // Debit folhas
  const { error: debErr } = await admin
    .from("companies")
    .update({
      folhas_balance: (company.folhas_balance ?? 0) - plano.custoFolhasB2B,
    })
    .eq("id", company.id);

  if (debErr) {
    // Rollback: reverter consulta
    await admin.from("consultations").delete().eq("id", consulta.id);
    return errResponse(500, "debit_failed");
  }

  // Disparar processamento (fire-and-forget)
  fireAndForgetProcess(consulta.id);

  await touchApiKey(auth.apiKey.id);

  return NextResponse.json(serializeConsultation(consulta), { status: 201 });
}

// =============================================================================
// GET /v1/consultations
// =============================================================================
export async function GET(req: NextRequest) {
  const rawKey = extractApiKeyFromRequest(req);
  const auth = await validateApiKey(rawKey);
  if (!auth.ok || !auth.apiKey) {
    return errResponse(401, `unauthorized:${auth.reason ?? "unknown"}`);
  }

  if (!auth.apiKey.scopes.includes("consultations:read")) {
    return errResponse(403, "scope_required", { scope: "consultations:read" });
  }

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 25), 100);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? 0), 0);
  const status = url.searchParams.get("status");
  const externalRef = url.searchParams.get("external_reference");

  const admin = createAdminClient();
  let q = admin
    .from("consultations")
    .select(
      "id, status, created_at, plan_tier, target_value, pdf_url, completed_at, external_reference, category",
      { count: "exact" }
    )
    .eq("company_id", auth.apiKey.company_id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) q = q.eq("status", status);
  if (externalRef) q = q.eq("external_reference", externalRef);

  const { data, count, error } = await q;
  if (error) {
    return errResponse(500, "list_failed");
  }

  await touchApiKey(auth.apiKey.id);

  return NextResponse.json({
    data: (data ?? []).map(serializeConsultation),
    pagination: {
      limit,
      offset,
      total: count ?? 0,
    },
  });
}

// =============================================================================
// Helpers
// =============================================================================
interface ConsultaDb {
  id: string;
  status: string;
  created_at: string;
  plan_tier: string;
  target_value: string;
  pdf_url: string | null;
  completed_at: string | null;
  external_reference?: string | null;
  category?: string;
}

function serializeConsultation(c: ConsultaDb) {
  return {
    id: c.id,
    status: c.status,
    category: c.category,
    plan_id: c.plan_tier,
    target: c.target_value,
    external_reference: c.external_reference ?? null,
    pdf_url: c.pdf_url,
    created_at: c.created_at,
    completed_at: c.completed_at,
  };
}

function errResponse(status: number, code: string, details?: Record<string, unknown>) {
  return NextResponse.json(
    { error: code, ...(details ? { details } : {}) },
    { status }
  );
}

function fireAndForgetProcess(consultaId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) return;
  fetch(`${baseUrl}/functions/v1/process-consultation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ consultationId: consultaId }),
  }).catch((e) => {
    console.error("[api_v1.dispatch] falha disparo:", e);
  });
}
