# Capivara · Arquitetura

> Documento técnico de referência. Leia antes de codar qualquer feature nova.
> **Marca:** Cerrado v1.0 · **Versão:** MVP-0.1 · **Última atualização:** 2026-05-21

---

## 1. Visão Geral

**Capivara** é um SaaS B2C+B2B brasileiro de consultas consolidadas de histórico
("puxar a capivara") de pessoas físicas (CPF), empresas (CNPJ) e veículos (placa).

### Modelos comerciais
- **B2C avulso:** pessoa paga uma única consulta via PIX/Boleto/Cartão à vista.
- **B2B Manada:** empresa carrega "folhas" (créditos) antecipadas e consome conforme uso.

### Stack
| Camada | Tecnologia | Plano |
|---|---|---|
| Frontend | Next.js 16 (App Router, Server Components) | Vercel Hobby |
| UI | Tailwind v4 + shadcn/ui + tokens Cerrado | - |
| Auth + DB + Storage | Supabase | Free |
| Background jobs | Supabase Edge Functions + pg_cron | Free |
| Pagamento + NF-e | Asaas | Pay-as-you-go |
| Email transacional | Resend | Free 100/dia |
| Consultas externas | API Full | Pay-per-use |
| Logs e erros | Tabela `error_logs` + Vercel Logs | - |
| Analytics | GA4 | Free |

**Decisões deliberadas:**
- **SEM Inngest** — usamos Edge Functions + pg_cron (mesmo padrão do dash-supervisao).
- **SEM Sentry** — usamos tabela `error_logs` + console + alertas críticos via Resend.
- **SEM eNotas** — Asaas emite NF-e nativo.
- **SEM PostHog** — GA4 cobre marketing; produto começa sem mapa de calor.

---

## 2. Arquitetura End-to-End

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              USUÁRIO FINAL                                │
│         (PF curiosa, lojista, despachante, financeira, advogado)         │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                  Next.js 16 (Vercel) · capivara.app                       │
│  ┌────────────┬────────────┬────────────┬────────────┬────────────┐     │
│  │ Marketing  │  Consultar │  Cliente   │  Empresa   │   Admin    │     │
│  │  (público) │  (público) │   (B2C)    │   (B2B)    │  (interno) │     │
│  └────────────┴────────────┴────────────┴────────────┴────────────┘     │
└──────────────────────────────────────────────────────────────────────────┘
        │                          │                          │
        ▼                          ▼                          ▼
┌──────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Asaas           │    │  Supabase        │    │  API Full           │
│  (PIX/Boleto/    │    │  (Auth + DB +    │    │  (CPF/CNPJ/Placa    │
│   Cartão + NF-e) │    │   Storage +      │    │   46 endpoints)     │
└──────────────────┘    │   Realtime +     │    └─────────────────────┘
        │               │   Edge Fns)      │              ▲
        │ webhook       └──────────────────┘              │
        ▼                       │                          │
┌──────────────────┐            │  trigger                 │
│  /api/asaas/     │            ▼                          │
│  webhook         │   ┌───────────────────────────┐       │
│  (Next Route)    │──▶│  Edge Function:           │       │
└──────────────────┘   │  process-consultation     │───────┘
                       │  - chama N APIs paralelo  │
                       │  - consolida resultado    │
                       │  - gera PDF (react-pdf)   │
                       │  - upload Storage         │
                       │  - notifica Realtime      │
                       └───────────────────────────┘
                                │
                                ▼
                       ┌───────────────────────────┐
                       │  Resend                   │
                       │  (email com link do PDF)  │
                       └───────────────────────────┘
