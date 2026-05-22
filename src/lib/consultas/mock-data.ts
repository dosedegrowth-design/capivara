/**
 * Gerador de dados mockados realísticos para consultas.
 *
 * Usado enquanto a integração com API Full não está ativa.
 * Quando trocarmos pelo real, basta atualizar a Edge Function
 * process-consultation pra chamar API Full e cair na mesma estrutura.
 *
 * IMPORTANTE: nenhum dado real de pessoa é gerado.
 * Tudo placeholder + lorem-ipsum pra testes.
 */

import { findPlano } from "./planos";

export interface ConsultaResult {
  _mock: boolean;
  _generated_at: string;
  category: "cpf" | "cnpj" | "veicular";
  plan_tier: string;
  target: string;
  sections: ResultSection[];
}

export type ResultSection =
  | { id: "cadastrais"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "enderecos"; type: "list"; title: string; items: EnderecoItem[] }
  | { id: "telefones"; type: "list"; title: string; items: TelefoneItem[] }
  | { id: "emails"; type: "list"; title: string; items: string[] }
  | { id: "parentes"; type: "list"; title: string; items: ParenteItem[] }
  | { id: "empresas"; type: "list"; title: string; items: EmpresaVinculadaItem[] }
  | { id: "score"; type: "score"; title: string; bureau: string; valor: number; classe: "ALTO" | "MEDIO" | "BAIXO" | "MUITO_BAIXO"; max: number }
  | { id: "score_serasa"; type: "score"; title: string; bureau: string; valor: number; classe: "ALTO" | "MEDIO" | "BAIXO" | "MUITO_BAIXO"; max: number }
  | { id: "cred_plus"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "serasa_premium"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "quod"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "cenprot"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "spc"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "busca_documentos"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "dividas"; type: "table"; title: string; items: DividaItem[] }
  | { id: "protestos"; type: "table"; title: string; items: ProtestoItem[] }
  | { id: "cheques"; type: "table"; title: string; items: ChequeItem[] }
  | { id: "trabalhista"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "scr_bacen"; type: "table"; title: string; items: ScrItem[] }
  | { id: "veiculo_cadastrais"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "veiculo_proprietario"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "veiculo_gravame"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "veiculo_recall"; type: "list"; title: string; items: RecallItem[] }
  | { id: "veiculo_roubo_furto"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "veiculo_leilao"; type: "table"; title: string; items: LeilaoItem[] }
  | { id: "veiculo_multas"; type: "table"; title: string; items: MultaItem[] }
  | { id: "empresa_cadastrais"; type: "kv"; title: string; data: Record<string, string | null> }
  | { id: "empresa_socios"; type: "list"; title: string; items: SocioItem[] }
  | { id: "empresa_tributario"; type: "kv"; title: string; data: Record<string, string | null> };

export interface EnderecoItem {
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  tipo: "atual" | "anterior";
}

export interface TelefoneItem {
  numero: string;
  tipo: "celular" | "fixo";
  cadastro: string; // data
}

export interface ParenteItem {
  nome: string;
  vinculo: "mae" | "pai" | "irmao" | "filho" | "conjuge";
}

export interface EmpresaVinculadaItem {
  cnpj: string;
  razao_social: string;
  qualificacao: string;
  data_entrada: string;
  situacao: "ATIVA" | "BAIXADA" | "SUSPENSA";
}

export interface DividaItem {
  credor: string;
  valor_centavos: number;
  data_origem: string;
  status: "EM_ABERTO" | "QUITADA";
}

export interface ProtestoItem {
  cartorio: string;
  cidade_uf: string;
  valor_centavos: number;
  data_protesto: string;
  status: "ATIVO" | "BAIXADO";
}

export interface ChequeItem {
  banco: string;
  data: string;
  motivo: string;
}

export interface ScrItem {
  instituicao: string;
  modalidade: string;
  saldo_centavos: number;
  vencimento: string;
}

export interface SocioItem {
  cpf_mascarado: string;
  nome: string;
  qualificacao: string;
  data_entrada: string;
}

export interface RecallItem {
  campanha: string;
  fabricante: string;
  problema: string;
  status: "ATIVO" | "ATENDIDO";
}

export interface LeilaoItem {
  leiloeiro: string;
  data: string;
  motivo: string;
  cidade_uf: string;
}

