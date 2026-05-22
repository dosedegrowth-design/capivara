import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Book, Code2 } from "lucide-react";

import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { ApiKeysClient, type ApiKeyRow } from "./api-keys-client";

export const metadata: Metadata = {
  title: "API & Integracoes · Capivara",
};

export default async function ApiPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const empresa = await getActiveCompany();
  if (!empresa) redirect("/onboarding/empresa");

  const supabase = await createClient();
  const { data } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, scopes, total_calls, last_used_at, created_at, revoked_at")
    .eq("company_id", empresa.id)
    .order("created_at", { ascending: false });

  const keys: ApiKeyRow[] = (data ?? []) as ApiKeyRow[];

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
              cobrado em folhas (creditos) da empresa.
            </p>
          </div>

          <ApiKeysClient keys={keys} />
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
  https://capivara.app/api/v1/consultations \\
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
                  Como funcionam as folhas
                </Link>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