```

---

## 3. Estrutura de Pastas

```
capivara/
├── src/
│   ├── app/
│   │   ├── (marketing)/         # Site público
│   │   │   ├── page.tsx         # Home B2C
│   │   │   ├── empresas/        # Landing B2B
│   │   │   ├── precos/
│   │   │   ├── como-funciona/
│   │   │   ├── lgpd/
│   │   │   └── contato/
│   │   ├── (auth)/              # Login, cadastro
│   │   ├── (cliente)/           # /dashboard, /historico, /pagamentos
│   │   ├── (empresa)/           # /empresa/* (área B2B)
│   │   ├── (admin)/             # /admin/* (painel interno DDG)
│   │   ├── consultar/           # Fluxo B2C avulso sem login obrigatório
│   │   │   ├── cpf/
│   │   │   ├── cnpj/
│   │   │   └── veicular/
│   │   ├── verificar/           # Validação pública de PDF
│   │   ├── api/
│   │   │   ├── asaas/webhook/   # Webhook do Asaas
│   │   │   └── consulta/        # Endpoints internos
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                  # shadcn/ui mapeado p/ tokens Cerrado
│   │   ├── capivara/            # Logo, Mascot, FolhaBalance
│   │   ├── consulta/            # PlanCard, ResultSection
│   │   ├── pagamento/           # PixCheckout, BoletoView
│   │   └── admin/               # Tabelas admin
│   ├── lib/
│   │   ├── supabase/            # client.ts / server.ts / admin.ts
│   │   ├── asaas/               # Cliente Asaas (PIX, Boleto, NF-e)
│   │   ├── apifull/             # Cliente API Full + retry/cache
│   │   ├── consultas/           # planos.ts (catálogo) + plan-api-map
│   │   ├── pdf/                 # Geração de PDFs com react-pdf
│   │   ├── validators/          # Zod schemas
│   │   ├── formatters/          # CPF, CNPJ, placa, BRL
│   │   ├── log/                 # logError() — substitui Sentry
│   │   ├── auth/                # Helpers de sessão
│   │   ├── lgpd/                # Finalidades, exportação, anonimização
│   │   └── anti-fraude/         # Rate limit, regras de bloqueio
│   ├── hooks/                   # React hooks
│   ├── types/                   # Types globais
│   └── middleware.ts            # Proteção de rotas + refresh sessão
├── public/
│   ├── brand/
│   │   ├── mascot/              # 5 poses do mascote (.svg)
│   │   ├── logo/                # Variações de logo
│   │   └── icons/               # 8 ícones próprios da marca
│   └── fonts/                   # backup das woff2 do brandbook
├── supabase/
│   ├── migrations/              # SQL migrations (0001_...sql)
│   └── functions/
│       └── process-consultation/  # Edge Function (Deno)
├── docs/
│   ├── ARQUITETURA.md           # este arquivo
│   ├── PLANOS_E_PRECOS.md       # catálogo congelado
│   ├── LGPD.md                  # finalidades + fluxos
│   └── API.md                   # documentação da API pública B2B
└── package.json
```

---

## 4. Modelo de Dados

### Tabelas principais

| Tabela | Conteúdo |
|---|---|
| `profiles` | extends `auth.users` — type (pf/pj_admin/pj_member/admin), CPF, telefone, asaas_customer_id |
| `companies` | CNPJ, dono, folhas_balance, plan_tier, custom_logo_url, cache_extended_days |
| `company_members` | vínculo user×company com role e cost_center |
| `consultations` | toda consulta — target, plano, status, result_jsonb, pdf_url, expira em 90d |
| `transactions` | pagamentos B2C avulso + recargas B2B com asaas_payment_id |
| `api_cache` | resultado individual de cada API Full com TTL 24h+ |
| `error_logs` | substitui Sentry — context/severity/stack |
| `audit_logs` | LGPD + ações administrativas |

### Schema completo
Ver `supabase/migrations/0001_initial_schema.sql`.

### RLS habilitado em
`profiles`, `companies`, `company_members`, `consultations`, `transactions`,
`error_logs`, `audit_logs`. `api_cache` é sempre acessada via service_role.

---

## 5. Fluxo de Consulta (end-to-end)

### B2C avulso
```
1. Visitante em /consultar/cpf escolhe plano "Avançada"
2. Frontend: input CPF formatado + dropdown finalidade LGPD obrigatória
3. POST /api/consulta/iniciar
   → cria consultations(status='pending_payment', amount_cents=3990)
   → cria customer Asaas (se primeira vez no email)
   → cria cobrança Asaas PIX/Boleto
   → retorna QR Code / Boleto pro frontend
4. Frontend mostra QR Code + polling via Supabase Realtime
5. Usuário paga PIX
6. Asaas envia webhook → POST /api/asaas/webhook
   → valida assinatura HMAC
   → atualiza consultations(status='paid', paid_at=now())
   → chama Edge Function process-consultation via HTTP fetch
