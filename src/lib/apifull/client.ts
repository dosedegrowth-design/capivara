/**
 * Cliente HTTP da API Full.
 *
 * Padrao APIFULL:
 *   POST https://api.apifull.com.br/api/{path}
 *   Authorization: Bearer {APIFULL_API_KEY}
 *   Body: { ...params, link: "{path}" }
 *
 * Response shape:
 *   { status: "sucesso" | "erro", "API Full": "url", dados: {...}, message?: string }
 *
 * Recursos:
 *  - Retry exponencial em 5xx / 429 / network errors (3 tentativas)
 *  - Timeout 30s padrao
 *  - Logging via console.log (Edge Function captura)
 *  - Tratamento de 404 (placa/cpf sem dado) como sucesso vazio
 */

import { APIFULL_BASE, findEndpoint, type ApiFullEndpoint } from "./mapping";

export interface ApiFullResponse<T = Record<string, unknown>> {
  status: "sucesso" | "erro";
  "API Full"?: string;
  dados?: T;
  message?: string;
}

export interface ApiFullCallOptions {
  /** Timeout em ms. Default 30s. */
  timeoutMs?: number;
  /** Numero de retries em erro transiente. Default 2 (3 tentativas total). */
  maxRetries?: number;
  /** Override do token (default: env). */
  token?: string;
}

export interface ApiFullCallResult<T = Record<string, unknown>> {
  ok: boolean;
  /** Dados retornados (vazio se erro ou nao encontrado). */
  dados?: T;
  /** Status do APIFULL ("sucesso" | "erro" | "not_found" | "rate_limited" | "timeout" | "internal_error"). */
  status: "sucesso" | "erro" | "not_found" | "rate_limited" | "timeout" | "internal_error";
  /** Mensagem de erro (se houver). */
  errorMessage?: string;
  /** Tempo da chamada em ms. */
  durationMs: number;
  /** Endpoint chamado. */
  endpoint: string;
  /** HTTP status code retornado. */
  httpStatus?: number;
}

const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_MAX_RETRIES = 2;

/**
 * Chama um endpoint APIFULL diretamente pelo path.
 *
 * Use `callEndpoint(internal, params)` quando quiser usar o nome interno.
 */
export async function callApiFull<T = Record<string, unknown>>(
  path: string,
  body: Record<string, unknown>,
  opts: ApiFullCallOptions = {}
): Promise<ApiFullCallResult<T>> {
  const token = opts.token ?? process.env.APIFULL_API_KEY;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;
  const maxRetries = opts.maxRetries ?? DEFAULT_MAX_RETRIES;

  if (!token) {
    return {
      ok: false,
      status: "internal_error",
      errorMessage: "APIFULL_API_KEY nao configurado",
      durationMs: 0,
      endpoint: path,
    };
  }

  const url = `${APIFULL_BASE}/${path}`;
  const requestBody = JSON.stringify({ ...body, link: path });
  const startedAt = Date.now();

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const isRetry = attempt > 0;
    if (isRetry) {
      // Exponential backoff: 1s, 3s, 9s
      const delay = Math.pow(3, attempt - 1) * 1000;
      console.log(`[apifull] retry ${attempt}/${maxRetries} em ${delay}ms (${path})`);
      await new Promise((r) => setTimeout(r, delay));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: requestBody,
        signal: controller.signal,
      });
      clearTimeout(timer);

      const durationMs = Date.now() - startedAt;

      // 404 = recurso sem dado (placa/cpf nao encontrado)
      if (response.status === 404) {
        return {
          ok: true,
          status: "not_found",
          dados: undefined,
          durationMs,
          endpoint: path,
          httpStatus: 404,
        };
      }

      // 429 = rate limit, tenta de novo
      if (response.status === 429) {
        if (attempt < maxRetries) continue;
        return {
          ok: false,
          status: "rate_limited",
          errorMessage: "Rate limit APIFULL",
          durationMs,
          endpoint: path,
          httpStatus: 429,
        };
      }

      // 5xx = erro do APIFULL, tenta de novo
      if (response.status >= 500) {
        if (attempt < maxRetries) continue;
        return {
          ok: false,
          status: "internal_error",
          errorMessage: `APIFULL 5xx: ${response.status}`,
          durationMs,
          endpoint: path,
          httpStatus: response.status,
        };
      }

      // 4xx outros = erro de input, nao retry
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        return {
          ok: false,
          status: "erro",
          errorMessage: `APIFULL ${response.status}: ${text.slice(0, 200)}`,
          durationMs,
          endpoint: path,
          httpStatus: response.status,
        };
      }

      // 200 OK
      const json = (await response.json()) as ApiFullResponse<T>;
      if (json.status === "erro") {
        return {
          ok: false,
          status: "erro",
          errorMessage: json.message ?? "APIFULL retornou erro",
          durationMs,
          endpoint: path,
          httpStatus: 200,
        };
      }

      return {
        ok: true,
        status: "sucesso",
        dados: json.dados,
        durationMs,
        endpoint: path,
        httpStatus: 200,
      };
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === "AbortError";

      if (attempt < maxRetries) {
        console.warn(`[apifull] ${path} tentativa ${attempt + 1} falhou:`, err);
        continue;
      }

      return {
        ok: false,
        status: isAbort ? "timeout" : "internal_error",
        errorMessage: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
        endpoint: path,
      };
    }
  }

  // Unreachable, mas TS exige
  return {
    ok: false,
    status: "internal_error",
    errorMessage: "Logica de retry esgotada",
    durationMs: Date.now() - startedAt,
    endpoint: path,
  };
}

