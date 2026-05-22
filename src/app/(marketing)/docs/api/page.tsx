import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Book, ChevronRight, Webhook } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TODOS_PLANOS,
  PACOTES_MANADA,
  precoConsultaCentavos,
} from "@/lib/consultas/planos";
import { formatBRL } from "@/lib/formatters";

const PACOTE_MAIOR = PACOTES_MANADA[PACOTES_MANADA.length - 1];
const PACOTE_MENOR = PACOTES_MANADA[0];

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://capivara-green.vercel.app";

export const metadata: Metadata = {
  title: "Documentação da API · Capivara",
  description:
    "Referência completa da API REST da Capivara: autenticação, endpoints, idempotência, rate limits e códigos de erro.",
  alternates: { canonical: `${SITE}/docs/api` },
};

export default function ApiDocsPage() {
  return (
    <div className="bg-paper">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 md:py-16">
        <Link
          href="/api-publica"
          className="inline-flex items-center gap-2 text-sm text-tabaco hover:text-fur transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          API Capivara
        </Link>

        <header className="mb-10">
          <Badge variant="outline" className="mb-3 font-mono">
            Referência da API v1
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cocoa">
            Documentação da API
          </h1>
          <p className="mt-3 text-tabaco text-lg">
            Endpoints REST pra consultar CPF, CNPJ e veicular. Auth por Bearer token,
            <strong className="text-cocoa"> cobrança por consulta</strong> em créditos prepagos
            (você compra um pacote e cada chamada debita o valor da consulta).
          </p>
        </header>

        <div className="grid lg:grid-cols-[200px_1fr] gap-8">
          {/* TOC */}
          <nav className="lg:sticky lg:top-20 lg:self-start text-sm space-y-1">
            <p className="font-mono uppercase tracking-wider text-tabaco/70 text-[10px] mb-2">
              Nesta página
            </p>
            {TOC.map((t) => (
              <a
                key={t.href}
                href={t.href}
                className="block py-1 text-tabaco hover:text-fur transition-colors"
              >
                {t.label}
              </a>
            ))}
          </nav>

          <article className="space-y-12 min-w-0">
            {/* Autenticacao */}
            <section id="auth" className="scroll-mt-20">
              <H2>Autenticação</H2>
              <P>
                Toda chamada precisa do header <Code>Authorization: Bearer cap_live_…</Code>.
                Você gera a chave no painel da empresa em{" "}
                <Link href="/empresa/api" className="text-fur hover:underline">
                  /empresa/api
                </Link>
                . O hash SHA-256 da chave é o que guardamos no banco — você só vê o texto puro uma
                vez.
              </P>
              <CodeBlock>
                {`# Header padrão
Authorization: Bearer cap_live_a1b2c3d4e5f6g7h8...

# Alternativa
x-api-key: cap_live_a1b2c3d4e5f6g7h8...`}
              </CodeBlock>
              <Callout type="warning">
                Nunca exponha a chave em código frontend. Use sempre do servidor.
              </Callout>
            </section>

            {/* Base URL */}
            <section id="base-url" className="scroll-mt-20">
              <H2>Base URL</H2>
              <CodeBlock>{`https://capivara.app/api/v1`}</CodeBlock>
              <P>
                Toda resposta é <Code>application/json; charset=utf-8</Code>. Os timestamps são ISO
                8601 em UTC.
              </P>
            </section>

            {/* Endpoint POST */}
            <section id="post-consultations" className="scroll-mt-20">
              <H2>POST /consultations</H2>
              <P>
                Cria uma consulta nova. Debita o valor da consulta dos créditos da empresa.
                Retorna <Code>201 Created</Code> com o registro.
              </P>

              <H3>Request body</H3>
              <Table>
                <thead>
                  <tr>
                    <Th>Campo</Th>
                    <Th>Tipo</Th>
                    <Th>Obrigatório</Th>
                    <Th>Descrição</Th>
                  </tr>
                </thead>
                <tbody>
                  <Row
                    field="plan_id"
                    type="string"
                    required
                    desc='ID do plano (ex: "cpf-investigacao", "cnpj-premium", "veicular-total")'
                  />
                  <Row
                    field="target"
                    type="string"
                    required
                    desc="CPF (11 dígitos), CNPJ (14 dígitos) ou placa (Mercosul ou antiga)"
                  />
                  <Row
                    field="external_reference"
                    type="string"
                    desc="ID do seu lado. Reenviar a mesma ref devolve a consulta existente (idempotência)"
                  />
                  <Row
                    field="callback_url"
                    type="string"
                    desc="URL específica pra essa consulta (opcional, sobrescreve webhook global)"
                  />
                  <Row
                    field="cost_center"
                    type="string"
                    desc="Centro de custo pra relatório financeiro interno"
                  />
                  <Row
                    field="finality"
                    type="string"
                    desc='Finalidade LGPD. Default: "due_diligence"'
                  />
                </tbody>
              </Table>

              <H3>Exemplo</H3>
              <CodeBlock>
                {`curl -X POST https://capivara.app/api/v1/consultations \\
  -H "Authorization: Bearer cap_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan_id": "cpf-investigacao",
    "target": "12345678900",
    "external_reference": "ticket-42",
    "cost_center": "comercial-sp"
  }'`}
              </CodeBlock>

              <H3>Response (201)</H3>
              <CodeBlock>
                {`{
  "id": "a1b2c3d4-...",
  "status": "paid",
  "category": "cpf",
  "plan_id": "cpf-investigacao",
  "target": "12345678900",
  "external_reference": "ticket-42",
  "pdf_url": null,
  "created_at": "2026-05-22T15:43:00.000Z",
  "completed_at": null
}`}
              </CodeBlock>

              <P>
                <Code>status</Code> começa em <Code>paid</Code> (créditos já debitados) e vira{" "}
                <Code>processing</Code> → <Code>completed</Code>. Quando ficar completed, o{" "}
                <Code>pdf_url</Code> é populado e disparamos o webhook{" "}
                <Code>consultation.completed</Code>.
              </P>
            </section>

            {/* GET id */}
            <section id="get-consultation" className="scroll-mt-20">
              <H2>GET /consultations/:id</H2>
              <P>Retorna o status atual e o PDF (quando pronto).</P>
              <CodeBlock>
                {`curl https://capivara.app/api/v1/consultations/a1b2c3d4-... \\
  -H "Authorization: Bearer cap_live_..."

# Pra incluir o JSON estruturado do resultado:
curl 'https://capivara.app/api/v1/consultations/a1b2c3d4-...?include=result' \\
  -H "Authorization: Bearer cap_live_..."`}
              </CodeBlock>

              <H3>Response (200)</H3>
              <CodeBlock>
                {`{
  "id": "a1b2c3d4-...",
  "status": "completed",
  "category": "cpf",
  "plan_id": "cpf-investigacao",
  "target": "12345678900",
  "external_reference": "ticket-42",
  "pdf_url": "https://...supabase.co/storage/.../report.pdf?signed=...",
  "folhas_used": 12,
  "created_at": "2026-05-22T15:43:00.000Z",
  "completed_at": "2026-05-22T15:43:08.000Z",
  "result": {
    /* presente apenas se ?include=result */
  }
}`}
              </CodeBlock>
            </section>

            {/* GET list */}
            <section id="list-consultations" className="scroll-mt-20">
              <H2>GET /consultations</H2>
              <P>Lista paginada de consultas da empresa. Filtros opcionais por status e ref.</P>
              <Table>
                <thead>
                  <tr>
                    <Th>Query param</Th>
                    <Th>Tipo</Th>
                    <Th>Descrição</Th>
                  </tr>
                </thead>
                <tbody>
                  <Row field="limit" type="number" desc="Máx por página. Default 25, máx 100" />
                  <Row field="offset" type="number" desc="Paginação. Default 0" />
                  <Row field="status" type="string" desc="paid | processing | completed | error" />
                  <Row field="external_reference" type="string" desc="Filtra por ref específica" />
                </tbody>
              </Table>
              <CodeBlock>
                {`curl 'https://capivara.app/api/v1/consultations?status=completed&limit=50' \\
  -H "Authorization: Bearer cap_live_..."`}
              </CodeBlock>
            </section>

            {/* Status */}
            <section id="status" className="scroll-mt-20">
              <H2>Status de consulta</H2>
              <Table>
                <thead>
                  <tr>
                    <Th>Status</Th>
                    <Th>Significado</Th>
                  </tr>
                </thead>
                <tbody>
                  <Row field="paid" type="" desc="Pagamento confirmado (créditos debitados). Vai pra fila de processamento." />
                  <Row field="processing" type="" desc="Edge function rodando. Geralmente <30s." />
                  <Row field="completed" type="" desc="PDF gerado + webhook disparado. pdf_url disponível." />
                  <Row field="error" type="" desc="Falha em alguma API externa. Créditos devolvidos automaticamente." />
                </tbody>
              </Table>
            </section>

            {/* Idempotência */}
            <section id="idempotency" className="scroll-mt-20">
              <H2>Idempotência</H2>
              <P>
                Envie <Code>external_reference</Code> com um valor único do seu lado (UUID, ID
                interno, ticket, etc). Se você reenviar a mesma <Code>external_reference</Code>{" "}
                pra mesma empresa, devolvemos a consulta existente com status <Code>200 OK</Code>{" "}
                em vez de criar uma nova.
              </P>
              <Callout type="info">
                Útil pra retry de rede, timeouts e workers concorrentes. Nunca duplica cobrança em
                folhas.
              </Callout>
            </section>

            {/* Rate limits */}
            <section id="rate-limits" className="scroll-mt-20">
              <H2>Rate limits</H2>
              <P>
                Padrão: <strong>60 chamadas / minuto por chave</strong>. Configurável por chave no
                painel. Acima do limite retorna <Code>429 Too Many Requests</Code> com header{" "}
                <Code>retry-after</Code> em segundos.
              </P>
            </section>

            {/* Erros */}
            <section id="errors" className="scroll-mt-20">
              <H2>Códigos de erro</H2>
              <Table>
                <thead>
                  <tr>
                    <Th>Code</Th>
                    <Th>HTTP</Th>
                    <Th>Significado</Th>
                  </tr>
                </thead>
                <tbody>
                  <Row field="unauthorized:missing" type="401" desc="Header Authorization ausente" />
                  <Row field="unauthorized:format" type="401" desc='Chave não começa com "cap_live_"' />
                  <Row field="unauthorized:not_found" type="401" desc="Chave não existe" />
                  <Row field="unauthorized:revoked" type="401" desc="Chave foi revogada" />
                  <Row field="unauthorized:expired" type="401" desc="Chave expirou" />
                  <Row field="scope_required" type="403" desc="Chave não tem o scope necessário" />
                  <Row field="missing_fields" type="400" desc="plan_id ou target faltando" />
                  <Row field="invalid_target" type="422" desc="CPF/CNPJ/placa inválido (dígito verificador)" />
                  <Row field="plan_not_found" type="404" desc="plan_id não existe" />
                  <Row field="insufficient_credits" type="402" desc="Empresa sem créditos suficientes" />
                  <Row field="invalid_json" type="400" desc="Body não é JSON válido" />
                </tbody>
              </Table>
            </section>

            {/* IDs de plano */}
            <section id="plan-ids" className="scroll-mt-20">
              <H2>IDs de plano e preço por consulta</H2>
              <P>
                Cada chamada da API debita o valor da consulta. O preço efetivo varia
                pelo pacote de créditos comprado — colunas abaixo mostram o intervalo
                entre o pacote menor (Start) e o maior (Reserva).
              </P>
              <div className="rounded-lg border border-line bg-card overflow-hidden my-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <Th>plan_id</Th>
                      <Th>Categoria</Th>
                      <Th>R$ / consulta</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {TODOS_PLANOS.map((p) => {
                      const min = precoConsultaCentavos(p, PACOTE_MAIOR);
                      const max = precoConsultaCentavos(p, PACOTE_MENOR);
                      return (
                        <tr key={p.id} className="border-t border-line/40">
                          <td className="px-4 py-2 font-mono text-xs text-fur whitespace-nowrap">
                            {p.id}
                          </td>
                          <td className="px-4 py-2 font-mono text-xs text-tabaco">
                            {p.categoria}
                          </td>
                          <td className="px-4 py-2 text-xs text-cocoa whitespace-nowrap">
                            <strong className="text-fur font-mono">{formatBRL(min)}</strong>
                            <span className="text-tabaco/70 font-mono"> a </span>
                            <span className="font-mono">{formatBRL(max)}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs font-mono text-tabaco/70 leading-relaxed">
                Min = pacote Reserva (R$ 3.000) · Max = pacote Start (R$ 200). Mais
                consultas no pacote = menor R$/consulta.
              </p>
            </section>

            {/* Webhooks link */}
            <section className="scroll-mt-20">
              <H2>Webhooks</H2>
              <P>
                Pra receber eventos em tempo real (consulta pronta, falha, pagamento confirmado),
                cadastre um endpoint em{" "}
                <Link href="/empresa/webhooks" className="text-fur hover:underline">
                  /empresa/webhooks
                </Link>
                .
              </P>
              <Button asChild variant="secondary">
                <Link href="/docs/webhooks">
                  <Webhook className="size-4 mr-1" />
                  Documentação de webhooks
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </section>
          </article>
        </div>
      </div>
    </div>
  );
}

const TOC = [
  { href: "#auth", label: "Autenticação" },
  { href: "#base-url", label: "Base URL" },
  { href: "#post-consultations", label: "POST /consultations" },
  { href: "#get-consultation", label: "GET /consultations/:id" },
  { href: "#list-consultations", label: "GET /consultations" },
  { href: "#status", label: "Status" },
  { href: "#idempotency", label: "Idempotência" },
  { href: "#rate-limits", label: "Rate limits" },
  { href: "#errors", label: "Erros" },
  { href: "#plan-ids", label: "IDs de plano" },
];

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa mt-0 mb-4">
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-lg font-semibold text-cocoa mt-6 mb-2">{children}</h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-cocoa leading-relaxed mb-3">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-paper-2 text-fur px-1.5 py-0.5 rounded">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-cocoa text-cream p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto my-3">
      {children}
    </pre>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line bg-card overflow-hidden my-4 overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2 font-mono text-xs uppercase tracking-wider text-tabaco bg-paper-2/60">
      {children}
    </th>
  );
}

function Row({
  field,
  type,
  required,
  desc,
}: {
  field: string;
  type: string;
  required?: boolean;
  desc: string;
}) {
  return (
    <tr className="border-t border-line/40">
      <td className="px-4 py-2 font-mono text-xs text-fur">
        {field}
        {required && <span className="ml-1 text-red-600">*</span>}
      </td>
      <td className="px-4 py-2 font-mono text-xs text-tabaco">{type}</td>
      {/* Coluna "Obrigatório" so aparece em request body, mas o componente reusa pra
          outros casos colocando required em qualquer um. Simplificado: requerido = badge. */}
      {desc && (
        <td className="px-4 py-2 text-tabaco text-xs leading-relaxed" colSpan={2}>
          {desc}
        </td>
      )}
    </tr>
  );
}

function Callout({
  type,
  children,
}: {
  type: "info" | "warning";
  children: React.ReactNode;
}) {
  const styles =
    type === "warning"
      ? "border-saffron/40 bg-saffron/10 text-cocoa"
      : "border-info/40 bg-info/10 text-cocoa";
  return (
    <div className={`rounded-lg border ${styles} px-4 py-3 text-sm my-3 flex items-start gap-2`}>
      <ChevronRight className="size-4 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
