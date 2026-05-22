"use client";

import { useState } from "react";
import {
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  Minus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/formatters";
import type {
  ResultSection,
  EnderecoItem,
  TelefoneItem,
  ParenteItem,
  EmpresaVinculadaItem,
  DividaItem,
  ProtestoItem,
  ChequeItem,
  ScrItem,
  SocioItem,
  RecallItem,
  LeilaoItem,
  MultaItem,
} from "@/lib/consultas/mock-data";

interface ResultSectionsProps {
  sections: ResultSection[];
}

/**
 * Renderiza array de seções estruturadas vindas do `result_jsonb`.
 * Cada seção é um <details> nativo que abre/fecha (colapsável).
 */
export function ResultSections({ sections }: ResultSectionsProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-card p-8 text-center text-tabaco">
        Nenhum dado disponível para essa consulta.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <Section key={section.id} section={section} />
      ))}
    </div>
  );
}

function Section({ section }: { section: ResultSection }) {
  const [open, setOpen] = useState(true);
  const itemCount = countItems(section);

  return (
    <div className="rounded-lg border border-line bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-5 hover:bg-cream/40 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 text-left">
          <h3 className="font-display text-base font-semibold text-cocoa">
            {section.title}
          </h3>
          {itemCount !== null && (
            <Badge variant="secondary" className="text-[10px]">
              {itemCount}
            </Badge>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-tabaco transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="border-t border-line/60 p-5 bg-paper-2/50">
          {renderSectionBody(section)}
        </div>
      )}
    </div>
  );
}

function countItems(section: ResultSection): number | null {
  if (section.type === "list" || section.type === "table") {
    return (section.items as unknown[])?.length ?? 0;
  }
  return null;
}

function renderSectionBody(section: ResultSection) {
  switch (section.type) {
    case "kv":
      return <KVTable data={section.data} />;
    case "score":
      return <ScoreCard section={section} />;
    case "list":
      return renderList(section);
    case "table":
      return renderTable(section);
    default:
      return null;
  }
}

// ============================================================
// KV (chave-valor)
// ============================================================

