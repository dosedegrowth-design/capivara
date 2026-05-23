/**
 * Mapeamento dos nomes internos (apisIncluidas em planos.ts) pros paths
 * reais da API Full. Fonte da verdade: collection Postman de 23/05/2026.
 *
 * Base URL: https://api.apifull.com.br/api/
 * Method: POST
 * Auth: Authorization: Bearer {APIFULL_API_KEY}
 *
 * Cada call recebe body com campo `link` = path do endpoint (redundante,
 * mas obrigatorio pela API).
 */

export const APIFULL_BASE = "https://api.apifull.com.br/api";

/** Tipo do parametro principal de cada API. */
export type ApiParamType = "placa" | "cpf" | "cnpj" | "nome" | "documentos";

export interface ApiFullEndpoint {
  /** Nome interno usado em apisIncluidas[]. */
  internal: string;
  /** Path APIFULL (sem barra inicial). Vai pro body como `link`. */
  path: string;
  /** Nome humano pro PDF/UI. */
  nome: string;
  /** Categoria (pra agrupar no PDF e admin). */
  categoria: "veicular" | "pessoa" | "empresa" | "leilao" | "credito" | "juridico";
  /** Parametro principal que precisa ser enviado. */
  paramType: ApiParamType;
  /** Custo aproximado em centavos (Nivel 1 APIFULL cotado em 23/05/2026). */
  custoCentavos: number;
}

/**
 * Catalogo COMPLETO dos endpoints APIFULL.
 *
 * Quando o user adicionar/remover plano em planos.ts e precisar de uma
 * API nova, adicionar aqui primeiro.
 */
export const APIFULL_ENDPOINTS: ApiFullEndpoint[] = [
  // ============= VEICULAR =============
  {
    internal: "placa-basica",
    path: "placa-basica",
    nome: "Placa Super Basica",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 8,
  },
  {
    internal: "placa-basica-propria",
    path: "agregados-propria",
    nome: "Placa Basica (propria)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 10,
  },
  {
    internal: "fipe",
    path: "fipe",
    nome: "Tabela FIPE",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 11,
  },
  {
    internal: "bin-nacional",
    path: "ic-bin-nacional",
    nome: "BIN Nacional",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 300,
  },
  {
    internal: "bin-estadual",
    path: "ic-bin-estadual",
    nome: "BIN Estadual",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 276,
  },
  {
    internal: "recall",
    path: "ic-recall",
    nome: "Recall pendente",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 360,
  },
  {
    internal: "gravame",
    path: "gravame",
    nome: "Gravame / Alienacao",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 220,
  },
  {
    internal: "proprietario-placa",
    path: "ic-proprietario-atual",
    nome: "Proprietario atual",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 342,
  },
  {
    internal: "historico-roubo-furto",
    path: "ic-historico-roubo-furto",
    nome: "Historico Roubo/Furto",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 360,
  },
  {
    internal: "historico-roubo-furto-premium",
    path: "roubo-furto",
    nome: "Historico Roubo/Furto Premium",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 936,
  },
  {
    internal: "leilao",
    path: "leilao",
    nome: "Historico de Leilao",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 876,
  },
  {
    internal: "foto-leilao",
    path: "ic-foto-leilao",
    nome: "Foto do Leilao",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 1200,
  },
  {
    internal: "certificado-seguranca-veicular",
    path: "csv-renainf-renajud-recall-bin-proprietario",
    nome: "CSV Completo (CSV+RENAJUD+RENAINF+Recall+BIN+Proprietario)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 450,
  },
  {
    internal: "crlv",
    path: "crlv",
    nome: "CRLV digital",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 2028,
  },
  {
    internal: "vip-car",
    path: "ic-vipcar",
    nome: "Vip Car (analise tecnica)",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 3120,
  },

  // ============= PESSOA (CPF) =============
  {
    internal: "cpf-simples",
    path: "pf-dadosbasicos",
    nome: "CPF Simples",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 10,
  },
  {
    internal: "cpf-completo",
    path: "ic-cpf-completo",
    nome: "CPF Completo",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 60,
  },
  {
    internal: "cpf-ultra-completo",
    path: "cpf-ultra",
    nome: "CPF Ultra Completo",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 117,
  },
  {
    internal: "cpf-ultra-socios",
    path: "cpf-ultra",
    nome: "CPF Ultra dos socios",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 117,
  },
  {
    internal: "busca-por-documentos",
    path: "busca-documentos",
    nome: "Busca reversa por documentos",
    categoria: "pessoa",
    paramType: "documentos",
    custoCentavos: 90,
  },

  // ============= EMPRESA (CNPJ) =============
  {
    internal: "cnpj-completo",
    path: "cnpj",
    nome: "CNPJ Completo",
    categoria: "empresa",
    paramType: "cnpj",
    custoCentavos: 6,
  },

  // ============= CREDITO / DIVIDAS =============
  {
    internal: "boa-vista-essencial",
    path: "scpc-boavista",
    nome: "Boa Vista Essencial",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 323,
  },
  {
    internal: "serasa-basico",
    path: "serasa-basica",
    nome: "Serasa Basico",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 540,
  },
  {
    internal: "serasa-premium",
    path: "serasa-premium",
    nome: "Serasa Premium",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 696,
  },
  {
    internal: "spc-brasil",
    path: "spc-brasil",
    nome: "SPC Brasil",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 863,
  },
  {
    internal: "scr-bacen",
    path: "ic-bacen",
    nome: "SCR BACEN",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 936,
  },
  {
    internal: "scr-bacen-socios",
    path: "ic-bacen",
    nome: "SCR BACEN dos socios",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 936,
  },
  {
    internal: "quod",
    path: "ic-quod",
    nome: "QUOD",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 478,
  },
  {
    internal: "cred-completa-plus",
    path: "e-boavista",
    nome: "Cred Completa Plus",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 249,
  },

  // ============= JURIDICO =============
  {
    internal: "cnd-trabalhista",
    path: "ic-cndt",
    nome: "CNDT (Certidao Nacional de Debitos Trabalhistas)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 720,
  },
];

/** Lookup por nome interno (apisIncluidas[]). */
export function findEndpoint(internal: string): ApiFullEndpoint | undefined {
  return APIFULL_ENDPOINTS.find((e) => e.internal === internal);
}

/** Lookup por path APIFULL. */
export function findEndpointByPath(path: string): ApiFullEndpoint | undefined {
  return APIFULL_ENDPOINTS.find((e) => e.path === path);
}

/** Endpoints conhecidos pra um array de nomes internos. */
export function resolveEndpoints(internals: string[]): ApiFullEndpoint[] {
  const resolved: ApiFullEndpoint[] = [];
  const notFound: string[] = [];
  for (const i of internals) {
    const ep = findEndpoint(i);
    if (ep) resolved.push(ep);
    else notFound.push(i);
  }
  if (notFound.length > 0) {
    console.warn("[apifull/mapping] APIs sem mapping APIFULL:", notFound);
  }
  return resolved;
}

/** Soma do custo APIFULL (em centavos) pra um plano. */
export function custoTotalCentavos(internals: string[]): number {
  return resolveEndpoints(internals).reduce((sum, e) => sum + e.custoCentavos, 0);
}
