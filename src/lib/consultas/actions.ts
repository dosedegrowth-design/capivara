"use server";

import { redirect } from "next/navigation";
import { createHash } from "crypto";
import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findPlano } from "@/lib/consultas/planos";
import { normalizeCPF, normalizeCNPJ, normalizePlaca, isValidCPF, isValidCNPJ, isValidPlaca } from "@/lib/formatters";
import {
  createOrGetCustomer,
  createPayment,
  getPixQrCode,
  centavosToReal,
  dueDate,
} from "@/lib/asaas/client";
import { logError } from "@/lib/log";
import { sendEmail } from "@/lib/email/client";
import { emailPagamentoAguardando } from "@/lib/email/templates";
import { formatBRL } from "@/lib/formatters";
import { logConsent } from "@/lib/legal/consent";

/**
 * Server action: inicia uma consulta.
 *
 * 1. Valida o target (CPF/CNPJ/placa) com digito verificador
 * 2. Cria registro em capivara.consultations com status='pending_payment'
 * 3. Cria customer Asaas (ou reusa existente)
 * 4. Cria cobranca Asaas (PIX/Boleto)
 * 5. Salva ID asaas + QR Code/Boleto link na consulta
 * 6. Redireciona para /consultar/aguardando/{id}
 */

export type IniciarConsultaResult =
  | { ok: true; consultationId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function iniciarConsultaAction(
  formData: FormData
): Promise<IniciarConsultaResult> {
  // ---- 1. Parse + validate ----
  const planoId = String(formData.get("planoId") ?? "");
  const targetRaw = String(formData.get("target") ?? "").trim();
  const finalidade = String(formData.get("finalidade") ?? "");
  const finalidadeDesc = String(formData.get("finalidadeDescricao") ?? "").trim();
  const paymentType = String(formData.get("paymentType") ?? "pix") as
    | "pix"
    | "boleto"
    | "cartao_avista";

  const plano = findPlano(planoId);
  if (!plano) {
    return { ok: false, error: "Plano nao encontrado." };
  }

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

  // Aceite OBRIGATORIO do termo de responsabilidade
  const acceptResponsibility = formData.get("acceptResponsibility") === "true";
  if (!acceptResponsibility) {
    return {
      ok: false,
      error: "Você precisa aceitar o termo de responsabilidade pela consulta.",
    };
  }

  // ---- 2. Usuario logado ----
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redireciona pra cadastro guardando os params
    const sp = new URLSearchParams({
      redirect: `/consultar/${plano.categoria}/${planoId.split("-").slice(1).join("-")}`,
      planoId,
      target: targetNormalized,
      finalidade,
    });
    redirect(`/cadastro?${sp.toString()}`);
  }

  // ---- 3. Buscar profile (precisa CPF + nome pra customer Asaas) ----
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !profile.cpf || !profile.full_name) {
    return {
      ok: false,
      error: "Complete seu cadastro com CPF e nome completo.",
    };
  }

  // ---- 4. Headers (IP + UA) ----
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? null;
  const ua = h.get("user-agent") ?? null;

  // ---- 4.5. Anti-fraude ----
  const admin = createAdminClient();
  const { data: fraudCheck } = await admin.rpc("check_fraud_rules", {
    p_user_id: user.id,
    p_target_normalized: targetNormalized,
    p_ip_address: ip,
  });

  if (fraudCheck === "BLOCK") {
    return {
      ok: false,
      error:
        "Atividade suspeita detectada. Aguarde algumas horas ou entre em contato com o suporte.",
    };
  }

  const targetHash = createHash("sha256")
    .update(`${plano.id}:${targetNormalized}`)
    .digest("hex");

  // ---- 5. Inserir consulta (status pending_payment) ----
  const { data: consulta, error: insertError } = await admin
    .from("consultations")
    .insert({
      user_id: user.id,
      category: plano.categoria,
      plan_tier: planoId,
      target_value: targetRaw,
      target_normalized: targetNormalized,
      target_hash: targetHash,
      finality: finalidade,
      finality_description: finalidade === "other" ? finalidadeDesc : null,
      payment_type: paymentType,
      amount_cents: plano.precoB2C_centavos,
      status: "pending_payment",
      ip_address: ip,
      user_agent: ua,
    })
    .select()
    .single();

  if (insertError || !consulta) {
    await logError({
      context: "iniciarConsulta",
      severity: "error",
      message: "Falha ao criar consulta",
      error: insertError ?? undefined,
      userId: user.id,
    });
    return { ok: false, error: "Falha ao criar consulta. Tente novamente." };
  }

  // Registra aceite do termo de responsabilidade (LGPD, ligado a consulta)
  await logConsent("consultation_responsibility", {
    userId: user.id,
    metadata: {
      consultation_id: consulta.id,
      target_hash: targetHash,
      plan_id: plano.id,
      finality: finalidade,
      finality_description: finalidade === "other" ? finalidadeDesc : null,
      context: "consulta_b2c",
    },
  }).catch(() => {
    // logError ja foi chamado internamente
  });

  // ---- 6. Criar/reusar customer + cobranca Asaas ----
  try {
    let asaasCustomerId = profile.asaas_customer_id;
    if (!asaasCustomerId) {
      const customer = await createOrGetCustomer({
        name: profile.full_name,
        email: profile.email,
        cpfCnpj: profile.cpf,
        mobilePhone: profile.phone ?? undefined,
        externalReference: profile.id,
      });
      asaasCustomerId = customer.id;
      await admin
        .from("profiles")
        .update({ asaas_customer_id: customer.id })
        .eq("id", profile.id);
    }

    const payment = await createPayment({
      customer: asaasCustomerId,
      billingType:
        paymentType === "pix"
          ? "PIX"
          : paymentType === "boleto"
          ? "BOLETO"
          : "CREDIT_CARD",
      value: centavosToReal(plano.precoB2C_centavos),
      dueDate: dueDate(paymentType === "boleto" ? 3 : 1),
      description: `Capivara ${plano.nome} · ${plano.categoria.toUpperCase()}`,
      externalReference: `consultation:${consulta.id}`,
    });

    // Pega QR code PIX se aplicavel
    let pixQrcode: string | null = null;
    let pixCopyPaste: string | null = null;
    if (paymentType === "pix") {
      const qr = await getPixQrCode(payment.id);
      pixQrcode = qr.encodedImage;
      pixCopyPaste = qr.payload;
    }

    // Atualiza consulta com IDs Asaas
    await admin
      .from("consultations")
      .update({ asaas_payment_id: payment.id })
      .eq("id", consulta.id);

    // Cria transaction
    await admin.from("transactions").insert({
      user_id: user.id,
      type: "consultation",
      reference_id: consulta.id,
      payment_method: paymentType,
      amount_cents: plano.precoB2C_centavos,
      asaas_payment_id: payment.id,
      asaas_customer_id: asaasCustomerId,
      asaas_response: payment as unknown as Record<string, unknown>,
      pix_qrcode: pixQrcode,
      pix_copy_paste: pixCopyPaste,
      boleto_url: payment.bankSlipUrl ?? null,
      status: "pending",
      due_date: payment.dueDate,
    });

    // Email "pagamento aguardando" (fire-and-forget)
    const categoriaLabel: "CPF" | "CNPJ" | "Veicular" =
      plano.categoria === "cpf" ? "CPF" : plano.categoria === "cnpj" ? "CNPJ" : "Veicular";
    const pagAguardando = emailPagamentoAguardando({
      nome: profile.full_name,
      categoria: categoriaLabel,
      target: targetRaw,
      valor: formatBRL(plano.precoB2C_centavos),
      consultationId: consulta.id,
    });
    sendEmail({
      to: profile.email,
      subject: pagAguardando.subject,
      html: pagAguardando.html,
      tags: [
        { name: "type", value: "payment_pending" },
        { name: "category", value: plano.categoria },
        { name: "payment_method", value: paymentType },
      ],
    }).catch(() => {
      // logError ja chamado dentro do sendEmail
    });

    return { ok: true, consultationId: consulta.id };
  } catch (asaasErr) {
    await logError({
      context: "iniciarConsulta.asaas",
      severity: "critical",
      message: "Falha ao criar cobranca Asaas",
      error: asaasErr instanceof Error ? asaasErr : new Error(String(asaasErr)),
      userId: user.id,
      consultationId: consulta.id,
    });

    // Marca consulta como erro
    await admin
      .from("consultations")
      .update({ status: "error" })
      .eq("id", consulta.id);

    return {
      ok: false,
      error:
        "Falha ao processar pagamento. Tente novamente em alguns segundos.",
    };
  }
}
