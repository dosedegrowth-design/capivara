import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, UserRound, Building2, CarFront, Gavel } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanCarousel } from "@/components/consulta/plan-carousel";
import { ProdutoAvulsoCard } from "@/components/consulta/produto-avulso-card";
import { resolveIcone } from "@/components/consulta/icones";
import { formatBRL } from "@/lib/formatters";
import {
  PLANOS_CPF,
  PLANOS_CNPJ,
  PLANOS_VEICULAR,
  COMBOS_LEILAO,
  PRODUTOS_CERTIDAO,
  PRODUTOS_COMPLIANCE,
  PRODUTOS_LOCAL,
  CATALOGO_COMPLETO,
  GRUPOS_CATALOGO,
  RESUMO_INCLUI,
  type Plano,
  type ProdutoAvulso,
  type GrupoCatalogo,
} from "@/lib/consultas/planos";

/** Faixa de preco real do catalogo — nunca hardcode, senao desatualiza. */
const PRECOS = CATALOGO_COMPLETO.map((i) => i.precoB2C_centavos);
const PRECO_MIN = Math.min(...PRECOS);
const PRECO_MAX = Math.max(...PRECOS);

export const metadata: Metadata = {
  title: "Preços · Capivara",
  description: `Catálogo com ${CATALOGO_COMPLETO.length} consultas: CPF, CNPJ, veicular, leilão, certidões, compliance e CEP. A partir de ${formatBRL(
    PRECO_MIN
  )}, sem mensalidade — você paga só a consulta que fizer.`,
  alternates: { canonical: "/precos" },
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

        <CategoriaAvulsos
          grupo="certidoes"
          descricao="Certidão negativa emitida na hora — licitação, contrato, admissão."
          produtos={PRODUTOS_CERTIDAO}
        />
        <CategoriaAvulsos
          grupo="compliance"
          descricao="Due diligence de quem entra na sua base: PEP, sanções, processos."
          produtos={PRODUTOS_COMPLIANCE}
        />
        <CategoriaAvulsos
          grupo="local"
          descricao="Perfil de consumo e concorrência do CEP, pra escolher ponto comercial."
          produtos={PRODUTOS_LOCAL}
        />

        <TodasAsConsultas />

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
          São {CATALOGO_COMPLETO.length} consultas, do mais leve (
          {formatBRL(PRECO_MIN)}) ao mais completo ({formatBRL(PRECO_MAX)}).
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
// Bloco de consultas avulsas por grupo (certidoes, compliance, CEP)
// =========================================================================

function CategoriaAvulsos({
  grupo,
  descricao,
  produtos,
}: {
  grupo: GrupoCatalogo;
  descricao: string;
  produtos: ProdutoAvulso[];
}) {
  const meta = GRUPOS_CATALOGO.find((g) => g.id === grupo);
  if (!meta) return null;
  const Icon = resolveIcone(meta.icon);

  return (
    <section className="space-y-8">
      <div className="flex items-start justify-between gap-4 max-w-4xl flex-col sm:flex-row">
        <div className="flex items-start gap-4">
          <span className="size-12 rounded-md flex items-center justify-center shrink-0 bg-fur/15 text-fur">
            <Icon className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-3xl font-bold text-cocoa">
              {meta.label}
            </h2>
            <p className="text-tabaco mt-1">{descricao}</p>
          </div>
        </div>

        <Button asChild variant="secondary" size="md">
          <Link href={meta.href}>
            Ver detalhes
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {produtos.map((produto) => (
          <ProdutoAvulsoCard key={produto.id} produto={produto} />
        ))}
      </div>
    </section>
  );
}

// =========================================================================
// Ponte pro catalogo completo
// =========================================================================

function TodasAsConsultas() {
  return (
    <section className="rounded-2xl border border-line bg-paper-2 p-8 text-center">
      <h2 className="font-display text-2xl font-bold text-cocoa">
        Precisa de um dado só?
      </h2>
      <p className="mt-2 text-tabaco max-w-2xl mx-auto leading-relaxed">
        Além dos planos, tem {CATALOGO_COMPLETO.filter((i) => i.tipo === "avulso").length}{" "}
        consultas avulsas — score, gravame, antecedentes, sócios, protesto. Puxe
        uma só, sem pagar o pacote inteiro.
      </p>
      <Button asChild variant="accent" size="lg" className="mt-5">
        <Link href="/consultar">
          Ver as {CATALOGO_COMPLETO.length} consultas
          <ArrowRight className="size-4" />
        </Link>
      </Button>
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
              webhooks com HMAC e SLA dedicado. Cobertura por categoria
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
