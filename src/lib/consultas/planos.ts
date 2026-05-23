/**
 * Catalogo oficial dos planos Capivara — fonte da verdade para frontend, checkout e PDF.
 *
 * Modelo de pricing:
 *  - B2C: cliente avulso paga `precoB2C_centavos` (Pix/boleto/cartao) por consulta.
 *  - B2B: empresa tem saldo em R$ (`companies.balance_cents`); cada consulta debita
 *    `precoB2B_centavos` desse saldo. Empresa recarrega via pacotes Manada (paga R$ X,
 *    ganha bonus % em saldo).
 *
 * Nomes oficiais do brandbook:
 *  B2C: Espiadinha, Investigacao, Avancada, Premium, Raio-X
 *  B2B: pacotes Manada (Start, Pro, Plus, Reserva Capivara)
 */

export type CategoriaConsulta = "cpf" | "cnpj" | "veicular";

export interface Plano {
  id: string;
  categoria: CategoriaConsulta;
  nome: string;
  descricao: string;
  destaque?: "popular" | "premium";
  /** Preco para cliente PF avulso (Pix/boleto/cartao). */
  precoB2C_centavos: number;
  /** Preco para empresa (debita de companies.balance_cents). ~50% off do B2C. */
  precoB2B_centavos: number;
  apisIncluidas: string[];
  custoApiEstimado_centavos: number; // referencia interna
}

// =========================================================================
// CPF
// =========================================================================

export const PLANOS_CPF: Plano[] = [
  {
    id: "cpf-espiadinha",
    categoria: "cpf",
    nome: "Espiadinha",
    descricao: "Confirmar identidade rapida: nome, mae, situacao do CPF.",
    precoB2C_centavos: 990,
    precoB2B_centavos: 490,
    apisIncluidas: ["cpf-simples"],
    custoApiEstimado_centavos: 5,
  },
  {
    id: "cpf-investigacao",
    categoria: "cpf",
    nome: "Investigação",
    descricao: "Quem e a pessoa: identidade + contatos + vinculos + score basico.",
    precoB2C_centavos: 1990,
    precoB2B_centavos: 990,
    apisIncluidas: ["cpf-completo", "boa-vista-essencial"],
    custoApiEstimado_centavos: 309,
  },
  {
    id: "cpf-avancada",
    categoria: "cpf",
    nome: "Avançada",
    destaque: "popular",
    descricao: "Quem e + saude financeira (Serasa + Boa Vista + dividas + protestos).",
    precoB2C_centavos: 3990,
    precoB2B_centavos: 1990,
    apisIncluidas: [
      "cpf-ultra-completo",
      "boa-vista-essencial",
      "serasa-basico",
      "cred-completa-plus",
    ],
    custoApiEstimado_centavos: 1048,
  },
  {
    id: "cpf-premium",
    categoria: "cpf",
    nome: "Premium",
    descricao: "Avancada + Serasa Premium + Trabalhista + QUOD.",
    precoB2C_centavos: 7990,
    precoB2B_centavos: 3990,
    apisIncluidas: [
      "cpf-ultra-completo",
      "boa-vista-essencial",
      "serasa-premium",
      "cred-completa-plus",
      "cnd-trabalhista",
      "quod",
    ],
    custoApiEstimado_centavos: 2336,
  },
  {
    id: "cpf-raio-x",
    categoria: "cpf",
    nome: "Raio-X",
    destaque: "premium",
    descricao: "Tudo: SPC + SCR BACEN + busca por documentos + analise multi-bureau.",
    precoB2C_centavos: 12990,
    precoB2B_centavos: 6490,
    apisIncluidas: [
      "cpf-ultra-completo",
      "boa-vista-essencial",
      "serasa-premium",
      "spc-brasil",
      "scr-bacen",
      "cred-completa-plus",
      "cnd-trabalhista",
      "quod",
      "busca-por-documentos",
    ],
    custoApiEstimado_centavos: 3585,
  },
];

