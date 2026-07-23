import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { ConsultasClient } from "./consultas-client";

/**
 * Mascara PII (CPF/CNPJ/placa) por default. Admin clica em "revelar"
 * pra ver — cada revelação grava em audit_logs (LGPD Art. 37).
 */
function maskTarget(category: string, value: string): string {
  if (!value) return "—";
  const clean = value.replace(/\D/g, "");
  if (category === "cpf" && clean.length === 11) {
    return `${clean.slice(0, 3)}.***.***-${clean.slice(-2)}`;
  }
  if (category === "cnpj" && clean.length === 14) {
    return `${clean.slice(0, 2)}.***.***/****-${clean.slice(-2)}`;
  }
  if (category === "veicular") {
    // Placa: mostra 3 primeiros + 1 asterisco
    return `${value.slice(0, 3)}***`;
  }
  // Fallback: mostra so 3 primeiros + asteriscos
  return `${value.slice(0, 3)}***`;
}

export default async function AdminConsultasPage() {
  const admin = createAdminClient();
  const { data: consultas } = await admin
    .from("consultations")
    .select("id, user_id, category, plan_tier, target_value, status, amount_cents, cache_hit, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = (consultas ?? []).map((c) => ({
    id: c.id,
    category: c.category,
    target_value: c.target_value,
    target_masked: maskTarget(c.category, c.target_value),
    plan_tier: c.plan_tier,
    amount_cents: c.amount_cents ?? 0,
    status: c.status,
    cache_hit: !!c.cache_hit,
    created_at: c.created_at,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Admin · Consultas
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Consultas
        </h1>
        <p className="text-tabaco mt-1">
          Últimas 200. {rows.length} exibidas. Target mascarado por padrão — clique em <strong>revelar</strong> pra ver (gera audit log).
        </p>
      </header>

      <ConsultasClient initial={rows} />
    </div>
  );
}
