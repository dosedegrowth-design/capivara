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

## 1. ✅ EXECUTADO 22/09 — Reprecificação + otimização de custo

> Status: **implementado e validado** (29 SKUs, typecheck + build limpos).
> Base: contrato OpenAPI oficial (`https://doc.apifull.com.br/openapi.json`, 272 paths).

### 1.0 Achados da auditoria do OpenAPI (mais importantes que o reajuste)

**A) 🔴 Estávamos pagando o endpoint ERRADO de roubo/furto**

A APIFULL tem dois, e nosso mapping estava invertido:

| Path | Nome oficial | Custo | Descrição |
|---|---|---|---|
| `ic-historico-roubo-furto` | "Histórico de roubo **ou** furto" (abr/2025) | **R$10,30** | pobre ("busca de dados") |
| `roubo-furto` | "Histórico de roubo **e** furto" (jan/2026) | **R$3,96** | rica (BO, local, data, "nada consta") |

Usávamos o **caro como básico** (achando que custava R$3,60) e o **barato como "premium"** (achando R$9,36). O endpoint novo é 2,6x mais barato **e** entrega mais. → Trocado; o "premium" foi **descontinuado** (SKU duplicado que custava mais e entregava menos).

**B) 💰 CNDT: alternativa 85% mais barata**

`ic-cndt` (R$7,92) x `cert-pf-debitos-trabalhistas` (**R$1,16**) — mesma certidão, e a nova ainda retorna PDF. Usada em 5 planos. → Trocado.

**C) 💰 SCR: alternativa 39% mais barata**

Existem 3: `ic-bacen` (R$10,30), `bacen` (R$6,93), `scr-premium` (**R$6,28**). Usávamos o mais caro. → Trocado.

**D) ⚠️ `serasa-basica` sumiu da tabela de preços** (endpoint ainda existe na doc, mas sem preço publicado) → trocado por `r-cadastrais-score-dividas` (R$3,04, mesmo conteúdo).

**E) 🐛 Bug corrigido**: `planos.ts` chamava `"proprietario"` em 3 planos veiculares — nome que **nem o mapping nem a Edge conhecem** (ambos usam `"proprietario-placa"`). Só não quebrou porque o fallback `PLAN_API_MAP` da Edge tem o nome certo.

**F) ⚠️ Pendente de investigação**: `crlv` tem summary "Busca dados **CRLV-MG**" e aceita campo `state` que **não enviamos**. Verificar se entrega fora de Minas antes de promover o produto.

### 1.1 Resultado: custo caiu apesar do reajuste

| Plano | Custo antes | Custo depois | Δ |
|---|---|---|---|
| CNPJ + Sócios | R$13,94 | **R$7,18** | −48% |
| CPF Premium | R$29,26 | **R$22,50** | −23% |
| CPF Raio-X | R$47,96 | **R$37,18** | −22% |
| Veicular Avançado | R$26,99 | **R$20,65** | −23% |
| Roubo/Furto avulso | R$10,39 | **R$4,05** | −61% |

**Margem mínima da base inteira: B2C 62% · B2B 40%** (regra: ≥60% / ≥40%). Antes havia SKU com 16% de margem B2B.

### 1.2 Preços ajustados (aprovados)

| SKU | B2C | B2B |
|---|---|---|
| Veicular Total | 249,90 → **279,90** | 124,90 → **179,90** |
| Auctioneer Total | 199,90 → **249,90** | 119,90 → **159,90** |
| CRLV avulso | 49,99 → **59,99** | 29,99 → **37,99** |
| CPF Premium | — | 39,90 → **49,90** |
| CPF Raio-X | — | 64,90 → **79,90** |
| Veicular Avançado | — | 29,90 → **34,90** |
| Vip Car avulso | — | 49,99 → **57,99** |
| Pré-Lance / Leilão histórico / Foto leilão | — | +R$1 a R$4 (piso 40%) |

### 1.3 Contexto do reajuste APIFULL (referência)

A APIFULL subiu **~10% (Nível 1)** em quase tudo. Conta Capivara = **Nível 1** (confirmado).

### 1.4 Custos N1 vigentes (22/09/2026)

Fonte única no código: `src/lib/apifull/mapping.ts` (espelhado inline na Edge `process-consultation` e em `docs/OPERACAO.md`).

