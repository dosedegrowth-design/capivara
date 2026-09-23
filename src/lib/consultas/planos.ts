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

export type CategoriaConsulta = "cpf" | "cnpj" | "veicular" | "cep";

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
    custoApiEstimado_centavos: 11,
  },
  {
    id: "cpf-investigacao",
    categoria: "cpf",
    nome: "Investigação",
    descricao: "Quem e a pessoa: identidade + contatos + vinculos + score basico.",
    precoB2C_centavos: 1990,
    precoB2B_centavos: 990,
    apisIncluidas: ["cpf-completo", "boa-vista-essencial"],
    custoApiEstimado_centavos: 369,
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
    custoApiEstimado_centavos: 1173,
  },
  {
    id: "cpf-premium",
    categoria: "cpf",
    nome: "Premium",
    descricao: "Avancada + Serasa Premium + Trabalhista + QUOD.",
    precoB2C_centavos: 7990,
    precoB2B_centavos: 4990,
    apisIncluidas: [
      "cpf-ultra-completo",
      "boa-vista-essencial",
      "serasa-premium",
      "cred-completa-plus",
      "cnd-trabalhista",
      "quod",
    ],
    custoApiEstimado_centavos: 2250,
  },
  {
    id: "cpf-raio-x",
    categoria: "cpf",
    nome: "Raio-X",
    destaque: "premium",
    descricao: "Tudo: SPC + SCR BACEN + busca por documentos + analise multi-bureau.",
    precoB2C_centavos: 12990,
    precoB2B_centavos: 7990,
    apisIncluidas: [
      "cpf-ultra-completo",
      "boa-vista-essencial",
      "serasa-premium",
      "spc-brasil",
      "scr-bacen",
      "cred-completa-plus",
      "cnd-trabalhista",
      "quod",
    ],
    custoApiEstimado_centavos: 3718,
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
    custoApiEstimado_centavos: 7,
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
    custoApiEstimado_centavos: 718,
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
    custoApiEstimado_centavos: 1731,
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
    custoApiEstimado_centavos: 3199,
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
    custoApiEstimado_centavos: 21,
  },
  {
    id: "veicular-completo",
    categoria: "veicular",
    nome: "Completo",
    descricao: "Espiadinha + BIN Nacional + Recall.",
    precoB2C_centavos: 2990,
    precoB2B_centavos: 1490,
    apisIncluidas: ["placa-basica", "fipe", "bin-nacional", "recall"],
    custoApiEstimado_centavos: 747,
  },
  {
    id: "veicular-avancado",
    categoria: "veicular",
    nome: "Avançado",
    destaque: "popular",
    descricao: "Completo + BIN Estadual + Proprietario + Gravame + Histórico Roubo/Furto.",
    precoB2C_centavos: 5990,
    precoB2B_centavos: 3490,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "bin-nacional",
      "bin-estadual",
      "proprietario-placa",
      "gravame",
      "recall",
      "historico-roubo-furto",
    ],
    custoApiEstimado_centavos: 2065,
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
      "proprietario-placa",
      "gravame",
      "recall",
      "historico-roubo-furto",
      "leilao",
      "certificado-seguranca-veicular",
    ],
    custoApiEstimado_centavos: 3524,
  },
  {
    id: "veicular-total",
    categoria: "veicular",
    nome: "Total",
    destaque: "premium",
    descricao: "Premium + Vip Car + CRLV + Foto Leilao.",
    precoB2C_centavos: 27990,
    precoB2B_centavos: 17990,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "bin-nacional",
      "bin-estadual",
      "proprietario-placa",
      "gravame",
      "recall",
      "historico-roubo-furto",
      "leilao",
      "certificado-seguranca-veicular",
      "vip-car",
      "crlv",
      "foto-leilao",
    ],
    custoApiEstimado_centavos: 10507,
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

export type CategoriaProdutoAvulso = "veicular" | "leilao" | "cpf" | "cnpj" | "cep";

/**
 * Categoria que vai pro banco. `consultations.category` so aceita
 * cpf|cnpj|veicular — produtos de leilao entram como "veicular".
 */
export function categoriaBanco(cat: CategoriaProdutoAvulso): CategoriaConsulta {
  if (cat === "cpf") return "cpf";
  if (cat === "cnpj") return "cnpj";
  if (cat === "cep") return "cep";
  return "veicular";
}

