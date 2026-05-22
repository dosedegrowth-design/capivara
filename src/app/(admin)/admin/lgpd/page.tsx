import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileText, Trash2, Mail } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatDateTimeBR } from "@/lib/formatters";

export const metadata = {
  title: "LGPD · Admin · Capivara",
};

interface ConsentLog {
  id: string;
  user_id: string;
  document_type: string;
  document_version: string;
  accepted_at: string;
  ip_address: string | null;
  user: { full_name?: string | null; email?: string } | null;
}

export default async function AdminLgpdPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.account_type !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  // Carrega counts
  const [
    { count: totalConsents },
    { count: totalUsers },
    { count: anonymizedConsultas },
    { count: totalConsultas },
    { count: erroLogsLGPD },
  ] = await Promise.all([
    admin.from("consent_logs").select("id", { count: "exact", head: true }),
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("consultations")
      .select("id", { count: "exact", head: true })
      .like("target_value", "%anonimizado%"),
    admin.from("consultations").select("id", { count: "exact", head: true }),
    admin
      .from("error_logs")
      .select("id", { count: "exact", head: true })
      .or("context.eq.lgpd_export,context.eq.deletar_conta"),
  ]);

  // Ultimos aceites de cada tipo (proxy de "consentimentos ativos")
  const { data: recentConsents } = await admin
    .from("consent_logs")
    .select(`
      id, user_id, document_type, document_version, accepted_at, ip_address,
      user:profiles!consent_logs_user_id_fkey(full_name, email)
    `)
    .order("accepted_at", { ascending: false })
    .limit(20);

  // Ações LGPD recentes (export + delete)
  const { data: lgpdActions } = await admin
    .from("error_logs")
    .select("id, context, severity, message, created_at, user_id, metadata")
    .or("context.eq.lgpd_export,context.eq.deletar_conta")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          <ShieldCheck className="size-3 mr-1 inline" />
          Admin
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">LGPD</h1>
        <p className="text-tabaco mt-1">
          Conformidade LGPD: aceites, anonimizações automáticas, solicitações de
          export/delete, ações do Encarregado.
        </p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Aceites" value={totalConsents ?? 0} hint="consent_logs" color="fur" />
        <Stat label="Usuários" value={totalUsers ?? 0} hint="com pelo menos 1 aceite" />
        <Stat
          label="Consultas anonimizadas"
          value={anonymizedConsultas ?? 0}
          hint={`de ${totalConsultas ?? 0} totais`}
          color="info"
        />
        <Stat
          label="Ações LGPD"
          value={erroLogsLGPD ?? 0}
          hint="export + delete"
          color="ok"
        />
      </div>

      {/* DPO contato */}
      <div className="rounded-xl border border-info/30 bg-info/5 p-5">
        <h2 className="font-display font-bold text-cocoa flex items-center gap-2">
          <Mail className="size-5 text-info" />
          Encarregado de Proteção de Dados (DPO)
        </h2>
        <p className="text-sm text-cocoa mt-2">
          Email: <code className="font-mono text-fur">lgpd@capivara.app</code>
        </p>
        <p className="text-xs text-tabaco mt-2 leading-relaxed">
          Solicitações de titulares (Art. 18 LGPD) chegam por email. SLA de
          resposta: <strong>15 dias úteis</strong>. Use{" "}
          <Link href="/admin/aceites" className="text-fur hover:underline">
            /admin/aceites
          </Link>{" "}
          pra audit log de aceites individuais.
        </p>
      </div>

      {/* Procedimento de incidente */}
      <div className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-display font-bold text-cocoa mb-3">
          Procedimento de incidente (LGPD Art. 48)
        </h2>
        <ol className="space-y-2 text-sm text-cocoa">
          <li>
            <strong>1.</strong> Conter o incidente o mais rápido possível
          </li>
          <li>
            <strong>2.</strong> Investigar e documentar: natureza, dados afetados,
            nº aproximado de titulares
          </li>
          <li>
            <strong>3.</strong> Notificar ANPD em até 2 dias úteis quando houver risco relevante
          </li>
          <li>
            <strong>4.</strong> Notificar titulares afetados
          </li>
          <li>
            <strong>5.</strong> Aplicar medidas corretivas
          </li>
        </ol>
        <p className="text-xs text-tabaco font-mono mt-3 pt-3 border-t border-line/60">
          Canal interno: lgpd@capivara.app · Detalhes em /privacidade
        </p>
      </div>

      {/* Ações LGPD recentes */}
      <div className="rounded-xl border border-line bg-card overflow-hidden">
        <div className="p-4 border-b border-line">
          <h2 className="font-display text-lg font-bold text-cocoa flex items-center gap-2">
            <FileText className="size-4 text-fur" />
            Ações LGPD recentes
          </h2>
          <p className="text-xs text-tabaco mt-1">
            Exports de dados e exclusões de conta solicitados pelos titulares.
          </p>
        </div>
        {!lgpdActions || lgpdActions.length === 0 ? (
          <div className="p-8 text-center text-sm text-tabaco">
            Sem ações registradas ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-paper-2/60 text-xs font-mono uppercase tracking-wider text-tabaco">
                <tr>
                  <th className="text-left px-4 py-3">Quando</th>
                  <th className="text-left px-4 py-3">Ação</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">User ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {lgpdActions.map((a) => (
                  <tr key={a.id}>
                    <td className="px-4 py-2 text-xs text-tabaco whitespace-nowrap">
                      {formatDateTimeBR(a.created_at)}
                    </td>
                    <td className="px-4 py-2">
                      {a.context === "lgpd_export" ? (
                        <Badge variant="info" className="text-[10px]">
                          <FileText className="size-3 mr-1 inline" />
                          Export
                        </Badge>
                      ) : (
                        <Badge variant="err" className="text-[10px]">
                          <Trash2 className="size-3 mr-1 inline" />
                          Deletar conta
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <Badge
                        variant={a.severity === "info" ? "ok" : a.severity === "warning" ? "warn" : "err"}
                        className="text-[10px]"
                      >
                        {a.severity}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 text-[10px] font-mono text-tabaco hidden md:table-cell">
                      {a.user_id?.slice(0, 8) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Aceites recentes */}
      <div className="rounded-xl border border-line bg-card overflow-hidden">
        <div className="p-4 border-b border-line flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-cocoa">
            Últimos aceites
          </h2>
          <Link
            href="/admin/aceites"
            className="text-xs text-fur hover:underline"
          >
            Ver todos →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/60 text-xs font-mono uppercase tracking-wider text-tabaco">
              <tr>
                <th className="text-left px-4 py-3">Quando</th>
                <th className="text-left px-4 py-3">Usuário</th>
                <th className="text-left px-4 py-3">Documento</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(recentConsents as unknown as ConsentLog[] ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 text-xs text-tabaco whitespace-nowrap">
                    {formatDateTimeBR(c.accepted_at)}
                  </td>
                  <td className="px-4 py-2 text-cocoa text-xs">
                    {c.user?.full_name ?? c.user?.email ?? c.user_id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <span className="text-cocoa">{c.document_type}</span>
                    <span className="ml-2 text-[10px] font-mono text-tabaco">
                      v{c.document_version}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-xs font-mono text-tabaco hidden md:table-cell">
                    {c.ip_address ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: number;
  hint?: string;
  color?: "fur" | "info" | "ok";
}) {
  const colorClass =
    color === "fur" ? "text-fur" : color === "info" ? "text-info" : color === "ok" ? "text-ok" : "text-cocoa";
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">{label}</p>
      <p className={`font-display text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
      {hint && <p className="text-[10px] font-mono text-tabaco mt-0.5">{hint}</p>}
    </div>
  );
}
