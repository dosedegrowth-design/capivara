import type { Metadata } from "next";
import Link from "next/link";
import {
  FileCheck,
  Scale,
  Building2,
  UserRound,
  ArrowRight,
  Clock,
} from "lucide-react";

import { ProdutoAvulsoCard } from "@/components/consulta/produto-avulso-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { PRODUTOS_CERTIDAO } from "@/lib/consultas/planos";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Certidões online · PGFN, CNDT, FGTS e kits pra licitação · Capivara",
  description:
    "Tire certidões de pessoa física e empresa em segundos: PGFN, CNDT, FGTS, CNJ, antecedentes e situação cadastral. Kit completo pra licitação a partir de R$ 49,90, tudo num PDF só.",
  keywords: [
    "certidão negativa",
    "certidão pgfn",
    "cndt",
    "certidão fgts",
    "certidão para licitação",
    "certidão negativa de débitos",
    "antecedentes criminais online",
    "situação cadastral cnpj",
    "kit certidões",
    "capivara certidões",
  ],
  alternates: { canonical: `${SITE}/consultar/certidoes` },
  openGraph: {
    title: "Certidões online · Capivara",
    description:
      "PGFN, CNDT, FGTS, CNJ e mais. Kit pra licitação num PDF só, em segundos.",
    url: `${SITE}/consultar/certidoes`,
    type: "website",
    images: [{ url: `${SITE}/og.png`, width: 1200, height: 630 }],
  },
};

const KITS = PRODUTOS_CERTIDAO.filter((p) => p.id.includes("-kit-"));
const AVULSAS = PRODUTOS_CERTIDAO.filter((p) => !p.id.includes("-kit-"));

const CASOS = [
  {
    icon: Building2,
    title: "Licitação e contrato público",
    description:
      "O edital pede FGTS, PGFN, CNDT e situação cadastral. O Kit Licitação entrega os quatro de uma vez.",
  },
  {
    icon: UserRound,
    title: "Contratação e RH",
    description:
      "Antecedentes, CNDT e nada consta antes de assinar a carteira ou credenciar prestador.",
  },
  {
    icon: Scale,
    title: "Processo e advocacia",
    description:
      "Juntar certidões na petição sem perder o dia entrando em site de órgão que cai.",
  },
  {
    icon: FileCheck,
    title: "Homologação de fornecedor",
    description:
      "Conferir se a empresa está regular antes de liberar cadastro e pagamento.",
  },
];

export default function CertidoesPage() {
  return (
    <div className="bg-paper">
      {/* Hero */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <Mascot pose="concluido" size={96} animate="idle" />
          </div>
          <Badge variant="outline" className="mb-3 font-mono">
            Certidões · pessoa e empresa
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
            Todas as certidões que pedem de você. Num PDF só.
          </h1>
          <p className="mt-4 text-tabaco text-lg leading-relaxed">
            Sem entrar em cinco sites de órgão diferente, sem fila e sem site fora
            do ar. Você informa o CPF ou CNPJ e recebe as certidões emitidas,
            organizadas num relatório único.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-mono text-tabaco bg-cream/60 rounded-full px-4 py-2">
            <Clock className="size-4 text-fur" />
            Certidão tem validade curta — refaça quando vencer
          </div>
        </div>
      </section>

      {/* Kits */}
      <section className="pb-4">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl font-bold text-cocoa">
              Kits — o conjunto que o órgão exige
            </h2>
            <p className="mt-2 text-tabaco">
              Ninguém precisa de <em>uma</em> certidão. Precisa do pacote certo.
            </p>
          </div>
          <div className="grid gap-4">
            {KITS.map((produto) => (
              <ProdutoAvulsoCard key={produto.id} produto={produto} />
            ))}
          </div>
        </div>
      </section>

      {/* Avulsas */}
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <Badge variant="outline" className="mb-3 font-mono">
              Avulsas
            </Badge>
            <h2 className="font-display text-2xl font-bold text-cocoa">
              Só uma certidão específica?
            </h2>
          </div>
          <div className="grid gap-4">
            {AVULSAS.map((produto) => (
              <ProdutoAvulsoCard key={produto.id} produto={produto} />
            ))}
          </div>
        </div>
      </section>

      {/* Casos de uso */}
      <section className="py-14 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="font-display text-2xl font-bold text-cocoa text-center mb-8">
            Quem usa certidão o tempo todo
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {CASOS.map(({ icon: Icon, title, description }) => (
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

      {/* Cross-sell */}
      <section className="py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-lg bg-cocoa text-cream p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold leading-tight">
                Precisa ir além da certidão?
              </h3>
              <p className="mt-2 text-cream/80 max-w-xl leading-relaxed">
                Score, dívidas, protestos e vínculos completos — os planos de CPF e
                CNPJ trazem o quadro inteiro, não só a regularidade.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <Button asChild variant="accent" size="lg">
                <Link href="/consultar/cpf">
                  Consultar CPF
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-cream hover:bg-cream/10">
                <Link href="/consultar/cnpj">Consultar CNPJ</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
