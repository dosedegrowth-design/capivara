import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, XCircle, ShieldCheck, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { SiteHeader } from "@/components/capivara/site-header";
import { SiteFooter } from "@/components/capivara/site-footer";
import { createAdminClient } from "@/lib/supabase/admin";
import { findPlano } from "@/lib/consultas/planos";
import { formatDateTimeBR, maskCPF, maskCNPJ } from "@/lib/formatters";

export const metadata: Metadata = {
  title: "Verificar autenticidade",
  description: "Confirme se um relatório Capivara é genuíno.",
};

export default async function VerificarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // UUID v4 simples regex
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isValidUUID) {
    return <VerificacaoNotFound />;
  }

  const admin = createAdminClient();
  const { data: consulta } = await admin
    .from("consultations")
    .select("id, category, plan_tier, target_value, status, created_at, completed_at, expires_at")
    .eq("id", id)
    .maybeSingle();

  if (!consulta) return <VerificacaoNotFound />;

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />

      <main className="flex-1 py-12 md:py-20">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="rounded-2xl border border-line bg-card p-8 md:p-12">
            <Header consulta={consulta} />
            <Detalhes consulta={consulta} />

            <div className="mt-8 pt-6 border-t border-line/60 flex flex-col items-center gap-3 text-center">
              <div className="flex items-center gap-2 text-xs font-mono text-tabaco">
                <ShieldCheck className="size-3.5 text-ok" />
                Esta verificação confere apenas a existência do relatório.
              </div>
              <p className="text-xs text-tabaco/70 font-mono max-w-md">
                O conteúdo completo só pode ser acessado pelo titular da consulta
                via área logada. Nenhum dado sensível é exposto nesta página pública.
              </p>
            </div>
          </div>

          <p className="text-center mt-8 text-sm text-tabaco">
            Quer puxar sua própria capivara?{" "}
            <Link
              href="/consultar"
              className="text-fur underline-offset-4 hover:underline font-medium"
            >
              Começar agora
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Header({ consulta }: { consulta: ConsultaInfo }) {
  const isCompleted = consulta.status === "completed";
  const isExpired = new Date(consulta.expires_at) < new Date();

  if (!isCompleted) {
    return (
      <div className="flex flex-col items-center text-center">
        <Mascot pose="atencao" size={100} animate="idle" />
        <Badge variant="warn" className="mt-4">
          {consulta.status === "processing" ? "Em processamento" : "Não concluída"}
        </Badge>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-cocoa mt-3">
          Relatório ainda não está pronto
        </h1>
        <p className="text-tabaco mt-2">
          Esta consulta existe mas ainda não foi concluída ou apresentou erro.
        </p>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="flex flex-col items-center text-center">
        <XCircle className="size-12 text-warn" />
        <Badge variant="warn" className="mt-4">
          Expirado
        </Badge>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-cocoa mt-3">
          Este relatório expirou
        </h1>
        <p className="text-tabaco mt-2">
          Resultados ficam disponíveis por 90 dias após a consulta. Este já
          foi anonimizado conforme política LGPD.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center">
      <Mascot pose="concluido" size={100} animate="idle" />
      <Badge variant="ok" className="mt-4">
        Autêntico
      </Badge>
      <h1 className="font-display text-2xl md:text-3xl font-bold text-cocoa mt-3">
        Relatório verificado
      </h1>
      <p className="text-tabaco mt-2">
        Este relatório foi gerado pela Capivara e é genuíno.
      </p>
    </div>
  );
}

function Detalhes({ consulta }: { consulta: ConsultaInfo }) {
  const plano = findPlano(consulta.plan_tier);
  const categoriaLabel =
    consulta.category === "cpf"
      ? "CPF"
      : consulta.category === "cnpj"
      ? "CNPJ"
      : "Veicular";

  const masked =
    consulta.category === "cpf"
      ? maskCPF(consulta.target_value)
      : consulta.category === "cnpj"
      ? maskCNPJ(consulta.target_value)
      : consulta.target_value;

  return (
    <dl className="mt-8 grid sm:grid-cols-2 gap-4 text-sm">
      <Field label="Tipo de consulta" value={categoriaLabel} />
      <Field label="Plano" value={plano?.nome ?? consulta.plan_tier} />
      <Field label="Alvo (mascarado)" value={masked} mono />
      <Field label="ID do relatório" value={consulta.id.slice(0, 8) + "…"} mono />
      <Field
        label="Emitido em"
        value={
          consulta.completed_at
            ? formatDateTimeBR(consulta.completed_at)
            : formatDateTimeBR(consulta.created_at)
        }
      />
      <Field
        label="Validade até"
        value={formatDateTimeBR(consulta.expires_at)}
      />
    </dl>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs font-mono uppercase tracking-wider text-tabaco/70">
        {label}
      </dt>
      <dd className={`text-cocoa mt-1 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function VerificacaoNotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-md text-center">
          <XCircle className="size-16 text-err mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Relatório não encontrado
          </h1>
          <p className="text-tabaco mt-3">
            Este ID não corresponde a nenhum relatório válido emitido pela
            Capivara. Pode ser falso, expirado ou um QR Code danificado.
          </p>
          <Button asChild variant="primary" size="lg" className="mt-6">
            <Link href="/">
              Voltar pra home
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

interface ConsultaInfo {
  id: string;
  category: string;
  plan_tier: string;
  target_value: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  expires_at: string;
}
