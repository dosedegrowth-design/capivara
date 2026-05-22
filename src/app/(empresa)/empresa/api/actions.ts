"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateApiKey } from "@/lib/api-keys";

/**
 * Server actions para gestao de API keys (B2B).
 *
 * Regras:
 *   - Apenas usuarios com role='admin' na company podem criar/revogar
 *   - A chave em texto puro retorna apenas no `createApiKeyAction` e nunca
 *     volta a ser exibida (so o prefixo fica disponivel)
 */

export type ApiKeyActionResult =
  | { ok: true; key?: { id: string; name: string; fullKey: string; prefix: string } }
  | { ok: false; error: string };

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

// ============================================================================
// Criar nova API key
// ============================================================================
export async function createApiKeyAction(formData: FormData): Promise<ApiKeyActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 3) {
    return { ok: false, error: "name_too_short" };
  }

  const { fullKey, prefix, hash } = generateApiKey();
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("api_keys")
    .insert({
      company_id: guard.companyId,
      created_by: guard.userId,
      name,
      key_hash: hash,
      key_prefix: prefix,
      scopes: ["consultations:write", "consultations:read"],
      rate_limit_per_min: 60,
    })
    .select("id, name")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "insert_failed" };
  }

  revalidatePath("/empresa/api");

  return {
    ok: true,
    key: {
      id: data.id,
      name: data.name,
      fullKey,
      prefix,
    },
  };
}

// ============================================================================
// Revogar API key
// ============================================================================
export async function revokeApiKeyAction(formData: FormData): Promise<ApiKeyActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const keyId = String(formData.get("keyId") ?? "");
  if (!keyId) return { ok: false, error: "missing_id" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("api_keys")
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: guard.userId,
    })
    .eq("id", keyId)
    .eq("company_id", guard.companyId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/empresa/api");
  return { ok: true };
}