function KVTable({ data }: { data: Record<string, string | null> }) {
  const entries = Object.entries(data);
  return (
    <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <dt className="text-xs font-mono uppercase tracking-wider text-tabaco/70">
            {key}
          </dt>
          <dd
            className={cn(
              "text-sm font-medium mt-0.5",
              value === null ? "text-tabaco/60 italic" : "text-cocoa",
              isStatusValue(value) && getStatusColor(value)
            )}
          >
            {value === null ? "—" : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function isStatusValue(v: string | null): boolean {
  if (!v) return false;
  return /^(ATIVA|REGULAR|NEGATIVA|NADA CONSTA|SEM GRAVAME|BAIXADA|SUSPENSA|EM ABERTO|PAGA|QUITADA|ATIVO|BAIXADO)$/i.test(
    v.trim()
  );
}

function getStatusColor(v: string | null): string {
  if (!v) return "";
  const upper = v.toUpperCase().trim();
  if (["ATIVA", "REGULAR", "NEGATIVA", "NADA CONSTA", "SEM GRAVAME", "PAGA", "QUITADA"].includes(upper))
    return "text-ok font-bold";
  if (["EM ABERTO", "ATIVO", "SUSPENSA"].includes(upper))
    return "text-warn font-bold";
  if (["BAIXADA", "BAIXADO"].includes(upper))
    return "text-tabaco font-bold";
  return "";
}

// ============================================================
// Score
// ============================================================

function ScoreCard({
  section,
}: {
  section: Extract<ResultSection, { type: "score" }>;
}) {
  const percent = (section.valor / section.max) * 100;
  const classeMap = {
    ALTO: { label: "Alto", color: "text-ok", icon: CheckCircle2 },
    MEDIO: { label: "Médio", color: "text-warn", icon: AlertTriangle },
    BAIXO: { label: "Baixo", color: "text-err", icon: AlertTriangle },
    MUITO_BAIXO: { label: "Muito baixo", color: "text-err", icon: XCircle },
  };
  const cls = classeMap[section.classe];
  const Icon = cls.icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
      <div className="flex-1">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-display text-4xl font-bold text-cocoa">
            {section.valor}
          </span>
          <span className="text-tabaco text-sm">/ {section.max}</span>
        </div>
        <div className={cn("inline-flex items-center gap-1.5 text-sm font-medium", cls.color)}>
          <Icon className="size-4" /> {cls.label}
        </div>
        <p className="text-xs text-tabaco font-mono mt-2">
          Bureau: {section.bureau}
        </p>
      </div>

      {/* Barra de progresso */}
      <div className="flex-1">
        <div className="relative h-3 bg-cream rounded-full overflow-hidden">
          <div
            className={cn(
              "absolute top-0 left-0 h-full rounded-full transition-all duration-500",
              section.classe === "ALTO" && "bg-ok",
              section.classe === "MEDIO" && "bg-warn",
              section.classe === "BAIXO" && "bg-err",
              section.classe === "MUITO_BAIXO" && "bg-err"
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-tabaco/70 mt-1.5">
          <span>0</span>
          <span>{Math.floor(section.max / 2)}</span>
          <span>{section.max}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Listas (renderização específica por tipo de item)
// ============================================================

function renderList(section: Extract<ResultSection, { type: "list" }>) {
  if (section.items.length === 0) {
    return <EmptyState />;
  }

  switch (section.id) {
    case "enderecos":
      return <EnderecosList items={section.items as EnderecoItem[]} />;
    case "telefones":
      return <TelefonesList items={section.items as TelefoneItem[]} />;
    case "emails":
      return <EmailsList items={section.items as string[]} />;
    case "parentes":
      return <ParentesList items={section.items as ParenteItem[]} />;
    case "empresas":
      return <EmpresasList items={section.items as EmpresaVinculadaItem[]} />;
    case "empresa_socios":
      return <SociosList items={section.items as SocioItem[]} />;
    case "veiculo_recall":
      return <RecallList items={section.items as RecallItem[]} />;
    default:
      return null;
  }
}

function EnderecosList({ items }: { items: EnderecoItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <Badge variant={e.tipo === "atual" ? "ok" : "secondary"} className="mt-0.5">
            {e.tipo === "atual" ? "Atual" : "Anterior"}
          </Badge>
          <div className="text-sm">
            <p className="text-cocoa">
              {e.logradouro}, {e.numero}
              {e.complemento ? ` — ${e.complemento}` : ""}
            </p>
            <p className="text-tabaco font-mono text-xs mt-0.5">
              {e.bairro} · {e.cidade}/{e.uf} · CEP {e.cep}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TelefonesList({ items }: { items: TelefoneItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((t, i) => (
        <div key={i} className="flex items-center justify-between text-sm">
          <span className="font-mono text-cocoa">{t.numero}</span>
          <span className="text-xs font-mono text-tabaco">
            {t.tipo === "celular" ? "📱 Celular" : "☎ Fixo"} ·
            cadastrado {new Date(t.cadastro).getFullYear()}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmailsList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1">
      {items.map((e) => (
        <li key={e} className="text-sm font-mono text-cocoa">
          {e}
        </li>
      ))}
    </ul>
  );
}

const VINCULOS_LABEL: Record<string, string> = {
  mae: "Mãe",
  pai: "Pai",
  irmao: "Irmão(ã)",
  filho: "Filho(a)",
  conjuge: "Cônjuge",
};

function ParentesList({ items }: { items: ParenteItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((p, i) => (
        <li key={i} className="flex items-center justify-between text-sm">
          <span className="text-cocoa">{p.nome}</span>
          <Badge variant="secondary" className="text-[10px]">
            {VINCULOS_LABEL[p.vinculo] ?? p.vinculo}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function EmpresasList({ items }: { items: EmpresaVinculadaItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((e, i) => (
        <div key={i} className="rounded-md bg-card border border-line/60 p-3">
          <div className="flex items-start justify-between mb-1">
            <div>
              <p className="text-cocoa font-medium text-sm">{e.razao_social}</p>
              <p className="font-mono text-xs text-tabaco">{e.cnpj}</p>
            </div>
            <Badge variant={e.situacao === "ATIVA" ? "ok" : "secondary"}>
              {e.situacao}
            </Badge>
          </div>
          <p className="text-xs text-tabaco mt-1">
            {e.qualificacao} desde {new Date(e.data_entrada).toLocaleDateString("pt-BR")}
          </p>
        </div>
      ))}
    </div>
  );
}

function SociosList({ items }: { items: SocioItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((s, i) => (
        <div key={i} className="rounded-md bg-card border border-line/60 p-3">
          <p className="text-cocoa font-medium text-sm">{s.nome}</p>
          <p className="font-mono text-xs text-tabaco mt-0.5">
            CPF {s.cpf_mascarado}
          </p>
          <p className="text-xs text-tabaco mt-1">
            {s.qualificacao} desde {new Date(s.data_entrada).toLocaleDateString("pt-BR")}
          </p>
        </div>
      ))}
    </div>
  );
}

function RecallList({ items }: { items: RecallItem[] }) {
  if (items.length === 0) return <EmptyState mensagem="Nenhum recall ativo." />;
  return (
    <div className="space-y-2">
      {items.map((r, i) => (
        <div key={i} className="rounded-md bg-warn/10 border border-warn/30 p-3">
          <p className="font-medium text-cocoa text-sm">{r.campanha}</p>
          <p className="text-xs text-tabaco mt-1">{r.problema}</p>
          <Badge variant={r.status === "ATIVO" ? "warn" : "ok"} className="mt-2">
            {r.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Tabelas
// ============================================================

function renderTable(section: Extract<ResultSection, { type: "table" }>) {
  if (section.items.length === 0) {
    return <EmptyState mensagem="Nenhuma ocorrência encontrada." />;
  }

  switch (section.id) {
    case "dividas":
      return <DividasTable items={section.items as DividaItem[]} />;
    case "protestos":
      return <ProtestosTable items={section.items as ProtestoItem[]} />;
    case "cheques":
      return <ChequesTable items={section.items as ChequeItem[]} />;
    case "scr_bacen":
      return <ScrTable items={section.items as ScrItem[]} />;
    case "veiculo_leilao":
      return <LeilaoTable items={section.items as LeilaoItem[]} />;
    case "veiculo_multas":
      return <MultasTable items={section.items as MultaItem[]} />;
    default:
      return null;
  }
}

function DividasTable({ items }: { items: DividaItem[] }) {
  const total = items.reduce((s, d) => s + d.valor_centavos, 0);
  return (
    <div>
      <table className="w-full text-sm">
        <thead className="text-xs font-mono uppercase tracking-wider text-tabaco/70">
          <tr>
            <th className="text-left py-2">Credor</th>
            <th className="text-left py-2">Origem</th>
            <th className="text-right py-2">Valor</th>
            <th className="text-right py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/40">
          {items.map((d, i) => (
            <tr key={i}>
              <td className="py-2 text-cocoa">{d.credor}</td>
              <td className="py-2 text-tabaco text-xs font-mono">
                {new Date(d.data_origem).toLocaleDateString("pt-BR")}
              </td>
              <td className="py-2 text-right font-mono text-cocoa font-medium">
                {formatBRL(d.valor_centavos)}
              </td>
              <td className="py-2 text-right">
                <Badge variant={d.status === "EM_ABERTO" ? "warn" : "ok"} className="text-[10px]">
                  {d.status === "EM_ABERTO" ? "Em aberto" : "Quitada"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-cocoa/20">
            <td colSpan={2} className="pt-3 text-xs font-mono uppercase text-tabaco">
              Total em aberto
            </td>
            <td colSpan={2} className="pt-3 text-right font-display font-bold text-cocoa">
              {formatBRL(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function ProtestosTable({ items }: { items: ProtestoItem[] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-xs font-mono uppercase tracking-wider text-tabaco/70">
        <tr>
          <th className="text-left py-2">Cartório</th>
          <th className="text-left py-2">Cidade</th>
          <th className="text-right py-2">Valor</th>
          <th className="text-right py-2">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line/40">
        {items.map((p, i) => (
          <tr key={i}>
            <td className="py-2 text-cocoa">{p.cartorio}</td>
            <td className="py-2 text-tabaco text-xs">{p.cidade_uf}</td>
            <td className="py-2 text-right font-mono">{formatBRL(p.valor_centavos)}</td>
            <td className="py-2 text-right">
              <Badge variant={p.status === "ATIVO" ? "warn" : "ok"}>{p.status}</Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ChequesTable({ items }: { items: ChequeItem[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {items.map((c, i) => (
        <li key={i} className="text-cocoa">
          {c.banco} · {new Date(c.data).toLocaleDateString("pt-BR")} · {c.motivo}
        </li>
      ))}
    </ul>
  );
}

function ScrTable({ items }: { items: ScrItem[] }) {
  const total = items.reduce((s, o) => s + o.saldo_centavos, 0);
  return (
    <div>
      <table className="w-full text-sm">
        <thead className="text-xs font-mono uppercase tracking-wider text-tabaco/70">
          <tr>
            <th className="text-left py-2">Instituição</th>
            <th className="text-left py-2">Modalidade</th>
            <th className="text-right py-2">Saldo</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/40">
          {items.map((o, i) => (
            <tr key={i}>
              <td className="py-2 text-cocoa">{o.instituicao}</td>
              <td className="py-2 text-tabaco text-xs">{o.modalidade}</td>
              <td className="py-2 text-right font-mono">{formatBRL(o.saldo_centavos)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-cocoa/20">
            <td colSpan={2} className="pt-3 text-xs font-mono uppercase text-tabaco">
              Comprometimento total
            </td>
            <td className="pt-3 text-right font-display font-bold text-cocoa">
              {formatBRL(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function LeilaoTable({ items }: { items: LeilaoItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((l, i) => (
        <div key={i} className="rounded-md border border-warn/40 bg-warn/5 p-3">
          <p className="font-medium text-cocoa text-sm">{l.motivo}</p>
          <p className="text-xs text-tabaco mt-1">
            {l.leiloeiro} · {l.cidade_uf} · {new Date(l.data).toLocaleDateString("pt-BR")}
          </p>
        </div>
      ))}
    </div>
  );
}

function MultasTable({ items }: { items: MultaItem[] }) {
  const total = items.reduce((s, m) => s + m.valor_centavos, 0);
  return (
    <div>
      <table className="w-full text-sm">
        <thead className="text-xs font-mono uppercase tracking-wider text-tabaco/70">
          <tr>
            <th className="text-left py-2">Descrição</th>
            <th className="text-left py-2">Data</th>
            <th className="text-center py-2">Pontos</th>
            <th className="text-right py-2">Valor</th>
            <th className="text-right py-2">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line/40">
          {items.map((m, i) => (
            <tr key={i}>
              <td className="py-2 text-cocoa">{m.descricao}</td>
              <td className="py-2 text-tabaco text-xs font-mono">
                {new Date(m.data).toLocaleDateString("pt-BR")}
              </td>
              <td className="py-2 text-center font-mono">{m.pontos}</td>
              <td className="py-2 text-right font-mono">{formatBRL(m.valor_centavos)}</td>
              <td className="py-2 text-right">
                <Badge variant={m.status === "PAGA" ? "ok" : "warn"} className="text-[10px]">
                  {m.status === "PAGA" ? "Paga" : "Em aberto"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-cocoa/20">
            <td colSpan={3} className="pt-3 text-xs font-mono uppercase text-tabaco">
              Total
            </td>
            <td colSpan={2} className="pt-3 text-right font-display font-bold text-cocoa">
              {formatBRL(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

// ============================================================
// Empty state
// ============================================================

function EmptyState({ mensagem = "Nenhum registro encontrado." }: { mensagem?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-ok bg-ok/10 border border-ok/20 rounded-md p-3">
      <CheckCircle2 className="size-4 shrink-0" />
      <span className="text-cocoa">{mensagem}</span>
    </div>
  );
}