/** Qual documento o cliente digita pra esse produto. */
export function alvoDoProduto(
  cat: CategoriaProdutoAvulso
): "placa" | "cpf" | "cnpj" | "cep" {
  if (cat === "cpf") return "cpf";
  if (cat === "cnpj") return "cnpj";
  if (cat === "cep") return "cep";
  return "placa";
}

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
    descricao: "Valor de mercado atualizado do veículo (tabela FIPE).",
    bullets: [
      "Código FIPE",
      "Valor R$ do mês atual",
      "Marca, modelo, versão e ano",
      "Combustível e tipo de câmbio",
    ],
    publicoAlvo: "Quem quer saber quanto o carro vale antes de fechar negócio.",
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
    descricao: "Verifica se o veículo tem recall ativo do fabricante.",
    bullets: [
      "Número e descrição do recall",
      "Data de início da campanha",
      "Concessionária autorizada",
      "Recalls históricos resolvidos",
    ],
    publicoAlvo: "Comprador particular antes de aceitar veículo usado.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["recall", "placa-basica"],
    custoApiReal_centavos: 405,
    icon: "AlertTriangle",
  },
  {
    id: "veicular-avulso-bin-nacional",
    categoria: "veicular",
    nome: "BIN Nacional",
    descricao: "Dados nacionais do veículo a partir da placa.",
    bullets: [
      "Marca, modelo, versão",
      "Ano fabricação e modelo",
      "Cor e tipo de combustível",
      "Chassi e número de motor",
      "Município e UF de licenciamento",
    ],
    publicoAlvo: "Confirmação básica de dados antes de qualquer consulta mais cara.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["bin-nacional", "placa-basica"],
    custoApiReal_centavos: 339,
    icon: "FileText",
  },
  {
    id: "veicular-avulso-gravame",
    categoria: "veicular",
    nome: "Gravame / Alienação",
    descricao: "Verifica se há financiamento ativo no veículo.",
    bullets: [
      "Existência de gravame",
      "Tipo (alienação fiduciária, leasing, etc)",
      "Data de inclusão",
      "Instituição financeira credora",
      "Documento do agente e UF",
    ],
    publicoAlvo: "Comprador particular pra ter certeza que o carro não tem dívida.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["gravame", "placa-basica"],
    custoApiReal_centavos: 251,
    icon: "Lock",
  },
  {
    id: "veicular-avulso-bin-estadual",
    categoria: "veicular",
    nome: "BIN Estadual",
    descricao: "Dados detalhados do Detran estadual.",
    bullets: [
      "Tudo do BIN Nacional",
      "Categoria, espécie e tipo de carroceria",
      "Capacidade de passageiros e carga",
      "Restrições administrativas estaduais",
      "Status de licenciamento atual",
    ],
    publicoAlvo: "Quem precisa de dados oficiais do Detran (lojistas, despachantes).",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["bin-estadual", "placa-basica"],
    custoApiReal_centavos: 313,
    icon: "ClipboardList",
  },
  {
    id: "veicular-avulso-roubo-furto-basico",
    categoria: "veicular",
    nome: "Histórico Roubo/Furto",
    descricao: "Verifica se o veículo tem registro ativo de roubo ou furto.",
    bullets: [
      "Número do boletim de ocorrência",
      "Local e data do registro",
      "Status (ativo ou resolvido)",
      "Se nada consta: confirmação oficial",
    ],
    publicoAlvo: "Comprador particular antes de comprar carro de origem desconhecida.",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["historico-roubo-furto", "placa-basica"],
    custoApiReal_centavos: 405,
    icon: "Shield",
  },
  {
    id: "veicular-avulso-proprietario",
    categoria: "veicular",
    nome: "Proprietário atual",
    descricao: "Identifica o proprietário registrado no Detran.",
    bullets: [
      "Nome do proprietário atual",
      "Tipo de documento (CPF/CNPJ)",
      "UF do registro",
      "Tempo de propriedade (se disponível)",
    ],
    publicoAlvo: "Quem precisa confirmar quem é o dono antes de fechar negócio.",
    precoB2C_centavos: 2499,
    precoB2B_centavos: 1399,
    apisIncluidas: ["proprietario-placa", "placa-basica"],
    custoApiReal_centavos: 385,
    icon: "UserRound",
  },
  {
    id: "veicular-avulso-debitos",
    categoria: "veicular",
    nome: "Multas e Débitos",
    descricao: "IPVA, licenciamento, multas e DPVAT — com código de barras pra pagar.",
    bullets: [
      "IPVA em aberto (ano e valor)",
      "Licenciamento pendente",
      "Multas com valor e situação",
      "DPVAT e demais taxas",
      "Código de barras pra pagamento (conforme o estado)",
    ],
    publicoAlvo: "Quem vai comprar ou transferir e precisa saber o que está devendo.",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["veiculo-debitos", "placa-basica"],
    custoApiReal_centavos: 306,
    icon: "Receipt",
  },
  {
    id: "veicular-avulso-renainf",
    categoria: "veicular",
    nome: "Multas RENAINF",
    descricao: "Todas as infrações de trânsito registradas na base nacional.",
    bullets: [
      "Número do auto de infração",
      "Data, hora e local da autuação",
      "Órgão autuador",
      "Código e descrição da infração",
      "Valor e situação do débito",
    ],
    publicoAlvo: "Comprador que quer ver o histórico completo de multas antes de assumir o carro.",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["renainf", "placa-basica"],
    custoApiReal_centavos: 405,
    icon: "AlertCircle",
  },
  {
    id: "veicular-avulso-renajud",
    categoria: "veicular",
    nome: "Restrições RENAJUD",
    descricao: "Bloqueios judiciais de circulação, transferência ou licenciamento.",
    bullets: [
      "Tipo de restrição judicial",
      "Data de inclusão",
      "Processo e vara responsável (quando disponível)",
      "Se há bloqueio de transferência",
    ],
    publicoAlvo: "Quem vai transferir o veículo e precisa saber se há bloqueio judicial.",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["renajud", "placa-basica"],
    custoApiReal_centavos: 405,
    icon: "Scale",
  },
  {
    id: "veicular-avulso-atpve",
    categoria: "veicular",
    nome: "ATPV-e (2ª via)",
    descricao: "Segunda via da Autorização para Transferência de Propriedade eletrônica.",
    bullets: [
      "Documento ATPV-e oficial",
      "Dados do veículo e do proprietário",
      "Pronto pra usar na transferência",
    ],
    publicoAlvo: "Quem perdeu o ATPV-e e precisa da segunda via pra fechar a transferência.",
    precoB2C_centavos: 2499,
    precoB2B_centavos: 1399,
    apisIncluidas: ["atpv-e", "placa-basica"],
    custoApiReal_centavos: 249,
    icon: "FileSignature",
  },
  {
    id: "veicular-avulso-radar",
    categoria: "veicular",
    nome: "Passagens em Radar",
    descricao: "Onde o veículo passou por radares, com mapa e geolocalização.",
    bullets: [
      "Passagens registradas em radares",
      "Data e hora de cada passagem",
      "Localização com mapa",
      "Rota aproximada",
    ],
    publicoAlvo: "Quem precisa confirmar deslocamento do veículo (frota, seguro, disputa).",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["placa-radar", "placa-basica"],
    custoApiReal_centavos: 92,
    icon: "Radar",
  },
  {
    id: "veicular-avulso-csv",
    categoria: "veicular",
    nome: "CSV Completo",
    descricao: "Pacote oficial: CSV + RENAJUD + RENAINF + Recall + BIN + Proprietário.",
    bullets: [
      "CSV (Certificado de Segurança Veicular)",
      "RENAINF (multas nacionais)",
      "RENAJUD (restrições judiciais)",
      "Recall ativo",
      "BIN consolidado",
      "Proprietário atual",
    ],
    publicoAlvo: "Comprador que quer um pacote consolidado oficial sem montar várias consultas.",
    precoB2C_centavos: 4999,
    precoB2B_centavos: 2799,
    apisIncluidas: ["certificado-seguranca-veicular", "placa-basica"],
    custoApiReal_centavos: 504,
    icon: "FileCheck",
  },
  {
    id: "veicular-avulso-crlv",
    categoria: "veicular",
    nome: "CRLV digital",
    descricao: "Certificado de Registro e Licenciamento Veicular eletrônico.",
    bullets: [
      "PDF oficial do CRLV digital",
      "Dados do veículo licenciado",
      "Status de licenciamento atual",
      "QR code de validação",
    ],
    publicoAlvo: "Quem precisa do documento oficial do veículo emitido pelo Detran.",
    precoB2C_centavos: 5999,
    precoB2B_centavos: 3799,
    apisIncluidas: ["crlv", "placa-basica"],
    custoApiReal_centavos: 2240,
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
    nome: "Histórico de Leilão",
    descricao: "Se o veículo passou por leilão e qual o motivo.",
    bullets: [
      "Se o veículo tem registro em base de leilão",
      "Leiloeiro responsável",
      "Data do leilão",
      "Categoria do sinistro (pequena/média/grande monta)",
      "Status atual (recuperado ou não)",
    ],
    publicoAlvo: "Comprador antes de dar lance ou aceitar carro suspeito.",
    precoB2C_centavos: 2999,
    precoB2B_centavos: 1699,
    apisIncluidas: ["leilao", "placa-basica"],
    custoApiReal_centavos: 973,
    icon: "Gavel",
  },
  {
    id: "leilao-avulso-foto",
    categoria: "leilao",
    nome: "Foto do Leilão",
    descricao: "Imagens do veículo no momento que foi leiloado.",
    bullets: [
      "Galeria de fotos do veículo no leilão",
      "Identificação de danos visíveis",
      "Comparacao com estado atual",
      "Pra avaliar reforma posterior",
    ],
    publicoAlvo: "Lojista que quer ver o que comprou ou comprador suspeitando reforma.",
    precoB2C_centavos: 3999,
    precoB2B_centavos: 2299,
    apisIncluidas: ["foto-leilao", "placa-basica"],
    custoApiReal_centavos: 1329,
    icon: "Camera",
  },
  {
    id: "leilao-avulso-vip-car",
    categoria: "leilao",
    nome: "Vip Car (análise técnica)",
    descricao: "Pacote tecnico: BIN Estadual + Gravame + Roubo/Furto + Precificador.",
    bullets: [
      "BIN Estadual com dados detalhados Detran",
      "Verificação de gravame e alienação",
      "Histórico de roubo e furto consolidado",
      "Precificador com análise de valor de mercado",
    ],
    publicoAlvo: "Comprador profissional de leilão ou lojista que quer 1 relatório técnico forte.",
    precoB2C_centavos: 8999,
    precoB2B_centavos: 5799,
    apisIncluidas: ["vip-car", "placa-basica"],
    custoApiReal_centavos: 3441,
    icon: "Star",
  },
];


