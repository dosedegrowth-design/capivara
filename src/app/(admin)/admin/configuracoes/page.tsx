import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/session";
import { ALL_DOCUMENTS, hashDocument } from "@/lib/legal/documents";
import { PACOTES_MANADA, TODOS_PLANOS } from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

export const metadata = {
  title: "Configurações · Admin · Capivara",
};

export default async function AdminConfiguracoesPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.account_type !== "admin") redirect("/dashboard");

  const admin = createAdminClient();

  const hasResend = Boolean(process.env.RESEND_API_KEY);
  const hasAsaas = Boolean(process.env.ASAAS_API_KEY);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasSiteUrl = Boolean(process.env.NEXT_PUBLIC_SITE_URL);
  const asaasEnv = process.env.ASAAS_ENV ?? "sandbox";

  let consentLogsOk = true;
  try {
    await admin.from("consent_logs").select("id", { head: true, count: "exact" }).limit(1);
  } catch {
    consentLogsOk = false;
  }

  return (
    <div className="space-y-6">
      <header>
        <Badge variant="outline" className="mb-2 font-mono">
          <Settings className="size-3 mr-1 inline" />
          Admin
        </Badge>
        <h1 className="font-display text-3xl font-bold text-cocoa">Configurações</h1>
        <p className="text-tabaco mt-1">
          Status do sistema, configs ativas, integrações.
        </p>
      </header>

      <section className="rounded-xl border border-line bg-card p-5 space-y-3">
        <h2 className="font-display text-lg font-bold text-cocoa">
          Status do sistema
        </h2>
        <div className="grid sm:grid-cols-2 gap-2">
          <HealthRow
            label="RESEND_API_KEY"
            ok={hasResend}
            hint={hasResend ? "Email transacional ativo" : "Emails serão pulados (warning)"}
          />
          <HealthRow
            label="ASAAS_API_KEY"
            ok={hasAsaas}
            hint={hasAsaas ? `Ambiente: ${asaasEnv}` : "Cobrança não funcionará"}
          />
          <HealthRow
            label="SUPABASE_SERVICE_ROLE_KEY"
            ok={hasServiceKey}
            hint={hasServiceKey ? "Operações admin OK" : "Várias features quebrarão"}
          />
          <HealthRow
            label="NEXT_PUBLIC_SITE_URL"
            ok={hasSiteUrl}
            hint={hasSiteUrl ? process.env.NEXT_PUBLIC_SITE_URL! : "URLs em emails quebram"}
          />
          <HealthRow
            label="Tabela consent_logs"
            ok={consentLogsOk}
            hint={consentLogsOk ? "Migration 0011 aplicada" : "Aplicar migration 0011!"}
          />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-display text-lg font-bold text-cocoa mb-3">
          Documentos legais ativos
        </h2>
        <p className="text-xs text-tabaco mb-3">
          Bump de versão = força reaceite. Edite{" "}
          <code className="font-mono text-fur">src/lib/legal/documents.ts</code>{" "}
          e atualize <code className="font-mono">version</code>.
        </p>
        <div className="rounded-lg border border-line overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/60">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-tabaco">Tipo</th>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-tabaco">Versão</th>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-tabaco hidden md:table-cell">Hash SHA-256</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {Object.values(ALL_DOCUMENTS).map((doc) => (
                <tr key={doc.type}>
                  <td className="px-3 py-2 text-cocoa text-xs">{doc.title}</td>
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      v{doc.version}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 hidden md:table-cell">
                    <code className="text-[10px] font-mono text-tabaco" title={hashDocument(doc)}>
                      {hashDocument(doc).slice(0, 24)}…
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-display text-lg font-bold text-cocoa mb-3">
          Planos ({TODOS_PLANOS.length} planos)
        </h2>
        <p className="text-xs text-tabaco mb-3">
          Edite <code className="font-mono text-fur">src/lib/consultas/planos.ts</code> pra alterar preços.
        </p>
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="bg-paper-2/60">
              <tr>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-tabaco">ID</th>
                <th className="text-left px-3 py-2 text-xs font-mono uppercase tracking-wider text-tabaco">Categoria</th>
                <th className="text-right px-3 py-2 text-xs font-mono uppercase tracking-wider text-tabaco">B2C</th>
                <th className="text-right px-3 py-2 text-xs font-mono uppercase tracking-wider text-tabaco">B2B</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {TODOS_PLANOS.map((p) => (
                <tr key={p.id}>
                  <td className="px-3 py-2 text-xs">
                    <code className="font-mono text-fur">{p.id}</code>
                  </td>
                  <td className="px-3 py-2 text-xs text-tabaco uppercase">{p.categoria}</td>
                  <td className="px-3 py-2 text-right text-xs font-mono">
                    {formatBRL(p.precoB2C_centavos)}
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-mono text-fur">
                    {formatBRL(p.precoB2B_centavos)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-display text-lg font-bold text-cocoa mb-3">
          Pacotes Manada (B2B)
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PACOTES_MANADA.map((p) => (
            <div key={p.id} className="rounded-md border border-line p-3">
              <p className="font-display font-bold text-cocoa">{p.nome}</p>
              <p className="text-xl font-bold text-cocoa mt-1">
                {formatBRL(p.valor_centavos)}
              </p>
              <p className="text-[11px] font-mono text-tabaco mt-1">
                +{p.bonusPercent}% bônus
              </p>
              <p className="text-[11px] font-mono text-fur mt-0.5">
                = {formatBRL(p.saldoTotal_centavos)} de saldo
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-display text-lg font-bold text-cocoa mb-3">
          Regras anti-fraude ativas
        </h2>
        <p className="text-xs text-tabaco mb-3">
          Implementadas em <code className="font-mono text-fur">capivara.check_fraud_rules()</code>.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <AlertCircle className="size-4 text-saffron mt-0.5 shrink-0" />
            <span className="text-cocoa">
              <strong>High velocity</strong> — &gt; 20 consultas/hora pelo mesmo usuário gera alerta médio
            </span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="size-4 text-saffron mt-0.5 shrink-0" />
            <span className="text-cocoa">
              <strong>Same target multi-user</strong> — mesmo target consultado por 5+ usuários em 24h
            </span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="size-4 text-saffron mt-0.5 shrink-0" />
            <span className="text-cocoa">
              <strong>Failed payments</strong> — 3+ pagamentos falhados em 7d bloqueia (BLOCK)
            </span>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="font-display text-lg font-bold text-cocoa mb-3">
          Cron jobs (pg_cron)
        </h2>
        <ul className="space-y-2 text-sm">
          <CronRow name="capivara-cleanup-cache" schedule="0 3 * * *" desc="Apaga api_cache expirado" />
          <CronRow name="capivara-anonymize-old" schedule="0 4 * * *" desc="Anonimiza consultas > 90d (LGPD)" />
          <CronRow name="capivara-recover-stuck" schedule="*/5 * * * *" desc="Recupera jobs travados em processing > 5min" />
          <CronRow name="capivara-process-webhooks" schedule="* * * * *" desc="Processa fila de webhooks B2B" />
        </ul>
      </section>
    </div>
  );
}

function HealthRow({ label, ok, hint }: { label: string; ok: boolean; hint?: string }) {
  return (
    <div className="flex items-start gap-2 rounded border border-line bg-paper-2/30 px-3 py-2">
      {ok ? (
        <CheckCircle2 className="size-4 text-ok shrink-0 mt-0.5" />
      ) : (
        <XCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
      )}
      <div className="text-xs">
        <p className="text-cocoa font-mono font-medium">{label}</p>
        {hint && <p className="text-tabaco mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

function CronRow({ name, schedule, desc }: { name: string; schedule: string; desc: string }) {
  return (
    <li className="flex items-start gap-3 rounded border border-line/60 bg-paper-2/30 p-3">
      <div className="flex-1 min-w-0">
        <code className="font-mono text-fur text-xs">{name}</code>
        <p className="text-xs text-cocoa mt-0.5">{desc}</p>
      </div>
      <code className="font-mono text-[10px] text-tabaco bg-cocoa text-cream px-2 py-1 rounded">
        {schedule}
      </code>
    </li>
  );
}
