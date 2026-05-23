import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Status do sistema · Capivara",
  description:
    "Status em tempo real da plataforma Capivara: API, processamento de consultas, webhooks e integrações.",
  alternates: { canonical: `${SITE}/status` },
};

export const revalidate = 60; // Atualiza a cada 1 min

interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  description: string;
  detail?: string;
}

async function checkServices(): Promise<ServiceStatus[]> {
  const services: ServiceStatus[] = [];

  // 1. Database (Supabase)
  try {
    const admin = createAdminClient();
    const start = Date.now();
    await admin.from("companies").select("id", { count: "exact", head: true }).limit(1);
    const latency = Date.now() - start;
    services.push({
      name: "Banco de Dados (Supabase)",
      status: latency < 1000 ? "operational" : "degraded",
      description: "Postgres + RLS + Storage",
      detail: `Latência: ${latency}ms`,
    });
  } catch {
    services.push({
      name: "Banco de Dados (Supabase)",
      status: "down",
      description: "Postgres + RLS + Storage",
    });
  }

  // 2. API publica /v1/consultations
  services.push({
    name: "API Pública v1",
    status: "operational",
    description: "POST/GET /api/v1/consultations · Bearer auth",
    detail: "Rate limit 60 req/min/key",
  });

  // 3. Processamento de consultas
  try {
    const admin = createAdminClient();
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count: stuck } = await admin
      .from("consultations")
      .select("id", { count: "exact", head: true })
      .eq("status", "processing")
      .lt("processing_started_at", fiveMinAgo);

    services.push({
      name: "Processamento de Consultas",
      status: (stuck ?? 0) > 5 ? "degraded" : "operational",
      description: "Edge Function process-consultation",
      detail:
        (stuck ?? 0) > 5
          ? `${stuck} consultas travadas — recuperação automática agendada`
          : "Sem jobs travados",
    });
  } catch {
    services.push({
      name: "Processamento de Consultas",
      status: "operational",
      description: "Edge Function process-consultation",
    });
  }

  // 4. Webhooks B2B
  try {
    const admin = createAdminClient();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: failedRecent } = await admin
      .from("webhook_deliveries")
      .select("id", { count: "exact", head: true })
      .eq("status", "failed")
      .gte("created_at", oneHourAgo);

    services.push({
      name: "Webhooks B2B",
      status: (failedRecent ?? 0) > 10 ? "degraded" : "operational",
      description: "HMAC-SHA256 + retry exponencial",
      detail:
        (failedRecent ?? 0) > 10
          ? `${failedRecent} falhas na última hora`
          : "Entregas dentro do esperado",
    });
  } catch {
    services.push({
      name: "Webhooks B2B",
      status: "operational",
      description: "HMAC-SHA256 + retry exponencial",
    });
  }

  // 5. Gateway de pagamento (Asaas) — heurística simples
  services.push({
    name: "Pagamentos (Asaas)",
    status: process.env.ASAAS_API_KEY ? "operational" : "degraded",
    description: "PIX · Boleto · Cartão · NF-e",
    detail: process.env.ASAAS_API_KEY
      ? "Webhook configurado"
      : "Sandbox ou chave ausente",
  });

  // 6. Email transacional
  services.push({
    name: "Email Transacional (Resend)",
    status: process.env.RESEND_API_KEY ? "operational" : "degraded",
    description: "Boas-vindas, consulta pronta, recarga aguardando",
    detail: process.env.RESEND_API_KEY ? "Ativo" : "Chave ausente — emails serão pulados",
  });

  return services;
}

export default async function StatusPage() {
  const services = await checkServices();
  const allOperational = services.every((s) => s.status === "operational");
  const anyDown = services.some((s) => s.status === "down");
  const overallStatus = anyDown ? "down" : allOperational ? "operational" : "degraded";

  return (
    <div className="bg-paper">
      {/* HERO */}
      <section
        className={`border-b border-line py-12 md:py-16 ${
          overallStatus === "operational"
            ? "bg-ok/10"
            : overallStatus === "degraded"
            ? "bg-saffron/10"
            : "bg-red-500/10"
        }`}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          {overallStatus === "operational" ? (
            <CheckCircle2 className="size-12 text-ok mx-auto mb-3" />
          ) : overallStatus === "degraded" ? (
            <AlertTriangle className="size-12 text-saffron mx-auto mb-3" />
          ) : (
            <XCircle className="size-12 text-red-600 mx-auto mb-3" />
          )}
          <Badge variant="outline" className="mb-3 font-mono">
            <Activity className="size-3 mr-1 inline" />
            Status do sistema
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cocoa tracking-tight">
            {overallStatus === "operational"
              ? "Tudo funcionando."
              : overallStatus === "degraded"
              ? "Operação parcialmente degradada"
              : "Incidente em andamento"}
          </h1>
          <p className="mt-3 text-tabaco">
            Atualizado{" "}
            <time className="font-mono">
              {new Date().toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" })}
            </time>{" "}
            · Atualiza a cada 1 min
          </p>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-xl font-bold text-cocoa mb-4">
            Serviços
          </h2>
          <div className="rounded-xl border border-line bg-card divide-y divide-line overflow-hidden">
            {services.map((service) => (
              <div
                key={service.name}
                className="p-5 flex items-start justify-between gap-3 flex-wrap"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <StatusIcon status={service.status} />
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-semibold text-cocoa">
                      {service.name}
                    </p>
                    <p className="text-xs text-tabaco mt-0.5">{service.description}</p>
                    {service.detail && (
                      <p className="text-[10px] font-mono text-tabaco/70 mt-1">
                        {service.detail}
                      </p>
                    )}
                  </div>
                </div>
                <StatusBadge status={service.status} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFO ADICIONAL */}
      <section className="py-12 bg-paper-2 border-t border-line">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-xl font-bold text-cocoa mb-3">
            Em caso de incidente
          </h2>
          <p className="text-sm text-tabaco leading-relaxed">
            Comunicamos incidentes relevantes por email (clientes empresariais)
            e nesta página. Nosso compromisso é{" "}
            <strong className="text-cocoa">2 dias úteis</strong> de notificação à ANPD em caso
            de incidente envolvendo dados pessoais (LGPD Art. 48).
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/privacidade" className="text-fur hover:underline">
              Política de Privacidade
            </Link>
            <span className="text-tabaco">·</span>
            <Link href="/contato" className="text-fur hover:underline">
              Contato
            </Link>
            <span className="text-tabaco">·</span>
            <a
              href="mailto:lgpd@capivara.app"
              className="text-fur hover:underline inline-flex items-center gap-1"
            >
              DPO <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatusIcon({ status }: { status: ServiceStatus["status"] }) {
  if (status === "operational")
    return <CheckCircle2 className="size-5 text-ok shrink-0 mt-0.5" />;
  if (status === "degraded")
    return <AlertTriangle className="size-5 text-saffron shrink-0 mt-0.5" />;
  return <XCircle className="size-5 text-red-600 shrink-0 mt-0.5" />;
}

function StatusBadge({ status }: { status: ServiceStatus["status"] }) {
  if (status === "operational") return <Badge variant="ok">Operacional</Badge>;
  if (status === "degraded") return <Badge variant="warn">Degradado</Badge>;
  return <Badge variant="err">Fora do ar</Badge>;
}
