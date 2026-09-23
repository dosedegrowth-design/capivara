import type { Metadata } from "next";
import Link from "next/link";
import { Store, Target, Home, Umbrella, ArrowRight } from "lucide-react";

import { ProdutoAvulsoCard } from "@/components/consulta/produto-avulso-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { PRODUTOS_LOCAL } from "@/lib/consultas/planos";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Raio-X do CEP · Perfil, renda e concorrência da região · Capivara",
  description:
    "Antes de abrir negócio ou escolher bairro: quem mora ali, quanto ganha, no que gasta, qual a concorrência e o risco da região. Relatório em PDF a partir de R$ 29,90.",
  keywords: [
    "raio-x do cep",
    "perfil do bairro",
    "estudo de ponto comercial",
    "onde abrir negócio",
    "renda média por cep",
    "geomarketing",
    "concorrência por região",
    "perfil do consumidor por cep",
    "capivara cep",
  ],
  alternates: { canonical: `${SITE}/consultar/local` },
  openGraph: {
    title: "Raio-X do CEP · Capivara",
    description:
      "Quem mora ali, quanto ganha, no que gasta e qual a concorrência. Em PDF.",
    url: `${SITE}/consultar/local`,
    type: "website",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630 }],
  },
};

const USOS = [
  {
    icon: Store,
    title: "Escolher o ponto",
    description:
      "Compare bairros antes de assinar o contrato de locação. Perfil de renda, concorrência e movimento da região.",
  },
  {
    icon: Target,
    title: "Campanha por região",
    description:
      "Saber a renda e o gasto por categoria antes de segmentar anúncio por CEP — para de queimar verba em bairro errado.",
  },
  {
    icon: Home,
    title: "Imobiliária e investimento",
    description:
      "Entender o entorno do imóvel: infraestrutura, perfil de quem mora e crescimento da área.",
  },
  {
    icon: Umbrella,
    title: "Seguros e crédito",
    description:
      "Risco geográfico, propensão a seguro e indicadores de sinistro por região.",
  },
];

export default function LocalPage() {
  return (
    <div className="bg-paper">
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <Mascot pose="investigando" size={96} animate="idle" />
          </div>
          <Badge variant="outline" className="mb-3 font-mono">
            Inteligência de local · CEP
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
            Antes de abrir ali, puxe a capivara do CEP.
          </h1>
          <p className="mt-4 text-tabaco text-lg leading-relaxed">
            Quem mora na região, quanto ganha, no que gasta, quantos concorrentes
            existem e qual o risco da área. O estudo que normalmente custa consultoria,
            num relatório de alguns reais.
          </p>
        </div>
      </section>

      <section className="pb-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="grid gap-4">
            {PRODUTOS_LOCAL.map((produto) => (
              <ProdutoAvulsoCard key={produto.id} produto={produto} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-cocoa text-center mb-8">
            Pra que serve
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {USOS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-lg border border-line bg-card p-5 flex items-start gap-4"
              >
                <div className="size-11 rounded-md bg-cream flex items-center justify-center text-fur shrink-0">
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-cocoa">{title}</h3>
                  <p className="text-sm text-tabaco mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-lg border border-line bg-card p-8 text-center">
            <h3 className="font-display text-xl font-bold text-cocoa">
              Vai fechar com alguém da região?
            </h3>
            <p className="mt-2 text-tabaco max-w-xl mx-auto leading-relaxed">
              O CEP conta do lugar. Pra conferir a pessoa ou a empresa por trás do
              negócio, puxe também a capivara do CPF ou do CNPJ.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
              <Button asChild variant="primary">
                <Link href="/consultar/cpf">
                  Consultar CPF
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/consultar/cnpj">Consultar CNPJ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
