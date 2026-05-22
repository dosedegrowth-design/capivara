import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { EquipeClient, type MemberRow } from "./equipe-client";

export const metadata = {
  title: "Equipe · Empresa · Capivara",
};

export default async function EquipePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const empresa = await getActiveCompany();
  if (!empresa) redirect("/onboarding/empresa");

  const supabase = await createClient();

  const { data: myMember } = await supabase
    .from("company_members")
    .select("role")
    .eq("company_id", empresa.id)
    .eq("user_id", profile.id)
    .maybeSingle();

  const isAdmin = myMember?.role === "admin";

  const { data: members } = await supabase
    .from("company_members")
    .select(`
      id, user_id, role, cost_center, invited_at, accepted_at,
      user:profiles!company_members_user_id_fkey(id, email, full_name)
    `)
    .eq("company_id", empresa.id)
    .order("invited_at", { ascending: true });

  const rows: MemberRow[] = (members ?? []).map((m) => {
    const u = m.user as unknown as
      | { email?: string; full_name?: string | null }
      | null;
    return {
      id: m.id,
      user_id: m.user_id,
      role: m.role as "admin" | "operator" | "viewer",
      cost_center: m.cost_center,
      invited_at: m.invited_at,
      accepted_at: m.accepted_at,
      user_full_name: u?.full_name ?? null,
      user_email: u?.email ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Empresa · Equipe
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Membros da equipe
        </h1>
        <p className="text-tabaco mt-1">
          Quem tem acesso ao painel da {empresa.name}. Cada um com uma função.
        </p>
      </header>

      <EquipeClient
        members={rows}
        currentUserId={profile.id}
        isAdmin={isAdmin}
      />

      {/* Legenda de roles */}
      <details className="rounded-lg border border-line bg-paper-2 p-4 text-sm">
        <summary className="cursor-pointer font-display font-semibold text-cocoa">
          O que cada função pode fazer?
        </summary>
        <dl className="mt-3 space-y-2 text-xs text-tabaco">
          <div>
            <dt className="text-cocoa font-semibold">Admin</dt>
            <dd>Tudo: criar consultas, ver histórico, recarregar créditos, gerenciar equipe, gerar API keys, configurar webhooks.</dd>
          </div>
          <div>
            <dt className="text-cocoa font-semibold">Operador</dt>
            <dd>Cria consultas e vê o histórico da equipe. Não pode mexer em créditos, equipe ou API.</dd>
          </div>
          <div>
            <dt className="text-cocoa font-semibold">Visualizador</dt>
            <dd>Só lê o histórico. Não cria nada.</dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
