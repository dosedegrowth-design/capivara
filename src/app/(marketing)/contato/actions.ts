"use server";

import { headers } from "next/headers";
import { sendEmail } from "@/lib/email/client";
import { logError } from "@/lib/log";
import { CAPIVARA_CONFIG } from "@/lib/config";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * Server action do form de contato publico.
 *
 * Rate limit: 3 envios/hora por IP.
 * Envia email pra CAPIVARA_CONFIG.email + salva log.
 */

export type ContatoResult =
  | { ok: true }
  | { ok: false; error: string };

export async function enviarContatoAction(formData: FormData): Promise<ContatoResult> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const assunto = String(formData.get("assunto") ?? "").trim();
  const mensagem = String(formData.get("mensagem") ?? "").trim();

  if (nome.length < 2) return { ok: false, error: "Nome muito curto." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return { ok: false, error: "Email invalido." };
  if (assunto.length < 3) return { ok: false, error: "Assunto muito curto." };
  if (mensagem.length < 10) return { ok: false, error: "Mensagem muito curta (min 10 chars)." };
  if (mensagem.length > 5000) return { ok: false, error: "Mensagem grande demais (max 5000 chars)." };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown";
  const ua = h.get("user-agent") ?? "unknown";

  // Rate limit por IP: 3 envios/hora (60 * 60 * 1000 ms)
  const rl = checkRateLimit(`contato:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return { ok: false, error: `Muitas mensagens desse IP. Tente em ${rl.resetInSeconds}s.` };
  }

  const dest = CAPIVARA_CONFIG.email;
  if (!dest || dest === "contato@suacapivara.com.br") {
    // Log — env nao configurado. Ainda salva o log.
    console.warn("[contato] NEXT_PUBLIC_CAPIVARA_EMAIL nao configurado, usando fallback");
  }

  try {
    const r = await sendEmail({
      to: dest,
      subject: `[Contato Capivara] ${assunto}`,
      html: `<h2>Nova mensagem via formulário de contato</h2>
<p><strong>Nome:</strong> ${escape(nome)}<br>
<strong>Email:</strong> ${escape(email)}<br>
<strong>Assunto:</strong> ${escape(assunto)}<br>
<strong>IP:</strong> ${escape(ip)}<br>
<strong>User-Agent:</strong> ${escape(ua)}</p>
<hr>
<p style="white-space:pre-wrap;">${escape(mensagem)}</p>
`,
      replyTo: email,
      tags: [{ name: "type", value: "contact_form" }],
    });

    if (!r.ok) {
      await logError({
        context: "contato_form",
        severity: "error",
        message: "sendEmail falhou no form de contato",
        metadata: { nome, email, assunto },
      });
      return { ok: false, error: "Nao conseguimos enviar agora. Tente pelo WhatsApp ou email direto." };
    }

    return { ok: true };
  } catch (err) {
    await logError({
      context: "contato_form",
      severity: "error",
      message: "Exception no form de contato",
      error: err instanceof Error ? err : new Error(String(err)),
    });
    return { ok: false, error: "Erro inesperado. Tente novamente em alguns minutos." };
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
