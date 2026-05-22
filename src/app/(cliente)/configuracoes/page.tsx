import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/session";

import { PerfilForm } from "./_components/perfil-form";
import { SenhaForm } from "./_components/senha-form";
import { EmailForm } from "./_components/email-form";
import { ExportarBox } from "./_components/exportar-box";
import { DeletarContaBox } from "./_components/deletar-conta-box";

export const metadata = {
  title: "Configurações · Capivara",
};

export default async function ConfiguracoesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-8">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors"
      >
        <ArrowLeft className="size-4" />
        Painel
      </Link>

      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          Configurações
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">
          Sua conta
        </h1>
        <p className="text-tabaco mt-1">
          Atualize seus dados, mude email ou senha, exporte ou delete sua conta.
        </p>
      </header>

      {/* Dados pessoais */}
      <section className="rounded-lg border border-line bg-card p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-cocoa">Dados pessoais</h2>
          <p className="text-sm text-tabaco mt-1">Nome e telefone usados em emails e relatórios.</p>
        </div>
        <PerfilForm
          fullName={profile.full_name ?? ""}
          phone={profile.phone ?? ""}
        />
      </section>

      {/* Email */}
      <section className="rounded-lg border border-line bg-card p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-cocoa">Email de acesso</h2>
          <p className="text-sm text-tabaco mt-1">
            Atual: <code className="font-mono text-fur">{user?.email}</code>
          </p>
          <p className="text-xs text-tabaco mt-2">
            Mudar o email envia um link de confirmação pro novo endereço.
          </p>
        </div>
        <EmailForm />
      </section>

      {/* Senha */}
      <section className="rounded-lg border border-line bg-card p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-cocoa">Senha</h2>
          <p className="text-sm text-tabaco mt-1">
            Atualize sua senha. Mínimo 8 caracteres.
          </p>
        </div>
        <SenhaForm />
      </section>

      {/* LGPD: exportar */}
      <section className="rounded-lg border border-info/30 bg-info/5 p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-cocoa">
            Exportar meus dados (LGPD)
          </h2>
          <p className="text-sm text-tabaco mt-1">
            Direito à portabilidade (LGPD Art. 18 V). Você recebe um JSON com
            todos os dados que temos sobre você: perfil, consultas, transações.
          </p>
        </div>
        <ExportarBox />
      </section>

      {/* LGPD: deletar */}
      <section className="rounded-lg border border-red-500/30 bg-red-500/5 p-6 space-y-4">
        <div>
          <h2 className="font-display text-xl font-bold text-red-700">
            Deletar minha conta
          </h2>
          <p className="text-sm text-red-600 mt-1">
            Ação irreversível. Sua conta é removida e seus dados pessoais
            anonimizados (LGPD Art. 18 VI — direito ao esquecimento).
          </p>
        </div>
        <DeletarContaBox />
      </section>
    </div>
  );
}
