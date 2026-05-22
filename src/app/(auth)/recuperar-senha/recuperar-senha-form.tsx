"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Mail, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { recoverPasswordAction } from "@/lib/auth/actions";

export function RecuperarSenhaForm() {
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function action(formData: FormData) {
    setErro(null);
    const result = await recoverPasswordAction(formData);
    if (result.error) setErro(result.error);
    else setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="mt-6 rounded-md border border-ok/30 bg-ok/10 p-4 flex items-start gap-3">
        <CheckCircle2 className="size-5 text-ok shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-cocoa">Link enviado</p>
          <p className="text-xs text-tabaco mt-1">
            Verifique sua caixa de entrada (e o spam). O link expira em 1 hora.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-tabaco" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@email.com"
            autoComplete="email"
            required
            className="pl-9"
          />
        </div>
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
      {pending ? "Enviando..." : "Enviar link de recuperação"}
    </Button>
  );
}
