import { Resend } from "resend";
import { logError } from "@/lib/log";

/**
 * Cliente Resend — email transacional Capivara.
 *
 * Inicializa lazy (não falha em build se RESEND_API_KEY não estiver setado).
 * Quando a chave não existe, sendEmail loga warning e retorna { skipped: true }.
 */

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  _resend = new Resend(key);
  return _resend;
}

const FROM_DEFAULT = process.env.RESEND_FROM_EMAIL ?? "Capivara <ola@suacapivara.com.br>";

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  tags?: { name: string; value: string }[];
}

export type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; skipped: true; reason: string }
  | { ok: false; error: string };

export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY ausente — pulando envio:", params.subject);
    return { ok: false, skipped: true, reason: "no_api_key" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: params.from ?? FROM_DEFAULT,
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
      tags: params.tags,
    });

    if (error) {
      await logError({
        context: "email_send",
        severity: "error",
        message: `Resend retornou erro: ${error.message}`,
        metadata: { subject: params.subject, to: params.to },
      });
      return { ok: false, error: error.message };
    }

    return { ok: true, id: data?.id ?? "" };
  } catch (err) {
    await logError({
      context: "email_send",
      severity: "critical",
      message: "Excecao ao enviar email via Resend",
      error: err instanceof Error ? err : new Error(String(err)),
      metadata: { subject: params.subject },
    });
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
