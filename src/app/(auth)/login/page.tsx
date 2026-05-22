import type { Metadata } from "next";
import Link from "next/link";
import { LogIn, ShieldCheck } from "lucide-react";

import { Mascot } from "@/components/capivara/mascot";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar · Capivara",
  description:
    "Acesse sua conta Capivara pra ver consultas, baixar PDFs e gerenciar sua empresa.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="w-full max-w-md">
      {/* Mascote acima do card */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-saffron/30 blur-2xl rounded-full"
          />
          <Mascot pose="concluido" size={88} animate="idle" />
        </div>
      </div>

      {/* Card glass principal */}
      <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] backdrop-blur-xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-cream">
            Bem-vinda de volta
          </h1>
          <p className="text-sm text-cream/70 mt-2">
            A capivara tem boa memória — ela lembra de você.
          </p>
        </div>

        <LoginForm redirectTo={redirect} />

        {/* Divisor */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-cream/15" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-cream/40">
            ou
          </span>
          <div className="flex-1 h-px bg-cream/15" />
        </div>

        {/* CTA cadastro */}
        <Link
          href="/cadastro"
          className="flex items-center justify-center gap-2 w-full rounded-lg border border-saffron/50 bg-saffron/10 text-saffron px-4 py-3 text-sm font-semibold hover:bg-saffron/20 transition-colors"
        >
          <LogIn className="size-4" />
          Criar conta nova
        </Link>
      </div>

      {/* Trust badges abaixo do card */}
      <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-mono text-cream/50">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="size-3.5 text-ok" />
          LGPD
        </span>
        <span className="text-cream/30">·</span>
        <span>Conta gratuita</span>
        <span className="text-cream/30">·</span>
        <span>Sem cartão</span>
      </div>
    </div>
  );
}
