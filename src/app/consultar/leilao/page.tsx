import type { Metadata } from "next";
import Link from "next/link";
import {
  Gavel,
  Store,
  FileSearch,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

import { HeroConsultaInput } from "@/components/marketing/hero-consulta-input";
import { ProdutoAvulsoCard } from "@/components/consulta/produto-avulso-card";
import { PlanCard } from "@/components/consulta/plan-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  COMBOS_LEILAO,
  PRODUTOS_LEILAO_AVULSO,
} from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Consulta de leilão veicular · Pré-lance, sinistro e recuperado · Capivara",
  description:
    "Vai dar lance num carro de leilão? Histórico completo antes de arrematar: pequena/média/grande monta, foto do leilão, roubo/furto e CSV. Combos a partir de R$ 79,90.",
  keywords: [
    "carro de leilão",
    "consulta leilão",
    "carro sinistrado",
    "pequena monta",
    "média monta",
    "grande monta",
    "score leilão",
    "carro recuperado",
    "foto leilão",
    "lance leilão",
    "capivara leilão",
  ],
  alternates: { canonical: `${SITE}/consultar/leilao` },
  openGraph: {
    title: "Consulta de leilão veicular · Capivara",
    description:
      "Antes de dar lance ou depois de arrematar: histórico técnico completo do carro de leilão. PDF assinado em segundos.",
    url: `${SITE}/consultar/leilao`,
    type: "website",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630 }],
  },
};

interface UseCase {
  icon: LucideIcon;
  title: string;
  description: string;
}

const USE_CASES: UseCase[] = [
  {
    icon: Gavel,
    title: "Comprador particular de leilão",
    description:
      "Antes de dar lance num leilão online: saber se vale o preço, se foi recuperado e o tipo do sinistro.",
  },
  {
    icon: Store,
    title: "Lojista de revenda",
    description:
      "Compra pra revenda: precificação, pacote técnico (BIN + Gravame + Roubo) e foto pra avaliar reforma.",
  },
  {
    icon: FileSearch,
    title: "Despachante & regularização",
    description:
      "Pós-arremate: CSV + RENAJUD + CRLV digital + Gravame consolidados num único relatório.",
  },
  {
    icon: Briefcase,
    title: "Comprador profissional",
    description:
      "Atacadista de leilão: análise técnica forte (Vip Car) + base policial cruzada pra ter certeza antes do lance.",
  },
];

const FAQ = [
  {
    q: "Carro de pequena monta dá pra circular?",
    a: "Sim. Pequena monta significa que o sinistro causou danos só estéticos — o veículo é considerado recuperável e, após laudo do Detran, volta a circular normalmente. Mas ainda assim aparece no histórico e desvaloriza 15-30%. Sempre confira no relatório a categoria exata e o status atual.",
  },
  {
    q: "Qual a diferença entre média monta e grande monta?",
    a: "Média monta envolve dano estrutural mas o veículo é recuperável (precisa de laudo técnico do Detran pra voltar a circular). Grande monta significa perda total — em tese o veículo não deveria voltar a circular, mas há histórico de fraudes. Carro classificado como grande monta exige cautela máxima.",
  },
  {
    q: "Posso transferir um carro arrematado em leilão?",
    a: "Sim, desde que esteja regular no Detran (sem bloqueio judicial, com CSV emitido após reparo se necessário, e quitando os débitos pendentes). O combo Pós-Compra inclui CSV + RENAJUD + CRLV pra confirmar que está liberado.",
  },
  {
    q: "Vou ter problema com seguradora ao tentar segurar carro de leilão?",
    a: "Algumas seguradoras recusam veículos com histórico de leilão ou sinistrados (ainda que recuperados). Outras aceitam mas com franquia majorada. Compre a consulta antes pra negociar o preço sabendo o valor real do bem.",
  },
  {
    q: "Como saber se um carro foi roubado e depois recuperado oficialmente?",
    a: "O Histórico Roubo/Furto Premium consulta múltiplas bases policiais e mostra status atualizado: ativo, recuperado oficialmente ou nada consta. Mesmo recuperado, fica registro permanente — útil pra negociar preço.",
  },
  {
    q: "A foto do leilão sempre está disponível?",
    a: "Depende. Leiloeiros maiores (Copart, Sodré Santoro, Mega Leilões, etc) costumam manter o catálogo online por anos. Pra leilões menores ou veículos arrematados há muito tempo, pode não haver foto. Se quiser garantir, recomendo o combo Pré-Lance que tenta múltiplas fontes.",
  },
];

