"use client";

import { useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, type AuthResult } from "@/lib/auth/actions";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function action(formData: FormData) {
    setError(null);
    if (redirectTo) formData.set("redirect", redirectTo);
    const result: AuthResult = await signInAction(formData);
    if (result.error) setError(result.error);
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-cream/80">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="voce@email.com"
          autoComplete="email"
          required
          className="bg-cream/[0.06] border-cream/20 text-cream placeholder:text-cream/30 focus-visible:border-saffron focus-visible:ring-saffron/20"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="senha" className="text-cream/80">Senha</Label>
          <Link
            href="/recuperar-senha"
            className="text-xs text-cream/60 hover:text-saffron transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>
        <div className="relative">
          <Input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-10 bg-cream/[0.06] border-cream/20 text-cream placeholder:text-cream/30 focus-visible:border-saffron focus-visible:ring-saffron/20"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/50 hover:text-saffron transition-colors"
            tabIndex={-1}
            aria-label={mostrarSenha ? "Esconder senha" : "Mostrar senha"}
          >
            {mostrarSenha ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="accent"
      size="lg"
      className="w-full"
      disabled={pending}
    >
      {pending ? "Entrando..." : "Entrar"}
    </Button>
  );
}
