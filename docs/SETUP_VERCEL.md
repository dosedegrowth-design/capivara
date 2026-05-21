# Setup Vercel · Capivara

> Passo-a-passo para conectar o repo `dosedegrowth-design/capivara` ao Vercel
> e ativar deploy automático. Tempo estimado: ~3 minutos.

**Team Vercel:** Dose de Growth's projects (`dose-de-growths-projects`)
**Região:** `gru1` (São Paulo)

---

## 1. Importar o repo no Vercel

1. Abra: https://vercel.com/dose-de-growths-projects/~/new
2. Em "Import Git Repository", busque por `capivara`
3. Selecione `dosedegrowth-design/capivara`
4. Clique em **Import**

## 2. Configurar Build Settings

O `vercel.json` já define os defaults (Next.js, região gru1).
Não precisa mudar nada na tela de configuração.

## 3. Adicionar Environment Variables

Na tela "Configure Project", expandir "Environment Variables":

### Production + Preview + Development

```
NEXT_PUBLIC_SUPABASE_URL = https://hkjukobqpjezhpxzplpj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_pCmZ2N_PRxtbgzMNbbxxSQ_EGFhRd_q
SUPABASE_SERVICE_ROLE_KEY = <pegar do Supabase Dashboard, ver SETUP_SUPABASE.md>
```

### Apenas Production (deixar Preview/Dev em branco até integrar)

```
ASAAS_API_KEY = <pegar do Asaas painel>
ASAAS_ENV = production
ASAAS_WEBHOOK_SECRET = <gerar string aleatoria de 32+ chars>
APIFULL_BASE_URL = https://api.apifull.com.br
APIFULL_API_KEY = <pegar do API Full painel>
RESEND_API_KEY = <pegar do Resend painel>
RESEND_FROM_EMAIL = Capivara <ola@capivara.app>
ADMIN_NOTIFICATION_EMAIL = lucas@dosedegrowth.com.br
NEXT_PUBLIC_SITE_URL = https://capivara.vercel.app
```

### Apenas Preview/Dev (sandbox)

```
ASAAS_API_KEY = <sandbox key>
ASAAS_ENV = sandbox
NEXT_PUBLIC_SITE_URL = https://capivara-preview.vercel.app  (ou similar)
```

## 4. Deploy

Clique em **Deploy**. Primeira build leva ~2 minutos.

URL final: `https://capivara.vercel.app` (ou similar — Vercel atribui slug automaticamente).

## 5. Validar Deploy

1. Abrir a URL gerada
2. Conferir:
   - Mascote "investigando" renderiza com animação
   - Fontes (Bricolage Grotesque, Manrope) carregadas
   - Paleta Cerrado aplicada (paper de fundo, cocoa no texto)
   - Sem erros no console

## 6. Atualizar Site URL no Supabase

Após o primeiro deploy, voltar ao Supabase e adicionar a URL real do Vercel
em **Auth > URL Configuration > Redirect URLs**:

```
https://capivara.vercel.app/**
https://*.dose-de-growths-projects.vercel.app/**  (para previews)
```

---

## 🟢 Deploy automático

Toda vez que rodar `git push origin main`, o Vercel:
1. Detecta o commit
2. Roda `npm install`
3. Roda `npm run build`
4. Faz deploy em produção
5. Notifica via email/Slack se falhar

Branches != main viram **preview deploys** com URL única por commit.
Útil pra testar feature antes de fazer merge.

---

## 🆘 Troubleshooting

### Build falha com "Cannot find module '@/lib/...'"
Conferir se `tsconfig.json` tem `"baseUrl": "."` e `"paths": { "@/*": ["./src/*"] }`.
Já configurado em `tsconfig.json`.

### "Environment variable X is undefined"
Variável não foi adicionada no Vercel. Ir em Project Settings > Environment Variables.

### Build timeout
Plano Hobby tem limite de 45min/build. Se ultrapassar, otimizar:
- Reduzir dependências
- Verificar se não há loops infinitos no build
- Considerar upgrade pra Pro

### Mascote/fontes não carregam em prod mas funcionam local
Conferir se `public/brand/` foi commitado.
Conferir se `next/font/google` está sendo chamado no `layout.tsx`.

### Cache antigo aparecendo
Force redeploy: Project > Deployments > [último] > "..." > Redeploy (sem cache).
