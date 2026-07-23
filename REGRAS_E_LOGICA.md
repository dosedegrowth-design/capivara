# Capivara — Regras e lógica

> Documento de contrato do projeto: **objetivo**, **regras de negócio**, **fluxos**, **decisões**, **gotchas**. Atualizar toda vez que regra mudar. Última revisão: **2026-07-23** (após auditoria completa).

Complementa (não substitui):
- `README.md` — overview
- `docs/ARQUITETURA.md` — desenho técnico
- `docs/OPERACAO.md` — runbook do dia-a-dia
- `docs/PLANOS_E_PRECOS.md` — catálogo
- `docs/AUDITORIA_2026-07-23.md` — findings + fixes

---

## 1. Objetivo

SaaS brasileiro de **consulta de histórico** de CPF, CNPJ e placa. Modelo híbrido:
- **B2C avulso** — pessoa paga uma consulta via PIX/boleto/cartão à vista. Recebe PDF por email.
- **B2B Manada** — empresa carrega saldo em R$ (com bônus), consome via API pública ou painel `/empresa/*`.

## 2. Arquitetura em uma frase

Next.js 16 (Vercel) → Supabase (auth + DB schema `capivara` + Storage + Edge Function `process-consultation` em Deno) → Asaas (pagamentos) + APIFULL (46 endpoints de consulta) + Resend (email transacional).

Schema `capivara` compartilha o projeto Supabase `DDG` (`hkjukobqpjezhpxzplpj`) com o dash-supervisao. Isolamento via schema.

## 3. Regras de negócio críticas

### 3.1 Preço e cobrança

- **Preço é server-side.** `plano.precoB2C_centavos` (B2C) e `plano.precoB2B_centavos` (B2B) vêm de `src/lib/consultas/planos.ts`. Cliente não influencia.
- **B2C paga por consulta.** Sem mensalidade.
- **B2B debita saldo R$.** Cada chamada `POST /api/v1/consultations` roda `debit_balance_cents` (RPC com `FOR UPDATE`) → se saldo < preço, 402. Nunca cobra APIFULL sem saldo disponível.
- **B2C métodos aceitos:** `pix | boleto | cartao_avista`. **NUNCA** `folhas` ou `balance_cents` (whitelist estrita em `PAYMENT_TYPES_B2C`).
- **Cache 24h honesto.** Se o mesmo user consultar mesmo `(target, plano)` em 24h e a consulta anterior está `completed`, reusa sem cobrar. Validado antes de criar cobrança em `iniciarConsultaAction`.
- **Cache APIFULL desacoplado de plano.** `target_hash = sha256(targetNormalized)` puro — 2 planos diferentes reusam mesma resposta da APIFULL.

### 3.2 Refund

- **Refund automático:** se a Edge `process-consultation` termina com 0 sucessos, `performRefund` roda com `reason='no_data_found'` (total).
- **Refund parcial automático:** se >=1 API sucedeu e >=1 falhou, `performRefund` proporcional (`failCount / totalApis * amount_cents`).
- **Refund manual admin:** `refundConsultationAction` no `/admin/consultas`. Exige motivo min 5 chars. Grava `audit_logs` (LGPD Art. 37).
- **Canal:**
  - B2C: `refundPayment` do Asaas (idempotente — trata "already refunded" como sucesso).
  - B2B: RPC `add_balance_cents` (re-crédito).
- **Transação de refund:** insere row `type='refund' status='refunded' payment_method='balance_cents'|pix|boleto|cartao_avista`.
- **Refund parcial mantém status da consulta** (não vira `refunded`). Só o total marca `status='refunded'`.

### 3.3 LGPD

- **Finalidade obrigatória.** Enum `finalidadeCPFSchema` / `finalidadeCNPJSchema` / `finalidadeVeicularSchema`. `other` exige descrição ≥20 chars (`superRefine`).
- **Consentimento versionado.** `CONSULTATION_RESPONSIBILITY.version` gravado em `consent_logs` (append-only, com hash SHA-256 do texto e IP+UA). Server valida versão do client — divergência aborta.
- **PII em URL: NÃO.** Só UUIDs. CPF/CNPJ/placa não aparecem em search params nem em histórico do browser.
- **Admin acesso PII:** target mascarado por default (`123.***.***-99`). Botão "revelar" chama `revealTargetAction` que grava `audit_logs` antes de retornar dado.
- **Delete conta:** anonimização (não delete), preserva registros pra compliance. Exige senha (re-auth via `signInWithPassword`).
- **Cron `capivara-anonymize-old`:** anonimiza consultas > 90d automaticamente.

### 3.4 Segurança

