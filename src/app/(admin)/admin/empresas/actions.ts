"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/log";

/**
 * Server actions: gestao administrativa de empresas.
 *
 * Apenas admins (profiles.account_type='admin') podem executar.
 */

export type AdminEmpresaActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

async function assertAdmin(): Promise<{ ok: boolean; userId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .maybeSingle();

  return { ok: profile?.account_type === "admin", userId: user.id };
}

// =============================================================================
// Adicionar/subtrair créditos manualmente
// =============================================================================
export async function ajustarCreditosAction(formData: FormData): Promise<AdminEmpresaActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    redirect("/dashboard");
  }

  const companyId = String(formData.get("companyId") ?? "");
  const credits = Number(formData.get("credits") ?? 0);
  const motivo = String(formData.get("motivo") ?? "").trim();

  if (!companyId) return { ok: false, error: "companyId obrigatorio" };
  if (!Number.isInteger(credits) || credits === 0) {
    return { ok: false, error: "Quantidade deve ser inteiro nao-zero (positivo pra adicionar, negativo pra subtrair)" };
  }
  if (motivo.length < 5) {
    return { ok: false, error: "Motivo obrigatorio (minimo 5 chars) pra auditoria" };
  }

  const admin = createAdminClient();

  // Atomico via RPC se for adicionar, senao update direto
  if (credits > 0) {
    const { error: rpcErr } = await admin.rpc("add_credits", {
      p_company_id: companyId,
      p_credits: credits,
    });
    if (rpcErr) return { ok: false, error: rpcErr.message };
  } else {
    // Subtrair: garantir nao ficar negativo
    const { data: empresa } = await admin
      .from("companies")
      .select("folhas_balance")
      .eq("id", companyId)
      .maybeSingle();
    if (!empresa) return { ok: false, error: "Empresa nao encontrada" };

    const novoSaldo = (empresa.folhas_balance ?? 0) + credits; // credits negativo
    if (novoSaldo < 0) {
      return { ok: false, error: `Saldo ficaria negativo (${novoSaldo}). Operacao bloqueada.` };
    }

    const { error: updErr } = await admin
      .from("companies")
      .update({ folhas_balance: novoSaldo })
      .eq("id", companyId);
    if (updErr) return { ok: false, error: updErr.message };
  }

  // Audita em transactions com tipo recharge (positivo) ou refund (negativo)
  await admin.from("transactions").insert({
    user_id: guard.userId,
    company_id: companyId,
    type: credits > 0 ? "recharge" : "refund",
    payment_method: "pix", // sem pagamento real - apenas marcador admin
    amount_cents: 0, // ajuste manual nao tem custo
    folhas_added: credits > 0 ? credits : 0,
    status: "paid",
    paid_at: new Date().toISOString(),
    asaas_response: {
      _admin_adjustment: true,
      _motivo: motivo,
      _admin_user_id: guard.userId,
      _credits: credits,
    } as unknown as Record<string, unknown>,
  });

  await logError({
    context: "admin.adjust_credits",
    severity: "info",
    message: `Admin ajustou ${credits} creditos da empresa ${companyId}`,
    metadata: { company_id: companyId, credits, motivo },
  });

  revalidatePath("/admin/empresas");
  return { ok: true, message: `${credits > 0 ? "+" : ""}${credits} créditos aplicados.` };
}

// =============================================================================
// Suspender empresa (impede novas consultas e API calls)
// =============================================================================
export async function toggleEmpresaAtivaAction(formData: FormData): Promise<AdminEmpresaActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) redirect("/dashboard");

  const companyId = String(formData.get("companyId") ?? "");
  const suspender = formData.get("suspender") === "true";
  const motivo = String(formData.get("motivo") ?? "").trim();

  if (!companyId) return { ok: false, error: "companyId obrigatorio" };
  if (suspender && motivo.length < 5) {
    return { ok: false, error: "Motivo obrigatorio pra suspender" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("companies")
    .update({
      fiscal_settings: suspender
        ? { _suspended: true, _suspended_at: new Date().toISOString(), _suspended_reason: motivo, _suspended_by: guard.userId }
        : { _suspended: false },
    })
    .eq("id", companyId);

  if (error) return { ok: false, error: error.message };

  // Revoga todas as API keys ativas quando suspende
  if (suspender) {
    await admin
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString(), revoked_by: guard.userId })
      .eq("company_id", companyId)
      .is("revoked_at", null);
  }

  revalidatePath("/admin/empresas");
  return { ok: true, message: suspender ? "Empresa suspensa." : "Empresa reativada." };
}
