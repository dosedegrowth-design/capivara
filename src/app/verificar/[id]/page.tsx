import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, FileX2, BadgeCheck, ArrowRight, Info, Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { createAdminClient } from "@/lib/supabase/admin";
import { findPlano, findProdutoAvulso, findComboLeilao } from "@/lib/consultas/planos";
import { formatDateTimeBR, maskCPF, maskCNPJ } from "@/lib/formatters";

// =========================================================================
// Verificacao de relatorio Capivara — pagina publica acessada via QR Code
// impresso no PDF. Sem auth. Sem dados sensiveis. So metadados
// de autenticidade do documento.
// =========================================================================

export const metadata: Metadata = {
  title: "Verificacao de relatorio",
  description: "Confirme se um relatorio Capivara e autentico.",
  robots: {
    index: false,
    follow: false,
  },
};

// Regex UUID v1-5 (consultations.id e UUID)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ConsultaInfo {
  id: string;
  category: string;
  plan_tier: string;
  target_value: string;
  target_hash: string | null;
  status: string;
  result_jsonb: Record<string, unknown> | null;
  created_at: string;
  completed_at: string | null;
}

export default async function VerificarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!UUID_REGEX.test(id)) {
    return <NotFoundShell />;
  }

  const admin = createAdminClient();
  const { data: consulta } = await admin
    .from("consultations")
    .select(
      "id, category, plan_tier, target_value, target_hash, status, result_jsonb, created_at, completed_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!consulta || consulta.status !== "completed") {
    return <NotFoundShell />;
  }

  return (
    <Shell>
      <AuthenticCard consulta={consulta as ConsultaInfo} />
    </Shell>
  );
}

// =========================================================================
// Shell — gradient navy/cream + header simples
// =========================================================================

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cream via-paper to-paper-2">
      {/* Header simples, so logo + link saiba mais */}
      <header className="border-b border-line/60 bg-paper/70 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="https://suacapivara.com.br"
            className="flex items-center gap-2 group"
          >
            <Mascot pose="padrao" size={28} animate={false} />
            <span className="font-display text-lg font-bold text-cocoa group-hover:text-fur transition-colors">
              capivara
            </span>
          </Link>
          <Link
            href="https://suacapivara.com.br"
            className="text-xs font-mono text-tabaco hover:text-cocoa transition-colors flex items-center gap-1"
          >
            Saiba mais
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl">{children}</div>
      </main>

      <footer className="border-t border-line/60 py-6 bg-paper/40">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-[11px] font-mono text-tabaco/80 leading-relaxed">
            Esta pagina confirma apenas a autenticidade do documento.
            Nao compartilhe relatorios PDF de outras pessoas — Lei Geral
            de Protecao de Dados (LGPD).
          </p>
        </div>
      </footer>
    </div>
  );
}

// =========================================================================
// Card — relatorio autentico
// =========================================================================

