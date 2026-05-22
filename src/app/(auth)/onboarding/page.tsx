import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Search, FileText, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/capivara/mascot";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const nomeCurto = (profile.full_name ?? profile.email).split(" ")[0];

  return (
    <div className="w-full max-w-2xl">
      <div className="rounded-2xl border border-line bg-card p-8 md:p-12">
        <div className="flex justify-center mb-6">
          <Mascot pose="concluido" size={120} animate="idle" />
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-cocoa">
            Bem-vinda à manada, {nomeCurto}!
          </h1>
          <p className="text-tabaco mt-3 leading-relaxed max-w-md mx-auto">
            Sua conta está pronta. Agora você pode puxar capivaras quando quiser
            — sem mensalidade, sem compromisso.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          <FeatureItem
            icon={Search}
            title="Puxe qualquer histórico"
            description="CPF, CNPJ ou placa em segundos"
          />
          <FeatureItem
            icon={FileText}
            title="PDF baixável"
            description="Relatório completo na sua conta"
          />
          <FeatureItem
            icon={ShieldCheck}
            title="100% LGPD"
            description="Finalidade declarada em toda consulta"
          />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Button asChild variant="accent" size="lg">
            <Link href="/dashboard/nova-consulta">
              Puxar minha primeira capivara
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Link
            href="/dashboard"
            className="text-sm font-mono text-tabaco hover:text-fur transition-colors"
          >
            Ver painel primeiro →
          </Link>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <div className="size-10 rounded-md bg-cream flex items-center justify-center text-fur">
        <Icon className="size-5" />
      </div>
      <h3 className="font-display font-semibold text-sm text-cocoa">{title}</h3>
      <p className="text-xs text-tabaco leading-relaxed">{description}</p>
    </div>
  );
}
