import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany, getCurrentProfile } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { HistoricoClient, type ConsultaRow } from "./historico-client";

export const metadata = {
  title: "Histórico · Empresa · Capivara",
};

export default async function EmpresaHistoricoPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const empresa = await getActiveCompany();
  if (!empresa) redirect("/onboarding/empresa");

  const supabase = await createClient();
  const { data: consultas } = await supabase
    .from("consultations")
    .select(`
      id, category, plan_tier, target_value, status, folhas_used,
      cost_center, created_at, source,
      user:profiles!consultations_user_id_fkey(full_name, email)
    `)
    .eq("company_id", empresa.id)
    .order("created_at", { ascending: false })
    .limit(500);

  // Stats
  const totalConsultas = consultas?.length ?? 0;
  const totalCreditos = (consultas ?? []).reduce(
    (acc, c) => acc + (c.folhas_used ?? 0),
    0
  );
  const concluidas = (consultas ?? []).filter((c) => c.status === "completed").length;
  const viaApi = (consultas ?? []).filter((c) => c.source === "api").length;

  const rows: ConsultaRow[] = (consultas ?? []).map((c) => {
    const u = c.user as unknown as { full_name?: string | null; email?: string } | null;
    return {
      id: c.id,
      category: c.category,
      plan_tier: c.plan_tier,
      target_value: c.target_value,
      status: c.status,
      folhas_used: c.folhas_used,
      cost_center: c.cost_center,
      created_at: c.created_at,
      source: c.source,
      user_full_name: u?.full_name ?? null,
      user_email: u?.email ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Empresa · Histórico
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Histórico da equipe
        </h1>
        <p className="text-tabaco mt-1">
          Tudo que a equipe puxou. Filtre, busque e exporte pra CSV.
        </p>
      </header>

      {/* Stats */}
      {totalConsultas > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={totalConsultas} hint="consultas" />
          <StatCard label="Concluídas" value={concluidas} hint={`${Math.round((concluidas / totalConsultas) * 100)}%`} accent="ok" />
          <StatCard label="Créditos gastos" value={totalCreditos} hint="acumulado" accent="fur" />
          <StatCard label="Via API" value={viaApi} hint={`${Math.round((viaApi / totalConsultas) * 100)}%`} accent="info" />
        </div>
      )}

      {/* Lista */}
      {totalConsultas === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-12 text-center">
          <Mascot pose="padrao" size={80} animate="idle" />
          <h3 className="font-display text-lg font-bold text-cocoa mt-4">
            Sem consultas ainda
          </h3>
          <p className="text-tabaco text-sm mt-2">
            Quando alguém da equipe puxar uma capivara, vai aparecer aqui.
          </p>
        </div>
      ) : (
        <HistoricoClient consultas={rows} />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  accent?: "ok" | "fur" | "info";
}) {
  const accentColor = accent === "ok" ? "text-ok" : accent === "fur" ? "text-fur" : accent === "info" ? "text-info" : "text-cocoa";
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
        {label}
      </p>
      <p className={`font-display text-2xl font-bold mt-1 ${accentColor}`}>{value}</p>
      <p className="text-[10px] font-mono text-tabaco mt-0.5">{hint}</p>
    </div>
  );
}