/**
 * Chama endpoint pelo nome interno (apisIncluidas).
 * Resolve param automaticamente: placa, cpf, cnpj, nome, documentos.
 */
export async function callEndpoint<T = Record<string, unknown>>(
  internal: string,
  params: {
    placa?: string;
    cpf?: string;
    cnpj?: string;
    nome?: string;
    state?: string;
    documentos?: Partial<Record<"cpf" | "rg" | "telefone" | "placa" | "email" | "tituloEleitor" | "nis" | "pis" | "cns", string>>;
  },
  opts?: ApiFullCallOptions
): Promise<ApiFullCallResult<T> & { endpoint_info?: ApiFullEndpoint }> {
  const ep = findEndpoint(internal);
  if (!ep) {
    return {
      ok: false,
      status: "internal_error",
      errorMessage: `Endpoint interno "${internal}" nao mapeado em APIFULL_ENDPOINTS`,
      durationMs: 0,
      endpoint: internal,
    };
  }

  // Monta body baseado no paramType
  const body: Record<string, unknown> = {};
  switch (ep.paramType) {
    case "placa":
      if (!params.placa) {
        return makeMissingParamError<T>(ep.path, "placa", ep);
      }
      body.placa = params.placa;
      break;
    case "cpf":
      if (!params.cpf) {
        return makeMissingParamError<T>(ep.path, "cpf", ep);
      }
      body.cpf = params.cpf;
      break;
    case "cnpj":
      if (!params.cnpj) {
        return makeMissingParamError<T>(ep.path, "cnpj", ep);
      }
      body.cnpj = params.cnpj;
      break;
    case "nome":
      if (!params.nome) {
        return makeMissingParamError<T>(ep.path, "nome", ep);
      }
      body.name = params.nome;
      if (params.state) body.state = params.state;
      break;
    case "documentos":
      // Pelo menos 1 documento precisa estar preenchido
      if (!params.documentos || Object.keys(params.documentos).length === 0) {
        return makeMissingParamError<T>(ep.path, "documentos", ep);
      }
      Object.assign(body, params.documentos);
      break;
  }

  const result = await callApiFull<T>(ep.path, body, opts);
  return { ...result, endpoint_info: ep };
}

function makeMissingParamError<T>(
  path: string,
  paramName: string,
  ep: ApiFullEndpoint
): ApiFullCallResult<T> & { endpoint_info: ApiFullEndpoint } {
  return {
    ok: false,
    status: "internal_error",
    errorMessage: `Endpoint "${path}" precisa do parametro "${paramName}"`,
    durationMs: 0,
    endpoint: path,
    endpoint_info: ep,
  };
}

/**
 * Helper: ver saldo APIFULL.
 * Util pra monitorar gastos no /admin/financeiro.
 */
export async function getBalance(opts?: ApiFullCallOptions): Promise<{
  ok: boolean;
  balance_brl?: number;
  errorMessage?: string;
}> {
  const token = opts?.token ?? process.env.APIFULL_API_KEY;
  if (!token) {
    return { ok: false, errorMessage: "APIFULL_API_KEY nao configurado" };
  }

  try {
    const response = await fetch(`${APIFULL_BASE}/get-balance`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      return {
        ok: false,
        errorMessage: `APIFULL get-balance ${response.status}`,
      };
    }

    const json = (await response.json()) as { saldo?: number; balance?: number; dados?: { saldo?: number } };
    const saldo = json.saldo ?? json.balance ?? json.dados?.saldo ?? 0;
    return { ok: true, balance_brl: saldo };
  } catch (err) {
    return {
      ok: false,
      errorMessage: err instanceof Error ? err.message : String(err),
    };
  }
}