// =========================================================================
// CNPJ
// =========================================================================

export const PLANOS_CNPJ: Plano[] = [
  {
    id: "cnpj-espiadinha",
    categoria: "cnpj",
    nome: "Espiadinha",
    descricao: "Razao social, situacao, CNAE, socios, endereco.",
    precoB2C_centavos: 790,
    precoB2B_centavos: 390,
    apisIncluidas: ["cnpj-completo"],
    custoApiEstimado_centavos: 4,
  },
  {
    id: "cnpj-socios",
    categoria: "cnpj",
    nome: "Espiadinha + Sócios",
    destaque: "popular",
    descricao: "Empresa + CPF Ultra de cada socio + Trabalhista + Boa Vista.",
    precoB2C_centavos: 4990,
    precoB2B_centavos: 2490,
    apisIncluidas: [
      "cnpj-completo",
      "cpf-ultra-socios",
      "cnd-trabalhista",
      "boa-vista-essencial",
    ],
    custoApiEstimado_centavos: 1143,
  },
  {
    id: "cnpj-premium",
    categoria: "cnpj",
    nome: "Premium",
    descricao: "+ Score empresarial + Serasa Premium dos socios + situacao tributaria.",
    precoB2C_centavos: 9990,
    precoB2B_centavos: 4990,
    apisIncluidas: [
      "cnpj-completo",
      "cpf-ultra-socios",
      "cnd-trabalhista",
      "cred-completa-plus",
      "serasa-premium",
      "boa-vista-essencial",
    ],
    custoApiEstimado_centavos: 2491,
  },
  {
    id: "cnpj-total",
    categoria: "cnpj",
    nome: "Total",
    destaque: "premium",
    descricao: "Capivara Total: + SCR BACEN dos socios + SPC + analise de risco completa.",
    precoB2C_centavos: 14990,
    precoB2B_centavos: 7490,
    apisIncluidas: [
      "cnpj-completo",
      "cpf-ultra-socios",
      "cnd-trabalhista",
      "cred-completa-plus",
      "serasa-premium",
      "spc-brasil",
      "scr-bacen-socios",
      "boa-vista-essencial",
    ],
    custoApiEstimado_centavos: 4210,
  },
];

// =========================================================================
// Veicular
// =========================================================================

export const PLANOS_VEICULAR: Plano[] = [
  {
    id: "veicular-espiadinha",
    categoria: "veicular",
    nome: "Espiadinha",
    descricao: "Placa, marca, modelo, ano, cor, chassi e Fipe.",
    precoB2C_centavos: 990,
    precoB2B_centavos: 490,
    apisIncluidas: ["placa-basica", "fipe"],
    custoApiEstimado_centavos: 17,
  },
  {
    id: "veicular-completo",
    categoria: "veicular",
    nome: "Completo",
    descricao: "Espiadinha + BIN Nacional + Recall.",
    precoB2C_centavos: 2990,
    precoB2B_centavos: 1490,
    apisIncluidas: ["placa-basica", "fipe", "bin-nacional", "recall"],
    custoApiEstimado_centavos: 497,
  },
  {
    id: "veicular-avancado",
    categoria: "veicular",
    nome: "Avançado",
    destaque: "popular",
    descricao: "Completo + BIN Estadual + Proprietario + Gravame + Historico Roubo/Furto.",
    precoB2C_centavos: 5990,
    precoB2B_centavos: 2990,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "bin-nacional",
      "bin-estadual",
      "proprietario",
      "gravame",
      "recall",
      "historico-roubo-furto",
    ],
    custoApiEstimado_centavos: 1382,
  },
  {
    id: "veicular-premium",
    categoria: "veicular",
    nome: "Premium",
    descricao: "Avancado + Leilao + Certificado Seguranca Veicular + RENAJUD.",
    precoB2C_centavos: 11990,
    precoB2B_centavos: 5990,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "bin-nacional",
      "bin-estadual",
      "proprietario",
      "gravame",
      "recall",
      "historico-roubo-furto",
      "leilao",
      "certificado-seguranca-veicular",
    ],
    custoApiEstimado_centavos: 2812,
  },
  {
    id: "veicular-total",
    categoria: "veicular",
    nome: "Total",
    destaque: "premium",
    descricao: "Premium + Vip Car + CRLV + Foto Leilao.",
    precoB2C_centavos: 24990,
    precoB2B_centavos: 12490,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "bin-nacional",
      "bin-estadual",
      "proprietario",
      "gravame",
      "recall",
      "historico-roubo-furto",
      "leilao",
      "certificado-seguranca-veicular",
      "vip-car",
      "crlv",
      "foto-leilao",
    ],
    custoApiEstimado_centavos: 6502,
  },
];

