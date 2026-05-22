import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateTimeBR, formatCPF } from "@/lib/formatters";

export default async function AdminUsuariosPage() {
  const admin = createAdminClient();
  const { data: users } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Admin · Usuários
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Usuários cadastrados
        </h1>
        <p className="text-tabaco mt-1">
          Últimos 100 registros. {users?.length ?? 0} exibidos.
        </p>
      </header>

      <div className="rounded-lg border border-line bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream/40 text-xs uppercase tracking-wider text-tabaco">
            <tr>
              <th className="text-left px-4 py-3 font-display">Nome</th>
              <th className="text-left px-4 py-3 font-display">Email</th>
              <th className="text-left px-4 py-3 font-display">CPF</th>
              <th className="text-left px-4 py-3 font-display">Tipo</th>
              <th className="text-left px-4 py-3 font-display">Cadastrado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(users ?? []).map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-cocoa">
                  {u.full_name ?? "—"}
                </td>
                <td className="px-4 py-3 text-tabaco font-mono text-xs">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-tabaco font-mono text-xs">
                  {u.cpf ? formatCPF(u.cpf) : "—"}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={u.account_type === "admin" ? "accent" : "secondary"}>
                    {u.account_type}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-tabaco text-xs">
                  {formatDateTimeBR(u.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
