// VERSAO LOCAL — re-deploy via MCP deploy_edge_function depois de editar.
// =========================================================================
// Capivara · Edge Function process-consultation (v2 — APIFULL real)
//
// Disparada pelo webhook Asaas apos confirmacao de pagamento, ou
// direto pelo painel B2B/avulso quando consulta cria status='paid'.
//
// Fluxo:
//   1. Recebe { consultationId }
//   2. Carrega a consulta no Supabase
//   3. Marca status='processing'
//   4. Identifica APIs do plano: combo (PLANOS_*) ou avulso (PRODUTOS_*_AVULSO)
//   5. Pra cada API: cache hit OU chama APIFULL OU 404 -> consolida em result_jsonb
//   6. Dispara /api/pdf/render (fire-and-forget) que gera PDF + email
//   7. UPDATE consultations(status='completed', result_jsonb, api_total_cost_cents)
//
// Idempotencia: se status != 'paid', retorna 200 sem fazer nada.
// =========================================================================

// @ts-expect-error - deno runtime
import { createClient } from "jsr:@supabase/supabase-js@2";

type ProcessRequest = { consultationId: string };

const APIFULL_BASE = "https://api.apifull.com.br/api";
const APIFULL_TIMEOUT = 30_000;
const APIFULL_MAX_RETRIES = 2;

// =========================================================================
// MAPPING APIFULL — espelha src/lib/apifull/mapping.ts
// (Inline pq Edge Function nao tem acesso ao bundle Next)
// =========================================================================

interface ApiFullEndpoint {
  internal: string;
  path: string;
  nome: string;
  categoria: string;
  paramType: "placa" | "cpf" | "cnpj";
  custoCentavos: number;
  /** TTL do cache (horas). Sincronizado com src/lib/apifull/mapping.ts. */
  cacheTTLHours: number;
}

