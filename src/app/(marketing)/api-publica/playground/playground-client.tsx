"use client";

import { useState } from "react";
import { Loader2, Send, Copy, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TODOS_PLANOS } from "@/lib/consultas/planos";

const PLANOS_POR_CAT = {
  cpf: TODOS_PLANOS.filter((p) => p.categoria === "cpf"),
  cnpj: TODOS_PLANOS.filter((p) => p.categoria === "cnpj"),
  veicular: TODOS_PLANOS.filter((p) => p.categoria === "veicular"),
};

const PLACEHOLDERS = {
  cpf: "12345678900",
  cnpj: "12345678000190",
  veicular: "ABC1D23",
};

export function PlaygroundClient() {
  const [apiKey, setApiKey] = useState("");
  const [categoria, setCategoria] = useState<"cpf" | "cnpj" | "veicular">("cpf");
  const [planoId, setPlanoId] = useState("cpf-investigacao");
  const [target, setTarget] = useState("");
  const [externalRef, setExternalRef] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [finality, setFinality] = useState("due_diligence");

  const [response, setResponse] = useState<{
    status: number;
    headers: Record<string, string>;
    body: unknown;
    durationMs: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const planos = PLANOS_POR_CAT[categoria];

  function buildPayload() {
    const p: Record<string, unknown> = {
      plan_id: planoId,
      target,
      finality,
    };
    if (externalRef) p.external_reference = externalRef;
    if (costCenter) p.cost_center = costCenter;
    return p;
  }

  function buildCurl() {
    const payload = JSON.stringify(buildPayload(), null, 2);
    const key = apiKey || "<sua-chave>";
    return `curl -X POST https://capivara.app/api/v1/consultations \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${payload.replace(/'/g, "'\\''")}'`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResponse(null);
    if (!apiKey) {
      setError("Cole sua chave Bearer primeiro.");
      return;
    }
    if (!target) {
      setError("Preencha o target (CPF/CNPJ/placa).");
      return;
    }

    setLoading(true);
    const start = Date.now();
    try {
      const res = await fetch("/api/v1/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(buildPayload()),
      });
      const duration = Date.now() - start;
      const body = await res.json().catch(() => ({}));
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        headers[k] = v;
      });
      setResponse({
        status: res.status,
        headers,
        body,
        durationMs: duration,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  function copyCurl() {
    navigator.clipboard.writeText(buildCurl()).then(() => {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    });
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-line bg-card p-5">
        <div>
          <Label htmlFor="apiKey">
            Chave Bearer{" "}
            <span className="text-[10px] font-mono text-tabaco">
              (cap_live_…)
            </span>
          </Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="cap_live_xxxxxxxxxxxxx"
            className="font-mono"
            autoComplete="off"
            required
          />
          <p className="text-[10px] text-tabaco mt-1">
            Gere uma em <a href="/empresa/api" target="_blank" className="text-fur hover:underline">/empresa/api</a>. Fica só no seu navegador.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Categoria</Label>
            <select
              value={categoria}
              onChange={(e) => {
                const c = e.target.value as typeof categoria;
                setCategoria(c);
                setPlanoId(PLANOS_POR_CAT[c][0].id);
                setTarget("");
              }}
              className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-cocoa mt-1"
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="veicular">Veicular</option>
            </select>
          </div>

          <div>
            <Label>Plano</Label>
            <select
              value={planoId}
              onChange={(e) => setPlanoId(e.target.value)}
              className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-cocoa mt-1"
            >
              {planos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} ({p.custoFolhasB2B} cr)
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label htmlFor="target">
            Target ({categoria === "veicular" ? "placa" : categoria.toUpperCase()})
          </Label>
          <Input
            id="target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={PLACEHOLDERS[categoria]}
            className="font-mono"
            required
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="externalRef">
              external_reference{" "}
              <span className="text-[10px] text-tabaco">(opcional)</span>
            </Label>
            <Input
              id="externalRef"
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              placeholder="ticket-123"
              className="font-mono"
            />
          </div>
          <div>
            <Label htmlFor="costCenter">
              cost_center{" "}
              <span className="text-[10px] text-tabaco">(opcional)</span>
            </Label>
            <Input
              id="costCenter"
              value={costCenter}
              onChange={(e) => setCostCenter(e.target.value)}
              placeholder="comercial-sp"
              className="font-mono"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="finality">finality</Label>
          <select
            id="finality"
            value={finality}
            onChange={(e) => setFinality(e.target.value)}
            className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-cocoa mt-1"
          >
            <option value="due_diligence">due_diligence</option>
            <option value="credit_analysis">credit_analysis</option>
            <option value="tenant_screening">tenant_screening</option>
            <option value="employment">employment</option>
            <option value="fraud_prevention">fraud_prevention</option>
            <option value="compliance">compliance</option>
          </select>
        </div>

        {error && (
          <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button type="submit" variant="accent" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-1 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Send className="size-4 mr-1" />
                Enviar POST
              </>
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={copyCurl}>
            {copiedCurl ? (
              <>
                <CheckCircle2 className="size-4 mr-1 text-ok" />
                cURL copiado
              </>
            ) : (
              <>
                <Copy className="size-4 mr-1" />
                Copiar como cURL
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Preview do curl */}
      <details className="rounded-xl border border-line bg-cocoa text-cream overflow-hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm font-mono">
          Ver como cURL
        </summary>
        <pre className="px-4 pb-4 font-mono text-xs overflow-x-auto whitespace-pre-wrap">
          {buildCurl()}
        </pre>
      </details>

      {/* Resposta */}
      {response && (
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-display text-lg font-bold text-cocoa">Resposta</h2>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  response.status >= 200 && response.status < 300
                    ? "ok"
                    : response.status === 429
                    ? "warn"
                    : "err"
                }
                className="font-mono"
              >
                HTTP {response.status}
              </Badge>
              <span className="text-[11px] font-mono text-tabaco">
                {response.durationMs}ms
              </span>
            </div>
          </div>

          {/* Headers relevantes */}
          {Object.keys(response.headers).some((h) =>
            h.toLowerCase().startsWith("x-ratelimit")
          ) && (
            <div className="rounded-lg border border-line bg-card p-3 text-xs font-mono">
              <p className="text-tabaco uppercase tracking-wider text-[10px] mb-1">
                Rate limit
              </p>
              <p className="text-cocoa">
                {response.headers["x-ratelimit-limit"] && (
                  <span>limite={response.headers["x-ratelimit-limit"]} </span>
                )}
                {response.headers["x-ratelimit-remaining"] && (
                  <span>restantes={response.headers["x-ratelimit-remaining"]} </span>
                )}
                {response.headers["retry-after"] && (
                  <span>retry-after={response.headers["retry-after"]}s</span>
                )}
              </p>
            </div>
          )}

          {/* Body */}
          <div className="rounded-lg border border-line bg-cocoa text-cream overflow-hidden">
            <div className="px-4 py-2 bg-cocoa border-b border-cream/10 flex items-center justify-between">
              <span className="font-mono text-xs text-cream/70">JSON</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(response.body, null, 2)
                  );
                }}
                className="text-xs text-cream/70 hover:text-saffron transition-colors flex items-center gap-1"
              >
                <Copy className="size-3" />
                Copiar
              </button>
            </div>
            <pre className="px-4 py-3 font-mono text-xs overflow-x-auto">
              {JSON.stringify(response.body, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
