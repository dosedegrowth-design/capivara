/**
 * Webhooks B2B — assinatura HMAC + enfileiramento.
 *
 * Cada endpoint cadastrado tem um `secret`. O payload e assinado com
 * HMAC-SHA256, e a assinatura vai no header `x-capivara-signature` no formato
 *   t=<unix_ts>,v1=<hex_signature>
 *
 * O receptor precisa recomputar o HMAC sobre `${t}.${rawBody}` usando o mesmo
 * secret e comparar (timing-safe) com v1.
 *
 * Retry: 6 tentativas com backoff exponencial (1m, 5m, 30m, 2h, 6h, 24h)
 * tocadas por cron na Edge Function `process-webhooks`.
 */

import { createHmac, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export type WebhookEvent =
  | "consultation.completed"
  | "consultation.failed"
  | "consultation.refunded"
  | "payment.confirmed";

export interface WebhookPayload<T = unknown> {
  id: string; // event id (uuid)
  type: WebhookEvent;
  created_at: string; // ISO
  data: T;
}

const RETRY_DELAYS_SEC = [60, 300, 1800, 7200, 21600, 86400];

export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(24).toString("hex")}`;
}

export function signWebhook(secret: string, rawBody: string): string {
  const ts = Math.floor(Date.now() / 1000);
  const sig = createHmac("sha256", secret).update(`${ts}.${rawBody}`).digest("hex");
  return `t=${ts},v1=${sig}`;
}

export function nextAttemptDelay(attempt: number): number {
  // attempt e 0-indexed (apos tentativa N, proxima e RETRY_DELAYS_SEC[N])
  return RETRY_DELAYS_SEC[Math.min(attempt, RETRY_DELAYS_SEC.length - 1)];
}

/**
 * Enfileira um evento pra todos os endpoints ativos de uma empresa que
 * inscreveram esse event type.
 *
 * Roda com service role (RLS-free) porque pode ser chamado de webhooks
 * internos (Asaas), Edge Functions ou rotas de sistema.
 */
export async function dispatchEvent<T>(
  companyId: string,
  type: WebhookEvent,
  data: T
): Promise<{ enqueued: number }> {
  const admin = createAdminClient();

  const { data: endpoints, error } = await admin
    .from("webhook_endpoints")
    .select("id")
    .eq("company_id", companyId)
    .eq("active", true)
    .contains("events", [type]);

  if (error || !endpoints || endpoints.length === 0) {
    return { enqueued: 0 };
  }

  const eventId = crypto.randomUUID();
  const payload: WebhookPayload<T> = {
    id: eventId,
    type,
    created_at: new Date().toISOString(),
    data,
  };

  const rows = endpoints.map((ep) => ({
    endpoint_id: ep.id,
    company_id: companyId,
    event_type: type,
    event_id: eventId,
    payload,
    status: "pending" as const,
    attempts: 0,
    next_attempt_at: new Date().toISOString(),
  }));

  const { error: insertErr } = await admin.from("webhook_deliveries").insert(rows);
  if (insertErr) {
    console.error("[webhooks] falha ao enfileirar", insertErr);
    return { enqueued: 0 };
  }

  return { enqueued: rows.length };
}

/**
 * Entrega um delivery pendente (chamado pelo cron worker).
 * Retorna `delivered` (2xx), `failed` (4xx/5xx ainda com retry) ou
 * `exhausted` (estourou max_attempts).
 */
export interface DeliveryRow {
  id: string;
  endpoint_id: string;
  company_id: string;
  event_type: string;
  payload: unknown;
  attempts: number;
  max_attempts: number;
}

export async function attemptDelivery(row: DeliveryRow): Promise<void> {
  const admin = createAdminClient();

  const { data: endpoint } = await admin
    .from("webhook_endpoints")
    .select("url, secret, active")
    .eq("id", row.endpoint_id)
    .maybeSingle();

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
  const signature = signWebhook(endpoint.secret, rawBody);
  const newAttempts = row.attempts + 1;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000); // 15s timeout

    const res = await fetch(endpoint.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-capivara-signature": signature,
        "x-capivara-event": row.event_type,
        "x-capivara-event-id": (row.payload as { id?: string })?.id ?? "",
        "User-Agent": "Capivara-Webhooks/1.0",
      },
      body: rawBody,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const responseText = await res.text().catch(() => "");
    const responseTrim = responseText.slice(0, 4000); // limita storage

    if (res.ok) {
      await admin
        .from("webhook_deliveries")
        .update({
          status: "delivered",
          attempts: newAttempts,
          last_status_code: res.status,
          last_response: responseTrim,
          delivered_at: new Date().toISOString(),
        })
        .eq("id", row.id);

      await admin
        .from("webhook_endpoints")
        .update({
          total_deliveries: (await getTotalDeliveries(row.endpoint_id)) + 1,
          last_delivery_at: new Date().toISOString(),
          last_status_code: res.status,
        })
        .eq("id", row.endpoint_id);
      return;
    }

    // Falha (status nao-2xx)
    const exhausted = newAttempts >= row.max_attempts;
    const nextDelay = nextAttemptDelay(newAttempts);
    const nextAttemptAt = new Date(Date.now() + nextDelay * 1000).toISOString();

    await admin
      .from("webhook_deliveries")
      .update({
        status: exhausted ? "exhausted" : "pending",
        attempts: newAttempts,
        last_status_code: res.status,
        last_response: responseTrim,
        last_error: `http_${res.status}`,
        next_attempt_at: nextAttemptAt,
      })
      .eq("id", row.id);

    await admin
      .from("webhook_endpoints")
      .update({
        total_failures: (await getTotalFailures(row.endpoint_id)) + 1,
        last_status_code: res.status,
      })
      .eq("id", row.endpoint_id);
  } catch (err) {
    const exhausted = newAttempts >= row.max_attempts;
    const nextDelay = nextAttemptDelay(newAttempts);
    const nextAttemptAt = new Date(Date.now() + nextDelay * 1000).toISOString();
    const msg = err instanceof Error ? err.message : String(err);

    await admin
      .from("webhook_deliveries")
      .update({
        status: exhausted ? "exhausted" : "pending",
        attempts: newAttempts,
        last_error: msg.slice(0, 1000),
        next_attempt_at: nextAttemptAt,
      })
      .eq("id", row.id);
  }
}

async function getTotalDeliveries(endpointId: string): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("webhook_endpoints")
    .select("total_deliveries")
    .eq("id", endpointId)
    .maybeSingle();
  return data?.total_deliveries ?? 0;
}

async function getTotalFailures(endpointId: string): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("webhook_endpoints")
    .select("total_failures")
    .eq("id", endpointId)
    .maybeSingle();
  return data?.total_failures ?? 0;
}
