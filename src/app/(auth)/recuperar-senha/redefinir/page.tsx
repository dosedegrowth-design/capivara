import type { Metadata } from "next";
import Link from "next/link";
import { RedefinirSenhaForm } from "./redefinir-form";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default function RedefinirSenhaPage() {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-line bg-card p-8 shadow-[var(--shadow-card)]">
        <h1 className="font-display text-2xl font-bold text-cocoa">
          Nova senha
        </h1>
        <p className="text-sm text-tabaco mt-1">
          Defina uma nova senha. Você será conectado automaticamente depois.
        </p>

        <RedefinirSenhaForm />
      </div>

      <p className="text-center text-sm text-tabaco mt-6">
        Lembrou a senha?{" "}
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
