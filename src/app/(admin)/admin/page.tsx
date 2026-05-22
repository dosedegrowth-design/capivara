import Link from "next/link";
import {
  Users,
  Search,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Bug,
  Activity,
  Database,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL, formatDateTimeBR } from "@/lib/formatters";

export default async function AdminDashboard() {
  const admin = createAdminClient();

  // KPIs principais
  const [
    { count: totalUsers },
    { count: totalCompanies },
    { count: totalConsultations },
    { count: completedToday },
    { count: openFraudAlerts },
    { count: unresolvedErrors },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("companies").select("*", { count: "exact", head: true }),
    admin.from("consultations").select("*", { count: "exact", head: true }),
    admin
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("completed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    admin.from("fraud_alerts").select("*", { count: "exact", head: true }).eq("resolved", false),
    admin.from("error_logs").select("*", { count: "exact", head: true }).eq("resolved", false),
  ]);

  // Receita
  const { data: paidTxs } = await admin
    .from("transactions")
    .select("amount_cents")
    .eq("status", "paid")
    .gte("paid_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

  const receita30d = (paidTxs ?? []).reduce((s, t) => s + t.amount_cents, 0);

  const { data: paidToday } = await admin
    .from("transactions")
    .select("amount_cents")
    .eq("status", "paid")
    .gte("paid_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const receitaHoje = (paidToday ?? []).reduce((s, t) => s + t.amount_cents, 0);

  // Cache stats
  const { data: cacheStats } = await admin
    .from("api_cache")
    .select("hits")
    .gt("expires_at", new Date().toISOString());

  const totalCacheEntries = cacheStats?.length ?? 0;
  const totalCacheHits = (cacheStats ?? []).reduce((s, c) => s + c.hits, 0);

  // Últimas consultas
  const { data: ultimasConsultas } = await admin
    .from("consultations")
    .select("id, category, plan_tier, target_value, status, amount_cents, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 font-mono">
            Visão geral
          </Badge>
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Painel administrativo
          </h1>
          <p className="text-tabaco mt-1">
            Atualizado em tempo real · {formatDateTimeBR(new Date())}
          </p>
        </div>
      </header>

      {/* Receita */}
      <section>
        <h2 className="font-display text-sm font-mono uppercase tracking-widest text-tabaco mb-3">
          Financeiro
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI
            icon={DollarSign}
            label="Receita 24h"
            value={formatBRL(receitaHoje)}
            tone="ok"
          />
          <KPI
            icon={TrendingUp}
            label="Receita 30 dias"
            value={formatBRL(receita30d)}
          />
          <KPI
            icon={Search}
            label="Consultas concluídas 24h"
            value={String(completedToday ?? 0)}
          />
          <KPI
            icon={Search}
            label="Total de consultas"
            value={String(totalConsultations ?? 0)}
            tone="muted"
          />
        </div>
      </section>

      {/* Usuários */}
      <section>
        <h2 className="font-display text-sm font-mono uppercase tracking-widest text-tabaco mb-3">
          Pessoas e empresas
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KPI
            icon={Users}
            label="Usuários cadastrados"
            value={String(totalUsers ?? 0)}
            href="/admin/usuarios"
          />
          <KPI
            icon={Users}
            label="Empresas ativas"
            value={String(totalCompanies ?? 0)}
            href="/admin/empresas"
          />
          <KPI
            icon={Database}
            label="Cache ativo"
            value={String(totalCacheEntries)}
            sublabel={`${totalCacheHits} hits economizados`}
          />
          <KPI
            icon={Activity}
            label="Cron jobs"
            value="3 ativos"
            sublabel="cleanup · anonymize · recovery"
            tone="muted"
          />
        </div>
      </section>

      {/* Alertas */}
      <section>
        <h2 className="font-display text-sm font-mono uppercase tracking-widest text-tabaco mb-3">
          Atenção
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <AlertaCard
            icon={AlertTriangle}
            label="Alertas anti-fraude abertos"
            value={openFraudAlerts ?? 0}
            href="/admin/anti-fraude"
            tone={openFraudAlerts && openFraudAlerts > 0 ? "warn" : "ok"}
          />
          <AlertaCard
            icon={Bug}
            label="Erros não resolvidos"
            value={unresolvedErrors ?? 0}
            href="/admin/erros"
            tone={unresolvedErrors && unresolvedErrors > 0 ? "err" : "ok"}
          />
        </div>
      </section>

      {/* Últimas consultas */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-sm font-mono uppercase tracking-widest text-tabaco">
            Últimas 10 consultas
          </h2>
          <Link
            href="/admin/consultas"
            className="text-xs font-mono text-fur hover:underline underline-offset-4"
          >
            Ver todas →
          </Link>
        </div>

        {!ultimasConsultas || ultimasConsultas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-card p-8 text-center text-tabaco">
            Nenhuma consulta registrada ainda.
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
                <tr>
                  <th className="text-left px-4 py-3 font-display">Categoria</th>
                  <th className="text-left px-4 py-3 font-display">Target</th>
                  <th className="text-left px-4 py-3 font-display">Plano</th>
                  <th className="text-right px-4 py-3 font-display">Valor</th>
                  <th className="text-left px-4 py-3 font-display">Status</th>
                  <th className="text-left px-4 py-3 font-display">Quando</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ultimasConsultas.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 uppercase font-mono text-cocoa text-xs">
                      {c.category}
                    </td>
                    <td className="px-4 py-3 font-mono text-cocoa text-xs">
                      {c.target_value}
                    </td>
                    <td className="px-4 py-3 text-tabaco">
                      {c.plan_tier.split("-").slice(1).join(" ")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-cocoa">
                      {formatBRL(c.amount_cents)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(c.status)} className="text-[10px]">
                        {statusLabel(c.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-tabaco text-xs whitespace-nowrap">
                      {formatDateTimeBR(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function KPI({
  icon: Icon,
  label,
  value,
  sublabel,
  href,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sublabel?: string;
  href?: string;
  tone?: "ok" | "warn" | "muted";
}) {
  const content = (
    <div className="rounded-lg border border-line bg-card p-5 transition-all hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <Icon
          className={`size-5 ${
            tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-tabaco"
          }`}
        />
      </div>
      <p className="text-xs font-mono text-tabaco mt-3 uppercase tracking-wider">
        {label}
      </p>
      <p className="font-display text-2xl font-bold text-cocoa mt-1">{value}</p>
      {sublabel && (
        <p className="text-[10px] text-tabaco/70 font-mono mt-1">{sublabel}</p>
      )}
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function AlertaCard({
  icon: Icon,
  label,
  value,
  href,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  href: string;
  tone: "ok" | "warn" | "err";
}) {
  return (
    <Link
      href={href}
      className={`rounded-lg border-2 p-5 flex items-center gap-4 transition-all hover:shadow-[var(--shadow-card)] ${
        tone === "ok"
          ? "border-ok/30 bg-ok/5"
          : tone === "warn"
          ? "border-warn/40 bg-warn/10"
          : "border-err/40 bg-err/10"
      }`}
    >
      <Icon
        className={`size-8 ${
          tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-err"
        }`}
      />
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-tabaco">
          {label}
        </p>
        <p className="font-display text-3xl font-bold text-cocoa">{value}</p>
      </div>
      {value > 0 && (
        <Button variant="ghost" size="sm" className="ml-auto">
          Resolver →
        </Button>
      )}
    </Link>
  );
}

function statusVariant(s: string): "ok" | "warn" | "err" | "info" | "secondary" {
  if (s === "completed") return "ok";
  if (s === "processing" || s === "paid") return "info";
  if (s === "pending_payment") return "warn";
  if (s === "error") return "err";
  return "secondary";
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    completed: "Concluída",
    processing: "Processando",
    paid: "Paga",
    pending_payment: "Aguardando",
    error: "Erro",
    expired: "Expirada",
    refunded: "Reembolsada",
  };
  return map[s] ?? s;
}
