import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { Profile, Company } from "@/types/database";

/**
 * Helpers de sessao para Server Components.
 * Use cache() do React pra deduplicar chamadas no mesmo request.
 */

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as Profile;
});

export const getActiveCompany = cache(async (): Promise<Company | null> => {
  const profile = await getCurrentProfile();
  if (!profile?.active_company_id) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("*")
    .eq("id", profile.active_company_id)
    .maybeSingle();

  return (data as Company) ?? null;
});

/** Lanca redirect se nao logado. Usar no topo de Server Components privados. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user;
}

/** Lanca redirect se nao for admin. */
export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.account_type !== "admin") {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard");
  }
  return profile;
}