export default function LeilaoLandingPage() {
  return (
    <div className="bg-paper">
      <HeroConsultaInput
        defaultCategoria="placa"
        categorias={["placa"]}
        variant="leilao"
        badge="Leilão veicular"
        h1="Vai dar lance num carro de leilão? Puxe a capivara antes."
        subtitle="Histórico técnico completo: pequena/média/grande monta, foto do leilão, recuperação policial e gravame. Sem surpresa após arrematar."
      />

      {/* --------------------- PRA QUEM E --------------------- */}
      <section className="py-16 md:py-20 border-y border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              Pra quem é
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Comprador, lojista ou despachante — tem combo pra cada um.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {USE_CASES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-line bg-card p-5 hover:shadow-md transition-shadow"
              >
                <div className="size-10 rounded-lg bg-fur/15 text-fur flex items-center justify-center mb-3">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display font-semibold text-cocoa mb-1">
                  {title}
                </h3>
                <p className="text-sm text-tabaco leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------- COMBOS --------------------- */}
      <section className="py-16 md:py-20 bg-paper-2 border-b border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              Combos leilão
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Pré-lance, pós-compra ou pacote completo do leiloeiro.
            </h2>
            <p className="mt-3 text-tabaco">
              Três combos prontos. Sem mensalidade. Você paga só quando puxar a capivara.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {COMBOS_LEILAO.map((combo) => (
              <PlanCard
                key={combo.id}
                plano={combo}
                mode="b2c"
                inclui={comboBullets(combo.id)}
                href={`/consultar/leilao/${comboShortId(combo.id)}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------- PRODUTOS PONTUAIS --------------------- */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              Produtos pontuais
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Precisa só de um dado? Compra avulso.
            </h2>
            <p className="mt-3 text-tabaco">
              Quando o combo é demais. Histórico, foto, roubo/furto premium ou Vip Car — cada um separado.
            </p>
          </div>

          <div className="grid gap-4">
            {PRODUTOS_LEILAO_AVULSO.map((produto) => (
              <ProdutoAvulsoCard key={produto.id} produto={produto} />
            ))}
          </div>
        </div>
      </section>

      {/* --------------------- FAQ --------------------- */}
      <section className="py-16 md:py-20 bg-paper-2 border-y border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <Badge variant="outline" className="mb-3 font-mono">
              Perguntas frequentes
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Antes de dar lance, tira essas dúvidas
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-line bg-card p-5 open:shadow-md transition-shadow"
              >
                <summary className="cursor-pointer flex items-center justify-between gap-4 font-semibold text-cocoa list-none">
                  <span>{item.q}</span>
                  <span className="size-6 rounded-full bg-paper-2 flex items-center justify-center text-fur shrink-0 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-tabaco leading-relaxed">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------- CTA FINAL --------------------- */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative rounded-2xl bg-cocoa text-cream p-8 md:p-12 overflow-hidden text-center">
            <div className="absolute -top-20 -right-20 size-60 bg-saffron/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-60 bg-fur/30 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                Comece pelo Pré-Lance ·{" "}
                <span className="text-saffron">
                  {formatBRL(COMBOS_LEILAO[0].precoB2C_centavos)}
                </span>
              </h2>
              <p className="mt-3 text-cream/80 max-w-lg mx-auto">
                Histórico completo do veículo antes de você dar o lance.
                Foto do leilão + roubo/furto + FIPE. PDF baixável.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button asChild variant="accent" size="xl">
                  <Link href={`/consultar/leilao/${comboShortId(COMBOS_LEILAO[0].id)}`}>
                    Puxar capivara pré-lance
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
              </div>
              <p className="mt-4 text-xs font-mono text-cream/60 flex items-center justify-center gap-1.5">
                <ShieldCheck className="size-4 text-ok" /> LGPD compliant · PDF assinado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: "Consulta de leilão veicular",
            description:
              "Histórico técnico completo de carro de leilão: pequena/média/grande monta, foto, roubo/furto premium e gravame.",
            brand: { "@type": "Brand", name: "Capivara" },
            offers: [
              ...COMBOS_LEILAO.map((c) => ({
                "@type": "Offer",
                name: c.nome,
                description: c.descricao,
                price: (c.precoB2C_centavos / 100).toFixed(2),
                priceCurrency: "BRL",
                availability: "https://schema.org/InStock",
              })),
              ...PRODUTOS_LEILAO_AVULSO.map((p) => ({
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
    </div>
  );
}

// =========================================================================
// Helpers locais
// =========================================================================

function comboShortId(id: string): string {
  // "leilao-pre-lance" -> "pre-lance"
  return id.replace(/^leilao-/, "");
}

/** Bullets curtos pra cada combo (resumo do conteudo). */
function comboBullets(id: string): string[] {
  switch (id) {
    case "leilao-pre-lance":
      return [
        "BIN + FIPE atualizado",
        "Histórico de leilão (categoria, leiloeiro, data)",
        "Foto do veículo no leilão",
        "Histórico de roubo/furto",
        "Resultado em segundos · PDF baixável",
      ];
    case "leilao-pos-compra":
      return [
        "CSV (Certificado de Segurança Veicular)",
        "RENAJUD + RENAINF (restrições e multas)",
        "Recall pendente + BIN consolidado",
        "CRLV digital (documento do veículo)",
        "Verificação de gravame ativo",
      ];
    case "leilao-auctioneer":
      return [
        "Pré-Lance completo (FIPE, leilão, foto)",
        "Pós-Compra completo (CSV, CRLV, RENAJUD)",
        "Roubo/furto Premium (bases policiais cruzadas)",
        "Vip Car: análise técnica + precificador",
        "Pacote pra revendedor profissional",
      ];
    default:
      return [];
  }
}

