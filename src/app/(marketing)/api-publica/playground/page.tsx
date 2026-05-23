import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Beaker, Info } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PlaygroundClient } from "./playground-client";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Playground · API Capivara",
  description:
    "Teste a API Capivara sem código. Cole sua chave Bearer, escolha plano e CPF/CNPJ/placa, clique enviar.",
  alternates: { canonical: `${SITE}/api-publica/playground` },
};

export default function PlaygroundPage() {
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <Link
          href="/api-publica"
          className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          API Capivara
        </Link>

        <header className="mb-8">
          <Badge variant="outline" className="mb-3 font-mono">
            <Beaker className="size-3 mr-1 inline" />
            Playground interativo
          </Badge>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Teste a API sem código
          </h1>
          <p className="text-tabaco mt-2 leading-relaxed">
            Cole sua chave Bearer, escolha categoria + plano + alvo, clique
            enviar. A request real é feita no seu navegador, com sua chave.
          </p>
        </header>

        {/* Disclaimer */}
        <div className="rounded-lg border border-info/30 bg-info/5 p-4 mb-6 flex items-start gap-3">
          <Info className="size-5 text-info shrink-0 mt-0.5" />
          <div className="text-xs text-cocoa leading-relaxed">
            <p className="font-semibold mb-1">Antes de testar</p>
            <p className="text-tabaco">
              • A chave fica só no seu navegador, não enviamos pra lugar nenhum
              além da API.<br />
              • Sua empresa precisa ter saldo em R$ suficiente.<br />
              • Use targets reais (CPF/CNPJ/placa válidos).{" "}
              <strong className="text-cocoa">A consulta vai debitar do saldo da empresa</strong> igual qualquer chamada de produção.<br />
              • Use{" "}
              <code className="font-mono text-fur">external_reference</code> único pra evitar duplicar.
            </p>
          </div>
        </div>

        <PlaygroundClient />
      </div>
    </div>
  );
}
