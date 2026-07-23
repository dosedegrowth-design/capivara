import Link from "next/link";
import {
  Coins,
  Users,
  Search,
  TrendingUp,
  ArrowRight,
  Code2,
  Webhook,
  Receipt,
  Activity,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany, getCurrentProfile } from "@/lib/auth/session";
import { formatBRL, formatDateTimeBR } from "@/lib/formatters";

export default async function EmpresaDashboard() {
  const profile = await getCurrentProfile();
  const empresa = await getActiveCompany();
  if (!profile || !empresa) return null;

  const supabase = await createClient();

  // KPIs
  const { count: totalConsultas } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })
    .eq("company_id", empresa.id);

  const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data: consultasMes } = await supabase
    .from("consultations")
    .select("amount_cents")
    .eq("company_id", empresa.id)
    .gte("created_at", trintaDiasAtras);

  const gastoMesCents = (consultasMes ?? []).reduce(
    (s, c) => s + (c.amount_cents ?? 0),
    0
  );

  const { count: totalMembros } = await supabase
    .from("company_members")
    .select("*", { count: "exact", head: true })
    .eq("company_id", empresa.id);

  // Últimas consultas
  const { data: ultimas } = await supabase
    .from("consultations")
    .select("id, category, target_value, status, amount_cents, created_at")
    .eq("company_id", empresa.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // Atividade últimos 14 dias (gráfico)
  const start14d = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const { data: atividade } = await supabase
    .from("consultations")
    .select("created_at")
    .eq("company_id", empresa.id)
    .gte("created_at", start14d.toISOString());

  const byDay: Record<string, number> = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    byDay[d.toISOString().slice(0, 10)] = 0;
  }
  for (const c of atividade ?? []) {
    const key = c.created_at.slice(0, 10);
    if (key in byDay) byDay[key]++;
  }
  const atividadeDias = Object.entries(byDay)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, count]) => ({ day, count }));
  const maxAtividade = Math.max(...atividadeDias.map((d) => d.count), 1);

  const nomeCurto = (profile.full_name ?? profile.email).split(" ")[0];
  // Saldo baixo: menos de R$ 50 disponiveis em saldo.
  const saldoBaixo = (empresa.balance_cents ?? 0) < 5000;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 font-mono">
            {empresa.name} · {empresa.plan_tier}
          </Badge>
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Olá, {nomeCurto} 👋
          </h1>
          <p className="text-tabaco mt-1">Bem-vinda ao painel empresarial.</p>
        </div>
        <Button asChild variant="accent" size="lg">
          <Link href="/empresa/nova-consulta">
            Nova consulta
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      {/* Saldo disponivel em destaque */}
      <section
        className={`rounded-2xl p-6 md:p-8 ${
          saldoBaixo
            ? "bg-warn/10 border-2 border-warn/40"
            : "bg-cocoa text-cream"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div
              className={`flex items-center gap-2 text-xs font-mono uppercase tracking-widest ${
                saldoBaixo ? "text-warn" : "text-cream/70"
              }`}
            >
              <Coins className="size-4" />
              Saldo disponível
            </div>
            <p
              className={`font-display text-5xl font-bold mt-2 ${
                saldoBaixo ? "text-cocoa" : "text-cream"
              }`}
            >
              {formatBRL(empresa.balance_cents ?? 0)}
            </p>
            {saldoBaixo && (
              <p className="text-sm text-cocoa mt-2 max-w-md">
                Seu saldo está baixo. Recarregue para não interromper consultas.
              </p>
            )}
          </div>
          <Button
            asChild
            variant={saldoBaixo ? "accent" : "secondary"}
            size="lg"
          >
            <Link href="/empresa/creditos">
              {saldoBaixo ? "Recarregar agora" : "Adicionar saldo"}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid gap-4 sm:grid-cols-3">
        <KPI
          icon={Search}
          label="Consultas totais"
          value={String(totalConsultas ?? 0)}
        />
        <KPI
          icon={TrendingUp}
          label="Gasto últimos 30d"
          value={formatBRL(gastoMesCents)}
        />
        <KPI
          icon={Users}
          label="Membros da equipe"
          value={String(totalMembros ?? 1)}
          href="/empresa/equipe"
        />
      </section>

      {/* Atividade últimos 14 dias */}
      <section className="rounded-xl border border-line bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-bold text-cocoa flex items-center gap-2">
            <Activity className="size-4 text-fur" />
            Atividade — últimos 14 dias
          </h2>
          <span className="text-[10px] font-mono text-tabaco">
            Total: {atividadeDias.reduce((acc, d) => acc + d.count, 0)} consultas
          </span>
        </div>
        <div className="flex items-end gap-1 h-24">
          {atividadeDias.map((d) => {
            const heightPct = (d.count / maxAtividade) * 100;
            return (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-1 group"
                title={`${d.count} consultas em ${d.day}`}
              >
                <div className="text-[9px] font-mono text-tabaco/40 group-hover:text-fur transition-colors">
                  {d.count > 0 ? d.count : ""}
                </div>
                <div
                  className="w-full rounded-t bg-fur/70 hover:bg-fur transition-all"
                  style={{ height: `${Math.max(heightPct, 2)}%`, minHeight: "2px" }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-[9px] font-mono text-tabaco">
          {atividadeDias
            .filter((_, i) => i % 3 === 0 || i === atividadeDias.length - 1)
            .map((d) => (
              <span key={d.day}>
                {new Date(d.day + "T12:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            ))}
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-display text-lg font-bold text-cocoa mb-3">
          Atalhos
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickAction
            href="/empresa/nova-consulta"
            icon={Search}
            title="Nova consulta"
            description="Puxar capivara pela equipe"
          />
          <QuickAction
            href="/empresa/creditos"
            icon={Coins}
            title="Recarregar saldo"
            description="Comprar pacote Manada"
          />
          <QuickAction
            href="/empresa/api"
            icon={Code2}
            title="API & métricas"
            description="Gerar chave + ver uso"
          />
          <QuickAction
            href="/empresa/webhooks"
            icon={Webhook}
            title="Webhooks"
            description="Configurar + log de entregas"
          />
          <QuickAction
            href="/empresa/equipe"
            icon={Users}
            title="Equipe"
            description="Convidar + permissões"
          />
          <QuickAction
            href="/empresa/historico"
            icon={Activity}
            title="Histórico"
            description="Tudo que a equipe puxou"
          />
          <QuickAction
            href="/empresa/faturamento"
            icon={Receipt}
            title="Faturamento"
            description="Recibos e boletos"
          />
          <QuickAction
            href="/configuracoes"
            icon={Users}
            title="Minha conta"
            description="Perfil + LGPD"
          />
        </div>
      </section>

      {/* Últimas consultas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-cocoa">
            Últimas consultas da equipe
          </h2>
          {ultimas && ultimas.length > 0 && (
            <Link
              href="/empresa/historico"
              className="text-sm font-mono text-fur hover:underline underline-offset-4"
            >
              Ver tudo →
            </Link>
          )}
        </div>

        {!ultimas || ultimas.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-card p-10 flex flex-col items-center text-center">
            <Mascot pose="padrao" size={80} animate="idle" />
            <h3 className="font-display text-lg font-bold text-cocoa mt-4">
              Sua equipe ainda não fez consultas.
            </h3>
            <Button asChild variant="accent" size="md" className="mt-5">
              <Link href="/empresa/nova-consulta">Fazer primeira consulta</Link>
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
                <tr>
                  <th className="text-left px-4 py-3 font-display">Categoria</th>
                  <th className="text-left px-4 py-3 font-display">Target</th>
                  <th className="text-right px-4 py-3 font-display">Custo</th>
                  <th className="text-left px-4 py-3 font-display">Status</th>
                  <th className="text-left px-4 py-3 font-display">Quando</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ultimas.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4 py-3 uppercase font-mono text-cocoa text-xs">
                      {c.category}
                    </td>
                    <td className="px-4 py-3 font-mono text-cocoa text-xs">
                      {c.target_value}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-cocoa">
                      {formatBRL(c.amount_cents ?? 0)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          c.status === "completed"
                            ? "ok"
                            : c.status === "error"
                            ? "err"
                            : "info"
                        }
                        className="text-[10px]"
                      >
                        {c.status}
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
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-lg border border-line bg-card p-5 hover:shadow-[var(--shadow-card)] transition-all">
      <Icon className="size-5 text-fur" />
      <p className="text-xs font-mono text-tabaco mt-3 uppercase tracking-wider">
        {label}
      </p>
      <p className="font-display text-3xl font-bold text-cocoa mt-1">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function QuickAction({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-line bg-card p-4 hover:border-fur hover:shadow-md transition-all"
    >
      <div className="size-9 rounded-lg bg-fur/15 text-fur flex items-center justify-center mb-2 group-hover:bg-fur group-hover:text-cream transition-colors">
        <Icon className="size-4" />
      </div>
      <p className="font-display font-semibold text-cocoa text-sm">{title}</p>
      <p className="text-xs text-tabaco mt-0.5">{description}</p>
    </Link>
  );
}