// -------------------------------------------------------------------------
// CPF (produtos individuais)
// -------------------------------------------------------------------------

export const PRODUTOS_CPF_AVULSO: ProdutoAvulso[] = [
  {
    id: "cpf-avulso-processos",
    categoria: "cpf",
    nome: "Processos Judiciais",
    descricao: "Ações judiciais em que a pessoa aparece como parte.",
    bullets: [
      "Tribunal e comarca",
      "Assunto e classe processual",
      "Partes envolvidas",
      "Movimentações recentes",
    ],
    publicoAlvo: "Quem vai contratar, alugar ou fechar negócio e quer saber de processos.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["processos-judiciais-pf", "cpf-simples"],
    custoApiReal_centavos: 42,
    icon: "Scale",
  },
  {
    id: "cpf-avulso-antecedentes",
    categoria: "cpf",
    nome: "Antecedentes Criminais",
    descricao: "Certidão federal de antecedentes criminais.",
    bullets: [
      "Certidão oficial da Polícia Federal",
      "Situação (nada consta ou com apontamento)",
      "Data de emissão e validade",
      "PDF do documento",
    ],
    publicoAlvo: "RH em contratação, condomínio, locação e credenciamento.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["antecedentes-criminais", "cpf-simples"],
    custoApiReal_centavos: 127,
    icon: "ShieldCheck",
  },
  {
    id: "cpf-avulso-darkweb",
    categoria: "cpf",
    nome: "Exposição na Dark Web",
    descricao: "Se os dados da pessoa apareceram em vazamentos conhecidos.",
    bullets: [
      "E-mails e telefones expostos",
      "Vazamentos em que aparecem",
      "Tipo de dado comprometido",
      "Recomendação de ação",
    ],
    publicoAlvo: "Quem quer saber se foi vazado e precisa trocar senhas ou reforçar segurança.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["darkweb-pf", "cpf-simples"],
    custoApiReal_centavos: 127,
    icon: "Eye",
  },
  {
    id: "cpf-avulso-financeiro",
    categoria: "cpf",
    nome: "Renda e Patrimônio",
    descricao: "Estimativa de renda, patrimônio e classe social.",
    bullets: [
      "Faixa de renda estimada",
      "Patrimônio estimado",
      "Classe social",
      "Capacidade financeira",
    ],
    publicoAlvo: "Locador avaliando inquilino, vendedor qualificando comprador.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["dados-financeiros-pf", "cpf-simples"],
    custoApiReal_centavos: 152,
    icon: "TrendingUp",
  },
  {
    id: "cpf-avulso-vinculos",
    categoria: "cpf",
    nome: "Vínculos e Parentes",
    descricao: "Familiares, sócios e pessoas relacionadas ao CPF.",
    bullets: [
      "Parentes diretos",
      "Sócios e vínculos empresariais",
      "Grau de relacionamento",
      "Documentos relacionados",
    ],
    publicoAlvo: "Investigação patrimonial, análise de fraude e due diligence.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["pessoas-relacionadas", "cpf-simples"],
    custoApiReal_centavos: 33,
    icon: "Users",
  },
  {
    id: "cpf-avulso-profissional",
    categoria: "cpf",
    nome: "Vida Profissional",
    descricao: "Vínculos de trabalho, empregadores e ocupações.",
    bullets: [
      "Empregadores atuais e anteriores",
      "Cargo e ocupação",
      "Período do vínculo",
      "Participações empresariais",
    ],
    publicoAlvo: "RH conferindo currículo e histórico profissional.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["dados-profissionais", "cpf-simples"],
    custoApiReal_centavos: 55,
    icon: "Briefcase",
  },
  {
    id: "cpf-avulso-cnh",
    categoria: "cpf",
    nome: "CNH do Motorista",
    descricao: "Situação da habilitação: categoria, validade e pontuação.",
    bullets: [
      "Número do registro e RENACH",
      "Categoria da habilitação",
      "Validade e situação",
      "Filiação e dados do condutor",
      "Débitos vinculados (quando houver)",
    ],
    publicoAlvo: "Locadora, transportadora e app de mobilidade antes de liberar o motorista.",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["cnh", "cpf-simples"],
    custoApiReal_centavos: 278,
    icon: "IdCard",
  },
  {
    id: "cpf-avulso-veiculos",
    categoria: "cpf",
    nome: "Veículos no CPF",
    descricao: "Frota de veículos registrada no nome da pessoa.",
    bullets: [
      "Placa de cada veículo",
      "Marca, modelo e RENAVAM",
      "Data de atualização do registro",
    ],
    publicoAlvo: "Investigação patrimonial, execução de dívida e análise de crédito.",
    precoB2C_centavos: 2499,
    precoB2B_centavos: 1399,
    apisIncluidas: ["veiculos-por-cpf", "cpf-simples"],
    custoApiReal_centavos: 539,
    icon: "Car",
  },
  {
    id: "cpf-avulso-imoveis",
    categoria: "cpf",
    nome: "Imóveis no CPF",
    descricao: "Imóveis registrados no nome da pessoa (capitais).",
    bullets: [
      "Endereço do imóvel",
      "Tipo e matrícula",
      "Cartório de registro",
      "Cobertura: capitais de cada estado",
    ],
    publicoAlvo: "Execução de dívida, investigação patrimonial e análise de garantia.",
    precoB2C_centavos: 3499,
    precoB2B_centavos: 1899,
    apisIncluidas: ["imoveis", "cpf-simples"],
    custoApiReal_centavos: 781,
    icon: "Home",
  },
];

