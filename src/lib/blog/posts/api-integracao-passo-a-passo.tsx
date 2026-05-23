import Link from "next/link";

export function PostAPIIntegracao() {
  return (
    <>
      <p className="lead">
        Tem sistema rodando (CRM, ERP, antifraude, painel interno) e quer integrar
        consultas de CPF/CNPJ/veicular sem o time clicando em painel? A API B2B da
        Capivara faz isso em REST com Bearer token + webhook HMAC.
      </p>

      <h2>Visão geral em 3 etapas</h2>
      <ol>
        <li><strong>Crie conta empresa</strong> e recarregue créditos no painel</li>
        <li><strong>Gere uma API key</strong> (cap_live_...) em /empresa/api</li>
        <li><strong>Faça POST</strong> em <code>/api/v1/consultations</code> com Bearer token</li>
      </ol>
      <p>
        Pronto. Quando a consulta ficar pronta, mandamos webhook com PDF anexado
        pro endpoint que você cadastrar.
      </p>

      <h2>Exemplo de chamada</h2>
      <pre><code>{`curl -X POST https://suacapivara.com.br/api/v1/consultations \\
  -H "Authorization: Bearer cap_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "plan_id": "cpf-investigacao",
    "target": "12345678900",
    "external_reference": "ticket-42",
    "cost_center": "comercial-sp"
  }'`}</code></pre>

      <h2>Resposta imediata</h2>
      <p>
        A API responde em 200-500ms com o status inicial. <strong>Não bloqueia</strong>:
        o processamento (consulta de bureaus + geração de PDF) roda em background.
      </p>
      <pre><code>{`{
  "id": "a1b2c3d4-...",
  "status": "paid",
  "category": "cpf",
  "plan_id": "cpf-investigacao",
  "target": "12345678900",
  "external_reference": "ticket-42",
  "pdf_url": null,
  "created_at": "2026-05-22T15:43:00Z"
}`}</code></pre>

      <h2>Webhook quando ficar pronta</h2>
      <p>
        Quando o PDF estiver pronto (geralmente em 5-20 segundos), mandamos POST pro
        endpoint que você cadastrou em <code>/empresa/webhooks</code>:
      </p>
      <pre><code>{`POST https://seusistema.com/webhooks/capivara
x-capivara-signature: t=1714994580,v1=ab12cd34...
x-capivara-event: consultation.completed

{
  "id": "evt_a1b2c3d4-...",
  "type": "consultation.completed",
  "data": {
    "consultation_id": "...",
    "external_reference": "ticket-42",
    "pdf_url": "https://...supabase.co/storage/.../report.pdf",
    "status": "completed"
  }
}`}</code></pre>

      <h2>Validação HMAC (timing-safe)</h2>
      <p>
        Sempre valide o header <code>x-capivara-signature</code>. Caso contrário,
        qualquer um pode forjar requisições pro seu endpoint:
      </p>
      <pre><code>{`import crypto from "crypto";

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
}`}</code></pre>

      <h2>Idempotência via external_reference</h2>
      <p>
        Envie <code>external_reference</code> com um ID único do seu lado (UUID,
        ID interno, ticket). Se você reenviar a mesma <code>external_reference</code> pra
        mesma empresa, a gente devolve a consulta existente com <strong>200 OK</strong>
        em vez de criar uma nova. Isso protege contra duplicação por:
      </p>
      <ul>
        <li>Retry de rede (timeout do seu lado)</li>
        <li>Workers concorrentes processando a mesma fila</li>
        <li>Botão clicado duas vezes na UI</li>
      </ul>

      <h2>Boas práticas em produção</h2>
      <ul>
        <li><strong>Não exponha a API key no frontend</strong> — sempre chame do servidor</li>
        <li><strong>Use external_reference</strong> em toda chamada</li>
        <li><strong>Trate webhook como source of truth</strong>, não polling em /v1/consultations/:id</li>
        <li><strong>Responda 200 OK ao webhook em até 15s</strong>, processe pesado em background</li>
        <li><strong>Reaja a 429</strong> (rate limit) com backoff exponencial</li>
        <li><strong>Monitore folhas</strong> — recarga automática quando saldo &lt; 100</li>
      </ul>

      <h2>Rate limits</h2>
      <p>
        Padrão: <strong>60 chamadas/min por chave</strong>. Aumentamos pra plano enterprise
        sem custo extra (fale com o time). Resposta 429 tem header
        <code>Retry-After: 60</code>.
      </p>

      <h2>Próximo passo</h2>
      <p>
        Leia a <Link href="/docs/api">referência completa</Link>,{" "}
        <Link href="/docs/webhooks">a doc de webhooks</Link>{" "}
        ou crie sua conta empresa e gere a primeira chave em{" "}
        <Link href="/cadastro?tipo=empresa">/cadastro</Link>.
      </p>
    </>
  );
}
