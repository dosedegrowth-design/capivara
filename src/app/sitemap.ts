import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog/posts";
import {
  PLANOS_CPF,
  PLANOS_CNPJ,
  PLANOS_VEICULAR,
  COMBOS_LEILAO,
  PRODUTOS_VEICULAR_AVULSO,
  PRODUTOS_LEILAO_AVULSO,
} from "@/lib/consultas/planos";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

/**
 * Converte o id do plano (`cpf-espiadinha`) na URL real
 * (`/consultar/cpf/espiadinha`). A rota usa o sufixo apos o
 * primeiro hifen — ver src/app/consultar/[categoria]/[plano]/page.tsx.
 */
function planoUrlSuffix(id: string): { categoria: string; slug: string } | null {
  const idx = id.indexOf("-");
  if (idx === -1) return null;
  return {
    categoria: id.slice(0, idx),
    slug: id.slice(idx + 1),
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/precos`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/empresas`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/como-funciona`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/lgpd`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/contato`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/consultar`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/consultar/cpf`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/consultar/cnpj`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/consultar/veicular`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${BASE_URL}/consultar/leilao`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/api-publica`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/docs/api`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/docs/webhooks`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/casos-de-uso`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/casos-de-uso/imobiliaria`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/casos-de-uso/rh-contratacao`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/casos-de-uso/revenda-automotiva`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE_URL}/casos-de-uso/analise-credito`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    // Institucional
    { url: `${BASE_URL}/sobre`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/comparar`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/status`, lastModified: now, changeFrequency: "always", priority: 0.5 },
    { url: `${BASE_URL}/api-publica/playground`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // Documentos legais
    { url: `${BASE_URL}/legal`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/termos`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/responsabilidade-consulta`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/empresa-termos`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/api-termos`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
  ];

  // Combos: /consultar/{categoria}/{slug-suffix}
  // CPF, CNPJ, Veicular + COMBOS_LEILAO (leilao-* → /consultar/leilao/*)
  const planoCombos = [
    ...PLANOS_CPF,
    ...PLANOS_CNPJ,
    ...PLANOS_VEICULAR,
    ...COMBOS_LEILAO,
  ];

  const planoRoutes: MetadataRoute.Sitemap = planoCombos
    .map((p) => planoUrlSuffix(p.id))
    .filter((x): x is { categoria: string; slug: string } => x !== null)
    .map((s) => ({
      url: `${BASE_URL}/consultar/${s.categoria}/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  // Avulsos: /consultar/avulso/{produto.id}
  const avulsoRoutes: MetadataRoute.Sitemap = [
    ...PRODUTOS_VEICULAR_AVULSO,
    ...PRODUTOS_LEILAO_AVULSO,
  ].map((p) => ({
    url: `${BASE_URL}/consultar/avulso/${p.id}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...planoRoutes, ...avulsoRoutes, ...blogRoutes];
}
