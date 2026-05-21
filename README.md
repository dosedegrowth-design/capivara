# Capivara

> Puxe a capivara antes de fechar negócio.

SaaS brasileiro de consultas de histórico de pessoas (CPF), empresas (CNPJ) e
veículos (placa). Modelo híbrido B2C avulso + B2B com carteira de "folhas"
(créditos).

**Status:** MVP em desenvolvimento · **Versão:** 0.1.0 · **Stack:** Next.js 16 + Supabase + Asaas

---

## Por onde começar

1. **Leia `docs/ARQUITETURA.md`** antes de qualquer feature nova.
2. Cole `.env.example` em `.env.local` e preencha as credenciais.
3. Rode `npm install && npm run dev`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind v4 + shadcn/ui + tokens **Cerrado** |
| Auth + DB + Storage | Supabase (RLS) |
| Background jobs | Supabase Edge Functions + pg_cron |
| Pagamento + NF-e | Asaas (PIX, Boleto, Cartão à vista) |
| Email | Resend |
| Consultas externas | API Full |

**Custo de infra mensal:** R$ 0 (tudo no free tier).
**Variável:** Asaas (taxa por transação) + API Full (por consulta).

---

## Identidade visual · Cerrado v1.0

Cores principais (tokens em `src/app/globals.css`):

```
--cocoa:   #1F1611   (texto)
--fur:     #C46A3F   (BRAND)
--saffron: #E8A547   (CTA)
--paper:   #FBF6EC   (background)
--cream:   #F4EAD8   (neutro claro)
```

Fontes (via `next/font/google` em `src/app/layout.tsx`):

- **Bricolage Grotesque** — display/títulos
- **Manrope** — corpo/UI
- **JetBrains Mono** — CPF, placa, código

Mascote em 5 estados (em `/public/brand/mascot/`):
padrão · investigando · concluído · atenção · heroico.

---

## Estrutura de pastas

```
src/
├── app/              # rotas Next.js (marketing, auth, cliente, empresa, admin)
├── components/       # ui/ shadcn, capivara/, consulta/, pagamento/, admin/
├── lib/              # supabase/, asaas/, apifull/, consultas/, pdf/, log/, ...
├── hooks/
├── types/
└── middleware.ts

public/brand/         # mascote, logos, ícones próprios
supabase/migrations/  # SQL migrations
supabase/functions/   # Edge Functions (Deno)
docs/                 # ARQUITETURA, PLANOS_E_PRECOS, LGPD, API
```

Detalhes em `docs/ARQUITETURA.md`.

---

## Scripts

```bash
npm run dev        # dev server em :3000
npm run build      # build produção
npm run start      # start prod
npm run lint       # lint
npm run typecheck  # tsc --noEmit
```

---

## Princípios

1. **Sem mensalidade** — quem usa, paga. Quem não usa, não paga.
2. **Cache de 24h sem cobrar de novo** — UX honesta.
3. **LGPD com finalidade obrigatória** em toda consulta.
4. **PDF como entregável principal** — todo dado vira relatório baixável.
5. **Mascote e tom brasileiro** — sem rigidez de banco.

---

## Compromissos de versionamento

- Migrations Supabase são **append-only** — nunca editar uma já aplicada.
- Edge Functions versionadas em `supabase/functions/{nome}/index.ts`.
- Brand assets em `public/brand/` são imutáveis — mudanças vêm do brandbook.
- Documentação em `docs/` atualizada **toda vez** que regra de negócio muda.

---

Mantido por [Dose de Growth](https://dosedegrowth.com.br).
