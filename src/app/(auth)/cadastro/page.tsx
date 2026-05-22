import type { Metadata } from "next";
import Link from "next/link";
import { CadastroForm } from "./cadastro-form";

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
      <div className="rounded-lg border border-line bg-card p-8 shadow-[var(--shadow-card)]">
        <h1 className="font-display text-2xl font-bold text-cocoa">
          Criar conta
        </h1>
        <p className="text-sm text-tabaco mt-1">
          Sem cobrança nessa etapa. Você só paga quando puxar uma capivara.
        </p>

        <CadastroForm tipoInicial={tipoInicial} />
      </div>

      <p className="text-center text-sm text-tabaco mt-6">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="text-fur font-medium underline-offset-4 hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
