"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { resolveIcone } from "@/components/consulta/icones";
import { formatBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  CATALOGO_COMPLETO,
  GRUPOS_CATALOGO,
  type GrupoCatalogo,
  type ItemCatalogo,
  type TipoItemCatalogo,
} from "@/lib/consultas/planos";

const TIPOS: { id: TipoItemCatalogo | "todos"; label: string; hint: string }[] = [
  { id: "todos", label: "Todos", hint: "Tudo que dá pra puxar" },
  { id: "plano", label: "Planos", hint: "Pacote completo da categoria" },
  { id: "combo", label: "Combos", hint: "Conjuntos prontos de leilão" },
  { id: "avulso", label: "Avulsas", hint: "Um dado só, sem pagar o plano" },
];

const LABEL_ALVO: Record<ItemCatalogo["alvo"], string> = {
  placa: "Placa",
  cpf: "CPF",
  cnpj: "CNPJ",
  cep: "CEP",
};

/** Remove acento pra busca não depender de digitação perfeita. */
function chave(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function CatalogoExplorer() {
  const [grupo, setGrupo] = useState<GrupoCatalogo | "todos">("todos");
  const [tipo, setTipo] = useState<TipoItemCatalogo | "todos">("todos");
  const [busca, setBusca] = useState("");

  const indexado = useMemo(
    () =>
      CATALOGO_COMPLETO.map((item) => ({
        item,
        texto: chave(`${item.nome} ${item.descricao} ${item.busca}`),
      })),
    []
  );

  const filtrados = useMemo(() => {
    const termo = chave(busca.trim());
    return indexado
      .filter(({ item, texto }) => {
        if (grupo !== "todos" && item.grupo !== grupo) return false;
        if (tipo !== "todos" && item.tipo !== tipo) return false;
        if (termo && !texto.includes(termo)) return false;
        return true;
      })
      .map((x) => x.item)
      .sort((a, b) => a.precoB2C_centavos - b.precoB2C_centavos);
  }, [indexado, grupo, tipo, busca]);

  // Contadores respeitam os OUTROS filtros ativos — chip que zera fica visível
  // mas apagado, em vez de mentir "10" e abrir uma lista vazia.
  const contagem = useMemo(() => {
    const termo = chave(busca.trim());
    const out: Record<string, number> = { todos: 0 };
    for (const g of GRUPOS_CATALOGO) out[g.id] = 0;
    for (const { item, texto } of indexado) {
      if (tipo !== "todos" && item.tipo !== tipo) continue;
      if (termo && !texto.includes(termo)) continue;
      out[item.grupo] += 1;
      out.todos += 1;
    }
    return out;
  }, [indexado, tipo, busca]);

  const limpar = grupo !== "todos" || tipo !== "todos" || busca !== "";

  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-tabaco pointer-events-none" />
        <Input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar: score, antecedentes, gravame, sócios, CNDT..."
          className="pl-9"
          aria-label="Buscar consulta"
        />
      </div>

      {/* Filtro por categoria */}
      <div className="flex flex-wrap gap-2">
        <Chip
          ativo={grupo === "todos"}
          onClick={() => setGrupo("todos")}
          label="Tudo"
          n={contagem.todos}
        />
        {GRUPOS_CATALOGO.map((g) => (
          <Chip
            key={g.id}
            ativo={grupo === g.id}
            onClick={() => setGrupo(g.id)}
            label={g.label}
            icone={g.icon}
            n={contagem[g.id] ?? 0}
          />
        ))}
      </div>

      {/* Filtro por tipo */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-widest text-tabaco/70">
          Formato
        </span>
        {TIPOS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.hint}
            onClick={() => setTipo(t.id)}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
              tipo === t.id
                ? "border-fur bg-saffron/15 text-cocoa"
                : "border-line bg-paper-2 text-tabaco hover:border-fur/40"
            )}
          >
            {t.label}
          </button>
        ))}
        {limpar && (
          <button
            type="button"
            onClick={() => {
              setGrupo("todos");
              setTipo("todos");
              setBusca("");
            }}
            className="ml-auto inline-flex items-center gap-1 text-xs text-tabaco hover:text-fur transition-colors"
          >
            <X className="size-3.5" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Resultado */}
      <p className="text-xs font-mono text-tabaco">
        {filtrados.length === 0
          ? "Nenhuma consulta com esse filtro"
          : `${filtrados.length} ${
              filtrados.length === 1 ? "consulta" : "consultas"
            } disponíveis`}
      </p>

      {filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-paper-2 p-8 text-center">
          <p className="text-sm text-tabaco">
            Não achamos essa consulta. Tente outro termo ou{" "}
            <Link href="/contato" className="text-fur hover:underline">
              fale com a gente
            </Link>{" "}
            — a gente adiciona base nova toda semana.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  ativo,
  onClick,
  label,
  n,
  icone,
}: {
  ativo: boolean;
  onClick: () => void;
  label: string;
  n: number;
  icone?: string;
}) {
  const Icon = icone ? resolveIcone(icone) : null;
  const vazio = n === 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-all duration-200",
        ativo
          ? "border-fur bg-fur text-paper shadow-[var(--shadow-pop)]"
          : "border-line bg-card text-cocoa hover:border-fur/50",
        vazio && !ativo && "opacity-45"
      )}
    >
      {Icon && <Icon className="size-4" strokeWidth={2} />}
      {label}
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums",
          ativo ? "text-paper/80" : "text-tabaco"
        )}
      >
        {n}
      </span>
    </button>
  );
}

function ItemCard({ item }: { item: ItemCatalogo }) {
  const Icon = resolveIcone(item.icon);
  const rotulo =
    item.tipo === "plano"
      ? "Plano"
      : item.tipo === "combo"
      ? "Combo"
      : item.qtdApis >= 3
      ? "Kit"
      : "Avulsa";

  return (
    <Link
      href={item.href}
      className="group flex flex-col rounded-xl border border-line bg-card p-5 transition-all duration-200 ease-[var(--ease-cap)] hover:shadow-[var(--shadow-pop)] hover:-translate-y-0.5 hover:border-fur/50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="size-10 rounded-lg bg-fur/15 text-fur flex items-center justify-center shrink-0">
          <Icon className="size-5" strokeWidth={1.75} />
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="font-mono text-[10px]">
            {rotulo}
          </Badge>
          <span className="text-[10px] font-mono uppercase tracking-widest text-tabaco">
            {LABEL_ALVO[item.alvo]}
          </span>
        </div>
      </div>

      <h3 className="mt-3 font-display text-lg font-bold text-cocoa leading-tight">
        {item.nome}
      </h3>
      <p className="mt-1 text-sm text-tabaco leading-relaxed flex-1">
        {item.descricao}
      </p>

      <div className="mt-4 pt-3 border-t border-line/60 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-tabaco">
            {item.qtdApis > 1 ? `${item.qtdApis} fontes` : "1 fonte"}
          </p>
          <p className="font-display text-xl font-bold text-cocoa leading-none">
            {formatBRL(item.precoB2C_centavos)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-cocoa group-hover:text-fur transition-colors">
          Puxar
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