export const TODOS_PLANOS: Plano[] = [
  ...PLANOS_CPF,
  ...PLANOS_CNPJ,
  ...PLANOS_VEICULAR,
];

export function findPlano(id: string): Plano | undefined {
  return TODOS_PLANOS.find((p) => p.id === id);
}

export function planosPorCategoria(cat: CategoriaConsulta): Plano[] {
  return TODOS_PLANOS.filter((p) => p.categoria === cat);
}

// =========================================================================
// Helpers de preco
// =========================================================================

/** Preco B2B em centavos pra um plano. */
export function precoB2BCentavos(plano: Plano): number {
  return plano.precoB2B_centavos;
}

/** % de desconto B2B vs B2C (pra exibir economia). */
export function descontoB2BPercent(plano: Plano): number {
  return Math.round(
    ((plano.precoB2C_centavos - plano.precoB2B_centavos) / plano.precoB2C_centavos) * 100
  );
}

// =========================================================================
// RESUMO_INCLUI — fonte da verdade do conteudo de cada plano
//
// Usado em: /precos cards, /consultar/[cat]/[plano] checkout, PDF do relatorio.
// Mantenha alinhado com PLANOS_*.apisIncluidas — se uma API entra/sai do plano,
// o bullet correspondente deve refletir.
// =========================================================================