const APIFULL_ENDPOINTS: ApiFullEndpoint[] = [
  // Veicular
  { internal: "placa-basica", path: "placa-basica", nome: "Placa Super Basica", categoria: "veicular", paramType: "placa", custoCentavos: 8, cacheTTLHours: 168 },
  { internal: "placa-basica-propria", path: "agregados-propria", nome: "Placa Basica (propria)", categoria: "veicular", paramType: "placa", custoCentavos: 10, cacheTTLHours: 168 },
  { internal: "fipe", path: "fipe", nome: "Tabela FIPE", categoria: "veicular", paramType: "placa", custoCentavos: 11, cacheTTLHours: 720 },
  { internal: "bin-nacional", path: "ic-bin-nacional", nome: "BIN Nacional", categoria: "veicular", paramType: "placa", custoCentavos: 300, cacheTTLHours: 168 },
  { internal: "bin-estadual", path: "ic-bin-estadual", nome: "BIN Estadual", categoria: "veicular", paramType: "placa", custoCentavos: 276, cacheTTLHours: 168 },
  { internal: "recall", path: "ic-recall", nome: "Recall pendente", categoria: "veicular", paramType: "placa", custoCentavos: 360, cacheTTLHours: 24 },
  { internal: "gravame", path: "gravame", nome: "Gravame / Alienacao", categoria: "veicular", paramType: "placa", custoCentavos: 220, cacheTTLHours: 6 },
  { internal: "proprietario-placa", path: "ic-proprietario-atual", nome: "Proprietario atual", categoria: "veicular", paramType: "placa", custoCentavos: 342, cacheTTLHours: 6 },
  { internal: "historico-roubo-furto", path: "ic-historico-roubo-furto", nome: "Historico Roubo/Furto", categoria: "veicular", paramType: "placa", custoCentavos: 360, cacheTTLHours: 24 },
  { internal: "historico-roubo-furto-premium", path: "roubo-furto", nome: "Historico Roubo/Furto Premium", categoria: "leilao", paramType: "placa", custoCentavos: 936, cacheTTLHours: 24 },
  { internal: "leilao", path: "leilao", nome: "Historico de Leilao", categoria: "leilao", paramType: "placa", custoCentavos: 876, cacheTTLHours: 24 },
  { internal: "foto-leilao", path: "ic-foto-leilao", nome: "Foto do Leilao", categoria: "leilao", paramType: "placa", custoCentavos: 1200, cacheTTLHours: 720 },
  { internal: "certificado-seguranca-veicular", path: "csv-renainf-renajud-recall-bin-proprietario", nome: "CSV Completo", categoria: "veicular", paramType: "placa", custoCentavos: 450, cacheTTLHours: 12 },
  { internal: "crlv", path: "crlv", nome: "CRLV digital", categoria: "veicular", paramType: "placa", custoCentavos: 2028, cacheTTLHours: 168 },
  { internal: "vip-car", path: "ic-vipcar", nome: "Vip Car (analise tecnica)", categoria: "leilao", paramType: "placa", custoCentavos: 3120, cacheTTLHours: 24 },
  // Pessoa
  { internal: "cpf-simples", path: "pf-dadosbasicos", nome: "CPF Simples", categoria: "pessoa", paramType: "cpf", custoCentavos: 10, cacheTTLHours: 168 },
  { internal: "cpf-completo", path: "ic-cpf-completo", nome: "CPF Completo", categoria: "pessoa", paramType: "cpf", custoCentavos: 60, cacheTTLHours: 168 },
  { internal: "cpf-ultra-completo", path: "cpf-ultra", nome: "CPF Ultra Completo", categoria: "pessoa", paramType: "cpf", custoCentavos: 117, cacheTTLHours: 168 },
  { internal: "cpf-ultra-socios", path: "cpf-ultra", nome: "CPF Ultra dos socios", categoria: "pessoa", paramType: "cpf", custoCentavos: 117, cacheTTLHours: 168 },
  // Empresa
  { internal: "cnpj-completo", path: "cnpj", nome: "CNPJ Completo", categoria: "empresa", paramType: "cnpj", custoCentavos: 6, cacheTTLHours: 168 },
  // Credito (score muda → TTL curto)
  { internal: "boa-vista-essencial", path: "scpc-boavista", nome: "Boa Vista Essencial", categoria: "credito", paramType: "cpf", custoCentavos: 323, cacheTTLHours: 4 },
  { internal: "serasa-basico", path: "serasa-basica", nome: "Serasa Basico", categoria: "credito", paramType: "cpf", custoCentavos: 540, cacheTTLHours: 4 },
  { internal: "serasa-premium", path: "serasa-premium", nome: "Serasa Premium", categoria: "credito", paramType: "cpf", custoCentavos: 696, cacheTTLHours: 4 },
  { internal: "spc-brasil", path: "spc-brasil", nome: "SPC Brasil", categoria: "credito", paramType: "cpf", custoCentavos: 863, cacheTTLHours: 4 },
  { internal: "scr-bacen", path: "ic-bacen", nome: "SCR BACEN", categoria: "credito", paramType: "cpf", custoCentavos: 936, cacheTTLHours: 4 },
  { internal: "scr-bacen-socios", path: "ic-bacen", nome: "SCR BACEN dos socios", categoria: "credito", paramType: "cpf", custoCentavos: 936, cacheTTLHours: 4 },
  { internal: "quod", path: "ic-quod", nome: "QUOD", categoria: "credito", paramType: "cpf", custoCentavos: 478, cacheTTLHours: 4 },
  { internal: "cred-completa-plus", path: "e-boavista", nome: "Cred Completa Plus", categoria: "credito", paramType: "cpf", custoCentavos: 249, cacheTTLHours: 4 },
  // Juridico
  { internal: "cnd-trabalhista", path: "ic-cndt", nome: "CNDT", categoria: "juridico", paramType: "cpf", custoCentavos: 720, cacheTTLHours: 24 },
];

function findEndpoint(internal: string): ApiFullEndpoint | undefined {
  return APIFULL_ENDPOINTS.find((e) => e.internal === internal);
}

// =========================================================================
// APIFULL HTTP CLIENT
// =========================================================================

interface ApiFullCallResult {
  ok: boolean;
  status: "sucesso" | "erro" | "not_found" | "rate_limited" | "timeout" | "internal_error";
  dados?: Record<string, unknown>;
  errorMessage?: string;
  durationMs: number;
  httpStatus?: number;
}