export interface MultaItem {
  descricao: string;
  data: string;
  local: string;
  valor_centavos: number;
  pontos: number;
  status: "EM_ABERTO" | "PAGA";
}

// ============================================================
// Geradores específicos por plano
// ============================================================

function mockEndereco(tipo: "atual" | "anterior"): EnderecoItem {
  const ruas = ["Rua das Capivaras", "Av. Brasil", "R. das Acácias", "Av. Paulista", "R. dos Pinheiros"];
  const bairros = ["Vila Madalena", "Pinheiros", "Moema", "Itaim Bibi", "Vila Mariana"];
  return {
    logradouro: ruas[Math.floor(Math.random() * ruas.length)],
    numero: String(Math.floor(Math.random() * 9999) + 1),
    bairro: bairros[Math.floor(Math.random() * bairros.length)],
    cidade: "São Paulo",
    uf: "SP",
    cep: `0${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 900) + 100}`,
    tipo,
  };
}

function generateCPFSections(planTier: string, cpf: string): ResultSection[] {
  const sections: ResultSection[] = [];

  // Todos os planos: dados cadastrais
  sections.push({
    id: "cadastrais",
    type: "kv",
    title: "Dados cadastrais",
    data: {
      Nome: "[Dados mockados — aguardando API Full]",
      CPF: cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4"),
      "Data de nascimento": "12/03/1985",
      "Nome da mãe": "Maria Silva Santos",
      "Situação do CPF": "REGULAR",
      "Última atualização Receita": "01/05/2026",
    },
  });

  if (planTier === "cpf-espiadinha") return sections;

  // Investigação +: endereços, telefones, emails, parentes, empresas
  sections.push({
    id: "enderecos",
    type: "list",
    title: "Endereços",
    items: [mockEndereco("atual"), mockEndereco("anterior")],
  });

  sections.push({
    id: "telefones",
    type: "list",
    title: "Telefones",
    items: [
      { numero: "(11) 99999-1234", tipo: "celular", cadastro: "2024-01-15" },
      { numero: "(11) 3333-5678", tipo: "fixo", cadastro: "2020-06-10" },
    ],
  });

  sections.push({
    id: "emails",
    type: "list",
    title: "E-mails associados",
    items: ["m.silva.santos@email.com", "marisilva@outro.com.br"],
  });

  sections.push({
    id: "parentes",
    type: "list",
    title: "Parentes diretos",
    items: [
      { nome: "Maria Silva Santos", vinculo: "mae" },
      { nome: "João Carlos Santos", vinculo: "pai" },
      { nome: "Pedro Santos", vinculo: "irmao" },
    ],
  });

  sections.push({
    id: "empresas",
    type: "list",
    title: "Empresas vinculadas",
    items: [
      {
        cnpj: "12.345.678/0001-90",
        razao_social: "Capivara Comércio LTDA",
        qualificacao: "Sócio-administrador",
        data_entrada: "2018-03-15",
        situacao: "ATIVA",
      },
    ],
  });

  // Investigação: já inclui Boa Vista básico
  sections.push({
    id: "score",
    type: "score",
    title: "Score Boa Vista",
    bureau: "Boa Vista",
    valor: 612,
    max: 1000,
    classe: "MEDIO",
  });

  if (planTier === "cpf-investigacao") return sections;

  // Avançada +: Serasa Básico + Cred Plus + dividas detalhadas + protestos
  sections.push({
    id: "score_serasa",
    type: "score",
    title: "Score Serasa",
    bureau: "Serasa",
    valor: 587,
    max: 1000,
    classe: "MEDIO",
  });

  sections.push({
    id: "cred_plus",
    type: "kv",
    title: "Cred Plus — Análise consolidada",
    data: {
      "Classificação de risco": "MÉDIO",
      "Probabilidade de inadimplência 12m": "18%",
      "Recomendação": "Aprovar com garantia",
      "Limite sugerido": "R$ 3.500,00",
    },
  });

  sections.push({
    id: "dividas",
    type: "table",
    title: "Pendências financeiras (Serasa + Boa Vista)",
    items: [
      {
        credor: "Banco Capivara S.A.",
        valor_centavos: 85000,
        data_origem: "2024-08-10",
        status: "EM_ABERTO",
      },
      {
        credor: "Loja XPTO",
        valor_centavos: 24700,
        data_origem: "2023-12-20",
        status: "EM_ABERTO",
      },
    ],
  });

  sections.push({
    id: "protestos",
    type: "table",
    title: "Protestos cartoriais",
    items: [],
  });

  if (planTier === "cpf-avancada") return sections;

  // Premium +: Serasa Premium (relatório detalhado) + trabalhista + QUOD + cheques + Cenprot
  sections.push({
    id: "serasa_premium",
    type: "kv",
    title: "Serasa Premium — Relatório detalhado",
    data: {
      "Score Serasa": "587 (MÉDIO)",
      "Histórico negativo 5 anos": "2 ocorrências",
      "Consultas em 90 dias": "4 instituições",
      "Cadastro positivo": "ATIVO",
      "Cheques sem fundo": "Nenhum",
      "Cheques sustados": "Nenhum",
    },
  });

  sections.push({
    id: "cheques",
    type: "table",
    title: "Cheques sem fundo / sustados",
    items: [],
  });

  sections.push({
    id: "trabalhista",
    type: "kv",
    title: "Certidão Negativa de Débitos Trabalhistas (CNDT)",
    data: {
      Status: "NEGATIVA",
      Emitida: "20/05/2026",
      Validade: "180 dias",
    },
  });

  sections.push({
    id: "quod",
    type: "kv",
    title: "QUOD — Cadastro positivo",
    data: {
      "Score QUOD": "640 (MÉDIO)",
      "Pontuação positiva": "Bom pagador em 8 contratos",
      "Renda presumida": "R$ 4.800,00 - R$ 6.200,00",
      "Comprometimento de renda": "32%",
    },
  });

  sections.push({
    id: "cenprot",
    type: "kv",
    title: "Cenprot — Protestos nacionais",
    data: {
      "Total de protestos": "0",
      "Cartórios consultados": "Todos os estados",
    },
  });

  if (planTier === "cpf-premium") return sections;

  // Raio-X +: SPC, SCR BACEN, busca por documentos
  sections.push({
    id: "spc",
    type: "kv",
    title: "SPC Brasil — Relatório completo",
    data: {
      "Score SPC": "595 (MÉDIO)",
      "Pendências SPC": "1 registro",
      "Ações cíveis": "Nenhuma",
      "Cheques SPC": "Nenhum",
    },
  });

  sections.push({
    id: "scr_bacen",
    type: "table",
    title: "Operações SCR BACEN (Banco Central)",
    items: [
      {
        instituicao: "Banco do Brasil",
        modalidade: "Empréstimo pessoal",
        saldo_centavos: 1250000,
        vencimento: "2028-03-15",
      },
      {
        instituicao: "Itaú",
        modalidade: "Cartão de crédito",
        saldo_centavos: 320000,
        vencimento: "2026-06-30",
      },
    ],
  });

  sections.push({
    id: "busca_documentos",
    type: "kv",
    title: "Busca reversa por documentos",
    data: {
      "RG": "12.345.678-9 (SP)",
      "CNH": "Categoria B, vigente até 2030",
      "CIN (nova ID)": "Em processo de emissão",
      "Título de eleitor": "Zona 042, Seção 0123",
    },
  });

  return sections;
}

