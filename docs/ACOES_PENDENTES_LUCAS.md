# 🐾 Capivara — Ações pendentes do Lucas

> **Status do projeto:** site marketing + auth + fluxo de consulta + integração Asaas **prontos no código e deployados em prod**.
> O que falta agora são **ações que dependem de pegar credenciais em sistemas externos** — só você tem acesso.
>
> **URL produção:** https://capivara-green.vercel.app

---

## ⚡ ESSENCIAL — sem isso nada funciona pra usuário logado

### 1. Pegar `SUPABASE_SERVICE_ROLE_KEY` e colocar no Vercel

A `service_role` é usada pelas Server Actions privilegiadas (criar consulta, processar webhook Asaas) e bypassa RLS. Sem ela, qualquer ação logada (cadastro→criar perfil, iniciar consulta, etc) falha com 500.

**Passos:**

1. Abra: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/settings/api-keys
2. Em **"Project API keys"** > linha `service_role` > clique no botão "Reveal"
3. Copie a chave (começa com `eyJhbGc...`)
4. No terminal:
   ```bash
   cd /Users/lucascassiano/Antigravity/capivara
   echo "COLE_A_CHAVE_AQUI" | ~/.npm-global/bin/vercel env add SUPABASE_SERVICE_ROLE_KEY production
   echo "COLE_A_CHAVE_AQUI" | ~/.npm-global/bin/vercel env add SUPABASE_SERVICE_ROLE_KEY preview
   echo "COLE_A_CHAVE_AQUI" | ~/.npm-global/bin/vercel env add SUPABASE_SERVICE_ROLE_KEY development
   ```
5. Adicione também em `.env.local` (substituir `placeholder_pegar_no_dashboard`)
6. Forçar novo deploy: `~/.npm-global/bin/vercel --prod`

⚠️ **NUNCA** comitar essa chave no git. Ela é equivalente a senha do root do banco.

---

### 2. Habilitar Auth Email no Supabase

O cadastro de usuário precisa do provedor "Email" ativo.

1. https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/auth/providers
2. **Email** > expanda > confirme que está **Enabled**
3. (Recomendado pro MVP) Desative **"Confirm email"** — assim o usuário entra direto, sem precisar abrir email pra confirmar. Pode reativar quando quiser depois.
4. Salvar

---

### 3. Configurar Redirect URLs no Supabase

1. https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/auth/url-configuration
2. **Site URL**: `https://capivara-green.vercel.app`
3. **Redirect URLs** (adicione cada uma):
   - `http://localhost:3000/**`
   - `https://capivara-green.vercel.app/**`
   - `https://capivara-*.vercel.app/**` (previews)
4. Salvar

---

## 💳 PRA PAGAMENTO REAL FUNCIONAR

### 4. Criar conta Asaas (sandbox + prod) + 3 env vars

A integração inteira está pronta. Falta só plugar a chave.

1. Sandbox: https://sandbox.asaas.com/cadastro (gratuito, ilimitado, sem KYC)
2. Após cadastro: **Integrações > API > Gerar nova chave**
3. Copie a chave (formato `$aact_YT...`)
4. No painel Asaas: **Integrações > Webhooks > Adicionar**:
   - URL: `https://capivara-green.vercel.app/api/asaas/webhook`
   - Token (header `asaas-access-token`): gere uma string aleatória 32+ chars
   - Eventos: deixe todos ligados
   - Salvar

5. No terminal:
   ```bash
   echo "$aact_YT..." | ~/.npm-global/bin/vercel env add ASAAS_API_KEY production
   echo "sandbox" | ~/.npm-global/bin/vercel env add ASAAS_ENV production
   echo "STRING_ALEATORIA_DO_WEBHOOK" | ~/.npm-global/bin/vercel env add ASAAS_WEBHOOK_SECRET production
   ~/.npm-global/bin/vercel --prod
   ```

6. Quando for pra **produção real** (precisa KYC empresa):
   - Refaça passos 1-5 em https://www.asaas.com
   - Troque as 3 env vars (`ASAAS_ENV=production`)

---

### 5. Contratar API Full + 1 env var

