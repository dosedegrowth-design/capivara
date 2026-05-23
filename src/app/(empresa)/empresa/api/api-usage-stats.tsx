import { Activity, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/formatters";

export interface ApiUsageStats {
  totalCalls7d: number;
  totalCalls30d: number;
  totalCallsToday: number;
  callsByDay: Array<{ day: string; count: number }>;
  successRate7d: number;
  totalGastoCents7d: number;
  topPlans: Array<{ plan_id: string; count: number }>;
  webhookDeliveries: {
    delivered: number;
    failed: number;
    pending: number;
    exhausted: number;
  };
}

/**
 * Painel de uso da API B2B.
 *
 * Renderizado dentro de /empresa/api com server data. Mostra:
 *  - Stats macro (chamadas hoje/7d/30d)
 *  - Taxa de sucesso
 *  - Créditos gastos via API
 *  - Mini gráfico de barras dos últimos 14 dias
 *  - Top planos consumidos via API
 *  - Status dos webhooks
 */
export function ApiUsageStats({ stats }: { stats: ApiUsageStats }) {
  const maxDay = Math.max(...stats.callsByDay.map((d) => d.count), 1);
  const hasActivity = stats.totalCalls30d > 0;

  return (
    <div className="space-y-4">
      {/* Stats macro */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Chamadas hoje"
          value={stats.totalCallsToday}
          color="info"
        />
        <StatCard
          label="Últimos 7 dias"
          value={stats.totalCalls7d}
          color="fur"
        />
        <StatCard
          label="Últimos 30 dias"
          value={stats.totalCalls30d}
        />
        <StatCard
          label="Taxa de sucesso (7d)"
          value={`${stats.successRate7d.toFixed(1)}%`}
          color={stats.successRate7d >= 95 ? "ok" : stats.successRate7d >= 80 ? "warn" : "err"}
        />
      </div>

      {!hasActivity ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-8 text-center">
          <Activity className="size-8 text-tabaco/40 mx-auto mb-2" />
          <p className="text-sm text-tabaco">
            Sem chamadas à API ainda. Gere uma chave e faça sua primeira chamada.
          </p>
        </div>
      ) : (
        <>
          {/* Gráfico de barras */}
          <div className="rounded-lg border border-line bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-semibold text-cocoa">
                Chamadas por dia (últimos 14 dias)
              </h3>
              <span className="text-[10px] font-mono text-tabaco">
                {formatBRL(stats.totalGastoCents7d)} gastos em 7d
              </span>
            </div>
            <div className="space-y-1">
              {stats.callsByDay.length === 0 ? (
                <p className="text-xs text-tabaco">Sem dados</p>
              ) : (
                stats.callsByDay.map((d) => {
                  const widthPct = (d.count / maxDay) * 100;
                  const date = new Date(d.day + "T12:00:00");
                  return (
                    <div key={d.day} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-tabaco w-16 shrink-0">
                        {date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </span>
                      <div className="flex-1 h-4 rounded bg-paper-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-fur to-saffron transition-all"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-cocoa w-10 text-right">
                        {d.count}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Top planos via API */}
          {stats.topPlans.length > 0 && (
            <div className="rounded-lg border border-line bg-card p-4">
              <h3 className="font-display text-sm font-semibold text-cocoa mb-3 flex items-center gap-2">
                <Zap className="size-4 text-fur" />
                Top planos consumidos via API (30d)
              </h3>
              <div className="space-y-2">
                {stats.topPlans.slice(0, 5).map((p, i) => (
                  <div key={p.plan_id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="size-5 rounded-full bg-paper-2 text-cocoa text-[10px] font-mono flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <code className="font-mono text-xs text-cocoa truncate">{p.plan_id}</code>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                      {p.count} chamadas
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Webhook status */}
          <div className="rounded-lg border border-line bg-card p-4">
            <h3 className="font-display text-sm font-semibold text-cocoa mb-3">
              Status dos webhooks
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <WebhookStat
                label="Entregues"
                value={stats.webhookDeliveries.delivered}
                icon={<CheckCircle2 className="size-3 text-ok" />}
              />
              <WebhookStat
                label="Pendentes"
                value={stats.webhookDeliveries.pending}
                icon={<Activity className="size-3 text-saffron" />}
              />
              <WebhookStat
                label="Falhas"
                value={stats.webhookDeliveries.failed}
                icon={<AlertCircle className="size-3 text-red-600" />}
              />
              <WebhookStat
                label="Esgotadas"
                value={stats.webhookDeliveries.exhausted}
                icon={<AlertCircle className="size-3 text-red-700" />}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: "fur" | "info" | "ok" | "warn" | "err";
}) {
  const colorClass =
    color === "fur"
      ? "text-fur"
      : color === "info"
      ? "text-info"
      : color === "ok"
      ? "text-ok"
      : color === "warn"
      ? "text-saffron"
      : color === "err"
      ? "text-red-600"
      : "text-cocoa";
  return (
    <div className="rounded-lg border border-line bg-card p-3">
      <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">{label}</p>
      <p className={`font-display text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
    </div>
  );
}

function WebhookStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded bg-paper-2 p-2">
      <div className="flex items-center gap-1 text-[10px] font-mono text-tabaco">
        {icon}
        {label}
      </div>
      <p className="font-mono font-bold text-cocoa text-sm mt-1">{value}</p>
    </div>
  );
}
