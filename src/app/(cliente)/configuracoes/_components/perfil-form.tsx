"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { atualizarPerfilAction } from "../actions";

export function PerfilForm({ fullName, phone }: { fullName: string; phone: string }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await atualizarPerfilAction(fd);
      if (res.ok) setMsg(res.message ?? "Salvo.");
      else setErr(res.error);
    });
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="fullName">Nome completo</Label>
          <Input id="fullName" name="fullName" defaultValue={fullName} required />
        </div>
        <div>
          <Label htmlFor="phone">Telefone (opcional)</Label>
          <Input id="phone" name="phone" defaultValue={phone} placeholder="(11) 99999-9999" />
        </div>
      </div>
      {msg && <p className="text-sm text-ok">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
