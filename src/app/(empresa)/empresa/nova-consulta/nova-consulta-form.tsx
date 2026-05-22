"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PLANOS_CPF,
  PLANOS_CNPJ,
  PLANOS_VEICULAR,
  type Plano,
} from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";
import { novaConsultaB2BAction } from "./actions";

interface Props {
  saldoFolhas: number;
}

const CATEGORIAS = [
  { id: "cpf" as const, label: "CPF", planos: PLANOS_CPF, placeholder: "000.000.000-00", helper: "11 dígitos do CPF" },
  { id: "cnpj" as const, label: "CNPJ", planos: PLANOS_CNPJ, placeholder: "00.000.000/0000-00", helper: "14 dígitos do CNPJ" },
  { id: "veicular" as const, label: "Veicular", planos: PLANOS_VEICULAR, placeholder: "ABC1D23", helper: "Placa Mercosul ou antiga" },
];

const FINALIDADES = [
  { value: "due_diligence", label: "Due diligence / parceria" },
  { value: "credit_analysis", label: "Análise de crédito" },
  { value: "tenant_screening", label: "Análise de inquilino" },
  { value: "employment", label: "Contratação / RH" },
  { value: "fraud_prevention", label: "Prevenção a fraude" },
  { value: "compliance", label: "Compliance / KYC" },
  { value: "other", label: "Outra (especificar)" },
];

export function NovaConsultaB2BForm({ saldoFolhas }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [categoria, setCategoria] = useState<"cpf" | "cnpj" | "veicular">("cpf");
  const [selectedPlano, setSelectedPlano] = useState<Plano | null>(null);
  const [finalidade, setFinalidade] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cat = CATEGORIAS.find((c) => c.id === categoria)!;
  const podePagar = selectedPlano ? saldoFolhas >= selectedPlano.custoFolhasB2B : false;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!selectedPlano) {
      setError("Escolha um plano.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("planoId", selectedPlano.id);
    startTransition(async () => {
      const res = await novaConsultaB2BAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/historico/${res.consultationId}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Categoria */}
      <section className="space-y-3">
        <div>
          <Label className="text-base font-semibold text-cocoa">1. Categoria</Label>
          <p className="text-xs text-tabaco mt-1">O que você quer consultar?</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCategoria(c.id);
                setSelectedPlano(null);
              }}
              className={`rounded-lg border-2 p-4 text-center transition-all ${
                categoria === c.id
                  ? "border-fur bg-fur/5 ring-2 ring-fur/20"
                  : "border-line bg-card hover:border-fur/40"
              }`}
            >
              <p className="font-display font-bold text-cocoa">{c.label}</p>
              <p className="text-[10px] font-mono text-tabaco mt-1">
                {c.planos.length} planos
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Plano */}
      <section className="space-y-3">
        <div>
          <Label className="text-base font-semibold text-cocoa">2. Plano</Label>
          <p className="text-xs text-tabaco mt-1">
            Cada plano debita um valor diferente do saldo.
          </p>
        </div>
        <div className="space-y-2">
          {cat.planos.map((p) => {
            const isSelected = selectedPlano?.id === p.id;
            const insuficiente = saldoFolhas < p.custoFolhasB2B;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlano(p)}
                disabled={insuficiente}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all flex items-center justify-between gap-4 ${
                  isSelected
                    ? "border-fur bg-fur/5 ring-2 ring-fur/20"
                    : insuficiente
                    ? "border-line/40 bg-card/50 opacity-50 cursor-not-allowed"
                    : "border-line bg-card hover:border-fur/40"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-display font-bold text-cocoa">{p.nome}</p>
                    {p.destaque === "popular" && (
                      <Badge variant="accent" className="text-[10px]">
                        Mais escolhido
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-tabaco mt-1 line-clamp-1">{p.descricao}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-mono font-bold text-fur">
                    {p.custoFolhasB2B} cr
                  </p>
                  <p className="text-[10px] text-tabaco font-mono">
                    {formatBRL(p.precoB2C_centavos)} avulso
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Target */}
      <section className="space-y-3">
        <div>
          <Label htmlFor="target" className="text-base font-semibold text-cocoa">
            3. {cat.label} a consultar
          </Label>
          <p className="text-xs text-tabaco mt-1">{cat.helper}</p>
        </div>
        <Input
          id="target"
          name="target"
          placeholder={cat.placeholder}
          required
          autoComplete="off"
          className="font-mono"
        />
      </section>

      {/* Metadados */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="costCenter" className="text-sm font-semibold text-cocoa">
            Centro de custo (opcional)
          </Label>
          <p className="text-[11px] text-tabaco mb-1.5">Pra rastreio interno em relatório.</p>
          <Input
            id="costCenter"
            name="costCenter"
            placeholder="ex: comercial-sp"
            autoComplete="off"
          />
        </div>
        <div>
          <Label htmlFor="externalReference" className="text-sm font-semibold text-cocoa">
            Referência externa (opcional)
          </Label>
          <p className="text-[11px] text-tabaco mb-1.5">ID do seu sistema, ticket, etc.</p>
          <Input
            id="externalReference"
            name="externalReference"
            placeholder="ex: ticket-42"
            autoComplete="off"
          />
        </div>
      </section>

      {/* Finalidade LGPD */}
      <section className="space-y-3">
        <div>
          <Label className="text-base font-semibold text-cocoa">
            4. Finalidade (LGPD)
          </Label>
          <p className="text-xs text-tabaco mt-1">
            Toda consulta exige finalidade declarada.
          </p>
        </div>
        <select
          name="finalidade"
          value={finalidade}
          onChange={(e) => setFinalidade(e.target.value)}
          required
          className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-cocoa focus:outline-none focus:ring-2 focus:ring-fur/30"
        >
          <option value="">Selecione...</option>
          {FINALIDADES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        {finalidade === "other" && (
          <Textarea
            name="finalidadeDescricao"
            placeholder="Descreva a finalidade..."
            required
            minLength={5}
          />
        )}
      </section>

      {/* Resumo + submit */}
      {selectedPlano && (
        <div className="rounded-lg border border-line bg-paper-2 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-tabaco">
                Esta consulta vai debitar
              </p>
              <p className="font-display text-2xl font-bold text-cocoa mt-1">
                {selectedPlano.custoFolhasB2B} créditos
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-tabaco">Saldo após consulta:</p>
              <p
                className={`font-mono font-bold ${
                  podePagar ? "text-cocoa" : "text-red-600"
                }`}
              >
                {saldoFolhas - selectedPlano.custoFolhasB2B} créditos
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={pending || !selectedPlano || !podePagar}
      >
        {pending ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Puxando capivara...
          </>
        ) : (
          <>
            Puxar capivara agora
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