| Endpoint (path) | Custo N1 |
|---|---|
| `placa-basica` · `fipe` · `pf-dadosbasicos` · `cnpj` | R$0,07–0,12 |
| `ic-cpf-completo` | R$0,66 |
| `cert-pf-debitos-trabalhistas` ⬅ novo | R$1,16 |
| `cpf-ultra` | R$2,92 |
| `gravame` | R$2,42 |
| `scpc-boavista` · `r-cadastrais-score-dividas` ⬅ novo · `ic-bin-estadual` | R$3,03–3,04 |
| `ic-bin-nacional` | R$3,30 |
| `ic-proprietario-atual` | R$3,76 |
| `ic-recall` · `roubo-furto` ⬅ novo | R$3,96 |
| `csv-renainf-renajud-recall-bin-proprietario` | R$4,95 |
| `ic-quod` | R$5,26 |
| `scr-premium` ⬅ novo | R$6,28 |
| `serasa-premium` | R$7,39 |
| `spc-brasil` | R$8,40 |
| `leilao` | R$9,64 |
| `ic-foto-leilao` | R$13,20 |
| `crlv` | R$22,31 |
| `ic-vipcar` | R$34,32 |

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
| **SKUs (22/09)** | 29 | **67 no ar** — +38 hoje |
| Combos | 17 | ~28 |
| Avulsos | 13 | ~45 |
| SKUs total | 30 | **~73** |
| Ticket range | R$7,90–249,90 | R$9,99–999,00 |

Destaques de margem nos novos: certidões (83-91%), CEP (93%), processos judiciais (98%), busca reversa (92-97%).

---

## 6. Roadmap sugerido

| Fase | O quê | Esforço |
|---|---|---|
| ~~**0**~~ | ~~Confirmar nível/paths/renames~~ ✅ **FEITO 22/09** via OpenAPI + confirmação do Lucas | — |
| ~~**1**~~ | ~~Reprecificação~~ ✅ **FEITO 22/09** — custos + 4 paths otimizados + 11 preços + bug `proprietario` | — |
| **2a** | ~~Quick wins veiculares~~ ✅ **FEITO 22/09**: Multas e Débitos, RENAINF, RENAJUD, ATPV-e, Placa Radar (5 SKUs no ar) | — |
| **2b** | ~~Avulsos de CPF/CNPJ~~ ✅ **FEITO 22/09**: 13 SKUs no ar (9 CPF + 4 CNPJ). Form/action agora aceitam placa, CPF ou CNPJ conforme a categoria — **desbloqueio que habilita o nicho de Certidões** | — |
| **2c** | Busca reversa (por Nome `ic-nome`, por Telefone `pessoa-telefone`). Input é nome/telefone, não documento — exige novo tipo de alvo no form + revisão das finalidades LGPD (skip tracing é o uso mais sensível do catálogo) | 1 dia |
| ~~**3**~~ | ~~Nicho Certidões~~ ✅ **FEITO 22/09**: 4 kits + 6 avulsas + landing `/consultar/certidoes` (10 SKUs, 16 endpoints). Estaduais fora (exigem campo UF) | — |
| ~~**4**~~ | ~~Compliance/KYC + Judicial~~ ✅ **FEITO 22/09**: 7 SKUs + landing `/consultar/compliance` |  — |
| ~~**5**~~ | ~~Raio-X do CEP~~ ✅ **FEITO 22/09**: 2 SKUs + landing `/consultar/local` + **migration 0014** (categoria `cep`) + suporte a CEP em toda a cadeia | — |
| ~~**6**~~ | ~~Premium~~ ✅ **FEITO 22/09**: Rastreamento R$249,99. Finanças da Empresa (custo R$396) fica fora do self-service — venda consultiva | — |

---

## 7. Pendências técnicas pra implementar

- [x] ✅ **Paths** — obtidos do contrato OpenAPI oficial (`doc.apifull.com.br/openapi.json`, 272 paths). Todos os slugs da Fase 2 já mapeados na seção 2
- [x] ✅ **N1 confirmado** (Lucas 22/09). Se o volume crescer, negociar N2 (−8 a 17% em tudo)
- [x] ✅ Renames investigados: **não houve rename** — todos os paths antigos existem. O que houve foram endpoints NOVOS mais baratos (ver 1.0) e `serasa-basica` perdendo preço público
- [ ] ⚠️ **CRLV fora de MG**: summary diz "CRLV-MG" e o endpoint aceita `state` que não enviamos — testar placa de SP antes de promover
- [x] ✅ TTLs definidos pros 5 do bloco 2a (débitos/RENAINF 12h · RENAJUD 24h · ATPV-e 7d · radar 24h)
- [x] ✅ TTLs de certidões (24h — validade curta), processos (24h), CNH (7d), imóveis (30d)
- [x] ✅ TTLs do CEP (30d — dado censitário muda devagar)
- [ ] **Renderizadores dedicados de PDF**: o OpenAPI documenta só o envelope (`status`/`dados`/`aux`), não o formato interno de `dados` — escrever renderizador adivinhando campos daria PDF vazio. Os novos usam `renderGeneric` (que agora expande arrays de objetos em blocos legíveis). Calibrar com a 1ª consulta real de cada API
- [x] ✅ **Form avulso** agora aceita placa/CPF/CNPJ por categoria (helpers `alvoDoProduto` / `categoriaBanco` em planos.ts)
- [ ] **Alvo por nome/telefone** (fase 2c): form já lida com placa/CPF/CNPJ/CEP; busca reversa (`ic-nome`, `pessoa-telefone`) precisa de mais um tipo de alvo + revisão das finalidades LGPD (skip tracing é o uso mais sensível do catálogo)
- [x] ✅ **Migration 0014 aplicada**: `consultations.category` agora aceita `cep`. ALTER de CHECK, não destrutivo — 21 registros preservados
- [ ] Categorias novas exigem: `CategoriaConsulta` ampliada + constraint `consultations.category` (migration) + landings + templates PDF
- [ ] Finalidades LGPD específicas pros produtos de skip tracing