7. Edge Function:
   a. Marca status='processing'
   b. Para cada API em PLAN_API_MAP[plano]:
      - Verifica api_cache (target_hash + api_name + 24h TTL)
      - Se cache hit: pula chamada, marca cache_hit=true
      - Se miss: chama API Full → salva em api_cache
   c. Consolida result_jsonb
   d. Gera PDF (via fetch p/ /api/pdf/render)
   e. Upload PDF p/ Storage signed URL
   f. UPDATE consultations(status='completed', result_jsonb, pdf_url)
8. Supabase Realtime publica mudança
9. Frontend recebe → redireciona p/ /historico/{id} (resultado)
10. Email opcional via Resend com link do PDF
```

### B2B com folhas
```
1. Operador logado em /empresa/consultar escolhe plano
2. Cliente verifica folhas_balance >= plan.custoFolhasB2B
3. POST /api/consulta/iniciar (com payment_type='folhas')
   → transação atômica:
     - INSERT consultations(status='paid', payment_type='folhas', folhas_used=X)
     - UPDATE companies SET folhas_balance = folhas_balance - X
4. Dispara Edge Function direto (sem esperar pagamento)
5. Resto idêntico ao B2C
```

### Recarga de folhas B2B
```
1. Admin da empresa em /empresa/folhas escolhe Manada Pro (R$ 500 → 650 folhas)
2. POST /api/recarga/criar
   → cria transactions(type='recharge', amount_cents=50000, folhas_added=650)
   → cria cobrança Asaas
3. Asaas confirma → webhook
4. /api/asaas/webhook (rota recarga):
   → UPDATE companies SET folhas_balance = folhas_balance + 650
   → INSERT NF-e via Asaas (auto)
   → email com NF
```

---

## 6. Sistema de Cache (24h)

### Por que cache
- Reduz chamadas pagas à API Full quando o mesmo dado é consultado várias vezes
- Padrão B2C: TTL 24h
- Padrão B2B: TTL configurável por `companies.cache_extended_days` (até 7d)

### Chave de cache
```typescript
cacheKey = sha256(api_name + ":" + target_normalized)
```

Quando consulta usa cache:
- `consultations.cache_hit = true`
- `consultations.cached_from_id = <id da consulta original>`
- Cobrança ao usuário acontece normalmente — desconto da API é margem da Capivara

### Limpeza
Cron diário no Postgres (`pg_cron`):
```sql
DELETE FROM api_cache WHERE expires_at < now();
```

---

## 7. Background Jobs (sem Inngest)

### Estratégia
Usar **Supabase Edge Functions** (Deno) chamadas via HTTP do webhook
+ **pg_cron** para retry de jobs travados.

### Edge Function: `process-consultation`
```
supabase/functions/process-consultation/index.ts
```

**Trigger:** chamada HTTP feita pelo `/api/asaas/webhook` após confirmar pagamento.

**Lógica:**
1. Recebe `{ consultationId }` no body
2. Busca consulta no banco
3. Marca `status='processing'`
4. Resolve `PLAN_API_MAP[plan_tier]` → lista de APIs
5. Para cada API:
   - Check cache → call API → save cache → consolidar
6. Gera PDF via `/api/pdf/render` (Node runtime)
7. Upload PDF para Storage
8. UPDATE consultations(status='completed', result_jsonb, pdf_url)
9. Trigger Realtime broadcast

### Cron de recuperação (pg_cron)
```sql
-- Roda a cada 5 min
SELECT cron.schedule(
  'recover-stuck-consultations',
  '*/5 * * * *',
  $$
    UPDATE consultations
    SET status = 'pending_payment'
    WHERE status = 'processing'
      AND processing_started_at < now() - interval '5 minutes';
    -- Re-disparar Edge Function pra IDs marcados
  $$
);
```

### Cron de limpeza
- Cache expirado: `DELETE FROM api_cache WHERE expires_at < now();` (1x/dia)
- Consultas expiradas: anonimização após 90d (1x/dia)

---

## 8. Integração Asaas

### Endpoints usados
| Operação | Endpoint Asaas |
|---|---|
| Criar customer | `POST /v3/customers` |
| Criar cobrança PIX | `POST /v3/payments` `{ billingType: 'PIX' }` |
| Criar cobrança Boleto | `POST /v3/payments` `{ billingType: 'BOLETO' }` |
| Criar cobrança Cartão à vista | `POST /v3/payments` `{ billingType: 'CREDIT_CARD', installmentCount: 1 }` |
| QR Code PIX | `GET /v3/payments/{id}/pixQrCode` |
| Emitir NF-e | `POST /v3/invoices` |
| Webhook | configurar em painel Asaas → `https://capivara.app/api/asaas/webhook` |

