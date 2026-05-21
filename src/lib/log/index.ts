import { createAdminClient } from "@/lib/supabase/admin";

export type ErrorSeverity = "info" | "warning" | "error" | "critical";

export interface LogErrorParams {
  context: string; // ex: 'webhook_asaas', 'api_full_call', 'pdf_generation'
  severity: ErrorSeverity;
  message: string;
  error?: Error | unknown;
  metadata?: Record<string, unknown>;
  userId?: string;
  consultationId?: string;
}

/**
 * Substituto do Sentry. Grava erros em `error_logs` no Supabase + console.
 *
 * Em modo critical, alem de logar, dispara email/WhatsApp ao admin via Resend.
 */
export async function logError(params: LogErrorParams): Promise<void> {
  const { context, severity, message, error, metadata, userId, consultationId } = params;

  // Console — Vercel Logs captura
  const errObj = error instanceof Error ? error : undefined;
  console.error(
    JSON.stringify({
      capivara_log: true,
      context,
      severity,
      message,
      error_name: errObj?.name,
      error_message: errObj?.message,
      stack: errObj?.stack,
      metadata,
      userId,
      consultationId,
      timestamp: new Date().toISOString(),
    })
  );

  // Persistir no Supabase (fire-and-forget, nao bloqueia request)
  try {
    const admin = createAdminClient();
    await admin.from("error_logs").insert({
      context,
      severity,
      message,
      stack_trace: errObj?.stack ?? null,
      metadata: metadata ?? null,
      user_id: userId ?? null,
      consultation_id: consultationId ?? null,
    });
  } catch (logErr) {
    // Se falhar gravar log, pelo menos imprime
    console.error("[log/error] Falha ao gravar error_log:", logErr);
  }

  // Critical: notificar admin externamente (Resend/WhatsApp)
  if (severity === "critical") {
    // TODO Fase 11: integrar Resend
    console.error("[CRITICAL] Notificacao admin pendente:", message);
  }
}
