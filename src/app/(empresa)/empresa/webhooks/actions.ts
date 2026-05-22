"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateWebhookSecret, type WebhookEvent } from "@/lib/webhooks";

/**
 * Server actions para gestao de endpoints de webhook (B2B).
 */

export type WebhookActionResult =
  | { ok: true; data?: { id: string; url: string; secret: string } }
  | { ok: false; error: string };

const VALID_EVENTS: WebhookEvent[] = [
  "consultation.completed",
  "consultation.failed",
  "payment.confirmed",
];

async function assertAdmin(): Promise<
  | { ok: true; userId: string; companyId: string }
  | { ok: false; error: string; redirectTo?: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth_required", redirectTo: "/login" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("active_company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.active_company_id) {
    return { ok: false, error: "no_company", redirectTo: "/onboarding/empresa" };
  }

  const { data: member } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", profile.active_company_id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!member || member.role !== "admin") {
    return { ok: false, error: "admin_required" };
  }

  return { ok: true, userId: user.id, companyId: profile.active_company_id };
}

function isValidHttpsUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

// ============================================================================
// Criar webhook endpoint
// ============================================================================
export async function createWebhookAction(formData: FormData): Promise<WebhookActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const url = String(formData.get("url") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const eventsRaw = formData.getAll("events").map(String).filter(Boolean);

  if (!isValidHttpsUrl(url)) {
    return { ok: false, error: "invalid_url" };
  }

  const events =
    eventsRaw.length > 0
      ? eventsRaw.filter((e): e is WebhookEvent => VALID_EVENTS.includes(e as WebhookEvent))
      : (VALID_EVENTS as WebhookEvent[]);

  if (events.length === 0) {
    return { ok: false, error: "no_events" };
  }

  const secret = generateWebhookSecret();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("webhook_endpoints")
    .insert({
      company_id: guard.companyId,
      created_by: guard.userId,
      url,
      description,
      secret,
      events,
      active: true,
    })
    .select("id, url, secret")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "insert_failed" };
  }

  revalidatePath("/empresa/webhooks");
  return { ok: true, data: { id: data.id, url: data.url, secret: data.secret } };
}

// ============================================================================
// Toggle active
// ============================================================================
export async function toggleWebhookAction(formData: FormData): Promise<WebhookActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return { ok: false, error: "missing_id" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("webhook_endpoints")
    .update({ active })
    .eq("id", id)
    .eq("company_id", guard.companyId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/empresa/webhooks");
  return { ok: true };
}

// ============================================================================
// Deletar
// ============================================================================
export async function deleteWebhookAction(formData: FormData): Promise<WebhookActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "missing_id" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("webhook_endpoints")
    .delete()
    .eq("id", id)
    .eq("company_id", guard.companyId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/empresa/webhooks");
  return { ok: true };
}

// ============================================================================
// Reenviar delivery (retry manual)
// ============================================================================
export async function retryDeliveryAction(formData: FormData): Promise<WebhookActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const id = String(formData.get("deliveryId") ?? "");
  if (!id) return { ok: false, error: "missing_id" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("webhook_deliveries")
    .update({
      status: "pending",
      next_attempt_at: new Date().toISOString(),
      // Mantem attempts (history) mas zera last_error
      last_error: null,
    })
    .eq("id", id)
    .eq("company_id", guard.companyId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/empresa/webhooks");
  return { ok: true };
}
