/**
 * API Keys B2B — geracao, hash e validacao.
 *
 * Formato da chave: cap_live_<32 chars base62>
 *   - prefixo `cap_live_` (visivel na UI)
 *   - 32 chars aleatorios (192 bits de entropia)
 *
 * Guardamos apenas o hash SHA-256 no banco. A chave em texto puro so e
 * mostrada UMA vez no momento da criacao.
 */

import { createHash, randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const KEY_PREFIX = "cap_live_";
const KEY_BODY_LEN = 32; // chars do corpo

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function randomBase62(len: number): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return out;
}

export function generateApiKey(): { fullKey: string; prefix: string; hash: string } {
  const body = randomBase62(KEY_BODY_LEN);
  const fullKey = `${KEY_PREFIX}${body}`;
  // prefix mostrado na UI = primeiros 12 chars (cap_live_XXXX)
  const prefix = fullKey.slice(0, 12);
  const hash = hashApiKey(fullKey);
  return { fullKey, prefix, hash };
}

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export interface ApiKeyValidation {
  ok: boolean;
  reason?: "missing" | "format" | "not_found" | "revoked" | "expired";
  apiKey?: {
    id: string;
    company_id: string;
    scopes: string[];
    rate_limit_per_min: number;
  };
}

/**
 * Valida a chave recebida no header (Authorization: Bearer <key>).
 * Retorna o registro carregado (sem o hash) se OK.
 *
 * Roda com service role pra escapar RLS (cliente nao tem sessao).
 */
export async function validateApiKey(rawKey: string | null): Promise<ApiKeyValidation> {
  if (!rawKey) return { ok: false, reason: "missing" };
  if (!rawKey.startsWith(KEY_PREFIX)) return { ok: false, reason: "format" };

  const hash = hashApiKey(rawKey);
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("api_keys")
    .select("id, company_id, scopes, rate_limit_per_min, revoked_at, expires_at")
    .eq("key_hash", hash)
    .maybeSingle();

  if (error || !data) return { ok: false, reason: "not_found" };
  if (data.revoked_at) return { ok: false, reason: "revoked" };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, reason: "expired" };
  }

  return {
    ok: true,
    apiKey: {
      id: data.id,
      company_id: data.company_id,
      scopes: data.scopes ?? [],
      rate_limit_per_min: data.rate_limit_per_min ?? 60,
    },
  };
}

/**
 * Marca uso da chave (last_used_at + total_calls++).
 * Fire-and-forget no caller, mas a operacao em si e await pra registrar antes
 * do response.
 */
export async function touchApiKey(apiKeyId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.rpc("touch_api_key", { p_api_key_id: apiKeyId }).then(
    () => {},
    async () => {
      // Fallback se RPC nao existir: update direto.
      await admin
        .from("api_keys")
        .update({
          last_used_at: new Date().toISOString(),
        })
        .eq("id", apiKeyId);
    }
  );
}

/**
 * Extrai a chave do header Authorization (Bearer <key>) ou x-api-key.
 */
export function extractApiKeyFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  const x = req.headers.get("x-api-key");
  if (x) return x.trim();
  return null;
}
