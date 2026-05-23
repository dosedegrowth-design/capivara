import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChevronRight, Webhook as WebhookIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br";

export const metadata: Metadata = {
  title: "Documentação de Webhooks · Capivara",
  description:
    "Eventos, payload, assinatura HMAC e retry policy dos webhooks da Capivara. Validação timing-safe em Node, Python, PHP e Ruby.",
  alternates: { canonical: `${SITE}/docs/webhooks` },
};

export default function WebhookDocsPage() {
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
            <WebhookIcon className="size-3 mr-1 inline" />
            Webhooks
          </Badge>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-cocoa">
            Documentação de Webhooks
          </h1>
          <p className="mt-3 text-tabaco text-lg">
            Notificação em tempo real quando algo acontece na sua conta. Assinatura HMAC-SHA256 +
            retry exponencial automático.
          </p>
        </header>

        <article className="space-y-12">
          {/* Visao geral */}
          <section>
            <H2>Como funciona</H2>
            <P>
              Você cadastra um endpoint em{" "}
              <Link href="/empresa/webhooks" className="text-fur hover:underline">
                /empresa/webhooks
              </Link>{" "}
              e escolhe quais eventos receber. Quando o evento acontece, mandamos um POST com o
              payload JSON pra essa URL, assinado com HMAC-SHA256.
            </P>
            <P>
              Você valida a assinatura do seu lado pra garantir que veio da gente, processa, e
              responde com <Code>2xx</Code>. Se der ruim, a gente tenta de novo com backoff.
            </P>
          </section>

          {/* Eventos */}
          <section>
            <H2>Eventos disponíveis</H2>
            <div className="rounded-lg border border-line bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <Th>Tipo</Th>
                    <Th>Quando dispara</Th>
                  </tr>
                </thead>
                <tbody>
                  <Row
                    type="consultation.completed"
                    desc="PDF da consulta foi gerado e signed URL está disponível"
                  />
                  <Row
                    type="consultation.failed"
                    desc="Falha em alguma API externa durante processamento. Folhas devolvidas."
                  />
                  <Row
                    type="payment.confirmed"
                    desc="Pagamento via Asaas (PIX/boleto/cartão) confirmado pra essa consulta"
                  />
                </tbody>
              </table>
            </div>
          </section>

          {/* Payload */}
          <section>
            <H2>Formato do payload</H2>
            <P>
              Todos os eventos seguem o mesmo envelope. O <Code>data</Code> varia por evento.
            </P>
            <CodeBlock>{`{
  "id": "evt_a1b2c3d4-...",       // ID único do evento
  "type": "consultation.completed",
  "created_at": "2026-05-22T15:43:00.000Z",
  "data": {
    "consultation_id": "...",
    "external_reference": "ticket-42",
    "plan_id": "cpf-investigacao",
    "category": "cpf",
    "target": "12345678900",
    "status": "completed",
    "pdf_url": "https://...supabase.co/storage/...",
    "completed_at": "2026-05-22T15:43:08.000Z"
  }
}`}</CodeBlock>
          </section>

          {/* Assinatura */}
          <section>
            <H2>Assinatura HMAC</H2>
            <P>
              Todo POST traz o header <Code>x-capivara-signature</Code> no formato:
            </P>
            <CodeBlock>{`x-capivara-signature: t=1714994580,v1=ab12cd34ef56...`}</CodeBlock>
            <P>
              Onde <Code>t</Code> é o timestamp Unix do envio e <Code>v1</Code> é o HMAC-SHA256
              hex de <Code>{`{t}.{rawBody}`}</Code> usando o secret do endpoint.
            </P>

            <H3>Validação em Node.js</H3>
            <CodeBlock>{`import crypto from "crypto";

function verifyCapivara(rawBody, sigHeader, secret) {
  const parts = sigHeader.split(",").reduce((acc, p) => {
    const [k, v] = p.split("=");
    acc[k] = v;
    return acc;
  }, {});

  const expected = crypto
    .createHmac("sha256", secret)
    .update(\`\${parts.t}.\${rawBody}\`)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(parts.v1)
  );
}

// Express
app.post("/webhooks/capivara", express.raw({ type: "*/*" }), (req, res) => {
  const sig = req.headers["x-capivara-signature"];
  if (!verifyCapivara(req.body.toString(), sig, process.env.WHSEC)) {
    return res.status(401).send("invalid signature");
  }
  const event = JSON.parse(req.body.toString());
  // processa...
  res.status(200).send("ok");
});`}</CodeBlock>

            <H3>Validação em Python</H3>
            <CodeBlock>{`import hmac, hashlib

def verify_capivara(raw_body: bytes, sig_header: str, secret: str) -> bool:
    parts = dict(p.split("=") for p in sig_header.split(","))
    expected = hmac.new(
        secret.encode(),
        f"{parts['t']}.{raw_body.decode()}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, parts["v1"])`}</CodeBlock>

            <H3>Validação em PHP</H3>
            <CodeBlock>{`function verifyCapivara($rawBody, $sigHeader, $secret) {
  $parts = [];
  foreach (explode(",", $sigHeader) as $kv) {
    [$k, $v] = explode("=", $kv);
    $parts[$k] = $v;
  }
  $expected = hash_hmac("sha256", $parts['t'] . "." . $rawBody, $secret);
  return hash_equals($expected, $parts['v1']);
}`}</CodeBlock>

            <Callout type="warning">
              Sempre use comparação <Code>timing-safe</Code> ({" "}
              <Code>timingSafeEqual</Code> /<Code>compare_digest</Code> /
              <Code>hash_equals</Code>). Não use <Code>===</Code> ou <Code>==</Code>.
            </Callout>
          </section>

          {/* Retry */}
          <section>
            <H2>Retry policy</H2>
            <P>
              Se sua URL não retornar <Code>2xx</Code> em até 15 segundos, retentamos com backoff
              exponencial:
            </P>
            <div className="rounded-lg border border-line bg-card overflow-hidden my-4">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <Th>Tentativa</Th>
                    <Th>Atraso</Th>
                  </tr>
                </thead>
                <tbody>
                  <Row type="1" desc="imediato" />
                  <Row type="2" desc="1 minuto" />
                  <Row type="3" desc="5 minutos" />
                  <Row type="4" desc="30 minutos" />
                  <Row type="5" desc="2 horas" />
                  <Row type="6" desc="6 horas" />
                  <Row type="7" desc="24 horas" />
                </tbody>
              </table>
            </div>
            <P>
              Após 6 tentativas sem sucesso, marcamos como <Code>exhausted</Code>. Você pode
              reenviar manualmente em{" "}
              <Link href="/empresa/webhooks" className="text-fur hover:underline">
                /empresa/webhooks
              </Link>
              .
            </P>
          </section>

          {/* Boas praticas */}
          <section>
            <H2>Boas práticas</H2>
            <ul className="space-y-3 text-cocoa">
              <ListItem title="Responda rápido">
                Responda <Code>200 OK</Code> em até 15s. Enfileire processamento pesado em
                background.
              </ListItem>
              <ListItem title="Idempotência no seu lado">
                Use o <Code>id</Code> do evento pra deduplicar caso retentemos um evento já
                processado.
              </ListItem>
              <ListItem title="Tolere chegada fora de ordem">
                Eventos podem chegar fora de ordem por causa de retries. Use <Code>created_at</Code> pra ordenar.
              </ListItem>
              <ListItem title="Valide o timestamp">
                Rejeite eventos com <Code>t</Code> muito antigo (ex: &gt; 5 min) pra mitigar
                replay attack.
              </ListItem>
              <ListItem title="HTTPS obrigatório">
                Não aceitamos URLs <Code>http://</Code> em produção.
              </ListItem>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl md:text-3xl font-bold text-cocoa mb-4">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="font-display text-lg font-semibold text-cocoa mt-6 mb-2">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-cocoa leading-relaxed mb-3">{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="font-mono text-xs bg-paper-2 text-fur px-1.5 py-0.5 rounded">{children}</code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="bg-cocoa text-cream p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto my-3">
      {children}
    </pre>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-2 font-mono text-xs uppercase tracking-wider text-tabaco bg-paper-2/60">
      {children}
    </th>
  );
}

function Row({ type, desc }: { type: string; desc: string }) {
  return (
    <tr className="border-t border-line/40">
      <td className="px-4 py-2 font-mono text-xs text-fur whitespace-nowrap">{type}</td>
      <td className="px-4 py-2 text-tabaco text-xs leading-relaxed">{desc}</td>
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

function ListItem({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 size-2 rounded-full bg-fur shrink-0" />
      <div className="text-sm leading-relaxed">
        <strong className="text-cocoa">{title}.</strong>{" "}
        <span className="text-tabaco">{children}</span>
      </div>
    </li>
  );
}