function AuthenticCard({ consulta }: { consulta: ConsultaInfo }) {
  const plano =
    findPlano(consulta.plan_tier) ??
    findComboLeilao(consulta.plan_tier);
  const produtoAvulso = findProdutoAvulso(consulta.plan_tier);

  const planoNome = plano?.nome ?? produtoAvulso?.nome ?? consulta.plan_tier;

  const categoriaLabel =
    consulta.category === "cpf"
      ? "CPF"
      : consulta.category === "cnpj"
      ? "CNPJ"
      : "Veicular";

  const masked = maskTarget(consulta.category, consulta.target_value);

  // Contagem de fontes consultadas a partir do result_jsonb.sections
  const sections =
    (consulta.result_jsonb?.sections as Record<string, { status?: string }> | undefined) ??
    {};
  const totalFontes = Object.keys(sections).length;
  const fontesOk = Object.values(sections).filter(
    (s) => s?.status === "sucesso" || s?.status === "cached"
  ).length;

  const emitidoEm = consulta.completed_at ?? consulta.created_at;
  const idCurto = consulta.id.slice(-8).toUpperCase();
  const hashCurto = consulta.target_hash
    ? consulta.target_hash.slice(0, 16)
    : null;

  return (
    <div className="rounded-2xl border border-line bg-card shadow-[var(--shadow-card)] overflow-hidden">
      {/* Topo verde clarinho com badge autentico */}
      <div className="bg-gradient-to-br from-ok/10 via-paper to-cream p-8 pb-6 text-center border-b border-line/60">
        <Mascot pose="concluido" size={88} animate="idle" />

        <Badge variant="ok" className="mt-4 gap-1.5">
          <BadgeCheck className="size-3.5" />
          Documento autentico Capivara
        </Badge>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-cocoa mt-3">
          Relatorio verificado
        </h1>
        <p className="text-tabaco text-sm mt-2 max-w-md mx-auto">
          Este codigo QR foi gerado pela Capivara e aponta pra um
          relatorio real emitido pela plataforma.
        </p>
      </div>

      {/* Corpo com metadados */}
      <div className="p-8 space-y-6">
        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <Field label="Tipo de consulta">
            <Badge variant="outline" className="text-[10px]">
              {categoriaLabel}
            </Badge>
          </Field>
          <Field label="Plano consultado">
            <span className="text-cocoa">{planoNome}</span>
          </Field>
          <Field label="Alvo (mascarado)" mono>
            {masked}
          </Field>
          <Field label="Emitido em">{formatDateTimeBR(emitidoEm)}</Field>
          <Field label="Fontes consultadas">
            {totalFontes} {totalFontes === 1 ? "fonte" : "fontes"}
          </Field>
          <Field label="Com dados disponiveis">
            {fontesOk} de {totalFontes}
          </Field>
        </dl>

        {/* Bloco "Como validar" */}
        <div className="rounded-xl border border-line/60 bg-paper-2/40 p-5">
          <div className="flex items-start gap-2 mb-3">
            <ShieldCheck className="size-4 text-ok mt-0.5 shrink-0" />
            <h2 className="font-display text-base font-semibold text-cocoa">
              Como validar este relatorio
            </h2>
          </div>
          <ul className="space-y-2 text-xs font-mono text-tabaco">
            <li className="flex items-start gap-2">
              <span className="text-cocoa/40 mt-0.5">{"01."}</span>
              <span>
                Este QR foi gerado pela Capivara em{" "}
                <span className="text-cocoa">
                  {formatDateTimeBR(emitidoEm)}
                </span>
                .
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cocoa/40 mt-0.5">{"02."}</span>
              <span>
                ID unico do relatorio:{" "}
                <span className="text-cocoa font-bold">{idCurto}</span>
              </span>
            </li>
            {hashCurto && (
              <li className="flex items-start gap-2">
                <span className="text-cocoa/40 mt-0.5">{"03."}</span>
                <span>
                  Hash do alvo consultado:{" "}
                  <span className="text-cocoa break-all">{hashCurto}…</span>
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Aviso de privacidade */}
        <div className="rounded-xl border border-info/30 bg-info/5 p-4 flex gap-3">
          <Lock className="size-4 text-info mt-0.5 shrink-0" />
          <div className="text-xs text-tabaco leading-relaxed">
            <p className="font-semibold text-cocoa mb-1">Privacidade</p>
            <p>
              Por seguranca, esta pagina nao expoe o conteudo do relatorio.
              Quem precisa dos detalhes deve baixar o PDF original na area
              logada do titular da consulta.
            </p>
          </div>
        </div>
      </div>

      {/* CTA inferior */}
      <div className="border-t border-line/60 bg-paper-2/40 p-6 text-center">
        <p className="text-sm text-tabaco mb-3">
          Quer puxar sua propria capivara?
        </p>
        <Button asChild variant="accent" size="md">
          <Link href="https://suacapivara.com.br/consultar">
            Comecar agora
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// =========================================================================
// Card — nao encontrado / nao concluido
// =========================================================================

function NotFoundShell() {
  return (
    <Shell>
      <div className="rounded-2xl border border-line bg-card shadow-[var(--shadow-card)] p-8 sm:p-12 text-center">
        <div className="mx-auto size-16 rounded-full bg-err/10 flex items-center justify-center mb-4">
          <FileX2 className="size-8 text-err" />
        </div>

        <Badge variant="err" className="mb-3">
          Documento nao encontrado
        </Badge>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-cocoa">
          Nao achamos esse relatorio
        </h1>
        <p className="text-tabaco mt-3 max-w-md mx-auto leading-relaxed">
          Este ID nao corresponde a nenhum relatorio Capivara concluido.
          Pode ser um QR Code danificado, um documento falso ou uma
          consulta que ainda nao foi finalizada.
        </p>

        <div className="mt-6 rounded-lg bg-paper-2/60 border border-line/60 p-3 flex items-start gap-2 text-left max-w-md mx-auto">
          <Info className="size-4 text-info mt-0.5 shrink-0" />
          <p className="text-xs text-tabaco">
            Se voce esperava ver um relatorio aqui, pode pedir pro titular
            reemitir o documento — o QR Code novo tem que apontar pra um
            ID valido do sistema Capivara.
          </p>
        </div>

        <Button asChild variant="primary" size="lg" className="mt-6">
          <Link href="https://suacapivara.com.br">
            Voltar pra suacapivara.com.br
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </Shell>
  );
}

// =========================================================================
// Componentes auxiliares
// =========================================================================

function Field({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10px] font-mono uppercase tracking-wider text-tabaco/70">
        {label}
      </dt>
      <dd className={`mt-1 text-cocoa ${mono ? "font-mono" : ""}`}>
        {children}
      </dd>
    </div>
  );
}

function maskTarget(category: string, value: string): string {
  if (category === "cpf") return maskCPF(value);
  if (category === "cnpj") return maskCNPJ(value);
  // Placa: aparece completa (nao tem dado pessoal)
  return value.toUpperCase();
}
