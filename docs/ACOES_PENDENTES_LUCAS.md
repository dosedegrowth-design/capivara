# Capivara — o que falta

> **Atualizado:** 30/10/2026
> **Produção:** https://suacapivara.com.br
> **Catálogo:** 68 consultas (14 planos · 3 combos · 51 avulsas)

Tudo que dependia só de código está feito. O que segue precisa de você:
conta, credencial ou decisão de negócio.

---

## Trava o faturamento

**1. Asaas em produção.** Nada cobra de verdade: o ambiente é sandbox, o
último pagamento no banco é de 22/05 (teste). Conta Asaas com KYC aprovado →
trocar `ASAAS_API_KEY` → `ASAAS_ENV=production` → cadastrar o webhook no
painel de produção do Asaas.

**2. Saldo na APIFULL.** Sem saldo, a consulta paga falha e o reembolso
automático devolve o dinheiro — mas o cliente vive a falha. Conferir antes
de ligar o Asaas.

---

## Sem isso não dá pra saber se alguém visita

**3. Medição de tráfego.** Hoje o site não mede nada. Duas opções:
- **Vercel (mais simples):** Vercel → projeto capivara → Analytics → Enable.
  Depois me avisa, que eu coloco `NEXT_PUBLIC_VERCEL_ANALYTICS=1` e subo. O
  código já está pronto.
- **Plausible:** criar a conta e me passar o domínio.

**4. Search Console.** Cadastrar `suacapivara.com.br` na sua conta do Google.
Sem isso não dá pra ver se o site aparece nas buscas nem enviar o sitemap.

---

## Legal e confiança

**5. CNPJ no site** (`NEXT_PUBLIC_CAPIVARA_CNPJ`). O rodapé mostra a razão
social sem o CNPJ. A LGPD pede identificação do controlador.

**6. WhatsApp e telefone** (`NEXT_PUBLIC_CAPIVARA_WA_URL`,
`NEXT_PUBLIC_CAPIVARA_TEL`). Vazios: a página de contato mostra só o e-mail.

**7. Remetente de e-mail** (`RESEND_FROM_EMAIL`). Confirmar que usa
`@suacapivara.com.br`, não o `@capivara.app` antigo.

---

## Decisões suas

**8. Score avulso a R$ 7,99?** Lançado a R$ 9,99 porque esse é o piso dos
avulsos. A R$ 7,99 a margem fica 61% (dentro da regra de 60%) e o preço fica
33% acima da Mega Consultas (R$ 6) em vez de 66%. É só trocar o número.

**9. Laranja da marca como texto pequeno.** É o que segura a acessibilidade
em 96. O laranja (#C46A3F) tem contraste 3,56:1 em texto pequeno; o mínimo é
4,5. Proposta: um tom mais escuro (#A75A36, 4,69:1) só para texto e selos,
mantendo o laranja atual em botões, ícones e títulos grandes.

**10. Gravame e leilão caros frente à concorrência.** Gravame R$ 14,99 contra
R$ 8 da Mega; leilão R$ 29,99 contra R$ 16. Ambos cabem na regra de margem se
quiser baixar.

**11. Busca reversa por nome/telefone.** Endpoint mapeado e não vendido. É o
uso mais sensível do catálogo; se quiser, sai com finalidades mais restritas
e, provavelmente, só para empresa.

**12. Quantos sócios consultar nos planos CNPJ.** Hoje é um (o
administrador). Consultar todos multiplica o custo da APIFULL por sócio.

**13. Rate limit externo (Upstash).** O limite atual zera quando o servidor
reinicia. Precisa de conta.

**14. NF-e.** O site fala em recibo. NF-e de verdade é uma sprint; só vale
se cliente empresa pedir.

---

## Feito em 30/10

- Next 16.4.3 e zod 4: 0 vulnerabilidades (havia 1 crítica)
- Cabeçalhos de segurança (antes só HSTS)
- Edge v43 no ar com o encadeamento de sócio — conferida byte a byte
- Score de Crédito avulso
- Documentação da API e playground com as 68 consultas
- Contraste, acentos (inclusive nos rótulos do PDF) e áreas de toque:
  acessibilidade da home de 87 pra 96
- Analytics da Vercel pronto, esperando o item 3
