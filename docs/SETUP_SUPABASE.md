# Setup Supabase · Capivara

> Passo-a-passo para configurar o projeto Supabase **uma única vez** após
> aplicar as migrations. Tempo estimado: ~5 minutos.

**Projeto compartilhado:** `DDG` (`hkjukobqpjezhpxzplpj`) — mesmo do `dash-supervisao`.
**Schema dedicado:** `capivara` (isolado de `public.SPV_*`).

---

## ✅ Já aplicado via MCP

- Schema `capivara` criado
- Migration `0001_initial_schema.sql` aplicada (8 tabelas + índices + RLS + policies)
- Migration `0002_admin_policies_logs.sql` aplicada (policies admin de logs)
- Advisors de segurança: 0 erros

---

## 🟡 Pendente — Configuração manual no Dashboard

### 1. Expor o schema `capivara` na API REST (PostgREST)

Sem isso, o `supabase-js` retorna 404 ao tentar acessar tabelas do schema custom.

1. Abra: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/settings/api
2. Em **"Exposed schemas"**, adicione `capivara` (mantenha `public` também)
3. Em **"Extra search path"**, adicione `capivara` antes de `public`
4. Clique em **Save**

> Após salvar, a API REST passa a aceitar requisições para `/rest/v1/profiles`
> resolvendo para `capivara.profiles`. O `db: { schema: 'capivara' }` nos
> clients (`src/lib/supabase/*.ts`) garante que toda query aponta para lá.

### 2. Pegar a service_role key

1. Mesma página do passo 1, role até **"Project API keys"**
2. Copie a chave `service_role` (clique no botão "reveal")
3. Cole em `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
   ```

⚠️ **NUNCA** comitar essa chave. Ela bypassa RLS.

### 3. Configurar Auth Providers

1. Abra: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/auth/providers
2. **Email**: já vem ativo. Confirmar:
   - "Confirm email" → desativado (cadastro instantâneo no MVP)
   - "Secure email change" → ativado
3. **Google** (opcional, fase 4):
   - Ativar provider
   - Configurar Client ID + Secret no Google Cloud
   - Authorized redirect URI: `https://hkjukobqpjezhpxzplpj.supabase.co/auth/v1/callback`

### 4. Configurar URL de redirecionamento

1. Abra: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/auth/url-configuration
2. **Site URL**: `http://localhost:3000` (dev) ou `https://capivara.app` (prod)
3. **Redirect URLs** (whitelist):
   - `http://localhost:3000/**`
   - `https://capivara.vercel.app/**`
   - `https://capivara.app/**` (quando comprar domínio)

### 5. Criar buckets de Storage

1. Abra: https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/storage/buckets
2. Criar bucket `capivara-relatorios-pdf`:
   - Privado (não público)
   - File size limit: 10 MB
3. Criar bucket `capivara-comprovantes`:
   - Privado
   - File size limit: 5 MB

> Prefixo `capivara-` evita colisão com buckets do dash-supervisao.

### 6. (Opcional) Configurar email templates

Personalizar emails de signup, recuperação de senha, magic link em:
https://supabase.com/dashboard/project/hkjukobqpjezhpxzplpj/auth/templates

Templates seguem o tom Capivara — ver `docs/EMAIL_TEMPLATES.md` (a criar Fase 3).

---

## 🧪 Validar que tudo funcionou

Após configurar os passos acima, rode no terminal:

```bash
curl 'https://hkjukobqpjezhpxzplpj.supabase.co/rest/v1/profiles?select=id&limit=1' \
  -H 'apikey: sb_publishable_pCmZ2N_PRxtbgzMNbbxxSQ_EGFhRd_q' \
  -H 'Accept-Profile: capivara'
```

**Esperado:** `[]` (array vazio, tabela existe sem dados).
**Se 404:** schema não foi exposto. Refazer passo 1.

---

## 📌 Padrão para futuras migrations

1. Criar arquivo `supabase/migrations/000N_nome_descritivo.sql`
2. Todas as tabelas/funções devem ser prefixadas com `capivara.`
3. Aplicar via MCP: `mcp__supabase__apply_migration` com `project_id=hkjukobqpjezhpxzplpj`
4. Verificar advisors após: `mcp__supabase__get_advisors`
5. Commitar o `.sql` no repo

**Nunca editar uma migration já aplicada** — criar nova migration de correção.

---

## 🆘 Troubleshooting

### Erro "relation does not exist"
Esqueceu de configurar `db: { schema: 'capivara' }` no client.
Ver `src/lib/supabase/{client,server,admin}.ts`.

### Erro 404 PGRST106 "schema must be one of the following"
Schema não exposto. Passo 1 acima.

### Erro "permission denied for schema capivara"
Grants faltando. Re-aplicar migration 0001 ou executar:
```sql
GRANT USAGE ON SCHEMA capivara TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA capivara
  TO authenticated, service_role;
```

### Auth funcionando mas RLS bloqueando inserts
Conferir se `auth.uid()` retorna o ID esperado:
```sql
SELECT auth.uid();
```
Se NULL, sessão não está sendo passada — conferir middleware (`src/proxy.ts`).
