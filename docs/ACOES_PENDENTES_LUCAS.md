# 🐾 Capivara — Ações pendentes do Lucas

> **Última atualização:** 2026-08-31 · checkup geral (pós auditoria de 2026-07-23).
>
> **URL produção:** https://suacapivara.com.br
>
> Este doc lista o que DEPENDE de você (credenciais externas, decisões de negócio). Tudo que era código/infra automatizável está resolvido — ver `docs/AUDITORIA_2026-07-23.md`.

---

## 🔑 ENV VARS

### Críticas

- [x] **`INTERNAL_WEBHOOK_SECRET`** — ✅ FEITO 2026-08-31: gerado e instalado no Vercel (production + preview + development) E nos Supabase Edge Secrets. Mesmo valor também no `.env.local`.

- [ ] **`NEXT_PUBLIC_CAPIVARA_CNPJ`** — CNPJ real da DDG. Aparece em LGPD, contato, footer.
  Formato: `12.345.678/0001-99` ou 14 dígitos puros (a função `cnpjFormatado()` aplica máscara).
  Hoje o site degrada com elegância (esconde a linha do CNPJ), mas LGPD Art. 9º pede identificação do controlador — resolver antes de tráfego pago.
  ```bash
  cd ~/Antigravity/capivara
  ~/.npm-global/bin/vercel env add NEXT_PUBLIC_CAPIVARA_CNPJ production --value "XX.XXX.XXX/0001-XX" --yes
  ```

### Recomendadas

- [ ] `NEXT_PUBLIC_CAPIVARA_WA_URL` — link WhatsApp real (`https://wa.me/5511XXXXXXXXX`). Se vazio, canal não aparece na página de contato (comportamento atual).
- [ ] `NEXT_PUBLIC_CAPIVARA_TEL` — telefone real (`(11) XXXX-XXXX`). Idem.
- [x] `NEXT_PUBLIC_CAPIVARA_EMAIL` — default `contato@suacapivara.com.br` já renderiza no site. **Confirmar que essa caixa existe/recebe** (o form de contato envia pra ela via Resend).

### Verificar (você precisa CONFIRMAR os valores — vars são "sensitive", não dá pra ler via CLI)

- [x] `SUPABASE_SERVICE_ROLE_KEY` — existe no Vercel. (`.env.local` local foi corrigido em 2026-08-31 — tinha placeholder.)
- [ ] **`ASAAS_ENV`** — ⚠️ MAIS IMPORTANTE: nenhuma transação real registrada no banco (só testes de maio). Se ainda for `sandbox`, **cobrança real não roda**. Pra ir pra produção: conta Asaas prod com KYC + trocar `ASAAS_API_KEY` + `ASAAS_ENV=production` + reconfigurar webhook no painel prod do Asaas.
- [ ] **`RESEND_FROM_EMAIL`** — confirmar que usa `@suacapivara.com.br` (domínio verificado no Resend), NÃO `@capivara.app` (domínio antigo que aparecia em docs).
- [ ] `ASAAS_WEBHOOK_SECRET` / `APIFULL_API_KEY` / `RESEND_API_KEY` — existem; validar funcionamento no primeiro fluxo real.

Ver `.env.example` pra lista completa.

---

## 🚀 Deploys — ✅ TODOS FEITOS

- [x] **Migration `0013_audit_hardening_2026_07_23.sql`** — aplicada 2026-07-23 (RLS `api_cache` confirmada ativa em 2026-08-31, crons rodando limpos).
- [x] **Edge Function `process-consultation`** — v19 ACTIVE com código v3 (markers verificados 2026-08-31).
- [x] **Vercel** — autodeploy funcionando; site 100% no ar (smoke test 2026-08-31: 10/10 rotas em 200).

---

## 🎨 Decisões de UX pendentes

