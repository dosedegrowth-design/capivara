import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTimeBR } from "@/lib/formatters";

export default async function AntiFraudePage() {
  const admin = createAdminClient();
  const { data: alerts } = await admin
    .from("fraud_alerts")
    .select(`
      id, rule_name, severity, description, ip_address, action_taken,
      resolved, created_at, user_id,
      user:profiles!fraud_alerts_user_id_fkey(email, full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  const abertos = (alerts ?? []).filter((a) => !a.resolved);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Admin · Anti-fraude
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Alertas anti-fraude
        </h1>
        <p className="text-tabaco mt-1">
          {abertos.length} aberto(s) · {(alerts?.length ?? 0) - abertos.length} resolvido(s)
        </p>
      </header>

      {!alerts || alerts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-12 text-center">
          <Mascot pose="concluido" size={80} animate="idle" />
          <h3 className="font-display text-lg font-bold text-cocoa mt-4">
            Tudo limpo
          </h3>
          <p className="text-tabaco mt-1 text-sm">
            Nenhum alerta de fraude registrado. Quando o sistema detectar atividade
            suspeita, vai aparecer aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const user = a.user as { email?: string; full_name?: string | null } | null;
            return (
              <div
                key={a.id}
                className={`rounded-lg border p-4 ${
                  a.resolved
                    ? "border-line bg-card opacity-60"
                    : a.severity === "high"
                    ? "border-err/40 bg-err/5"
                    : a.severity === "medium"
                    ? "border-warn/40 bg-warn/5"
                    : "border-info/40 bg-info/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        variant={
                          a.severity === "high"
                            ? "err"
                            : a.severity === "medium"
                            ? "warn"
                            : "info"
                        }
                      >
                        {a.severity}
                      </Badge>
                      <code className="text-xs font-mono text-tabaco bg-paper-2 px-2 py-0.5 rounded">
                        {a.rule_name}
                      </code>
                      {a.action_taken && (
                        <Badge variant="secondary" className="text-[10px]">
                          {a.action_taken}
                        </Badge>
                      )}
                    </div>
                    <p className="text-cocoa text-sm">{a.description}</p>
                    <p className="text-xs text-tabaco mt-2">
                      Usuário: {user?.full_name ?? user?.email ?? "—"} ·{" "}
                      IP {a.ip_address ?? "—"} ·{" "}
                      {formatDateTimeBR(a.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
