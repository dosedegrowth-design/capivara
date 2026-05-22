import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatDateTimeBR } from "@/lib/formatters";

export const metadata = {
  title: "Audit · Aceites LGPD · Admin Capivara",
};

const TIPO_LABELS: Record<string, string> = {
  terms_of_use: "Termos de Uso",
  privacy_policy: "Política de Privacidade",
  cookie_policy: "Política de Cookies",
  consultation_responsibility: "Resp. por Consulta",
  company_terms: "Termos B2B",
  api_terms: "Termos da API",
};

export default async function AdminAceitesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; limit?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.account_type !== "admin") redirect("/dashboard");

  const { type, limit } = await searchParams;
  const limitN = Math.min(Number(limit ?? 100), 500);

  const admin = createAdminClient();
  let query = admin
    .from("consent_logs")
    .select(
      "id, user_id, company_id, document_type, document_version, document_hash, accepted_at, ip_address, user_agent, metadata, user:profiles!consent_logs_user_id_fkey(email, full_name)",
      { count: "exact" }
    )
    .order("accepted_at", { ascending: false })
    .limit(limitN);

  if (type) query = query.eq("document_type", type);

  const { data: logs, count } = await query;

  // Counts por tipo (stats)
  const { data: byType } = await admin
    .from("consent_logs")
    .select("document_type")
    .order("document_type");

  const typeCounts: Record<string, number> = {};
  for (const row of byType ?? []) {
    typeCounts[row.document_type] = (typeCounts[row.document_type] ?? 0) + 1;
  }

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          <ShieldCheck className="size-3 mr-1 inline" />
          Audit · LGPD
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Aceites legais (consent_logs)
        </h1>
        <p className="text-tabaco mt-1">
          Append-only. Provas de aceite com IP, timestamp e hash do documento.
          Use pra responder requisição da ANPD, processo judicial ou auditoria.
        </p>
      </header>

      {/* Stats por tipo */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {Object.entries(TIPO_LABELS).map(([key, label]) => (
          <a
            key={key}
            href={`?type=${key}`}
            className={`rounded-lg border p-3 hover:border-fur transition-colors ${
              type === key ? "border-fur bg-fur/5" : "border-line bg-card"
            }`}
          >
            <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco truncate">
              {label}
            </p>
            <p className="font-display text-xl font-bold text-cocoa mt-1">
              {typeCounts[key] ?? 0}
            </p>
          </a>
        ))}
      </div>

      {type && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-tabaco">Filtrando por:</span>
          <Badge variant="accent" className="text-xs">
            {TIPO_LABELS[type] ?? type}
          </Badge>
          <a href="?" className="text-xs text-fur hover:underline">
            Limpar filtro
          </a>
        </div>
      )}

      {/* Tabela */}
      <div className="rounded-lg border border-line bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-2/60 text-xs font-mono uppercase tracking-wider text-tabaco">
            <tr>
              <th className="text-left px-3 py-3">Quando</th>
              <th className="text-left px-3 py-3">Usuário</th>
              <th className="text-left px-3 py-3">Documento</th>
              <th className="text-left px-3 py-3 hidden md:table-cell">IP</th>
              <th className="text-left px-3 py-3 hidden lg:table-cell">Hash</th>
              <th className="text-left px-3 py-3">Contexto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(logs ?? []).map((log) => {
              const user = log.user as unknown as { email?: string; full_name?: string | null } | null;
              const metadata = (log.metadata ?? {}) as Record<string, unknown>;
              const context = metadata.context as string | undefined;
              return (
                <tr key={log.id}>
                  <td className="px-3 py-2 text-xs text-tabaco whitespace-nowrap">
                    {formatDateTimeBR(log.accepted_at)}
                  </td>
                  <td className="px-3 py-2 text-cocoa text-xs">
                    {user?.full_name ?? user?.email ?? log.user_id.slice(0, 8)}
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-cocoa text-xs">
                      {TIPO_LABELS[log.document_type] ?? log.document_type}
                    </span>
                    <span className="ml-1 text-[10px] font-mono text-tabaco">
                      v{log.document_version}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-tabaco hidden md:table-cell">
                    {log.ip_address ?? "—"}
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    <code className="text-[10px] font-mono text-tabaco" title={log.document_hash}>
                      {log.document_hash.slice(0, 12)}…
                    </code>
                  </td>
                  <td className="px-3 py-2">
                    {context ? (
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {context}
                      </Badge>
                    ) : (
                      <span className="text-tabaco/50 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs font-mono text-tabaco/70">
        Mostrando {logs?.length ?? 0} de {count ?? 0} aceites.
        {(count ?? 0) > limitN && ` Aumente o limit via ?limit=500.`}
      </p>
    </div>
  );
}
