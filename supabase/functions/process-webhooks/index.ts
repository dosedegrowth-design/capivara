// =========================================================================
// Capivara · Edge Function process-webhooks
//
// Worker que processa a fila `capivara.webhook_deliveries` (status='pending',
// next_attempt_at <= now()). Pega ate 20 por execucao, tenta entregar cada um,
// e atualiza status/retry.
//
// Disparado por pg_cron a cada 1 minuto.
//
// Assinatura HMAC-SHA256 do payload no header `x-capivara-signature`:
//   t=<unix_ts>,v1=<hex>
// =========================================================================

// @ts-expect-error - deno runtime
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BATCH = 20;
const TIMEOUT_MS = 15_000;

// Backoff exponencial em segundos
const RETRY_DELAYS_SEC = [60, 300, 1800, 7200, 21600, 86400];

interface DeliveryRow {
  id: string;
  endpoint_id: string;
  company_id: string;
  event_type: string;
  event_id: string;
  payload: unknown;
  attempts: number;
  max_attempts: number;
}

interface EndpointRow {
  id: string;
  url: string;
  secret: string;
  active: boolean;
  total_deliveries: number;
  total_failures: number;
}

function nextDelay(attempt: number): number {
  return RETRY_DELAYS_SEC[Math.min(attempt, RETRY_DELAYS_SEC.length - 1)];
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function attemptDelivery(
  admin: ReturnType<typeof createClient>,
  row: DeliveryRow
): Promise<void> {
  const { data: endpoint } = await admin
    .from("webhook_endpoints")
    .select("id, url, secret, active, total_deliveries, total_failures")
    .eq("id", row.endpoint_id)
    .maybeSingle<EndpointRow>();

  if (!endpoint || !endpoint.active) {
    await admin
      .from("webhook_deliveries")
      .update({
        status: "exhausted",
        last_error: "endpoint_inactive_or_missing",
      })
      .eq("id", row.id);
    return;
  }

  const rawBody = JSON.stringify(row.payload);
  const ts = Math.floor(Date.now() / 1000);
  const signature = `t=${ts},v1=${await hmacHex(endpoint.secret, `${ts}.${rawBody}`)}`;
  const newAttempts = row.attempts + 1;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-capivara-signature": signature,
        "x-capivara-event": row.event_type,
        "x-capivara-event-id": row.event_id,
        "User-Agent": "Capivara-Webhooks/1.0",
      },
      body: rawBody,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const responseText = (await res.text().catch(() => "")).slice(0, 4000);

    if (res.ok) {
      await admin
        .from("webhook_deliveries")
        .update({
          status: "delivered",
          attempts: newAttempts,
          last_status_code: res.status,
          last_response: responseText,
          delivered_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      await admin
        .from("webhook_endpoints")
        .update({
          total_deliveries: (endpoint.total_deliveries ?? 0) + 1,
          last_delivery_at: new Date().toISOString(),
          last_status_code: res.status,
        })
        .eq("id", row.endpoint_id);
      return;
    }

    // Falha
    const exhausted = newAttempts >= row.max_attempts;
    const delay = nextDelay(newAttempts);
    const nextAt = new Date(Date.now() + delay * 1000).toISOString();

    await admin
      .from("webhook_deliveries")
      .update({
        status: exhausted ? "exhausted" : "pending",
        attempts: newAttempts,
        last_status_code: res.status,
        last_response: responseText,
        last_error: `http_${res.status}`,
        next_attempt_at: nextAt,
      })
      .eq("id", row.id);

    await admin
      .from("webhook_endpoints")
      .update({
        total_failures: (endpoint.total_failures ?? 0) + 1,
        last_status_code: res.status,
      })
      .eq("id", row.endpoint_id);
  } catch (err) {
    const exhausted = newAttempts >= row.max_attempts;
    const delay = nextDelay(newAttempts);
    const nextAt = new Date(Date.now() + delay * 1000).toISOString();
    const msg = err instanceof Error ? err.message : String(err);

    await admin
      .from("webhook_deliveries")
      .update({
        status: exhausted ? "exhausted" : "pending",
        attempts: newAttempts,
        last_error: msg.slice(0, 1000),
        next_attempt_at: nextAt,
      })
      .eq("id", row.id);
  }
}

Deno.serve(async (_req: Request) => {
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  // Pega lote pendente cuja janela ja venceu
  const { data: pending, error } = await admin
    .from("webhook_deliveries")
    .select("id, endpoint_id, company_id, event_type, event_id, payload, attempts, max_attempts")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(BATCH);

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }

  if (!pending || pending.length === 0) {
    return Response.json({ ok: true, processed: 0 });
  }

  let processed = 0;
  for (const row of pending as DeliveryRow[]) {
    await attemptDelivery(admin, row);
    processed++;
  }

  return Response.json({ ok: true, processed });
});
