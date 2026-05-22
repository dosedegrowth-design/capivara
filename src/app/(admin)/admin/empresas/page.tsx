import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/session";
import { EmpresasAdminClient, type EmpresaAdminRow } from "./empresas-client";

export const metadata = {
  title: "Empresas · Admin · Capivara",
};

export default async function AdminEmpresasPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.account_type !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const { data: empresas } = await admin
    .from("companies")
    .select(`
      id, name, razao_social, cnpj, folhas_balance, plan_tier, created_at,
      email_billing, fiscal_settings, owner_id,
      owner:profiles!companies_owner_id_fkey(full_name, email)
    `)
    .order("created_at", { ascending: false });

  const empresaIds = (empresas ?? []).map((e) => e.id);

  const consultasByCompany: Record<string, number> = {};
  const recargasByCompany: Record<string, number> = {};

  if (empresaIds.length > 0) {
    const { data: consultasData } = await admin
      .from("consultations")
      .select("company_id")
      .in("company_id", empresaIds);
    for (const c of consultasData ?? []) {
      if (c.company_id) {
        consultasByCompany[c.company_id] = (consultasByCompany[c.company_id] ?? 0) + 1;
      }
    }

    const { data: recargasData } = await admin
      .from("transactions")
      .select("company_id")
      .in("company_id", empresaIds)
      .eq("type", "recharge")
      .eq("status", "paid");
    for (const r of recargasData ?? []) {
      if (r.company_id) {
        recargasByCompany[r.company_id] = (recargasByCompany[r.company_id] ?? 0) + 1;
      }
    }
  }

  const rows: EmpresaAdminRow[] = (empresas ?? []).map((e) => {
    const owner = e.owner as unknown as
      | { full_name?: string | null; email?: string }
      | null;
    return {
      id: e.id,
      name: e.name,
      razao_social: e.razao_social,
      cnpj: e.cnpj,
      folhas_balance: e.folhas_balance ?? 0,
      plan_tier: e.plan_tier,
      created_at: e.created_at,
      email_billing: e.email_billing,
      fiscal_settings: e.fiscal_settings as Record<string, unknown> | null,
      owner_id: e.owner_id,
      owner_name: owner?.full_name ?? null,
      owner_email: owner?.email ?? null,
      total_consultas: consultasByCompany[e.id] ?? 0,
      total_recargas: recargasByCompany[e.id] ?? 0,
    };
  });

  const total = rows.length;
  const ativas = rows.filter((r) => !r.fiscal_settings?._suspended).length;
  const suspensas = total - ativas;
  const totalCreditos = rows.reduce((acc, r) => acc + r.folhas_balance, 0);

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          <Building2 className="size-3 mr-1 inline" />
          Admin
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">Empresas</h1>
        <p className="text-tabaco mt-1">
          Gestão de empresas B2B. Ajustar créditos manualmente, suspender por
          fraude, ver uso agregado.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total" value={total} />
        <Stat label="Ativas" value={ativas} color="ok" />
        <Stat label="Suspensas" value={suspensas} color="err" />
        <Stat label="Créditos totais" value={totalCreditos} color="fur" hint="distribuídos" />
      </div>

      <EmpresasAdminClient empresas={rows} />
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: number;
  hint?: string;
  color?: "ok" | "err" | "fur";
}) {
  const colorClass =
    color === "ok"
      ? "text-ok"
      : color === "err"
      ? "text-red-600"
      : color === "fur"
      ? "text-fur"
      : "text-cocoa";
  return (
    <div className="rounded-lg border border-line bg-card p-4">
      <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">{label}</p>
      <p className={`font-display text-2xl font-bold mt-1 ${colorClass}`}>{value}</p>
      {hint && <p className="text-[10px] font-mono text-tabaco mt-0.5">{hint}</p>}
    </div>
  );
}
