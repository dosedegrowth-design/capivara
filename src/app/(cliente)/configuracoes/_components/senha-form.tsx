"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mudarSenhaAction } from "../actions";

export function SenhaForm() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await mudarSenhaAction(fd);
      if (res.ok) {
        setMsg(res.message ?? "Salvo.");
        (e.target as HTMLFormElement).reset();
      } else setErr(res.error);
    });
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div>
        <Label htmlFor="senhaAtual">Senha atual</Label>
        <Input id="senhaAtual" name="senhaAtual" type="password" required autoComplete="current-password" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="novaSenha">Nova senha</Label>
          <Input id="novaSenha" name="novaSenha" type="password" required minLength={8} autoComplete="new-password" />
        </div>
        <div>
          <Label htmlFor="confirmacao">Confirmar nova senha</Label>
          <Input id="confirmacao" name="confirmacao" type="password" required minLength={8} autoComplete="new-password" />
        </div>
      </div>
      {msg && <p className="text-sm text-ok">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Alterando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