// -------------------------------------------------------------------------
// CNPJ (produtos individuais)
// -------------------------------------------------------------------------

export const PRODUTOS_CNPJ_AVULSO: ProdutoAvulso[] = [
  {
    id: "cnpj-avulso-processos",
    categoria: "cnpj",
    nome: "Processos Judiciais da Empresa",
    descricao: "Ações judiciais em que a empresa aparece como parte.",
    bullets: [
      "Tribunal e comarca",
      "Assunto e classe processual",
      "Partes envolvidas",
      "Movimentações recentes",
    ],
    publicoAlvo: "Quem vai fechar contrato, parceria ou fornecer pra empresa.",
    precoB2C_centavos: 1499,
    precoB2B_centavos: 799,
    apisIncluidas: ["processos-judiciais-pj", "cnpj-completo"],
    custoApiReal_centavos: 38,
    icon: "Scale",
  },
  {
    id: "cnpj-avulso-socios",
    categoria: "cnpj",
    nome: "Quadro Societário",
    descricao: "Quem são os sócios, com documento, qualificação e vínculo.",
    bullets: [
      "Nome e documento de cada sócio",
      "Qualificação societária",
      "Percentual de participação",
      "Data de entrada",
    ],
    publicoAlvo: "Due diligence rápida antes de contratar ou fechar parceria.",
    precoB2C_centavos: 999,
    precoB2B_centavos: 599,
    apisIncluidas: ["quadro-societario", "cnpj-completo"],
    custoApiReal_centavos: 38,
    icon: "Users",
  },
  {
    id: "cnpj-avulso-veiculos",
    categoria: "cnpj",
    nome: "Frota da Empresa",
    descricao: "Veículos registrados no CNPJ.",
    bullets: [
      "Placa de cada veículo",
      "Marca, modelo e RENAVAM",
      "Data de atualização do registro",
    ],
    publicoAlvo: "Análise de garantia, crédito e porte real da operação.",
    precoB2C_centavos: 2499,
    precoB2B_centavos: 1399,
    apisIncluidas: ["veiculos-por-cnpj", "cnpj-completo"],
    custoApiReal_centavos: 535,
    icon: "Car",
  },
  {
    id: "cnpj-avulso-sintegra",
    categoria: "cnpj",
    nome: "Sintegra",
    descricao: "Inscrição estadual, situação cadastral e atividade econômica.",
    bullets: [
      "Inscrição estadual",
      "Situação cadastral no estado",
      "Atividade econômica",
      "Endereço fiscal",
    ],
    publicoAlvo: "Emissão de nota, cadastro de fornecedor e conferência fiscal.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["sintegra", "cnpj-completo"],
    custoApiReal_centavos: 123,
    icon: "ClipboardList",
  },
];


