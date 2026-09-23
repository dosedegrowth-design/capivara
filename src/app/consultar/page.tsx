import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { CatalogoExplorer } from "@/components/consulta/catalogo-explorer";
import { resolveIcone } from "@/components/consulta/icones";
import { formatBRL } from "@/lib/formatters";
import {
  CATALOGO_COMPLETO,
  GRUPOS_CATALOGO,
  contagemPorGrupo,
  precoMinimoDoGrupo,
} from "@/lib/consultas/planos";

export const metadata: Metadata = {
  title: `Todas as consultas · ${CATALOGO_COMPLETO.length} opções`,
  description:
    "Catálogo completo: CPF, CNPJ, veicular, leilão, certidões, compliance e raio-X de CEP. Planos, combos e consultas avulsas com preço à vista, sem mensalidade.",
  alternates: { canonical: "/consultar" },
};

const DESCRICAO_GRUPO: Record<string, string> = {
  cpf: "Dados cadastrais, score, dívidas, vínculos.",
  cnpj: "Razão social, sócios, certidões, crédito.",
  veicular: "Placa, proprietário, gravame, leilão, recall.",
  leilao: "Antes do lance: sinistro, monta, foto e regularização.",
  certidoes: "PGFN, CNDT, FGTS, antecedentes. Kit pra licitação.",
  compliance: "PEP, sanções, mandados, processos, protestos.",
  local: "Perfil da região, renda, gastos e concorrência.",
};

export default function ConsultarPage() {
  const contagem = contagemPorGrupo();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 md:py-16">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="flex justify-center mb-4">
          <Mascot pose="investigando" size={110} animate="idle" />
        </div>
        <Badge variant="outline" className="mb-3 font-mono">
          {CATALOGO_COMPLETO.length} consultas disponíveis
        </Badge>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-cocoa">
          Que capivara você quer puxar?
        </h1>
        <p className="mt-3 text-tabaco text-lg">
          Comece por uma categoria ou busque direto a consulta que você precisa.
          Sem mensalidade — você paga só o que puxar.
        </p>
      </div>

      {/* Atalho por categoria */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        {GRUPOS_CATALOGO.map((g) => {
          const Icon = resolveIcone(g.icon);
          return (
            <Link
              key={g.id}
              href={g.href}
              className="group flex flex-col rounded-lg border border-line bg-card p-5 transition-all duration-200 ease-[var(--ease-cap)] hover:shadow-[var(--shadow-pop)] hover:-translate-y-0.5 hover:border-fur/60"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="size-10 rounded-md bg-fur/15 text-fur flex items-center justify-center">
                  <Icon className="size-5" strokeWidth={2} />
                </div>
                <span className="font-mono text-[10px] text-tabaco">
                  {contagem[g.id]} opções
                </span>
              </div>
              <h2 className="font-display text-lg font-bold text-cocoa">
                {g.label}
              </h2>
              <p className="mt-1 text-xs text-tabaco leading-relaxed flex-1">
                {DESCRICAO_GRUPO[g.id]}
              </p>
              <div className="mt-3 pt-3 border-t border-line/60 flex items-center justify-between text-xs font-mono">
                <span className="text-tabaco">A partir de</span>
                <span className="text-cocoa font-bold">
                  {formatBRL(precoMinimoDoGrupo(g.id))}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-cocoa group-hover:text-fur transition-colors">
                Ver categoria
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Catalogo completo, item a item */}
      <div className="border-t border-line pt-10">
        <div className="mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa">
            Todas as consultas, uma por uma
          </h2>
          <p className="mt-2 text-tabaco">
            Precisa de um dado só? Puxe avulso sem pagar o plano inteiro.
            Filtre por categoria ou busque pelo nome.
          </p>
        </div>

        <CatalogoExplorer />
      </div>

      {/* Nota B2B */}
      <div className="mt-12 rounded-lg border border-line bg-paper-2 p-6 text-center">
        <p className="text-sm text-tabaco leading-relaxed">
          Vai consultar em volume? No plano empresa o preço cai até 50% e você
          puxa por painel, CSV ou API.{" "}
          <Link href="/empresas" className="text-fur hover:underline font-medium">
            Ver planos pra empresa
          </Link>
        </p>
      </div>
    </div>
  );
}
