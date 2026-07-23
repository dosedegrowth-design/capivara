"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";

/**
 * Server actions: gestao de membros da empresa.
 *
 * Roles:
 *  - admin: tudo (incluindo gerenciar equipe + recarga + API keys)
 *  - operator: pode criar consulta, ver historico
 *  - viewer: so ve historico
 *
 * Convite: cria company_members com accepted_at=NULL. Quando o user
 * convidado acessar /onboarding/aceitar-convite, marca accepted_at=now()
 * e atualiza profiles.active_company_id.
 */

export type EquipeActionResult =
  | { ok: true }
  | { ok: false; error: string };

async function assertAdmin(): Promise<
  | { ok: true; userId: string; companyId: string }
  | { ok: false; error: string; redirectTo?: string }
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
// Convidar membro
// ============================================================================
export async function convidarMembroAction(formData: FormData): Promise<EquipeActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "operator") as
    | "admin"
    | "operator"
    | "viewer";
  const costCenter = String(formData.get("costCenter") ?? "").trim() || null;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "email_invalido" };
  }

  if (!["admin", "operator", "viewer"].includes(role)) {
    return { ok: false, error: "role_invalida" };
  }

  const admin = createAdminClient();

  // Verifica se user com esse email ja existe
  const { data: existingProfile } = await admin
    .from("profiles")
    .select("id, email, full_name")
    .eq("email", email)
    .maybeSingle();

  const { data: empresa } = await admin
    .from("companies")
    .select("name")
    .eq("id", guard.companyId)
    .maybeSingle();

  if (existingProfile) {
    // User ja tem conta — cria membership direto
    const { data: existingMember } = await admin
      .from("company_members")
      .select("id, accepted_at")
      .eq("company_id", guard.companyId)
      .eq("user_id", existingProfile.id)
      .maybeSingle();

    if (existingMember) {
      return { ok: false, error: "ja_e_membro" };
    }

    const { error: insertErr } = await admin.from("company_members").insert({
      company_id: guard.companyId,
      user_id: existingProfile.id,
      role,
      cost_center: costCenter,
      invited_at: new Date().toISOString(),
      accepted_at: null,
    });

    if (insertErr) {
      return { ok: false, error: insertErr.message };
    }

    // Email avisando
    await sendEmail({
      to: email,
      subject: `${empresa?.name ?? "Sua empresa"} te convidou para a Capivara`,
      html: emailConviteHtml({
        nome: existingProfile.full_name ?? "voce",
        empresaNome: empresa?.name ?? "Empresa",
        role,
        hasAccount: true,
      }),
      tags: [{ name: "type", value: "team_invite" }],
    });

    revalidatePath("/empresa/equipe");
    return { ok: true };
  }

  // User nao existe ainda — cria company_invites com token opaco.
  // Aceite via /aceitar-convite/[token] apos cadastro (rota criada nessa migration).
  const token = randomBytes(32).toString("hex");

  // Verifica se ja existe convite pendente pra esse email nessa company
  const { data: existingInvite } = await admin
    .from("company_invites")
    .select("id")
    .eq("company_id", guard.companyId)
    .eq("email", email)
    .is("accepted_at", null)
    .maybeSingle();

  if (existingInvite) {
    // Renova o convite existente (atualiza expiracao)
    await admin
      .from("company_invites")
      .update({
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        role,
        cost_center: costCenter,
      })
      .eq("id", existingInvite.id);
  } else {
    const { error: inviteErr } = await admin
      .from("company_invites")
      .insert({
        company_id: guard.companyId,
        email,
        role,
        cost_center: costCenter,
        token,
        invited_by: guard.userId,
      });

    if (inviteErr) {
      return { ok: false, error: inviteErr.message };
    }
  }

  await sendEmail({
    to: email,
    subject: `${empresa?.name ?? "Sua empresa"} te convidou para a Capivara`,
    html: emailConviteHtml({
      nome: "voce",
      empresaNome: empresa?.name ?? "Empresa",
      role,
      hasAccount: false,
      inviteToken: token,
    }),
    tags: [{ name: "type", value: "team_invite_new_user" }],
  });

  revalidatePath("/empresa/equipe");
  return { ok: true };
}

// ============================================================================
// Aceitar convite (chamado pela pagina /aceitar-convite/[token] apos user
// criar conta OU fazer login com email exato do convite).
// ============================================================================
export async function aceitarConviteAction(token: string): Promise<EquipeActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "auth_required" };
  }

  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("company_invites")
    .select("id, company_id, email, role, cost_center, expires_at, accepted_at")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return { ok: false, error: "invite_not_found" };
  if (invite.accepted_at) return { ok: false, error: "invite_already_accepted" };
  if (new Date(invite.expires_at) < new Date()) {
    return { ok: false, error: "invite_expired" };
  }

  // Confirma que o email do user bate com o do convite (case-insensitive)
  const userEmail = (user.email ?? "").toLowerCase();
  if (userEmail !== invite.email.toLowerCase()) {
    return { ok: false, error: "email_mismatch" };
  }

  // Verifica se ja e' membro (idempotencia)
  const { data: existingMember } = await admin
    .from("company_members")
    .select("id")
    .eq("company_id", invite.company_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existingMember) {
    const { error: insertErr } = await admin.from("company_members").insert({
      company_id: invite.company_id,
      user_id: user.id,
      role: invite.role,
      cost_center: invite.cost_center,
      invited_at: new Date().toISOString(),
      accepted_at: new Date().toISOString(),
    });
    if (insertErr) return { ok: false, error: insertErr.message };
  }

  // Marca convite como aceito
  await admin
    .from("company_invites")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: user.id,
    })
    .eq("id", invite.id);

  // Ativa a company no profile do user (se ainda nao tem active_company_id)
  const { data: profile } = await admin
    .from("profiles")
    .select("active_company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile?.active_company_id) {
    await admin
      .from("profiles")
      .update({ active_company_id: invite.company_id })
      .eq("id", user.id);
  }

  revalidatePath("/empresa/equipe");
  return { ok: true };
}

