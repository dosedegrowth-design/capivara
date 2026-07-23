"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { enviarContatoAction } from "./actions";

export function ContatoForm() {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<null | { ok: boolean; message: string }>(null);

  function onSubmit(formData: FormData) {
    setStatus(null);
    startTransition(async () => {
      const r = await enviarContatoAction(formData);
      setStatus(r.ok
        ? { ok: true, message: "Mensagem enviada! Responderemos no email informado." }
        : { ok: false, message: r.error });
    });
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input id="nome" name="nome" placeholder="Seu nome completo" required minLength={2} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" placeholder="voce@email.com" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assunto">Assunto</Label>
        <Input id="assunto" name="assunto" placeholder="Dúvida sobre planos, suporte, parceria…" required minLength={3} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensagem">Mensagem</Label>
        <Textarea id="mensagem" name="mensagem" rows={5} placeholder="Como podemos ajudar?" required minLength={10} maxLength={5000} />
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full" disabled={pending}>
        {pending ? "Enviando..." : "Enviar mensagem"}
      </Button>

      {status && (
        <div
          role="status"
          className={
            "rounded-lg p-3 text-sm " +
            (status.ok
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800")
          }
        >
          {status.message}
        </div>
      )}

      <p className="text-xs text-tabaco/70 font-mono text-center pt-2">
        Ao enviar, você concorda com nossos{" "}
        <Link href="/lgpd" className="text-fur underline-offset-4 hover:underline">
          termos de privacidade
        </Link>
        .
      </p>
    </form>
  );
}
