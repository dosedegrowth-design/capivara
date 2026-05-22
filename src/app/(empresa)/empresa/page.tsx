import Link from "next/link";
import { Coins, Users, Search, TrendingUp, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany, getCurrentProfile } from "@/lib/auth/session";
import { formatDateTimeBR } from "@/lib/formatters";

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
    .select("folhas_used")
    .eq("company_id", empresa.id)
    .gte("created_at", trintaDiasAtras);

  const creditosGastosMes = (consultasMes ?? []).reduce(
    (s, c) => s + (c.folhas_used ?? 0),
    0
  );

  const { count: totalMembros } = await supabase
    .from("company_members")
    .select("*", { count: "exact", head: true })
    .eq("company_id", empresa.id);

  // Últimas consultas
  const { data: ultimas } = await supabase
    .from("consultations")
    .select("id, category, target_value, status, folhas_used, created_at")
    .eq("company_id", empresa.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const nomeCurto = (profile.full_name ?? profile.email).split(" ")[0];
  const saldoBaixo = empresa.folhas_balance < 50;

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

      {/* Saldo de créditos em destaque */}
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
              Saldo de créditos
            </div>
            <p
              className={`font-display text-5xl font-bold mt-2 ${
                saldoBaixo ? "text-cocoa" : "text-cream"
              }`}
            >
              {empresa.folhas_balance}
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
              {saldoBaixo ? "Recarregar agora" : "Adicionar créditos"}
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
          label="Créditos gastos 30d"
          value={String(creditosGastosMes)}
        />
        <KPI
          icon={Users}
          label="Membros da equipe"
          value={String(totalMembros ?? 1)}
          href="/empresa/equipe"
        />
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
                  <th className="text-right px-4 py-3 font-display">Créditos</th>
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
                      {c.folhas_used ?? 0}
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
