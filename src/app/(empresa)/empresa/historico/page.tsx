import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/auth/session";
import { formatDateTimeBR } from "@/lib/formatters";

export default async function EmpresaHistoricoPage() {
  const empresa = await getActiveCompany();
  if (!empresa) return null;

  const supabase = await createClient();
  const { data: consultas } = await supabase
    .from("consultations")
    .select(`
      id, category, plan_tier, target_value, status, folhas_used,
      cost_center, created_at,
      user:profiles!consultations_user_id_fkey(full_name, email)
    `)
    .eq("company_id", empresa.id)
    .order("created_at", { ascending: false })
    .limit(100);

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
          Últimas 100 consultas. {consultas?.length ?? 0} exibidas.
        </p>
      </header>

      {!consultas || consultas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-12 text-center">
          <Mascot pose="padrao" size={80} animate="idle" />
          <h3 className="font-display text-lg font-bold text-cocoa mt-4">
            Sem consultas ainda
          </h3>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
              <tr>
                <th className="text-left px-3 py-3 font-display">Usuário</th>
                <th className="text-left px-3 py-3 font-display">Categoria</th>
                <th className="text-left px-3 py-3 font-display">Target</th>
                <th className="text-right px-3 py-3 font-display">Créditos</th>
                <th className="text-left px-3 py-3 font-display">Centro</th>
                <th className="text-left px-3 py-3 font-display">Status</th>
                <th className="text-left px-3 py-3 font-display">Quando</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {consultas.map((c) => {
                const u = c.user as { full_name?: string | null; email?: string } | null;
                return (
                  <tr key={c.id}>
                    <td className="px-3 py-2 text-cocoa text-xs">
                      {u?.full_name ?? u?.email ?? "—"}
                    </td>
                    <td className="px-3 py-2 uppercase font-mono text-cocoa text-xs">
                      {c.category}
                    </td>
                    <td className="px-3 py-2 font-mono text-cocoa text-xs">
                      {c.target_value}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      {c.folhas_used ?? 0}
                    </td>
                    <td className="px-3 py-2 text-tabaco text-xs font-mono">
                      {c.cost_center ?? "—"}
                    </td>
                    <td className="px-3 py-2">
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
                    <td className="px-3 py-2 text-tabaco text-xs whitespace-nowrap">
                      {formatDateTimeBR(c.created_at)}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/historico/${c.id}`}
                        className="text-fur text-xs hover:underline"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
