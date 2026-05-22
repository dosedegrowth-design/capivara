"use server";

import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findPlano } from "@/lib/consultas/planos";
import {
  normalizeCPF,
  normalizeCNPJ,
  normalizePlaca,
  isValidCPF,
  isValidCNPJ,
  isValidPlaca,
} from "@/lib/formatters";
import { logError } from "@/lib/log";

/**
 * Server action: cria consulta B2B pagando com creditos (folhas) da empresa.
 *
 * Diferente do iniciarConsultaAction (B2C): nao passa por Asaas,
 * debita direto do saldo da company. Idempotente via external_reference.
 */

export type NovaConsultaB2BResult =
  | { ok: true; consultationId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function novaConsultaB2BAction(
  formData: FormData
): Promise<NovaConsultaB2BResult> {
  const planoId = String(formData.get("planoId") ?? "");
  const targetRaw = String(formData.get("target") ?? "").trim();
  const finalidade = String(formData.get("finalidade") ?? "");
  const finalidadeDesc = String(formData.get("finalidadeDescricao") ?? "").trim();
  const costCenter = String(formData.get("costCenter") ?? "").trim() || null;
  const externalRef = String(formData.get("externalReference") ?? "").trim() || null;

  const plano = findPlano(planoId);
  if (!plano) return { ok: false, error: "Plano nao encontrado." };

  let targetNormalized: string;
  let valid = false;
  if (plano.categoria === "cpf") {
    targetNormalized = normalizeCPF(targetRaw);
    valid = isValidCPF(targetNormalized);
  } else if (plano.categoria === "cnpj") {
    targetNormalized = normalizeCNPJ(targetRaw);
    valid = isValidCNPJ(targetNormalized);
  } else {
    targetNormalized = normalizePlaca(targetRaw);
    valid = isValidPlaca(targetNormalized);
  }

  if (!valid) {
    return {
      ok: false,
      error: `${plano.categoria.toUpperCase()} invalido.`,
      fieldErrors: { target: "Conferir digitos." },
    };
  }

  if (!finalidade) {
    return {
      ok: false,
      error: "Selecione a finalidade da consulta (LGPD).",
      fieldErrors: { finalidade: "Obrigatorio" },
    };
  }

  if (finalidade === "other" && finalidadeDesc.length < 5) {
    return {
      ok: false,
      error: "Descreva a finalidade.",
      fieldErrors: { finalidadeDescricao: "Minimo 5 caracteres" },
    };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active_company_id) {
    return { ok: false, error: "Empresa nao configurada." };
  }

  // Verifica role (admin ou operator podem consultar; viewer nao)
  const { data: member } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", profile.active_company_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member || member.role === "viewer") {
    return { ok: false, error: "Sem permissao pra criar consulta." };
  }

  const admin = createAdminClient();

  const { data: empresa } = await admin
    .from("companies")
    .select("id, folhas_balance, name")
    .eq("id", profile.active_company_id)
    .maybeSingle();

  if (!empresa) return { ok: false, error: "Empresa nao encontrada." };

  if ((empresa.folhas_balance ?? 0) < plano.custoFolhasB2B) {
    return {
      ok: false,
      error: `Saldo insuficiente: ${empresa.folhas_balance} créditos. Plano custa ${plano.custoFolhasB2B} créditos.`,
    };
  }

  // Idempotencia por external_reference (opcional)
  if (externalRef) {
    const { data: existing } = await admin
      .from("consultations")
      .select("id")
      .eq("company_id", empresa.id)
      .eq("external_reference", externalRef)
      .maybeSingle();
    if (existing) {
      return { ok: true, consultationId: existing.id };
    }
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? null;
  const ua = h.get("user-agent") ?? null;

  const targetHash = createHash("sha256")
    .update(`${plano.id}:${targetNormalized}`)
    .digest("hex");

  // Cria consulta direto como 'paid' (creditos serao debitados em seguida)
  const { data: consulta, error: insertErr } = await admin
    .from("consultations")
    .insert({
      user_id: user.id,
      company_id: empresa.id,
      source: "web", // veio do painel, nao da API
      category: plano.categoria,
      plan_tier: plano.id,
      target_value: targetRaw,
      target_normalized: targetNormalized,
      target_hash: targetHash,
      finality: finalidade,
      finality_description: finalidade === "other" ? finalidadeDesc : null,
      payment_type: "folhas",
      amount_cents: 0,
      folhas_used: plano.custoFolhasB2B,
      status: "paid",
      paid_at: new Date().toISOString(),
      external_reference: externalRef,
      cost_center: costCenter,
      ip_address: ip,
      user_agent: ua,
    })
    .select("id")
    .single();

  if (insertErr || !consulta) {
    await logError({
      context: "novaConsultaB2B",
      severity: "error",
      message: "Falha ao criar consulta B2B",
      error: insertErr ?? undefined,
      userId: user.id,
    });
    return { ok: false, error: "Falha ao criar consulta." };
  }

  // Debita creditos
  const { error: debErr } = await admin
    .from("companies")
    .update({
      folhas_balance: (empresa.folhas_balance ?? 0) - plano.custoFolhasB2B,
    })
    .eq("id", empresa.id);

  if (debErr) {
    // Rollback consulta
    await admin.from("consultations").delete().eq("id", consulta.id);
    return { ok: false, error: "Falha ao debitar créditos." };
  }

  // Dispara processamento (fire-and-forget)
  fireAndForgetProcess(consulta.id);

  return { ok: true, consultationId: consulta.id };
}

function fireAndForgetProcess(consultaId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceKey) return;
  fetch(`${baseUrl}/functions/v1/process-consultation`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ consultationId: consultaId }),
  }).catch((e) => {
    console.error("[empresa.novaConsulta] dispatch:", e);
  });
}
