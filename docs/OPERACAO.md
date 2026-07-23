# Capivara · Operação

> Runbook do dia-a-dia. Como rotacionar tokens, rodar smoke tests, ver
> custo APIFULL ao vivo, lidar com incidentes.
> **Última atualização:** 2026-07-23 (pós-auditoria)

---

## Visão geral

- **Site:** https://suacapivara.com.br
- **Painéis:**
  - `/admin` — super admin (financeiro, consultas, refunds)
  - `/cliente` — B2C (histórico do PF que comprou consulta avulsa)
  - `/empresa` — B2B (saldo Manada, equipe, API keys, créditos)
- **Stack:** Next.js 16 (Vercel) · Supabase (schema `capivara`) · Asaas
  (pagamentos) · Resend (email) · APIFULL (consultas)
- **Projeto Supabase:** `hkjukobqpjezhpxzplpj` (DDG, sa-east-1)

---

## Como rotacionar o token APIFULL

Quando precisar trocar o `APIFULL_API_KEY` (rotação periódica, suspeita
de vazamento, conta nova):

1. **Pegar token novo**
   - Logar em https://app.apifull.com.br
   - Conta > Tokens de API > "Gerar novo token"
   - Copiar (vai aparecer só uma vez)

2. **Atualizar em DOIS lugares** — Vercel (web) e Supabase (Edge Functions):

   **Vercel** (via CLI):
   ```bash
   vercel env rm APIFULL_API_KEY production
   vercel env add APIFULL_API_KEY production
   # cola o token quando pedir
   vercel --prod  # re-deploy pra pegar a env nova
   ```

   **Supabase** (Dashboard):
   - Dashboard Supabase > Project Settings > Functions > "Add new secret"
   - Nome: `APIFULL_API_KEY`
   - Valor: cola o token
   - Salvar (não precisa redeploy das functions — secret é injetado a
     cada execução)

3. **Validar que tá funcionando**
   - Rodar smoke test (próxima seção)
   - Conferir Vercel runtime logs (`/admin/financeiro` mostra custo em
     centavos vivo)
   - Após 24h, desativar o token velho no painel APIFULL

---

## Como rodar smoke test sem pagar

Pra testar a Edge Function `process-consultation` ponta-a-ponta sem
gastar Pix/cartão, criar a consulta direto no banco com `status='paid'`
e disparar a function manualmente.

### 1. Criar consulta sintética (Supabase SQL Editor)

```sql
-- Requer um user_id valido (consultations.user_id e' NOT NULL).
-- Pegar seu proprio: SELECT id FROM capivara.profiles WHERE email='seu@email' LIMIT 1;

INSERT INTO capivara.consultations (
  id,
  user_id,
  category,
  plan_tier,
  target_value,
  target_normalized,
  target_hash,
  payment_type,
  amount_cents,
  status,
  api_calls_log,
  created_at
) VALUES (
  gen_random_uuid(),
  '<SEU_USER_ID>',
  'veicular',
  'veicular-avulso-fipe',
  'BRA-2E19',
  'BRA2E19',
  encode(digest('BRA2E19', 'sha256'), 'hex'),  -- Nota: target_hash = sha256(target_normalized) puro (v3, sem plan_id)
  'pix',
  0,
  'paid',
  '["fipe","placa-basica"]'::jsonb,
  NOW()
)
RETURNING id;
```

> **Placa de teste:** `BRA2E19` (caminhão Ford 1994 — sempre retorna
> dados na FIPE/placa-basica, bom canário).

### 2. Disparar a Edge Function

```bash
SUPABASE_URL="https://hkjukobqpjezhpxzplpj.supabase.co"
SUPABASE_ANON_KEY="<NEXT_PUBLIC_SUPABASE_ANON_KEY>"
CONSULTATION_ID="<id retornado do INSERT>"

curl -i -X POST \
  "$SUPABASE_URL/functions/v1/process-consultation" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"consultationId\":\"$CONSULTATION_ID\"}"
```

### 3. Validar resultado

```sql
SELECT id, status, api_total_cost_cents, result_jsonb, api_calls_log
FROM capivara.consultations
WHERE id = '<CONSULTATION_ID>';
```

Esperado: `status='completed'`, `api_total_cost_cents > 0`, `result_jsonb`
com seções preenchidas. Se ficou `refunded`, a API não trouxe dado (placa
não cadastrada) — tenta outra placa real.

