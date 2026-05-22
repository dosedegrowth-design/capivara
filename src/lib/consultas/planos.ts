/**
 * Catalogo oficial dos planos Capivara — fonte da verdade para frontend, checkout e PDF.
 *
 * Os precos em B2C sao em centavos (BRL).
 * O custo_folhas em B2B representa quantos creditos (folhas) o plano consome.
 *
 * Nomes oficiais do brandbook:
 *  B2C: Espiadinha, Investigacao, Avancada, Premium, Raio-X
 *  B2B: pacotes Manada (Start, Pro, Plus, Master, Corporate)
 */

export type CategoriaConsulta = "cpf" | "cnpj" | "veicular";

export interface Plano {
  id: string;
  categoria: CategoriaConsulta;
  nome: string;
  descricao: string;
  destaque?: "popular" | "premium";
  precoB2C_centavos: number;
  custoFolhasB2B: number;
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
    custoFolhasB2B: 6,
    apisIncluidas: ["cpf-simples"],
    custoApiEstimado_centavos: 5,
  },
  {
    id: "cpf-investigacao",
    categoria: "cpf",
    nome: "Investigação",
    descricao: "Quem e a pessoa: identidade + contatos + vinculos + score basico.",
    precoB2C_centavos: 1990,
    custoFolhasB2B: 12,
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
    custoFolhasB2B: 25,
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
    custoFolhasB2B: 50,
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
    custoFolhasB2B: 85,
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
    custoFolhasB2B: 5,
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
    custoFolhasB2B: 32,
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
    custoFolhasB2B: 65,
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
    custoFolhasB2B: 99,
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
    custoFolhasB2B: 6,
    apisIncluidas: ["placa-basica", "fipe"],
    custoApiEstimado_centavos: 17,
  },
  {
    id: "veicular-completo",
    categoria: "veicular",
    nome: "Completo",
    descricao: "Espiadinha + BIN Nacional + Recall.",
    precoB2C_centavos: 2990,
    custoFolhasB2B: 19,
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
    custoFolhasB2B: 39,
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
    custoFolhasB2B: 75,
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
    precoB2C_centavos: 19990,
    custoFolhasB2B: 129,
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
// Pacotes Manada (B2B — recarga de folhas)
// =========================================================================

export interface PacoteManada {
  id: string;
  nome: string;
  valor_centavos: number;
  folhasBase: number;
  bonusPercent: number;
  folhasTotais: number;
  recursos: string[];
}

export const PACOTES_MANADA: PacoteManada[] = [
  {
    id: "manada-start",
    nome: "Manada Start",
    valor_centavos: 20000,
    folhasBase: 200,
    bonusPercent: 20,
    folhasTotais: 240,
    recursos: ["Ate 3 usuarios", "Historico unificado", "NF-e emitida"],
  },
  {
    id: "manada-pro",
    nome: "Manada Pro",
    valor_centavos: 50000,
    folhasBase: 500,
    bonusPercent: 30,
    folhasTotais: 650,
    recursos: ["Ate 10 usuarios", "Exportacao CSV/PDF", "API REST", "NF-e"],
  },
  {
    id: "manada-plus",
    nome: "Manada Plus",
    valor_centavos: 100000,
    folhasBase: 1000,
    bonusPercent: 40,
    folhasTotais: 1400,
    recursos: ["Ate 25 usuarios", "Webhooks", "Cache estendido 7d", "Suporte prioritario"],
  },
  {
    id: "manada-master",
    nome: "Reserva Capivara",
    valor_centavos: 300000,
    folhasBase: 3000,
    bonusPercent: 50,
    folhasTotais: 4500,
    recursos: ["Usuarios ilimitados", "SLA dedicado", "Cache 7d", "Account manager"],
  },
];
