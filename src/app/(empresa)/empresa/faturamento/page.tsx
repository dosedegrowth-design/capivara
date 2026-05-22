import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, FileText, Receipt } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { formatBRL, formatDateTimeBR } from "@/lib/formatters";

export const metadata = {
  title: "Faturamento · Empresa · Capivara",
};

export default async function FaturamentoPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const empresa = await getActiveCompany();
  if (!empresa) redirect("/onboarding/empresa");

  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select(
      "id, amount_cents, folhas_added, bonus_percentage, status, payment_method, asaas_payment_id, invoice_url, invoice_number, boleto_url, created_at, paid_at, due_date"
    )
    .eq("company_id", empresa.id)
    .eq("type", "recharge")
    .order("created_at", { ascending: false })
    .limit(100);

  const pagas = (transactions ?? []).filter((t) => t.status === "paid");
  const totalPago = pagas.reduce((acc, t) => acc + t.amount_cents, 0);
  const totalCreditos = pagas.reduce((acc, t) => acc + (t.folhas_added ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-6">
      <header className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <Badge variant="outline" className="mb-2 font-mono">
            Empresa · Faturamento
          </Badge>
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Faturamento
          </h1>
          <p className="text-tabaco mt-1">
            Histórico de recargas, NF-e emitidas e boletos.
          </p>
        </div>
        <Button asChild variant="accent">
          <Link href="/empresa/creditos">
            <Receipt className="size-4 mr-1" />
            Recarregar
          </Link>
        </Button>
      </header>

      {pagas.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-lg border border-line bg-card p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
              Total investido
            </p>
            <p className="font-display text-2xl font-bold text-cocoa mt-1">
              {formatBRL(totalPago)}
            </p>
            <p className="text-[10px] font-mono text-tabaco mt-0.5">acumulado</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
              Créditos comprados
            </p>
            <p className="font-display text-2xl font-bold text-fur mt-1">
              {totalCreditos}
            </p>
            <p className="text-[10px] font-mono text-tabaco mt-0.5">acumulado</p>
          </div>
          <div className="rounded-lg border border-line bg-card p-4">
            <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
              Recargas
            </p>
            <p className="font-display text-2xl font-bold text-info mt-1">
              {pagas.length}
            </p>
            <p className="text-[10px] font-mono text-tabaco mt-0.5">confirmadas</p>
          </div>
        </div>
      )}

      {!transactions || transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-10 text-center">
          <FileText className="size-10 text-tabaco/40 mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-cocoa">
            Sem recargas ainda
          </h3>
          <p className="text-tabaco text-sm mt-1">
            Quando a empresa fizer sua primeira recarga, vai aparecer aqui.
          </p>
          <Button asChild variant="accent" size="md" className="mt-4">
            <Link href="/empresa/creditos">
              <Receipt className="size-4 mr-1" />
              Fazer primeira recarga
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
              <tr>
                <th className="text-left px-4 py-3 font-display">Data</th>
                <th className="text-right px-4 py-3 font-display">Valor</th>
                <th className="text-right px-4 py-3 font-display">Créditos</th>
                <th className="text-left px-4 py-3 font-display hidden sm:table-cell">Método</th>
                <th className="text-left px-4 py-3 font-display">Status</th>
                <th className="text-left px-4 py-3 font-display hidden md:table-cell">NF-e</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-4 py-3 text-xs text-tabaco whitespace-nowrap">
                    {formatDateTimeBR(tx.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-semibold text-cocoa">
                    {formatBRL(tx.amount_cents)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-fur">
                    +{tx.folhas_added ?? 0}
                    {tx.bonus_percentage ? (
                      <span className="text-[10px] text-saffron ml-1">
                        ({tx.bonus_percentage}%)
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {tx.payment_method}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {tx.invoice_url ? (
                      <a
                        href={tx.invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-fur hover:underline"
                      >
                        <Download className="size-3" />
                        {tx.invoice_number ?? "Baixar"}
                      </a>
                    ) : tx.status === "paid" ? (
                      <span className="text-[10px] text-tabaco font-mono">processando</span>
                    ) : (
                      <span className="text-[10px] text-tabaco/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {tx.status === "pending" && (
                      <Link
                        href={`/empresa/creditos/aguardando/${tx.id}`}
                        className="text-xs text-fur hover:underline"
                      >
                        Pagar →
                      </Link>
                    )}
                    {tx.status === "paid" && tx.boleto_url && (
                      <a
                        href={tx.boleto_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-tabaco hover:text-fur"
                      >
                        Recibo
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[11px] font-mono text-tabaco/70 leading-relaxed">
        NF-e emitida automaticamente pelo Asaas após confirmação do pagamento.
        Pra dúvidas fiscais, fale com <Link href="/contato" className="text-fur hover:underline">o suporte</Link>.
      </p>
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
