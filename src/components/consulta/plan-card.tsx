import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/formatters";
import type { Plano } from "@/lib/consultas/planos";

interface PlanCardProps {
  plano: Plano;
  /** Texto descritivo do que ta incluso, em itens. Se omitido, deriva de apisIncluidas. */
  inclui?: string[];
  /** URL para iniciar consulta com este plano. */
  href?: string;
  className?: string;
  /** Quando true, mostra preco em folhas (B2B). Padrao mostra BRL (B2C). */
  mode?: "b2c" | "b2b";
}

export function PlanCard({
  plano,
  inclui,
  href,
  className,
  mode = "b2c",
}: PlanCardProps) {
  const isDestaque = plano.destaque === "popular";
  const isPremium = plano.destaque === "premium";

  const link = href ?? `/consultar/${plano.categoria}/${plano.id.split("-").slice(1).join("-")}`;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-lg border bg-card p-6 transition-all duration-200 ease-[var(--ease-cap)]",
        "hover:shadow-[var(--shadow-pop)] hover:-translate-y-0.5",
        isDestaque && "border-saffron shadow-[var(--shadow-card)] ring-1 ring-saffron/30",
        isPremium && "border-fur shadow-[var(--shadow-card)] bg-gradient-to-br from-card to-cream/40",
        !isDestaque && !isPremium && "border-line",
        className
      )}
    >
      {isDestaque && (
        <Badge variant="accent" className="absolute -top-3 left-6">
          Mais popular
        </Badge>
      )}
      {isPremium && (
        <Badge className="absolute -top-3 left-6 bg-fur text-cream">
          Capivara completa
        </Badge>
      )}

      <div className="mb-4">
        <h3 className="font-display text-2xl font-bold text-cocoa">
          {plano.nome}
        </h3>
        <p className="mt-1 text-sm text-tabaco leading-relaxed min-h-[2.5rem]">
          {plano.descricao}
        </p>
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        {mode === "b2c" ? (
          <>
            <span className="font-display text-4xl font-bold text-cocoa">
              {formatBRL(plano.precoB2C_centavos)}
            </span>
          </>
        ) : (
          <>
            <span className="font-display text-4xl font-bold text-cocoa">
              {plano.custoFolhasB2B}
            </span>
            <span className="font-mono text-sm text-tabaco ml-1">folhas</span>
          </>
        )}
      </div>

      {inclui && inclui.length > 0 && (
        <ul className="mb-6 flex-1 space-y-2">
          {inclui.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm text-cocoa">
              <Check className="size-4 shrink-0 text-ok mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <Button
        asChild
        variant={isDestaque || isPremium ? "accent" : "secondary"}
        size="lg"
        className="w-full mt-auto"
      >
        <Link href={link}>
          Puxar capivara
          <ArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
