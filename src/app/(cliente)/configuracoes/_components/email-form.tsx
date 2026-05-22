"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mudarEmailAction } from "../actions";

export function EmailForm() {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await mudarEmailAction(fd);
      if (res.ok) {
        setMsg(res.message ?? "Salvo.");
        (e.target as HTMLFormElement).reset();
      } else setErr(res.error);
    });
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div>
        <Label htmlFor="novoEmail">Novo email</Label>
        <Input id="novoEmail" name="novoEmail" type="email" required />
      </div>
      {msg && <p className="text-sm text-ok">{msg}</p>}
      {err && <p className="text-sm text-red-600">{err}</p>}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Enviando..." : "Mudar email"}
      </Button>
    </form>
  );
}
