import Link from "next/link";
import {
  ArrowRight,
  Check,
  Banknote,
  AlertTriangle,
  FileText,
  Lock,
  ClipboardList,
  Shield,
  UserRound,
  FileCheck,
  FileDigit,
  Gavel,
  Camera,
  Star,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/formatters";
import type { ProdutoAvulso } from "@/lib/consultas/planos";

/**
 * Card horizontal pra listar produto pontual (avulso).
 *
 * Padrao: NAO mostra precoB2B (so B2C). Botao linka pra
 * /consultar/avulso/{produto.id} onde o cliente conclui a consulta.
 */

const ICONS: Record<string, LucideIcon> = {
  Banknote,
  AlertTriangle,
  FileText,
  Lock,
  ClipboardList,
  Shield,
  UserRound,
  FileCheck,
  FileDigit,
  Gavel,
  Camera,
  Star,
};

interface Props {
  produto: ProdutoAvulso;
  className?: string;
}

export function ProdutoAvulsoCard({ produto, className }: Props) {
  const Icon = produto.icon ? ICONS[produto.icon] ?? HelpCircle : HelpCircle;

  return (
    <div
      className={cn(
        "group relative flex flex-col sm:flex-row gap-4 sm:gap-5 rounded-xl border border-line bg-card p-5 sm:p-6",
        "transition-all duration-200 ease-[var(--ease-cap)]",
        "hover:shadow-[var(--shadow-pop)] hover:-translate-y-0.5 hover:border-fur/40",
        className
      )}
    >
      {/* Icone */}
      <div className="shrink-0">
        <div className="size-12 sm:size-14 rounded-lg bg-fur/15 text-fur flex items-center justify-center">
          <Icon className="size-6 sm:size-7" strokeWidth={1.75} />
        </div>
      </div>

      {/* Conteudo */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div className="min-w-0">
            <h3 className="font-display text-lg sm:text-xl font-bold text-cocoa leading-tight">
              {produto.nome}
            </h3>
            <p className="mt-1 text-sm text-tabaco leading-relaxed">
              {produto.descricao}
            </p>
          </div>

          {/* Preco B2C grande */}
          <div className="shrink-0 text-left sm:text-right">
            <p className="text-[10px] font-mono uppercase tracking-widest text-tabaco">
              Avulso
            </p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-cocoa leading-none">
              {formatBRL(produto.precoB2C_centavos)}
            </p>
          </div>
        </div>

        {/* Bullets */}
        {produto.bullets.length > 0 && (
          <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
            {produto.bullets.map((b) => (
              <li
                key={b}
                className="flex items-start gap-1.5 text-[13px] text-cocoa/80 leading-snug"
              >
                <Check className="size-3.5 text-ok shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Publico alvo + CTA */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-line/60">
          <div className="text-xs text-tabaco">
            <span className="font-mono uppercase tracking-widest text-tabaco/70 mr-1">
              Pra quem:
            </span>
            {produto.publicoAlvo}
          </div>

          <Button
            asChild
            variant="accent"
            size="sm"
            className="shrink-0 self-start sm:self-auto"
          >
            <Link href={`/consultar/avulso/${produto.id}`}>
              Consultar agora
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
