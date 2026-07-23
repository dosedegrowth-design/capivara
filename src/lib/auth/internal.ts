import { timingSafeEqual } from "node:crypto";

/**
 * Timing-safe compare pra headers/tokens internos.
 * Retorna false pra strings de tamanhos diferentes (sem vazar length via timing).
 */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  try {
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Valida o header `x-internal-key` de rotas internas (webhook Asaas,
 * Edge Function → refund/pdf, etc).
 *
 * Novo em v2 (auditoria 2026-07-23): usa `INTERNAL_WEBHOOK_SECRET` dedicado.
 * Fallback pra `SUPABASE_SERVICE_ROLE_KEY` DURANTE transicao (remover apos
 * todos os callers passarem a usar INTERNAL_WEBHOOK_SECRET).
 *
 * @returns true se valido, false caso contrario.
 */
export function isInternalKeyValid(headerValue: string | null | undefined): boolean {
  const provided = headerValue ?? "";
  const dedicated = process.env.INTERNAL_WEBHOOK_SECRET;
  const legacy = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (dedicated && safeEqual(provided, dedicated)) return true;
  // Fallback legado (imprimir warning pra migrar)
  if (legacy && safeEqual(provided, legacy)) {
    console.warn(
      "[internal-key] usando SUPABASE_SERVICE_ROLE_KEY como fallback — migrar caller pra INTERNAL_WEBHOOK_SECRET"
    );
    return true;
  }
  return false;
}