---

## 8. Paths confirmados (OpenAPI 22/09) — prontos pra implementar

Todos verificados contra `doc.apifull.com.br/openapi.json`. Método POST, body com `link` = path.

### Veicular
| Produto | path | custo |
|---|---|---|
| Multas e Débitos | `veiculo-dados-debitos` | 2,97 |
| RENAINF | `renainf` | 3,96 |
| RENAJUD | `renajud` | 3,96 |
| ATPV-e 2ª via | `atpv-e` | 2,40 |
| Placa Radar | `placa-radar` | 0,83 |
| Frota por CPF | `pf-veiculos` | 5,28 |
| Frota por CNPJ | `pj-veiculos` | 5,28 |
| ANTT/RNTRC | `veiculo-combo-rntrc` | 5,10 |
| Rastreamento | `veiculo-rastreamento` | 87,12 |
| CNH (com foto) | `pf-cnh-v2` | 2,67 |

### CPF
| Produto | path | custo |
|---|---|---|
| Processos Judiciais | `pf-processos-judiciais` | 0,31 |
| Antecedentes Criminais | `cert-pf-antecedentes-criminais` | 1,16 |
| Busca pelo Nome | `ic-nome` | 1,65 |
| Busca por Telefone | `pessoa-telefone` | 0,50 |
| Dark Web | `pf-darkweb` | 1,16 |
| Renda e Patrimônio | `pf-dados-financeiros` | 1,41 |
| Vínculos e Parentes | `pf-pessoas-relacionadas` | 0,22 |
| Imóveis | `consulta-imoveis` | 7,70 |
| Vida Profissional | `pf-dados-profissionais` | 0,44 |
| Validação CPF×Telefone | `pf-validacao-telefone` | 2,31 |
| Restituição IR | `pf-restituicao-ir` | 0,22 |
| Servidor Público | `pf-servidor-publico` | 0,22 |
| PEP / Óbito / Mandados / Score cadastral | `pf-pep` · `pf-obito` · `pf-mandados-prisao` · `pf-score-cadastral` | 0,09–0,22 |

### CNPJ
| Produto | path | custo |
|---|---|---|
| Processos Judiciais | `pj-processos-judiciais` | 0,31 |
| Quadro Societário | `pj-quadro-societario` | 0,31 |
| Participação Societária | `pj-participacao-societaria` | 5,65 |
| QUOD Score / Consulta | `pj-quod-score` · `pj-quod-consulta` | 8,98 / 14,01 |
| Define Risco / Negócio / Limite | `pj-define-risco` · `pj-define-negocio` · `pj-define-limite` | 16,60 / 27,10 / 31,98 |
| Sintegra | `pj-sintegra` | 1,16 |
| Localização | `pj-localizacao` | 0,24 |

### Compliance / Judicial
| Produto | path | custo |
|---|---|---|
| PLD PF / PJ / QSA | `pf-compliance-pld-v3` · `pj-compliance-pld-v3` · `pj-compliance-pld-qsa-v3` | 2,25 / 6,75 / 6,75 |
| Protesto Nacional | `protesto-nacional` | 3,76 |
| CADIN | `cadin` | 0,88 |
| Dívida Ativa PGFN | `cert-pf-divida-ativa-pgfn` | 1,16 |
| Ações e Processos | `r-acoes-e-processos-judiciais` | 1,98 |

### Certidões (todas R$1,16, exceto SUFRAMA 1,32)
Padrão de nome: `cert-pf-*` e `cert-pj-*`. Principais: `cert-pf-pgfn`, `cert-pf-debitos-trabalhistas`,
`cert-pf-antecedentes-criminais`, `cert-pf-negativa-cnj`, `cert-pf-judicial-nada-consta`,
`cert-pj-fgts`, `cert-pj-pgfn`, `cert-pj-situacao-cadastral`, `cert-pj-debitos-trabalhistas`,
`cert-pj-negativa-cgu`, `cert-pj-negativa-cnj` + variantes IBAMA/estaduais.

