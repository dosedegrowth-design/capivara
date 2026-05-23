import { redirect } from "next/navigation";
import { Package, TrendingUp, AlertTriangle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatBRL } from "@/lib/formatters";
import {
  PRODUTOS_VEICULAR_AVULSO,
  PRODUTOS_LEILAO_AVULSO,
  PLANOS_VEICULAR,
  PLANOS_CPF,
  PLANOS_CNPJ,
  COMBOS_LEILAO,
  type ProdutoAvulso,
  type Plano,
} from "@/lib/consultas/planos";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Produtos & Margem · Admin · Capivara",
};

export default async function AdminProdutosPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.account_type !== "admin") redirect("/dashboard");

  // Ordena produtos avulsos por categoria depois margem desc
  const avulsosOrdenados = [
    ...PRODUTOS_VEICULAR_AVULSO,
    ...PRODUTOS_LEILAO_AVULSO,
  ].sort((a, b) => {
    if (a.categoria !== b.categoria) return a.categoria.localeCompare(b.categoria);
    return margemB2C(b) - margemB2C(a);
  });

  // Combos: todos os planos da base de combos
  const combosOrdenados = [
    ...PLANOS_VEICULAR.map((p) => ({ ...p, _grupo: "Veicular" as const })),
    ...COMBOS_LEILAO.map((p) => ({ ...p, _grupo: "Leilão" as const })),
    ...PLANOS_CPF.map((p) => ({ ...p, _grupo: "CPF" as const })),
    ...PLANOS_CNPJ.map((p) => ({ ...p, _grupo: "CNPJ" as const })),
  ].sort((a, b) => {
    if (a._grupo !== b._grupo) return a._grupo.localeCompare(b._grupo);
    return margemB2CPlano(b) - margemB2CPlano(a);
  });

  return (
    <div className="px-6 py-8 max-w-7xl">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="size-10 rounded-md bg-saffron/20 text-saffron flex items-center justify-center">
            <Package className="size-5" />
          </span>
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Produtos &amp; Margem
          </h1>
        </div>
        <p className="text-tabaco text-sm max-w-2xl">
          Custo das APIs APIFULL × preço de venda. Verde &ge; 80%, amarelo &ge; 60%,
          vermelho &lt; 60%. Leitura apenas — edicao em <code>src/lib/consultas/planos.ts</code>.
        </p>
      </header>

      {/* Resumo */}
      <ResumoMargem
        avulsos={avulsosOrdenados}
        combos={combosOrdenados}
      />

      {/* Produtos avulsos */}
      <section className="mt-10">
        <h2 className="font-display text-xl font-bold text-cocoa mb-1">
          Produtos avulsos
        </h2>
        <p className="text-sm text-tabaco mb-4">
          Vendas unitárias por categoria. Custo real cotado APIFULL Nível 1.
        </p>
        <TabelaAvulsos produtos={avulsosOrdenados} />
      </section>

      {/* Combos / planos */}
      <section className="mt-12">
        <h2 className="font-display text-xl font-bold text-cocoa mb-1">
          Combos &amp; planos
        </h2>
        <p className="text-sm text-tabaco mb-4">
          Pacotes com várias APIs incluídas. Custo é estimado (não cotado individualmente).
        </p>
        <TabelaCombos
          combos={
            combosOrdenados as Array<Plano & { _grupo: "Veicular" | "Leilão" | "CPF" | "CNPJ" }>
          }
        />
      </section>
    </div>
  );
}

// =========================================================================
// Resumo no topo
// =========================================================================

function ResumoMargem({
  avulsos,
  combos,
}: {
  avulsos: ProdutoAvulso[];
  combos: Plano[];
}) {
  const totalProdutos = avulsos.length + combos.length;

  const margensAvulsos = avulsos.map(margemB2C);
  const margensCombos = combos.map(margemB2CPlano);
  const todasMargens = [...margensAvulsos, ...margensCombos];

  const margemMedia =
    todasMargens.reduce((s, m) => s + m, 0) / Math.max(1, todasMargens.length);

  const avisoVermelho = todasMargens.filter((m) => m < 60).length;

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <Card label="Produtos catalogados" value={String(totalProdutos)} icon={<Package className="size-4" />} />
      <Card
        label="Margem média B2C"
        value={`${Math.round(margemMedia)}%`}
        icon={<TrendingUp className="size-4" />}
        accent={margemMedia >= 80 ? "ok" : margemMedia >= 60 ? "warn" : "err"}
      />
      <Card
        label="Produtos com margem < 60%"
        value={String(avisoVermelho)}
        icon={<AlertTriangle className="size-4" />}
        accent={avisoVermelho === 0 ? "ok" : "err"}
      />
    </div>
  );
}

function Card({
  label,
  value,
  icon,
  accent = "neutral",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: "ok" | "warn" | "err" | "neutral";
}) {
  const accentColor =
    accent === "ok"
      ? "text-ok"
      : accent === "warn"
      ? "text-warn"
      : accent === "err"
      ? "text-err"
      : "text-cocoa";

  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-tabaco">
        {icon}
        {label}
      </div>
      <p className={cn("mt-2 font-display text-3xl font-bold", accentColor)}>
        {value}
      </p>
    </div>
  );
}

// =========================================================================
// Tabela de produtos avulsos
// =========================================================================

