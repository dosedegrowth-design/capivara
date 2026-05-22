import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar · Capivara",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-line bg-card p-8 shadow-[var(--shadow-card)]">
        <h1 className="font-display text-2xl font-bold text-cocoa">
          Entrar na sua conta
        </h1>
        <p className="text-sm text-tabaco mt-1">
          A capivara tem boa memória — ela lembra de você.
        </p>

        <LoginForm redirectTo={redirect} />
      </div>

      <p className="text-center text-sm text-tabaco mt-6">
        Não tem conta ainda?{" "}
        <Link
          href="/cadastro"
          className="text-fur font-medium underline-offset-4 hover:underline"
        >
          Cadastrar agora
        </Link>
      </p>
    </div>
  );
}
