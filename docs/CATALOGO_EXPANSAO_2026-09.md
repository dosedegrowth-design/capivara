# Capivara · Expansão de Catálogo — set/2026

> Documento de decisão. Base: catálogo completo APIFULL (22/09/2026, preços Nível 1 e Nível 2)
> cruzado com `src/lib/consultas/planos.ts` e `src/lib/apifull/mapping.ts` (cotação 23/05/2026).
>
> **Visão**: Capivara deixa de ser "CPF/CNPJ/veicular" e vira **SaaS de consultas geral** —
> um marketplace de dados organizados em nichos, cada consulta virando PDF verificável.

---

## 0. Regra de precificação (a que já praticamos, agora formalizada)

Fonte: comentário em `planos.ts` ("Margem alvo: >=60% B2C, idealmente >70%") + margens praticadas.

| Regra | Valor |
|---|---|
| Margem B2C | **≥60%, alvo ≥70%** sobre custo APIFULL N1 |
| Margem B2B | **piso 40%** (novo — antes era "B2B = 50% do B2C", que quebra nos planos caros) |
| Preço psicológico | avulso termina em **,99** · combo termina em **,90** |
| Piso de preço | R$9,99 avulso (nenhuma consulta abaixo disso, mesmo custo de centavos) |
| Custo de referência | **Nível 1** (conservador). Se a conta subir pro Nível 2, margem melhora 8–17% em tudo |

**Régua avulso (custo N1 → preço B2C):**

| Custo | B2C | B2B |
|---|---|---|
| até R$0,50 | R$9,99 | R$5,99 |
| R$0,51–1,50 | R$12,99 | R$6,99 |
| R$1,51–3,00 | R$14,99 | R$7,99 |
| R$3,01–5,00 | R$19,99 | R$10,99 |
| R$5,01–8,00 | R$29,99 | R$15,99 |
| R$8,01–12,00 | R$39,99 | R$21,99 |
| R$12,01–18,00 | R$59,99 | R$32,99 |
| R$18,01–25,00 | R$79,99 | R$44,99 |
| R$25,01–40,00 | R$99,99 | R$59,99 |

A régua é guia; **valor percebido manda** (ex: ATPV-e custa R$2,40 mas vale R$24,99 — despachante cobra R$50+).

---

## 1. URGENTE — Reprecificação APIFULL (afeta o que JÁ vendemos)

A APIFULL reajustou **+10% (Nível 1)** em quase todos os endpoints que usamos. Três caíram. Dois mudaram de nome/produto.

### 1a. Custos novos dos endpoints atuais

| Endpoint | Custo antigo | Custo novo N1 | Δ | Obs |
|---|---|---|---|---|
| vip-car | 31,20 | **34,32** | +10% | |
| crlv | 20,28 | **22,31** | +10% | |
| foto-leilao | 12,00 | **13,20** | +10% | |
| scr-bacen | 9,36 | **10,30** | +10% | virou "SCR e Score V2"; existe **SCR Premium a 6,28** (−33%!) |
| hist-roubo-premium | 9,36 | **10,30** | +10% | |
| leilao | 8,76 | **9,64** | +10% | |
| spc-brasil | 8,63 | **8,40** | −3% | |
| cnd-trabalhista | 7,20 | **7,92** | +10% | |
| serasa-premium | 6,96 | **7,39** | +6% | existe V2 a 8,40 |
| serasa-basico | 5,40 | **3,04** | **−44%** | ⚠️ provável rename → "Dados cadastrais, score e dívidas" — CONFIRMAR path |
| quod | 4,78 | **5,26** | +10% | |
| csv-completo | 4,50 | **4,95** | +10% | |
| recall / roubo-furto | 3,60 | **3,96** | +10% | |
| proprietario-placa | 3,42 | **3,76** | +10% | |
| boa-vista | 3,23 | **3,03** | −6% | rename → "Boa vista Essencial Positivo" — CONFIRMAR path |
| bin-nacional | 3,00 | **3,30** | +10% | N2 = 1,98 (desconto grande) |
| bin-estadual | 2,76 | **3,04** | +10% | |
| gravame | 2,20 | **2,42** | +10% | |
| cred-completa-plus | 2,49 | **2,74** | +10% | |
| cpf-ultra | 1,17 | **2,92** | **+150%** | ⚠️ virou "CPF Ultra Premium" (400 bases) — CONFIRMAR se endpoint antigo morreu |
| cpf-completo | 0,60 | 0,66 | +10% | |
| demais baratos (placa, fipe, cpf-simples, cnpj) | 0,06–0,11 | +10% | | |

