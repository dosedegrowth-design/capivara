import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Coins } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { NovaConsultaB2BForm } from "./nova-consulta-form";
import { CONSULTATION_RESPONSIBILITY } from "@/lib/legal/documents";

export const metadata = {
  title: "Nova consulta · Empresa · Capivara",
};

export default async function NovaConsultaB2BPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const empresa = await getActiveCompany();
  if (!empresa) redirect("/onboarding/empresa");

  const saldo = empresa.folhas_balance ?? 0;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 space-y-6">
      <Link
        href="/empresa"
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors"
      >
        <ArrowLeft className="size-4" />
        Painel da empresa
      </Link>

      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Badge variant="outline" className="mb-2 font-mono">
            Empresa · Nova consulta
          </Badge>
          <h1 className="font-display text-3xl font-bold text-cocoa">
            Puxar capivara
          </h1>
          <p className="text-tabaco mt-1">
            Pago com créditos da empresa. Sem passar por pagamento avulso.
          </p>
        </div>

        <div className="rounded-lg border border-fur/30 bg-fur/5 px-4 py-2 flex items-center gap-2">
          <Coins className="size-4 text-fur" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-tabaco">
              Saldo
            </p>
            <p className="font-mono font-bold text-fur">{saldo} créditos</p>
          </div>
        </div>
      </header>

      {saldo === 0 && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-4">
          <p className="text-sm text-red-700 font-semibold">Sem créditos.</p>
          <p className="text-xs text-red-600 mt-1">
            Recarregue antes de criar uma consulta.
          </p>
          <Button asChild variant="primary" size="sm" className="mt-3">
            <Link href="/empresa/creditos">Recarregar agora</Link>
          </Button>
        </div>
      )}

      <NovaConsultaB2BForm
        saldoFolhas={saldo}
        responsibilityVersion={CONSULTATION_RESPONSIBILITY.version}
      />
    </div>
  );
}
