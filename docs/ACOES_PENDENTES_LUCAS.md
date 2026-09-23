# 🐾 Capivara — o que ainda depende de você

> **Última atualização:** 2026-09-23
> **Produção:** https://suacapivara.com.br
> **Catálogo:** 67 consultas (14 planos · 3 combos · 50 avulsas) em 7 categorias

Este doc lista só o que **eu não consigo resolver sozinho**: credencial que não
tenho, conta que precisa do seu CPF, decisão de negócio. Tudo que era código
está feito e validado — ver o histórico de commits.

---

## 🔴 Trava o faturamento

### 1. Asaas em produção
**Nada cobra de verdade hoje.** O ambiente é sandbox; os 8 pagamentos no banco
são testes de maio. Todo o resto do fluxo (consulta, Edge, PDF, refund) está
pronto e esperando pagamento real.

Passos: conta Asaas com KYC aprovado → trocar `ASAAS_API_KEY` → `ASAAS_ENV=production`
→ reconfigurar o webhook no painel de produção do Asaas.

Enquanto isso não acontece, nada do catálogo gera receita — é a única pendência
que segura dinheiro.

### 2. Saldo na APIFULL
Sem saldo, consulta paga entra e falha. O refund automático devolve, mas o
cliente vive a falha. Confirmar saldo antes de ligar o Asaas em produção.

---

## 🟠 Legal e confiança

### 3. `NEXT_PUBLIC_CAPIVARA_CNPJ`
Conferido hoje: o site mostra a razão social **sem o CNPJ**. A LGPD (Art. 9º)
pede identificação do controlador. O site degrada com elegância (esconde a
linha), mas resolver antes de tráfego pago.

```bash
cd ~/Antigravity/capivara
~/.npm-global/bin/vercel env add NEXT_PUBLIC_CAPIVARA_CNPJ production --value "XX.XXX.XXX/0001-XX" --yes
```

### 4. Canais de contato
`NEXT_PUBLIC_CAPIVARA_WA_URL` e `NEXT_PUBLIC_CAPIVARA_TEL` estão vazios, então
WhatsApp e telefone **não aparecem** na página de contato. Só o e-mail aparece.

### 5. `RESEND_FROM_EMAIL`
Confirmar que usa `@suacapivara.com.br` (domínio verificado no Resend), não o
`@capivara.app` antigo. Se estiver errado, nenhum e-mail chega.

---

## 🟡 Um comando seu

### 6. Deploy da Edge Function
O encadeamento de sócio (planos CNPJ) está no repo e validado, mas **não subiu**:
o deploy precisa do seu Personal Access Token do Supabase, que não fica no
ambiente. A função em produção ainda é a v34.

```bash
SUPABASE_ACCESS_TOKEN=sbp_xxx ./scripts/deploy-edge.sh
```
(Token em supabase.com/dashboard/account/tokens. O script roda `npm run check`
antes de subir.)

Sem esse deploy, 15 chamadas dos planos CNPJ Sócios/Premium/Total continuam
saindo com o CNPJ no campo `cpf` e voltando vazias.

---

## 🔵 Decisão de produto (não é código)

### 7. Busca reversa por nome/telefone
A APIFULL tem `busca-por-documentos` (R$ 0,90) mapeada e **não vendida**.
Encontrar alguém a partir do nome ou telefone é o uso mais sensível do catálogo
inteiro: a finalidade legítima é muito mais estreita e o risco de uso pra
perseguição é real.

Não implementei por decisão sua, não por dificuldade. Se quiser, o caminho é:
finalidades próprias (mais restritas que as atuais), aceite específico, e
provavelmente restrito a B2B com contrato.

### 8. Margem abaixo do alvo em 6 avulsos
Passam o piso de 60% mas ficam abaixo do alvo de 70%:
Recall (69%), Rastreamento (65%), CRLV (63%), Histórico de Leilão (68%),
Foto do Leilão (67%), Vip Car (62%).
São os produtos de custo alto da APIFULL. Subir preço ou aceitar margem menor
nesses — `npm run validar` lista eles a cada rodada.

### 9. Planos CNPJ: quantos sócios consultar
O encadeamento consulta **um** sócio (o administrador, ou o primeiro da lista).
Consultar todos multiplicaria o custo da APIFULL por sócio, e o preço atual
assume uma chamada. Se quiser cobrir o quadro inteiro, vira um SKU novo com
preço por sócio.

### 10. Rate limit externo (Upstash)
O `checkRateLimit` atual vale por instância serverless e zera em cold start.
Com tráfego real, plugar Upstash Redis. Precisa de conta — não tenho.

### 11. NF-e
O marketing fala em "recibo baixável", não em NF-e. Implementar de verdade
(via `/invoices` da Asaas) é uma sprint dedicada. Só vale se um cliente
empresa exigir.

---

## ✅ Resolvido nesta rodada (23/09)

- Catálogo completo no site: página "Tudo" com as 67 consultas, busca e filtro;
  7 categorias na home (carrossel no celular).
- **3 combos de leilão davam 404 em produção** — os CTAs da landing de leilão e
  de /precos caíam em página inexistente.
- Os 3 links de direito do titular em /lgpd apontavam pra rota que não existe.
- `<title>` com "Capivara" duas vezes em 44 páginas.
- Revisão antes de pagar (LGPD Art. 8º §4º) — era a última pendência aberta da
  auditoria de julho.
- API B2B aceitava só 14 dos 67 SKUs.
- Preços errados no marketing (CPF Premium dizia R$ 89,90 e custa 79,90;
  "Veicular R$ 49,90" não existia; Leilão "a partir de R$ 12,99" e o mínimo é
  29,99). Agora todo preço sai do catálogo.
- Anti-fraude saiu do zero: blocklist e varredura por IP.
- `npm run check` roda typecheck + invariantes do catálogo + 41 testes.