### 1b. Margens recalculadas — o que quebrou a regra

| Plano | B2C | Margem B2C nova | Margem B2B nova | Ação sugerida |
|---|---|---|---|---|
| **Veicular Total** | 249,90 | **58%** ⚠️ | **16%** 🔴 | B2C → **279,90** · B2B → **169,90** (margem 62% / 38%) |
| **Auctioneer Total** | 199,90 | **51%** 🔴 | **19%** 🔴 | B2C → **249,90** · B2B → **159,90** (61% / 39%) |
| **CRLV avulso** | 49,99 | **55%** ⚠️ | **25%** 🔴 | B2C → **59,99** · B2B → **37,99** (63% / 41%) |
| CPF Premium | 79,90 | 63% ok | **27%** 🔴 | B2B 39,90 → **49,90** (41%) |
| CPF Raio-X | 129,90 | 63% ok | **26%** 🔴 | B2B 64,90 → **79,90** (40%) |
| Veicular Avançado | 59,90 | 65% ok | **31%** ⚠️ | B2B 29,90 → **34,90** (41%) |
| Vip Car avulso | 89,99 | 62% ok | **31%** ⚠️ | B2B 49,99 → **57,99** (41%) |
| Pré-Lance / Foto Leilão / Pós-Compra | — | 66-67% ok | 39-40% limite | manter (piso 40% no arredondamento) |
| Demais (espiadinhas, investigação, CNPJs...) | — | 70-99% ok | ok | manter |

**Se `cpf-ultra` → Ultra Premium confirmar**: CPF Avançada segue ok (71%), mas ganha argumento de venda ("400 bases unificadas").

---

## 2. NOVOS produtos nos nichos EXISTENTES

### 2a. Veicular (novos avulsos)

| Produto | Custo N1 | B2C | B2B | Margem | Por quê |
|---|---|---|---|---|---|
| **Multas e Débitos do Veículo** (IPVA/licenc/multas + cód. barras) | 2,97 | **19,99** | 10,99 | 85% | Top de demanda orgânica; código de barras = resolve na hora |
| **Multas RENAINF** (nacionais detalhadas) | 3,96 | 19,99 | 10,99 | 80% | |
| **Restrições Judiciais RENAJUD** | 3,96 | 19,99 | 10,99 | 80% | |
| **ATPV-e 2ª via** (autorização de transferência) | 2,40 | **24,99** | 13,99 | 90% | Despachante cobra R$50+; doc oficial |
| **Placa Radar** (passagens por radar c/ mapa) | 0,83 | 12,99 | 6,99 | 94% | Curiosidade forte, viral |
| **Frota por CPF** (veículos no CPF) | 5,28 | 24,99 | 13,99 | 79% | |
| **Frota por CNPJ** | 5,28 | 24,99 | 13,99 | 79% | |
| **ANTT/RNTRC do caminhão** (combo RNTRC) | 5,10 | 24,99 | 13,99 | 80% | Nicho caminhoneiro/transportadora |
| **Rastreamento de Veículo** (passagens, pátios, indício de fraude) | 87,12 | **249,99** | 149,99 | 65% | Premium investigativo, B2B seguradoras |
| **CNH do Motorista** (V2 c/ foto, validade, pontos) | 2,67 | 19,99 | 10,99 | 87% | Locadoras, transportadoras, apps |

### 2b. CPF (novos avulsos)

| Produto | Custo N1 | B2C | B2B | Margem | Por quê |
|---|---|---|---|---|---|
| **Processos Judiciais** | 0,31 | **14,99** | 7,99 | 98% | Razão nº1 de consulta de pessoa; custo irrisório |
| **Antecedentes Criminais** (certidão federal) | 1,16 | 14,99 | 7,99 | 92% | |
| **Busca pelo Nome** (reversa: nome → dados) | 1,65 | **19,99** | 10,99 | 92% | SEO gigante ("encontrar pessoa pelo nome") |
| **De Quem É Esse Número?** (busca por telefone) | 0,50 | 14,99 | 7,99 | 97% | SEO gigante, viral |
| **Fui Vazado?** (exposição dark web) | 1,16 | 14,99 | 7,99 | 92% | Produto de segurança pessoal |
| **Renda e Patrimônio Estimados** | 1,41 | 14,99 | 7,99 | 91% | |
| **Vínculos e Parentes** (pessoas relacionadas) | 0,22 | 12,99 | 6,99 | 98% | |
| **Imóveis no CPF** (capitais) | 7,70 | **34,99** | 18,99 | 78% | |
| **Vida Profissional** (vínculos, empregadores) | 0,44 | 12,99 | 6,99 | 97% | RH |
| **Validação CPF × Telefone** | 2,31 | 14,99 | 7,99 | 85% | Antifraude |
| **Restituição do IR** | 0,22 | 9,99 | 5,99 | 98% | Sazonal (mar-set), tráfego orgânico |
| **Servidor Público** | 0,22 | 9,99 | 5,99 | 98% | |
| Mandados de Prisão / Óbito / Nome Social / Score Cadastral | 0,09–0,22 | — | — | — | **Só em combos** (sozinhos são "meio produto") |

