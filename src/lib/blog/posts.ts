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
];

export function findPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
