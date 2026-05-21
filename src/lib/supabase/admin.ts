import { createClient } from "@supabase/supabase-js";

/**
 * Cliente admin — usa service_role key (BYPASS RLS).
 *
 * IMPORTANTE: nunca importar em codigo cliente.
 * Usar apenas em:
 *   - Route Handlers de webhook (Asaas, etc)
 *   - Server Actions privilegiadas
 *   - Edge Functions
 *   - Scripts internos
 *
 * Toda operacao com este cliente deve gerar audit_log.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY nao configurada");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