### 2c. CNPJ (novos)

| Produto | Custo N1 | B2C | B2B | Margem |
|---|---|---|---|---|
| **Processos Judiciais da Empresa** | 0,31 | 14,99 | 7,99 | 98% |
| **Quadro Societário** | 0,31 | 9,99 | 5,99 | 97% |
| **Participações Societárias detalhadas** | 5,65 | 24,99 | 13,99 | 77% |
| **QUOD Score PJ** | 8,98 | 39,99 | 21,99 | 78% |
| **QUOD Consulta Completa PJ** | 14,01 | 59,99 | 32,99 | 77% |
| **Análise: Define Risco** | 16,60 | 59,99 | 34,99 | 72% |
| **Análise: Define Negócio** | 27,10 | 99,99 | 59,99 | 73% |
| **Análise: Define Limite** | 31,98 | 99,99 | 59,99 | 68% |
| **Sintegra** | 1,16 | 12,99 | 6,99 | 91% |
| **Contato Comercial** (tel + email + localização da empresa) | 0,73 | 14,99 | 7,99 | 95% |
| **Finanças da Empresa** (balanços, DRE) | 396,00 | **999,00** | 649,00 | 60% — *sob demanda/enterprise, não self-service* |

---

## 3. NICHOS NOVOS (categorias a criar)

### 3a. 📜 CERTIDÕES (PF e PJ) — o filé de margem

~22 certidões oficiais, todas custando **R$1,16–1,32**. Público: advogados, RH, licitações, due diligence. **Recorrência natural** (validade curta das certidões).

- Avulsa: qualquer certidão **R$12,99** B2C / 6,99 B2B (margem 91%)
- **Kit Certidões PF Essencial** (PGFN + CNDT + Antecedentes + CNJ + Nada Consta) — custo 5,80 → **R$39,90** / 21,90 (85%)
- **Kit Certidões PF Completo** (10 certidões) — custo 11,60 → **R$69,90** / 37,90 (83%)
- **Kit Certidões PJ Licitação** (FGTS + PGFN + CNDT + Situação Cadastral + Sintegra) — custo 5,80 → **R$49,90** / 26,90 (88%)
- **Kit Certidões PJ Completo** (12: + IBAMA, CGU, CNJ, estaduais, SUFRAMA) — custo 14,00 → **R$89,90** / 47,90 (84%)

### 3b. 🛡️ COMPLIANCE & KYC (antifraude)

PLD V3 (PEP, sanções, processos, nível de risco) + verificações cadastrais. Público: fintechs, imobiliárias, RH, cartórios. **Canal natural: API B2B** (o que já construímos).

- **PLD Pessoa Física** (2,25) → 19,99 / 10,99 (89%)
- **PLD Empresa** (6,75) → 34,99 / 18,99 (81%)
- **PLD dos Sócios (QSA)** (6,75) → 34,99 / 18,99 (81%)
- **Combo KYC PF** (PLD + óbito + mandados + antecedentes + score cadastral + validação tel) — custo 7,21 → **R$49,90** / 26,90 (86%)
- **Combo KYC PJ** (PLD PJ + QSA + situação cadastral + processos + protesto) — custo 18,20 → **R$89,90** / 49,90 (80%)

### 3c. ⚖️ JUDICIAL & DÍVIDAS

- **Protesto Nacional** (3,76) → 19,99 / 10,99 (81%)
- **CADIN** (0,88) → 12,99 / 6,99 (93%)
- **Dívida Ativa PGFN** (1,16) → 12,99 / 6,99 (91%)
- **Ações e Processos** (1,98, base ampliada) → 14,99 / 7,99 (87%)
- **Combo Radar Jurídico** (processos + protesto + CADIN + dívida ativa) — custo 6,11 → **R$39,90** / 21,90 (85%)

### 3d. 📍 INTELIGÊNCIA DE LOCAL (geomarketing por CEP) — o mais diferenciado