---

## Como ver custo APIFULL ao vivo

- **Dashboard interno:** `/admin/financeiro`
  - **Receita bruta** — soma de `amount_cents` em consultas `completed`
  - **Custo APIFULL** — soma de `api_total_cost_cents`
  - **Margem** — receita − custo
  - **Cache hit rate** — % de chamadas servidas do `api_cache`
  - **Por endpoint** — gráfico mostrando quanto cada API consome
- **Direto no banco:**
  ```sql
  SELECT
    DATE_TRUNC('day', created_at) AS dia,
    COUNT(*) AS consultas,
    SUM(api_total_cost_cents) / 100.0 AS custo_brl,
    SUM(amount_cents) / 100.0 AS receita_brl
  FROM capivara.consultations
  WHERE status = 'completed'
    AND created_at > NOW() - INTERVAL '30 days'
  GROUP BY 1 ORDER BY 1 DESC;
  ```

---

## Como sacar dinheiro do Asaas

Manual — não tem automação. Logar no painel Asaas:
- Sandbox: https://sandbox.asaas.com
- Produção: https://app.asaas.com

Caminho: **Financeiro > Transferências > Solicitar transferência** (PIX
ou TED). O saldo "disponível" leva 2 dias úteis pra liberar (D+2 em PIX
recebido, prazo Asaas padrão).

---

## Como ver consultas com erro

### Painel `/admin`
- Filtro por status: `error`, `refunded`, `failed`
- Lista ordenada por `created_at DESC`
- Click expande pra ver `result_jsonb._error` + `error_logs` relacionados

### SQL direto
```sql
-- Consultas que falharam total ou parcialmente
SELECT
  id,
  category,
  plan_tier,
  status,
  result_jsonb->>'_error' AS error_msg,
  result_jsonb->'_failed_apis' AS failed_apis,
  created_at
FROM capivara.consultations
WHERE status IN ('error', 'refunded')
ORDER BY created_at DESC
LIMIT 50;
```

### Logs detalhados
```sql
SELECT *
FROM capivara.error_logs
ORDER BY created_at DESC
LIMIT 100;
```

Cada falha tem contexto: rota, payload, stack trace, `consultation_id`
quando aplicável.

---

## Como gerar PDF manualmente (regen)

Quando o PDF não saiu (Resend caiu, timeout, etc.) e o cliente está
esperando:

```bash
SITE_URL="https://suacapivara.com.br"
INTERNAL_KEY="<SUPABASE_SERVICE_ROLE_KEY>"
CONSULTATION_ID="<uuid>"

curl -i -X POST "$SITE_URL/api/pdf/render" \
  -H "Content-Type: application/json" \
  -H "x-internal-key: $INTERNAL_KEY" \
  -d "{\"consultationId\":\"$CONSULTATION_ID\"}"
```

A rota é fire-and-forget no fluxo normal — quando chamada manualmente,
retorna o status do upload Supabase Storage + envio Resend.

> Pré-requisito: a consulta precisa estar `completed` com `result_jsonb`
> preenchido. Se está `error`/`refunded`, regen não vai gerar nada útil.

---

## Como verificar cache de API

```sql
-- Top endpoints mais cacheados
SELECT api_name, COUNT(*) AS entradas, SUM(hits) AS total_hits,
       MAX(expires_at) AS proximo_expira
FROM capivara.api_cache
WHERE expires_at > NOW()
GROUP BY api_name
ORDER BY total_hits DESC;

-- Cache hit rate dos últimos 7 dias (estimado via api_calls_log)
SELECT
  api,
  COUNT(*) FILTER (WHERE status = 'cached') AS cache_hits,
  COUNT(*) AS total,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'cached') / COUNT(*), 1) AS hit_rate_pct
FROM (
  SELECT jsonb_array_elements(api_calls_log) AS log
  FROM capivara.consultations
  WHERE completed_at > NOW() - INTERVAL '7 days'
) t
CROSS JOIN LATERAL jsonb_to_record(log) AS x(api text, status text)
GROUP BY api
ORDER BY total DESC;
```

### TTL por tipo de dado (calibrado em `src/lib/apifull/mapping.ts`)
- **Estável (FIPE, foto leilão):** 30 dias (720h)
- **Cadastral (BIN, CPF/CNPJ, CRLV, placa básica):** 7 dias (168h)
- **Médio (recall, roubo/furto, leilão histórico, CNDT):** 24h
- **CSV combinado (multas):** 12h
- **Volátil (proprietário, gravame):** 6h
- **Crédito (score muda):** 4h

