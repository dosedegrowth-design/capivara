/**
 * Orquestrador: dado uma consulta + lista de APIs, chama todas em paralelo
 * (com cache via tabela `capivara.api_cache`) e consolida o resultado.
 *
 * Usado por:
 *  - Edge Function `process-consultation` (Deno runtime, usa SUPABASE_URL/SERVICE_KEY)
 *  - Eventualmente por scripts locais de teste
 *
 * NAO usa AT no nivel de session — sempre service_role.
 */

import { callEndpoint, type ApiFullCallResult } from "./client";
import { resolveEndpoints, type ApiFullEndpoint } from "./mapping";

export type CategoriaTarget = "cpf" | "cnpj" | "veicular";

export interface OrchestrateParams {
  /** Categoria da consulta (define como interpretar o target). */
  category: CategoriaTarget;
  /** Valor do target ja normalizado (placa, cpf so digitos, cnpj so digitos). */
  target: string;
  /** Lista de APIs internas a chamar (PLANO.apisIncluidas). */
  apis: string[];
  /**
   * Funcoes de cache injetadas. Permite uso em ambientes diferentes
   * (Edge Function Deno vs Node).
   */
  cache: {
    /** Busca entrada do cache. Retorna undefined se nao tem ou expirou. */
    get: (cacheKey: string) => Promise<Record<string, unknown> | undefined>;
    /** Salva entrada no cache. */
    set: (
      cacheKey: string,
      apiName: string,
      targetHash: string,
      result: Record<string, unknown>,
      costCents: number
    ) => Promise<void>;
  };
  /** Target hash (sha256 de plano_id + target_normalized). */
  targetHash: string;
}

export interface OrchestrateResult {
  /** Mapa de internal_name -> resultado da chamada. */
  results: Record<string, ApiCallResult>;
  /** Soma do custo APIFULL em centavos (so chamadas reais, sem cache). */
  custoTotalCentavos: number;
  /** APIs que foram cache hit. */
  cacheHits: string[];
  /** APIs que falharam. */
  failures: Array<{ internal: string; reason: string }>;
  /** Duracao total em ms. */
  totalDurationMs: number;
}

export interface ApiCallResult {
  internal: string;
  path: string;
  nome: string;
  categoria: string;
  status: ApiFullCallResult["status"] | "cached";
  /** Dados retornados (do APIFULL ou do cache). */
  dados?: Record<string, unknown>;
  /** Custo cobrado (centavos). 0 se cache hit. */
  costCents: number;
  durationMs: number;
  errorMessage?: string;
}

/**
 * Orquestra a chamada de todas as APIs de um plano.
 *
 * Estrategia:
 *  1. Resolve endpoints (mapping)
 *  2. Pra cada endpoint: gera cache_key = `${api_path}:${target_hash}`
 *  3. Promise.all com cache check -> APIFULL -> cache write
 *  4. Retorna resultado consolidado
 */
export async function orchestrate(
  params: OrchestrateParams
): Promise<OrchestrateResult> {
  const startedAt = Date.now();
  const endpoints = resolveEndpoints(params.apis);

  const results = await Promise.all(
    endpoints.map(async (ep) => processarEndpoint(ep, params))
  );

  // Consolida
  const resultsMap: Record<string, ApiCallResult> = {};
  const cacheHits: string[] = [];
  const failures: Array<{ internal: string; reason: string }> = [];
  let custoTotal = 0;

  for (const r of results) {
    resultsMap[r.internal] = r;
    if (r.status === "cached") cacheHits.push(r.internal);
    if (r.status !== "cached" && r.status !== "sucesso" && r.status !== "not_found") {
      failures.push({ internal: r.internal, reason: r.errorMessage ?? r.status });
    }
    custoTotal += r.costCents;
  }

  return {
    results: resultsMap,
    custoTotalCentavos: custoTotal,
    cacheHits,
    failures,
    totalDurationMs: Date.now() - startedAt,
  };
}

async function processarEndpoint(
  ep: ApiFullEndpoint,
  params: OrchestrateParams
): Promise<ApiCallResult> {
  const cacheKey = `${ep.path}:${params.targetHash}`;
  const startedAt = Date.now();

  // 1. Tenta cache
  try {
    const cached = await params.cache.get(cacheKey);
    if (cached) {
      return {
        internal: ep.internal,
        path: ep.path,
        nome: ep.nome,
        categoria: ep.categoria,
        status: "cached",
        dados: cached,
        costCents: 0,
        durationMs: Date.now() - startedAt,
      };
    }
  } catch (err) {
    // Cache erro nao quebra fluxo
    console.warn(`[orchestrator] cache miss erro ${cacheKey}:`, err);
  }

  // 2. Monta params da chamada baseado na categoria
  const callParams: Parameters<typeof callEndpoint>[1] = {};
  if (params.category === "veicular") {
    callParams.placa = params.target;
  } else if (params.category === "cpf") {
    callParams.cpf = params.target;
  } else if (params.category === "cnpj") {
    callParams.cnpj = params.target;
  }

  // 3. Chama APIFULL
  const result = await callEndpoint(ep.internal, callParams);

  // 4. Se sucesso, salva no cache
  if (result.ok && (result.status === "sucesso" || result.status === "not_found") && result.dados) {
    try {
      await params.cache.set(
        cacheKey,
        ep.path,
        params.targetHash,
        result.dados,
        ep.custoCentavos
      );
    } catch (err) {
      console.warn(`[orchestrator] cache set falhou ${cacheKey}:`, err);
    }
  }

  return {
    internal: ep.internal,
    path: ep.path,
    nome: ep.nome,
    categoria: ep.categoria,
    status: result.status,
    dados: result.dados as Record<string, unknown> | undefined,
    costCents: result.ok && result.status === "sucesso" ? ep.custoCentavos : 0,
    durationMs: result.durationMs,
    errorMessage: result.errorMessage,
  };
}
