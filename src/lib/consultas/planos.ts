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
    descricao: "Dados cadastrais basicos. Pra confirmar identidade rapido.",
    precoB2C_centavos: 990,
    custoFolhasB2B: 6,
    apisIncluidas: ["cpf-simples"],
    custoApiEstimado_centavos: 5,
  },
  {
    id: "cpf-investigacao",
    categoria: "cpf",
    nome: "Investigação",
    descricao: "Cadastro + enderecos, telefones, emails, parentes, empresas.",
    precoB2C_centavos: 1990,
    custoFolhasB2B: 12,
    apisIncluidas: ["cpf-completo"],
    custoApiEstimado_centavos: 40,
  },
  {
    id: "cpf-avancada",
    categoria: "cpf",
    nome: "Avançada",
    destaque: "popular",
    descricao: "Ultra completo + score + dividas Boa Vista + protestos.",
    precoB2C_centavos: 3990,
    custoFolhasB2B: 25,
    apisIncluidas: ["cpf-ultra-completo", "cred-completa-plus", "boa-vista-essencial"],
    custoApiEstimado_centavos: 598,
  },
  {
    id: "cpf-premium",
    categoria: "cpf",
    nome: "Premium",
    descricao: "Avancada + Serasa Premium + Certidao Trabalhista + QUOD.",
    precoB2C_centavos: 7990,
    custoFolhasB2B: 50,
    apisIncluidas: ["cpf-ultra-completo", "serasa-premium", "cnd-trabalhista", "quod"],
    custoApiEstimado_centavos: 1718,
  },
  {
    id: "cpf-raio-x",
    categoria: "cpf",
    nome: "Raio-X",
    destaque: "premium",
    descricao: "Capivara total: SPC + SCR BACEN + busca por documentos + tudo acima.",
    precoB2C_centavos: 12990,
    custoFolhasB2B: 85,
    apisIncluidas: [
      "cpf-ultra-completo",
      "serasa-premium",
      "spc-brasil",
      "scr-bacen",
      "cnd-trabalhista",
      "busca-por-documentos",
    ],
    custoApiEstimado_centavos: 3217,
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
    descricao: "Espiadinha + CPF Completo dos socios + Trabalhista da empresa.",
    precoB2C_centavos: 4990,
    custoFolhasB2B: 32,
    apisIncluidas: ["cnpj-completo", "cpf-ultra-socios", "cnd-trabalhista"],
    custoApiEstimado_centavos: 874,
  },
  {
    id: "cnpj-premium",
    categoria: "cnpj",
    nome: "Premium",
    descricao: "Cred Plus + Serasa dos socios + historico fiscal.",
    precoB2C_centavos: 9990,
    custoFolhasB2B: 65,
    apisIncluidas: ["cnpj-completo", "cpf-ultra-socios", "cnd-trabalhista", "cred-completa-plus"],
    custoApiEstimado_centavos: 2212,
  },
  {
    id: "cnpj-total",
    categoria: "cnpj",
    nome: "Total",
    destaque: "premium",
    descricao: "Tudo + analise de risco + protestos + SCR dos socios.",
    precoB2C_centavos: 14990,
    custoFolhasB2B: 99,
    apisIncluidas: [
      "cnpj-completo",
      "cpf-ultra-socios",
      "cnd-trabalhista",
      "cred-completa-plus",
      "serasa-socios",
      "scr-bacen-socios",
    ],
    custoApiEstimado_centavos: 3872,
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
