import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/formatters";
import type { PacoteManada } from "@/lib/consultas/planos";

interface ManadaCardProps {
  pacote: PacoteManada;
  /** Quando true, mostra badge "Mais escolhido" e destaca visualmente. */
  destaque?: boolean;
  /** Quando true, mostra badge "Reserva Capivara" em cor diferente. */
  premium?: boolean;
}

export function ManadaCard({ pacote, destaque, premium }: ManadaCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border bg-card p-6 h-full transition-all duration-200 ease-[var(--ease-cap)]",
        "hover:shadow-[var(--shadow-pop)] hover:-translate-y-0.5",
        destaque && "border-saffron shadow-[var(--shadow-card)] ring-1 ring-saffron/30",
        premium && "border-fur shadow-[var(--shadow-card)] bg-gradient-to-br from-card to-cream/40",
        !destaque && !premium && "border-line"
      )}
    >
      {destaque && (
        <Badge variant="accent" className="absolute -top-3 left-6">
          Mais escolhido
        </Badge>
      )}
      {premium && (
        <Badge className="absolute -top-3 left-6 bg-fur text-cream">
          Reserva premium
        </Badge>
      )}

      <h3 className="font-display text-xl font-bold text-cocoa">
        {pacote.nome}
      </h3>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-3xl font-bold text-cocoa">
          {formatBRL(pacote.valor_centavos)}
        </span>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="font-mono font-bold text-fur">
          {pacote.folhasTotais}
        </span>
        <span className="text-tabaco">créditos</span>
        <Badge variant="ok" className="text-[10px] py-0">
          +{pacote.bonusPercent}% bônus
        </Badge>
      </div>

      <ul className="mt-5 mb-6 space-y-2 flex-1">
        {pacote.recursos.map((r) => (
          <li key={r} className="flex items-start gap-2 text-sm text-cocoa">
            <Check className="size-4 shrink-0 text-ok mt-0.5" />
            <span>{r}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={destaque || premium ? "accent" : "secondary"}
        size="md"
        className="w-full mt-auto"
      >
        <Link href="/cadastro?tipo=empresa">
          Começar
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