- [ ] **Review step antes de pagar** — Auditor recomendou tela intermediária "Confirmar: você vai consultar CPF 123.XXX.XXX-99 para finalidade X, cobrado R$ Y". Merece 1 sprint de design. Impacta LGPD Art. 8º §4º ("consentimento específico"). Sem isso, `iniciarConsultaAction` valida o que já vem do form.
- [ ] **NF-e**: as claims de "NF-e automática" foram REMOVIDAS do marketing. Se você quiser implementar de fato, é uma sprint dedicada (usar `/invoices` da Asaas). Enquanto isso, marketing fala em "Recibo baixável".
- [ ] **Rate limit externo (Upstash / Cloudflare)** — o `checkRateLimit` local funciona por instância mas não persiste entre cold starts serverless. Pra produção com tráfego real, plugar Upstash Redis.

---

## 🧪 Testes recomendados após deploy

Rodar cada um em prod (com valores reais) pra validar:

1. **Migration** — SQL Editor:
   ```sql
   -- api_cache com RLS
   SELECT relname, relrowsecurity FROM pg_class
     WHERE relname IN ('api_cache','asaas_webhook_events','company_invites');
   -- Todas devem retornar t (true).

   -- Retry count column
   SELECT column_name FROM information_schema.columns
     WHERE table_schema='capivara' AND table_name='consultations' AND column_name='retry_count';
   ```

2. **Webhook Asaas dedup** — dispare o mesmo `event.id` 2x manualmente. 2ª chamada deve retornar `{ok:true, duplicate:true}`.

3. **Rate limit API v1** — bata 61 requests com mesma key em 60s. 61ª deve retornar 429 com `Retry-After`.

4. **SSRF** — tente cadastrar webhook `http://169.254.169.254/` em `/empresa/webhooks`. Deve rejeitar `private_ip`.

5. **Admin PII audit** — acesse `/admin/consultas`, clique "revelar" num row. Verificar em `capivara.audit_logs`:
   ```sql
   SELECT * FROM capivara.audit_logs WHERE action='reveal_target_pii' ORDER BY created_at DESC LIMIT 5;
   ```

6. **Cache 24h B2C** — inicie consulta CPF X. Após completar, tente iniciar CPF X mesmo plano. Deve retornar consulta anterior sem criar cobrança.

7. **Form contato** — envie mensagem em `/contato`. Verifique chegada no email. Repita 4 vezes com o mesmo IP — 4ª deve falhar rate limit.

---

## 📋 Backlog do produto (referência)

Sprint futura, não relacionado a hardening:

| Frente | Estado |
|---|---|
| Anti-fraude blocklist (PEP, geo, device) | Pendente — dir vazio hoje |
| Rate limit externo (Upstash) | Pendente |
| NF-e Asaas real | Adiado (marketing removeu claim) |
| Review step de consulta | Pendente |
| Painel admin: quick actions extras | Ok — mínimo viável entregue |
| Delete de conta com data retention | Ok — anonimização, não delete |
| PWA offline real | Manifest existe, service worker é pending |
| Dashboards de KPI B2B (por empresa) | Existe estatística básica |

Detalhe técnico em `docs/AUDITORIA_2026-07-23.md`.

---

## ✅ JÁ FEITO (código pronto, sem ação sua)

- ✅ 15/15 findings críticos corrigidos (privilege escalation, api_cache RLS, SSRF, timing-safe, dedup event, valor payment, race, target_hash, fire-and-forget, PLAN_API_MAP, form contato, admin refund UI + mask PII)
- ✅ 15/15 findings altos corrigidos (cache 24h, refund parcial, retry_count, SSRF guard, convite real, rate limit, unauthorized opaco, ASAAS_ENV, NF-e claim removida, min(20) finalidade, guards, etc.)
- ✅ 15+ findings médios corrigidos
- ✅ Toda a stack "folhas → R$" limpa (schema validators + marketing + blog)
- ✅ Migration 0013 escrita
- ✅ Edge Function v3
- ✅ Novos arquivos: `src/lib/refund.ts`, `src/lib/auth/internal.ts`, `src/lib/webhooks/ssrf-guard.ts`, `src/lib/rate-limit.ts`, `src/lib/config.ts`, `admin/consultas/actions.ts` + `consultas-client.tsx`, `aceitar-convite/[token]/page.tsx`, `contato/actions.ts` + `contato-form.tsx`

Ver diff completo no git.
