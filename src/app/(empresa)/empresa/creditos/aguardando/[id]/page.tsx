import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/formatters";

export default async function RecargaAguardandoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tx } = await supabase
    .from("transactions")
    .select(
      "id, company_id, amount_cents, folhas_added, bonus_percentage, status, payment_method, pix_qrcode, pix_copy_paste, boleto_url, paid_at, created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (!tx) redirect("/empresa/creditos");

  // Ja pago? Pula direto
  if (tx.status === "paid") {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-ok/30 bg-ok/5 p-8 text-center">
          <CheckCircle2 className="size-12 text-ok mx-auto mb-3" />
          <h1 className="font-display text-2xl font-bold text-cocoa">
            Recarga confirmada!
          </h1>
          <p className="text-tabaco mt-2">
            <strong className="text-fur">+{tx.folhas_added}</strong> créditos foram adicionados ao saldo da sua empresa.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="accent">
              <Link href="/empresa/creditos">
                Ver saldo
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/empresa">Painel da empresa</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <Link
        href="/empresa/creditos"
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Voltar pra créditos
      </Link>

      <div className="rounded-2xl border border-saffron/30 bg-saffron/5 p-8">
        <Badge variant="accent" className="mb-3">
          <Clock className="size-3.5 mr-1.5 animate-pulse" />
          Aguardando pagamento
        </Badge>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-cocoa">
          Recarga de {tx.folhas_added} créditos
        </h1>
        <p className="text-tabaco mt-2">
          <strong>{formatBRL(tx.amount_cents)}</strong> via{" "}
          <span className="uppercase font-mono">{tx.payment_method}</span>.{" "}
          {tx.payment_method === "pix" ? (
            <>Escaneie o QR Code abaixo ou copie o código PIX.</>
          ) : tx.payment_method === "boleto" ? (
            <>Abra o boleto e pague no banco ou aplicativo.</>
          ) : (
            <>Finalize o pagamento no cartão.</>
          )}
        </p>

        {/* PIX */}
        {tx.payment_method === "pix" && tx.pix_qrcode && (
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="rounded-lg bg-cream p-3 border border-line shrink-0">
              <Image
                src={`data:image/png;base64,${tx.pix_qrcode}`}
                alt="QR Code PIX"
                width={200}
                height={200}
                unoptimized
              />
            </div>

            <div className="flex-1 w-full">
              <p className="text-xs font-mono uppercase tracking-wider text-tabaco mb-2">
                PIX copia e cola
              </p>
              <code className="block bg-cocoa text-cream text-xs p-3 rounded font-mono break-all max-h-32 overflow-y-auto">
                {tx.pix_copy_paste}
              </code>
              <p className="text-[11px] text-tabaco mt-2 leading-relaxed">
                PIX confirma em segundos. Esta página atualiza automaticamente
                quando o pagamento for processado.
              </p>
            </div>
          </div>
        )}

        {/* Boleto */}
        {tx.payment_method === "boleto" && tx.boleto_url && (
          <div className="mt-6">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <a href={tx.boleto_url} target="_blank" rel="noopener noreferrer">
                Abrir boleto
                <ArrowRight className="size-4" />
              </a>
            </Button>
            <p className="text-xs text-tabaco mt-3">
              Boletos compensam em 1-2 dias úteis após pagamento.
            </p>
          </div>
        )}

        {/* Refresh hint */}
        <div className="mt-6 pt-6 border-t border-line/60 flex items-center gap-3 text-xs font-mono text-tabaco">
          <div className="size-2 rounded-full bg-saffron animate-pulse" />
          Esta página recarrega sozinha quando o pagamento for confirmado.
        </div>
      </div>

      {/* Meta-refresh pra polling */}
      <meta httpEquiv="refresh" content="15" />
    </div>
  );
}
