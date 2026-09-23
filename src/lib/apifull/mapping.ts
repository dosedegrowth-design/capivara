/**
 * Mapeamento dos nomes internos (apisIncluidas em planos.ts) pros paths
 * reais da API Full.
 *
 * Fonte da verdade: **https://doc.apifull.com.br/** (contrato OpenAPI em
 * /openapi.json). A APIFULL atualiza a doc a cada lancamento — conferir
 * ANTES de adicionar produto novo.
 *
 * Custos: tabela Nivel 1 de 22/09/2026 (conta Capivara = **Nivel 1**).
 * Reajuste de ~10% vs a cotacao anterior (23/05/2026).
 *
 * Base URL: https://api.apifull.com.br/api/
 * Method: POST
 * Auth: Authorization: Bearer {APIFULL_API_KEY}
 *
 * Cada call recebe body com campo `link` = path do endpoint (redundante,
 * mas obrigatorio pela API).
 *
 * IMPORTANTE — 3 paths trocados em 22/09/2026 apos auditoria do OpenAPI
 * (mesmo dado, custo menor). Ver docs/CATALOGO_EXPANSAO_2026-09.md secao 1.
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
  /** Custo em centavos (tabela Nivel 1 APIFULL, 22/09/2026). */
  custoCentavos: number;
  /**
   * TTL do cache (horas). Define quanto tempo o resultado vive em
   * `api_cache.expires_at` antes de revalidar. Calibrado por
   * volatilidade do dado:
   *  - estavel (FIPE, BIN, CRLV, CPF/CNPJ basicos): 168-720h
   *  - voltatil (proprietario, gravame): 6h
   *  - credito (score muda): 4h
   *  - default seguro: 24h
   */
  cacheTTLHours: number;
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
    custoCentavos: 9,
    cacheTTLHours: 168, // 7d — dados de identificacao estaveis
  },
  {
    internal: "placa-basica-propria",
    path: "agregados-propria",
    nome: "Placa Basica (propria)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 11,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "fipe",
    path: "fipe",
    nome: "Tabela FIPE",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 12,
    cacheTTLHours: 720, // 30d — tabela FIPE atualiza mensalmente
  },
  {
    internal: "bin-nacional",
    path: "ic-bin-nacional",
    nome: "BIN Nacional",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 330,
    cacheTTLHours: 168, // 7d — dados estaveis
  },
  {
    internal: "bin-estadual",
    path: "ic-bin-estadual",
    nome: "BIN Estadual",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 304,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "recall",
    path: "ic-recall",
    nome: "Recall pendente",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 396,
    cacheTTLHours: 24, // 1d — pode aparecer recall novo
  },
  {
    internal: "gravame",
    path: "gravame",
    nome: "Gravame / Alienacao",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 242,
    cacheTTLHours: 6, // 6h — pode mudar rapido (quitacao, novo financiamento)
  },
  {
    internal: "proprietario-placa",
    path: "ic-proprietario-atual",
    nome: "Proprietario atual",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 376,
    cacheTTLHours: 6, // 6h — pode mudar via transferencia
  },
  {
    internal: "historico-roubo-furto",
    path: "roubo-furto",
    nome: "Historico Roubo/Furto",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 396,
    cacheTTLHours: 24, // 1d
  },
  {
    internal: "leilao",
    path: "leilao",
    nome: "Historico de Leilao",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 964,
    cacheTTLHours: 24, // 1d
  },
  {
    internal: "foto-leilao",
    path: "ic-foto-leilao",
    nome: "Foto do Leilao",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 1320,
    cacheTTLHours: 720, // 30d — imagens nao mudam
  },
  {
    internal: "certificado-seguranca-veicular",
    path: "csv-renainf-renajud-recall-bin-proprietario",
    nome: "CSV Completo (CSV+RENAJUD+RENAINF+Recall+BIN+Proprietario)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 495,
    cacheTTLHours: 12, // 12h — combina multas que mudam rapido
  },
  {
    internal: "crlv",
    path: "crlv",
    nome: "CRLV digital",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 2231,
    cacheTTLHours: 168, // 7d — CRLV digital anual
  },
  {
    internal: "vip-car",
    path: "ic-vipcar",
    nome: "Vip Car (analise tecnica)",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 3432,
    cacheTTLHours: 24, // 1d
  },

  {
    internal: "veiculo-debitos",
    path: "veiculo-dados-debitos",
    nome: "Multas e Debitos do Veiculo",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 297,
    cacheTTLHours: 12, // 12h — debito muda rapido (pagamento, autuacao nova)
  },
  {
    internal: "renainf",
    path: "renainf",
    nome: "RENAINF (infracoes nacionais)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 396,
    cacheTTLHours: 12, // 12h
  },
  {
    internal: "renajud",
    path: "renajud",
    nome: "RENAJUD (restricoes judiciais)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 396,
    cacheTTLHours: 24, // 1d — restricao judicial muda devagar
  },
  {
    internal: "atpv-e",
    path: "atpv-e",
    nome: "ATPV-e (2a via)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 240,
    cacheTTLHours: 168, // 7d — documento emitido
  },
  {
    internal: "placa-radar",
    path: "placa-radar",
    nome: "Placa Radar (passagens)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 83,
    cacheTTLHours: 24, // 1d
  },

  // ============= PESSOA (CPF) =============
  {
    internal: "cpf-simples",
    path: "pf-dadosbasicos",
    nome: "CPF Simples",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 11,
    cacheTTLHours: 168, // 7d — dados cadastrais
  },
  {
    internal: "cpf-completo",
    path: "ic-cpf-completo",
    nome: "CPF Completo",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 66,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "cpf-ultra-completo",
    path: "cpf-ultra",
    nome: "CPF Ultra Completo",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 292,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "cpf-ultra-socios",
    path: "cpf-ultra",
    nome: "CPF Ultra dos socios",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 292,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "busca-por-documentos",
    path: "busca-documentos",
    nome: "Busca reversa por documentos",
    categoria: "pessoa",
    paramType: "documentos",
    custoCentavos: 90,
    cacheTTLHours: 168, // 7d
  },

  {
    internal: "processos-judiciais-pf",
    path: "pf-processos-judiciais",
    nome: "Processos Judiciais (PF)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 31,
    cacheTTLHours: 24,
  },
  {
    internal: "antecedentes-criminais",
    path: "cert-pf-antecedentes-criminais",
    nome: "Certidao de Antecedentes Criminais",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta
  },
  {
    internal: "darkweb-pf",
    path: "pf-darkweb",
    nome: "Exposicao na Dark Web",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 168,
  },
  {
    internal: "dados-financeiros-pf",
    path: "pf-dados-financeiros",
    nome: "Renda e Patrimonio estimados",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 141,
    cacheTTLHours: 168,
  },
  {
    internal: "pessoas-relacionadas",
    path: "pf-pessoas-relacionadas",
    nome: "Vinculos e Parentes",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 22,
    cacheTTLHours: 168,
  },
  {
    internal: "dados-profissionais",
    path: "pf-dados-profissionais",
    nome: "Vida Profissional",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 44,
    cacheTTLHours: 168,
  },
  {
    internal: "cnh",
    path: "pf-cnh-v2",
    nome: "Carteira Nacional de Habilitacao",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 267,
    cacheTTLHours: 168,
  },
  {
    internal: "veiculos-por-cpf",
    path: "pf-veiculos",
    nome: "Veiculos no CPF",
    categoria: "veicular",
    paramType: "cpf",
    custoCentavos: 528,
    cacheTTLHours: 168,
  },
  {
    internal: "imoveis",
    path: "consulta-imoveis",
    nome: "Imoveis (capitais)",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 770,
    cacheTTLHours: 720, // 30d — registro de imovel muda devagar
  },

  // ============= EMPRESA (CNPJ) =============
  {
    internal: "cnpj-completo",
    path: "cnpj",
    nome: "CNPJ Completo",
    categoria: "empresa",
    paramType: "cnpj",
    custoCentavos: 7,
    cacheTTLHours: 168, // 7d — dados cadastrais
  },

  {
    internal: "processos-judiciais-pj",
    path: "pj-processos-judiciais",
    nome: "Processos Judiciais (PJ)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 31,
    cacheTTLHours: 24,
  },
  {
    internal: "quadro-societario",
    path: "pj-quadro-societario",
    nome: "Quadro Societario",
    categoria: "empresa",
    paramType: "cnpj",
    custoCentavos: 31,
    cacheTTLHours: 168,
  },
  {
    internal: "veiculos-por-cnpj",
    path: "pj-veiculos",
    nome: "Frota da Empresa",
    categoria: "veicular",
    paramType: "cnpj",
    custoCentavos: 528,
    cacheTTLHours: 168,
  },
  {
    internal: "sintegra",
    path: "pj-sintegra",
    nome: "Sintegra",
    categoria: "empresa",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 168,
  },

  // ============= CREDITO / DIVIDAS =============
  {
    internal: "boa-vista-essencial",
    path: "scpc-boavista",
    nome: "Boa Vista Essencial",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 303,
    cacheTTLHours: 4, // 4h — score/dividas mudam
  },
  {
    internal: "serasa-basico",
    path: "r-cadastrais-score-dividas",
    nome: "Serasa Basico",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 304,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "serasa-premium",
    path: "serasa-premium",
    nome: "Serasa Premium",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 739,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "spc-brasil",
    path: "spc-brasil",
    nome: "SPC Brasil",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 840,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "scr-bacen",
    path: "scr-premium",
    nome: "SCR BACEN",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 628,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "scr-bacen-socios",
    path: "scr-premium",
    nome: "SCR BACEN dos socios",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 628,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "quod",
    path: "ic-quod",
    nome: "QUOD",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 526,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "cred-completa-plus",
    path: "e-boavista",
    nome: "Cred Completa Plus",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 274,
    cacheTTLHours: 4, // 4h
  },

  // ============= JURIDICO =============
  {
    internal: "cnd-trabalhista",
    path: "cert-pf-debitos-trabalhistas",
    nome: "CNDT (Certidao Nacional de Debitos Trabalhistas)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // 1d
  },

  // ============= CERTIDOES (PF e PJ) =============
  {
    internal: "cert-pgfn-pf",
    path: "cert-pf-pgfn",
    nome: "Certidao PGFN (Receita/PGFN)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-acoes-trabalhistas-pf",
    path: "cert-pf-acoes-trabalhistas",
    nome: "Certidao de Acoes Trabalhistas",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-cnj-pf",
    path: "cert-pf-negativa-cnj",
    nome: "Certidao Negativa CNJ",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-cgu-pf",
    path: "cert-pf-negativa-cgu",
    nome: "Certidao Negativa CGU",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-nada-consta-pf",
    path: "cert-pf-judicial-nada-consta",
    nome: "Certidao Judicial Nada Consta",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-divida-ativa-pf",
    path: "cert-pf-divida-ativa-pgfn",
    nome: "Divida Ativa PGFN",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-ibama-pf",
    path: "cert-pf-negativa-ibama",
    nome: "Certidao Negativa IBAMA",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-fgts-pj",
    path: "cert-pj-fgts",
    nome: "Certidao FGTS (CRF)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-pgfn-pj",
    path: "cert-pj-pgfn",
    nome: "Certidao PGFN (Receita/PGFN)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-situacao-cadastral-pj",
    path: "cert-pj-situacao-cadastral",
    nome: "Certidao de Situacao Cadastral",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-debitos-trabalhistas-pj",
    path: "cert-pj-debitos-trabalhistas",
    nome: "CNDT (Debitos Trabalhistas)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-acoes-trabalhistas-pj",
    path: "cert-pj-acoes-trabalhistas",
    nome: "Certidao de Acoes Trabalhistas",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-cnj-pj",
    path: "cert-pj-negativa-cnj",
    nome: "Certidao Negativa CNJ",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-cgu-pj",
    path: "cert-pj-negativa-cgu",
    nome: "Certidao Negativa CGU",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-pcd-pj",
    path: "cert-pj-contratacao-pcd",
    nome: "Certidao de Contratacao de PCD",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-ibama-pj",
    path: "cert-pj-negativa-ibama",
    nome: "Certidao Negativa IBAMA",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 116,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },

  // ============= COMPLIANCE / KYC / JUDICIAL =============
  {
    internal: "pld-pf",
    path: "pf-compliance-pld-v3",
    nome: "Compliance PLD (PEP, sancoes, risco)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 225,
    cacheTTLHours: 24,
  },
  {
    internal: "pld-pj",
    path: "pj-compliance-pld-v3",
    nome: "Compliance PLD da Empresa",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 675,
    cacheTTLHours: 24,
  },
  {
    internal: "pld-qsa",
    path: "pj-compliance-pld-qsa-v3",
    nome: "Compliance PLD dos Socios (QSA)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 675,
    cacheTTLHours: 24,
  },
  {
    internal: "obito",
    path: "pf-obito",
    nome: "Dados de Obito",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 9,
    cacheTTLHours: 168,
  },
  {
    internal: "mandados-prisao",
    path: "pf-mandados-prisao",
    nome: "Mandados de Prisao (BNMP)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 22,
    cacheTTLHours: 24,
  },
  {
    internal: "protesto-nacional",
    path: "protesto-nacional",
    nome: "Protesto Nacional",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 376,
    cacheTTLHours: 24,
  },
  {
    internal: "protesto-nacional-pj",
    path: "protesto-nacional",
    nome: "Protesto Nacional (empresa)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 376,
    cacheTTLHours: 24,
  },
  {
    internal: "cadin",
    path: "cadin",
    nome: "CADIN (dividas federais)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 88,
    cacheTTLHours: 24,
  },
  {
    internal: "acoes-processos",
    path: "r-acoes-e-processos-judiciais",
    nome: "Acoes e Processos Judiciais",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 198,
    cacheTTLHours: 24,
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