~20 endpoints de R$0,09–0,33 (sociodemográfico, gastos por 11 categorias, risco geográfico, concorrência, propensão a seguro, infraestrutura, macroeconomia). Sozinhos não valem nada; **o combo em PDF bonito é o produto** — e PDF é nossa especialidade.

- **Raio-X do CEP** (sociodemográfico + 11 categorias de gasto + infraestrutura + macro) — custo ~2,20 → **R$29,90** / 15,90 (93%)
- **Estudo de Ponto Comercial** (Raio-X + score de concorrência + risco geográfico) — custo ~3,40 → **R$49,90** / 26,90 (93%)

Público: quem vai abrir negócio, franqueadoras, imobiliárias, corretores de seguro. **Nenhum concorrente de consulta oferece isso.**

### 3e. 🔎 LOCALIZAÇÃO DE PESSOAS (skip tracing) — LGPD-sensível

Busca por nome, telefone, contatos hot, endereços. Já coberto nos avulsos CPF (2b). **Nota jurídica**: finalidade obrigatória + termo de responsabilidade já existentes cobrem, mas revisar texto das finalidades para esses produtos. "Prospecção de clientes por CEP" (1,19): **avaliar juridicamente antes** (lista de leads ≠ consulta pontual).

---

## 4. FORA DO CATÁLOGO (decisão explícita)

| Item | Razão |
|---|---|
| Instagram/TikTok seguidores e curtidas (4 SKUs) | **Nunca.** Compra de engajamento viola ToS das plataformas e destrói a credibilidade de um produto de verificação |
| Envio de SMS, Gerador QR, Gerador de imagem IA | Utilidades de infra, não consultas. Fora do posicionamento |
| Buscar reputação (remoção de dados) | Outro negócio (serviço, não consulta) |
| ID Jovem, Passe Livre, Carteira Idosa, Corretor de Seguros, Conselhos de Classe | Validação de credenciais muito nichada — backlog; só se cliente B2B pedir |
| FIPE Estimada | Redundante com a FIPE que já temos (0,12) |

---

## 5. Resumo do catálogo proposto

| | Hoje | Proposta |
|---|---|---|
| Nichos | 4 (CPF, CNPJ, Veicular, Leilão) | **8** (+ Certidões, Compliance/KYC, Judicial, Local/CEP) |
| Combos | 17 | ~28 |
| Avulsos | 13 | ~45 |
| SKUs total | 30 | **~73** |
| Ticket range | R$7,90–249,90 | R$9,99–999,00 |

Destaques de margem nos novos: certidões (83-91%), CEP (93%), processos judiciais (98%), busca reversa (92-97%).

---

## 6. Roadmap sugerido

| Fase | O quê | Esforço |
|---|---|---|
| **0** | Confirmar com APIFULL: nível da conta (N1/N2), paths dos endpoints novos, renames (serasa-basico, boa-vista, cpf-ultra) | 1 contato |
| **1** | Reprecificação: atualizar custos no mapping (3 lugares) + subir os 7 preços da seção 1b | ½ dia |
| **2** | Quick wins de maior demanda: Multas e Débitos, ATPV-e, Processos Judiciais PF/PJ, Busca por Nome/Telefone, Antecedentes, CNH | 1-2 dias (mesma infra: endpoint novo no mapping + produto no planos.ts + seção no PDF) |
| **3** | Nicho Certidões (landing + kits) | 2-3 dias |
| **4** | Nicho Compliance/KYC (foco API B2B) + Judicial | 2-3 dias |
| **5** | Raio-X do CEP (PDF novo, template próprio) | 3-4 dias |
| **6** | Premium: Rastreamento, Finanças da Empresa (sob demanda) | 1 dia |

---

## 7. Pendências técnicas pra implementar

- [ ] **Paths dos endpoints novos** — a lista de preços não traz o slug da API; puxar da doc/painel APIFULL
- [ ] Confirmar **N1 vs N2** da conta Capivara (impacto direto: margem +8-17% se N2)
- [ ] Confirmar renames: `serasa-basica` → "Dados cadastrais, score e dívidas"? `scpc-boavista` → "Boa vista Essencial Positivo"? `cpf-ultra` → "CPF Ultra Premium"?
- [ ] TTLs de cache pros novos (certidões: 24h; CEP: 30d; processos: 24h; CNH: 7d; débitos: 12h)
- [ ] Categorias novas exigem: `CategoriaConsulta` ampliada + constraint `consultations.category` (migration) + landings + templates PDF
- [ ] Finalidades LGPD específicas pros produtos de skip tracing