### Eventos do webhook
- `PAYMENT_CONFIRMED` — pago, processar
- `PAYMENT_RECEIVED` — recebido (similar)
- `PAYMENT_OVERDUE` — vencido, marcar `status='expired'`
- `PAYMENT_DELETED` — cancelado
- `PAYMENT_REFUNDED` — estorno, devolver folhas se aplicável

### Segurança
- Header `asaas-access-token` no webhook DEVE coincidir com `ASAAS_WEBHOOK_SECRET`
- Idempotência: salvar `asaas_payment_id` único — não processar 2x

---

## 9. Integração API Full

### Cliente
`src/lib/apifull/client.ts` — wrapper com retry exponencial (3 tentativas)
e timeout 30s por endpoint.

### 46 endpoints mapeados
Ver tabela completa em `docs/API_FULL_ENDPOINTS.md` (futuro).
Resumo dos mais usados:

**CPF:** cpf-simples, cpf-completo, cpf-ultra-completo, cred-completa-plus, serasa-premium, spc-brasil, scr-bacen, cnd-trabalhista, quod, boa-vista-essencial

**CNPJ:** cnpj-completo

**Veicular:** placa-basica, fipe, bin-nacional, bin-estadual, proprietario, gravame, recall, historico-roubo-furto, leilao, foto-leilao, crlv, vip-car, certificado-seguranca-veicular, busca-dados-placa

### Mapping Plano → APIs
`src/lib/consultas/planos.ts` exporta `PLANOS_CPF`, `PLANOS_CNPJ`, `PLANOS_VEICULAR`
com array `apisIncluidas` em cada plano.

### Tratamento de falhas
- API obrigatória falhou após retries → marca `consultations.status='error'`
  e dispara refund automático (Asaas) ou estorno de folhas
- API opcional falhou → seção do PDF mostra "Não disponível no momento"
  e log em `error_logs` (severity=warning)

---

## 10. PDFs de Relatório

### Stack
- `@react-pdf/renderer` para geração server-side
- 1 endpoint Next: `POST /api/pdf/render { consultationId }`
- Templates em `src/lib/pdf/templates/`
  - `pdf-cpf.tsx`
  - `pdf-cnpj.tsx`
  - `pdf-veicular.tsx`

### Estrutura
Cada PDF tem: Capa + Sumário + Seções (por API) + Rodapé com mascote +
QR Code apontando para `/verificar/{id}?hash=xxx`.

### White-label B2B
Se `companies.custom_logo_url` existe, troca logo no header e mantém
"powered by Capivara" no footer.

### Storage
- Bucket: `relatorios-pdf` (privado)
- Path: `{user_id}/{consultation_id}.pdf`
- Signed URL 7 dias (rotaciona automaticamente quando expira)

---

## 11. LGPD e Compliance

### Finalidades obrigatórias por consulta
- CPF: 7 opções (credit_analysis, rental_check, employment_check, ...)
- CNPJ: 6 opções
- Veicular: 6 opções

Texto livre só quando opção = "other".

### Direitos do titular implementados
| Direito | Endpoint/Página |
|---|---|
| Acesso aos dados | `/api/lgpd/export-data` → JSON via email |
| Correção | `/dashboard/configuracoes` |
| Anonimização | `/dashboard/configuracoes` → confirmação dupla |
| Portabilidade | `/api/lgpd/export-portable` → ZIP com PDFs |
| Revogação | botão em settings → suspende + agenda exclusão em 30d |

### Retenção de dados
- Consultas: 90 dias (anonimização automática via cron)
- Pagamentos: 5 anos (obrigação fiscal)
- Audit logs: 5 anos (imutável)

### DPO
- `dpo@capivara.app` (a configurar)
- Inicialmente: Lucas Cassiano

---

## 12. Anti-Fraude

