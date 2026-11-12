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
/**
 * Parametro principal enviado a APIFULL.
 * - `parametro`: endpoints V2 que aceitam placa OU chassi no campo `parametro`.
 */
export type ApiParamType = "placa" | "parametro" | "cpf" | "cnpj" | "cep" | "nome" | "documentos";

/**
 * Endpoints que exigem estado (UF):
 * - `escolhida`: o cliente escolhe no formulario (certidao estadual).
 * - `do-veiculo`: a Edge descobre a UF de registro pela consulta basica da
 *   placa (fase 2) e manda o codigo numerico que o endpoint `crlv` espera.
 *   Exige `placa-basica` no mesmo produto (o validador confere).
 */
export type ApiUf = "escolhida" | "do-veiculo";

export interface ApiFullEndpoint {
  /** Nome interno usado em apisIncluidas[]. */
  internal: string;
  /** Path APIFULL (sem barra inicial). Vai pro body como `link`. */
  path: string;
  /** Nome humano pro PDF/UI. */
  nome: string;
  /** Categoria (pra agrupar no PDF e admin). */
  categoria: "veicular" | "pessoa" | "empresa" | "leilao" | "credito" | "juridico" | "local";
  /** Parametro principal que precisa ser enviado. */
  paramType: ApiParamType;
  /** Se o endpoint exige UF e de onde ela vem. */
  uf?: ApiUf;
  /** Custo em centavos (Nivel 1 — conta APIFULL, conferido em 12/11/2026). */
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
    custoCentavos: 8,
    cacheTTLHours: 168, // 7d — dados de identificacao estaveis
  },
  {
    internal: "placa-basica-propria",
    path: "agregados-propria",
    nome: "Placa Basica (propria)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 10,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "fipe",
    path: "fipe",
    nome: "Tabela FIPE",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 11,
    cacheTTLHours: 720, // 30d — tabela FIPE atualiza mensalmente
  },
  {
    internal: "bin-nacional",
    path: "ic-bin-nacional",
    nome: "BIN Nacional",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 300,
    cacheTTLHours: 168, // 7d — dados estaveis
  },
  {
    internal: "bin-estadual",
    path: "ic-bin-estadual",
    nome: "BIN Estadual",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 276,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "recall",
    path: "ic-recall",
    nome: "Recall pendente",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 360,
    cacheTTLHours: 24, // 1d — pode aparecer recall novo
  },
  {
    // `gravame` (v1) exige CHASSI e falhava com placa em todo produto.
    // V2 aceita placa ou chassi no campo `parametro` e custa menos.
    internal: "gravame",
    path: "gravame-v2",
    nome: "Gravame / Alienacao",
    categoria: "veicular",
    paramType: "parametro",
    custoCentavos: 153,
    cacheTTLHours: 6, // 6h — pode mudar rapido (quitacao, novo financiamento)
  },
  {
    internal: "proprietario-placa",
    path: "ic-proprietario-atual",
    nome: "Proprietario atual",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 228,
    cacheTTLHours: 6, // 6h — pode mudar via transferencia
  },
  {
    internal: "historico-roubo-furto",
    path: "roubo-furto",
    nome: "Historico Roubo/Furto",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 360,
    cacheTTLHours: 24, // 1d
  },
  {
    internal: "leilao",
    path: "leilao",
    nome: "Historico de Leilao",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 876,
    cacheTTLHours: 24, // 1d
  },
  {
    internal: "foto-leilao",
    path: "ic-foto-leilao",
    nome: "Foto do Leilao",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 1200,
    cacheTTLHours: 720, // 30d — imagens nao mudam
  },
  {
    internal: "certificado-seguranca-veicular",
    path: "csv-renainf-renajud-recall-bin-proprietario",
    nome: "CSV Completo (CSV+RENAJUD+RENAINF+Recall+BIN+Proprietario)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 450,
    cacheTTLHours: 12, // 12h — combina multas que mudam rapido
  },
  {
    // Exige `state` (codigo da UF). Sem ele falhava sempre. A Edge tira a
    // UF de registro da consulta basica da placa. Estados aceitos: CRLV_UF_CODIGO.
    internal: "crlv",
    path: "crlv",
    nome: "CRLV digital",
    categoria: "veicular",
    paramType: "placa",
    uf: "do-veiculo",
    custoCentavos: 2028,
    cacheTTLHours: 168, // 7d — CRLV digital anual
  },
  {
    internal: "vip-car",
    path: "ic-vipcar",
    nome: "Vip Car (analise tecnica)",
    categoria: "leilao",
    paramType: "placa",
    custoCentavos: 3120,
    cacheTTLHours: 24, // 1d
  },

  {
    internal: "rastreamento-veicular",
    path: "veiculo-rastreamento",
    nome: "Rastreamento de Veiculo (passagens e patios)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 7920,
    cacheTTLHours: 12,
  },
  {
    internal: "veiculo-debitos",
    path: "veiculo-dados-debitos",
    nome: "Multas e Debitos do Veiculo",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 389,
    cacheTTLHours: 12, // 12h — debito muda rapido (pagamento, autuacao nova)
  },
  {
    internal: "renainf",
    path: "renainf",
    nome: "RENAINF (infracoes nacionais)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 360,
    cacheTTLHours: 12, // 12h
  },
  {
    internal: "renajud",
    path: "renajud",
    nome: "RENAJUD (restricoes judiciais)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 360,
    cacheTTLHours: 24, // 1d — restricao judicial muda devagar
  },
  {
    internal: "placa-radar",
    path: "placa-radar",
    nome: "Placa Radar (passagens)",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 75,
    cacheTTLHours: 24, // 1d
  },

  // ============= PESSOA (CPF) =============
  {
    internal: "cpf-simples",
    path: "pf-dadosbasicos",
    nome: "CPF Simples",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 10,
    cacheTTLHours: 168, // 7d — dados cadastrais
  },
  {
    internal: "cpf-completo",
    path: "ic-cpf-completo",
    nome: "CPF Completo",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 60,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "cpf-ultra-completo",
    path: "cpf-ultra",
    nome: "CPF Ultra Completo",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 265,
    cacheTTLHours: 168, // 7d
  },
  {
    internal: "cpf-ultra-socios",
    path: "cpf-ultra",
    nome: "CPF Ultra dos socios",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 265,
    cacheTTLHours: 168, // 7d
  },

  {
    internal: "processos-judiciais-pf",
    path: "pf-processos-judiciais",
    nome: "Processos Judiciais (PF)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 28,
    cacheTTLHours: 24,
  },
  {
    internal: "antecedentes-criminais",
    path: "cert-pf-antecedentes-criminais",
    nome: "Certidao de Antecedentes Criminais",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta
  },
  {
    internal: "darkweb-pf",
    path: "pf-darkweb",
    nome: "Exposicao na Dark Web",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 168,
  },
  {
    internal: "dados-financeiros-pf",
    path: "pf-dados-financeiros",
    nome: "Renda e Patrimonio estimados",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 128,
    cacheTTLHours: 168,
  },
  {
    internal: "pessoas-relacionadas",
    path: "pf-pessoas-relacionadas",
    nome: "Vinculos e Parentes",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 20,
    cacheTTLHours: 168,
  },
  {
    internal: "dados-profissionais",
    path: "pf-dados-profissionais",
    nome: "Vida Profissional",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 40,
    cacheTTLHours: 168,
  },
  {
    internal: "cnh",
    path: "pf-cnh-v2",
    nome: "Carteira Nacional de Habilitacao",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 243,
    cacheTTLHours: 168,
  },
  {
    internal: "veiculos-por-cpf",
    path: "pf-veiculos",
    nome: "Veiculos no CPF",
    categoria: "veicular",
    paramType: "cpf",
    custoCentavos: 480,
    cacheTTLHours: 168,
  },
  {
    internal: "imoveis",
    path: "consulta-imoveis",
    nome: "Imoveis (capitais)",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 700,
    cacheTTLHours: 720, // 30d — registro de imovel muda devagar
  },

  // ============= EMPRESA (CNPJ) =============
  {
    internal: "cnpj-completo",
    path: "cnpj",
    nome: "CNPJ Completo",
    categoria: "empresa",
    paramType: "cnpj",
    custoCentavos: 6,
    cacheTTLHours: 168, // 7d — dados cadastrais
  },

  {
    internal: "processos-judiciais-pj",
    path: "pj-processos-judiciais",
    nome: "Processos Judiciais (PJ)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 28,
    cacheTTLHours: 24,
  },
  {
    internal: "quadro-societario",
    path: "pj-quadro-societario",
    nome: "Quadro Societario",
    categoria: "empresa",
    paramType: "cnpj",
    custoCentavos: 28,
    cacheTTLHours: 168,
  },
  {
    internal: "veiculos-por-cnpj",
    path: "pj-veiculos",
    nome: "Frota da Empresa",
    categoria: "veicular",
    paramType: "cnpj",
    custoCentavos: 480,
    cacheTTLHours: 168,
  },
  {
    internal: "sintegra",
    path: "pj-sintegra",
    nome: "Sintegra",
    categoria: "empresa",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 168,
  },

  // ============= CREDITO / DIVIDAS =============
  {
    internal: "boa-vista-essencial",
    path: "scpc-boavista",
    nome: "Boa Vista Essencial",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 275,
    cacheTTLHours: 4, // 4h — score/dividas mudam
  },
  {
    internal: "serasa-basico",
    path: "r-cadastrais-score-dividas",
    nome: "Serasa Basico",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 276,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "serasa-premium",
    path: "serasa-premium",
    nome: "Serasa Premium",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 672,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "spc-brasil",
    path: "spc-brasil",
    nome: "SPC Brasil",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 764,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "scr-bacen",
    path: "scr-premium",
    nome: "SCR BACEN",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 571,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "scr-bacen-socios",
    path: "scr-premium",
    nome: "SCR BACEN dos socios",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 571,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "quod",
    path: "ic-quod",
    nome: "QUOD",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 478,
    cacheTTLHours: 4, // 4h
  },
  {
    internal: "cred-completa-plus",
    path: "e-boavista",
    nome: "Cred Completa Plus",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 249,
    cacheTTLHours: 4, // 4h
  },

  // ============= JURIDICO =============
  {
    internal: "cnd-trabalhista",
    path: "cert-pf-debitos-trabalhistas",
    nome: "CNDT (Certidao Nacional de Debitos Trabalhistas)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // 1d
  },

  // ============= CERTIDOES (PF e PJ) =============
  {
    internal: "cert-pgfn-pf",
    path: "cert-pf-pgfn",
    nome: "Certidao PGFN (Receita/PGFN)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-acoes-trabalhistas-pf",
    path: "cert-pf-acoes-trabalhistas",
    nome: "Certidao de Acoes Trabalhistas",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-cnj-pf",
    path: "cert-pf-negativa-cnj",
    nome: "Certidao Negativa CNJ",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-cgu-pf",
    path: "cert-pf-negativa-cgu",
    nome: "Certidao Negativa CGU",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-nada-consta-pf",
    path: "cert-pf-judicial-nada-consta",
    nome: "Certidao Judicial Nada Consta",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-divida-ativa-pf",
    path: "cert-pf-divida-ativa-pgfn",
    nome: "Divida Ativa PGFN",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-ibama-pf",
    path: "cert-pf-negativa-ibama",
    nome: "Certidao Negativa IBAMA",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-fgts-pj",
    path: "cert-pj-fgts",
    nome: "Certidao FGTS (CRF)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-pgfn-pj",
    path: "cert-pj-pgfn",
    nome: "Certidao PGFN (Receita/PGFN)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-situacao-cadastral-pj",
    path: "cert-pj-situacao-cadastral",
    nome: "Certidao de Situacao Cadastral",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-debitos-trabalhistas-pj",
    path: "cert-pj-debitos-trabalhistas",
    nome: "CNDT (Debitos Trabalhistas)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-acoes-trabalhistas-pj",
    path: "cert-pj-acoes-trabalhistas",
    nome: "Certidao de Acoes Trabalhistas",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-cnj-pj",
    path: "cert-pj-negativa-cnj",
    nome: "Certidao Negativa CNJ",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-cgu-pj",
    path: "cert-pj-negativa-cgu",
    nome: "Certidao Negativa CGU",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-pcd-pj",
    path: "cert-pj-contratacao-pcd",
    nome: "Certidao de Contratacao de PCD",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },
  {
    internal: "cert-ibama-pj",
    path: "cert-pj-negativa-ibama",
    nome: "Certidao Negativa IBAMA",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24, // certidao tem validade curta — nao cachear muito
  },

  // ============= COMPLIANCE / KYC / JUDICIAL =============
  {
    internal: "pld-pf",
    path: "pf-compliance-pld-v3",
    nome: "Compliance PLD (PEP, sancoes, risco)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 205,
    cacheTTLHours: 24,
  },
  {
    internal: "pld-pj",
    path: "pj-compliance-pld-v3",
    nome: "Compliance PLD da Empresa",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 614,
    cacheTTLHours: 24,
  },
  {
    internal: "pld-qsa",
    path: "pj-compliance-pld-qsa-v3",
    nome: "Compliance PLD dos Socios (QSA)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 614,
    cacheTTLHours: 24,
  },
  {
    internal: "obito",
    path: "pf-obito",
    nome: "Dados de Obito",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 8,
    cacheTTLHours: 168,
  },
  {
    internal: "mandados-prisao",
    path: "pf-mandados-prisao",
    nome: "Mandados de Prisao (BNMP)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 20,
    cacheTTLHours: 24,
  },
  {
    internal: "protesto-nacional",
    path: "protesto-nacional",
    nome: "Protesto Nacional",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 342,
    cacheTTLHours: 24,
  },
  {
    internal: "protesto-nacional-pj",
    path: "protesto-nacional",
    nome: "Protesto Nacional (empresa)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 342,
    cacheTTLHours: 24,
  },
  {
    internal: "cadin",
    path: "cadin",
    nome: "CADIN (dividas federais)",
    categoria: "juridico",
    paramType: "cpf",
    custoCentavos: 80,
    cacheTTLHours: 24,
  },

  // ============= LOCAL / CEP (geomarketing) =============
  {
    internal: "mercado-sociodemografico",
    path: "mercado-sociodemografico",
    nome: "Perfil sociodemografico do CEP",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 30,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-infraestrutura",
    path: "mercado-infraestrutura-urbana",
    nome: "Indice de infraestrutura urbana",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 17,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-macroeconomicos",
    path: "mercado-macroeconomicos",
    nome: "Indicadores macroeconomicos",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 30,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-concorrencia",
    path: "mercado-concorrencia",
    nome: "Score de concorrencia",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 30,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-risco-geografico",
    path: "mercado-risco-geografico",
    nome: "Risco geografico",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 30,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-propensao-seguro",
    path: "mercado-propensao-seguro",
    nome: "Propensao a seguro",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 17,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-alimentacao",
    path: "mercado-gastos-alimentacao",
    nome: "Gastos com alimentacao",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-consumo",
    path: "mercado-gastos-consumo",
    nome: "Gastos com consumo",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-diversos",
    path: "mercado-gastos-diversos",
    nome: "Gastos com diversos",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-educacao",
    path: "mercado-gastos-educacao",
    nome: "Gastos com educacao",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-habitacao",
    path: "mercado-gastos-habitacao",
    nome: "Gastos com habitacao",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-recreacao",
    path: "mercado-gastos-recreacao",
    nome: "Gastos com recreacao",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-saude",
    path: "mercado-gastos-saude",
    nome: "Gastos com saude",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-servicos",
    path: "mercado-gastos-servicos",
    nome: "Gastos com servicos",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-transporte",
    path: "mercado-gastos-transporte",
    nome: "Gastos com transporte",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  {
    internal: "mercado-gastos-vestuario",
    path: "mercado-gastos-vestuario",
    nome: "Gastos com vestuario",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
  },
  // ============= NOVOS (lista da conta, 12/11/2026) =============
  {
    internal: "pf-credito-essencial",
    path: "pf-credito-essencial",
    nome: "Analise de Credito Boa Vista - Essencial",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 1627,
    cacheTTLHours: 4,
  },
  {
    internal: "pf-credito-mais",
    path: "pf-credito-mais",
    nome: "Analise de Credito Boa Vista - Mais",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 1808,
    cacheTTLHours: 4,
  },
  {
    internal: "pf-credito-completo",
    path: "pf-credito-completo",
    nome: "Analise de Credito Boa Vista - Completa",
    categoria: "credito",
    paramType: "cpf",
    custoCentavos: 2134,
    cacheTTLHours: 4,
  },
  {
    internal: "beneficio-inss",
    path: "beneficio-inss",
    nome: "Beneficios do INSS e Consignados",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 216,
    cacheTTLHours: 24,
  },
  {
    internal: "servidor-publico",
    path: "pf-servidor-publico",
    nome: "Vinculo com o Servico Publico",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 20,
    cacheTTLHours: 168,
  },
  {
    internal: "conselhos-classe",
    path: "pf-conselhos-classe",
    nome: "Registro em Conselho de Classe",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 20,
    cacheTTLHours: 168,
  },
  {
    internal: "corretor-seguros-pf",
    path: "pf-corretor-seguros",
    nome: "Registro de Corretor de Seguros (SUSEP)",
    categoria: "pessoa",
    paramType: "cpf",
    custoCentavos: 105,
    cacheTTLHours: 168,
  },
  {
    internal: "define-risco-pj",
    path: "pj-define-risco",
    nome: "Define Risco Positivo (Boa Vista)",
    categoria: "credito",
    paramType: "cnpj",
    custoCentavos: 1509,
    cacheTTLHours: 4,
  },
  {
    internal: "define-negocio-pj",
    path: "pj-define-negocio",
    nome: "Define Negocio Positivo (Boa Vista)",
    categoria: "credito",
    paramType: "cnpj",
    custoCentavos: 2464,
    cacheTTLHours: 4,
  },
  {
    internal: "define-limite-pj",
    path: "pj-define-limite",
    nome: "Define Limite Positivo (Boa Vista)",
    categoria: "credito",
    paramType: "cnpj",
    custoCentavos: 2907,
    cacheTTLHours: 4,
  },
  {
    internal: "participacao-societaria",
    path: "pj-participacao-societaria",
    nome: "Percentual de Participacao Societaria",
    categoria: "empresa",
    paramType: "cnpj",
    custoCentavos: 513,
    cacheTTLHours: 168,
  },
  {
    internal: "cert-debitos-estaduais-pf",
    path: "cert-pf-debitos-estaduais",
    nome: "Certidao de Debitos Estaduais (PF)",
    categoria: "juridico",
    paramType: "cpf",
    uf: "escolhida",
    custoCentavos: 105,
    cacheTTLHours: 24,
  },
  {
    internal: "cert-debitos-estaduais-pj",
    path: "cert-pj-debitos-estaduais",
    nome: "Certidao de Debitos Estaduais (PJ)",
    categoria: "juridico",
    paramType: "cnpj",
    uf: "escolhida",
    custoCentavos: 105,
    cacheTTLHours: 24,
  },
  {
    internal: "cert-embargos-ibama-pj",
    path: "cert-pj-embargos-ibama",
    nome: "Certidao de Embargos IBAMA (PJ)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24,
  },
  {
    internal: "cert-regularidade-ibama-pj",
    path: "cert-pj-regularidade-ibama",
    nome: "Certidao de Regularidade IBAMA (PJ)",
    categoria: "juridico",
    paramType: "cnpj",
    custoCentavos: 105,
    cacheTTLHours: 24,
  },
  {
    internal: "veiculo-rntrc",
    path: "veiculo-combo-rntrc",
    nome: "Dados, Debitos e ANTT/RNTRC do Veiculo",
    categoria: "veicular",
    paramType: "placa",
    custoCentavos: 463,
    cacheTTLHours: 24,
  },
  {
    internal: "mercado-outras-despesas",
    path: "mercado-outras-despesas",
    nome: "Gastos com outras despesas",
    categoria: "local",
    paramType: "cep",
    custoCentavos: 8,
    cacheTTLHours: 720,
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

/**
 * Codigo numerico que o endpoint `crlv` espera em `state`. So esses estados
 * tem CRLV pela APIFULL; fora deles a consulta e pulada sem cobranca.
 */
export const CRLV_UF_CODIGO: Record<string, string> = {
  AL: "1345", AP: "1696", BA: "1747", GO: "1697", MA: "1698", MG: "1680",
  MT: "1700", PA: "1701", PR: "1703", PI: "1702", RO: "1769", RR: "1750",
  SP: "1704", SE: "1348", TO: "1705",
};

export const UFS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

/** O cliente precisa escolher o estado pra esse conjunto de APIs? */
export function pedeUfEscolhida(internals: string[]): boolean {
  return internals.some((i) => findEndpoint(i)?.uf === "escolhida");
}

/** Soma do custo APIFULL (em centavos) pra um plano. */
export function custoTotalCentavos(internals: string[]): number {
  return resolveEndpoints(internals).reduce((sum, e) => sum + e.custoCentavos, 0);
}