async function callApiFull(
  ep: ApiFullEndpoint,
  target: string,
  token: string
): Promise<ApiFullCallResult> {
  const url = `${APIFULL_BASE}/${ep.path}`;
  const body: Record<string, unknown> = { link: ep.path };

  switch (ep.paramType) {
    case "placa": body.placa = target; break;
    case "cpf": body.cpf = target; break;
    case "cnpj": body.cnpj = target; break;
  }

  const startedAt = Date.now();

  for (let attempt = 0; attempt <= APIFULL_MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = Math.pow(3, attempt - 1) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), APIFULL_TIMEOUT);

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const durationMs = Date.now() - startedAt;

      if (resp.status === 404) {
        return { ok: true, status: "not_found", dados: undefined, durationMs, httpStatus: 404 };
      }
      if (resp.status === 429) {
        if (attempt < APIFULL_MAX_RETRIES) continue;
        return { ok: false, status: "rate_limited", errorMessage: "Rate limit", durationMs, httpStatus: 429 };
      }
      if (resp.status >= 500) {
        if (attempt < APIFULL_MAX_RETRIES) continue;
        return { ok: false, status: "internal_error", errorMessage: `5xx ${resp.status}`, durationMs, httpStatus: resp.status };
      }
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        return { ok: false, status: "erro", errorMessage: `${resp.status}: ${text.slice(0, 200)}`, durationMs, httpStatus: resp.status };
      }

      const json = await resp.json() as { status?: string; dados?: Record<string, unknown>; message?: string };
      if (json.status === "erro") {
        return { ok: false, status: "erro", errorMessage: json.message ?? "APIFULL erro", durationMs, httpStatus: 200 };
      }
      return { ok: true, status: "sucesso", dados: json.dados, durationMs, httpStatus: 200 };
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === "AbortError";
      if (attempt < APIFULL_MAX_RETRIES) {
        console.warn(`[apifull] ${ep.path} tentativa ${attempt + 1} falhou:`, err);
        continue;
      }
      return {
        ok: false,
        status: isAbort ? "timeout" : "internal_error",
        errorMessage: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
      };
    }
  }

  return { ok: false, status: "internal_error", errorMessage: "retry esgotado", durationMs: Date.now() - startedAt };
}

// =========================================================================
// MAIN
// =========================================================================

