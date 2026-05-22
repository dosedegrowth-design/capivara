"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PACOTES_MANADA, type PacoteManada } from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";
import { iniciarRecargaAction } from "./actions";

interface Props {
  isAdmin: boolean;
}

export function CreditosClient({ isAdmin }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [paymentType] = useState<"pix" | "boleto">("pix");

  function comprar(pacote: PacoteManada) {
    if (!isAdmin) return;
    setLoadingId(pacote.id);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("pacoteId", pacote.id);
      fd.set("paymentType", paymentType);
      const res = await iniciarRecargaAction(fd);
      setLoadingId(null);
      if (res.ok) {
        router.push(`/empresa/creditos/aguardando/${res.transactionId}`);
      } else {
        alert(`Falha: ${res.error}`);
      }
    });
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {PACOTES_MANADA.map((pacote, i) => {
        const isPopular = i === 1;
        const isMaster = i === PACOTES_MANADA.length - 1;
        const precoPorCredito =
          (pacote.valor_centavos / pacote.folhasTotais).toFixed(2);

        return (
          <div
            key={pacote.id}
            className={`relative flex flex-col rounded-lg border p-6 bg-card transition-all hover:shadow-[var(--shadow-card)] ${
              isPopular
                ? "border-saffron ring-1 ring-saffron/30"
                : isMaster
                ? "border-fur"
                : "border-line"
            }`}
          >
            {isPopular && (
              <Badge variant="accent" className="absolute -top-3 left-6">
                Mais escolhido
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
            </div>

            <Badge variant="ok" className="text-[10px] mt-2 self-start">
              +{pacote.bonusPercent}% bônus
            </Badge>

            <p className="text-[10px] font-mono text-tabaco/70 mt-2">
              R$ {precoPorCredito} / crédito
            </p>

            <ul className="mt-5 mb-6 space-y-2 flex-1">
              {pacote.recursos.map((r) => (
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
              variant={isPopular ? "accent" : "secondary"}
              size="md"
              className="w-full"
              onClick={() => comprar(pacote)}
              disabled={!isAdmin || pending}
            >
              {loadingId === pacote.id ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                "Recarregar com PIX"
              )}
            </Button>

            {!isAdmin && (
              <p className="text-[10px] text-tabaco/70 mt-2 text-center">
                Só admin pode recarregar
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
