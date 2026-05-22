import Link from "next/link";
import { FileText } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatDateTimeBR, formatBRL } from "@/lib/formatters";

export default async function HistoricoPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: consultas } = await supabase
    .from("consultations")
    .select("id, category, plan_tier, target_value, status, amount_cents, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">Histórico</Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Suas consultas
        </h1>
        <p className="text-tabaco mt-1">
          Resultados ficam disponíveis por 90 dias.
        </p>
      </header>

      {!consultas || consultas.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-12 flex flex-col items-center text-center">
          <Mascot pose="padrao" size={96} animate="idle" />
          <h3 className="mt-4 font-display text-lg font-bold text-cocoa">
            Ainda sem capivara puxada por aqui.
          </h3>
          <Button asChild variant="accent" size="md" className="mt-4">
            <Link href="/dashboard/nova-consulta">Fazer primeira consulta</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-cream/40 border-b border-line text-xs uppercase tracking-wider text-tabaco">
              <tr>
                <th className="text-left px-4 py-3 font-display">Categoria</th>
                <th className="text-left px-4 py-3 font-display">Alvo</th>
                <th className="text-left px-4 py-3 font-display">Plano</th>
                <th className="text-right px-4 py-3 font-display">Valor</th>
                <th className="text-left px-4 py-3 font-display">Status</th>
                <th className="text-left px-4 py-3 font-display">Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {consultas.map((c) => (
                <tr key={c.id} className="hover:bg-cream/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-cocoa uppercase font-mono">
                    {c.category}
                  </td>
                  <td className="px-4 py-3 text-sm text-cocoa font-mono">
                    {c.target_value}
                  </td>
                  <td className="px-4 py-3 text-sm text-tabaco">
                    {c.plan_tier.split("-").slice(1).join(" ")}
                  </td>
                  <td className="px-4 py-3 text-sm text-cocoa text-right font-mono">
                    {formatBRL(c.amount_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 text-sm text-tabaco whitespace-nowrap">
                    {formatDateTimeBR(c.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/historico/${c.id}`}
                      className="text-sm text-fur hover:underline underline-offset-4"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "ok" | "warn" | "err" | "info" | "secondary" }> = {
    completed: { label: "Concluída", variant: "ok" },
    processing: { label: "Processando", variant: "info" },
    paid: { label: "Pago", variant: "info" },
    pending_payment: { label: "Aguardando", variant: "warn" },
    error: { label: "Erro", variant: "err" },
    expired: { label: "Expirada", variant: "secondary" },
    refunded: { label: "Reembolsada", variant: "secondary" },
  };
  const cfg = map[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
