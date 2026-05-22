import Link from "next/link";
import { Coins, ArrowRight, Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getActiveCompany } from "@/lib/auth/session";
import { PACOTES_MANADA } from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

export default async function CreditosPage() {
  const empresa = await getActiveCompany();
  if (!empresa) return null;

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
          Compre créditos antecipados, consuma conforme uso. Sem mensalidade.
        </p>
      </header>

      {/* Saldo atual */}
      <div className="rounded-2xl bg-cocoa text-cream p-6 md:p-8">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-cream/70">
          <Coins className="size-4" />
          Saldo atual
        </div>
        <p className="font-display text-5xl font-bold mt-2 text-cream">
          {empresa.folhas_balance}
        </p>
        <p className="text-sm text-cream/70 mt-1">créditos disponíveis</p>
      </div>

      {/* Pacotes */}
      <section>
        <h2 className="font-display text-xl font-bold text-cocoa mb-4">
          Escolha um pacote
        </h2>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PACOTES_MANADA.map((p, i) => (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-lg border p-6 bg-card transition-all hover:shadow-[var(--shadow-card)] ${
                i === 1
                  ? "border-saffron ring-1 ring-saffron/30"
                  : i === PACOTES_MANADA.length - 1
                  ? "border-fur"
                  : "border-line"
              }`}
            >
              {i === 1 && (
                <Badge variant="accent" className="absolute -top-3 left-6">
                  Mais escolhido
                </Badge>
              )}

              <h3 className="font-display text-xl font-bold text-cocoa">
                {p.nome}
              </h3>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold text-cocoa">
                  {formatBRL(p.valor_centavos)}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-mono font-bold text-fur">
                  {p.folhasTotais}
                </span>
                <span className="text-tabaco">créditos</span>
              </div>
              <Badge variant="ok" className="text-[10px] mt-2 self-start">
                +{p.bonusPercent}% bônus
              </Badge>

              <ul className="mt-5 mb-6 space-y-2 flex-1">
                {p.recursos.map((r) => (
                  <li
                    key={r}
                    className="flex items-start gap-2 text-xs text-cocoa"
                  >
                    <Check className="size-4 shrink-0 text-ok mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={i === 1 ? "accent" : "secondary"}
                size="md"
                className="w-full"
                disabled
              >
                Recarregar
              </Button>
            </div>
          ))}
        </div>

        <p className="text-xs text-tabaco font-mono text-center mt-6">
          Fluxo de recarga via Asaas será ativado na próxima sprint.
        </p>
      </section>
    </div>
  );
}
