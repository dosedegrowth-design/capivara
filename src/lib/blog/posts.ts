/**
 * Posts do blog Capivara.
 * Estrutura simples em TS — sem MDX por enquanto.
 * Cada post tem markdown rico no `content` que renderizamos com ReactMarkdown
 * OU usamos JSX direto.
 *
 * Pra MVP: JSX direto em cada post via campo `body` (componente React).
 */

import type { ReactNode } from "react";
import { PostComoConsultarCPF } from "./posts/como-consultar-cpf";
import { PostAntesDeComprarCarro } from "./posts/antes-de-comprar-carro";
import { PostInquilino } from "./posts/verificar-inquilino";
import { PostLGPDFinalidade } from "./posts/lgpd-finalidade-consulta";
import { PostScoreCredito } from "./posts/score-credito-explicado";
import { PostCNPJDueDiligence } from "./posts/cnpj-due-diligence";
import { PostAPIIntegracao } from "./posts/api-integracao-passo-a-passo";
import { PostRecallVeicular } from "./posts/recall-veicular-checagem";

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "CPF" | "Veicular" | "Imobiliário" | "Crédito" | "LGPD";
  tags: string[];
  author: string;
  publishedAt: string; // ISO
  readingMinutes: number;
  body: () => ReactNode;
  ogImageEmoji?: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "como-consultar-cpf-online",
    title: "Como consultar CPF online em 2026 (e o que cada base mostra)",
    excerpt:
      "Guia completo para entender Serasa, SPC, Boa Vista, SCR BACEN e como combinar essas bases para uma análise confiável de crédito.",
    category: "CPF",
    tags: ["consulta cpf", "score", "boa vista", "serasa", "spc", "scr bacen"],
    author: "Time Capivara",
    publishedAt: "2026-05-15T10:00:00Z",
    readingMinutes: 7,
    body: PostComoConsultarCPF,
    ogImageEmoji: "🔍",
  },
  {
    slug: "antes-de-comprar-carro-usado-checklist",
    title: "Antes de comprar carro usado: 8 verificações que evitam dor de cabeça",
    excerpt:
      "Gravame, leilão, RENAJUD, recall ativo e roubo/furto. Checklist completo para não cair em armadilha de quem vende carro usado.",
    category: "Veicular",
    tags: ["carro usado", "gravame", "leilao", "renajud", "recall"],
    author: "Time Capivara",
    publishedAt: "2026-05-10T10:00:00Z",
    readingMinutes: 9,
    body: PostAntesDeComprarCarro,
    ogImageEmoji: "🚗",
  },
  {
    slug: "como-verificar-inquilino-antes-do-aluguel",
    title: "Como verificar inquilino antes de assinar o contrato de aluguel",
    excerpt:
      "Score, dívidas em aberto, certidões trabalhistas e finalidade LGPD: o passo-a-passo que imobiliárias profissionais seguem.",
    category: "Imobiliário",
    tags: ["aluguel", "inquilino", "score", "lgpd", "imobiliaria"],
    author: "Time Capivara",
    publishedAt: "2026-05-05T10:00:00Z",
    readingMinutes: 6,
    body: PostInquilino,
    ogImageEmoji: "🏠",
  },
  {
    slug: "lgpd-finalidade-consulta-cpf-cnpj",
    title: "LGPD na consulta de CPF e CNPJ: o que você precisa declarar",
    excerpt:
      "Toda consulta exige finalidade. Veja o que aceitar, o que evitar e como provar legítimo interesse em auditoria da ANPD.",
    category: "LGPD",
    tags: ["lgpd", "anpd", "compliance", "legitimo interesse", "consulta cpf"],
    author: "Time Capivara",
    publishedAt: "2026-05-20T10:00:00Z",
    readingMinutes: 5,
    body: PostLGPDFinalidade,
    ogImageEmoji: "🔒",
  },
  {
    slug: "score-credito-explicado-faixas",
    title: "Score de crédito explicado: faixas, cálculo e como melhorar",
    excerpt:
      "0 a 1000. Mas o que cada faixa significa e por que a mesma pessoa tem scores diferentes em Serasa e Boa Vista no mesmo dia.",
    category: "Crédito",
    tags: ["score", "credito", "serasa", "boa vista", "spc"],
    author: "Time Capivara",
    publishedAt: "2026-05-18T10:00:00Z",
    readingMinutes: 6,
    body: PostScoreCredito,
    ogImageEmoji: "📊",
  },
  {
    slug: "cnpj-due-diligence-checklist",
    title: "Due diligence de CNPJ: checklist antes de assinar contrato",
    excerpt:
      "Quadro de sócios, certidões, score empresarial, processos trabalhistas. Em 5 minutos você sabe com quem está lidando.",
    category: "CPF",
    tags: ["cnpj", "due diligence", "contrato", "fornecedor", "compliance"],
    author: "Time Capivara",
    publishedAt: "2026-05-16T10:00:00Z",
    readingMinutes: 8,
    body: PostCNPJDueDiligence,
    ogImageEmoji: "🏢",
  },
  {
    slug: "api-integracao-consulta-cpf-cnpj",
    title: "Como integrar consulta de CPF/CNPJ via API no seu sistema",
    excerpt:
      "Bearer token, idempotência, webhook HMAC. Tudo que você precisa pra automatizar consultas no seu CRM ou antifraude.",
    category: "CPF",
    tags: ["api", "integracao", "rest", "webhook", "hmac"],
    author: "Time Capivara",
    publishedAt: "2026-05-14T10:00:00Z",
    readingMinutes: 7,
    body: PostAPIIntegracao,
    ogImageEmoji: "🔌",
  },
  {
    slug: "recall-veicular-como-verificar",
    title: "Recall veicular: como verificar antes de comprar carro usado",
    excerpt:
      "40% dos recalls no Brasil ficam não atendidos. Antes de comprar, sempre confira — peça defeituosa segue rodando.",
    category: "Veicular",
    tags: ["recall", "carro usado", "seguranca", "denatran"],
    author: "Time Capivara",
    publishedAt: "2026-05-12T10:00:00Z",
    readingMinutes: 5,
    body: PostRecallVeicular,
    ogImageEmoji: "🛞",
  },
];

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