export const RESUMO_INCLUI: Record<string, string[]> = {
  // ---- CPF ----
  "cpf-espiadinha": [
    "Nome completo e nome da mãe",
    "Data de nascimento e idade",
    "Situação cadastral do CPF na Receita Federal",
    "Confirmação rápida de identidade",
  ],
  "cpf-investigacao": [
    "Nome, mãe, nascimento e situação na Receita",
    "Endereços completos (atuais e histórico)",
    "Telefones cadastrados em bases públicas",
    "E-mails associados ao CPF",
    "Parentes diretos (mãe, pai, irmãos, cônjuge)",
    "Empresas em que figura como sócio",
    "Score Boa Vista básico",
    "Indicação de pendências (sim/não)",
  ],
  "cpf-avancada": [
    "Tudo da Investigação",
    "Ultra Completo: 400+ bases unificadas",
    "Score Serasa Básico",
    "Score Boa Vista completo",
    "Cred Plus: análise consolidada de risco",
    "Pendências financeiras (Serasa + Boa Vista)",
    "Protestos cartoriais ativos e históricos",
    "Imóveis e veículos vinculados",
  ],
  "cpf-premium": [
    "Tudo da Avançada",
    "Score e relatório Serasa Premium",
    "Cheques sem fundos e cheques sustados",
    "Certidão Negativa de Débitos Trabalhistas (CNDT)",
    "Informações QUOD (dívidas e cadastro positivo)",
    "Cenprot (protestos nacionais)",
    "Histórico de consultas feitas no CPF",
  ],
  "cpf-raio-x": [
    "Tudo da Premium",
    "SPC Brasil completo (ações cíveis + pendências)",
    "SCR BACEN (operações no Banco Central)",
    "Busca reversa por documentos (RG, CNH, CIN)",
    "Análise multi-bureau consolidada",
    "Detecção de inconsistências entre bases",
    "Indicadores de comprometimento de renda",
  ],

  // ---- CNPJ ----
  "cnpj-espiadinha": [
    "Razão social e nome fantasia",
    "Situação cadastral na Receita Federal",
    "CNAE principal e secundários",
    "Quadro de sócios e endereço",
    "Data de abertura e capital social",
    "Natureza jurídica e porte",
  ],
  "cnpj-socios": [
    "Tudo da Espiadinha",
    "CPF Ultra Completo de cada sócio (até 3)",
    "Endereços, telefones e e-mails dos sócios",
    "Score Boa Vista dos sócios e da empresa",
    "Certidão Negativa de Débitos Trabalhistas",
    "Vínculos empresariais dos sócios",
  ],
  "cnpj-premium": [
    "Tudo do + Sócios",
    "Cred Plus empresarial (análise de risco)",
    "Score Serasa Premium dos sócios",
    "Situação tributária e pendências fiscais",
    "Protestos cartoriais da empresa",
    "Cheques sem fundo da empresa",
    "Histórico de inadimplência dos sócios",
  ],
  "cnpj-total": [
    "Tudo da Premium",
    "SCR BACEN dos sócios (Banco Central)",
    "SPC Brasil dos sócios",
    "Análise de risco detalhada (fraude, blacklist)",
    "Score consolidado multi-bureau (Serasa + Boa Vista + SPC)",
    "Detecção de empresas-fantasma e laranja",
    "Histórico de relacionamento bancário",
  ],

  // ---- Veicular ----
  "veicular-espiadinha": [
    "Marca, modelo, versão e ano (fab/modelo)",
    "Cor predominante e combustível",
    "Chassi e número de motor",
    "Valor Fipe atualizado do mês",
    "Município e UF de licenciamento",
  ],
  "veicular-completo": [
    "Tudo da Espiadinha",
    "BIN Nacional consolidado (Detran)",
    "Recall ativo do fabricante",
    "Categoria, espécie e tipo de carroceria",
    "Capacidade (passageiros, carga)",
    "Restrições administrativas",
  ],
  "veicular-avancado": [
    "Tudo do Completo",
    "BIN Estadual com dados regionais detalhados",
    "Nome e documento do proprietário atual",
    "Histórico de proprietários anteriores",
    "Gravame: alienação fiduciária ativa",
    "Histórico nacional de roubo e furto",
    "Restrições judiciais (RENAJUD básico)",
  ],
  "veicular-premium": [
    "Tudo do Avançado",
    "Histórico completo de leilão (sinistro, judicial)",
    "Certificado de Segurança Veicular (CSV)",
    "RENAJUD detalhado (todas restrições judiciais)",
    "RENAINF: todas infrações de trânsito",
    "Verificação de adulteração estrutural",
    "Multas e dívidas de IPVA",
  ],
  "veicular-total": [
    "Tudo da Premium",
    "Vip Car: relatório completo de concessionária",
    "CRLV digital (documento do veículo)",
    "Fotos do veículo no leilão (se houver)",
    "Análise técnica completa pré-compra",
    "Histórico de KM e quilometragem suspeita",
    "Verificação de adulteração de chassi",
  ],
};

export function getResumoIncluido(planoId: string): string[] {
  return RESUMO_INCLUI[planoId] ?? [];
}

// =========================================================================
// Pacotes Manada (B2B — recarga de saldo em R$)
//
// Empresa paga `valor_centavos`, ganha `bonusPercent` em bonus, recebe
// `saldoTotal_centavos` (valor + bonus) creditado em companies.balance_cents.
// =========================================================================

