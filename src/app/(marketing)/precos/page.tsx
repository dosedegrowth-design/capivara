import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, UserRound, Building2, CarFront, Gavel } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanCarousel } from "@/components/consulta/plan-carousel";
import {
  PLANOS_CPF,
  PLANOS_CNPJ,
  PLANOS_VEICULAR,
  COMBOS_LEILAO,
  RESUMO_INCLUI,
  type Plano,
} from "@/lib/consultas/planos";

export const metadata: Metadata = {
  title: "Preços · Capivara",
  description:
    "Planos avulsos para pessoa física a partir de R$ 7,90. Sem mensalidade — você paga só a consulta que fizer.",
};

export default function PrecosPage() {
  return (
    <div className="bg-paper">
      <Header />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 space-y-20">
        <CategoriaPlanos
          categoria="CPF"
          descricao="Verifique pessoas: score, dívidas, histórico e vínculos."
          icone={<UserRound className="size-5" />}
          cor="bg-info/15 text-info"
          planos={PLANOS_CPF}
          href="/consultar/cpf"
        />
        <CategoriaPlanos
          categoria="CNPJ"
          descricao="Verifique empresas: situação, sócios, crédito e tributário."
          icone={<Building2 className="size-5" />}
          cor="bg-sage/20 text-sage"
          planos={PLANOS_CNPJ}
          href="/consultar/cnpj"
        />
        <CategoriaPlanos
          categoria="Veicular"
          descricao="Verifique veículos: proprietário, gravame, leilão e recall."
          icone={<CarFront className="size-5" />}
          cor="bg-saffron/25 text-fur"
          planos={PLANOS_VEICULAR}
          href="/consultar/veicular"
        />
        <CategoriaPlanos
          categoria="Leilão"
          descricao="Combos específicos pra quem dá lance ou arremata em leilão."
          icone={<Gavel className="size-5" />}
          cor="bg-fur/20 text-fur"
          planos={COMBOS_LEILAO}
          href="/consultar/leilao"
        />

        <EmpresaCallout />
      </div>

      <ChamadaFinal />
    </div>
  );
}

// =========================================================================
// Header
// =========================================================================

function Header() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <Badge variant="outline" className="mb-3 font-mono">
          Planos e preços
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
          Sem mensalidade. Você só paga o que consultar.
        </h1>
        <p className="mt-4 text-tabaco text-lg leading-relaxed">
          Planos avulsos do mais leve (R$ 7,90) ao mais completo (R$ 249,90).
          Pague Pix, boleto ou cartão. Resultado em PDF com QR Code de verificação.
        </p>
      </div>
    </section>
  );
}

// =========================================================================
// Bloco de planos por categoria
// =========================================================================

function CategoriaPlanos({
  categoria,
  descricao,
  icone,
  cor,
  planos,
  href,
}: {
  categoria: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  planos: Plano[];
  href: string;
}) {
  return (
    <section className="space-y-8">
      <div className="flex items-start justify-between gap-4 max-w-4xl flex-col sm:flex-row">
        <div className="flex items-start gap-4">
          <span
            className={`size-12 rounded-md flex items-center justify-center shrink-0 ${cor}`}
          >
            {icone}
          </span>
          <div>
            <h2 className="font-display text-3xl font-bold text-cocoa">
              {categoria}
            </h2>
            <p className="text-tabaco mt-1">{descricao}</p>
          </div>
        </div>

        <Button asChild variant="secondary" size="md">
          <Link href={href}>
            Ver detalhes
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <PlanCarousel planos={planos} inclui={RESUMO_INCLUI} cardWidth={300} />
    </section>
  );
}

// =========================================================================
// Callout pra B2B (sem expor precos publicamente)
// =========================================================================

function EmpresaCallout() {
  return (
    <section>
      <div className="rounded-2xl bg-cocoa text-cream p-8 md:p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 size-60 bg-saffron/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 size-60 bg-fur/25 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Badge
              variant="outline"
              className="mb-3 font-mono border-cream/30 text-cream"
            >
              Para empresas
            </Badge>
            <h3 className="font-display text-2xl md:text-3xl font-bold leading-tight">
              Volume alto? Tem plano empresarial sob medida.
            </h3>
            <p className="mt-3 text-cream/80 max-w-xl leading-relaxed">
              Recarga em saldo, preço por consulta sob negociação, API REST,
              webhooks com HMAC, NF-e e SLA dedicado. Cobertura por categoria
              ou volume mensal.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <Button asChild variant="accent" size="lg">
              <Link href="/api-publica">
                Ver API B2B
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-cream hover:bg-white/10"
            >
              <Link href="/contato?tipo=enterprise">Falar com vendas</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// Chamada final
// =========================================================================

function ChamadaFinal() {
  return (
    <section className="pb-20">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <p className="text-tabaco mb-4">
          Dúvidas sobre qual plano escolher?{" "}
          <Link
            href="/como-funciona"
            className="text-fur underline-offset-4 hover:underline"
          >
            Veja como funciona
          </Link>
          {" "}ou{" "}
          <Link
            href="/contato"
            className="text-fur underline-offset-4 hover:underline"
          >
            entre em contato
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