- **Signup NÃO promove admin.** Trigger `handle_new_user` força `account_type='pf'`. Promoção só via server action com service_role.
- **RLS ligada** em tudo que tem dados de usuário (`profiles`, `companies`, `company_members`, `consultations`, `transactions`, `error_logs`, `audit_logs`, `fraud_alerts`, `api_keys`, `webhook_endpoints`, `webhook_deliveries`, `company_invites`, `api_cache`, `asaas_webhook_events`).
- **`api_cache` isolada.** RLS + REVOKE de authenticated/anon. Só service_role.
- **Timing-safe compare** em todo token de rota interna (`isInternalKeyValid`, `safeEqual` do webhook Asaas).
- **INTERNAL_WEBHOOK_SECRET dedicado** (não reusa `SERVICE_ROLE_KEY`). Fallback legado imprime warning.
- **HMAC de webhook de saída** (B2B) com `t=<timestamp>` + `v1=<signature>` no header. `src/lib/webhooks/index.ts`.
- **API pública B2B** com key hash SHA-256 (nunca plaintext salvo). Mensagem de auth colapsada em `unauthorized` (sem vazar estado da key).
- **SSRF guard** em `webhook_endpoints.url`: exige `https://`, bloqueia IPs privados (RFC1918, loopback, link-local), hostnames locais. `src/lib/webhooks/ssrf-guard.ts`.
- **Rate limit sliding-window** em memória por api_key (60 req/min default). Aplicado em POST/GET/[id] da API v1 + form contato (3/h por IP).

### 3.5 Anti-fraude

- `check_fraud_rules` RPC roda ANTES de criar cobrança em `iniciarConsultaAction`. Retorna `OK|FLAG|BLOCK`.
- Regras:
  - `high_velocity`: >20 consultas/1h → FLAG
  - `same_target_hot`: 5+ users diferentes consultam mesmo target em 24h → FLAG (info)
  - `payment_failures`: 3+ pagamentos expirados/cancelados em 24h → BLOCK
  - `extreme_velocity`: >50 consultas/24h → BLOCK

## 4. Fluxos de dados principais

### 4.1 B2C avulso — consulta CPF/CNPJ/veicular

```
1. Cliente escolhe plano em /consultar/[cat]/[plano]
2. Preenche form → iniciarConsultaAction
   ├── Valida target (CPF/CNPJ/placa com dígito verificador)
   ├── Whitelist payment_type B2C
   ├── Valida responsibilityVersion server × client
   ├── Cache 24h check → se hit, retorna consulta anterior
   ├── check_fraud_rules → aborta se BLOCK
   ├── INSERT consultations (status='pending_payment')
   ├── logConsent (LGPD append-only)
   ├── Asaas createPayment (PIX/boleto/cartão)
   ├── UPDATE consultations com asaas_payment_id
   └── INSERT transactions (status='pending')
3. Cliente vê QR code em /consultar/aguardando/[id]
4. Cliente paga → Asaas envia webhook PAYMENT_CONFIRMED
5. /api/asaas/webhook
   ├── Dedup por event_id via asaas_webhook_events (idempotência)
   ├── Valida payment.value >= amount_cents (anti-fraude)
   ├── UPDATE consultations status='paid', paid_at=coalesce(paid_at, now())
   ├── dispatchEvent B2B payment.confirmed (se company_id)
   └── Dispara Edge Function process-consultation (com timeout 5s)
6. Edge process-consultation
   ├── Guard status='paid'
   ├── Marca status='processing'
   ├── Pra cada API do plano: cache read → reserve (_pending) → APIFULL → upsert
   ├── Consolida result_jsonb
   ├── Se successCount=0: refund total via /api/consultations/refund
   ├── Se sucesso parcial: refund proporcional + render PDF
   ├── Se sucesso total: render PDF
   └── EdgeRuntime.waitUntil garante dispatch pós-response
7. /api/pdf/render
   ├── @react-pdf renderToBuffer
   ├── Upload path {user_id}/{consultation_id}.pdf pro bucket capivara-relatorios-pdf
   ├── Grava PATH em consultations.pdf_url (NÃO signed URL — 15min sob demanda em /historico)
   ├── Signed URL 3d pra email
   └── Envia email "consulta pronta" + dispatchEvent consultation.completed
```

### 4.2 B2B recarga de saldo

```
1. Admin da empresa escolhe pacote em /empresa/creditos
2. iniciarRecargaAction
   ├── Guard role='admin'
   ├── INSERT transaction (status='pending', asaas_payment_id NULL) — ANTES de Asaas
   ├── createPayment Asaas com externalReference recharge:{empresa}:{pacote}
   └── UPDATE transaction com payment.id + qrcode + due_date
3. Cliente paga → webhook PAYMENT_CONFIRMED
4. /api/asaas/webhook (branch recharge:*)
   ├── Dedup event_id
   ├── Valida valor >= amount_cents
   ├── UPDATE transaction status='paid'
   └── RPC add_balance_cents (soma saldoTotalCentavos ao balance_cents)
```

### 4.3 B2B API pública

```
1. Cliente faz POST /api/v1/consultations
   Header: Authorization: Bearer cap_live_*
2. Route
   ├── validateApiKey (hash SHA-256 lookup)
   ├── checkRateLimit sliding-window (60/min default)
   ├── check scope consultations:write
   ├── Valida target + plano
   ├── Idempotência por external_reference
   ├── Check saldo balance_cents >= precoB2B_centavos
   ├── RPC debit_balance_cents (atômico)
   ├── INSERT consulta (status='paid' — saldo já debitado)
   └── Dispara Edge Function process-consultation
```

