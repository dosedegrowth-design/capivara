import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Receipt } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatBRL, formatDateTimeBR } from "@/lib/formatters";

export const metadata = {
  title: "Financeiro · Admin · Capivara",
};

export default async function AdminFinanceiroPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.account_type !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const now = new Date();
  const start30d = new Date(now);
  start30d.setDate(now.getDate() - 30);
  const start7d = new Date(now);
  start7d.setDate(now.getDate() - 7);
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  // Carrega transactions pagas (ja confirmadas)
  const { data: paidTxs } = await admin
    .from("transactions")
    .select("id, type, amount_cents, status, payment_method, company_id, user_id, paid_at, created_at, folhas_added, asaas_response")
    .eq("status", "paid")
    .order("paid_at", { ascending: false })
    .limit(500);

  const txs = paidTxs ?? [];

  // Stats
  const total = txs.reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);
  const total30d = txs
    .filter((t) => t.paid_at && new Date(t.paid_at) >= start30d)
    .reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);
  const total7d = txs
    .filter((t) => t.paid_at && new Date(t.paid_at) >= start7d)
    .reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);
  const totalMonth = txs
    .filter((t) => t.paid_at && new Date(t.paid_at) >= startMonth)
    .reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);
  const totalPrevMonth = txs
    .filter(
      (t) =>
        t.paid_at &&
        new Date(t.paid_at) >= startPrevMonth &&
        new Date(t.paid_at) <= endPrevMonth
    )
    .reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);

  // Por tipo
  const consultaB2C = txs
    .filter((t) => t.type === "consultation")
    .reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);
  const rechargeB2B = txs
    .filter((t) => t.type === "recharge")
    .reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);
  const refunds = txs
    .filter((t) => t.type === "refund")
    .reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);

  // Por metodo
  const byMethod: Record<string, number> = {};
  for (const t of txs) {
    if (t.amount_cents) {
      byMethod[t.payment_method] = (byMethod[t.payment_method] ?? 0) + t.amount_cents;
    }
  }

  // Pendentes (a confirmar)
  const { data: pending } = await admin
    .from("transactions")
    .select("id, amount_cents")
    .eq("status", "pending");
  const pendingTotal = (pending ?? []).reduce((acc, t) => acc + (t.amount_cents ?? 0), 0);
  const pendingCount = pending?.length ?? 0;

  // Receita por dia nos ultimos 30 dias
  const byDay: Record<string, number> = {};
  for (const t of txs) {
    if (t.paid_at && new Date(t.paid_at) >= start30d) {
      const day = t.paid_at.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + (t.amount_cents ?? 0);
    }
  }
  const sortedDays = Object.entries(byDay).sort((a, b) => b[0].localeCompare(a[0]));
  const maxDayValue = Math.max(...Object.values(byDay), 1);

  // Variacao mes anterior
  const variacaoMes = totalPrevMonth > 0
    ? ((totalMonth - totalPrevMonth) / totalPrevMonth) * 100
    : 0;

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          <DollarSign className="size-3 mr-1 inline" />
          Admin
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">Financeiro</h1>
        <p className="text-tabaco mt-1">
          Receita confirmada (transactions com status=paid). Atualizado em tempo real.
        </p>
      </header>

      {/* Stats macro */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total acumulado" value={formatBRL(total)} hint="todo período" />
        <Stat label="Últimos 30 dias" value={formatBRL(total30d)} color="fur" />
        <Stat label="Últimos 7 dias" value={formatBRL(total7d)} color="info" />
        <Stat label="Pendentes" value={formatBRL(pendingTotal)} color="warn" hint={`${pendingCount} cobranças`} />
      </div>

      {/* Mes atual vs anterior */}
      <div className="rounded-xl border border-line bg-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
              Mês atual ({now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })})
            </p>
            <p className="font-display text-3xl font-bold text-cocoa mt-1">
              {formatBRL(totalMonth)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
              Mês anterior
            </p>
            <p className="font-display text-2xl font-bold text-tabaco">
              {formatBRL(totalPrevMonth)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
              Variação
            </p>
            <div className="flex items-center gap-1 mt-1">
              {variacaoMes >= 0 ? (
                <TrendingUp className="size-5 text-ok" />
              ) : (
                <TrendingDown className="size-5 text-red-600" />
              )}
              <p className={`font-display text-2xl font-bold ${variacaoMes >= 0 ? "text-ok" : "text-red-600"}`}>
                {variacaoMes >= 0 ? "+" : ""}{variacaoMes.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown por tipo */}
      <div className="grid md:grid-cols-3 gap-3">
        <Breakdown label="Consultas B2C avulsas" value={formatBRL(consultaB2C)} pct={consultaB2C / Math.max(total, 1)} />
        <Breakdown label="Recargas B2B" value={formatBRL(rechargeB2B)} pct={rechargeB2B / Math.max(total, 1)} color="fur" />
        <Breakdown label="Reembolsos" value={formatBRL(refunds)} pct={refunds / Math.max(total, 1)} color="red" />
      </div>

      {/* Por metodo de pagamento */}
      <div className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-display text-lg font-bold text-cocoa mb-4">
          Por método de pagamento
        </h2>
        <div className="space-y-2">
          {Object.entries(byMethod)
            .sort((a, b) => b[1] - a[1])
            .map(([method, value]) => {
              const pct = (value / Math.max(total, 1)) * 100;
              return (
                <div key={method}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-cocoa uppercase font-mono">{method}</span>
                    <span className="font-mono text-cocoa font-medium">
                      {formatBRL(value)}
                      <span className="text-tabaco text-xs ml-1">({pct.toFixed(1)}%)</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-paper-2 overflow-hidden">
                    <div
                      className="h-full bg-fur"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Receita por dia (ultimos 30 dias) */}
      {sortedDays.length > 0 && (
        <div className="rounded-xl border border-line bg-card p-5">
          <h2 className="font-display text-lg font-bold text-cocoa mb-4">
            Receita por dia (últimos 30 dias)
          </h2>
          <div className="space-y-1">
            {sortedDays.slice(0, 15).map(([day, value]) => {
              const widthPct = (value / maxDayValue) * 100;
              return (
                <div key={day} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-tabaco w-20 shrink-0">
                    {new Date(day + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <div className="flex-1 h-5 rounded bg-paper-2 overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-fur to-saffron"
                      style={{ width: `${widthPct}%` }}
                    />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] font-mono text-cocoa">
                      {formatBRL(value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ultimas transactions */}
      <div className="rounded-xl border border-line bg-card overflow-hidden">
        <div className="p-4 border-b border-line">
          <h2 className="font-display text-lg font-bold text-cocoa flex items-center gap-2">
            <Receipt className="size-4 text-fur" />
            Últimas transações confirmadas
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/60 text-xs font-mono uppercase tracking-wider text-tabaco">
              <tr>
                <th className="text-left px-4 py-3">Quando</th>
                <th className="text-left px-4 py-3">Tipo</th>
                <th className="text-right px-4 py-3">Valor</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Método</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Asaas ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {txs.slice(0, 50).map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2 text-xs text-tabaco whitespace-nowrap">
                    {t.paid_at ? formatDateTimeBR(t.paid_at) : "—"}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    <Badge variant="outline" className="text-[10px]">
                      {t.type}
                    </Badge>
                    {t.folhas_added ? (
                      <span className="ml-2 text-[10px] text-fur font-mono">
                        +{t.folhas_added}cr
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-cocoa">
                    {formatBRL(t.amount_cents)}
                  </td>
                  <td className="px-4 py-2 text-xs uppercase font-mono text-tabaco hidden md:table-cell">
                    {t.payment_method}
                  </td>
                  <td className="px-4 py-2 text-[10px] font-mono text-tabaco/70 hidden lg:table-cell truncate max-w-[160px]">
                    {(t.asaas_response as Record<string, unknown>)?._admin_adjustment ? (
                      <span className="text-saffron">[ajuste manual]</span>
                    ) : (
                      (t.asaas_response as Record<string, unknown> & { id?: string })?.id ?? "—"
                    )}
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
  value: string;
  hint?: string;
  color?: "fur" | "info" | "warn";
}) {
  const colorClass =
    color === "fur" ? "text-fur" : color === "info" ? "text-info" : color === "warn" ? "text-saffron" : "text-cocoa";
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">{label}</p>
      <p className={`font-display text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
      {hint && <p className="text-[10px] font-mono text-tabaco mt-0.5">{hint}</p>}
    </div>
  );
}

function Breakdown({
  label,
  value,
  pct,
  color,
}: {
  label: string;
  value: string;
  pct: number;
  color?: "fur" | "red";
}) {
  const barColor = color === "fur" ? "bg-fur" : color === "red" ? "bg-red-500" : "bg-cocoa";
  const textColor = color === "fur" ? "text-fur" : color === "red" ? "text-red-600" : "text-cocoa";
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">{label}</p>
      <p className={`font-display text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
      <div className="mt-2 h-1.5 rounded-full bg-paper-2 overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${pct * 100}%` }} />
      </div>
      <p className="text-[10px] font-mono text-tabaco mt-1">{(pct * 100).toFixed(1)}% do total</p>
    </div>
  );
}