function TabelaAvulsos({ produtos }: { produtos: ProdutoAvulso[] }) {
  return (
    <div className="rounded-lg border border-line bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper-2 text-tabaco text-xs font-mono uppercase tracking-widest">
              <Th className="text-left">Cat.</Th>
              <Th className="text-left">Produto</Th>
              <Th className="text-left">APIs</Th>
              <Th className="text-right">Custo API</Th>
              <Th className="text-right">B2C</Th>
              <Th className="text-right">% B2C</Th>
              <Th className="text-right">B2B</Th>
              <Th className="text-right">% B2B</Th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((p) => (
              <tr
                key={p.id}
                className="border-t border-line/70 hover:bg-paper-2 transition-colors"
              >
                <td className="px-3 py-3">
                  <CategoriaBadge categoria={p.categoria} />
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-cocoa">{p.nome}</p>
                  <p className="text-xs text-tabaco mt-0.5 max-w-md truncate">
                    {p.descricao}
                  </p>
                </td>
                <td className="px-3 py-3 text-xs text-tabaco font-mono max-w-xs">
                  {p.apisIncluidas.join(", ")}
                </td>
                <td className="px-3 py-3 text-right font-mono text-tabaco">
                  {formatBRL(p.custoApiReal_centavos)}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold text-cocoa">
                  {formatBRL(p.precoB2C_centavos)}
                </td>
                <td className="px-3 py-3 text-right">
                  <MargemBadge margem={margemB2C(p)} />
                </td>
                <td className="px-3 py-3 text-right font-mono text-tabaco">
                  {formatBRL(p.precoB2B_centavos)}
                </td>
                <td className="px-3 py-3 text-right">
                  <MargemBadge margem={margemB2B(p)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// Tabela de combos
// =========================================================================

function TabelaCombos({
  combos,
}: {
  combos: Array<Plano & { _grupo: "Veicular" | "Leilão" | "CPF" | "CNPJ" }>;
}) {
  return (
    <div className="rounded-lg border border-line bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-paper-2 text-tabaco text-xs font-mono uppercase tracking-widest">
              <Th className="text-left">Grupo</Th>
              <Th className="text-left">Combo</Th>
              <Th className="text-left">APIs incluídas</Th>
              <Th className="text-right">Custo est.</Th>
              <Th className="text-right">B2C</Th>
              <Th className="text-right">% B2C</Th>
              <Th className="text-right">B2B</Th>
              <Th className="text-right">% B2B</Th>
            </tr>
          </thead>
          <tbody>
            {combos.map((p) => (
              <tr
                key={p.id}
                className="border-t border-line/70 hover:bg-paper-2 transition-colors"
              >
                <td className="px-3 py-3">
                  <Badge variant="outline" className="font-mono text-xs">
                    {p._grupo}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <p className="font-medium text-cocoa">{p.nome}</p>
                  <p className="text-xs text-tabaco mt-0.5 max-w-md truncate">
                    {p.descricao}
                  </p>
                </td>
                <td className="px-3 py-3 text-xs text-tabaco font-mono max-w-xs">
                  {p.apisIncluidas.length} APIs · {p.apisIncluidas.slice(0, 3).join(", ")}
                  {p.apisIncluidas.length > 3 && "..."}
                </td>
                <td className="px-3 py-3 text-right font-mono text-tabaco">
                  {formatBRL(p.custoApiEstimado_centavos)}
                </td>
                <td className="px-3 py-3 text-right font-mono font-bold text-cocoa">
                  {formatBRL(p.precoB2C_centavos)}
                </td>
                <td className="px-3 py-3 text-right">
                  <MargemBadge margem={margemB2CPlano(p)} />
                </td>
                <td className="px-3 py-3 text-right font-mono text-tabaco">
                  {formatBRL(p.precoB2B_centavos)}
                </td>
                <td className="px-3 py-3 text-right">
                  <MargemBadge margem={margemB2BPlano(p)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =========================================================================
// Helpers internos
// =========================================================================

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <th className={cn("px-3 py-2.5 font-medium", className)}>{children}</th>;
}

function CategoriaBadge({ categoria }: { categoria: "veicular" | "leilao" }) {
  if (categoria === "leilao") {
    return (
      <Badge className="bg-fur/15 text-fur border-fur/30 font-mono text-xs">
        Leilão
      </Badge>
    );
  }
  return (
    <Badge className="bg-saffron/15 text-saffron border-saffron/30 font-mono text-xs">
      Veicular
    </Badge>
  );
}

function MargemBadge({ margem }: { margem: number }) {
  const cor =
    margem >= 80
      ? "bg-ok/15 text-ok border-ok/30"
      : margem >= 60
      ? "bg-warn/15 text-warn border-warn/30"
      : "bg-err/15 text-err border-err/30";

  return (
    <span
      className={cn(
        "inline-flex items-center font-mono text-xs font-bold px-2 py-0.5 rounded border",
        cor
      )}
    >
      {margem}%
    </span>
  );
}

function margemB2C(p: ProdutoAvulso): number {
  return Math.round(
    ((p.precoB2C_centavos - p.custoApiReal_centavos) / p.precoB2C_centavos) * 100
  );
}

function margemB2B(p: ProdutoAvulso): number {
  return Math.round(
    ((p.precoB2B_centavos - p.custoApiReal_centavos) / p.precoB2B_centavos) * 100
  );
}

function margemB2CPlano(p: Plano): number {
  return Math.round(
    ((p.precoB2C_centavos - p.custoApiEstimado_centavos) / p.precoB2C_centavos) * 100
  );
}

function margemB2BPlano(p: Plano): number {
  return Math.round(
    ((p.precoB2B_centavos - p.custoApiEstimado_centavos) / p.precoB2B_centavos) * 100
  );
}