function generateCNPJSections(planTier: string, cnpj: string): ResultSection[] {
  const sections: ResultSection[] = [];

  sections.push({
    id: "empresa_cadastrais",
    type: "kv",
    title: "Dados da empresa",
    data: {
      "Razão social": "Capivara Comércio e Serviços LTDA",
      "Nome fantasia": "Capivara",
      CNPJ: cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5"),
      "Situação cadastral": "ATIVA",
      "Data de abertura": "10/03/2018",
      "Capital social": "R$ 100.000,00",
      "Natureza jurídica": "Sociedade Empresária Limitada",
      "CNAE principal": "47.21-1-02 - Comércio varejista",
      Porte: "Empresa de Pequeno Porte (EPP)",
    },
  });

  if (planTier === "cnpj-espiadinha") return sections;

  // + Sócios
  sections.push({
    id: "empresa_socios",
    type: "list",
    title: "Quadro de sócios",
    items: [
      {
        cpf_mascarado: "123.***.***-45",
        nome: "Marina Silva Santos",
        qualificacao: "Sócio-administrador",
        data_entrada: "2018-03-15",
      },
      {
        cpf_mascarado: "987.***.***-21",
        nome: "Pedro Almeida Costa",
        qualificacao: "Sócio",
        data_entrada: "2018-03-15",
      },
    ],
  });

  sections.push({
    id: "trabalhista",
    type: "kv",
    title: "Certidão Negativa de Débitos Trabalhistas",
    data: { Status: "NEGATIVA", Emitida: "20/05/2026", Validade: "180 dias" },
  });

  if (planTier === "cnpj-socios") return sections;

  // Premium + Total: score, fiscal, protestos
  sections.push({
    id: "score",
    type: "score",
    title: "Score empresarial Serasa",
    bureau: "Serasa",
    valor: 720,
    max: 1000,
    classe: "ALTO",
  });

  sections.push({
    id: "empresa_tributario",
    type: "kv",
    title: "Situação tributária e fiscal",
    data: {
      "Regime tributário": "Lucro Presumido",
      "Optante Simples": "Não",
      "Débitos federais": "REGULAR",
      "Débitos estaduais": "REGULAR",
      "Inscrição estadual": "ATIVA",
    },
  });

  return sections;
}

