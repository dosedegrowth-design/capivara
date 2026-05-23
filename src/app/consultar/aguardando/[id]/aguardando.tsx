"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { createClient } from "@/lib/supabase/client";
import { formatBRL } from "@/lib/formatters";

type Props = {
  consultaId: string;
  status: string;
  paymentType: string;
  pixQrcode: string | null;
  pixCopyPaste: string | null;
  boletoUrl: string | null;
  amountCents: number;
  nomeProduto?: string | null;
  descricaoProduto?: string | null;
  bullets?: string[] | null;
  isAvulso?: boolean;
};

export function AguardandoPagamento({
  consultaId,
  status: statusInicial,
  paymentType,
  pixQrcode,
  pixCopyPaste,
  boletoUrl,
  amountCents,
  nomeProduto,
  descricaoProduto,
  bullets,
  isAvulso,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(statusInicial);
  const [copiado, setCopiado] = useState(false);

  // Realtime + fallback polling
  useEffect(() => {
    const supabase = createClient();

    // Realtime
    const channel = supabase
      .channel(`consulta:${consultaId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "capivara",
          table: "consultations",
          filter: `id=eq.${consultaId}`,
        },
        (payload) => {
          const novo = (payload.new as { status: string }).status;
          setStatus(novo);
          if (novo === "completed") {
            router.push(`/historico/${consultaId}`);
          }
        }
      )
      .subscribe();

    // Polling fallback (a cada 5s — caso Realtime trave)
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("consultations")
        .select("status")
        .eq("id", consultaId)
        .maybeSingle();
      if (data?.status) {
        setStatus(data.status);
        if (data.status === "completed") {
          router.push(`/historico/${consultaId}`);
        }
      }
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [consultaId, router]);

  function copiarPix() {
    if (!pixCopyPaste) return;
    navigator.clipboard.writeText(pixCopyPaste);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const investigando = status === "paid" || status === "processing";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <div className="rounded-2xl border border-line bg-card p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <Mascot
            pose={investigando ? "investigando" : "padrao"}
            size={120}
            animate={investigando ? "investigando" : "idle"}
          />
        </div>

        <Badge variant={investigando ? "info" : "warn"} className="mb-3 mx-auto block w-fit">
          {investigando ? "Investigando..." : "Aguardando pagamento"}
        </Badge>

        <h1 className="font-display text-3xl font-bold text-cocoa text-center">
          {investigando
            ? "Pagamento confirmado!"
            : paymentType === "pix"
            ? "Pague o PIX abaixo"
            : paymentType === "boleto"
            ? "Boleto gerado"
            : "Finalize o cartão"}
        </h1>

        <p className="mt-2 text-center text-tabaco">
          {investigando
            ? "Consultando bases. Fique nessa tela, te avisamos quando terminar."
            : `Total: ${formatBRL(amountCents)}`}
        </p>

        {/* Info do produto / plano */}
        {nomeProduto && !investigando && (
          <div className="mt-4 rounded-lg border border-line bg-paper-2/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-widest text-tabaco">
                  {isAvulso ? "Consulta avulsa" : "Plano contratado"}
                </p>
                <p className="font-display font-bold text-cocoa mt-0.5 truncate">
                  {nomeProduto}
                </p>
              </div>
            </div>
            {descricaoProduto && (
              <p className="mt-2 text-xs text-tabaco leading-relaxed">
                {descricaoProduto}
              </p>
            )}
            {bullets && bullets.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2 text-[11px] text-cocoa/80 leading-snug"
                  >
                    <span className="size-1 rounded-full bg-fur mt-1.5 shrink-0" />
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* PIX */}
        {paymentType === "pix" && pixQrcode && !investigando && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="bg-white p-3 rounded-md border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/png;base64,${pixQrcode}`}
                alt="QR Code PIX"
                width={240}
                height={240}
                className="size-60"
              />
            </div>

            {pixCopyPaste && (
              <div className="w-full space-y-2">
                <p className="text-xs font-mono text-tabaco text-center">
                  ou copie o código:
                </p>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={pixCopyPaste}
                    className="flex-1 rounded-md border border-line bg-paper-2 px-3 py-2 text-xs font-mono text-cocoa truncate"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={copiarPix}
                  >
                    {copiado ? (
                      <>
                        <Check className="size-4" /> Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" /> Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Boleto */}
        {paymentType === "boleto" && boletoUrl && !investigando && (
          <div className="mt-6 flex flex-col items-center gap-3">
            <Button asChild variant="accent" size="lg">
              <a href={boletoUrl} target="_blank" rel="noreferrer">
                Ver boleto
                <ExternalLink className="size-4" />
              </a>
            </Button>
            <p className="text-xs text-tabaco font-mono text-center">
              Após o pagamento, atualizamos automaticamente.
            </p>
          </div>
        )}

        {/* Cartão */}
        {paymentType === "cartao_avista" && !investigando && (
          <p className="mt-6 text-center text-tabaco">
            Em breve: integração com cartão direto na Capivara.
          </p>
        )}

        {/* Status indicador */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-mono text-tabaco">
          <span className="flex size-2 rounded-full bg-fur animate-pulse" />
          Aguardando confirmação · status: {status}
        </div>
      </div>
    </div>
  );
}
