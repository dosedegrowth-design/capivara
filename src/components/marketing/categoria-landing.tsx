import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Zap, FileText, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoriaHeroMascot } from "@/components/capivara/categoria-hero-mascot";
import { PlanCarousel } from "@/components/consulta/plan-carousel";
import { RESUMO_INCLUI, type Plano } from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

/**
 * Componente de landing page generico para cada categoria (CPF / CNPJ / Veicular).
 *
 * Cada categoria fornece copy especifica (hero, use cases, "o que tem", FAQ)
 * e este componente cuida do layout SEO friendly + plan carousel + CTAs.
 */

export interface CategoriaLandingContent {
  categoria: "cpf" | "cnpj" | "veicular";
  /** SEO H1 */
  h1: string;
  /** Subheadline abaixo do H1 */
  subheadline: string;
  /** Badge no topo do hero */
  badgeText: string;
  /** Casos de uso (4 cards) */
  useCases: { icon: LucideIcon; title: string; description: string }[];
  /** O que voce recebe (4-6 bullets por nivel) */
  niveis: { nome: string; bullets: string[] }[];
  /** FAQ */
  faq: { q: string; a: string }[];
  /** Planos disponiveis nessa categoria */
  planos: Plano[];
  /** Plano mais barato (pra cta) */
  planoMaisBarato: Plano;
}

export function CategoriaLanding({ content }: { content: CategoriaLandingContent }) {
  return (
    <div className="bg-paper">
      {/* ---------------------------- HERO ---------------------------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-8 pb-12 md:pt-16 md:pb-20">
          <div className="grid items-center gap-8 md:gap-12 md:grid-cols-2">
            {/* Mascote contextualizado por categoria */}
            <div className="relative flex items-center justify-center min-h-[180px] md:min-h-[340px] md:order-2">
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-saffron/15 via-transparent to-fur/10 blur-3xl" />
              <CategoriaHeroMascot
                category={content.categoria}
                width={560}
                className="drop-shadow-[0_25px_45px_rgba(31,22,17,0.18)] w-full max-w-[260px] sm:max-w-[380px] md:max-w-[480px] h-auto"
              />
            </div>

            {/* Texto */}
            <div className="space-y-4 md:space-y-6 text-center md:text-left md:order-1">
              <Badge variant="secondary" className="font-mono">
                <span className="text-fur mr-1.5">●</span> {content.badgeText}
              </Badge>

              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-cocoa leading-[1.05]">
                {content.h1}
              </h1>

              <p className="text-base sm:text-lg text-tabaco leading-relaxed max-w-xl mx-auto md:mx-0">
                {content.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center md:justify-start">
                <Button asChild variant="accent" size="xl">
                  <Link href={`#planos`}>
                    Ver planos a partir de {formatBRL(content.planoMaisBarato.precoB2C_centavos)}
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="xl">
                  <Link href="/como-funciona">Como funciona</Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 pt-3 text-[11px] sm:text-xs font-mono text-tabaco/80">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-ok" /> LGPD compliant
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="size-4 text-saffron" /> Resultado em segundos
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="size-4 text-info" /> PDF assinado
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- USE CASES ---------------------------- */}
      <section className="bg-paper-2 py-16 md:py-20 border-y border-line">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              Quando usar
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Quem mais puxa esse tipo de capivara
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {content.useCases.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-line bg-card p-5 hover:shadow-md transition-shadow"
              >
                <div className="size-10 rounded-lg bg-fur/15 text-fur flex items-center justify-center mb-3">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-display font-semibold text-cocoa mb-1">{title}</h3>
                <p className="text-sm text-tabaco leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- O QUE TEM ---------------------------- */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <Badge variant="outline" className="mb-3 font-mono">
              O que vem em cada nível
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Do leve ao Raio-X completo
            </h2>
            <p className="mt-3 text-tabaco">
              Cada plano acumula com o anterior — quanto mais fundo, mais fontes consultadas.
            </p>
          </div>

          <div className="space-y-4">
            {content.niveis.map((n, i) => (
              <div
                key={n.nome}
                className="rounded-xl border border-line bg-card p-5 md:p-6 flex flex-col md:flex-row md:items-start md:gap-6"
              >
                <div className="shrink-0 mb-3 md:mb-0 md:w-48">
                  <div className="flex items-center gap-2">
                    <span className="size-8 rounded-full bg-cocoa text-cream flex items-center justify-center font-mono text-sm">
                      {i + 1}
                    </span>
                    <h3 className="font-display font-bold text-cocoa">{n.nome}</h3>
                  </div>
                </div>
                <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2 flex-1">
                  {n.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-cocoa leading-relaxed"
                    >
                      <Check className="size-4 text-ok shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- PLANOS ---------------------------- */}
      <section id="planos" className="bg-paper-2 py-16 md:py-20 border-y border-line scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-8">
            <Badge variant="outline" className="mb-3 font-mono">
              Escolha o plano
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Sem mensalidade. Você paga só a consulta que fizer.
            </h2>
            <p className="mt-3 text-tabaco">
              Pague PIX (cai na hora), boleto ou cartão. Resultado em PDF com QR Code de verificação.
            </p>
          </div>

          <PlanCarousel planos={content.planos} inclui={RESUMO_INCLUI} cardWidth={300} />
        </div>
      </section>

      {/* ---------------------------- FAQ ---------------------------- */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <Badge variant="outline" className="mb-3 font-mono">
              Perguntas frequentes
            </Badge>
            <h2 className="font-display text-2xl md:text-4xl font-bold text-cocoa leading-tight">
              Dúvidas comuns sobre {tituloCategoria(content.categoria)}
            </h2>
          </div>

          <div className="space-y-3">
            {content.faq.map((item) => (
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
                <p className="mt-3 text-sm text-tabaco leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- CTA FINAL ---------------------------- */}
      <section className="py-16 md:py-20 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="relative rounded-2xl bg-cocoa text-cream p-8 md:p-12 overflow-hidden text-center">
            <div className="absolute -top-20 -right-20 size-60 bg-saffron/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-60 bg-fur/30 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                Comece pela {content.planoMaisBarato.nome} ·{" "}
                <span className="text-saffron">
                  {formatBRL(content.planoMaisBarato.precoB2C_centavos)}
                </span>
              </h2>
              <p className="mt-3 text-cream/80 max-w-lg mx-auto">
                Resposta em segundos. Sem cadastro complicado. PDF baixável.
              </p>
              <Button asChild variant="accent" size="xl" className="mt-6">
                <Link href={`/consultar/${content.categoria}/${content.planoMaisBarato.id.split("-").slice(1).join("-")}`}>
                  Puxar minha capivara agora
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function tituloCategoria(c: "cpf" | "cnpj" | "veicular"): string {
  if (c === "cpf") return "consulta de CPF";
  if (c === "cnpj") return "consulta de CNPJ";
  return "consulta veicular";
}
