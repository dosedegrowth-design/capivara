# Capivara · Contas de teste

Documento pra revisão visual dos 3 painéis (Admin, Cliente B2C, Empresa B2B).

## Como rodar o seed

```bash
# 1. Garanta que .env.local tem:
#    NEXT_PUBLIC_SUPABASE_URL
#    SUPABASE_SERVICE_ROLE_KEY
#
# 2. Aplique as migrations no Supabase antes (0001 a 0011):
#    cd supabase && supabase db push
#
# 3. Rode o script:
npm run seed:test
```

O script é **idempotente** — pode rodar múltiplas vezes sem duplicar contas.

## Credenciais

Senha padrão pra todas as contas: **`Capivara2026!`**

| Painel | Email | Onde acessa |
|---|---|---|
| Admin | `admin@capivara.app` | https://suacapivara.com.br/admin |
| Cliente B2C | `cliente@capivara.app` | https://suacapivara.com.br/dashboard |
| Empresa B2B | `empresa@capivara.app` | https://suacapivara.com.br/empresa |

Login em: https://suacapivara.com.br/login

---

## 🛠️ Painel Admin

**Conta**: `admin@capivara.app` · `Capivara2026!`

### Onde olhar

| Rota | O que ver |
|---|---|
| `/admin` | Dashboard com KPIs macro (receita 24h/30d, usuários, empresas, alertas, últimas consultas) |
| `/admin/usuarios` | Lista de todos os usuários cadastrados |
| `/admin/empresas` | **Ajustar créditos manualmente**, suspender empresas, ver uso |
| `/admin/consultas` | Lista de todas as consultas do sistema |
| `/admin/financeiro` | Receita por dia, breakdown B2C vs B2B, métodos de pagamento |
| `/admin/anti-fraude` | Alertas de fraude (high velocity, multi-user, failed payments) |
| `/admin/erros` | Error logs do sistema |
| `/admin/lgpd` | Aceites, contato DPO, ações LGPD (export/delete) |
| `/admin/aceites` | Audit log de aceites legais (consent_logs) |
| `/admin/configuracoes` | Health check do sistema, documentos legais ativos, planos, cron jobs |

### Roteiro sugerido

1. Entre em `/admin` — veja os KPIs macro
2. Abra `/admin/empresas` — clique no ícone de moeda em **Capivara Demo Ltda** e adicione +200 créditos com motivo "cortesia"
3. Volte pro `/admin` — receita atualizada
4. Abra `/admin/financeiro` — veja o gráfico de barras dos últimos 30 dias
5. Abra `/admin/aceites` — confira que cada conta de teste tem aceites registrados
6. Abra `/admin/configuracoes` — health check mostra status de cada env var

---

## 🐾 Painel Cliente B2C

**Conta**: `cliente@capivara.app` · `Capivara2026!`

### Onde olhar

| Rota | O que ver |
|---|---|
| `/dashboard` | Home do cliente com últimas consultas |
| `/dashboard/historico` | Lista de todas as consultas pessoais |
| `/dashboard/nova-consulta` | Flow B2C (redireciona pro funil público) |
| `/historico/[id]` | Detalhe da consulta com PDF + **banner de aviso de atualidade** |
| `/configuracoes` | Perfil, mudar senha/email, exportar dados, deletar conta |
| `/configuracoes/meus-aceites` | Histórico de todos os aceites legais com IP + hash |

### Roteiro sugerido

1. Entre em `/dashboard` — verá 7 consultas concluídas + 1 pendente
2. Clique em qualquer consulta concluída → vai pra `/historico/[id]`
3. Observe o **banner saffron** acima do resultado: "Sobre estes dados — Consulta realizada em ... A Capivara é intermediária técnica..."
4. Clique em "Baixar PDF" → confira **disclaimer na capa** + **footer em todas as páginas**
5. Vá pra `/configuracoes` → clique em "Ver histórico completo →" (Meus aceites)
6. Em `/configuracoes/meus-aceites`, expanda qualquer aceite — veja hash, IP, UA, metadata
7. Teste o fluxo de **nova consulta**: vá em `/consultar/cpf` (link no menu) → escolha um plano → preencha CPF → **observe o checkbox compacto de aceite obrigatório**

