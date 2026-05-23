"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Download, Filter, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBRL, formatDateTimeBR } from "@/lib/formatters";

export interface ConsultaRow {
  id: string;
  category: string;
  plan_tier: string;
  target_value: string;
  status: string;
  amount_cents: number | null;
  cost_center: string | null;
  created_at: string;
  source: string | null;
  user_full_name?: string | null;
  user_email?: string | null;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "completed", label: "Concluídas" },
  { value: "processing", label: "Processando" },
  { value: "paid", label: "Pagas" },
  { value: "error", label: "Erro" },
];

const CATEGORIA_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "cpf", label: "CPF" },
  { value: "cnpj", label: "CNPJ" },
  { value: "veicular", label: "Veicular" },
];

export function HistoricoClient({ consultas }: { consultas: ConsultaRow[] }) {
  const [search, setSearch] = useState("");
  const [categoria, setCategoria] = useState("all");
  const [status, setStatus] = useState("all");
  const [source, setSource] = useState("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return consultas.filter((c) => {
      if (q && !c.target_value.toLowerCase().includes(q)) return false;
      if (categoria !== "all" && c.category !== categoria) return false;
      if (status !== "all" && c.status !== status) return false;
      if (source !== "all" && c.source !== source) return false;
      return true;
    });
  }, [consultas, search, categoria, status, source]);

  function exportCSV() {
    const headers = [
      "id",
      "user",
      "categoria",
      "plano",
      "target",
      "custo_brl",
      "centro_custo",
      "status",
      "fonte",
      "data",
    ];
    const rows = filtered.map((c) => [
      c.id,
      c.user_full_name ?? c.user_email ?? "—",
      c.category,
      c.plan_tier,
      c.target_value,
      ((c.amount_cents ?? 0) / 100).toFixed(2),
      c.cost_center ?? "",
      c.status,
      c.source ?? "web",
      formatDateTimeBR(c.created_at),
    ]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => r.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capivara-consultas-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="rounded-lg border border-line bg-card p-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
              Buscar target
            </label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-tabaco/50" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="CPF, CNPJ, placa..."
                className="pl-9"
              />
            </div>
          </div>

          <FilterSelect
            label="Categoria"
            value={categoria}
            onChange={setCategoria}
            options={CATEGORIA_OPTIONS}
          />

          <FilterSelect
            label="Status"
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
          />

          <FilterSelect
            label="Fonte"
            value={source}
            onChange={setSource}
            options={[
              { value: "all", label: "Todas" },
              { value: "web", label: "Painel" },
              { value: "api", label: "API" },
            ]}
          />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-line/60">
          <p className="text-xs text-tabaco font-mono">
            <Filter className="size-3 inline mr-1" />
            {filtered.length} de {consultas.length} consultas
          </p>
          <Button onClick={exportCSV} size="sm" variant="secondary" disabled={filtered.length === 0}>
            <Download className="size-3.5 mr-1" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-card p-10 text-center">
          <p className="text-tabaco">Nenhuma consulta corresponde aos filtros.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-card overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
              <tr>
                <th className="text-left px-3 py-3 font-display">Usuário</th>
                <th className="text-left px-3 py-3 font-display">Categoria</th>
                <th className="text-left px-3 py-3 font-display">Target</th>
                <th className="text-right px-3 py-3 font-display">Custo</th>
                <th className="text-left px-3 py-3 font-display hidden md:table-cell">Centro</th>
                <th className="text-left px-3 py-3 font-display">Status</th>
                <th className="text-left px-3 py-3 font-display hidden sm:table-cell">Fonte</th>
                <th className="text-left px-3 py-3 font-display whitespace-nowrap">Quando</th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="px-3 py-2 text-cocoa text-xs">
                    {c.user_full_name ?? c.user_email ?? "—"}
                  </td>
                  <td className="px-3 py-2 uppercase font-mono text-cocoa text-xs">
                    {c.category}
                  </td>
                  <td className="px-3 py-2 font-mono text-cocoa text-xs">
                    {c.target_value}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-fur">
                    {formatBRL(c.amount_cents ?? 0)}
                  </td>
                  <td className="px-3 py-2 text-tabaco text-xs font-mono hidden md:table-cell">
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
                  <td className="px-3 py-2 hidden sm:table-cell">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {c.source ?? "web"}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-cocoa focus:outline-none focus:ring-2 focus:ring-fur/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function escapeCSV(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
