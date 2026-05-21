# Capivara · Planos e Preços

> Fonte da verdade do catálogo comercial.
> Mudanças aqui precisam refletir em `src/lib/consultas/planos.ts` e vice-versa.

**Última atualização:** 2026-05-21
**Margem alvo:** mínimo 65% nos planos populares, mínimo 50% nos premium

---

## CPF — Pessoa Física

### Avulso (B2C)

| Plano | Preço | O que inclui |
|---|---|---|
| **Espiadinha** | R$ 9,90 | Dados cadastrais básicos. CPF Simples |
| **Investigação** | R$ 19,90 | + Endereços, telefones, emails, parentes, empresas |
| **Avançada** ⭐ | R$ 39,90 | + Ultra Completo + Cred Plus + Boa Vista |
| **Premium** | R$ 79,90 | + Serasa Premium + Trabalhista + QUOD |
| **Raio-X** 💎 | R$ 129,90 | + SPC + SCR BACEN + Busca por documentos |

### Custo interno x margem

| Plano | Custo APIs | Receita | Margem |
|---|---|---|---|
| Espiadinha | R$ 0,05 | R$ 9,90 | 99,5% |
| Investigação | R$ 0,40 | R$ 19,90 | 98,0% |
| Avançada | R$ 5,98 | R$ 39,90 | 85,0% |
| Premium | R$ 17,18 | R$ 79,90 | 78,5% |
| Raio-X | R$ 32,17 | R$ 129,90 | 75,2% |

### Empresarial (folhas)

| Plano | Folhas (cr) | Equivale a | Desconto vs avulso |
|---|---|---|---|
| Espiadinha | 6 | R$ 6,00 | -39% |
| Investigação | 12 | R$ 12,00 | -40% |
| Avançada | 25 | R$ 25,00 | -37% |
| Premium | 50 | R$ 50,00 | -37% |
| Raio-X | 85 | R$ 85,00 | -35% |

---

## CNPJ — Empresa

### Avulso (B2C)

| Plano | Preço | O que inclui |
|---|---|---|
| **Espiadinha** | R$ 7,90 | Razão social, situação, CNAE, sócios, endereço |
| **+ Sócios** ⭐ | R$ 49,90 | + CPF Ultra de até 3 sócios + Certidão Trabalhista |
| **Premium** | R$ 99,90 | + Cred Plus + Serasa dos sócios + histórico fiscal |
| **Total** 💎 | R$ 149,90 | + Análise de risco + Protestos + SCR sócios |

### Custo interno x margem

| Plano | Custo APIs | Receita | Margem |
|---|---|---|---|
| Espiadinha | R$ 0,04 | R$ 7,90 | 99,5% |
| + Sócios | R$ 8,74 | R$ 49,90 | 82,5% |
| Premium | R$ 22,12 | R$ 99,90 | 77,9% |
| Total | R$ 38,72 | R$ 149,90 | 74,2% |

### Empresarial (folhas)

| Plano | Folhas | Equivale a | Desconto |
|---|---|---|---|
| Espiadinha | 5 | R$ 5 | -37% |
| + Sócios | 32 | R$ 32 | -36% |
| Premium | 65 | R$ 65 | -35% |
| Total | 99 | R$ 99 | -34% |

---

## Veicular — Placa

### Avulso (B2C)

| Plano | Preço | O que inclui |
|---|---|---|
| **Espiadinha** | R$ 9,90 | Placa, marca, modelo, ano, cor, chassi, Fipe |
| **Completo** | R$ 29,90 | + BIN Nacional + Recall |
| **Avançado** ⭐ | R$ 59,90 | + BIN Estadual + Proprietário + Gravame + Histórico Roubo/Furto |
| **Premium** | R$ 119,90 | + Leilão + Cert. Segurança Veicular + RENAJUD |
| **Total** 💎 | R$ 199,90 | + Vip Car + CRLV + Foto Leilão |

### Custo interno x margem

| Plano | Custo APIs | Receita | Margem |
|---|---|---|---|
| Espiadinha | R$ 0,17 | R$ 9,90 | 98,3% |
| Completo | R$ 4,97 | R$ 29,90 | 83,4% |
| Avançado | R$ 13,82 | R$ 59,90 | 76,9% |
| Premium | R$ 28,12 | R$ 119,90 | 76,5% |
| Total | R$ 65,02 | R$ 199,90 | 67,5% |

### Empresarial (folhas)

| Plano | Folhas | Equivale a | Desconto |
|---|---|---|---|
| Espiadinha | 6 | R$ 6 | -39% |
| Completo | 19 | R$ 19 | -36% |
| Avançado | 39 | R$ 39 | -35% |
| Premium | 75 | R$ 75 | -37% |
| Total | 129 | R$ 129 | -35% |

---

## Pacotes Manada (B2B — recarga de folhas)

| Pacote | Valor | Folhas base | Bônus | Total | Recursos |
|---|---|---|---|---|---|
| **Manada Start** | R$ 200 | 200 | +20% | 240 | 3 usuários, histórico unificado, NF-e |
| **Manada Pro** ⭐ | R$ 500 | 500 | +30% | 650 | 10 usuários, exportação, API REST |
| **Manada Plus** | R$ 1.000 | 1.000 | +40% | 1.400 | 25 usuários, webhooks, cache 7d, prioridade |
| **Reserva Capivara** 💎 | R$ 3.000 | 3.000 | +50% | 4.500 | Usuários ilimitados, SLA, account manager |

**Custo médio por folha:** entre R$ 0,67 (Reserva) e R$ 0,83 (Start).

---

## Regras Comerciais

### Sem mensalidade
Cliente B2B só paga quando recarrega. Folhas não vencem automaticamente
mas recomendamos validade de **12 meses** (renovada a cada recarga).

### Cache 24h grátis
Mesma consulta no mesmo plano em até 24h **não cobra de novo**. Frontend
indica visualmente "Consultado há X horas — clique para ver".

### NF-e automática
Toda recarga B2B emite NF-e via Asaas (envio automático por email cadastrado
em `companies.email_billing`).

### Reembolso
- Pagamento não confirmou em 24h → cobrança expira, sem cobrança no cliente
- Consulta deu erro em API obrigatória → reembolso automático em folhas
  (B2B) ou estorno PIX (B2C, sujeito a prazos Asaas)

### Cupons
Tabela `promo_codes` permite desconto % ou valor fixo.
Limite de usos + período de validade. Criar em /admin/configuracoes/cupons.

---

## Critérios para ajuste de preço

Revisar preços trimestralmente baseado em:

1. **Custo real da API Full** (pode subir ou descer com renegociação)
2. **Margem efetiva** (depois de gateway Asaas ~1% PIX, ~3,5% cartão)
3. **Adoção dos planos** (se Raio-X tem zero clientes, talvez precise repreçar)
4. **Concorrência** (monitorar SerasaScore, Reclame Aqui, Soumais, etc)

Mudanças de preço NÃO afetam:
- Folhas já compradas (mantém poder de compra antigo, marcando em `bonus_percentage` qual era o bônus na época)
- Consultas em andamento

Mudanças de preço ATIVAM imediatamente para:
- Novas compras avulsas B2C
- Novas recargas B2B
