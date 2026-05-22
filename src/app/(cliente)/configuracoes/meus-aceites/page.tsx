import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { listUserConsents } from "@/lib/legal/consent";
import { ALL_DOCUMENTS, type DocumentType } from "@/lib/legal/documents";
import { formatDateTimeBR } from "@/lib/formatters";

export const metadata = {
  title: "Meus aceites · Capivara",
};

const TIPO_LABELS: Record<DocumentType, string> = {
  terms_of_use: "Termos de Uso",
  privacy_policy: "Política de Privacidade",
  cookie_policy: "Política de Cookies",
  consultation_responsibility: "Termo de Responsabilidade por Consulta",
  company_terms: "Termos B2B / Empresa",
  api_terms: "Termos da API",
};

export default async function MeusAceitesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const consents = await listUserConsents(profile.id);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-6">
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors"
      >
        <ArrowLeft className="size-4" />
        Configurações
      </Link>

      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          <ShieldCheck className="size-3 mr-1 inline" />
          Histórico LGPD
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Meus aceites
        </h1>
        <p className="text-tabaco mt-1">
          Tudo que você aceitou na Capivara, com data, IP e hash de integridade.
          Este histórico tem valor probatório (Lei 14.063/2020) e pode ser usado
          como evidência em qualquer processo.
        </p>
      </header>

      <div className="rounded-lg border border-info/30 bg-info/5 p-4 text-sm text-cocoa">
        <p>
          <strong>Total de aceites:</strong>{" "}
          <span className="font-mono text-fur">{consents.length}</span>
          {" · "}
          <strong>Retenção:</strong> 5 anos (LGPD)
        </p>
      </div>

      {consents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-10 text-center">
          <p className="text-tabaco text-sm">Nenhum aceite registrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {consents.map((c) => {
            const type = c.document_type as DocumentType;
            const docInfo = ALL_DOCUMENTS[type];
            const metadata = (c.metadata ?? {}) as Record<string, unknown>;

            return (
              <details
                key={c.id}
                className="group rounded-lg border border-line bg-card overflow-hidden"
              >
                <summary className="cursor-pointer p-4 flex items-start gap-3 list-none">
                  <FileText className="size-4 text-fur mt-1 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-medium text-cocoa">
                        {TIPO_LABELS[type] ?? type}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        v{c.document_version}
                      </Badge>
                    </div>
                    <p className="text-xs text-tabaco">
                      {formatDateTimeBR(c.accepted_at)}
                      {c.ip_address && (
                        <span className="ml-2 font-mono">· IP {c.ip_address}</span>
                      )}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-tabaco group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>

                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-line/40 bg-paper-2/30">
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                    <Field label="ID do registro" value={c.id} mono />
                    <Field label="Versão" value={c.document_version} mono />
                    <Field
                      label="Hash do documento (SHA-256)"
                      value={c.document_hash}
                      mono
                      truncate
                    />
                    <Field label="IP" value={c.ip_address ?? "—"} mono />
                    {c.user_agent && (
                      <Field
                        label="User-Agent"
                        value={c.user_agent}
                        mono
                        truncate
                        full
                      />
                    )}
                    <Field
                      label="Aceito em"
                      value={formatDateTimeBR(c.accepted_at)}
                    />
                  </dl>

                  {Object.keys(metadata).length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco mb-1">
                        Contexto
                      </p>
                      <pre className="text-[10px] font-mono bg-cocoa text-cream p-2 rounded overflow-x-auto">
                        {JSON.stringify(metadata, null, 2)}
                      </pre>
                    </div>
                  )}

                  {docInfo && (
                    <Link
                      href={docInfo.publicUrl}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-fur hover:underline mt-2"
                    >
                      <FileText className="size-3" />
                      Ver documento atual (v{docInfo.version})
                    </Link>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  truncate,
  full,
}: {
  label: string;
  value: string;
  mono?: boolean;
  truncate?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <dt className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
        {label}
      </dt>
      <dd
        className={`text-cocoa ${mono ? "font-mono" : ""} ${
          truncate ? "truncate" : ""
        }`}
        title={value}
      >
        {value}
      </dd>
    </div>
  );
}