Mudar TTL: editar `cacheTTLHours` em
`src/lib/apifull/mapping.ts` **E** em `supabase/functions/process-consultation/index.ts`
(precisa sincronizar manualmente — Edge não tem acesso ao bundle Next).
Depois re-deploy da Edge: `mcp__supabase__deploy_edge_function`.

---

## Custo APIFULL por endpoint (Nível 1 · 23/05/2026)

| Endpoint | Path APIFULL | Custo (¢) | TTL |
|---|---|---|---|
| Placa básica | `placa-basica` | 8 | 168h |
| Placa agregados | `agregados-propria` | 10 | 168h |
| FIPE | `fipe` | 11 | 720h |
| BIN Nacional | `ic-bin-nacional` | 300 | 168h |
| BIN Estadual | `ic-bin-estadual` | 276 | 168h |
| Recall | `ic-recall` | 360 | 24h |
| Gravame | `gravame` | 220 | 6h |
| Proprietário atual | `ic-proprietario-atual` | 342 | 6h |
| Roubo/Furto | `ic-historico-roubo-furto` | 360 | 24h |
| Roubo/Furto Premium | `roubo-furto` | 936 | 24h |
| Leilão histórico | `leilao` | 876 | 24h |
| Foto leilão | `ic-foto-leilao` | 1200 | 720h |
| CSV completo | `csv-renainf-renajud-recall-bin-proprietario` | 450 | 12h |
| CRLV digital | `crlv` | 2028 | 168h |
| Vip Car | `ic-vipcar` | 3120 | 24h |
| CPF Simples | `pf-dadosbasicos` | 10 | 168h |
| CPF Completo | `ic-cpf-completo` | 60 | 168h |
| CPF Ultra | `cpf-ultra` | 117 | 168h |
| CNPJ Completo | `cnpj` | 6 | 168h |
| Boa Vista | `scpc-boavista` | 323 | 4h |
| Serasa Básico | `serasa-basica` | 540 | 4h |
| Serasa Premium | `serasa-premium` | 696 | 4h |
| SPC Brasil | `spc-brasil` | 863 | 4h |
| SCR BACEN | `ic-bacen` | 936 | 4h |
| QUOD | `ic-quod` | 478 | 4h |
| Cred Completa Plus | `e-boavista` | 249 | 4h |
| CNDT | `ic-cndt` | 720 | 24h |

> Fonte: `src/lib/apifull/mapping.ts` (sincronizar com a tabela acima
> quando atualizar). 100¢ = R$ 1,00.

---

## Lista de planos × APIs

Fonte da verdade: `PLAN_API_MAP` em
`supabase/functions/process-consultation/index.ts` (linha ~506).

### CPF (B2C)
| Plano | APIs |
|---|---|
| Espiadinha | cpf-simples |
| Investigação | cpf-completo + boa-vista-essencial |
| Avançada | cpf-ultra-completo + boa-vista + serasa-basico + cred-completa-plus |
| Premium | + serasa-premium + cnd-trabalhista + quod |
| Raio-X | + spc-brasil + scr-bacen |

### CNPJ
| Plano | APIs |
|---|---|
| Espiadinha | cnpj-completo |
| Sócios | + cpf-ultra-socios + cnd-trabalhista + boa-vista |
| Premium | + cred-completa-plus + serasa-premium |
| Total | + spc-brasil + scr-bacen-socios |

### Veicular
| Plano | APIs |
|---|---|
| Espiadinha | placa-basica + fipe |
| Completo | + bin-nacional + recall |
| Avançado | + bin-estadual + proprietario-placa + gravame + roubo-furto |
| Premium | + leilao + CSV completo |
| Total | + vip-car + crlv + foto-leilao |

### Leilão (combos)
| Plano | APIs |
|---|---|
| Pré-Lance | placa-basica + fipe + leilao + foto-leilao + roubo-furto |
| Pós-Compra | placa-basica + CSV + CRLV + gravame |
| Auctioneer | + Roubo Premium + vip-car |

### Avulsos
Cada produto avulso = 1 API + `placa-basica` (suporte). Ver
`PRODUTOS_VEICULAR_AVULSO` / `PRODUTOS_LEILAO_AVULSO` em
`src/lib/consultas/planos.ts`.

