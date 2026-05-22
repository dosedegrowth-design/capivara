import Link from "next/link";
import { ArrowRight, Check, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";

export interface CasoUsoContent {
  /** Slug da pagina (cpf/cnpj/veicular) pra qual o caso de uso aponta */
  categoria: "cpf" | "cnpj" | "veicular";
  /** Audiencia / nicho */
  audiencia: string;
  /** H1 da pagina */
  h1: string;
  /** Subheadline */
  subheadline: string;
  /** Badge no topo do hero */
  badgeText: string;
  /** Beneficios — 3 cards */
  beneficios: {
    icon: LucideIcon;
    title: string;
    description: string;
  }[];
  /** Como usar — 3 passos */
  passos: { title: string; description: string }[];
  /** Bullets de "o que vem na consulta" */
  oQueVem: string[];
  /** Plano recomendado pra esse caso */
  planoRecomendado: {
    nome: string;
    preco: string;
    id: string;
  };
}

export function CasoUsoLanding({ content }: { content: CasoUsoContent }) {
  return (
    <div className="bg-paper">
      {/* HERO */}
      <section className="relative overflow-hidden bg-paper-2 border-b border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 md:py-16">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <Badge variant="secondary" className="font-mono">
                Pra {content.audiencia}
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-cocoa leading-[1.05]">
                {content.h1}
              </h1>
              <p className="text-base sm:text-lg text-tabaco leading-relaxed">
                {content.subheadline}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button asChild variant="accent" size="xl">
                  <Link href={`/consultar/${content.categoria}`}>
                    Puxar capivara agora
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="xl">
                  <Link href={`/consultar/${content.categoria}/${content.planoRecomendado.id.split("-").slice(1).join("-")}`}>
                    {content.planoRecomendado.nome} · {content.planoRecomendado.preco}
                  </Link>
                </Button>
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 -z-10 bg-saffron/20 blur-3xl rounded-full" />
                <Mascot pose="investigando" size={280} animate="idle" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa mb-8">
            Por que {content.audiencia} usa Capivara
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {content.beneficios.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-xl border border-line bg-card p-5"
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

      {/* COMO FUNCIONA */}
      <section className="py-12 md:py-16 bg-paper-2 border-y border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa mb-8">
            Em 3 passos
          </h2>
          <ol className="space-y-4">
            {content.passos.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-4 rounded-xl border border-line bg-card p-5"
              >
                <span className="shrink-0 size-10 rounded-full bg-cocoa text-cream flex items-center justify-center font-display font-bold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display font-semibold text-cocoa">{p.title}</h3>
                  <p className="text-sm text-tabaco mt-1 leading-relaxed">{p.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* O QUE VEM */}
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa mb-6">
            O que vem em cada consulta
          </h2>
          <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-line bg-card p-6">
            {content.oQueVem.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-cocoa leading-relaxed"
              >
                <Check className="size-4 text-ok shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-tabaco mt-4 text-center">
            Detalhes variam conforme o plano escolhido.{" "}
            <Link
              href={`/consultar/${content.categoria}`}
              className="text-fur hover:underline"
            >
              Ver todos os planos
            </Link>
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-12 md:py-16 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="relative rounded-2xl bg-cocoa text-cream p-8 md:p-12 overflow-hidden text-center">
            <div className="absolute -top-20 -right-20 size-60 bg-saffron/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 size-60 bg-fur/30 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                Comece agora ·{" "}
                <span className="text-saffron">{content.planoRecomendado.preco}</span>
              </h2>
              <p className="mt-3 text-cream/80 max-w-lg mx-auto">
                Sem mensalidade. Pague só as consultas que fizer. Resultado em segundos com PDF.
              </p>
              <Button asChild variant="accent" size="xl" className="mt-6">
                <Link href={`/consultar/${content.categoria}`}>
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
