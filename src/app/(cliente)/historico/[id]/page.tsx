import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Download, FileText, Info, Sparkles, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { ResultSections } from "@/components/consulta/result-sections";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/session";
import { findPlano } from "@/lib/consultas/planos";
import { formatDateTimeBR } from "@/lib/formatters";
import type { ResultSection } from "@/lib/consultas/mock-data";

const PDF_BUCKET = "capivara-relatorios-pdf";
const SIGNED_URL_SECONDS = 15 * 60; // 15 min pra download imediato

/**
 * Resolve o URL do PDF: se consulta.pdf_url e' um path (formato novo),
 * gera signed URL de 15min sob demanda. Se ja e' URL completa (legado),
 * usa direto.
 */
async function resolvePdfUrl(pdfUrlOrPath: string | null): Promise<string | null> {
  if (!pdfUrlOrPath) return null;
  if (pdfUrlOrPath.startsWith("https://")) return pdfUrlOrPath;
  const admin = createAdminClient();
  const { data } = await admin.storage
    .from(PDF_BUCKET)
    .createSignedUrl(pdfUrlOrPath, SIGNED_URL_SECONDS);
  return data?.signedUrl ?? null;
}

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
  const pdfDownloadUrl = await resolvePdfUrl(consulta.pdf_url ?? null);

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

          {!aindaProcessando && !erro && pdfDownloadUrl && (
            <Button asChild variant="primary" size="lg">
              <a href={pdfDownloadUrl} target="_blank" rel="noreferrer">
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
        <>
          {/* Aviso de intermediacao / atualidade dos dados */}
          <div className="rounded-lg border border-saffron/30 bg-saffron/5 p-4 flex items-start gap-3">
            <Info className="size-5 text-saffron shrink-0 mt-0.5" />
            <div className="text-xs text-cocoa leading-relaxed">
              <p className="font-semibold mb-1">
                Sobre estes dados
              </p>
              <p className="text-tabaco">
                Consulta realizada em <strong className="text-cocoa">{formatDateTimeBR(consulta.created_at)}</strong>.{" "}
                A Capivara é intermediária técnica e <strong>não garante a atualidade após esta data</strong>.
                {consulta.category === "veicular"
                  ? " Multas, sinistros, débitos, transferências ou recalls registrados após esta consulta não estão refletidos. Para compra/venda formal, confirme no Detran na data da operação."
                  : consulta.category === "cpf"
                  ? " Score, dívidas e restrições mudam diariamente. Para decisões críticas, repita a consulta na data da decisão."
                  : " Situação cadastral, certidões e score empresarial podem ter sido atualizados após esta consulta. Para contratos importantes, repita na data da assinatura."}{" "}
                Em divergência com a fonte oficial, a fonte oficial prevalece.{" "}
                <Link href="/responsabilidade-consulta" target="_blank" className="text-fur hover:underline">
                  Ver termo completo
                </Link>
              </p>
            </div>
          </div>

          <ResultadoConsolidado consulta={consulta} />
        </>
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
        <p className="text-tabaco">Resultado vazio. Algo inesperado ocorreu.</p>
      </div>
    );
  }

  // O resultado pode vir no formato novo (sections[]) ou antigo (mock simples)
  const result = consulta.result_jsonb as { sections?: ResultSection[] };
  const hasSections = Array.isArray(result.sections) && result.sections.length > 0;

  return (
    <div className="space-y-4">
      {consulta.cache_hit && (
        <div className="rounded-md bg-info/10 border border-info/30 p-3 text-xs font-mono text-info">
          Resultado obtido do cache (consulta repetida em 24h, sem cobrar de novo).
        </div>
      )}

      {hasSections ? (
        <ResultSections sections={result.sections!} />
      ) : (
        <details className="rounded-lg border border-line bg-card overflow-hidden">
          <summary className="cursor-pointer p-4 hover:bg-cream/30 transition-colors">
            <span className="font-display font-semibold text-cocoa">
              Dados consolidados (formato antigo)
            </span>
          </summary>
          <pre className="p-4 text-xs font-mono text-tabaco overflow-x-auto bg-paper-2 border-t border-line">
            {JSON.stringify(consulta.result_jsonb, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