// -------------------------------------------------------------------------
// CERTIDOES (PF e PJ)
//
// Certidao custa ~R$1,16 na APIFULL e vale muito mais pro cliente (advogado,
// RH, licitacao). O KIT e o produto principal: ninguem precisa de "uma"
// certidao — precisa do conjunto que o orgao/edital exige.
//
// Validade curta = recorrencia natural.
// -------------------------------------------------------------------------

export const PRODUTOS_CERTIDAO: ProdutoAvulso[] = [
  // ---- KITS (produto principal) ----
  {
    id: "certidao-kit-pf-essencial",
    categoria: "cpf",
    nome: "Kit Certidões PF — Essencial",
    descricao: "As 5 certidões que mais pedem de pessoa física, em um PDF só.",
    bullets: [
      "Certidão PGFN (Receita Federal + Procuradoria)",
      "CNDT — Certidão Negativa de Débitos Trabalhistas",
      "Antecedentes Criminais (Polícia Federal)",
      "Certidão Negativa CNJ (improbidade e inelegibilidade)",
      "Certidão Judicial de Nada Consta",
    ],
    publicoAlvo: "Quem precisa comprovar regularidade: contratação, locação, credenciamento.",
    precoB2C_centavos: 3990,
    precoB2B_centavos: 2190,
    apisIncluidas: [
      "cert-pgfn-pf",
      "cnd-trabalhista",
      "antecedentes-criminais",
      "cert-cnj-pf",
      "cert-nada-consta-pf",
      "cpf-simples",
    ],
    custoApiReal_centavos: 591,
    icon: "FileCheck",
  },
  {
    id: "certidao-kit-pf-completo",
    categoria: "cpf",
    nome: "Kit Certidões PF — Completo",
    descricao: "Nove certidões: tudo do Essencial + fiscal, trabalhista e ambiental.",
    bullets: [
      "Tudo do Kit Essencial (5 certidões)",
      "Certidão Negativa CGU",
      "Certidão de Ações Trabalhistas",
      "Dívida Ativa da União (PGFN)",
      "Certidão Negativa IBAMA",
    ],
    publicoAlvo: "Due diligence completa de pessoa física, processo judicial e habilitação.",
    precoB2C_centavos: 6990,
    precoB2B_centavos: 3790,
    apisIncluidas: [
      "cert-pgfn-pf",
      "cnd-trabalhista",
      "antecedentes-criminais",
      "cert-cnj-pf",
      "cert-nada-consta-pf",
      "cert-cgu-pf",
      "cert-acoes-trabalhistas-pf",
      "cert-divida-ativa-pf",
      "cert-ibama-pf",
      "cpf-simples",
    ],
    custoApiReal_centavos: 1055,
    icon: "FileCheck",
  },
  {
    id: "certidao-kit-pj-licitacao",
    categoria: "cnpj",
    nome: "Kit Certidões PJ — Licitação",
    descricao: "O pacote que o edital pede: regularidade fiscal, trabalhista e cadastral.",
    bullets: [
      "Certidão de Regularidade do FGTS (CRF)",
      "Certidão PGFN (Receita Federal + Procuradoria)",
      "CNDT — Certidão Negativa de Débitos Trabalhistas",
      "Certidão de Situação Cadastral (Receita)",
      "Sintegra (inscrição estadual)",
    ],
    publicoAlvo: "Empresa que vai participar de licitação ou se habilitar como fornecedor.",
    precoB2C_centavos: 4990,
    precoB2B_centavos: 2690,
    apisIncluidas: [
      "cert-fgts-pj",
      "cert-pgfn-pj",
      "cert-debitos-trabalhistas-pj",
      "cert-situacao-cadastral-pj",
      "sintegra",
      "cnpj-completo",
    ],
    custoApiReal_centavos: 587,
    icon: "FileCheck",
  },
  {
    id: "certidao-kit-pj-completo",
    categoria: "cnpj",
    nome: "Kit Certidões PJ — Completo",
    descricao: "Dez certidões da empresa: fiscal, trabalhista, judicial, ambiental e PCD.",
    bullets: [
      "Tudo do Kit Licitação",
      "Certidão Negativa CGU e CNJ",
      "Certidão de Ações Trabalhistas",
      "Certidão de Contratação de PCD (cota legal)",
      "Certidão Negativa IBAMA",
    ],
    publicoAlvo: "Due diligence de fornecedor, M&A e habilitação em concorrência grande.",
    precoB2C_centavos: 8990,
    precoB2B_centavos: 4790,
    apisIncluidas: [
      "cert-fgts-pj",
      "cert-pgfn-pj",
      "cert-debitos-trabalhistas-pj",
      "cert-situacao-cadastral-pj",
      "cert-cgu-pj",
      "cert-cnj-pj",
      "cert-acoes-trabalhistas-pj",
      "cert-pcd-pj",
      "cert-ibama-pj",
      "sintegra",
      "cnpj-completo",
    ],
    custoApiReal_centavos: 1167,
    icon: "FileCheck",
  },

  // ---- AVULSAS (as mais procuradas) ----
  {
    id: "certidao-pgfn-pf",
    categoria: "cpf",
    nome: "Certidão PGFN (pessoa física)",
    descricao: "Regularidade fiscal perante a Receita Federal e a Procuradoria.",
    bullets: [
      "Situação: negativa, positiva com efeito de negativa ou positiva",
      "Data de emissão e validade",
      "Código de controle pra conferência",
      "PDF oficial",
    ],
    publicoAlvo: "Quem precisa provar que está em dia com a União.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["cert-pgfn-pf", "cpf-simples"],
    custoApiReal_centavos: 127,
    icon: "FileText",
  },
  {
    id: "certidao-cndt-pf",
    categoria: "cpf",
    nome: "CNDT (pessoa física)",
    descricao: "Certidão Negativa de Débitos Trabalhistas.",
    bullets: [
      "Situação na Justiça do Trabalho",
      "Data de emissão e validade",
      "Número da certidão",
      "PDF oficial",
    ],
    publicoAlvo: "Contratação, credenciamento e habilitação que exigem CNDT.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["cnd-trabalhista", "cpf-simples"],
    custoApiReal_centavos: 127,
    icon: "FileText",
  },
  {
    id: "certidao-nada-consta-pf",
    categoria: "cpf",
    nome: "Nada Consta Judicial",
    descricao: "Certidão judicial de nada consta da pessoa física.",
    bullets: [
      "Situação judicial",
      "Abrangência da certidão",
      "Data de emissão e validade",
      "PDF oficial",
    ],
    publicoAlvo: "Locação, contratação e processos que pedem certidão judicial.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["cert-nada-consta-pf", "cpf-simples"],
    custoApiReal_centavos: 127,
    icon: "FileText",
  },
  {
    id: "certidao-fgts-pj",
    categoria: "cnpj",
    nome: "Certidão FGTS (CRF)",
    descricao: "Certificado de Regularidade do FGTS da empresa.",
    bullets: [
      "Situação de regularidade no FGTS",
      "Número do certificado",
      "Validade",
      "PDF oficial",
    ],
    publicoAlvo: "Licitação, contrato público e habilitação de fornecedor.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["cert-fgts-pj", "cnpj-completo"],
    custoApiReal_centavos: 123,
    icon: "FileText",
  },
  {
    id: "certidao-pgfn-pj",
    categoria: "cnpj",
    nome: "Certidão PGFN (empresa)",
    descricao: "Regularidade fiscal da empresa na Receita Federal e Procuradoria.",
    bullets: [
      "Situação: negativa, positiva com efeito de negativa ou positiva",
      "Data de emissão e validade",
      "Código de controle",
      "PDF oficial",
    ],
    publicoAlvo: "Empresa que precisa comprovar regularidade federal.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["cert-pgfn-pj", "cnpj-completo"],
    custoApiReal_centavos: 123,
    icon: "FileText",
  },
  {
    id: "certidao-situacao-cadastral-pj",
    categoria: "cnpj",
    nome: "Situação Cadastral (Receita)",
    descricao: "Comprovante e situação cadastral atual do CNPJ.",
    bullets: [
      "Situação cadastral (ativa, baixada, suspensa...)",
      "Data da situação e motivo",
      "Comprovante de inscrição",
      "PDF oficial",
    ],
    publicoAlvo: "Cadastro de fornecedor, emissão de nota e conferência antes de contratar.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["cert-situacao-cadastral-pj", "cnpj-completo"],
    custoApiReal_centavos: 123,
    icon: "FileText",
  },
];


