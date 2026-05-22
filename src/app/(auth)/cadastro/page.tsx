import type { Metadata } from "next";
import Link from "next/link";
import { CadastroForm } from "./cadastro-form";
import { TERMS_OF_USE, PRIVACY_POLICY } from "@/lib/legal/documents";

export const metadata: Metadata = {
  title: "Criar conta · Capivara",
};

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const tipoInicial = tipo === "empresa" ? "empresa" : "pf";

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-cream/15 bg-cream/[0.04] backdrop-blur-xl p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-bold text-cream">
          Criar conta
        </h1>
        <p className="text-sm text-cream/70 mt-1">
          Sem cobrança nessa etapa. Você só paga quando puxar uma capivara.
        </p>

        <CadastroForm
          tipoInicial={tipoInicial}
          toSVersion={TERMS_OF_USE.version}
          privacyVersion={PRIVACY_POLICY.version}
        />
      </div>

      <p className="text-center text-sm text-cream/70 mt-6">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-saffron font-medium underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
