import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Car,
  CreditCard,
  Home,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Casos de uso · Quando usar Capivara · Capivara",
  description:
    "Veja como imobiliárias, RH, revendas e financeiras usam a Capivara pra decidir mais rápido e com menos risco.",
  alternates: { canonical: `${SITE}/casos-de-uso` },
};

const CASOS = [
  {
    href: "/casos-de-uso/imobiliaria",
    icon: Home,
    title: "Imobiliária & Aluguel",
    description:
      "Antes de assinar contrato: score, dívidas, processos e histórico de endereço do inquilino.",
    cta: "R$ 9,90 · CPF",
  },
  {
    href: "/casos-de-uso/rh-contratacao",
    icon: Briefcase,
    title: "RH & Contratação",
    description:
      "Background check pré-admissão: ações trabalhistas, vínculos empresariais, antecedentes.",
    cta: "R$ 89,90 · CPF Premium",
  },
  {
    href: "/casos-de-uso/revenda-automotiva",
    icon: Car,
    title: "Revenda Automotiva",
    description:
      "Antes de aceitar a troca: leilão, sinistro, débitos, recall e Renajud do veículo.",
    cta: "R$ 49,90 · Veicular",
  },
  {
    href: "/casos-de-uso/analise-credito",
    icon: CreditCard,
    title: "Análise de Crédito",
    description:
      "Antes de aprovar venda a prazo: score, dívidas, protestos e SCR Bacen.",
    cta: "R$ 39,90 · CPF Avançada",
  },
];

export default function CasosDeUsoPage() {
  return (
    <div className="bg-paper">
      <section className="bg-paper-2 border-b border-line py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="outline" className="mb-3 font-mono">
            Casos de uso
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cocoa tracking-tight">
            Pra que serve a Capivara?
          </h1>
          <p className="mt-3 text-lg text-tabaco max-w-2xl mx-auto">
            Empresas e profissionais usam a Capivara pra decidir mais rápido,
            com base em dados. Veja o caso de uso mais próximo do seu.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {CASOS.map(({ href, icon: Icon, title, description, cta }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-xl border border-line bg-card p-6 hover:border-fur hover:shadow-md transition-all"
              >
                <div className="size-12 rounded-lg bg-fur/15 text-fur flex items-center justify-center mb-4 group-hover:bg-fur group-hover:text-cream transition-colors">
                  <Icon className="size-6" />
                </div>
                <h2 className="font-display text-xl font-bold text-cocoa mb-2">
                  {title}
                </h2>
                <p className="text-sm text-tabaco leading-relaxed mb-4">{description}</p>
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-line/60">
                  <span className="text-xs font-mono text-fur">{cta}</span>
                  <ArrowRight className="size-4 text-tabaco group-hover:text-fur group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
