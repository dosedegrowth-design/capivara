"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deletarContaAction } from "../actions";

export function DeletarContaBox() {
  const [pending, startTransition] = useTransition();
  const [show, setShow] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await deletarContaAction(fd);
      if (!res.ok) setErr(res.error);
      // sucesso redireciona (server action)
    });
  }

  if (!show) {
    return (
      <Button
        variant="ghost"
        onClick={() => setShow(true)}
        className="text-red-700 hover:bg-red-50 border border-red-300"
      >
        <Trash2 className="size-4 mr-1" />
        Quero deletar minha conta
      </Button>
    );
  }

  return (
    <form onSubmit={handle} className="space-y-3">
      <div className="rounded-md bg-red-100 p-3 text-sm text-red-900">
        <p className="font-semibold mb-1">Atenção:</p>
        <ul className="text-xs space-y-0.5 list-disc list-inside">
          <li>Sua conta será removida permanentemente</li>
          <li>Suas consultas serão anonimizadas (não removíveis por compliance)</li>
          <li>Você sairá automaticamente após confirmar</li>
          <li>Memberships em empresas serão removidos</li>
        </ul>
      </div>

      <div>
        <Label htmlFor="confirmacao" className="text-red-700">
          Digite <code className="bg-red-200 px-1 rounded">DELETAR</code> pra confirmar:
        </Label>
        <Input
          id="confirmacao"
          name="confirmacao"
          required
          autoComplete="off"
          placeholder="DELETAR"
        />
      </div>

      <div>
        <Label htmlFor="senha" className="text-red-700">
          Sua senha atual (confirmação de identidade):
        </Label>
        <Input
          id="senha"
          name="senha"
          type="password"
          required
          autoComplete="current-password"
          placeholder="••••••••"
        />
      </div>

      {err && <p className="text-sm text-red-700">{err}</p>}

      <div className="flex gap-2">
        <Button type="submit" variant="ghost" disabled={pending} className="text-red-700 border border-red-500 hover:bg-red-100">
          {pending ? "Removendo..." : "Confirmar exclusão"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setShow(false);
            setErr(null);
          }}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
