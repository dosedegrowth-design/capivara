import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveCompany } from "@/lib/auth/session";
import { formatDateTimeBR } from "@/lib/formatters";

export default async function EquipePage() {
  const empresa = await getActiveCompany();
  if (!empresa) return null;

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("company_members")
    .select(`
      id, role, cost_center, invited_at, accepted_at,
      user:profiles!company_members_user_id_fkey(id, email, full_name)
    `)
    .eq("company_id", empresa.id)
    .order("invited_at", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <Badge variant="outline" className="mb-2 font-mono">
            Empresa · Equipe
          </Badge>
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Membros da equipe
          </h1>
          <p className="text-tabaco mt-1">
            {members?.length ?? 0} membro(s) ativo(s)
          </p>
        </div>
        <Button variant="accent" size="md" disabled>
          <Users className="size-4" /> Convidar membro
        </Button>
      </header>

      <div className="rounded-lg border border-line bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
            <tr>
              <th className="text-left px-4 py-3 font-display">Nome</th>
              <th className="text-left px-4 py-3 font-display">Email</th>
              <th className="text-left px-4 py-3 font-display">Função</th>
              <th className="text-left px-4 py-3 font-display">Centro de custo</th>
              <th className="text-left px-4 py-3 font-display">Entrou em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(members ?? []).map((m) => {
              const u = m.user as { email?: string; full_name?: string | null } | null;
              return (
                <tr key={m.id}>
                  <td className="px-4 py-3 text-cocoa">{u?.full_name ?? "—"}</td>
                  <td className="px-4 py-3 text-tabaco font-mono text-xs">
                    {u?.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={m.role === "admin" ? "accent" : "secondary"}>
                      {m.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-tabaco text-xs font-mono">
                    {m.cost_center ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-tabaco text-xs">
                    {formatDateTimeBR(m.invited_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-tabaco font-mono text-center">
        Convite de membros estará disponível na próxima sprint.
      </p>
    </div>
  );
}
