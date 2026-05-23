"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/log";

/**
 * Server actions: configuracoes do usuario (LGPD).
 *
 * Inclui:
 *  - Atualizar dados pessoais (nome, telefone)
 *  - Mudar email (envia confirmacao)
 *  - Mudar senha
 *  - Exportar dados (LGPD Art. 18 V — portabilidade)
 *  - Deletar conta (LGPD Art. 18 VI — direito ao esquecimento)
 */

export type SettingsResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

// ============================================================================
// Atualizar perfil
// ============================================================================
export async function atualizarPerfilAction(formData: FormData): Promise<SettingsResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").replace(/\D/g, "") || null;

  if (fullName.length < 3) {
    return { ok: false, error: "Nome muito curto." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/configuracoes");
  return { ok: true, message: "Perfil atualizado." };
}

// ============================================================================
// Mudar senha
// ============================================================================
export async function mudarSenhaAction(formData: FormData): Promise<SettingsResult> {
  const senhaAtual = String(formData.get("senhaAtual") ?? "");
  const novaSenha = String(formData.get("novaSenha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (novaSenha.length < 8) {
    return { ok: false, error: "Nova senha precisa ter no mínimo 8 caracteres." };
  }
  if (novaSenha !== confirmacao) {
    return { ok: false, error: "As senhas não conferem." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Re-autentica com senha atual antes de trocar
  const { error: signInErr } = await supabase.auth.signInWithPassword({
    email: user.email ?? "",
    password: senhaAtual,
  });

  if (signInErr) {
    return { ok: false, error: "Senha atual incorreta." };
  }

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) return { ok: false, error: error.message };

  return { ok: true, message: "Senha alterada com sucesso." };
}

// ============================================================================
// Mudar email
// ============================================================================
export async function mudarEmailAction(formData: FormData): Promise<SettingsResult> {
  const novoEmail = String(formData.get("novoEmail") ?? "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoEmail)) {
    return { ok: false, error: "Email inválido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (user.email === novoEmail) {
    return { ok: false, error: "Este já é o email atual." };
  }

  const { error } = await supabase.auth.updateUser({ email: novoEmail });
  if (error) return { ok: false, error: error.message };

  return {
    ok: true,
    message: `Email de confirmação enviado pra ${novoEmail}. Clique no link pra confirmar a mudança.`,
  };
}

// ============================================================================
// Exportar dados (LGPD portabilidade)
// ============================================================================
export async function exportarDadosAction(): Promise<
  | { ok: true; downloadUrl: string }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  try {
    const admin = createAdminClient();

    const [{ data: profile }, { data: consultations }, { data: transactions }] =
      await Promise.all([
        admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        admin
          .from("consultations")
          .select(
            "id, category, plan_tier, target_value, status, finality, payment_type, amount_cents, folhas_used, source, external_reference, created_at, completed_at"
          )
          .eq("user_id", user.id),
        admin
          .from("transactions")
          .select(
            "id, type, amount_cents, payment_method, status, created_at, paid_at"
          )
          .eq("user_id", user.id),
      ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile,
      consultations,
      transactions,
      _notes: {
        about: "Capivara · Exportação LGPD (Art. 18, V — portabilidade)",
        retention:
          "Os dados das consultas ficam por 90 dias antes de anonimização automática.",
        contact: "lgpd@suacapivara.com.br",
      },
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: "application/json" });

    // Upload pra storage com signed URL
    const path = `${user.id}/lgpd-export-${Date.now()}.json`;
    const { error: uploadErr } = await admin.storage
      .from("capivara-lgpd-exports")
      .upload(path, blob, {
        contentType: "application/json",
        upsert: false,
      });

    if (uploadErr) {
      // Bucket pode nao existir ainda; tenta criar
      await logError({
        context: "lgpd_export",
        severity: "warning",
        message: "Falha ao subir export pro storage",
        error: uploadErr,
        userId: user.id,
      });
      return { ok: false, error: "Falha ao gerar exportação. Tente novamente." };
    }

    const { data: signed } = await admin.storage
      .from("capivara-lgpd-exports")
      .createSignedUrl(path, 60 * 60 * 24); // 24h

    if (!signed) return { ok: false, error: "Falha ao gerar link." };

    return { ok: true, downloadUrl: signed.signedUrl };
  } catch (err) {
    await logError({
      context: "lgpd_export",
      severity: "error",
      message: "Exception ao exportar dados",
      error: err instanceof Error ? err : new Error(String(err)),
      userId: user.id,
    });
    return { ok: false, error: "Erro interno. Contate suporte." };
  }
}

// ============================================================================
// Deletar conta (LGPD direito ao esquecimento)
// ============================================================================
export async function deletarContaAction(formData: FormData): Promise<SettingsResult> {
  const confirmacao = String(formData.get("confirmacao") ?? "");
  if (confirmacao !== "DELETAR") {
    return { ok: false, error: 'Digite "DELETAR" pra confirmar.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = createAdminClient();

  // Verifica se eh admin de alguma empresa - nao pode deletar conta se for unico admin
  const { data: empresas } = await admin
    .from("company_members")
    .select("company_id, role")
    .eq("user_id", user.id);

  for (const empresa of empresas ?? []) {
    if (empresa.role === "admin") {
      const { count } = await admin
        .from("company_members")
        .select("id", { count: "exact", head: true })
        .eq("company_id", empresa.company_id)
        .eq("role", "admin");

      if ((count ?? 0) <= 1) {
        return {
          ok: false,
          error:
            "Voce e o unico admin de uma empresa. Promova outro admin ou delete a empresa antes.",
        };
      }
    }
  }

  try {
    // Anonimiza consultations (LGPD - mantem registros pra auditoria mas sem PII)
    await admin
      .from("consultations")
      .update({
        target_value: "[anonimizado]",
        target_normalized: "[anonimizado]",
        result_jsonb: { _anonymized: true, _reason: "user_deletion" },
        pdf_url: null,
        ip_address: null,
        user_agent: null,
      })
      .eq("user_id", user.id);

    // Remove memberships
    await admin.from("company_members").delete().eq("user_id", user.id);

    // Apaga profile
    await admin.from("profiles").delete().eq("id", user.id);

    // Apaga auth.user (cascata via RLS/triggers limpa o resto)
    const { error: deleteErr } = await admin.auth.admin.deleteUser(user.id);

    if (deleteErr) {
      return { ok: false, error: deleteErr.message };
    }

    // Logout
    await supabase.auth.signOut();
  } catch (err) {
    await logError({
      context: "deletar_conta",
      severity: "critical",
      message: "Falha ao deletar conta",
      error: err instanceof Error ? err : new Error(String(err)),
      userId: user.id,
    });
    return { ok: false, error: "Falha ao deletar. Contate suporte." };
  }

  redirect("/?conta=deletada");
}