Sem isso, a Edge Function `process-consultation` retorna mock (placeholder JSON).

1. Acesse seu painel API Full (`apifull.com.br` ou similar)
2. Pegue o token de API
3. No terminal:
   ```bash
   echo "sua_chave_api_full" | ~/.npm-global/bin/vercel env add APIFULL_API_KEY production
   ```
4. Quando integrar de fato (próxima sprint), o código que chama o API Full vai em `src/lib/apifull/` e na Edge Function `supabase/functions/process-consultation/`.

---

### 6. Resend (você já tem conta) — só plugar a chave

Pra emails transacionais (confirmação de cadastro, recibo, link de PDF).

1. https://resend.com/api-keys > criar chave nova "Capivara"
2. No terminal:
   ```bash
   echo "re_..." | ~/.npm-global/bin/vercel env add RESEND_API_KEY production
   echo "Capivara <ola@capivara.app>" | ~/.npm-global/bin/vercel env add RESEND_FROM_EMAIL production
   ```
3. **Atenção:** se ainda não tem o domínio `capivara.app` configurado no Resend, use temporariamente:
   - `RESEND_FROM_EMAIL = onboarding@resend.dev`

---

## 🗂️ STORAGE — quando começar a gerar PDFs (próxima sprint)

### 7. Criar buckets de Storage no Supabase

1. https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/storage/buckets
2. **+ New bucket**:
   - Name: `capivara-relatorios-pdf`
   - Public: **OFF** (privado)
   - File size limit: 10 MB
3. **+ New bucket**:
   - Name: `capivara-comprovantes`
   - Public: **OFF**
   - File size limit: 5 MB

(Pode pular pra fase 9 do plano original, junto da geração de PDFs.)

---

## ✅ JÁ FEITO (você não precisa fazer nada disso)

- ✅ Supabase: 4 migrations aplicadas + schema `capivara` exposto via REST
- ✅ Edge Function `process-consultation` v1 deployada e ACTIVE
- ✅ Trigger `handle_new_user` cria perfil automaticamente no signup
- ✅ Vercel: projeto criado, conectado ao GitHub (autodeploy ativo)
- ✅ Env vars básicas configuradas (URL, anon key, site URL)
- ✅ Deploy de produção rodando em https://capivara-green.vercel.app
- ✅ 15/15 rotas testadas em prod retornando 200

---

## 🧪 Como testar end-to-end quando terminar as ações

1. Acesse `https://capivara-green.vercel.app/cadastro`
2. Crie conta (PF) com seu CPF real e email válido
3. Aceite LGPD → enviado pro `/onboarding`
4. Click em "Puxar minha primeira capivara" → vai pra `/consultar`
5. Escolha CPF → Espiadinha (R$ 9,90) → digite seu CPF → selecione finalidade "Consultar a mim mesmo" → escolha **PIX** → enviar
6. Página `/consultar/aguardando/{id}` mostra QR Code
7. Pague o PIX no Asaas sandbox (https://sandbox.asaas.com simulator)
8. Realtime atualiza para "Investigando..." e depois "Concluída"
9. Redireciona pro `/historico/{id}` com JSON mock do resultado

Se algum passo travar, conferir `error_logs` no Supabase:
```sql
SELECT * FROM capivara.error_logs ORDER BY created_at DESC LIMIT 20;
```

---

## 📞 Próximas sprints (referência)

| Sprint | Frente | O que falta no código |
|---|---|---|
| **Agora** | Conectar chaves externas | Você fazer os 7 passos acima |
| Próxima | Integração API Full real | `src/lib/apifull/client.ts` + atualizar Edge Function |
| Próxima | PDFs estilizados | `src/lib/pdf/templates/{cpf,cnpj,veicular}.tsx` com @react-pdf |
| Futura | Painel B2B (`/empresa/*`) | Multi-usuário, API REST, webhooks, NF-e |
| Futura | Painel admin (`/admin/*`) | Métricas, gestão de usuários, anti-fraude |
| Futura | LGPD operacional | Export de dados, anonimização, audit log UI |

Tudo plantado no `docs/ARQUITETURA.md` — basta seguir.
