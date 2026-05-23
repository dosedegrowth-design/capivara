import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, UserRound, Building2, CarFront } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlanCarousel } from "@/components/consulta/plan-carousel";
import { ManadaCarousel } from "@/components/consulta/manada-carousel";
import {
  PLANOS_CPF,
  PLANOS_CNPJ,
  PLANOS_VEICULAR,
  PACOTES_MANADA,
  RESUMO_INCLUI,
  type Plano,
} from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Preços · Capivara",
  description:
    "Planos para pessoa física (avulsos a partir de R$ 7,90) ou empresarial (saldo em R$ com até 50% de bônus via pacotes Manada).",
};

// RESUMO_INCLUI agora vem de @/lib/consultas/planos (fonte unica de verdade)

export default function PrecosPage() {
  return (
    <div className="bg-paper">
      <Header />
      <Tabs defaultValue="pf" className="mx-auto max-w-6xl px-4 sm:px-6 pb-20">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="pf">Pessoa física</TabsTrigger>
            <TabsTrigger value="pj">Empresarial</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="pf" className="space-y-20">
          <CategoriaPlanos
            categoria="CPF"
            descricao="Verifique pessoas: score, dívidas, histórico e vínculos."
            icone={<UserRound className="size-5" />}
            cor="bg-info/15 text-info"
            planos={PLANOS_CPF}
          />
          <CategoriaPlanos
            categoria="CNPJ"
            descricao="Verifique empresas: situação, sócios, crédito e tributário."
            icone={<Building2 className="size-5" />}
            cor="bg-sage/20 text-sage"
            planos={PLANOS_CNPJ}
          />
          <CategoriaPlanos
            categoria="Veicular"
            descricao="Verifique veículos: proprietário, gravame, leilão e recall."
            icone={<CarFront className="size-5" />}
            cor="bg-saffron/25 text-fur"
            planos={PLANOS_VEICULAR}
          />
        </TabsContent>

        <TabsContent value="pj">
          <PainelEmpresarial />
        </TabsContent>
      </Tabs>

      <ChamadaFinal />
    </div>
  );
}

// =========================================================================
// Header da pagina
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
          5 planos por categoria, do mais leve (R$ 7,90) ao mais completo
          (R$ 199,90). Empresas pagam preço B2B (~50% off) debitado do saldo.
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
}: {
  categoria: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  planos: Plano[];
}) {
  return (
    <section className="space-y-8">
      <div className="flex items-start gap-4 max-w-3xl">
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

      {/* Carrossel horizontal: ~4 cards visiveis em desktop, swipe em mobile */}
      <PlanCarousel planos={planos} inclui={RESUMO_INCLUI} cardWidth={300} />
    </section>
  );
}

// =========================================================================
// Painel empresarial — pacotes Manada
// =========================================================================

function PainelEmpresarial() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Pacotes Manada para empresas que consultam volume.
          </h2>
          <p className="mt-3 text-tabaco">
            Recarregue saldo em R$ e consuma conforme uso. Quanto maior o
            pacote, maior o bônus em saldo. Sem mensalidade.
          </p>
        </div>

        <ManadaCarousel pacotes={PACOTES_MANADA} />
      </section>

      <section className="rounded-lg border border-line bg-card p-6 md:p-8">
        <h3 className="font-display text-xl font-bold text-cocoa mb-4">
          Quanto cada plano debita do saldo
        </h3>
        <p className="text-sm text-tabaco mb-6">
          Empresas pagam o mesmo conteúdo dos planos avulsos B2C com até 50%
          menos. Veja a equivalência:
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          <ConsumoTabela titulo="CPF" planos={PLANOS_CPF} />
          <ConsumoTabela titulo="CNPJ" planos={PLANOS_CNPJ} />
          <ConsumoTabela titulo="Veicular" planos={PLANOS_VEICULAR} />
        </div>
      </section>

      <section className="rounded-lg bg-cocoa text-cream p-8 md:p-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-2xl font-bold mb-2">
              Empresa grande? Vamos conversar.
            </h3>
            <p className="text-cream/80 max-w-lg">
              A partir de R$ 5.000/mês em consultas temos planos sob medida com
              SLA, account manager e cache estendido (até 7 dias).
            </p>
          </div>
          <Button asChild variant="accent" size="lg">
            <Link href="/contato?tipo=enterprise">
              Falar com vendas
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function ConsumoTabela({
  titulo,
  planos,
}: {
  titulo: string;
  planos: Plano[];
}) {
  return (
    <div>
      <h4 className="font-display text-base font-semibold text-cocoa mb-3">
        {titulo}
      </h4>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-tabaco text-xs">
            <th className="text-left font-mono font-medium py-2">Plano</th>
            <th className="text-right font-mono font-medium py-2">B2B</th>
            <th className="text-right font-mono font-medium py-2">Avulso</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((p) => (
            <tr key={p.id} className="border-b border-line/50 last:border-0">
              <td className="py-2 text-cocoa">{p.nome}</td>
              <td className="py-2 text-right font-mono font-bold text-fur">
                {formatBRL(p.precoB2B_centavos)}
              </td>
              <td className="py-2 text-right font-mono text-tabaco">
                {formatBRL(p.precoB2C_centavos)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