export interface PacoteManada {
  id: string;
  nome: string;
  /** Quanto a empresa paga via Pix/boleto/cartao (em centavos). */
  valor_centavos: number;
  /** % de bonus aplicado em cima do valor pago. */
  bonusPercent: number;
  /** Saldo total que entra na empresa (valor + bonus, em centavos). */
  saldoTotal_centavos: number;
  recursos: string[];
}

export const PACOTES_MANADA: PacoteManada[] = [
  {
    id: "manada-start",
    nome: "Manada Start",
    valor_centavos: 20000,
    bonusPercent: 20,
    saldoTotal_centavos: 24000,
    recursos: ["Ate 3 usuarios", "Historico unificado", "NF-e emitida"],
  },
  {
    id: "manada-pro",
    nome: "Manada Pro",
    valor_centavos: 50000,
    bonusPercent: 30,
    saldoTotal_centavos: 65000,
    recursos: ["Ate 10 usuarios", "Exportacao CSV/PDF", "API REST", "NF-e"],
  },
  {
    id: "manada-plus",
    nome: "Manada Plus",
    valor_centavos: 100000,
    bonusPercent: 40,
    saldoTotal_centavos: 140000,
    recursos: ["Ate 25 usuarios", "Webhooks", "Cache estendido 7d", "Suporte prioritario"],
  },
  {
    id: "manada-master",
    nome: "Reserva Capivara",
    valor_centavos: 300000,
    bonusPercent: 50,
    saldoTotal_centavos: 450000,
    recursos: ["Usuarios ilimitados", "SLA dedicado", "Cache 7d", "Account manager"],
  },
];

export function findPacoteManada(id: string): PacoteManada | undefined {
  return PACOTES_MANADA.find((p) => p.id === id);
}

/** Valor do bonus em centavos = saldoTotal - valor pago. */
export function bonusCentavos(pacote: PacoteManada): number {
  return pacote.saldoTotal_centavos - pacote.valor_centavos;
}

// =========================================================================
// PRODUTOS AVULSOS (consultas pontuais)
//
// Diferente de "Plano" (combo), produto avulso entrega UM dado especifico
// (FIPE, Recall, BIN, Leilao, etc). Vendido em /consultar/veicular e
// /consultar/leilao. CPF e CNPJ NAO tem avulsos publicos (so combos).
//
// Custo da API APIFULL ja eh real (cotado em 23/05/2026, Nivel 1).
// Margem alvo: >=60% B2C, idealmente >70%.
// =========================================================================

export type CategoriaProdutoAvulso = "veicular" | "leilao";

export interface ProdutoAvulso {
  id: string;
  categoria: CategoriaProdutoAvulso;
  nome: string;
  /** Descricao curta pro card (1 frase). */
  descricao: string;
  /** O que vem no resultado (3-5 bullets pra card expandido). */
  bullets: string[];
  /** Pra quem (1 frase). */
  publicoAlvo: string;
  precoB2C_centavos: number;
  precoB2B_centavos: number;
  /** APIs APIFULL que esse produto chama. */
  apisIncluidas: string[];
  /** Soma dos custos das APIs (Nivel 1 APIFULL, centavos). */
  custoApiReal_centavos: number;
  /** Icone Lucide pro card. */
  icon?: string;
}

// -------------------------------------------------------------------------
// Veicular (produtos individuais)
// -------------------------------------------------------------------------

