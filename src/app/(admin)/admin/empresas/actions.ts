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
// Adicionar/subtrair saldo (R$) manualmente
// =============================================================================
export async function ajustarSaldoAction(formData: FormData): Promise<AdminEmpresaActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    redirect("/dashboard");
  }

  const companyId = String(formData.get("companyId") ?? "");
  // valor em reais (string "10.50" ou "-5.00") -> converte pra centavos
  const valorReais = Number(formData.get("valorReais") ?? 0);
  const amountCents = Math.round(valorReais * 100);
  const motivo = String(formData.get("motivo") ?? "").trim();

  if (!companyId) return { ok: false, error: "companyId obrigatorio" };
  if (!Number.isInteger(amountCents) || amountCents === 0) {
    return {
      ok: false,
      error: "Valor deve ser nao-zero (positivo pra adicionar R$, negativo pra subtrair)",
    };
  }
  if (motivo.length < 5) {
    return { ok: false, error: "Motivo obrigatorio (minimo 5 chars) pra auditoria" };
  }

  const admin = createAdminClient();

  if (amountCents > 0) {
    // Adicionar: RPC atomico
    const { error: rpcErr } = await admin.rpc("add_balance_cents", {
      p_company_id: companyId,
      p_amount_cents: amountCents,
    });
    if (rpcErr) return { ok: false, error: rpcErr.message };
  } else {
    // Subtrair: usar debit_balance_cents que valida saldo
    const { data: debitOk, error: rpcErr } = await admin.rpc("debit_balance_cents", {
      p_company_id: companyId,
      p_amount_cents: Math.abs(amountCents),
    });
    if (rpcErr) return { ok: false, error: rpcErr.message };
    if (!debitOk) {
      return { ok: false, error: "Saldo ficaria negativo. Operacao bloqueada." };
    }
  }

  // Audita em transactions
  await admin.from("transactions").insert({
    user_id: guard.userId,
    company_id: companyId,
    type: amountCents > 0 ? "recharge" : "refund",
    payment_method: "pix",
    amount_cents: Math.abs(amountCents),
    status: "paid",
    paid_at: new Date().toISOString(),
    asaas_response: {
      _admin_adjustment: true,
      _motivo: motivo,
      _admin_user_id: guard.userId,
      _amount_cents_signed: amountCents,
    } as unknown as Record<string, unknown>,
  });

  await logError({
    context: "admin.adjust_balance",
    severity: "info",
    message: `Admin ajustou ${(amountCents / 100).toFixed(2)} reais da empresa ${companyId}`,
    metadata: { company_id: companyId, amount_cents: amountCents, motivo },
  });

  revalidatePath("/admin/empresas");
  const sinal = amountCents > 0 ? "+" : "";
  return {
    ok: true,
    message: `${sinal}R$ ${(amountCents / 100).toFixed(2)} aplicados.`,
  };
}

// Backward-compat alias (UI antiga ainda pode importar)
export const ajustarCreditosAction = ajustarSaldoAction;

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
