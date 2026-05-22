import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, FileText, Sparkles, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { findPlano } from "@/lib/consultas/planos";
import { formatDateTimeBR } from "@/lib/formatters";

export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: consulta } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!consulta || consulta.user_id !== profile.id) notFound();

  const plano = findPlano(consulta.plan_tier);
  const aindaProcessando = ["pending_payment", "paid", "processing"].includes(
    consulta.status
  );
  const erro = consulta.status === "error";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <Link
        href="/dashboard/historico"
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar ao histórico
      </Link>

      {/* Header */}
      <div className="rounded-lg border border-line bg-card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start gap-4 justify-between">
          <div className="flex-1">
            <Badge variant="outline" className="mb-2 font-mono uppercase">
              {consulta.category} · {plano?.nome ?? consulta.plan_tier}
            </Badge>
            <h1 className="font-display text-3xl font-bold text-cocoa font-mono">
              {consulta.target_value}
            </h1>
            <p className="text-tabaco text-sm mt-2">
              Consultada em {formatDateTimeBR(consulta.created_at)}
            </p>
          </div>

          {!aindaProcessando && !erro && consulta.pdf_url && (
            <Button asChild variant="primary" size="lg">
              <a href={consulta.pdf_url} target="_blank" rel="noreferrer">
                <Download className="size-4" />
                Baixar PDF
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Estados */}
      {aindaProcessando ? (
        <div className="rounded-lg border border-line bg-card p-12 flex flex-col items-center text-center">
          <Mascot pose="investigando" size={120} animate="investigando" />
          <h2 className="font-display text-2xl font-bold text-cocoa mt-4">
            Investigando o cerrado...
          </h2>
          <p className="text-tabaco mt-2 max-w-md">
            Aguarde alguns segundos. Esta tela atualiza sozinha quando o
            relatório estiver pronto.
          </p>
        </div>
      ) : erro ? (
        <div className="rounded-lg border border-err/30 bg-err/5 p-8 flex items-start gap-4">
          <AlertTriangle className="size-6 text-err shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-lg font-bold text-cocoa">
              Algo deu errado nesta consulta
            </h2>
            <p className="text-sm text-tabaco mt-1">
              Pedido de reembolso já foi aberto automaticamente. Em até 7 dias úteis o
              valor volta para você.
            </p>
            <p className="text-xs font-mono text-tabaco/60 mt-3">
              ID: {consulta.id}
            </p>
          </div>
        </div>
      ) : consulta.status === "expired" ? (
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-8 flex items-start gap-4">
          <AlertTriangle className="size-6 text-warn shrink-0 mt-0.5" />
          <div>
            <h2 className="font-display text-lg font-bold text-cocoa">
              Pagamento expirou
            </h2>
            <p className="text-sm text-tabaco mt-1">
              A cobrança não foi paga a tempo. Você pode iniciar uma nova consulta.
            </p>
            <Button asChild variant="primary" size="md" className="mt-4">
              <Link href="/dashboard/nova-consulta">
                Nova consulta
                <Sparkles className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <ResultadoConsolidado consulta={consulta} />
      )}
    </div>
  );
}

function ResultadoConsolidado({
  consulta,
}: {
  consulta: {
    result_jsonb: Record<string, unknown> | null;
    cache_hit: boolean;
  };
}) {
  if (!consulta.result_jsonb || Object.keys(consulta.result_jsonb).length === 0) {
    return (
      <div className="rounded-lg border border-line bg-card p-8 text-center">
        <FileText className="size-12 text-tabaco mx-auto mb-3" />
        <p className="text-tabaco">Resultado vazio — algo inesperado ocorreu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {consulta.cache_hit && (
        <div className="rounded-md bg-info/10 border border-info/30 p-3 text-xs font-mono text-info">
          Resultado obtido do cache (consulta repetida em 24h — sem cobrar de novo).
        </div>
      )}

      <details open className="rounded-lg border border-line bg-card overflow-hidden">
        <summary className="cursor-pointer p-4 hover:bg-cream/30 transition-colors">
          <span className="font-display font-semibold text-cocoa">
            Dados consolidados (JSON bruto · MVP)
          </span>
        </summary>
        <pre className="p-4 text-xs font-mono text-tabaco overflow-x-auto bg-paper-2 border-t border-line">
          {JSON.stringify(consulta.result_jsonb, null, 2)}
        </pre>
      </details>

      <p className="text-xs text-tabaco/70 font-mono text-center pt-4">
        Visualização rica + PDF estilizado virão nas próximas iterações.
      </p>
    </div>
  );
}