// -------------------------------------------------------------------------
// COMPLIANCE / KYC e JUDICIAL
//
// Publico B2B: fintech, imobiliaria, RH, cartorio, marketplace. Canal natural
// e a API publica — mas tambem vende avulso pra quem faz onboarding manual.
// -------------------------------------------------------------------------

export const PRODUTOS_COMPLIANCE: ProdutoAvulso[] = [
  {
    id: "compliance-kyc-pf",
    categoria: "cpf",
    nome: "KYC Pessoa Física",
    descricao: "Checagem de integridade antes de aceitar alguém como cliente ou parceiro.",
    bullets: [
      "Compliance PLD: PEP, sanções, processos e nível de risco",
      "Verificação de óbito (CPF de falecido é fraude clássica)",
      "Mandados de prisão em aberto (BNMP)",
      "Antecedentes criminais (Polícia Federal)",
      "Identificação cadastral confirmada",
    ],
    publicoAlvo: "Fintech, imobiliária, marketplace e RH no onboarding de pessoa física.",
    precoB2C_centavos: 3990,
    precoB2B_centavos: 2190,
    apisIncluidas: ["pld-pf", "obito", "mandados-prisao", "antecedentes-criminais", "cpf-simples"],
    custoApiReal_centavos: 383,
    icon: "ShieldCheck",
  },
  {
    id: "compliance-kyc-pj",
    categoria: "cnpj",
    nome: "KYC Empresa",
    descricao: "Integridade da empresa e dos sócios antes de fechar contrato.",
    bullets: [
      "Compliance PLD da empresa (sanções, processos, risco)",
      "Compliance PLD dos sócios e administradores (QSA)",
      "Certidão de situação cadastral na Receita",
      "Processos judiciais da empresa",
      "Protesto nacional",
    ],
    publicoAlvo: "Due diligence de fornecedor, KYB de fintech e homologação de parceiro.",
    precoB2C_centavos: 8990,
    precoB2B_centavos: 4990,
    apisIncluidas: ["pld-pj", "pld-qsa", "cert-situacao-cadastral-pj", "processos-judiciais-pj", "protesto-nacional-pj", "cnpj-completo"],
    custoApiReal_centavos: 1880,
    icon: "ShieldCheck",
  },
  {
    id: "compliance-pld-pf",
    categoria: "cpf",
    nome: "PLD / PEP — Pessoa Física",
    descricao: "Prevenção à lavagem de dinheiro: PEP, sanções e nível de risco.",
    bullets: [
      "Pessoa Exposta Politicamente (PEP)",
      "Listas de sanções nacionais e internacionais",
      "Processos e notícias relacionadas",
      "Nível de risco consolidado",
    ],
    publicoAlvo: "Quem é obrigado a fazer PLD por regulação (fintech, seguradora, cartório).",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["pld-pf", "cpf-simples"],
    custoApiReal_centavos: 236,
    icon: "ShieldAlert",
  },
  {
    id: "compliance-pld-pj",
    categoria: "cnpj",
    nome: "PLD / Sanções — Empresa",
    descricao: "Compliance da empresa: sanções, processos, relacionamentos e risco.",
    bullets: [
      "Listas de sanções e restrições",
      "Processos e notícias negativas",
      "Relacionamentos societários de risco",
      "Nível de risco consolidado",
    ],
    publicoAlvo: "Compliance de fornecedor e KYB regulado.",
    precoB2C_centavos: 3499,
    precoB2B_centavos: 1899,
    apisIncluidas: ["pld-pj", "cnpj-completo"],
    custoApiReal_centavos: 682,
    icon: "ShieldAlert",
  },
  {
    id: "juridico-radar-pf",
    categoria: "cpf",
    nome: "Radar Jurídico",
    descricao: "Processos, protestos e dívidas com órgãos públicos num relatório só.",
    bullets: [
      "Processos judiciais (tribunal, assunto, partes)",
      "Protesto nacional em cartório",
      "CADIN — dívidas com órgãos federais",
      "Dívida ativa da União (PGFN)",
    ],
    publicoAlvo: "Advogado, analista de crédito e quem vai fechar contrato de valor alto.",
    precoB2C_centavos: 3990,
    precoB2B_centavos: 2190,
    apisIncluidas: ["processos-judiciais-pf", "protesto-nacional", "cadin", "cert-divida-ativa-pf", "cpf-simples"],
    custoApiReal_centavos: 622,
    icon: "Scale",
  },
  {
    id: "juridico-protesto-pf",
    categoria: "cpf",
    nome: "Protesto Nacional",
    descricao: "Títulos protestados em cartório em todo o país.",
    bullets: [
      "Cartórios com protesto ativo",
      "Valor e data do título",
      "UF e comarca",
      "Situação atual",
    ],
    publicoAlvo: "Análise de crédito, venda a prazo e locação.",
    precoB2C_centavos: 1999,
    precoB2B_centavos: 1099,
    apisIncluidas: ["protesto-nacional", "cpf-simples"],
    custoApiReal_centavos: 387,
    icon: "FileWarning",
  },
  {
    id: "juridico-cadin-pf",
    categoria: "cpf",
    nome: "CADIN — dívidas federais",
    descricao: "Pendências com órgãos e entidades federais, em tempo real.",
    bullets: [
      "Órgão credor",
      "Situação da pendência",
      "Data do registro",
    ],
    publicoAlvo: "Quem precisa comprovar regularidade pra contrato público ou financiamento.",
    precoB2C_centavos: 1299,
    precoB2B_centavos: 699,
    apisIncluidas: ["cadin", "cpf-simples"],
    custoApiReal_centavos: 99,
    icon: "FileWarning",
  },
];


