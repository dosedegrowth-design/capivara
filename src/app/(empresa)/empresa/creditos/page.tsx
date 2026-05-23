import { Coins, TrendingDown, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/formatters";
import { findPacoteManada } from "@/lib/consultas/planos";
import { redirect } from "next/navigation";
import { CreditosClient } from "./creditos-client";

export const metadata = {
  title: "Saldo · Empresa · Capivara",
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

  // Ultimas 10 transactions (recargas + consultas debitadas do saldo)
  const { data: txs } = await supabase
    .from("transactions")
    .select("id, type, amount_cents, status, payment_method, created_at, paid_at, asaas_response")
    .eq("company_id", empresa.id)
    .order("created_at", { ascending: false })
    .limit(10);

  // Conta consultas pagas do saldo da empresa (payment_type = 'folhas' eh label
  // legado pra "saldo da empresa", nao significa creditos).
  const { count: totalConsultasSaldo } = await supabase
    .from("consultations")
    .select("id", { count: "exact", head: true })
    .eq("company_id", empresa.id)
    .eq("payment_type", "folhas");

  const { data: totalGastoCents } = await supabase
    .from("consultations")
    .select("amount_cents")
    .eq("company_id", empresa.id)
    .eq("payment_type", "folhas");

  const gastoCents = (totalGastoCents ?? []).reduce(
    (acc, c) => acc + (c.amount_cents ?? 0),
    0
  );

  // Lookup do saldo total creditado (valor + bonus) por transaction.
  // O webhook do Asaas guarda o pacoteId em asaas_response.externalReference.
  // Se nao acharmos pacote, mostramos so o valor pago.
  type AsaasResponse = { externalReference?: string | null } | null;
  function getPacoteIdFromTx(tx: { asaas_response?: AsaasResponse }): string | null {
    const ext = tx.asaas_response?.externalReference;
    if (!ext) return null;
    // formato esperado: "company:{id}:pacote:{pacoteId}"
    const m = /pacote:([\w-]+)/.exec(ext);
    return m ? m[1] : null;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Empresa · Saldo
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Saldo da empresa
        </h1>
        <p className="text-tabaco mt-1">
          Recarregue seu saldo em R$ e use quando quiser. Sem mensalidade, sem fidelidade.
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
            {formatBRL(empresa.balance_cents ?? 0)}
          </p>
          <p className="text-sm text-cream/70 mt-1">disponíveis para consultas</p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-tabaco">
            <TrendingUp className="size-4 text-ok" />
            Total consumido
          </div>
          <p className="font-display text-3xl font-bold mt-2 text-cocoa">
            {formatBRL(gastoCents)}
          </p>
          <p className="text-xs text-tabaco mt-1">
            em <strong>{totalConsultasSaldo ?? 0}</strong> consultas
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-card p-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-tabaco">
            <TrendingDown className="size-4 text-info" />
            Status
          </div>
          <p className="font-display text-lg font-bold mt-2 text-cocoa">
            {(empresa.balance_cents ?? 0) > 10000
              ? "Tranquilo"
              : (empresa.balance_cents ?? 0) > 2000
              ? "Recarregue em breve"
              : "Saldo baixo"}
          </p>
          <p className="text-xs text-tabaco mt-1">
            Limite mínimo recomendado: R$ 50,00
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
                    Valor pago
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-tabaco">
                    Saldo creditado
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
                {txs.map((tx) => {
                  const pacoteId = getPacoteIdFromTx(tx as { asaas_response?: AsaasResponse });
                  const pacote = pacoteId ? findPacoteManada(pacoteId) : undefined;
                  const saldoCreditado =
                    pacote?.saldoTotal_centavos ?? tx.amount_cents;
                  return (
                    <tr key={tx.id} className="border-t border-line/40">
                      <td className="px-4 py-3 text-cocoa">
                        {tx.type === "recharge"
                          ? "Recarga"
                          : tx.type === "refund"
                          ? "Reembolso"
                          : "Outro"}
                        {pacote && (
                          <span className="ml-2 text-xs text-tabaco font-mono">
                            · {pacote.nome}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-cocoa">
                        {formatBRL(tx.amount_cents)}
                      </td>
                      <td className="px-4 py-3 font-mono text-cocoa">
                        {tx.type === "recharge" && tx.status === "paid" ? (
                          <span className="text-fur">
                            +{formatBRL(saldoCreditado)}
                          </span>
                        ) : (
                          <span className="text-tabaco/60">—</span>
                        )}
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
                  );
                })}
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
