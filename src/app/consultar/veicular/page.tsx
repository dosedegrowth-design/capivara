import type { Metadata } from "next";
import { Car, Store, Wrench, ShieldAlert } from "lucide-react";

import { CategoriaLanding } from "@/components/marketing/categoria-landing";
import { PLANOS_VEICULAR } from "@/lib/consultas/planos";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Consulta veicular online · Placa, leilão, sinistro e multas · Capivara",
  description:
    "Puxe a capivara da placa antes de comprar o carro usado. Histórico de leilão, sinistro, roubo, multas, débitos e recalls. PDF assinado, a partir de R$ 14,90.",
  keywords: [
    "consulta veicular",
    "consultar placa",
    "histórico veicular",
    "carro de leilão",
    "carro sinistrado",
    "carro roubado consulta",
    "débitos veículo",
    "multas veículo",
    "capivara placa",
  ],
  alternates: { canonical: `${SITE}/consultar/veicular` },
  openGraph: {
    title: "Consulta veicular online · Capivara",
    description:
      "Histórico completo da placa: leilão, sinistro, multas, débitos. PDF assinado em segundos.",
    url: `${SITE}/consultar/veicular`,
    type: "website",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630 }],
  },
};

export default function VeicularLandingPage() {
  return (
    <>
      <CategoriaLanding
        content={{
          categoria: "veicular",
          h1: "Puxe a capivara da placa antes de comprar usado.",
          subheadline:
            "Leilão, sinistro, roubo, multas, débitos e recall. Tudo que o vendedor não te conta sobre a história do carro. Em segundos, com PDF baixável.",
          badgeText: "Consulta veicular · placa",
          mascotPose: "investigando",
          useCases: [
            {
              icon: Car,
              title: "Comprador particular",
              description:
                "Antes de fechar com o vendedor: histórico de leilão, sinistro, débitos e recall pendente.",
            },
            {
              icon: Store,
              title: "Revenda & multimarcas",
              description:
                "Análise rápida pra avaliação de troca. Saiba o que está comprando antes de aceitar.",
            },
            {
              icon: Wrench,
              title: "Oficina & seguradora",
              description:
                "Histórico de sinistro pra precificação correta e análise de cobertura.",
            },
            {
              icon: ShieldAlert,
              title: "Locação & frota",
              description:
                "Verificação antes de locar pra cliente novo ou comprar veículo pra frota corporativa.",
            },
          ],
          niveis: [
            {
              nome: "Espiadinha",
              bullets: [
                "Marca, modelo e ano",
                "Cor, combustível, chassi",
                "Município de emplacamento",
                "Indicação se há restrição básica",
              ],
            },
            {
              nome: "Completa",
              bullets: [
                "Tudo da Espiadinha",
                "Histórico de proprietários",
                "Débitos de IPVA",
                "Multas em aberto",
                "Licenciamento atualizado?",
              ],
            },
            {
              nome: "Avançada",
              bullets: [
                "Tudo da Completa",
                "Histórico de sinistro",
                "Histórico de leilão",
                "Bloqueio judicial e administrativo",
                "Indícios de adulteração",
              ],
            },
            {
              nome: "Premium",
              bullets: [
                "Tudo da Avançada",
                "Recall pendente do fabricante",
                "Histórico Renajud",
                "Restrição financeira (alienação)",
                "Histórico de roubo/furto",
                "Pareceres de oficina credenciada",
              ],
            },
            {
              nome: "Total",
              bullets: [
                "Tudo do Premium",
                "Análise FIPE (preço justo)",
                "Score de risco do veículo",
                "KM histórico (anti-fraude odômetro)",
                "Pareceres de seguradora",
                "Histórico completo de transferência",
              ],
            },
          ],
          faq: [
            {
              q: "Por que consultar a placa antes de comprar usado?",
              a: "Vendedor não é obrigado a contar tudo. Carro de leilão recuperado, ex-sinistrado, com débito ou recall pendente vale 30-50% menos. Uma consulta de R$ 14,90 evita prejuízo de milhares.",
            },
            {
              q: "O carro está em meu nome — posso consultar gratuitamente?",
              a: "Alguns dados básicos (situação, débitos) sim, no site do Detran. Mas histórico de leilão, sinistro e Renajud vêm de bases pagas. A Capivara consolida tudo em um único PDF.",
            },
            {
              q: "Funciona pra moto, caminhão e ônibus?",
              a: "Sim. A consulta veicular cobre todos os tipos: carros, motos, caminhões, vans, ônibus e veículos especiais. Mesmo formato de relatório.",
            },
            {
              q: "Se eu não souber o ano do carro, dá pra consultar?",
              a: "Sim — você só precisa da placa. O ano, modelo, marca e combustível vem do banco do Denatran/Detran.",
            },
            {
              q: "O QR Code no PDF serve pra quê?",
              a: "Validação. Quem receber o PDF (comprador, oficina, seguradora) pode escanear e confirmar que o documento é autêntico, gerado por nós, naquela data. Útil em negociação e em processo judicial.",
            },
            {
              q: "Posso consultar várias placas de uma vez (frota)?",
              a: "Sim. Empresas usam nossa API B2B com idempotência por external_reference. Cobrança por consulta (créditos prepagos, R$ por chamada). Veja em /api-publica.",
            },
          ],
          planos: PLANOS_VEICULAR,
          planoMaisBarato: PLANOS_VEICULAR[0],
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Consulta veicular online",
            description:
              "Histórico veicular completo: leilão, sinistro, multas, débitos e recall. PDF assinado em segundos.",
            brand: { "@type": "Brand", name: "Capivara" },
            offers: PLANOS_VEICULAR.map((p) => ({
              "@type": "Offer",
              name: p.nome,
              description: p.descricao,
              price: (p.precoB2C_centavos / 100).toFixed(2),
              priceCurrency: "BRL",
              availability: "https://schema.org/InStock",
            })),
          }),
        }}
      />
    </>
  );
}