---

## Resend (e-mail transacional)

- Domínio `suacapivara.com.br` já está verified no painel
  https://resend.com/domains
- From: `Capivara <ola@capivara.app>` (env `RESEND_FROM_EMAIL`)
- Templates: `src/lib/email/` (consulta concluída, refund, recarga,
  cadastro confirmado)

### Pra trocar de domínio
1. Resend dashboard > Domains > Add Domain
2. Adicionar registros DNS no Registro.br (ou onde o domínio estiver):
   - `TXT _resend._domainkey` (chave DKIM)
   - `MX send` → `feedback-smtp.us-east-1.amazonses.com` (prio 10)
   - `TXT send` → `v=spf1 include:amazonses.com ~all`
3. Aguardar Resend marcar como Verified (5-30 min)
4. Atualizar `RESEND_FROM_EMAIL` em Vercel + Supabase secrets

### Pra trocar a API key
- Resend > API Keys > Create API Key
- Atualizar `RESEND_API_KEY` em Vercel
- Não precisa rotear Edge Function (Resend só roda nas rotas API do Next)

---

## Em caso de incidente: PIX recebido mas consulta não foi gerada

Cenário: cliente reclama que pagou e não recebeu PDF.

### 1. Confirmar pagamento no Asaas
- Painel Asaas > Cobranças > buscar por CPF/email do cliente
- Status esperado: **CONFIRMADA** (PIX) ou **RECEIVED** (boleto)
- Anotar o `id` da cobrança (formato `pay_xxxxxxxx`)

### 2. Verificar consulta no banco
```sql
SELECT id, status, paid_at, asaas_payment_id, result_jsonb->>'_error' AS err
FROM capivara.consultations
WHERE asaas_payment_id = '<pay_xxxxxxxx>'
   OR customer_email = '<email>'
ORDER BY created_at DESC LIMIT 5;
```

Possíveis estados:
- `status='paid'` mas Edge nunca rodou → webhook Asaas falhou ou Edge
  estourou timeout (re-disparar — próximo passo)
- `status='processing'` há mais de 5 min → Edge travou, re-disparar
- `status='error'` → ver `error_logs`, decidir refund
- `status='refunded'` → não tinha dado na APIFULL (já tratou),
  comunicar cliente que será devolvido

### 3. Re-disparar Edge manualmente
```bash
SUPABASE_URL="https://hkjukobqpjezhpxzplpj.supabase.co"
SUPABASE_ANON_KEY="<NEXT_PUBLIC_SUPABASE_ANON_KEY>"
CONSULTATION_ID="<uuid>"

# Garante status=paid (caso esteja em processing travado)
psql ... -c "UPDATE capivara.consultations SET status='paid' WHERE id='$CONSULTATION_ID';"

curl -X POST "$SUPABASE_URL/functions/v1/process-consultation" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"consultationId\":\"$CONSULTATION_ID\"}"
```

### 4. Se a Edge gerou tudo mas o PDF não saiu
Disparar regen do PDF (seção anterior).

### 5. Última opção: refund manual
- Painel `/admin` > consulta > "Reembolsar"
- Ou rota POST `/api/consultations/refund` com `x-internal-key`
- Cliente vê crédito de volta no PIX/cartão em 1-3 dias (Asaas)

---

## Cheat sheet de URLs

| O quê | URL |
|---|---|
| Painel produção | https://suacapivara.com.br |
| Supabase Dashboard | https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj |
| Asaas Sandbox | https://sandbox.asaas.com |
| Asaas Produção | https://app.asaas.com |
| Resend | https://resend.com/emails |
| APIFULL | https://app.apifull.com.br |
| Vercel | https://vercel.com/dosedegrowth/capivara |

---

## Onde mais documentação existe

- `docs/ARQUITETURA.md` — desenho técnico (decisões + diagramas)
- `docs/PLANOS_E_PRECOS.md` — catálogo completo de combos + avulsos
- `docs/SETUP_SUPABASE.md` — bootstrap do schema
- `docs/SETUP_VERCEL.md` — deploy + envs
- `docs/ACOES_PENDENTES_LUCAS.md` — backlog operacional
- `README.md` — overview pra primeira pessoa que abre o repo
- `TESTING.md` — como rodar testes locais
