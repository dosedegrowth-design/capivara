"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PACOTES_MANADA } from "@/lib/consultas/planos";
import { createOrGetCustomer, createPayment, getPixQrCode, centavosToReal, dueDate } from "@/lib/asaas/client";
import { logError } from "@/lib/log";

/**
 * Server action: cria cobranca Asaas pra um pacote Manada.
 *
 * Fluxo:
 *  1. Valida pacote + admin guard
 *  2. Cria customer Asaas se empresa nao tem ainda
 *  3. Cria payment (PIX por padrao - mais rapido)
 *  4. Cria transaction status='pending' linked com pacote
 *  5. Redireciona pra /empresa/creditos/aguardando/[transactionId]
 *
 * Quando o webhook Asaas confirmar (PAYMENT_CONFIRMED), o handler
 * (src/app/api/asaas/webhook/route.ts) chama RPC add_balance_cents
 * pra creditar `pacote.saldoTotal_centavos` em companies.balance_cents.
 */
export type RecargaResult =
  | { ok: true; transactionId: string }
  | { ok: false; error: string };

export async function iniciarRecargaAction(formData: FormData): Promise<RecargaResult> {
  const pacoteId = String(formData.get("pacoteId") ?? "");
  const paymentType = String(formData.get("paymentType") ?? "pix") as
    | "pix"
    | "boleto"
    | "cartao_avista";

  const pacote = PACOTES_MANADA.find((p) => p.id === pacoteId);
  if (!pacote) return { ok: false, error: "Pacote nao encontrado." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/empresa/creditos");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.active_company_id) {
    return { ok: false, error: "Empresa nao configurada." };
  }

  // Verifica role admin
  const { data: member } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", profile.active_company_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member || member.role !== "admin") {
    return { ok: false, error: "Apenas administradores podem recarregar." };
  }

  const admin = createAdminClient();

  const { data: empresa } = await admin
    .from("companies")
    .select("*")
    .eq("id", profile.active_company_id)
    .maybeSingle();

  if (!empresa) return { ok: false, error: "Empresa nao encontrada." };

  try {
    // 1. Cria/reaproveita customer Asaas
    let asaasCustomerId = empresa.asaas_customer_id;
    if (!asaasCustomerId) {
      const customer = await createOrGetCustomer({
        name: empresa.razao_social ?? empresa.name,
        email: empresa.email_billing ?? profile.email,
        cpfCnpj: empresa.cnpj,
        externalReference: empresa.id,
      });
      asaasCustomerId = customer.id;
      await admin
        .from("companies")
        .update({ asaas_customer_id: customer.id })
        .eq("id", empresa.id);
    }

    // FIX race (auditoria 2026-07-23): INSERT transaction ANTES de chamar Asaas.
    // Antes: createPayment → 20+ linhas → INSERT. Webhook Asaas podia chegar na
    // janela e nao achar a transaction (asaas_payment_id nao gravado) →
    // add_balance_cents nao rodava → empresa pagava e nao recebia saldo.
    //
    // Agora: cria tx pending sem asaas_payment_id, chama Asaas, UPDATE com IDs.
    // Se Asaas falhar apos INSERT, tx fica visivel no admin (asaas_payment_id NULL)
    // pra investigacao. Se webhook chegar antes do UPDATE, ele acha tx pelo
    // externalReference (que agora inclui tx.id).

    // 2. Cria transaction em status='pending' (SEM asaas_payment_id ainda)
    const { data: tx, error: txErr } = await admin
      .from("transactions")
      .insert({
        user_id: user.id,
        company_id: empresa.id,
        type: "recharge",
        reference_id: null,
        payment_method: paymentType,
        amount_cents: pacote.valor_centavos,
        bonus_percentage: pacote.bonusPercent,
        asaas_payment_id: null,
        asaas_customer_id: asaasCustomerId,
        status: "pending",
        due_date: null,
      })
      .select("id")
      .single();

    if (txErr || !tx) {
      await logError({
        context: "recarga.transaction",
        severity: "error",
        message: "Falha ao criar transaction de recarga",
        error: txErr ?? undefined,
        userId: user.id,
      });
      return { ok: false, error: "Falha ao registrar cobranca." };
    }

    // 3. Cria payment Asaas com externalReference incluindo tx.id
    const payment = await createPayment({
      customer: asaasCustomerId,
      billingType:
        paymentType === "pix"
          ? "PIX"
          : paymentType === "boleto"
          ? "BOLETO"
          : "CREDIT_CARD",
      value: centavosToReal(pacote.valor_centavos),
      dueDate: dueDate(paymentType === "boleto" ? 3 : 1),
      description: `Capivara · ${pacote.nome} (R$ ${(pacote.saldoTotal_centavos / 100).toFixed(2)} de saldo)`,
      externalReference: `recharge:${empresa.id}:${pacote.id}`,
    });

    let pixQrcode: string | null = null;
    let pixCopyPaste: string | null = null;
    if (paymentType === "pix") {
      const qr = await getPixQrCode(payment.id);
      pixQrcode = qr.encodedImage;
      pixCopyPaste = qr.payload;
    }

    // 4. UPDATE tx com asaas_payment_id + response + qr + due_date
    await admin
      .from("transactions")
      .update({
        asaas_payment_id: payment.id,
        asaas_response: payment as unknown as Record<string, unknown>,
        pix_qrcode: pixQrcode,
        pix_copy_paste: pixCopyPaste,
        boleto_url: payment.bankSlipUrl ?? null,
        due_date: payment.dueDate,
      })
      .eq("id", tx.id);

    revalidatePath("/empresa/creditos");
    return { ok: true, transactionId: tx.id };
  } catch (err) {
    await logError({
      context: "recarga",
      severity: "critical",
      message: "Falha geral na recarga",
      error: err instanceof Error ? err : new Error(String(err)),
      userId: user.id,
    });
    return { ok: false, error: "Erro inesperado. Tente novamente." };
  }
}