// ============================================================================
// Atualizar role
// ============================================================================
export async function atualizarRoleAction(formData: FormData): Promise<EquipeActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const memberId = String(formData.get("memberId") ?? "");
  const role = String(formData.get("role") ?? "") as "admin" | "operator" | "viewer";

  if (!memberId) return { ok: false, error: "missing_id" };
  if (!["admin", "operator", "viewer"].includes(role)) {
    return { ok: false, error: "role_invalida" };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("company_members")
    .update({ role })
    .eq("id", memberId)
    .eq("company_id", guard.companyId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/empresa/equipe");
  return { ok: true };
}

// ============================================================================
// Remover membro
// ============================================================================
export async function removerMembroAction(formData: FormData): Promise<EquipeActionResult> {
  const guard = await assertAdmin();
  if (!guard.ok) {
    if (guard.redirectTo) redirect(guard.redirectTo);
    return { ok: false, error: guard.error };
  }

  const memberId = String(formData.get("memberId") ?? "");
  if (!memberId) return { ok: false, error: "missing_id" };

  const admin = createAdminClient();

  // Nao deixar admin remover a si mesmo se for o unico admin
  const { data: target } = await admin
    .from("company_members")
    .select("user_id, role")
    .eq("id", memberId)
    .eq("company_id", guard.companyId)
    .maybeSingle();

  if (target?.role === "admin" && target.user_id === guard.userId) {
    const { count } = await admin
      .from("company_members")
      .select("id", { count: "exact", head: true })
      .eq("company_id", guard.companyId)
      .eq("role", "admin");

    if ((count ?? 0) <= 1) {
      return {
        ok: false,
        error: "Voce e o unico admin. Promova outro antes de sair.",
      };
    }
  }

  const { error } = await admin
    .from("company_members")
    .delete()
    .eq("id", memberId)
    .eq("company_id", guard.companyId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/empresa/equipe");
  return { ok: true };
}

// ============================================================================
// Email helper
// ============================================================================
function emailConviteHtml(params: {
  nome: string;
  empresaNome: string;
  role: string;
  hasAccount: boolean;
  inviteToken?: string;
}): string {
  const C = {
    cocoa: "#1F1611",
    fur: "#C46A3F",
    saffron: "#E8A547",
    cream: "#F4EAD8",
    paper: "#FBF6EC",
  };
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";
  const ctaHref = params.hasAccount
    ? `${BASE}/empresa`
    : params.inviteToken
    ? `${BASE}/aceitar-convite/${params.inviteToken}`
    : `${BASE}/cadastro?tipo=empresa`;
  const ctaLabel = params.hasAccount ? "Acessar a empresa" : "Aceitar convite e criar conta";

  const roleLabel =
    params.role === "admin"
      ? "administrador (acesso total)"
      : params.role === "operator"
      ? "operador (pode criar consultas)"
      : "visualizador (somente leitura)";

  return `<!DOCTYPE html>
<html lang="pt-BR"><body style="margin:0;padding:0;background:${C.paper};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.cocoa};">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${C.paper};padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;background:#FFFCF5;border-radius:12px;overflow:hidden;">
        <tr><td style="background:${C.cocoa};padding:24px 32px;color:${C.cream};font-size:20px;font-weight:700;letter-spacing:-0.5px;">capivara</td></tr>
        <tr><td style="padding:32px;">
          <h1 style="font-size:22px;font-weight:700;color:${C.cocoa};margin:0 0 12px 0;">Voce foi convidada pra ${params.empresaNome}</h1>
          <p style="font-size:15px;line-height:1.6;color:${C.cocoa};">
            Oi, voce foi convidada pra entrar na empresa <strong>${params.empresaNome}</strong> na Capivara,
            como <strong>${roleLabel}</strong>.
          </p>
          <p style="font-size:14px;line-height:1.6;color:${C.cocoa};">
            ${params.hasAccount
              ? "Acesse o painel da empresa pra comecar."
              : "Voce ainda nao tem conta na Capivara. Crie a sua agora e seu acesso vai ser ativado automaticamente."}
          </p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;">
            <tr><td style="background:${C.saffron};border-radius:8px;">
              <a href="${ctaHref}" style="display:inline-block;padding:14px 28px;color:${C.cocoa};text-decoration:none;font-weight:600;font-size:14px;">${ctaLabel}</a>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
