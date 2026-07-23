import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Book, Code2 } from "lucide-react";

import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ApiKeysClient, type ApiKeyRow } from "./api-keys-client";
import { ApiUsageStats, type ApiUsageStats as ApiUsageStatsType } from "./api-usage-stats";

export const metadata: Metadata = {
  title: "API & Integracoes · Capivara",
};

export default async function ApiPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const empresa = await getActiveCompany();
  if (!empresa) redirect("/onboarding/empresa");

  const supabase = await createClient();

  // Guard: apenas admin da empresa pode ver/gerenciar API keys.
  // Sem esse guard, qualquer operator/viewer via URL /empresa/api ve lista de
  // chaves (id, prefix, uso) — facilita ataque social.
  const { data: member } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", empresa.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!member || member.role !== "admin") {
    redirect("/empresa");
  }

  const { data } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, total_calls, last_used_at, created_at, revoked_at")
    .eq("company_id", empresa.id)
    .order("created_at", { ascending: false });

  const keys: ApiKeyRow[] = (data ?? []) as ApiKeyRow[];

  // Computa stats de uso via API (source='api')
  const stats = await loadApiUsageStats(empresa.id);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Link
        href="/empresa"
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Painel da empresa
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Coluna principal */}
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-cocoa">
              API & Integracoes
            </h1>
            <p className="mt-2 text-tabaco">
              Puxe capivaras direto do seu sistema. Sem painel, sem login,
              cobrado por consulta — você recarrega saldo em R$ e cada chamada
              debita o preço B2B do plano.
            </p>
          </div>

          {/* Dashboard de uso da API */}
          <section>
            <h2 className="font-display text-xl font-bold text-cocoa mb-3">
              Uso da API
            </h2>
            <ApiUsageStats stats={stats} />
          </section>

          {/* Gestao de chaves */}
          <section>
            <h2 className="font-display text-xl font-bold text-cocoa mb-3">
              Chaves de API
            </h2>
            <ApiKeysClient keys={keys} />
          </section>
        </div>

        {/* Sidebar com quick-start docs */}
        <aside className="space-y-4 lg:sticky lg:top-8">
          <div className="rounded-lg border border-line bg-card p-5">
            <h3 className="font-display font-semibold text-cocoa mb-3 flex items-center gap-2">
              <Code2 className="size-4 text-fur" />
              Quick start
            </h3>
            <ol className="text-xs text-tabaco space-y-2 leading-relaxed">
              <li>
                <strong className="text-cocoa">1.</strong> Gere uma chave acima
              </li>
              <li>
                <strong className="text-cocoa">2.</strong> Mande POST pra{" "}
                <code className="font-mono text-fur">/v1/consultations</code>
              </li>
              <li>
                <strong className="text-cocoa">3.</strong> Configure webhook em{" "}
                <Link href="/empresa/webhooks" className="text-fur hover:underline">
                  webhooks
                </Link>{" "}
                pra receber callback
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-line bg-cocoa text-cream p-5 font-mono text-[11px] leading-relaxed overflow-x-auto">
            <p className="text-saffron mb-2">{`// Criar consulta CPF`}</p>
            <pre className="whitespace-pre-wrap">{`curl -X POST \\
  https://suacapivara.com.br/api/v1/consultations \\
  -H "Authorization: Bearer cap_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan_id": "cpf-investigacao",
    "target": "12345678900",
    "external_reference": "ticket-42"
  }'`}</pre>
          </div>

          <div className="rounded-lg border border-line bg-paper/50 p-5">
            <h3 className="font-display font-semibold text-cocoa mb-2 flex items-center gap-2">
              <Book className="size-4 text-fur" />
              Documentacao
            </h3>
            <ul className="text-xs text-tabaco space-y-1.5">
              <li>
                <Link href="/docs/api" className="text-fur hover:underline">
                  Referencia da API v1
                </Link>
              </li>
              <li>
                <Link href="/docs/webhooks" className="text-fur hover:underline">
                  Webhooks & assinatura HMAC
                </Link>
              </li>
              <li>
                <Link href="/empresa/creditos" className="text-fur hover:underline">
                  Como funciona o saldo da empresa
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

// =============================================================================
// Helper: agrega estatisticas de uso da API
// =============================================================================
async function loadApiUsageStats(companyId: string): Promise<ApiUsageStatsType> {
  const supabase = await createClient();
  const now = new Date();
  const start7d = new Date(now);
  start7d.setDate(now.getDate() - 7);
  const start30d = new Date(now);
  start30d.setDate(now.getDate() - 30);
  const start14d = new Date(now);
  start14d.setDate(now.getDate() - 14);
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);

  // Todas as consultas via API da empresa
  const { data: apiConsultas } = await supabase
    .from("consultations")
    .select("id, status, plan_tier, created_at, amount_cents")
    .eq("company_id", companyId)
    .eq("source", "api")
    .gte("created_at", start30d.toISOString())
    .order("created_at", { ascending: false });

  const consultas = apiConsultas ?? [];

  const totalCallsToday = consultas.filter((c) => new Date(c.created_at) >= startToday).length;
  const totalCalls7d = consultas.filter((c) => new Date(c.created_at) >= start7d).length;
  const totalCalls30d = consultas.length;

  const sucesso7d = consultas.filter(
    (c) => new Date(c.created_at) >= start7d && c.status === "completed"
  ).length;
  const successRate7d = totalCalls7d > 0 ? (sucesso7d / totalCalls7d) * 100 : 100;

  const totalGastoCents7d = consultas
    .filter((c) => new Date(c.created_at) >= start7d)
    .reduce((acc, c) => acc + (c.amount_cents ?? 0), 0);

  // Calls por dia (ultimos 14 dias)
  const byDay: Record<string, number> = {};
  for (let i = 0; i < 14; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay[key] = 0;
  }
  for (const c of consultas) {
    if (new Date(c.created_at) >= start14d) {
      const key = c.created_at.slice(0, 10);
      if (key in byDay) byDay[key]++;
    }
  }
  const callsByDay = Object.entries(byDay)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, count]) => ({ day, count }));

  // Top planos via API
  const planCounts: Record<string, number> = {};
  for (const c of consultas) {
    planCounts[c.plan_tier] = (planCounts[c.plan_tier] ?? 0) + 1;
  }
  const topPlans = Object.entries(planCounts)
    .map(([plan_id, count]) => ({ plan_id, count }))
    .sort((a, b) => b.count - a.count);

  // Webhook delivery stats
  const { data: webhookData } = await supabase
    .from("webhook_deliveries")
    .select("status")
    .eq("company_id", companyId)
    .gte("created_at", start30d.toISOString());

  const webhookDeliveries = {
    delivered: 0,
    failed: 0,
    pending: 0,
    exhausted: 0,
  };
  for (const w of webhookData ?? []) {
    const s = w.status as keyof typeof webhookDeliveries;
    if (s in webhookDeliveries) webhookDeliveries[s]++;
  }

  return {
    totalCalls7d,
    totalCalls30d,
    totalCallsToday,
    callsByDay,
    successRate7d,
    totalGastoCents7d,
    topPlans,
    webhookDeliveries,
  };
}
