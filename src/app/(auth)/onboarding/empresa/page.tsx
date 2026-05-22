import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { Mascot } from "@/components/capivara/mascot";
import { getCurrentProfile } from "@/lib/auth/session";
import { CriarEmpresaForm } from "./criar-empresa-form";
import { COMPANY_TERMS } from "@/lib/legal/documents";

export default async function OnboardingEmpresaPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  // Se ja tem empresa ativa, vai direto
  if (profile.active_company_id) redirect("/empresa");

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-line bg-card p-8 md:p-10">
        <div className="flex justify-center mb-6">
          <Mascot pose="padrao" size={80} animate="idle" />
        </div>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2 text-xs font-mono text-tabaco uppercase tracking-widest">
            <Building2 className="size-3.5" />
            Conta empresarial
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-cocoa">
            Cadastre sua empresa
          </h1>
          <p className="text-sm text-tabaco mt-2 max-w-sm mx-auto">
            Vamos criar sua conta empresarial pra você consumir créditos
            com desconto, ter equipe e emitir NF-e.
          </p>
        </div>

        <CriarEmpresaForm companyTermsVersion={COMPANY_TERMS.version} />
      </div>

      <p className="text-center text-xs font-mono text-tabaco/70 mt-6">
        Toda recarga gera NF-e automaticamente. Sem mensalidade.
      </p>
    </div>
  );
}