### Regras (`src/lib/anti-fraude/rules.ts`)
| Regra | Threshold | Ação |
|---|---|---|
| High velocity PF | >20 consultas/h | Flag + revisão manual |
| Sequential CPFs | 5+ CPFs em sequência numérica | Block imediato |
| Same target multiple users | Mesmo CPF por 5+ users em 24h | Flag |
| Payment failures | 3+ pagamentos falhados em 24h | Suspender por 24h |
| API key abuse B2B | >1000 calls/h sem rate plan | Suspender API key |

### Storage
Tabela `fraud_alerts` (criada na migration 0002).

---

## 13. Decisões Técnicas Importantes

### Por que Supabase em vez de Postgres custom + Auth0?
- Auth + DB + Storage + Realtime + Edge Functions + pg_cron tudo no free tier
- RLS resolve segurança end-to-end
- Lucas já tem múltiplos projetos rodando lá (SPV, LNB, HL Models)

### Por que Edge Functions e não Inngest?
- Custo zero no free tier do Supabase
- Padrão já usado e validado no dash-supervisao
- Suficiente para volumes do MVP (até ~500 consultas/dia)
- Migração futura para Inngest é trivial se volume crescer

### Por que sem Sentry?
- Tabela `error_logs` + Vercel Logs cobre 95% dos casos
- Alertas críticos via Resend (email/WhatsApp)
- Adicionar quando volume justificar

### Por que "Folhas" e não "Créditos"?
- Decisão oficial do brandbook Cerrado v1.0
- Capivara come folhas — ressonância com mascote
- Internamente o backend chama `folhas_balance` e `folhas_used`

### Por que cache de 24h?
- Reduz chamadas pagas à API Full
- 24h é razoável para dados que mudam pouco (CPF, CNPJ)
- Para veicular pode esticar (dados mudam menos)
- B2B pode ter cache de 7 dias (configurável)

---

## 14. Gotchas Conhecidos

### Next.js 16
- Cookies API agora é `async` — `const cookieStore = await cookies()`
- Server Components não podem setar cookies — usar Server Action

### Supabase
- `select().single()` retorna erro se 0 ou >1 — usar `.maybeSingle()` quando aplicável
- RLS no client browser: testar com user real, não service_role
- Realtime requer `replica identity full` em tabelas para receber UPDATEs completos

### Asaas
- Sandbox e Production têm URLs diferentes — usar `ASAAS_ENV` para alternar
- Cliente PF e PJ têm campos diferentes — atenção em `cpfCnpj`
- NF-e leva alguns minutos pra emitir após pagamento

### API Full
- 404 em algumas APIs significa "sem dado", não erro
- Custo varia entre Nível 1 e Nível 2 — verificar contrato vigente
- Algumas APIs têm assincronismo (foto leilão pode demorar)

### LGPD
- Dropdown de finalidade NÃO pode ter "outros" como default — força escolha consciente
- Exportação de dados não pode incluir dados de TERCEIROS (CPFs consultados)
- Anonimização ≠ exclusão — manter dados fiscais por 5 anos

---

## 15. Como Adicionar Funcionalidades

### Adicionar nova API à consulta
1. Adicionar método em `src/lib/apifull/client.ts`
2. Atualizar `PLAN_API_MAP` em `src/lib/consultas/planos.ts`
3. Adicionar seção no template PDF correspondente
4. Atualizar `docs/PLANOS_E_PRECOS.md`

### Adicionar nova categoria (ex: Imóvel)
1. Migration: adicionar valor em check constraint de `consultations.category`
2. Criar pasta `src/app/consultar/imovel/`
3. Criar `PLANOS_IMOVEL` em `src/lib/consultas/planos.ts`
4. Criar template PDF
5. Atualizar landing pages

### Adicionar novo gateway de pagamento
Não previsto — Asaas cobre todos os casos do MVP.

---

## 16. Como Rodar Localmente

```bash
# 1. Clonar e instalar
git clone https://github.com/dosedegrowth-design/capivara.git
cd capivara
npm install

# 2. Configurar env
cp .env.example .env.local
# preencher com credenciais reais

# 3. Aplicar migrations no Supabase
# (via MCP ou Supabase CLI)

# 4. Rodar dev
npm run dev
# abre em http://localhost:3000
```

### Touchpoints úteis em dev
- Asaas sandbox: `https://sandbox.asaas.com` (criar conta separada)
- API Full sandbox: verificar com fornecedor
- Webhook Asaas em dev: usar ngrok/Cloudflare Tunnel ou Vercel preview deploys
