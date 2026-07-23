"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { performRefund } from "@/lib/refund";

/**
 * Server actions do painel admin de consultas.
 *
 * Guards: todas exigem session + account_type='admin'.
 * Todas gravam em audit_logs.
 */

type ActionResult<T = Record<string, unknown>> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

async function assertAdmin(): Promise<
  { profile: NonNullable<Awaited<ReturnType<typeof getCurrentProfile>>> } | { error: string }
> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "not_authenticated" };
  if (profile.account_type !== "admin") return { error: "not_admin" };
  return { profile };
}

async function getRequestMeta(): Promise<{ ip: string | null; ua: string | null }> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;
  const ua = h.get("user-agent") ?? null;
  return { ip, ua };
}

// ============================================================================
// Refund manual (admin)
// ============================================================================

export async function refundConsultationAction(input: {
  consultationId: string;
  reason: string;
  partialAmountCents?: number;
}): Promise<ActionResult<{ refundMethod: string; amountCentsRefunded: number }>> {
  const guard = await assertAdmin();
  if ("error" in guard) return { ok: false, error: guard.error };

  const { ip, ua } = await getRequestMeta();

  if (!input.consultationId) return { ok: false, error: "consultation_id_required" };
  if (!input.reason || input.reason.trim().length < 5) {
    return { ok: false, error: "reason_min_5_chars" };
  }

  const result = await performRefund({
    consultationId: input.consultationId,
    reason: `admin: ${input.reason.trim()}`,
    partialAmountCents: input.partialAmountCents,
    actorId: guard.profile.id,
    actorEmail: guard.profile.email,
    ipAddress: ip ?? undefined,
    userAgent: ua ?? undefined,
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/admin/consultas");
  revalidatePath("/admin/financeiro");
  return {
    ok: true,
    data: {
      refundMethod: result.refundMethod,
      amountCentsRefunded: result.amountCentsRefunded,
    },
  };
}

// ============================================================================
// Revelar PII (target_value cru). Grava audit_log.
// ============================================================================

export async function revealTargetAction(input: {
  consultationId: string;
}): Promise<ActionResult<{ targetValue: string }>> {
  const guard = await assertAdmin();
  if ("error" in guard) return { ok: false, error: guard.error };

  const { ip, ua } = await getRequestMeta();
  const admin = createAdminClient();

  const { data: c, error } = await admin
    .from("consultations")
    .select("id, target_value, user_id, category")
    .eq("id", input.consultationId)
    .maybeSingle();

  if (error || !c) return { ok: false, error: "not_found" };

  // Grava audit_log ANTES de retornar o dado sensivel
  await admin.from("audit_logs").insert({
    actor_id: guard.profile.id,
    actor_email: guard.profile.email,
    action: "reveal_target_pii",
    resource_type: "consultation",
    resource_id: c.id,
    changes: { category: c.category, target_masked: true },
    ip_address: ip ?? null,
    user_agent: ua ?? null,
  });

  return { ok: true, data: { targetValue: c.target_value } };
}