export const PRODUTOS_VEICULAR_AVULSO: ProdutoAvulso[] = [
  {
    id: "veicular-avulso-fipe",
    categoria: "veicular",
    nome: "FIPE",
    descricao: "Valor de mercado atualizado do veiculo (tabela FIPE).",
    bullets: [
      "Codigo FIPE",
      "Valor R$ do mes atual",
      "Marca, modelo, versao e ano",
      "Combustivel e tipo de cambio",
    ],
    publicoAlvo: "Quem quer saber quanto o carro vale antes de fechar negocio.",
    precoB2C_centavos: 999,
    precoB2B_centavos: 499,
    apisIncluidas: ["fipe", "placa-basica"],
    custoApiReal_centavos: 21,
    icon: "Banknote",
  },
  {
    id: "veicular-avulso-recall",
    categoria: "veicular",
    nome: "Recall pendente",
    descricao: "Verifica se o veiculo tem recall ativo do fabricante.",
    bullets: [
      "Numero e descricao do recall",
      "Data de inicio da campanha",
      "Concessionaria autorizada",
      "Recalls historicos resolvidos",
    ],
    publicoAlvo: "Comprador particular antes de aceitar veiculo usado.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["recall", "placa-basica"],
    custoApiReal_centavos: 370,
    icon: "AlertTriangle",
  },
  {
    id: "veicular-avulso-bin-nacional",
    categoria: "veicular",
    nome: "BIN Nacional",
    descricao: "Dados nacionais do veiculo a partir da placa.",
    bullets: [
      "Marca, modelo, versao",
      "Ano fabricacao e modelo",
      "Cor e tipo de combustivel",
      "Chassi e numero de motor",
      "Municipio e UF de licenciamento",
    ],
    publicoAlvo: "Confirmacao basica de dados antes de qualquer consulta mais cara.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["bin-nacional", "placa-basica"],
    custoApiReal_centavos: 310,
    icon: "FileText",
  },
  {
    id: "veicular-avulso-gravame",
    categoria: "veicular",
    nome: "Gravame / Alienacao",
    descricao: "Verifica se ha financiamento ativo no veiculo.",
    bullets: [
      "Existencia de gravame",
      "Tipo (alienacao fiduciaria, leasing, etc)",
      "Data de inclusao",
      "Instituicao financeira credora",
      "Documento do agente e UF",
    ],
    publicoAlvo: "Comprador particular pra ter certeza que o carro nao tem divida.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["gravame", "placa-basica"],
    custoApiReal_centavos: 230,
    icon: "Lock",
  },
  {
    id: "veicular-avulso-bin-estadual",
    categoria: "veicular",
    nome: "BIN Estadual",
    descricao: "Dados detalhados do Detran estadual.",
    bullets: [
      "Tudo do BIN Nacional",
      "Categoria, especie e tipo de carroceria",
      "Capacidade de passageiros e carga",
      "Restricoes administrativas estaduais",
      "Status de licenciamento atual",
    ],
    publicoAlvo: "Quem precisa de dados oficiais do Detran (lojistas, despachantes).",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["bin-estadual", "placa-basica"],
    custoApiReal_centavos: 286,
    icon: "ClipboardList",
  },
  {
    id: "veicular-avulso-roubo-furto-basico",
    categoria: "veicular",
    nome: "Historico Roubo/Furto",
    descricao: "Verifica se o veiculo tem registro ativo de roubo ou furto.",
    bullets: [
      "Numero do boletim de ocorrencia",
      "Local e data do registro",
      "Status (ativo ou resolvido)",
      "Se nada consta: confirmacao oficial",
    ],
    publicoAlvo: "Comprador particular antes de comprar carro de origem desconhecida.",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["historico-roubo-furto", "placa-basica"],
    custoApiReal_centavos: 370,
    icon: "Shield",
  },
  {
    id: "veicular-avulso-proprietario",
    categoria: "veicular",
    nome: "Proprietario atual",
    descricao: "Identifica o proprietario registrado no Detran.",
    bullets: [
      "Nome do proprietario atual",
      "Tipo de documento (CPF/CNPJ)",
      "UF do registro",
      "Tempo de propriedade (se disponivel)",
    ],
    publicoAlvo: "Quem precisa confirmar quem eh o dono antes de fechar negocio.",
    precoB2C_centavos: 2499,
    precoB2B_centavos: 1399,
    apisIncluidas: ["proprietario-placa", "placa-basica"],
    custoApiReal_centavos: 352,
    icon: "UserRound",
  },
  {
    id: "veicular-avulso-csv",
    categoria: "veicular",
    nome: "CSV Completo",
    descricao: "Pacote oficial: CSV + RENAJUD + RENAINF + Recall + BIN + Proprietario.",
    bullets: [
      "CSV (Certificado de Seguranca Veicular)",
      "RENAINF (multas nacionais)",
      "RENAJUD (restricoes judiciais)",
      "Recall ativo",
      "BIN consolidado",
      "Proprietario atual",
    ],
    publicoAlvo: "Comprador que quer um pacote consolidado oficial sem montar varias consultas.",
    precoB2C_centavos: 4999,
    precoB2B_centavos: 2799,
    apisIncluidas: ["certificado-seguranca-veicular", "placa-basica"],
    custoApiReal_centavos: 460,
    icon: "FileCheck",
  },
  {
    id: "veicular-avulso-crlv",
    categoria: "veicular",
    nome: "CRLV digital",
    descricao: "Certificado de Registro e Licenciamento Veicular eletronico.",
    bullets: [
      "PDF oficial do CRLV digital",
      "Dados do veiculo licenciado",
      "Status de licenciamento atual",
      "QR code de validacao",
    ],
    publicoAlvo: "Quem precisa do documento oficial do veiculo emitido pelo Detran.",
    precoB2C_centavos: 4999,
    precoB2B_centavos: 2999,
    apisIncluidas: ["crlv", "placa-basica"],
    custoApiReal_centavos: 2038,
    icon: "FileDigit",
  },
];

