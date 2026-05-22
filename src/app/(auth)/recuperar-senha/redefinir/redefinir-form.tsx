"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/lib/auth/actions";

export function RedefinirSenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [mostrar, setMostrar] = useState(false);

  async function action(formData: FormData) {
    setErro(null);
    const result = await resetPasswordAction(formData);
    if (result.error) setErro(result.error);
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="senha">Nova senha</Label>
        <div className="relative">
          <Input
            id="senha"
            name="senha"
            type={mostrar ? "text" : "password"}
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            required
            minLength={8}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setMostrar((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tabaco hover:text-fur transition-colors"
            tabIndex={-1}
            aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
          >
            {mostrar ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmacao">Confirmar senha</Label>
        <Input
          id="confirmacao"
          name="confirmacao"
          type={mostrar ? "text" : "password"}
          placeholder="Repita a senha"
          autoComplete="new-password"
          required
          minLength={8}
        />
      </div>

      <div className="flex items-start gap-2 rounded-md bg-cream/60 border border-line p-3 text-xs">
        <ShieldCheck className="size-4 text-fur shrink-0 mt-0.5" />
        <p className="text-tabaco leading-relaxed">
          Dica: use uma senha forte que misture letras, números e símbolos. Pelo
          menos 12 caracteres pra mais segurança.
        </p>
      </div>

      {erro && (
        <div className="rounded-md border border-err/30 bg-err/10 px-3 py-2 text-sm text-err">
          {erro}
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
      variant="primary"
      size="lg"
      className="w-full"
      disabled={pending}
    >
      {pending ? "Salvando..." : "Definir nova senha"}
    </Button>
  );
}
