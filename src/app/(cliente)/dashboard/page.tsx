import Link from "next/link";
import {
  ArrowRight,
  UserRound,
  Building2,
  CarFront,
  History,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mascot } from "@/components/capivara/mascot";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";
import { formatDateTimeBR } from "@/lib/formatters";

export default async function DashboardHome() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const supabase = await createClient();
  const { data: ultimas } = await supabase
    .from("consultations")
    .select("id, category, plan_tier, target_value, status, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count: totalCount } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id);

  const total = totalCount ?? 0;
  const nomeCurto = (profile.full_name ?? profile.email).split(" ")[0];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 font-mono">
            Painel
          </Badge>
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Olá, {nomeCurto} 👋
          </h1>
          <p className="text-tabaco mt-1">
            Pronto pra puxar mais uma capivara?
          </p>
        </div>
        <Button asChild variant="accent" size="lg">
          <Link href="/dashboard/nova-consulta">
            Nova consulta
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Consultas realizadas"
          value={total.toString()}
          desc="Desde o cadastro"
        />
        <StatCard
          title="No último mês"
          value={(ultimas?.length ?? 0).toString()}
          desc="Últimas atividades"
        />
        <StatCard
          title="Próximo passo"
          value="Espiada"
          desc="Comece pelo plano leve"
        />
      </section>

      {/* Atalhos por categoria */}
      <section>
        <h2 className="font-display text-xl font-bold text-cocoa mb-4">
          Que capivara você quer puxar agora?
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <CategoriaCard
            href="/dashboard/nova-consulta?cat=cpf"
            icon={UserRound}
            title="CPF"
            description="Pessoa física"
            cor="bg-info/15 text-info"
          />
          <CategoriaCard
            href="/dashboard/nova-consulta?cat=cnpj"
            icon={Building2}
            title="CNPJ"
            description="Empresa"
            cor="bg-sage/20 text-sage"
          />
          <CategoriaCard
            href="/dashboard/nova-consulta?cat=veicular"
            icon={CarFront}
            title="Veicular"
            description="Placa do veículo"
            cor="bg-saffron/25 text-fur"
          />
        </div>
      </section>

      {/* Últimas consultas */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-cocoa">
            Últimas consultas
          </h2>
          {ultimas && ultimas.length > 0 && (
            <Link
              href="/dashboard/historico"
              className="text-sm font-mono text-fur hover:underline underline-offset-4"
            >
              Ver tudo →
            </Link>
          )}
        </div>

        {!ultimas || ultimas.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="rounded-lg border border-line bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-cream/40 border-b border-line">
                <tr>
                  <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider text-tabaco">
                    Categoria
                  </th>
                  <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider text-tabaco">
                    Alvo
                  </th>
                  <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider text-tabaco">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-display text-xs uppercase tracking-wider text-tabaco">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ultimas.map((c) => (
                  <tr key={c.id} className="hover:bg-cream/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-cocoa uppercase font-mono">
                      {c.category}
                    </td>
                    <td className="px-4 py-3 text-sm text-cocoa font-mono">
                      {c.target_value}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-tabaco">
                      {formatDateTimeBR(c.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  desc,
}: {
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-card p-5">
      <p className="text-xs font-mono text-tabaco uppercase tracking-wider">
        {title}
      </p>
      <p className="font-display text-3xl font-bold text-cocoa mt-2">{value}</p>
      <p className="text-xs text-tabaco mt-1">{desc}</p>
    </div>
  );
}

function CategoriaCard({
  href,
  icon: Icon,
  title,
  description,
  cor,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  cor: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-lg border border-line bg-card p-5 hover:border-fur/40 hover:shadow-[var(--shadow-card)] transition-all"
    >
      <div className={`size-12 rounded-md flex items-center justify-center ${cor}`}>
        <Icon className="size-6" strokeWidth={2} />
      </div>
      <div className="flex-1">
        <h3 className="font-display text-lg font-bold text-cocoa group-hover:text-fur transition-colors">
          {title}
        </h3>
        <p className="text-xs text-tabaco">{description}</p>
      </div>
      <ArrowRight className="size-4 text-tabaco group-hover:text-fur group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "ok" | "warn" | "err" | "info" | "secondary" }> = {
    completed: { label: "Concluída", variant: "ok" },
    processing: { label: "Processando", variant: "info" },
    paid: { label: "Pago", variant: "info" },
    pending_payment: { label: "Aguardando", variant: "warn" },
    error: { label: "Erro", variant: "err" },
    expired: { label: "Expirada", variant: "secondary" },
    refunded: { label: "Reembolsada", variant: "secondary" },
  };
  const cfg = map[status] ?? { label: status, variant: "secondary" as const };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-line bg-card p-10 flex flex-col items-center text-center">
      <Mascot pose="padrao" size={80} animate="idle" />
      <h3 className="mt-4 font-display text-lg font-bold text-cocoa">
        Ainda sem capivara puxada por aqui.
      </h3>
      <p className="text-sm text-tabaco mt-1 max-w-sm">
        Quando você fizer sua primeira consulta, ela aparece aqui.
      </p>
      <Button asChild variant="accent" size="md" className="mt-5">
        <Link href="/dashboard/nova-consulta">
          <Sparkles className="size-4" />
          Fazer primeira consulta
        </Link>
      </Button>
    </div>
  );
}
