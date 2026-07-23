"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, formatDateTimeBR } from "@/lib/formatters";
import { refundConsultationAction, revealTargetAction } from "./actions";

interface ConsultaRow {
  id: string;
  category: string;
  target_value: string;
  target_masked: string;
  plan_tier: string;
  amount_cents: number;
  status: string;
  cache_hit: boolean;
  created_at: string;
}

export function ConsultasClient({ initial }: { initial: ConsultaRow[] }) {
  const [rows, setRows] = useState(initial);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [revealedValues, setRevealedValues] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);
  const [filter, setFilter] = useState({ status: "all", query: "" });

  function handleReveal(id: string) {
    startTransition(async () => {
      const r = await revealTargetAction({ consultationId: id });
      if (r.ok && r.data) {
        setRevealedIds((s) => new Set(s).add(id));
        setRevealedValues((v) => ({ ...v, [id]: r.data!.targetValue }));
      } else if (!r.ok) {
        setStatus({ ok: false, message: r.error });
      }
    });
  }

  function handleRefund(row: ConsultaRow) {
    const reason = prompt(
      `Motivo do reembolso pra consulta ${row.plan_tier} (${formatBRL(row.amount_cents)})?\n` +
      "Mín 5 caracteres. Será gravado em audit_logs."
    );
    if (!reason || reason.trim().length < 5) {
      setStatus({ ok: false, message: "Motivo obrigatório (min 5 chars)." });
      return;
    }
    startTransition(async () => {
      const r = await refundConsultationAction({
        consultationId: row.id,
        reason: reason.trim(),
      });
      if (r.ok) {
        setStatus({
          ok: true,
          message: `Reembolso ${r.data?.refundMethod} de ${formatBRL(r.data?.amountCentsRefunded ?? 0)} confirmado.`,
        });
        setRows((rs) =>
          rs.map((x) => (x.id === row.id ? { ...x, status: "refunded" } : x))
        );
      } else {
        setStatus({ ok: false, message: `Falha: ${r.error}` });
      }
    });
  }

  const filtered = rows.filter((r) => {
    if (filter.status !== "all" && r.status !== filter.status) return false;
    if (filter.query) {
      const q = filter.query.toLowerCase();
      if (
        !r.plan_tier.toLowerCase().includes(q) &&
        !r.target_masked.toLowerCase().includes(q) &&
        !r.category.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs text-tabaco mb-1 font-mono">Status</label>
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="rounded border border-line bg-card px-3 py-1.5 text-sm"
          >
            <option value="all">Todos</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="error">Error</option>
            <option value="refunded">Refunded</option>
            <option value="expired">Expired</option>
          </select>
        </div>
        <div className="flex flex-col grow max-w-md">
          <label className="text-xs text-tabaco mb-1 font-mono">Buscar</label>
          <input
            type="text"
            placeholder="Plano, target ou categoria"
            value={filter.query}
            onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
            className="rounded border border-line bg-card px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {status && (
        <div
          role="status"
          className={
            "rounded-lg p-3 text-sm " +
            (status.ok
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800")
          }
        >
          {status.message}
        </div>
      )}

      <div className="rounded-lg border border-line bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
            <tr>
              <th className="text-left px-3 py-3 font-display">Cat</th>
              <th className="text-left px-3 py-3 font-display">Target</th>
              <th className="text-left px-3 py-3 font-display">Plano</th>
              <th className="text-right px-3 py-3 font-display">Valor</th>
              <th className="text-center px-3 py-3 font-display">Cache</th>
              <th className="text-left px-3 py-3 font-display">Status</th>
              <th className="text-left px-3 py-3 font-display">Quando</th>
              <th className="text-right px-3 py-3 font-display">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((c) => {
              const revealed = revealedIds.has(c.id);
              const displayTarget = revealed ? revealedValues[c.id] : c.target_masked;
              return (
                <tr key={c.id}>
                  <td className="px-3 py-2 uppercase font-mono text-cocoa text-xs">
                    {c.category}
                  </td>
                  <td className="px-3 py-2 font-mono text-cocoa text-xs">
                    {displayTarget}
                    {!revealed ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => handleReveal(c.id)}
                        className="ml-2 text-[10px] text-fur hover:underline"
                      >
                        revelar
                      </button>
                    ) : null}
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
                          : c.status === "refunded"
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
                  <td className="px-3 py-2 text-right">
                    {["paid", "processing", "completed"].includes(c.status) ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() => handleRefund(c)}
                      >
                        Reembolsar
                      </Button>
                    ) : null}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-tabaco py-6 text-sm">
                  Nenhuma consulta com esses filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
