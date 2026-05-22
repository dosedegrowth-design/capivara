import { Coins, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/formatters";
import { redirect } from "next/navigation";
import { CreditosClient } from "./creditos-client";

export const metadata = {
  title: "Créditos · Empresa · Capivara",
};

export default async function CreditosPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const empresa = await getActiveCompany();
  if (!empresa) redirect("/onboarding/empresa");

  const supabase = await createClient();

  // Verifica se eh admin pra liberar recarga
  const { data: member } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", empresa.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  const isAdmin = member?.role === "admin";

  // Ultimas 10 transactions (recargas + consultas via folhas)
  const { data: txs } = await supabase
    .from("transactions")
    .select("id, type, amount_cents, folhas_added, status, payment_method, created_at, paid_at")
    .eq("company_id", empresa.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Conta consultas que usaram folhas (debitos)
  const { count: totalConsultasFolhas } = await supabase
    .from("consultations")
    .select("id", { count: "exact", head: true })
    .eq("company_id", empresa.id)
    .eq("payment_type", "folhas");

  const { data: totalFolhasGastas } = await supabase
    .from("consultations")
    .select("folhas_used")
    .eq("company_id", empresa.id)
    .eq("payment_type", "folhas");

  const gasto = (totalFolhasGastas ?? []).reduce(
    (acc, c) => acc + (c.folhas_used ?? 0),
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Empresa · Créditos
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Recarregar créditos
        </h1>
        <p className="text-tabaco mt-1">
          Compre créditos antecipados e use quando quiser. Sem mensalidade, sem fidelidade.
        </p>
      </header>

      {/* Saldo + estatisticas */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-cocoa text-cream p-6 md:col-span-1">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cream/70">
            <Coins className="size-4" />
            Saldo atual
          </div>
          <p className="font-display text-5xl font-bold mt-2 text-cream">
            {empresa.folhas_balance}
          </p>
          <p className="text-sm text-cream/70 mt-1">créditos disponíveis</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-tabaco">
            <TrendingUp className="size-4 text-ok" />
            Créditos consumidos
          </div>
          <p className="font-display text-3xl font-bold mt-2 text-cocoa">{gasto}</p>
          <p className="text-xs text-tabaco mt-1">
            em <strong>{totalConsultasFolhas ?? 0}</strong> consultas
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-tabaco">
            <TrendingDown className="size-4 text-info" />
            Status
          </div>
          <p className="font-display text-lg font-bold mt-2 text-cocoa">
            {empresa.folhas_balance > 100
              ? "Tranquilo"
              : empresa.folhas_balance > 20
              ? "Recarregue em breve"
              : "Saldo baixo"}
          </p>
          <p className="text-xs text-tabaco mt-1">
            Limite mínimo recomendado: 50 créditos
          </p>
        </div>
      </div>

      {/* Pacotes Manada */}
      <section>
        <h2 className="font-display text-xl font-bold text-cocoa mb-4">
          Escolha um pacote
        </h2>
        <CreditosClient isAdmin={isAdmin} />
      </section>

      {/* Historico de transactions */}
      {txs && txs.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold text-cocoa mb-4">
            Últimas movimentações
          </h2>
          <div className="rounded-lg border border-line bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper-2/60">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-tabaco">
                    Tipo
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-tabaco">
                    Valor
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-tabaco hidden sm:table-cell">
                    Método
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-tabaco">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-tabaco">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx) => (
                  <tr key={tx.id} className="border-t border-line/40">
                    <td className="px-4 py-3 text-cocoa">
                      {tx.type === "recharge" ? "Recarga" : tx.type === "refund" ? "Reembolso" : "Outro"}
                      {tx.folhas_added ? (
                        <span className="ml-2 text-xs text-fur font-mono">
                          +{tx.folhas_added} cr
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-cocoa">
                      {formatBRL(tx.amount_cents)}
                    </td>
                    <td className="px-4 py-3 text-tabaco text-xs uppercase font-mono hidden sm:table-cell">
                      {tx.payment_method}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-tabaco">
                      {new Date(tx.created_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge variant="ok">Pago</Badge>;
  if (status === "pending") return <Badge variant="warn">Aguardando</Badge>;
  if (status === "expired") return <Badge variant="err">Expirado</Badge>;
  if (status === "cancelled") return <Badge variant="secondary">Cancelado</Badge>;
  if (status === "refunded") return <Badge variant="info">Reembolsado</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}
