"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { cadastroSchema, loginSchema } from "@/lib/validators";
import { normalizeCPF, normalizeCNPJ } from "@/lib/formatters";

/**
 * Server Actions de autenticacao.
 * Todas retornam { error: string | null } quando falham.
 * Em caso de sucesso, redirecionam.
 */

export type AuthResult = {
  error: string | null;
  fieldErrors?: Record<string, string>;
};

// =========================================================================
// Cadastro
// =========================================================================

export async function signUpAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    nomeCompleto: String(formData.get("nomeCompleto") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    cpf: normalizeCPF(String(formData.get("cpf") ?? "")),
    telefone: String(formData.get("telefone") ?? "").replace(/\D/g, ""),
    senha: String(formData.get("senha") ?? ""),
    lgpdAceito: formData.get("lgpdAceito") === "on" || formData.get("lgpdAceito") === "true",
    tipo: String(formData.get("tipo") ?? "pf"),
  };

  // Telefone opcional — se vazio, vira undefined pro schema
  const dataForSchema = {
    ...raw,
    telefone: raw.telefone || undefined,
  };

  const parsed = cadastroSchema.safeParse(dataForSchema);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[issue.path.join(".")] = issue.message;
    }
    return {
      error: "Verifique os dados informados.",
      fieldErrors,
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.senha,
    options: {
      data: {
        full_name: parsed.data.nomeCompleto,
        cpf: parsed.data.cpf,
        phone: parsed.data.telefone ?? null,
        account_type: raw.tipo === "empresa" ? "pj_admin" : "pf",
        lgpd_accepted: true,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/onboarding`,
    },
  });

  if (error) {
    return { error: traduzirErroAuth(error.message) };
  }

  // Redireciona pro onboarding (cliente PF) ou cadastro de empresa (PJ)
  redirect(raw.tipo === "empresa" ? "/onboarding/empresa" : "/onboarding");
}

// =========================================================================
// Login
// =========================================================================

export async function signInAction(formData: FormData): Promise<AuthResult> {
  const raw = {
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    senha: String(formData.get("senha") ?? ""),
  };
  const redirectTo = String(formData.get("redirect") ?? "/dashboard");

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Email ou senha invalidos.",
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.senha,
  });

  if (error) {
    return { error: traduzirErroAuth(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo);
}

// =========================================================================
// Logout
// =========================================================================

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

// =========================================================================
// Recuperar senha
// =========================================================================

export async function recoverPasswordAction(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email invalido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/recuperar-senha/redefinir`,
  });

  if (error) {
    return { error: traduzirErroAuth(error.message) };
  }

  return { error: null };
}

// =========================================================================
// Criar empresa (onboarding PJ)
// =========================================================================

export async function criarEmpresaAction(formData: FormData): Promise<AuthResult> {
  const razaoSocial = String(formData.get("razaoSocial") ?? "").trim();
  const nomeFantasia = String(formData.get("nomeFantasia") ?? "").trim();
  const cnpjRaw = normalizeCNPJ(String(formData.get("cnpj") ?? ""));
  const emailBilling = String(formData.get("emailBilling") ?? "").trim().toLowerCase();

  if (razaoSocial.length < 3) {
    return { error: "Razao social muito curta." };
  }

  if (!cnpjRaw || cnpjRaw.length !== 14) {
    return { error: "CNPJ invalido." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: empresa, error: createErr } = await supabase
    .from("companies")
    .insert({
      name: nomeFantasia || razaoSocial,
      cnpj: cnpjRaw,
      razao_social: razaoSocial,
      owner_id: user.id,
      email_billing: emailBilling || user.email,
      plan_tier: "start",
    })
    .select()
    .single();

  if (createErr || !empresa) {
    if (createErr?.code === "23505") {
      return { error: "Este CNPJ ja esta cadastrado." };
    }
    return { error: "Falha ao criar empresa. Tente novamente." };
  }

  await supabase.from("company_members").insert({
    company_id: empresa.id,
    user_id: user.id,
    role: "admin",
    accepted_at: new Date().toISOString(),
  });

  await supabase
    .from("profiles")
    .update({
      active_company_id: empresa.id,
      account_type: "pj_admin",
    })
    .eq("id", user.id);

  revalidatePath("/", "layout");
  redirect("/empresa");
}

// =========================================================================
// Redefinir senha (depois do click no email de recovery)
// =========================================================================

export async function resetPasswordAction(formData: FormData): Promise<AuthResult> {
  const senha = String(formData.get("senha") ?? "");
  const confirmacao = String(formData.get("confirmacao") ?? "");

  if (senha.length < 8) {
    return { error: "A senha precisa ter no minimo 8 caracteres." };
  }

  if (senha !== confirmacao) {
    return { error: "As senhas nao conferem." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: senha });

  if (error) {
    return { error: traduzirErroAuth(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// =========================================================================
// Helpers
// =========================================================================

function traduzirErroAuth(msg: string): string {
  if (msg.includes("Invalid login credentials")) return "Email ou senha incorretos.";
  if (msg.includes("Email not confirmed")) return "Confirme seu email antes de entrar.";
  if (msg.includes("User already registered")) return "Este email ja esta cadastrado.";
  if (msg.includes("Password should be")) return "Senha muito curta (minimo 8 caracteres).";
  if (msg.includes("rate limit")) return "Muitas tentativas. Aguarde 1 minuto.";
  return msg || "Erro inesperado. Tente novamente.";
}