// @ts-expect-error - deno global
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = (await req.json().catch(() => null)) as ProcessRequest | null;
  if (!body?.consultationId) {
    return resp(400, { error: "consultationId obrigatorio" });
  }

  // @ts-expect-error - deno
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  // @ts-expect-error - deno
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  // @ts-expect-error - deno
  const apifullToken = Deno.env.get("APIFULL_API_KEY");

  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: "capivara" },
    auth: { persistSession: false },
  });

  // ---- 1. Carregar consulta ----
  const { data: consulta, error: loadErr } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", body.consultationId)
    .maybeSingle();

  if (loadErr || !consulta) {
    return resp(404, { error: "Consulta nao encontrada" });
  }

  if (consulta.status !== "paid") {
    return resp(200, { ok: true, message: "Consulta nao esta paga, ignorando." });
  }

  // ---- 2. Marca processing ----
  await supabase
    .from("consultations")
    .update({
      status: "processing",
      processing_started_at: new Date().toISOString(),
    })
    .eq("id", consulta.id);

  // ---- 3. Resolve APIs do plan_tier ----
  // Plan tier pode ser:
  //   - Combo: "cpf-investigacao", "veicular-avancado", "leilao-pre-lance" etc
  //   - Avulso: "veicular-avulso-fipe", "leilao-avulso-historico" etc
  //
  // O plano vem com `apisIncluidas[]`. A Edge Function NAO tem acesso ao
  // bundle Next, entao recebe esse array via custom_attributes (na hora
  // de criar a consulta) OU calcula localmente baseado em mapeamento basico.
  //
  // Pra evitar duplicar todos os planos aqui, vamos LER o que ja foi salvo
  // em consultations.api_calls_log (campo onde o frontend ja escreve as APIs
  // necessarias). Se nao tiver, usa fallback que tenta deduzir do plan_tier.

  const apis = extractApis(consulta);
  if (apis.length === 0) {
    console.warn(`[process-consultation] consulta ${consulta.id} sem APIs definidas, marcando completed sem dados`);
    await supabase
      .from("consultations")
      .update({
        status: "completed",
        result_jsonb: { _empty: true, message: "Plano sem APIs mapeadas" },
        completed_at: new Date().toISOString(),
      })
      .eq("id", consulta.id);
    return resp(200, { ok: true, message: "Plano sem APIs" });
  }

  if (!apifullToken) {
    console.error("[process-consultation] APIFULL_API_KEY nao configurada");
    await supabase
      .from("consultations")
      .update({
        status: "error",
        result_jsonb: { _error: "APIFULL_API_KEY ausente" },
      })
      .eq("id", consulta.id);
    return resp(500, { error: "APIFULL_API_KEY nao configurada" });
  }

  // ---- 4. Orquestra chamadas APIFULL com cache ----
  const target = consulta.target_normalized as string;
  const targetHash = consulta.target_hash as string;

  const callResults = await Promise.all(
    apis.map(async (internal) => {
      const ep = findEndpoint(internal);
      if (!ep) {
        return {
          internal,
          path: internal,
          nome: internal,
          categoria: "desconhecido",
          status: "internal_error" as const,
          errorMessage: `Endpoint "${internal}" nao mapeado`,
          dados: undefined,
          costCents: 0,
          durationMs: 0,
        };
      }

      const cacheKey = `${ep.path}:${targetHash}`;

      // Tenta cache
      const { data: cached } = await supabase
        .from("api_cache")
        .select("result_jsonb, cost_cents")
        .eq("cache_key", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cached) {
        await supabase
          .from("api_cache")
          .update({ hits: (cached as { hits?: number }).hits ?? 0 + 1 })
          .eq("cache_key", cacheKey);

        return {
          internal,
          path: ep.path,
          nome: ep.nome,
          categoria: ep.categoria,
          status: "cached" as const,
          dados: (cached as { result_jsonb?: Record<string, unknown> }).result_jsonb,
          costCents: 0,
          durationMs: 0,
        };
      }

      // Cache miss — chama APIFULL
      const apiResult = await callApiFull(ep, target, apifullToken);

      // Salva cache se sucesso ou not_found
      if (apiResult.ok && (apiResult.status === "sucesso" || apiResult.status === "not_found")) {
        // TTL especifico por endpoint — dado volatil (gravame, credito)
        // expira rapido; dado estavel (FIPE, BIN) vive ate 30 dias.
        const expiresAt = new Date(Date.now() + ep.cacheTTLHours * 60 * 60 * 1000).toISOString();
        await supabase
          .from("api_cache")
          .upsert({
            cache_key: cacheKey,
            api_name: ep.path,
            target_hash: targetHash,
            result_jsonb: apiResult.dados ?? { _not_found: true },
            cost_cents: ep.custoCentavos,
            hits: 1,
            expires_at: expiresAt,
          });
      }

      return {
        internal,
        path: ep.path,
        nome: ep.nome,
        categoria: ep.categoria,
        status: apiResult.status,
        dados: apiResult.dados,
        costCents: apiResult.ok && apiResult.status === "sucesso" ? ep.custoCentavos : 0,
        durationMs: apiResult.durationMs,
        errorMessage: apiResult.errorMessage,
      };
    })
  );

  // ---- 5. Consolida result_jsonb ----
  const sections: Record<string, unknown> = {};
  const callsLog: unknown[] = [];
  let custoTotal = 0;
  let successCount = 0;
  const apisQueFalharam: string[] = [];

  for (const r of callResults) {
    sections[r.internal] = {
      nome: r.nome,
      categoria: r.categoria,
      status: r.status,
      dados: r.dados ?? null,
      error: r.errorMessage,
    };
    callsLog.push({
      api: r.path,
      status: r.status,
      cost_cents: r.costCents,
      duration_ms: r.durationMs,
      error: r.errorMessage,
    });
    custoTotal += r.costCents;

    // Sucesso util = veio dado de resposta (cached ou fresh).
    // not_found NAO conta como sucesso (placa nao existe na base).
    if (r.status === "sucesso" || r.status === "cached") {
      successCount++;
    } else {
      apisQueFalharam.push(r.path);
    }
  }

  const totalApis = callResults.length;
  // Falha total = 0 sucessos. Pode ser por API down, rate limit, ou
  // simplesmente porque o alvo nao tem registro em nenhuma das bases.
  // Em ambos os casos, o cliente nao teve valor entregue -> refund.
  const refundElegivel = totalApis > 0 && successCount === 0;

  const resultJsonb = {
    _generated_at: new Date().toISOString(),
    category: consulta.category,
    plan_tier: consulta.plan_tier,
    target: target,
    sections,
    ...(refundElegivel
      ? { _empty_result: true, _failed_apis: apisQueFalharam }
      : {}),
  };

  // ---- 6. UPDATE consulta ----
  // Mesmo quando refundElegivel: marca completed (refund cuidara do status final).
  const { error: updateErr } = await supabase
    .from("consultations")
    .update({
      status: "completed",
      result_jsonb: resultJsonb,
      api_calls_log: callsLog,
      api_total_cost_cents: custoTotal,
      completed_at: new Date().toISOString(),
    })
    .eq("id", consulta.id);

  if (updateErr) {
    console.error("[process-consultation] update falhou:", updateErr);
    return resp(500, { error: "Falha ao salvar resultado" });
  }

  // @ts-expect-error - deno
  const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://suacapivara.com.br";

  // ---- 7a. Refund automatico quando nenhuma API trouxe dado ----
  if (refundElegivel) {
    console.warn(
      `[process-consultation] consulta ${consulta.id} sem dados — disparando refund automatico`
    );
    // Fire-and-forget. O route /api/consultations/refund cuida de:
    //  - dispatch webhook consultation.failed
    //  - refund Asaas OU re-credit balance_cents
    //  - dispatch webhook consultation.refunded
    //  - mudar status pra 'refunded'
    fetch(`${siteUrl}/api/consultations/refund`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-key": serviceKey,
      },
      body: JSON.stringify({
        consultationId: consulta.id,
        reason: "no_data_found",
        failedApis: apisQueFalharam,
      }),
    }).catch((e: unknown) => {
      console.error("[process-consultation] refund auto falhou:", e);
    });

    return resp(200, {
      ok: true,
      consultationId: consulta.id,
      refund_triggered: true,
      reason: "no_data_found",
      failed_apis: apisQueFalharam,
    });
  }

  // ---- 7b. Sucesso parcial ou total: dispara render PDF (fire-and-forget) ----
  fetch(`${siteUrl}/api/pdf/render`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-key": serviceKey,
    },
    body: JSON.stringify({ consultationId: consulta.id }),
  }).catch((e: unknown) => {
    console.error("[process-consultation] dispatch PDF falhou:", e);
  });

  return resp(200, {
    ok: true,
    consultationId: consulta.id,
    apis_chamadas: apis.length,
    success_count: successCount,
    cache_hits: callResults.filter((r) => r.status === "cached").length,
    falhas: apisQueFalharam.length,
    custo_cents: custoTotal,
    duration_ms: Math.max(...callResults.map((r) => r.durationMs)),
  });
});