// -------------------------------------------------------------------------
// LOCAL / CEP (geomarketing)
//
// Cada endpoint mercado-* custa centavos e sozinho nao vale nada. O produto
// e' o RELATORIO consolidado — e PDF e' exatamente o que a Capivara faz bem.
// Nenhum concorrente de consulta oferece isso.
// -------------------------------------------------------------------------

export const PRODUTOS_LOCAL: ProdutoAvulso[] = [
  {
    id: "local-raio-x-cep",
    categoria: "cep",
    nome: "Raio-X do CEP",
    descricao: "Quem mora ali, quanto ganha e no que gasta — o perfil do entorno.",
    bullets: [
      "População, domicílios, gênero e faixas etárias",
      "Renda média estimada da região",
      "Gasto estimado em 11 categorias (alimentação, saúde, educação, transporte...)",
      "Índice de infraestrutura urbana e qualidade de vida",
      "Indicadores de crescimento econômico e urbanístico",
    ],
    publicoAlvo: "Quem vai abrir negócio, escolher bairro ou dimensionar campanha por região.",
    precoB2C_centavos: 2990,
    precoB2B_centavos: 1590,
    apisIncluidas: [
      "mercado-sociodemografico",
      "mercado-gastos-alimentacao",
      "mercado-gastos-consumo",
      "mercado-gastos-diversos",
      "mercado-gastos-educacao",
      "mercado-gastos-habitacao",
      "mercado-gastos-higiene",
      "mercado-gastos-recreacao",
      "mercado-gastos-saude",
      "mercado-gastos-servicos",
      "mercado-gastos-transporte",
      "mercado-gastos-vestuario",
      "mercado-infraestrutura",
      "mercado-macroeconomicos",
    ],
    custoApiReal_centavos: 183,
    icon: "MapPin",
  },
  {
    id: "local-ponto-comercial",
    categoria: "cep",
    nome: "Estudo de Ponto Comercial",
    descricao: "Vale abrir aqui? Perfil do público, concorrência e risco da região.",
    bullets: [
      "Tudo do Raio-X do CEP",
      "Score de concorrência por segmento",
      "Risco geográfico e indicadores de colisão automotiva",
      "Propensão da região a seguros e planos",
      "Leitura consolidada pra decisão de ponto",
    ],
    publicoAlvo: "Franqueado, lojista e corretor decidindo onde abrir ou investir.",
    precoB2C_centavos: 4990,
    precoB2B_centavos: 2690,
    apisIncluidas: [
      "mercado-sociodemografico",
      "mercado-gastos-alimentacao",
      "mercado-gastos-consumo",
      "mercado-gastos-diversos",
      "mercado-gastos-educacao",
      "mercado-gastos-habitacao",
      "mercado-gastos-higiene",
      "mercado-gastos-recreacao",
      "mercado-gastos-saude",
      "mercado-gastos-servicos",
      "mercado-gastos-transporte",
      "mercado-gastos-vestuario",
      "mercado-infraestrutura",
      "mercado-macroeconomicos",
      "mercado-concorrencia",
      "mercado-risco-geografico",
      "mercado-propensao-seguro",
    ],
    custoApiReal_centavos: 267,
    icon: "Store",
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
    precoB2B_centavos: 4590,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "leilao",
      "foto-leilao",
      "historico-roubo-furto",
    ],
    custoApiEstimado_centavos: 2701,
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
    custoApiEstimado_centavos: 2977,
  },
  {
    id: "leilao-auctioneer",
    categoria: "veicular",
    nome: "Auctioneer Total",
    destaque: "premium",
    descricao: "Pre-Lance + Pos-Compra + Vip Car tecnico. Pra revendedor profissional.",
    precoB2C_centavos: 24990,
    precoB2B_centavos: 15990,
    apisIncluidas: [
      "placa-basica",
      "fipe",
      "leilao",
      "foto-leilao",
      "historico-roubo-furto",
      "certificado-seguranca-veicular",
      "crlv",
      "gravame",
      "vip-car",
    ],
    custoApiEstimado_centavos: 9101,
  },
];

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

export const TODOS_PRODUTOS_AVULSO: ProdutoAvulso[] = [
  ...PRODUTOS_VEICULAR_AVULSO,
  ...PRODUTOS_LEILAO_AVULSO,
  ...PRODUTOS_CPF_AVULSO,
  ...PRODUTOS_CNPJ_AVULSO,
  ...PRODUTOS_CERTIDAO,
  ...PRODUTOS_COMPLIANCE,
  ...PRODUTOS_LOCAL,
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
