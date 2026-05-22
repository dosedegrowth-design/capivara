import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { findPlano } from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";
import { ConsultaForm } from "./consulta-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; plano: string }>;
}): Promise<Metadata> {
  const { categoria, plano } = await params;
  const p = findPlano(`${categoria}-${plano}`);
  return { title: `${p?.nome ?? "Consultar"} · Capivara` };
}

export default async function PlanoPage({
  params,
}: {
  params: Promise<{ categoria: string; plano: string }>;
}) {
  const { categoria, plano } = await params;
  const planoId = `${categoria}-${plano}`;
  const planoObj = findPlano(planoId);
  if (!planoObj) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <Link
        href={`/consultar/${categoria}`}
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Outro plano
      </Link>

      <div className="grid md:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Form principal */}
        <div className="space-y-6">
          <div>
            <Badge variant="outline" className="mb-3 font-mono">
              Passo 3 de 3 · Dados e finalidade
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
              {planoObj.nome}
            </h1>
            <p className="mt-2 text-tabaco">{planoObj.descricao}</p>
          </div>

          <ConsultaForm plano={planoObj} />
        </div>

        {/* Resumo lateral */}
        <aside className="rounded-lg border border-line bg-card p-6 sticky top-24">
          <div className="flex justify-center mb-4">
            <Mascot pose="investigando" size={80} animate="idle" />
          </div>
          <h3 className="font-display font-semibold text-cocoa mb-3 text-center">
            Resumo
          </h3>
          <dl className="text-sm space-y-2">
            <div className="flex justify-between">
              <dt className="text-tabaco">Categoria</dt>
              <dd className="text-cocoa uppercase font-mono">
                {planoObj.categoria}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-tabaco">Plano</dt>
              <dd className="text-cocoa">{planoObj.nome}</dd>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-line mt-2">
              <dt className="text-tabaco text-xs">Total</dt>
              <dd className="font-display text-2xl font-bold text-cocoa">
                {formatBRL(planoObj.precoB2C_centavos)}
              </dd>
            </div>
          </dl>

          <p className="text-xs font-mono text-tabaco/70 mt-4 leading-relaxed">
            PIX confirma em segundos. Boleto leva até 2 dias úteis.
          </p>
        </aside>
      </div>
    </div>
  );
}