// =========================================================================
// Helpers
// =========================================================================

interface ConsultaRow {
  plan_tier: string;
  category: string;
  api_calls_log?: unknown[] | null;
  [key: string]: unknown;
}

/**
 * Extrai a lista de APIs a chamar.
 *
 * Source da verdade: `consulta.api_calls_log` (preenchido pelo frontend
 * antes da consulta entrar em paid). Se vazio, fallback no plan_tier.
 */
function extractApis(consulta: ConsultaRow): string[] {
  // Pode vir como ["fipe", "recall", ...] ou objeto com chave .pending
  if (Array.isArray(consulta.api_calls_log) && consulta.api_calls_log.length > 0) {
    const first = consulta.api_calls_log[0];
    if (typeof first === "string") {
      return consulta.api_calls_log as string[];
    }
  }

  // Fallback estatico baseado no plan_tier (espelha planos.ts apisIncluidas)
  return PLAN_API_MAP[consulta.plan_tier] ?? [];
}

const PLAN_API_MAP: Record<string, string[]> = {
  // CPF
  "cpf-espiadinha": ["cpf-simples"],
  "cpf-investigacao": ["cpf-completo", "boa-vista-essencial"],
  "cpf-avancada": ["cpf-ultra-completo", "boa-vista-essencial", "serasa-basico", "cred-completa-plus"],
  "cpf-premium": ["cpf-ultra-completo", "boa-vista-essencial", "serasa-premium", "cred-completa-plus", "cnd-trabalhista", "quod"],
  "cpf-raio-x": ["cpf-ultra-completo", "boa-vista-essencial", "serasa-premium", "spc-brasil", "scr-bacen", "cred-completa-plus", "cnd-trabalhista", "quod"],
  // CNPJ
  "cnpj-espiadinha": ["cnpj-completo"],
  "cnpj-socios": ["cnpj-completo", "cpf-ultra-socios", "cnd-trabalhista", "boa-vista-essencial"],
  "cnpj-premium": ["cnpj-completo", "cpf-ultra-socios", "cnd-trabalhista", "cred-completa-plus", "serasa-premium", "boa-vista-essencial"],
  "cnpj-total": ["cnpj-completo", "cpf-ultra-socios", "cnd-trabalhista", "cred-completa-plus", "serasa-premium", "spc-brasil", "scr-bacen-socios", "boa-vista-essencial"],
  // Veicular combos
  "veicular-espiadinha": ["placa-basica", "fipe"],
  "veicular-completo": ["placa-basica", "fipe", "bin-nacional", "recall"],
  "veicular-avancado": ["placa-basica", "fipe", "bin-nacional", "bin-estadual", "proprietario-placa", "gravame", "recall", "historico-roubo-furto"],
  "veicular-premium": ["placa-basica", "fipe", "bin-nacional", "bin-estadual", "proprietario-placa", "gravame", "recall", "historico-roubo-furto", "leilao", "certificado-seguranca-veicular"],
  "veicular-total": ["placa-basica", "fipe", "bin-nacional", "bin-estadual", "proprietario-placa", "gravame", "recall", "historico-roubo-furto", "leilao", "certificado-seguranca-veicular", "vip-car", "crlv", "foto-leilao"],
  // Leilao combos
  "leilao-pre-lance": ["placa-basica", "fipe", "leilao", "foto-leilao", "historico-roubo-furto"],
  "leilao-pos-compra": ["placa-basica", "certificado-seguranca-veicular", "crlv", "gravame"],
  "leilao-auctioneer": ["placa-basica", "fipe", "leilao", "foto-leilao", "historico-roubo-furto-premium", "certificado-seguranca-veicular", "crlv", "gravame", "vip-car"],
  // Avulsos veicular
  "veicular-avulso-fipe": ["fipe", "placa-basica"],
  "veicular-avulso-recall": ["recall", "placa-basica"],
  "veicular-avulso-bin-nacional": ["bin-nacional", "placa-basica"],
  "veicular-avulso-gravame": ["gravame", "placa-basica"],
  "veicular-avulso-bin-estadual": ["bin-estadual", "placa-basica"],
  "veicular-avulso-roubo-furto-basico": ["historico-roubo-furto", "placa-basica"],
  "veicular-avulso-proprietario": ["proprietario-placa", "placa-basica"],
  "veicular-avulso-csv": ["certificado-seguranca-veicular", "placa-basica"],
  "veicular-avulso-crlv": ["crlv", "placa-basica"],
  // Avulsos leilao
  "leilao-avulso-historico": ["leilao", "placa-basica"],
  "leilao-avulso-foto": ["foto-leilao", "placa-basica"],
  "leilao-avulso-roubo-premium": ["historico-roubo-furto-premium", "placa-basica"],
  "leilao-avulso-vip-car": ["vip-car", "placa-basica"],
};

function resp(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
