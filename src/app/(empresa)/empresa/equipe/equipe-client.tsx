"use client";

import { useState, useTransition } from "react";
import { Loader2, UserPlus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  convidarMembroAction,
  atualizarRoleAction,
  removerMembroAction,
} from "./actions";

export interface MemberRow {
  id: string;
  user_id: string;
  role: "admin" | "operator" | "viewer";
  cost_center: string | null;
  invited_at: string;
  accepted_at: string | null;
  user_full_name?: string | null;
  user_email?: string | null;
}

export function EquipeClient({
  members,
  currentUserId,
  isAdmin,
}: {
  members: MemberRow[];
  currentUserId: string;
  isAdmin: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "operator" | "viewer">("operator");
  const [costCenter, setCostCenter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const fd = new FormData();
    fd.set("email", email);
    fd.set("role", role);
    fd.set("costCenter", costCenter);

    startTransition(async () => {
      const res = await convidarMembroAction(fd);
      if (!res.ok) {
        setError(traduzErro(res.error));
        return;
      }
      setSuccess(`Convite enviado pra ${email}.`);
      setEmail("");
      setCostCenter("");
      setShowInvite(false);
    });
  }

  function handleChangeRole(memberId: string, newRole: string) {
    const fd = new FormData();
    fd.set("memberId", memberId);
    fd.set("role", newRole);
    startTransition(async () => {
      await atualizarRoleAction(fd);
    });
  }

  function handleRemove(memberId: string, name: string) {
    if (!confirm(`Remover ${name} da equipe?`)) return;
    const fd = new FormData();
    fd.set("memberId", memberId);
    startTransition(async () => {
      const res = await removerMembroAction(fd);
      if (!res.ok) alert(res.error);
    });
  }

  return (
    <div className="space-y-4">
      {/* Mensagens */}
      {success && (
        <div className="rounded-md border border-ok/30 bg-ok/5 px-3 py-2 text-sm text-ok">
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Header com convite */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-tabaco">
          <strong className="text-cocoa">{members.length}</strong> membro{members.length === 1 ? "" : "s"} na equipe
        </p>
        {isAdmin && !showInvite && (
          <Button onClick={() => setShowInvite(true)} size="sm">
            <UserPlus className="size-4 mr-1" />
            Convidar membro
          </Button>
        )}
      </div>

      {/* Form de convite */}
      {showInvite && (
        <form
          onSubmit={handleInvite}
          className="rounded-lg border border-line bg-card p-5 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colega@empresa.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="costCenter">Centro de custo (opcional)</Label>
              <Input
                id="costCenter"
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                placeholder="comercial-sp"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="role">Função</Label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as typeof role)}
              className="mt-1 w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-cocoa"
            >
              <option value="operator">Operador — pode criar consultas</option>
              <option value="viewer">Visualizador — só leitura</option>
              <option value="admin">Admin — tudo (incl. recarga e API keys)</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="size-4 mr-1 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar convite"
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowInvite(false);
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista */}
      <div className="rounded-lg border border-line bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-2/60 text-xs font-mono uppercase tracking-wider text-tabaco">
            <tr>
              <th className="text-left px-4 py-3">Membro</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Centro</th>
              <th className="text-left px-4 py-3">Função</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Status</th>
              {isAdmin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {members.map((m) => {
              const isCurrent = m.user_id === currentUserId;
              return (
                <tr key={m.id}>
                  <td className="px-4 py-3">
                    <p className="text-cocoa font-medium">
                      {m.user_full_name ?? m.user_email ?? "—"}
                      {isCurrent && (
                        <span className="ml-2 text-[10px] font-mono text-fur">
                          (você)
                        </span>
                      )}
                    </p>
                    {m.user_email && m.user_full_name && (
                      <p className="text-xs text-tabaco">{m.user_email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell font-mono text-xs text-tabaco">
                    {m.cost_center ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin && !isCurrent ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleChangeRole(m.id, e.target.value)}
                        className="rounded border border-line bg-card px-2 py-1 text-xs"
                      >
                        <option value="admin">Admin</option>
                        <option value="operator">Operador</option>
                        <option value="viewer">Visualizador</option>
                      </select>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {roleLabel(m.role)}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {m.accepted_at ? (
                      <Badge variant="ok" className="text-[10px]">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="warn" className="text-[10px]">
                        Convite pendente
                      </Badge>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      {!isCurrent && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            handleRemove(m.id, m.user_full_name ?? m.user_email ?? "esse membro")
                          }
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function roleLabel(r: string): string {
  if (r === "admin") return "Admin";
  if (r === "operator") return "Operador";
  return "Visualizador";
}

function traduzErro(e: string): string {
  if (e === "email_invalido") return "Email inválido.";
  if (e === "ja_e_membro") return "Essa pessoa já é membro da equipe.";
  if (e === "admin_required") return "Apenas administradores podem convidar.";
  if (e === "role_invalida") return "Função inválida.";
  return e;
}
