import type { Metadata } from "next";
import Link from "next/link";
import { Car, Store, Wrench, ShieldAlert, ArrowRight, Gavel } from "lucide-react";

import { CategoriaLanding } from "@/components/marketing/categoria-landing";
import { HeroConsultaInput } from "@/components/marketing/hero-consulta-input";
import { ProdutoAvulsoCard } from "@/components/consulta/produto-avulso-card";
import { PlanCarousel } from "@/components/consulta/plan-carousel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PLANOS_VEICULAR,
  PRODUTOS_VEICULAR_AVULSO,
  RESUMO_INCLUI,
} from "@/lib/consultas/planos";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Consulta veicular online · Placa, leilão, sinistro e multas · Capivara",
  description:
    "Puxe a capivara da placa antes de comprar o carro usado. Histórico de leilão, sinistro, roubo, multas, débitos e recalls. PDF assinado, a partir de R$ 9,99.",
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
        hero={
          <HeroConsultaInput
            defaultCategoria="placa"
            categorias={["cpf", "cnpj", "placa"]}
            badge="Consulta veicular · placa"
            h1="Puxe a capivara da placa antes de comprar usado."
            subtitle="Leilão, sinistro, roubo, multas, débitos e recall. Tudo que o vendedor não te conta sobre a história do carro. Em segundos, com PDF baixável."
          />
        }
        planosOverride={
          <Tabs defaultValue="combos">
            <div className="flex justify-center mb-6">
              <TabsList>
                <TabsTrigger value="combos">Combos</TabsTrigger>
                <TabsTrigger value="pontual">Pontual</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="combos">
              <PlanCarousel
                planos={PLANOS_VEICULAR}
                inclui={RESUMO_INCLUI}
                cardWidth={300}
              />
            </TabsContent>

            <TabsContent value="pontual">
              <div className="grid gap-4 max-w-4xl mx-auto">
                {PRODUTOS_VEICULAR_AVULSO.map((produto) => (
                  <ProdutoAvulsoCard key={produto.id} produto={produto} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        }
        extraSection={<LeilaoCrossSell />}
        content={{
          categoria: "veicular",
          h1: "Puxe a capivara da placa antes de comprar usado.",
          subheadline:
            "Leilão, sinistro, roubo, multas, débitos e recall. Tudo que o vendedor não te conta sobre a história do carro. Em segundos, com PDF baixável.",
          badgeText: "Consulta veicular · placa",
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
              a: "Vendedor não é obrigado a contar tudo. Carro de leilão recuperado, ex-sinistrado, com débito ou recall pendente vale 30-50% menos. Uma consulta de R$ 9,99 evita prejuízo de milhares.",
            },
            {
              q: "Tem produto avulso ou só combo?",
              a: "Os dois. Na aba 'Pontual' você compra exatamente o dado que precisa (FIPE, Recall, Gravame, BIN, etc) a partir de R$ 9,99. Na aba 'Combos' você pega um plano com várias consultas já incluídas — sai mais barato se quiser cobertura ampla.",
            },
            {
              q: "Vai comprar carro de leilão?",
              a: "Tem página dedicada em /consultar/leilao com combos especificos pra pré-lance, pós-arremate e revenda profissional. Inclui foto do veículo no leilão e histórico técnico completo.",
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
            offers: [
              ...PLANOS_VEICULAR.map((p) => ({
                "@type": "Offer",
                name: p.nome,
                description: p.descricao,
                price: (p.precoB2C_centavos / 100).toFixed(2),
                priceCurrency: "BRL",
                availability: "https://schema.org/InStock",
              })),
              ...PRODUTOS_VEICULAR_AVULSO.map((p) => ({
                "@type": "Offer",
                name: p.nome,
                description: p.descricao,
                price: (p.precoB2C_centavos / 100).toFixed(2),
                priceCurrency: "BRL",
                availability: "https://schema.org/InStock",
              })),
            ],
          }),
        }}
      />
    </>
  );
}

// =========================================================================
// Cross-sell pra /consultar/leilao
// =========================================================================

function LeilaoCrossSell() {
  return (
    <section className="py-16 md:py-20 bg-paper">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-saffron/40 bg-gradient-to-br from-cream via-paper to-saffron/10 p-6 sm:p-10">
          <div className="absolute -top-16 -right-16 size-48 bg-saffron/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 size-48 bg-fur/15 rounded-full blur-3xl" />

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="size-14 rounded-xl bg-cocoa text-saffron flex items-center justify-center shrink-0">
              <Gavel className="size-7" />
            </div>

            <div className="flex-1">
              <Badge variant="outline" className="font-mono mb-2">
                Atenção · leilão veicular
              </Badge>
              <h3 className="font-display text-xl md:text-2xl font-bold text-cocoa leading-tight">
                Vai dar lance ou acabou de arrematar carro de leilão?
              </h3>
              <p className="mt-2 text-sm md:text-base text-tabaco leading-relaxed max-w-xl">
                Tem combos específicos pra pré-lance, pós-compra e revenda profissional —
                incluindo foto do veículo no leilão e histórico técnico completo.
              </p>
            </div>

            <Button asChild variant="accent" size="lg" className="shrink-0 self-start md:self-auto">
              <Link href="/consultar/leilao">
                Ver combos de leilão
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