// -------------------------------------------------------------------------
// Leilao (produtos individuais)
// -------------------------------------------------------------------------

export const PRODUTOS_LEILAO_AVULSO: ProdutoAvulso[] = [
  {
    id: "leilao-avulso-historico",
    categoria: "leilao",
    nome: "Historico de Leilao",
    descricao: "Se o veiculo passou por leilao e qual o motivo.",
    bullets: [
      "Se o veiculo tem registro em base de leilao",
      "Leiloeiro responsavel",
      "Data do leilao",
      "Categoria do sinistro (pequena/media/grande monta)",
      "Status atual (recuperado ou nao)",
    ],
    publicoAlvo: "Comprador antes de dar lance ou aceitar carro suspeito.",
    precoB2C_centavos: 2999,
    precoB2B_centavos: 1599,
    apisIncluidas: ["leilao", "placa-basica"],
    custoApiReal_centavos: 886,
    icon: "Gavel",
  },
  {
    id: "leilao-avulso-foto",
    categoria: "leilao",
    nome: "Foto do Leilao",
    descricao: "Imagens do veiculo no momento que foi leiloado.",
    bullets: [
      "Galeria de fotos do veiculo no leilao",
      "Identificacao de danos visiveis",
      "Comparacao com estado atual",
      "Pra avaliar reforma posterior",
    ],
    publicoAlvo: "Lojista que quer ver o que comprou ou comprador suspeitando reforma.",
    precoB2C_centavos: 3999,
    precoB2B_centavos: 2199,
    apisIncluidas: ["foto-leilao", "placa-basica"],
    custoApiReal_centavos: 1210,
    icon: "Camera",
  },
  {
    id: "leilao-avulso-roubo-premium",
    categoria: "leilao",
    nome: "Historico Roubo/Furto Premium",
    descricao: "Versao premium com base policial nacional completa.",
    bullets: [
      "Numero do BO e descricao detalhada",
      "Local, data e UF do registro",
      "Status atualizado (ativo, resolvido)",
      "Historico de movimentacoes",
      "Bases policiais nacionais cruzadas",
    ],
    publicoAlvo: "Lojista de leilao ou comprador profissional que precisa ter certeza.",
    precoB2C_centavos: 2999,
    precoB2B_centavos: 1599,
    apisIncluidas: ["historico-roubo-furto-premium", "placa-basica"],
    custoApiReal_centavos: 946,
    icon: "Shield",
  },
  {
    id: "leilao-avulso-vip-car",
    categoria: "leilao",
    nome: "Vip Car (analise tecnica)",
    descricao: "Pacote tecnico: BIN Estadual + Gravame + Roubo/Furto + Precificador.",
    bullets: [
      "BIN Estadual com dados detalhados Detran",
      "Verificacao de gravame e alienacao",
      "Historico de roubo e furto consolidado",
      "Precificador com analise de valor de mercado",
    ],
    publicoAlvo: "Comprador profissional de leilao ou lojista que quer 1 relatorio tecnico forte.",
    precoB2C_centavos: 8999,
    precoB2B_centavos: 4999,
    apisIncluidas: ["vip-car", "placa-basica"],
    custoApiReal_centavos: 3130,
    icon: "Star",
  },
];

