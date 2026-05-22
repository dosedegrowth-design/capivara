"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  Copy,
  Plus,
  RefreshCw,
  Trash2,
  Webhook as WebhookIcon,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createWebhookAction,
  toggleWebhookAction,
  deleteWebhookAction,
  retryDeliveryAction,
} from "./actions";

export interface EndpointRow {
  id: string;
  url: string;
  description: string | null;
  events: string[];
  active: boolean;
  total_deliveries: number;
  total_failures: number;
  last_delivery_at: string | null;
  last_status_code: number | null;
  created_at: string;
}

export interface DeliveryRow {
  id: string;
  endpoint_id: string;
  event_type: string;
  event_id: string;
  status: string;
  attempts: number;
  last_status_code: number | null;
  last_error: string | null;
  delivered_at: string | null;
  created_at: string;
}

interface Props {
  endpoints: EndpointRow[];
  deliveries: DeliveryRow[];
}

const ALL_EVENTS = [
  { id: "consultation.completed", label: "Consulta concluida (PDF pronto)" },
  { id: "consultation.failed", label: "Consulta falhou" },
  { id: "payment.confirmed", label: "Pagamento confirmado" },
];

export function WebhooksClient({ endpoints, deliveries }: Props) {
  const [creating, setCreating] = useState(false);
  const [revealed, setRevealed] = useState<{ url: string; secret: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    url: "",
    description: "",
    events: new Set<string>(ALL_EVENTS.map((e) => e.id)),
  });

  function toggleEvent(eventId: string) {
    setForm((f) => {
      const events = new Set(f.events);
      if (events.has(eventId)) events.delete(eventId);
      else events.add(eventId);
      return { ...f, events };
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.url || !form.url.startsWith("http")) {
      setError("URL invalida (precisa comecar com https://).");
      return;
    }
    if (form.events.size === 0) {
      setError("Selecione pelo menos um evento.");
      return;
    }
    startTransition(async () => {
      const fd = new FormData();
      fd.set("url", form.url);
      fd.set("description", form.description);
      form.events.forEach((ev) => fd.append("events", ev));
      const res = await createWebhookAction(fd);
      if (!res.ok) {
        setError(traduzErro(res.error));
        return;
      }
      if (res.data) {
        setRevealed({ url: res.data.url, secret: res.data.secret });
        setForm({
          url: "",
          description: "",
          events: new Set<string>(ALL_EVENTS.map((e) => e.id)),
        });
        setCreating(false);
      }
    });
  }

  function handleToggle(id: string, current: boolean) {
    const fd = new FormData();
    fd.set("id", id);
    fd.set("active", String(!current));
    startTransition(async () => {
      await toggleWebhookAction(fd);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remover esse endpoint? Os deliveries pendentes vao ser cancelados.")) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(async () => {
      await deleteWebhookAction(fd);
    });
  }

  function handleRetry(deliveryId: string) {
    const fd = new FormData();
    fd.set("deliveryId", deliveryId);
    startTransition(async () => {
      await retryDeliveryAction(fd);
    });
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  return (
    <div className="space-y-8">
      {/* Banner segredo revelado */}
      {revealed && (
        <div className="rounded-lg border-2 border-saffron bg-saffron/10 p-5">
          <p className="font-semibold text-cocoa flex items-center gap-2">
            <CheckCircle2 className="size-5 text-ok" />
            Webhook criado
          </p>
          <p className="text-xs text-tabaco mt-1">
            Salva o secret agora pra validar assinatura HMAC do seu lado. Nao vamos mostrar de
            novo.
          </p>
          <div className="mt-3 space-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-tabaco font-mono mb-1">
                URL
              </p>
              <code className="block bg-cocoa text-cream p-2 rounded font-mono text-xs break-all">
                {revealed.url}
              </code>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-tabaco font-mono mb-1">
                Signing Secret
              </p>
              <div className="flex gap-2">
                <code className="flex-1 bg-cocoa text-cream p-2 rounded font-mono text-xs break-all">
                  {revealed.secret}
                </code>
                <Button size="sm" variant="secondary" onClick={() => copy(revealed.secret)}>
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
          <Button size="sm" variant="ghost" className="mt-3" onClick={() => setRevealed(null)}>
            Ja salvei
          </Button>
        </div>
      )}

      {/* Endpoints */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-cocoa">Endpoints</h2>
            <p className="text-xs text-tabaco">
              URLs que recebem POST quando algo acontece na sua conta.
            </p>
          </div>
          {!creating && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4 mr-1" />
              Novo endpoint
            </Button>
          )}
        </div>

        {creating && (
          <form
            onSubmit={handleCreate}
            className="rounded-lg border border-line bg-card p-5 space-y-4 mb-4"
          >
            <div>
              <Label htmlFor="url">URL do endpoint</Label>
              <Input
                id="url"
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://meusistema.com/webhooks/capivara"
                required
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="desc">Descricao (opcional)</Label>
              <Input
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Producao"
              />
            </div>
            <div>
              <Label>Eventos</Label>
              <div className="space-y-2 mt-2">
                {ALL_EVENTS.map((ev) => (
                  <label
                    key={ev.id}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={form.events.has(ev.id)}
                      onCheckedChange={() => toggleEvent(ev.id)}
                    />
                    <span>
                      <code className="font-mono text-fur text-xs">{ev.id}</code>{" "}
                      <span className="text-tabaco">{ev.label}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Criando..." : "Criar endpoint"}
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

        <div className="space-y-2">
          {endpoints.length === 0 && (
            <div className="rounded-lg border border-dashed border-line bg-card p-8 text-center">
              <WebhookIcon className="size-8 text-tabaco/40 mx-auto mb-2" />
              <p className="text-sm text-tabaco">Nenhum endpoint cadastrado.</p>
            </div>
          )}
          {endpoints.map((ep) => (
            <div key={ep.id} className="rounded-lg border border-line bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <WebhookIcon className="size-4 text-fur shrink-0" />
                    <code className="font-mono text-sm text-cocoa truncate">{ep.url}</code>
                    {ep.active ? (
                      <Badge variant="default" className="bg-ok text-cream">
                        ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">pausado</Badge>
                    )}
                  </div>
                  {ep.description && (
                    <p className="text-xs text-tabaco mb-2">{ep.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ep.events.map((e) => (
                      <Badge key={e} variant="outline" className="text-[10px] font-mono">
                        {e}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-tabaco">
                    <span>
                      <strong className="text-cocoa">{ep.total_deliveries}</strong> entregues
                    </span>
                    <span>
                      <strong className="text-red-600">{ep.total_failures}</strong> falhas
                    </span>
                    {ep.last_status_code && (
                      <span>
                        Ultimo HTTP:{" "}
                        <code
                          className={
                            ep.last_status_code >= 200 && ep.last_status_code < 300
                              ? "text-ok"
                              : "text-red-600"
                          }
                        >
                          {ep.last_status_code}
                        </code>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggle(ep.id, ep.active)}
                  >
                    {ep.active ? "Pausar" : "Ativar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(ep.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deliveries recentes */}
      <div>
        <h2 className="font-display text-lg font-semibold text-cocoa mb-3">
          Ultimas tentativas
        </h2>
        {deliveries.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-card p-6 text-center text-sm text-tabaco">
            Sem deliveries por enquanto.
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-paper/60 text-tabaco text-xs">
                <tr>
                  <th className="text-left p-3 font-mono uppercase tracking-wider">Evento</th>
                  <th className="text-left p-3 font-mono uppercase tracking-wider">Status</th>
                  <th className="text-left p-3 font-mono uppercase tracking-wider">HTTP</th>
                  <th className="text-left p-3 font-mono uppercase tracking-wider">Tent.</th>
                  <th className="text-left p-3 font-mono uppercase tracking-wider">Quando</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map((d) => (
                  <tr key={d.id} className="border-t border-line/60">
                    <td className="p-3">
                      <code className="font-mono text-xs text-cocoa">{d.event_type}</code>
                    </td>
                    <td className="p-3">
                      <StatusBadge status={d.status} />
                      {d.last_error && (
                        <span
                          className="ml-1 text-[10px] text-red-600"
                          title={d.last_error}
                        >
                          ({d.last_error.slice(0, 40)})
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-xs">
                      {d.last_status_code ? (
                        <code
                          className={
                            d.last_status_code >= 200 && d.last_status_code < 300
                              ? "text-ok"
                              : "text-red-600"
                          }
                        >
                          {d.last_status_code}
                        </code>
                      ) : (
                        <span className="text-tabaco/50">—</span>
                      )}
                    </td>
                    <td className="p-3 text-xs">{d.attempts}</td>
                    <td className="p-3 text-xs text-tabaco">
                      {new Date(d.created_at).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3">
                      {(d.status === "failed" ||
                        d.status === "exhausted" ||
                        d.status === "pending") && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetry(d.id)}
                          title="Reenviar"
                        >
                          <RefreshCw className="size-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "delivered") {
    return (
      <Badge className="bg-ok text-cream">
        <CheckCircle2 className="size-3 mr-1" />
        entregue
      </Badge>
    );
  }
  if (status === "pending") {
    return <Badge variant="secondary">pendente</Badge>;
  }
  if (status === "exhausted") {
    return (
      <Badge variant="err">
        <XCircle className="size-3 mr-1" />
        esgotada
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

function traduzErro(code: string): string {
  switch (code) {
    case "admin_required":
      return "Apenas administradores podem configurar webhooks.";
    case "invalid_url":
      return "URL invalida.";
    case "no_events":
      return "Selecione pelo menos um evento.";
    default:
      return code;
  }
}
