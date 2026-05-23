"use client";

import { useState, useTransition } from "react";
import {
  Coins,
  Loader2,
  Pause,
  Play,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ajustarSaldoAction, toggleEmpresaAtivaAction } from "./actions";
import { formatBRL, formatCNPJ } from "@/lib/formatters";

export interface EmpresaAdminRow {
  id: string;
  name: string;
  razao_social: string | null;
  cnpj: string;
  balance_cents: number;
  plan_tier: string;
  created_at: string;
  email_billing: string | null;
  fiscal_settings: Record<string, unknown> | null;
  owner_id: string;
  owner_name?: string | null;
  owner_email?: string | null;
  total_consultas?: number;
  total_recargas?: number;
}

interface Props {
  empresas: EmpresaAdminRow[];
}

export function EmpresasAdminClient({ empresas }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<EmpresaAdminRow | null>(null);
  const [modalMode, setModalMode] = useState<"adjust" | "suspend" | null>(null);

  const filtered = empresas.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.razao_social?.toLowerCase().includes(q) ||
      e.cnpj.includes(q) ||
      e.owner_email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="rounded-lg border border-line bg-card p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-tabaco/50" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, CNPJ ou email do owner..."
            className="pl-9"
          />
        </div>
        <p className="text-xs text-tabaco mt-2 font-mono">
          {filtered.length} de {empresas.length} empresas
        </p>
      </div>

      {/* Lista */}
      <div className="rounded-lg border border-line bg-card overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-paper-2/60 text-xs font-mono uppercase tracking-wider text-tabaco">
            <tr>
              <th className="text-left px-4 py-3">Empresa</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">CNPJ</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Owner</th>
              <th className="text-right px-4 py-3">Saldo</th>
              <th className="text-right px-4 py-3 hidden sm:table-cell">Uso</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((e) => {
              const suspended = Boolean(
                e.fiscal_settings?._suspended
              );
              return (
                <tr key={e.id} className={suspended ? "opacity-60" : ""}>
                  <td className="px-4 py-3">
                    <p className="text-cocoa font-medium">{e.name}</p>
                    <p className="text-[10px] text-tabaco font-mono">
                      {e.plan_tier}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell font-mono text-xs text-tabaco">
                    {formatCNPJ(e.cnpj)}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs">
                    <p className="text-cocoa">
                      {e.owner_name ?? e.owner_email ?? "—"}
                    </p>
                    {e.owner_email && e.owner_name && (
                      <p className="text-tabaco font-mono">{e.owner_email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono font-bold text-fur">
                      {formatBRL(e.balance_cents)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden sm:table-cell">
                    <p className="text-xs text-cocoa">
                      <strong>{e.total_consultas ?? 0}</strong> consultas
                    </p>
                    <p className="text-[10px] text-tabaco">
                      {e.total_recargas ?? 0} recargas
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {suspended ? (
                      <Badge variant="err" className="text-[10px]">
                        Suspensa
                      </Badge>
                    ) : (
                      <Badge variant="ok" className="text-[10px]">
                        Ativa
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelected(e);
                          setModalMode("adjust");
                        }}
                        title="Ajustar saldo"
                      >
                        <Coins className="size-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelected(e);
                          setModalMode("suspend");
                        }}
                        title={suspended ? "Reativar" : "Suspender"}
                      >
                        {suspended ? (
                          <Play className="size-3.5" />
                        ) : (
                          <Pause className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de ajuste */}
      {selected && modalMode === "adjust" && (
        <AdjustModal
          empresa={selected}
          onClose={() => {
            setSelected(null);
            setModalMode(null);
          }}
        />
      )}

      {/* Modal de suspensão */}
      {selected && modalMode === "suspend" && (
        <SuspendModal
          empresa={selected}
          onClose={() => {
            setSelected(null);
            setModalMode(null);
          }}
        />
      )}
    </div>
  );
}

function AdjustModal({
  empresa,
  onClose,
}: {
  empresa: EmpresaAdminRow;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [valorReais, setValorReais] = useState("");
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const n = parseFloat(valorReais);
    if (Number.isNaN(n) || n === 0) {
      setError("Digite um valor em R$ (positivo ou negativo, não-zero).");
      return;
    }
    const fd = new FormData();
    fd.set("companyId", empresa.id);
    fd.set("valorReais", String(n));
    fd.set("motivo", motivo);
    startTransition(async () => {
      const res = await ajustarSaldoAction(fd);
      if (res.ok) {
        setSuccess(res.message ?? "OK");
        setValorReais("");
        setMotivo("");
        setTimeout(onClose, 1500);
      } else setError(res.error);
    });
  }

  return (
    <Modal title={`Ajustar saldo (R$) · ${empresa.name}`} onClose={onClose}>
      <p className="text-sm text-tabaco mb-4">
        Saldo atual:{" "}
        <strong className="text-fur font-mono">
          {formatBRL(empresa.balance_cents)}
        </strong>
      </p>
      <form onSubmit={handle} className="space-y-3">
        <div>
          <Label htmlFor="valorReais">
            Valor em R$ (positivo adiciona, negativo subtrai)
          </Label>
          <Input
            id="valorReais"
            name="valorReais"
            type="number"
            step="0.01"
            value={valorReais}
            onChange={(e) => setValorReais(e.target.value)}
            placeholder="10.00 ou -5.00"
            required
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="motivo">Motivo (auditoria)</Label>
          <Textarea
            id="motivo"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Cortesia · reembolso · ajuste manual · etc."
            required
            minLength={5}
            rows={2}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-ok">{success}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="size-3 mr-1 animate-spin" />
                Aplicando...
              </>
            ) : (
              <>
                <Plus className="size-3 mr-1" />
                Aplicar
              </>
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function SuspendModal({
  empresa,
  onClose,
}: {
  empresa: EmpresaAdminRow;
  onClose: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const suspended = Boolean(empresa.fiscal_settings?._suspended);

  function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("companyId", empresa.id);
    fd.set("suspender", suspended ? "false" : "true");
    fd.set("motivo", motivo);
    startTransition(async () => {
      const res = await toggleEmpresaAtivaAction(fd);
      if (res.ok) onClose();
      else setError(res.error);
    });
  }

  return (
    <Modal
      title={`${suspended ? "Reativar" : "Suspender"} · ${empresa.name}`}
      onClose={onClose}
    >
      <p className="text-sm text-tabaco mb-4">
        {suspended
          ? "Reativar a empresa permite novas consultas e libera API keys."
          : "Suspender bloqueia novas consultas e revoga todas as API keys ativas."}
      </p>
      <form onSubmit={handle} className="space-y-3">
        {!suspended && (
          <div>
            <Label htmlFor="motivo">Motivo (auditoria)</Label>
            <Textarea
              id="motivo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Suspeita de fraude · violação dos Termos · inadimplência..."
              required
              minLength={5}
              rows={2}
            />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={pending}
            variant={suspended ? "primary" : "ghost"}
            className={!suspended ? "text-red-700 border border-red-300 hover:bg-red-50" : ""}
          >
            {pending ? (
              <>
                <Loader2 className="size-3 mr-1 animate-spin" />
                Aplicando...
              </>
            ) : suspended ? (
              "Reativar empresa"
            ) : (
              "Confirmar suspensão"
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-card border border-line shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-bold text-cocoa mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
