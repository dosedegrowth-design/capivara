import Link from "next/link";
import { Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";

interface EmConstrucaoProps {
  area: string;
  descricao?: string;
  voltarHref?: string;
  voltarLabel?: string;
}

export function EmConstrucao({
  area,
  descricao,
  voltarHref = "/dashboard",
  voltarLabel = "Voltar",
}: EmConstrucaoProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 md:py-20">
      <div className="rounded-2xl border border-line bg-card p-10 text-center">
        <Mascot pose="padrao" size={100} animate="idle" />
        <Badge variant="warn" className="mt-4">
          <Construction className="size-3 mr-1.5" /> Em construção
        </Badge>
        <h1 className="font-display text-2xl md:text-3xl font-bold text-cocoa mt-3">
          {area}
        </h1>
        <p className="text-tabaco mt-2 max-w-sm mx-auto">
          {descricao ??
            "Esta área está sendo desenvolvida. Volte em breve."}
        </p>
        <Link
          href={voltarHref}
          className="inline-flex items-center gap-2 text-sm font-mono text-fur hover:underline underline-offset-4 mt-6"
        >
          ← {voltarLabel}
        </Link>
      </div>
    </div>
  );
}
