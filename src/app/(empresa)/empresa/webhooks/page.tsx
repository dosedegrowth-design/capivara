import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

import { getCurrentProfile, getActiveCompany } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import {
  WebhooksClient,
  type EndpointRow,
  type DeliveryRow,
} from "./webhooks-client";

export const metadata: Metadata = {
  title: "Webhooks · Capivara",
};

export default async function WebhooksPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const empresa = await getActiveCompany();
  if (!empresa) redirect("/onboarding/empresa");

  const supabase = await createClient();

  const [{ data: epData }, { data: dlData }] = await Promise.all([
    supabase
      .from("webhook_endpoints")
      .select(
        "id, url, description, events, active, total_deliveries, total_failures, last_delivery_at, last_status_code, created_at"
      )
      .eq("company_id", empresa.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("webhook_deliveries")
      .select(
        "id, endpoint_id, event_type, event_id, status, attempts, last_status_code, last_error, delivered_at, created_at"
      )
      .eq("company_id", empresa.id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const endpoints: EndpointRow[] = (epData ?? []) as EndpointRow[];
  const deliveries: DeliveryRow[] = (dlData ?? []) as DeliveryRow[];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <Link
        href="/empresa"
        className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Painel da empresa
      </Link>

      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold text-cocoa">Webhooks</h1>
            <p className="mt-2 text-tabaco">
              Receba notificacoes em tempo real quando suas consultas ficam prontas.
              POST direto pra sua URL, com assinatura HMAC pra voce validar a origem.
            </p>
          </div>

          <WebhooksClient endpoints={endpoints} deliveries={deliveries} />
        </div>

        {/* Sidebar com docs de validacao */}
        <aside className="space-y-4 lg:sticky lg:top-8">
          <div className="rounded-lg border border-line bg-card p-5">
            <h3 className="font-display font-semibold text-cocoa mb-3 flex items-center gap-2">
              <ShieldCheck className="size-4 text-fur" />
              Validando assinatura
            </h3>
            <p className="text-xs text-tabaco leading-relaxed mb-3">
              Cada POST traz o header{" "}
              <code className="font-mono text-fur">x-capivara-signature</code> no formato{" "}
              <code className="font-mono">t=&lt;ts&gt;,v1=&lt;hex&gt;</code>.
            </p>
            <p className="text-xs text-tabaco leading-relaxed">
              Recompute HMAC-SHA256 sobre{" "}
              <code className="font-mono text-fur">{`{ts}.{rawBody}`}</code> usando o secret e
              compare com v1 (timing-safe).
            </p>
          </div>

          <div className="rounded-lg border border-line bg-cocoa text-cream p-5 font-mono text-[11px] leading-relaxed overflow-x-auto">
            <p className="text-saffron mb-2">{`// Node.js — validacao`}</p>
            <pre className="whitespace-pre-wrap">{`import crypto from "crypto";

function verify(rawBody, sigHeader, secret) {
  const [t, v1] = sigHeader.split(",")
    .reduce((acc, p) => {
      const [k,v] = p.split("=");
      acc[k] = v;
      return acc;
    }, {});
  const expected = crypto
    .createHmac("sha256", secret)
    .update(\`\${t}.\${rawBody}\`)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(v1)
  );
}`}</pre>
          </div>

          <div className="rounded-lg border border-line bg-paper/50 p-5">
            <h3 className="font-display font-semibold text-cocoa mb-2 flex items-center gap-2">
              <Lock className="size-4 text-fur" />
              Retry policy
            </h3>
            <p className="text-xs text-tabaco leading-relaxed">
              Tentamos entregar 6 vezes com backoff exponencial:{" "}
              <strong>1m, 5m, 30m, 2h, 6h, 24h</strong>. Se nao for 2xx em todas,
              marcamos como esgotada — voce pode reenviar manualmente.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
