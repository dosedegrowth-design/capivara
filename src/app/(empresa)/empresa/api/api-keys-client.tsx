"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Copy, Eye, Key, Plus, ShieldOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createApiKeyAction, revokeApiKeyAction } from "./actions";

export interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  total_calls: number;
  last_used_at: string | null;
  created_at: string;
  revoked_at: string | null;
}

interface Props {
  keys: ApiKeyRow[];
}

export function ApiKeysClient({ keys }: Props) {
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ id: string; name: string; fullKey: string } | null>(
    null
  );
  const [name, setName] = useState("");
  const [acceptApiTerms, setAcceptApiTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 3) {
      setError("Nome precisa de pelo menos 3 caracteres.");
      return;
    }
    if (!acceptApiTerms) {
      setError("Você precisa aceitar os Termos da API.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("acceptApiTerms", "true");
      const res = await createApiKeyAction(fd);
      if (!res.ok) {
        setError(traduzErro(res.error));
        return;
      }
      if (res.key) {
        setRevealed({ id: res.key.id, name: res.key.name, fullKey: res.key.fullKey });
        setName("");
        setAcceptApiTerms(false);
        setCreating(false);
      }
    });
  }

  async function handleRevoke(keyId: string) {
    if (!confirm("Revogar essa chave? Todas as integracoes que usam ela vao parar.")) return;
    const fd = new FormData();
    fd.set("keyId", keyId);
    startTransition(async () => {
      const res = await revokeApiKeyAction(fd);
      if (!res.ok) {
        alert("Falha ao revogar: " + res.error);
      }
    });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  const ativas = keys.filter((k) => !k.revoked_at);
  const revogadas = keys.filter((k) => k.revoked_at);

  return (
    <div className="space-y-6">
      {/* Banner de chave revelada */}
      {revealed && (
        <div className="rounded-lg border-2 border-saffron bg-saffron/10 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Key className="size-5 text-saffron shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-cocoa">
                  Chave criada: <span className="font-mono">{revealed.name}</span>
                </p>
                <p className="text-xs text-tabaco mt-1">
                  Copia agora. Por seguranca, nao vamos mostrar essa chave de novo.
                </p>
                <div className="mt-3 flex items-center gap-2 rounded bg-cocoa text-cream font-mono text-xs p-3 overflow-x-auto">
                  <code className="break-all">{revealed.fullKey}</code>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => copyToClipboard(revealed.fullKey)}
                  >
                    <Copy className="size-3.5 mr-1" />
                    Copiar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRevealed(null)}>
                    Ja salvei
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botao criar / Form */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-cocoa">Chaves ativas</h2>
          <p className="text-xs text-tabaco">
            Use em <code className="font-mono">Authorization: Bearer cap_live_...</code>
          </p>
        </div>
        {!creating && (
          <Button onClick={() => setCreating(true)}>
            <Plus className="size-4 mr-1" />
            Nova chave
          </Button>
        )}
      </div>

      {creating && (
        <form
          onSubmit={handleCreate}
          className="rounded-lg border border-line bg-card p-5 space-y-3"
        >
          <div>
            <Label htmlFor="key-name">Nome da chave</Label>
            <Input
              id="key-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Producao backend, Integracao CRM..."
              autoFocus
              required
            />
            <p className="text-xs text-tabaco mt-1">
              So pra voce identificar. Nao aparece pra outros sistemas.
            </p>
          </div>

          {/* Aceite compacto dos Termos da API */}
          <label
            htmlFor="acceptApiTerms"
            className="flex items-start gap-2.5 cursor-pointer rounded-md border border-line bg-paper-2/40 p-3 hover:bg-paper-2/60 transition-colors"
          >
            <Checkbox
              id="acceptApiTerms"
              checked={acceptApiTerms}
              onCheckedChange={(v) => setAcceptApiTerms(Boolean(v))}
              className="mt-0.5"
            />
            <span className="text-xs text-tabaco leading-relaxed">
              Sou admin autorizado e aceito os{" "}
              <Link
                href="/api-termos"
                target="_blank"
                className="text-fur hover:underline"
              >
                Termos da API
              </Link>
              . Comprometo-me a guardar a chave em segredo.
            </span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={pending || !acceptApiTerms}>
              {pending ? "Gerando..." : "Gerar chave"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setCreating(false);
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {/* Lista de chaves ativas */}
      <div className="space-y-2">
        {ativas.length === 0 && (
          <div className="rounded-lg border border-dashed border-line bg-card p-8 text-center">
            <Key className="size-8 text-tabaco/40 mx-auto mb-2" />
            <p className="text-sm text-tabaco">Nenhuma chave ativa.</p>
            <p className="text-xs text-tabaco/70 mt-1">
              Crie uma pra comecar a usar a API.
            </p>
          </div>
        )}
        {ativas.map((k) => (
          <div
            key={k.id}
            className="rounded-lg border border-line bg-card p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Key className="size-4 text-fur shrink-0" />
                <span className="font-medium text-cocoa truncate">{k.name}</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {k.key_prefix}...
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tabaco">
                <span>
                  <strong>{k.total_calls}</strong> chamadas
                </span>
                <span>
                  Ultimo uso:{" "}
                  {k.last_used_at
                    ? new Date(k.last_used_at).toLocaleString("pt-BR")
                    : "nunca"}
                </span>
                <span>
                  Criada: {new Date(k.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <div className="flex gap-1 mt-2">
                {k.scopes.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px] font-mono">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleRevoke(k.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
            >
              <Trash2 className="size-4 mr-1" />
              Revogar
            </Button>
          </div>
        ))}
      </div>

      {/* Lista de revogadas (collapsible) */}
      {revogadas.length > 0 && (
        <details className="rounded-lg border border-line bg-paper/50 group">
          <summary className="cursor-pointer p-4 text-sm font-medium text-tabaco flex items-center gap-2 list-none">
            <ShieldOff className="size-4" />
            {revogadas.length} chave{revogadas.length === 1 ? "" : "s"} revogada
            {revogadas.length === 1 ? "" : "s"}
            <Eye className="size-3.5 ml-auto group-open:rotate-180 transition-transform" />
          </summary>
          <div className="px-4 pb-4 space-y-1">
            {revogadas.map((k) => (
              <div
                key={k.id}
                className="text-xs text-tabaco/70 flex items-center gap-2 py-1"
              >
                <Key className="size-3" />
                <span className="line-through">{k.name}</span>
                <span className="font-mono">{k.key_prefix}...</span>
                <span className="ml-auto">
                  revogada em {new Date(k.revoked_at!).toLocaleDateString("pt-BR")}
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function traduzErro(code: string): string {
  switch (code) {
    case "admin_required":
      return "Apenas administradores da empresa podem criar chaves.";
    case "name_too_short":
      return "Nome muito curto (minimo 3 caracteres).";
    case "api_terms_required":
      return "Aceite obrigatório dos Termos da API.";
    case "no_company":
      return "Empresa nao configurada.";
    default:
      return code;
  }
}