### Inteligência de Local (CEP) — prefixo `mercado-*`
`mercado-sociodemografico` (0,33) · `mercado-risco-geografico` (0,33) · `mercado-concorrencia` (0,33) ·
`mercado-infraestrutura-urbana` (0,18) · `mercado-macroeconomicos` (0,33) ·
`mercado-gastos-*` (11 categorias: alimentacao, consumo, diversos, educacao, habitacao, higiene,
recreacao, saude, servicos, transporte, vestuario — R$0,09 cada) ·
`mercado-propensao-seguro` · `mercado-precos-saude` · `mercado-seguro-patologia` (0,18)

### Bônus encontrados no OpenAPI (não estavam na lista de preços)
`pf-historico-academico` · `pf-doacoes-politicas` · `pj-doacoes-politicas` · `pf-sancoes-restricoes` ·
`pj-sancoes-restricoes` · `pf-score-credito-nv` · `csv-v2` · `serasa-premium-v2` · `rating-credito-bancario` ·
`nome-endereco` (busca reversa por nome/endereço) · `reconhecimento-facial`


---

## 9. Decisão de SEO revista (22/09)

A auditoria de julho colocou `noindex` em `/consultar/avulso/[id]` e
`/consultar/[categoria]/[plano]` pra evitar "preço velho cacheado no Google".

**Revisto**: com 57 SKUs — a maioria de cauda longa ("certidão PGFN online",
"consultar antecedentes criminais", "multas por placa") — essas são as páginas
que mais trazem busca orgânica, o canal principal do B2C. O risco de preço
desatualizado é o mesmo de qualquer e-commerce (o Google recacheia em dias) e
o sitemap **já listava essas páginas**, ou seja, o sinal era contraditório.

- Páginas de **produto** → indexáveis
- **Checkout** (`/consultar/aguardando/[id]`, com QR/boleto) → ganhou o `noindex` que faltava
- Sitemap passa a derivar de `TODOS_PRODUTOS_AVULSO` (fonte única) — 23 produtos
  novos estavam fora dele. Hoje: 100 URLs, 40 de produto avulso.

Se aparecer reclamação real de preço antigo no Google, o caminho é atualizar o
`lastModified` do sitemap e pedir reindexação — não voltar o noindex.


---

## 10. Estado final (22/09/2026)

**67 SKUs no ar** (eram 29 de manhã), em **8 nichos**:

| Nicho | Landing | SKUs |
|---|---|---|
| CPF | `/consultar/cpf` | 5 planos + 9 avulsos |
| CNPJ | `/consultar/cnpj` | 4 planos + 4 avulsos |
| Veicular | `/consultar/veicular` | 5 planos + 15 avulsos |
| Leilão | `/consultar/leilao` | 3 combos + 3 avulsos |
| **Certidões** | `/consultar/certidoes` | 4 kits + 6 avulsas |
| **Compliance/KYC** | `/consultar/compliance` | 2 KYC + 2 PLD + 3 judiciais |
| **Local (CEP)** | `/consultar/local` | 2 relatórios |
| Premium | — | Rastreamento R$249,99 |

Margem mínima da base: **B2C 62% · B2B 40%** (regra: ≥60% / ≥40%).

### Invariantes validadas a cada bloco

Script de verificação roda sobre o catálogo real e checa:
1. custo declarado == soma do mapping
2. margem B2C ≥60% e B2B ≥40%
3. **coerência alvo × API** (produto de CNPJ não pode usar endpoint que espera CPF)
4. todo SKU presente no `PLAN_API_MAP` da Edge
5. toda API do catálogo com endpoint correspondente na Edge
6. todo ícone do catálogo presente no `ICONS` map do card

Os itens 3 e 6 nasceram de bugs reais encontrados hoje.

### O que ficou de fora (decisão consciente)

- **Busca reversa** por nome/telefone — precisa de tipo de alvo novo e revisão
  LGPD (é o uso mais sensível do catálogo)
- **Certidões estaduais** — exigem campo UF no formulário
- **`pf-score-cadastral`, `pf-validacao-telefone`** — exigem nome/data-nasc/telefone
  que não coletamos
- **`pf-pep`, `pf-sancoes-restricoes`** — sem preço publicado na tabela (risco de margem)
- **Finanças da Empresa** (R$396 de custo) — venda consultiva, não self-service
- **Seguidores de Instagram/TikTok** — nunca; destrói a credibilidade de um
  produto de verificação

### Pendência que não é de catálogo

Os renderizadores de PDF dos produtos novos usam `renderGeneric` (que hoje
expande arrays de objetos em blocos legíveis). O OpenAPI documenta só o envelope
(`status`/`dados`), então um renderizador dedicado seria adivinhação — calibrar
com a primeira consulta real de cada API.
