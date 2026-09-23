/**
 * Estrutura do menu do site.
 *
 * Mora aqui, e nao dentro do header, por dois motivos: `npm run validar`
 * confere que todo href existe (menu que aponta pra 404 ja aconteceu duas
 * vezes neste projeto), e as landings podem reusar os mesmos agrupamentos.
 *
 * Os destaques sao curadoria comercial — nao e o catalogo inteiro. Quem quer
 * tudo vai em "Tudo" (/consultar), que lista as 67 consultas com busca.
 */

export interface ItemMenu {
  href: string;
  label: string;
  /** Uma linha abaixo do label no dropdown. */
  hint?: string;
}

export interface SecaoMenu {
  titulo: string;
  itens: ItemMenu[];
}

export interface EntradaMenu {
  label: string;
  /** Pra onde vai o proprio topo do menu (clicar no rotulo). */
  href: string;
  /** Sem secoes = link simples, sem dropdown. */
  secoes?: SecaoMenu[];
}

export const MENU_PRINCIPAL: EntradaMenu[] = [
  {
    label: "CPF",
    href: "/consultar/cpf",
    secoes: [
      {
        titulo: "Consultar pessoa",
        itens: [
          { href: "/consultar/cpf", label: "Planos de CPF", hint: "Do básico ao Raio-X completo" },
          { href: "/consultar/certidoes", label: "Certidões PF", hint: "PGFN, CNDT, antecedentes" },
          { href: "/consultar/compliance", label: "Compliance & KYC", hint: "PEP, sanções, processos" },
        ],
      },
      {
        titulo: "Só um dado",
        itens: [
          { href: "/consultar/avulso/cpf-avulso-antecedentes", label: "Antecedentes criminais" },
          { href: "/consultar/avulso/cpf-avulso-processos", label: "Processos judiciais" },
          { href: "/consultar/avulso/cpf-avulso-financeiro", label: "Renda e patrimônio" },
          { href: "/consultar/avulso/cpf-avulso-vinculos", label: "Vínculos e parentes" },
        ],
      },
    ],
  },
  {
    label: "CNPJ",
    href: "/consultar/cnpj",
    secoes: [
      {
        titulo: "Consultar empresa",
        itens: [
          { href: "/consultar/cnpj", label: "Planos de CNPJ", hint: "Situação, sócios e crédito" },
          { href: "/consultar/certidoes", label: "Certidões PJ", hint: "Kit pra licitação" },
          { href: "/consultar/compliance", label: "Compliance & KYC", hint: "Due diligence de fornecedor" },
        ],
      },
      {
        titulo: "Só um dado",
        itens: [
          { href: "/consultar/avulso/cnpj-avulso-socios", label: "Quadro societário" },
          { href: "/consultar/avulso/cnpj-avulso-processos", label: "Processos da empresa" },
          { href: "/consultar/avulso/cnpj-avulso-sintegra", label: "Sintegra" },
          { href: "/consultar/avulso/cnpj-avulso-veiculos", label: "Frota da empresa" },
        ],
      },
    ],
  },
  {
    label: "Veicular",
    href: "/consultar/veicular",
    secoes: [
      {
        titulo: "Consultar veículo",
        itens: [
          { href: "/consultar/veicular", label: "Planos veiculares", hint: "Antes de comprar ou vender" },
          { href: "/consultar/leilao", label: "Leilão", hint: "Sinistro, monta e foto do pátio" },
        ],
      },
      {
        titulo: "Só um dado",
        itens: [
          { href: "/consultar/avulso/veicular-avulso-fipe", label: "Tabela FIPE" },
          { href: "/consultar/avulso/veicular-avulso-gravame", label: "Gravame / alienação" },
          { href: "/consultar/avulso/veicular-avulso-debitos", label: "Multas e débitos" },
          { href: "/consultar/avulso/veicular-avulso-recall", label: "Recall pendente" },
          { href: "/consultar/avulso/veicular-avulso-proprietario", label: "Proprietário atual" },
        ],
      },
    ],
  },
  {
    label: "Certidões",
    href: "/consultar/certidoes",
    secoes: [
      {
        titulo: "Kits",
        itens: [
          { href: "/consultar/avulso/certidao-kit-pj-licitacao", label: "Kit PJ — Licitação", hint: "O que o edital pede" },
          { href: "/consultar/avulso/certidao-kit-pf-essencial", label: "Kit PF — Essencial" },
          { href: "/consultar/avulso/certidao-kit-pj-completo", label: "Kit PJ — Completo" },
          { href: "/consultar/avulso/certidao-kit-pf-completo", label: "Kit PF — Completo" },
        ],
      },
      {
        titulo: "Avulsas",
        itens: [
          { href: "/consultar/avulso/certidao-pgfn-pj", label: "PGFN (empresa)" },
          { href: "/consultar/avulso/certidao-fgts-pj", label: "FGTS / CRF" },
          { href: "/consultar/avulso/certidao-cndt-pf", label: "CNDT (pessoa)" },
          { href: "/consultar/certidoes", label: "Ver todas as certidões" },
        ],
      },
    ],
  },
  {
    label: "Tudo",
    href: "/consultar",
    secoes: [
      {
        titulo: "Outras consultas",
        itens: [
          { href: "/consultar/compliance", label: "Compliance & KYC", hint: "PEP, sanções, mandados" },
          { href: "/consultar/local", label: "Raio-X do CEP", hint: "Perfil e concorrência da região" },
          { href: "/consultar", label: "Ver as 67 consultas", hint: "Catálogo completo, com busca e filtro" },
        ],
      },
      {
        titulo: "Pra quem é",
        itens: [
          { href: "/casos-de-uso/imobiliaria", label: "Imobiliária e aluguel" },
          { href: "/casos-de-uso/rh-contratacao", label: "RH e contratação" },
          { href: "/casos-de-uso/revenda-automotiva", label: "Revenda automotiva" },
          { href: "/casos-de-uso/analise-credito", label: "Análise de crédito" },
        ],
      },
    ],
  },
  { label: "Preços", href: "/precos" },
  { label: "API", href: "/api-publica" },
  { label: "Empresas", href: "/empresas" },
];

/** Todo href citado no menu (usado pelo validador). */
export function hrefsDoMenu(): string[] {
  const out: string[] = [];
  for (const e of MENU_PRINCIPAL) {
    out.push(e.href);
    for (const s of e.secoes ?? []) for (const i of s.itens) out.push(i.href);
  }
  return [...new Set(out)];
}
