/**
 * Server actions e helpers de aceite legal.
 *
 * Toda funcao que registra aceite GUARDA:
 *  - texto completo do documento (snapshot)
 *  - hash SHA-256 do texto (integridade)
 *  - versao
 *  - IP do dispositivo
 *  - User-agent
 *  - Timestamp
 *  - Metadata (consultation_id, finalidade, etc)
 *
 * Append-only no banco — nunca atualizamos ou apagamos.
 */

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ALL_DOCUMENTS,
  hashDocument,
  type DocumentType,
  type LegalDocument,
} from "./documents";
import { logError } from "@/lib/log";

export interface ConsentContext {
  userId: string;
  companyId?: string | null;
  /** Metadados adicionais (consultation_id, finalidade, etc) */
  metadata?: Record<string, unknown>;
}

export interface ConsentResult {
  ok: boolean;
  consentId?: string;
  error?: string;
}

/**
 * Registra aceite de um documento legal.
 *
 * Use no server (server action ou route handler) — captura IP/UA das headers.
 */
export async function logConsent(
  documentType: DocumentType,
  ctx: ConsentContext
): Promise<ConsentResult> {
  const doc = ALL_DOCUMENTS[documentType];
  if (!doc) {
    return { ok: false, error: `unknown_document_type:${documentType}` };
  }

  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    h.get("x-real-ip") ??
    null;
  const ua = h.get("user-agent") ?? null;

  const docHash = hashDocument(doc);

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.rpc("log_consent", {
      p_user_id: ctx.userId,
      p_company_id: ctx.companyId ?? null,
      p_document_type: documentType,
      p_document_version: doc.version,
      p_document_hash: docHash,
      p_document_text: doc.text,
      p_ip_address: ip,
      p_user_agent: ua,
      p_metadata: ctx.metadata ?? {},
    });

    if (error) {
      // Fallback: insert direto se RPC falhar (ex: migration ainda nao aplicada)
      const { data: insertData, error: insertErr } = await admin
        .from("consent_logs")
        .insert({
          user_id: ctx.userId,
          company_id: ctx.companyId ?? null,
          document_type: documentType,
          document_version: doc.version,
          document_hash: docHash,
          document_text: doc.text,
          ip_address: ip,
          user_agent: ua,
          metadata: ctx.metadata ?? {},
        })
        .select("id")
        .single();

      if (insertErr || !insertData) {
        await logError({
          context: "consent.log",
          severity: "critical",
          message: "Falha ao registrar aceite (RPC + fallback)",
          error: (insertErr ?? error) as Error,
          userId: ctx.userId,
          metadata: { documentType, version: doc.version },
        });
        return { ok: false, error: insertErr?.message ?? error.message };
      }
      return { ok: true, consentId: insertData.id };
    }

    return { ok: true, consentId: data as string };
  } catch (err) {
    await logError({
      context: "consent.log",
      severity: "critical",
      message: "Exception ao registrar aceite",
      error: err instanceof Error ? err : new Error(String(err)),
      userId: ctx.userId,
      metadata: { documentType },
    });
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Registra múltiplos aceites de uma vez (ex: signup que aceita Terms + Privacy).
 * Roda em paralelo.
 */
export async function logConsents(
  documentTypes: DocumentType[],
  ctx: ConsentContext
): Promise<{ ok: boolean; consentIds: string[]; errors: string[] }> {
  const results = await Promise.all(
    documentTypes.map((t) => logConsent(t, ctx))
  );
  const consentIds = results.filter((r) => r.consentId).map((r) => r.consentId!);
  const errors = results.filter((r) => r.error).map((r) => r.error!);
  return {
    ok: errors.length === 0,
    consentIds,
    errors,
  };
}

/**
 * Verifica se o user aceitou a versão ATUAL de um documento.
 * Retorna `true` se o último aceite tem o hash igual ao hash atual.
 *
 * Útil pra forçar reaceite quando documento muda.
 */
export async function hasAcceptedLatest(
  userId: string,
  documentType: DocumentType
): Promise<boolean> {
  const doc = ALL_DOCUMENTS[documentType];
  if (!doc) return false;

  const admin = createAdminClient();
  const { data } = await admin
    .from("v_latest_consents")
    .select("document_hash, document_version")
    .eq("user_id", userId)
    .eq("document_type", documentType)
    .maybeSingle();

  if (!data) return false;

  const currentHash = hashDocument(doc);
  return data.document_hash === currentHash;
}

/**
 * Lista todos os aceites de um usuário (pra /configuracoes/meus-aceites).
 */
export async function listUserConsents(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("consent_logs")
    .select("id, document_type, document_version, document_hash, accepted_at, ip_address, user_agent, metadata")
    .eq("user_id", userId)
    .order("accepted_at", { ascending: false });
  return data ?? [];
}

/**
 * Re-exporta o documento (utility pra ler em server components).
 */
export function getLegalDocument(type: DocumentType): LegalDocument {
  return ALL_DOCUMENTS[type];
}