function generateVeicularSections(planTier: string, placa: string): ResultSection[] {
  const sections: ResultSection[] = [];

  sections.push({
    id: "veiculo_cadastrais",
    type: "kv",
    title: "Dados do veículo",
    data: {
      Placa: placa,
      Marca: "Volkswagen",
      Modelo: "Golf 1.4 TSI Highline",
      "Ano fabricação": "2022",
      "Ano modelo": "2023",
      Cor: "Prata",
      Combustível: "Flex",
      Chassi: "9BWHE21JX24060960",
      "Município/UF": "São Paulo / SP",
      "Valor Fipe": "R$ 145.000,00",
    },
  });

  if (planTier === "veicular-espiadinha") return sections;

  sections.push({
    id: "veiculo_recall",
    type: "list",
    title: "Recall ativo",
    items: [],
  });

  if (planTier === "veicular-completo") return sections;

  // Avançado +: proprietário, gravame, roubo/furto
  sections.push({
    id: "veiculo_proprietario",
    type: "kv",
    title: "Proprietário atual",
    data: {
      Nome: "Marina Silva Santos",
      Documento: "123.***.***-45",
      Cidade: "São Paulo / SP",
      "Data de aquisição": "15/06/2023",
    },
  });

  sections.push({
    id: "veiculo_gravame",
    type: "kv",
    title: "Gravame / Alienação",
    data: {
      Status: "SEM GRAVAME",
      Financiadora: null,
      "Valor financiado": null,
    },
  });

  sections.push({
    id: "veiculo_roubo_furto",
    type: "kv",
    title: "Histórico de roubo e furto",
    data: {
      Status: "NADA CONSTA",
      "Boletim de ocorrência": null,
    },
  });

  if (planTier === "veicular-avancado") return sections;

  // Premium +: leilão + multas
  sections.push({
    id: "veiculo_leilao",
    type: "table",
    title: "Histórico de leilão",
    items: [],
  });

  sections.push({
    id: "veiculo_multas",
    type: "table",
    title: "Multas e infrações (RENAINF)",
    items: [
      {
        descricao: "Excesso de velocidade (até 20%)",
        data: "2025-09-12",
        local: "Av. 23 de Maio - SP",
        valor_centavos: 19510,
        pontos: 4,
        status: "PAGA",
      },
    ],
  });

  return sections;
}

// ============================================================
// API pública
// ============================================================

export function generateMockResult(
  category: "cpf" | "cnpj" | "veicular",
  planTier: string,
  target: string
): ConsultaResult {
  const plano = findPlano(planTier);
  if (!plano) {
    throw new Error(`Plano nao encontrado: ${planTier}`);
  }

  let sections: ResultSection[] = [];
  if (category === "cpf") sections = generateCPFSections(planTier, target);
  if (category === "cnpj") sections = generateCNPJSections(planTier, target);
  if (category === "veicular") sections = generateVeicularSections(planTier, target);

  return {
    _mock: true,
    _generated_at: new Date().toISOString(),
    category,
    plan_tier: planTier,
    target,
    sections,
  };
}