---

## 🏢 Painel Empresa B2B

**Conta**: `empresa@capivara.app` · `Capivara2026!`

A empresa criada se chama **"Capivara Demo Ltda"** (CNPJ 12.345.678/0001-90) com saldo inicial de **850 créditos** (após gastar 550 em 12 consultas seed) e uma recarga de R$ 1.000 (1400 cr) registrada há 30 dias.

### Onde olhar

| Rota | O que ver |
|---|---|
| `/empresa` | Home com KPIs, saldo destacado, **gráfico de atividade 14 dias**, 8 quick action cards |
| `/empresa/nova-consulta` | Form B2B com seleção de plano + cost_center + external_reference + finalidade |
| `/empresa/historico` | Lista com filtros (target, categoria, status, fonte web/api), **export CSV** |
| `/empresa/creditos` | Cards de pacotes Manada (Start/Pro/Plus/Reserva), saldo + histórico |
| `/empresa/equipe` | 1 membro admin (você). Tente convidar mais. |
| `/empresa/faturamento` | NF-e, recibos, breakdown investido vs créditos |
| **`/empresa/api`** | **Dashboard de uso da API** (chamadas/dia, taxa sucesso, top planos, webhook stats) + **gerar chaves** |
| `/empresa/webhooks` | CRUD de endpoints + log das últimas 50 tentativas |

### Roteiro sugerido

1. Entre em `/empresa` — veja saldo 850 cr, mini-gráfico de atividade dos últimos 14 dias, 8 atalhos
2. Clique em **"API & métricas"** → confira o **dashboard de uso**: 
   - Stats macro (chamadas hoje/7d/30d, taxa sucesso)
   - Gráfico de barras 14 dias
   - Top 5 planos via API
   - Webhook delivery stats
3. Role a página → veja a **API key demo** já criada
4. Abra `/empresa/historico` → filtre por **Fonte = API** → veja as 8 consultas com `external_reference` setado
5. Clique em **"Exportar CSV"** — baixa CSV das consultas filtradas
6. Vá em `/empresa/webhooks` → 1 endpoint demo cadastrado
7. Vá em `/empresa/equipe` → clique em **"Convidar membro"** (precisa Resend ativo pra email chegar)
8. Vá em `/empresa/creditos` → clique em **"Recarregar com PIX"** num pacote → vai criar cobrança Asaas real (precisa Asaas configurado)

---

## 📦 Dados criados pelo seed

### Usuários (3)
- `admin@capivara.app` — admin
- `cliente@capivara.app` — pessoa física com CPF aleatório válido
- `empresa@capivara.app` — admin da Capivara Demo Ltda

### Empresa (1)
- **Capivara Demo Ltda** (CNPJ 12345678000190) com 850 créditos

### Consultas (20)
- 8 do cliente B2C (mix CPF/CNPJ/Veicular, 7 completas + 1 pendente de pagamento)
- 12 da empresa B2B (4 via painel, 8 via API com external_reference, 1 com erro)

### Transactions (10)
- 8 transactions B2C tipo "consultation"
- 1 transaction B2B tipo "recharge" (R$ 1.000 com 40% bônus = +1400 créditos)
- 1 ajuste manual se você usar o admin

### API & Webhook
- 1 chave API ativa: `cap_live_Dem...`
- 1 webhook endpoint demo

### Aceites legais
- 4 aceites pra cada usuário (ToS + Privacidade + Responsabilidade + B2B/API quando aplicável)

---

## ⚠️ Limpeza após teste

Pra remover tudo:

```sql
-- Remove dados de teste (CUIDADO: rode só em sandbox/dev)
DELETE FROM capivara.consultations WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@suacapivara.com.br'
);
DELETE FROM capivara.transactions WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@suacapivara.com.br'
);
DELETE FROM capivara.consent_logs WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@suacapivara.com.br'
);
DELETE FROM capivara.company_members WHERE user_id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@suacapivara.com.br'
);
DELETE FROM capivara.companies WHERE cnpj = '12345678000190';
DELETE FROM capivara.profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email LIKE '%@suacapivara.com.br'
);
-- Auth users precisam ser deletados via dashboard ou supabase.auth.admin.deleteUser
```
