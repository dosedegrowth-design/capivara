import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL, formatDateTimeBR } from "@/lib/formatters";

export default async function AdminConsultasPage() {
  const admin = createAdminClient();
  const { data: consultas } = await admin
    .from("consultations")
    .select("id, user_id, category, plan_tier, target_value, status, amount_cents, cache_hit, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Admin · Consultas
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Consultas
        </h1>
        <p className="text-tabaco mt-1">
          Últimas 100. {consultas?.length ?? 0} exibidas.
        </p>
      </header>

      <div className="rounded-lg border border-line bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
            <tr>
              <th className="text-left px-3 py-3 font-display">Categoria</th>
              <th className="text-left px-3 py-3 font-display">Target</th>
              <th className="text-left px-3 py-3 font-display">Plano</th>
              <th className="text-right px-3 py-3 font-display">Valor</th>
              <th className="text-center px-3 py-3 font-display">Cache</th>
              <th className="text-left px-3 py-3 font-display">Status</th>
              <th className="text-left px-3 py-3 font-display">Quando</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(consultas ?? []).map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2 uppercase font-mono text-cocoa text-xs">
                  {c.category}
                </td>
                <td className="px-3 py-2 font-mono text-cocoa text-xs">
                  {c.target_value}
                </td>
                <td className="px-3 py-2 text-tabaco text-xs">
                  {c.plan_tier.split("-").slice(1).join(" ")}
                </td>
                <td className="px-3 py-2 text-right font-mono text-cocoa text-xs">
                  {formatBRL(c.amount_cents)}
                </td>
                <td className="px-3 py-2 text-center">
                  {c.cache_hit ? "✓" : "—"}
                </td>
                <td className="px-3 py-2">
                  <Badge
                    variant={
                      c.status === "completed"
                        ? "ok"
                        : c.status === "error"
                        ? "err"
                        : c.status === "pending_payment"
                        ? "warn"
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