// -------------------------------------------------------------------------
// Combos LEILAO (planos especificos pra /consultar/leilao)
// -------------------------------------------------------------------------

export const COMBOS_LEILAO: Plano[] = [
  {
    id: "leilao-pre-lance",
    categoria: "veicular", // banco eh "veicular" — sub-tipo "leilao" via apisIncluidas
    nome: "Pre-Lance",
    descricao: "Antes de dar lance: vale comprar esse carro? historico + sinistro.",
    precoB2C_centavos: 7990,
    precoB2B_centavos: 4490,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "leilao",
      "foto-leilao",
      "historico-roubo-furto",
    ],
    custoApiEstimado_centavos: 2797,
  },
  {
    id: "leilao-pos-compra",
    categoria: "veicular",
    nome: "Pos-Compra",
    descricao: "Acabou de arrematar: regularizacao completa pra circular.",
    precoB2C_centavos: 8990,
    precoB2B_centavos: 4990,
    apisIncluidas: [
      "placa-basica",
      "certificado-seguranca-veicular", // CSV+RENAJUD+RENAINF+Recall+BIN+Prop
      "crlv",
      "gravame",
    ],
    custoApiEstimado_centavos: 2708,
  },
  {
    id: "leilao-auctioneer",
    categoria: "veicular",
    nome: "Auctioneer Total",
    destaque: "premium",
    descricao: "Pre-Lance + Pos-Compra + Vip Car tecnico. Pra revendedor profissional.",
    precoB2C_centavos: 19990,
    precoB2B_centavos: 11990,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "leilao",
      "foto-leilao",
      "historico-roubo-furto-premium",
      "certificado-seguranca-veicular",
      "crlv",
      "gravame",
      "vip-car",
    ],
    custoApiEstimado_centavos: 7943,
  },
];

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

export const TODOS_PRODUTOS_AVULSO: ProdutoAvulso[] = [
  ...PRODUTOS_VEICULAR_AVULSO,
  ...PRODUTOS_LEILAO_AVULSO,
];

export function findProdutoAvulso(id: string): ProdutoAvulso | undefined {
  return TODOS_PRODUTOS_AVULSO.find((p) => p.id === id);
}

export function produtosAvulsosPorCategoria(cat: CategoriaProdutoAvulso): ProdutoAvulso[] {
  return TODOS_PRODUTOS_AVULSO.filter((p) => p.categoria === cat);
}

export function findComboLeilao(id: string): Plano | undefined {
  return COMBOS_LEILAO.find((p) => p.id === id);
}

/** Margem em % do produto avulso (B2C). */
export function margemB2CPercent(prod: ProdutoAvulso): number {
  return Math.round(
    ((prod.precoB2C_centavos - prod.custoApiReal_centavos) / prod.precoB2C_centavos) * 100
  );
}

/** Margem em % do produto avulso (B2B). */
export function margemB2BPercent(prod: ProdutoAvulso): number {
  return Math.round(
    ((prod.precoB2B_centavos - prod.custoApiReal_centavos) / prod.precoB2B_centavos) * 100
  );
}