## 5. Decisões arquiteturais + motivo

- **Multi-schema DDG × capivara**: economia (2 projetos Supabase free). Isolamento via schema. `capivara` deve estar em Exposed Schemas.
- **SEM Sentry**: usar `error_logs` (tabela) + `console.error` + Resend pra severidade `critical`.
- **SEM Inngest**: Edge Functions + pg_cron. Mesmo padrão do dash-supervisao.
- **SEM eNotas**: NF-e ficou fora do escopo (claim removida do marketing 2026-07-23).
- **Deno Edge Function** (não Node Route): a Edge tem cold start rápido + roda perto do banco. `EdgeRuntime.waitUntil` pra fire-and-forget.
- **`INTERNAL_WEBHOOK_SECRET`** dedicado: se `SERVICE_ROLE_KEY` vaza (log, error trace), é takeover do banco. Bearer interno rotacionável.
- **Cache TTL sincronizado em 3 lugares** (`src/lib/apifull/mapping.ts`, Edge inline, `docs/OPERACAO.md`): Deno não tem acesso ao bundle Next. Manter as 3 fontes atualizadas manualmente.
- **PDF path (não URL) em `consultations.pdf_url`**: signed URL de 7d era vazamento de 7d. Agora só 15min sob demanda em `/historico/[id]` com guard user_id.
- **Rate limit em memória (não Redis)**: MVP. Pra prod real, plugar Upstash — módulo `src/lib/rate-limit.ts` fica trivial de trocar.

## 6. Gotchas conhecidos

- **`target_hash` mudou de fórmula** em 2026-07-23: agora é `sha256(targetNormalized)` puro (era `sha256(planId:targetNormalized)`). Consultas antigas com hash velho não vão bater com cache novo — impacto: primeira consulta reprocessa APIFULL, depois entra no cache. Sem regressão de UX.
- **`PLAN_API_MAP` em 2 lugares**: `supabase/functions/process-consultation/index.ts` e `src/lib/consultas/planos.ts` (`apisIncluidas`). Sincronizar manualmente.
- **`consultations.folhas_used`** é legado. `payment_type='folhas'` idem. Deprecated em 2026-05-23; ainda presente. Não gravar em código novo — usar `balance_cents`.
- **`ASAAS_ENV` default sandbox** em `.env.example`: em prod, setar `production` explicitamente. Sem isso, cobra em sandbox com key prod → 401 silencioso.
- **`INTERNAL_WEBHOOK_SECRET` opcional (transição)**: enquanto não setar, fallback pro `SERVICE_ROLE_KEY` (log warning). Setar em prod ASAP.
- **`webhook_endpoints.secret` em plaintext**: risco médio. Migrar pra hash+KMS em iteração futura.
- **Marketing NF-e**: claim REMOVIDA de todo lugar. Se voltar a implementar de fato, atualizar `empresas/page.tsx`, `precos/page.tsx`, `como-funciona/page.tsx`, `faturamento/page.tsx`.
- **Convites de equipe**: nova rota `/aceitar-convite/[token]`. Token opaco 32 bytes hex, expira 7d.
- **PDF verificação `/verificar/[id]`**: URL usa relative Link agora (não absolute). Preview envs funcionam corretamente.

## 7. Rodar / deploy

```bash
# Local
npm install
npm run dev

# Validar antes de commit
npm run typecheck
npm run lint
npm run build

# Deploy
# 1. Migration Supabase — MCP apply_migration ou:
supabase db push
# 2. Edge Function
supabase functions deploy process-consultation
# 3. Vercel (autodeploy no push main)
git push origin main
```

## 8. Manutenção

- **Rotação de tokens**: ver `docs/OPERACAO.md` seção "Como rotacionar o token APIFULL".
- **Smoke test** com placa `BRA2E19` (canário FIPE + placa-basica sempre respondem).
- **Custo APIFULL ao vivo**: `/admin/financeiro`.
- **Regras anti-fraude**: `capivara.check_fraud_rules` no banco. Ajustar limites em migration nova.
- **Incidente PIX pago sem PDF**: fluxo de recuperação em `OPERACAO.md`.

---

## Onde EDITAR quando mudar regra

| Regra que muda | Arquivos a atualizar |
|---|---|
| Preço de plano | `src/lib/consultas/planos.ts` (única fonte) |
| APIs de um plano | `planos.ts` `apisIncluidas` + `PLAN_API_MAP` na Edge |
| Custo APIFULL | `src/lib/apifull/mapping.ts` + Edge inline + `OPERACAO.md` tabela |
| TTL de cache | mesmos 3 lugares acima |
| Regra anti-fraude | migration nova alterando `check_fraud_rules` |
| Finalidade LGPD | `src/lib/validators/index.ts` enums + `src/lib/legal/documents.ts` versão |
| Roles B2B | `company_members.role CHECK` + policies + `assertAdmin` em cada actions |
| Método de pagamento | `PAYMENT_TYPES_B2C` set + `validators` + `transactions.payment_method CHECK` |
