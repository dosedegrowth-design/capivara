/**
 * Documentos legais versionados.
 *
 * Cada documento tem:
 *  - type (chave estavel pra DB)
 *  - version (semver-like; bump quando texto muda)
 *  - title (titulo legivel)
 *  - text (markdown/HTML completo do documento)
 *
 * O hash SHA-256 do `text` e o que vai pra `consent_logs.document_hash`,
 * garantindo que se um documento for trocado, novos aceites tenham
 * hashes diferentes — e a gente saiba EXATAMENTE qual versao o user leu.
 *
 * REGRA: nunca edite o `text` sem bumpar a `version`. Sempre crie uma nova
 * versao (1.0 -> 1.1) e mantenha a antiga acessivel pra historico de
 * aceites.
 */

import { createHash } from "crypto";

export type DocumentType =
  | "terms_of_use"
  | "privacy_policy"
  | "cookie_policy"
  | "consultation_responsibility"
  | "company_terms"
  | "api_terms";

export interface LegalDocument {
  type: DocumentType;
  version: string;
  title: string;
  effectiveDate: string; // ISO
  /** Markdown/HTML do documento — vai pro registro de aceite */
  text: string;
  /** Resumo curto pra exibir no checkbox de aceite */
  shortLabel: string;
  /** URL publica onde o documento pode ser visualizado */
  publicUrl: string;
}

// =============================================================================
// TERMOS DE USO (cadastro)
// =============================================================================
export const TERMS_OF_USE: LegalDocument = {
  type: "terms_of_use",
  version: "1.1.0",
  title: "Termos de Uso da Capivara",
  effectiveDate: "2026-05-22",
  shortLabel: "Li e aceito os Termos de Uso",
  publicUrl: "/termos",
  text: `# Termos de Uso da Capivara

**Versão 1.1.0 · Vigência a partir de 22 de maio de 2026**

Bem-vinda à Capivara. Estes Termos de Uso ("Termos") regem o acesso e o uso da plataforma Capivara ("Plataforma"), operada por Dose de Growth ("Capivara", "nós", "nosso"). Ao criar conta, fazer login ou usar qualquer recurso da Plataforma, você ("Usuário") declara que leu, entendeu e concorda com estes Termos integralmente.

## 1. Objeto da Plataforma

A Capivara é um serviço online que disponibiliza consultas a bases de dados públicas e privadas sobre pessoas físicas (CPF), pessoas jurídicas (CNPJ) e veículos (placas), agregando e apresentando o resultado em formato de relatório PDF assinado eletronicamente.

A Capivara **não é** um bureau de crédito, agência de informação ou birô de dados. Atuamos como **intermediária técnica** que consulta fontes oficiais e privadas autorizadas pelo Usuário e entrega o resultado consolidado.

## 2. Cadastro e Conta

### 2.1. Para criar conta, você declara:
- Ter no mínimo 18 anos completos ou estar legalmente emancipado
- Ser plenamente capaz de assumir as obrigações destes Termos
- Que todas as informações fornecidas no cadastro são verdadeiras, completas e atualizadas
- Que tem CPF/CNPJ válido e ativo na Receita Federal

### 2.2. Responsabilidades do Usuário pela conta:
- Manter sigilo absoluto sobre sua senha
- Notificar imediatamente qualquer uso não autorizado da conta
- Não compartilhar acesso com terceiros
- Atualizar os dados cadastrais sempre que mudarem

### 2.3. A Capivara pode suspender ou encerrar a conta a qualquer momento, sem aviso prévio, em caso de:
- Violação destes Termos
- Suspeita de uso fraudulento, ilícito ou em desacordo com a finalidade declarada
- Inadimplência de pagamento
- Determinação judicial ou regulatória

## 3. Uso da Plataforma

### 3.1. Finalidade declarada (LGPD Art. 7º)
**TODA consulta exige declaração de finalidade legítima** no momento da requisição. As finalidades aceitas são:
- Análise de crédito
- Análise de locação
- Contratação e Recursos Humanos
- Due diligence comercial
- Prevenção a fraude
- Compliance regulatório (KYC, AML)
- Outras finalidades específicas (descrever)

**É VEDADO o uso da Plataforma para:**
- Curiosidade pessoal ou stalking
- Discriminação ilegal (origem, religião, orientação sexual, política)
- Marketing direto sem consentimento do titular
- Revenda de dados a terceiros
- Qualquer finalidade contrária à legislação brasileira

### 3.2. Responsabilidade pelo uso
O Usuário declara e garante:
- Ter base legal lícita (LGPD Art. 7º) para cada consulta realizada
- Ser inteiramente responsável pelo uso e tratamento dos dados obtidos
- Adotar as medidas técnicas e organizativas adequadas à proteção dos dados (LGPD Art. 46)
- Responder integralmente por danos causados a terceiros decorrentes de uso indevido

A Capivara **não se responsabiliza** pelo uso que o Usuário faz dos dados obtidos. Em caso de litígio com o titular dos dados consultados ou multa da ANPD, **a responsabilidade é exclusiva do Usuário**.

## 4. Cobrança e Pagamentos

### 4.1. Modelo de negócio
- **Avulso (B2C)**: pagamento por consulta via PIX, boleto ou cartão. Sem mensalidade. Sem fidelidade.
- **B2B (empresas)**: créditos prepagos (Pacotes Manada). Cada consulta debita do saldo. Sem mensalidade.

### 4.2. Reembolso
Não há reembolso para consultas concluídas com sucesso. Em caso de erro técnico (consulta não realizada, PDF não gerado, falha em API externa), os créditos são devolvidos automaticamente ao saldo da empresa (B2B) ou disponibilizados como crédito futuro (B2C).

### 4.3. Cache 24h
Consultar o mesmo alvo + mesmo plano dentro de 24h não gera nova cobrança. O resultado vem do cache automaticamente. Empresas no plano Manada Plus têm cache estendido para 7 dias.

### 4.4. NF-e
Para clientes B2B, a NF-e é emitida automaticamente pelo Asaas após confirmação do pagamento da recarga.

## 5. Propriedade Intelectual

### 5.1. Da Capivara
- Marca, logotipo, identidade visual e interface da Plataforma
- Código-fonte e arquitetura técnica
- Modelo de agregação e apresentação dos dados em PDF

### 5.2. Dos titulares dos dados
Os dados consultados pertencem aos respectivos titulares (pessoas físicas, jurídicas ou proprietários de veículos) e/ou às fontes que os disponibilizam. A Capivara é apenas intermediária técnica.

### 5.3. Do Usuário
O relatório PDF gerado pode ser usado pelo Usuário para a finalidade declarada. Não é permitido republicar, revender ou redistribuir o conteúdo do relatório a terceiros sem base legal própria.

## 6. Disponibilidade e Limitações

### 6.1. Best effort
A Plataforma é disponibilizada "como está", em regime de melhor esforço. Não garantimos:
- Disponibilidade ininterrupta (SLA específico apenas em contratos enterprise)
- Atualização instantânea das bases consultadas (depende dos fornecedores)
- Exatidão absoluta dos dados (dependem das fontes oficiais e privadas)

### 6.2. Manutenções
Manutenções programadas serão comunicadas com 24h de antecedência. Manutenções emergenciais podem ocorrer sem aviso prévio.

### 6.3. Natureza do serviço — INTERMEDIAÇÃO TÉCNICA SEM GARANTIA

**A Capivara é exclusivamente intermediária técnica entre o Usuário e as bases de dados públicas e privadas consultadas. NÃO somos fonte primária de informação, NÃO produzimos os dados e NÃO garantimos sua veracidade, atualidade, completude, exatidão ou exaustividade.**

Especificamente, o Usuário reconhece e aceita:

**(a) Apenas repassamos.** Toda informação contida em um relatório Capivara é proveniente de fontes externas (Receita Federal, Detran, Serasa, Boa Vista, SPC, SCR Bacen, cartórios, bureaus privados, etc.). Nós consolidamos e apresentamos, mas não criamos, validamos ou garantimos.

**(b) Os dados podem estar desatualizados.** As bases consultadas têm seus próprios ciclos de atualização (horas, dias, semanas). Uma multa, sinistro, débito, protesto ou restrição pode ter sido lançado nas fontes APÓS a consulta. O relatório reflete o que existia nas fontes no exato momento da consulta — e nada além disso.

**(c) Os dados podem ter erros nas fontes.** Erros de cadastro, homonímia, atrasos de propagação entre sistemas, dados não migrados de papel pra digital — tudo isso é fora do nosso controle. Se há divergência entre nosso relatório e a fonte oficial, a fonte oficial prevalece.

**(d) Específico para consulta veicular.** Histórico veicular muda com frequência: novas multas, débitos de IPVA, transferências, sinistros, leilões, recalls. Um veículo pode ter sido vendido em leilão APÓS você consultá-lo. Sinistro ocorrido depois da nossa consulta não aparecerá. Recall lançado depois não aparecerá. **Para uso oficial (compra/venda formal, processo judicial), sempre confirme com o Detran no dia da operação.**

**(e) Específico para CPF/CNPJ.** Score, dívidas e restrições mudam diariamente. Pessoa com score alto na consulta pode ficar inadimplente no mês seguinte. Empresa ativa pode ser baixada na semana seguinte. **Para decisões críticas, repita a consulta na data da decisão.**

**(f) Não somos auditoria nem perícia.** O relatório Capivara não substitui parecer jurídico, contábil, técnico veicular ou auditoria especializada. É apenas um insumo informativo.

**(g) Em caso de problema posterior.** Se você usou um relatório Capivara, fechou negócio com base nele, e DEPOIS surgiu uma informação relevante (sinistro descoberto, dívida nova, fraude descoberta), **a Capivara não responde**. Você concordou que estávamos apenas mostrando o que as fontes diziam naquele exato momento.

O Usuário expressamente isenta a Capivara de qualquer responsabilidade civil, criminal ou administrativa decorrente de:
- Desatualização de dados em relação à fonte primária
- Inexatidão originada nas fontes
- Ausência de informação que existia nas fontes mas não foi disponibilizada via API
- Decisões comerciais, judiciais ou pessoais tomadas com base no relatório
- Eventos supervenientes (posteriores à consulta) não refletidos no relatório

## 7. Limitação de Responsabilidade

Na máxima extensão permitida pela legislação brasileira, a Capivara não responde por:
- Lucros cessantes, danos indiretos ou consequenciais
- Decisões tomadas pelo Usuário com base nos relatórios
- Erros, inexatidões ou desatualizações dos dados de fontes externas
- Uso indevido ou em desacordo com estes Termos pelo Usuário

O valor máximo de indenização, em qualquer hipótese, fica limitado ao valor total efetivamente pago pelo Usuário à Capivara nos 12 (doze) meses anteriores ao evento.

## 8. LGPD e Proteção de Dados

### 8.1. Capivara como Operadora
A Capivara atua como **operadora** de dados pessoais (LGPD Art. 5º, VII) por conta e ordem do Usuário (controlador). O Usuário é o responsável por:
- Definir e declarar a finalidade legítima
- Garantir a base legal aplicável (LGPD Art. 7º)
- Atender aos direitos do titular (LGPD Art. 18)
- Notificar incidentes envolvendo os dados obtidos

### 8.2. Capivara como Controladora
Para os dados do próprio Usuário (cadastro, pagamento, navegação), a Capivara é controladora. O tratamento desses dados é descrito na nossa Política de Privacidade (/privacidade).

### 8.3. Retenção
- Relatórios de consulta: 90 dias acessíveis, depois anonimizados automaticamente
- Logs de aceite (consent_logs): 5 anos (prazo prescricional administrativo LGPD)
- Dados de cadastro: enquanto a conta estiver ativa + 5 anos após encerramento

## 9. Atualizações destes Termos

Estes Termos podem ser atualizados periodicamente. Mudanças relevantes serão comunicadas por email com 15 dias de antecedência. O uso continuado da Plataforma após a vigência da nova versão implica aceite tácito.

O histórico de versões fica disponível na seção "Meus aceites" do painel da conta.

## 10. Foro

Fica eleito o foro da Comarca de São Paulo - SP para dirimir qualquer questão decorrente destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

## 11. Contato

- LGPD / Encarregado de Dados (DPO): lgpd@capivara.app
- Suporte: contato@capivara.app
- Endereço corporativo: a ser informado quando a empresa estiver oficialmente constituída

---

**Ao clicar em "Aceito os Termos de Uso", você declara que leu integralmente, entendeu e concorda com todas as cláusulas acima.**
`,
};

// =============================================================================
// POLÍTICA DE PRIVACIDADE (cadastro)
// =============================================================================
export const PRIVACY_POLICY: LegalDocument = {
  type: "privacy_policy",
  version: "1.1.0",
  title: "Política de Privacidade da Capivara",
  effectiveDate: "2026-05-22",
  shortLabel: "Li e aceito a Política de Privacidade",
  publicUrl: "/privacidade",
  text: `# Política de Privacidade da Capivara

**Versão 1.1.0 · Vigência a partir de 22 de maio de 2026**

Esta Política de Privacidade descreve como a Capivara coleta, usa, armazena e protege dados pessoais dos usuários da plataforma, em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018 — "LGPD").

## 1. Quem é a controladora

**Capivara** (operada por Dose de Growth) é a controladora dos dados pessoais dos seus usuários cadastrados.

### 1.1. Encarregado de Proteção de Dados (DPO)

Conforme LGPD Art. 41, designamos um Encarregado responsável por:
- Receber comunicações da ANPD e dos titulares
- Orientar nossos colaboradores sobre proteção de dados
- Executar demais atribuições determinadas pela controladora

**Contato do Encarregado:**
- Email: **lgpd@capivara.app**
- Tempo de resposta: até 15 dias úteis (LGPD Art. 19)

### 1.2. Identificação da operadora

A Capivara atua como **controladora** dos dados dos seus usuários cadastrados, e como **operadora** dos dados pessoais que os usuários consultam por nosso intermédio (CPF, CNPJ, dados veiculares de terceiros).

Quando você (usuário) consulta dados de um terceiro pela Capivara, **VOCÊ é o controlador** desses dados de terceiros e é responsável pelo tratamento conforme LGPD. Nós executamos a busca por sua conta e ordem.

## 2. Quais dados coletamos

### 2.1. Dados que VOCÊ fornece
- **Cadastro**: nome completo, CPF, email, telefone (opcional), senha (hash bcrypt)
- **Empresa (B2B)**: CNPJ, razão social, nome fantasia, email de faturamento
- **Pagamento**: dados de cartão (processados pelo gateway Asaas, não armazenamos), dados de PIX/boleto
- **Comunicação**: mensagens enviadas ao suporte

### 2.2. Dados coletados automaticamente
- **Navegação**: IP, user-agent, páginas visitadas, timestamp
- **Telemetria de consulta**: alvo consultado, plano selecionado, finalidade declarada
- **Cookies essenciais**: sessão, CSRF, preferências (sem cookies de marketing por padrão)

### 2.3. Dados que NÃO coletamos
- Cookies de marketing/tracking de terceiros (sem Google Analytics 4 ou similar com perfil identificável)
- Dados de localização GPS precisos
- Dados biométricos
- Dados de menores de 18 anos (a Plataforma é restrita a adultos)

## 3. Por que coletamos (base legal)

### 3.1. Bases legais aplicáveis
| Finalidade | Base legal (LGPD Art. 7º) |
|---|---|
| Operação da conta | Execução de contrato (V) |
| Cobrança e pagamento | Execução de contrato (V) |
| Cumprimento de obrigação legal (fiscal, antifraude) | Obrigação legal (II) |
| Auditoria e logs de segurança | Legítimo interesse (IX) |
| Comunicação transacional (email pós-consulta) | Execução de contrato (V) |
| Comunicação de marketing | Consentimento (I) — opt-in explícito |

### 3.2. Logs de aceite (consent_logs)
Cada aceite de Termos, Política de Privacidade, consentimento LGPD ou termo de responsabilidade é registrado com:
- IP do dispositivo
- User-agent (navegador)
- Timestamp ISO 8601
- Hash do documento aceito (SHA-256)
- Texto completo do documento (snapshot imutável)

Esses registros são mantidos por 5 anos.

## 4. Com quem compartilhamos

### 4.1. Operadores nossos
- **Supabase** (banco de dados, autenticação, storage) — Frankfurt, Alemanha (GDPR-compliant) ou São Paulo, Brasil
- **Vercel** (hospedagem do site/API) — Brasil (região gru1)
- **Asaas** (pagamento PIX/boleto/cartão + NF-e) — Brasil
- **Resend** (email transacional) — União Europeia
- **Bureaus de dados** (apenas para a consulta solicitada, com finalidade declarada)

Cada operador tem contrato de processamento (DPA) com cláusulas de proteção alinhadas à LGPD.

### 4.2. Quando NÃO compartilhamos
- Nunca vendemos dados pessoais
- Nunca compartilhamos pra marketing de terceiros
- Não cedemos dados de consulta a outras empresas, exceto quando solicitado pelo próprio Usuário (export LGPD)

### 4.3. Quando podemos ser obrigados a compartilhar
- Ordem judicial específica e fundamentada
- Requisição da ANPD em procedimento administrativo
- Investigação policial mediante mandado

Nesses casos, o Usuário será notificado, exceto quando a legislação proibir a notificação.

## 5. Por quanto tempo guardamos

| Categoria de dado | Prazo |
|---|---|
| Cadastro (perfil ativo) | Enquanto a conta estiver ativa |
| Cadastro (conta encerrada) | 5 anos após encerramento (prazo prescricional) |
| Relatórios de consulta | 90 dias acessíveis, depois anonimizados automaticamente |
| Logs de pagamento | 5 anos (obrigação fiscal) |
| Logs de aceite (consent_logs) | 5 anos (LGPD) |
| Cookies de sessão | Até logout ou 30 dias |
| Logs de segurança | 6 meses |

## 6. Seus direitos (LGPD Art. 18)

Você pode, a qualquer momento:
- **Confirmar** se tratamos seus dados (Art. 18 I)
- **Acessar** seus dados (Art. 18 II)
- **Corrigir** dados incorretos (Art. 18 III)
- **Eliminar dados anonimizados, desnecessários ou tratados em desconformidade** (Art. 18 IV)
- **Portabilidade**: receber seus dados em formato estruturado (Art. 18 V) — disponível em /configuracoes
- **Eliminar dados tratados com consentimento** (Art. 18 VI) — disponível em /configuracoes
- **Saber com quem compartilhamos** (Art. 18 VII)
- **Revogar consentimento** (Art. 18 IX)

Para exercer esses direitos: lgpd@capivara.app ou diretamente em /configuracoes.

## 7. Segurança

### 7.1. Medidas técnicas
- HTTPS obrigatório em todas as conexões
- Senhas em bcrypt (custo 10+)
- API keys em hash SHA-256 (nunca em texto puro no banco)
- Row Level Security (RLS) em todas as tabelas com dados de usuário
- Logs de acesso administrativo
- Backups diários do Supabase

### 7.2. Procedimento em caso de incidente de segurança (LGPD Art. 48)

Caso ocorra incidente de segurança envolvendo dados pessoais que possa causar risco ou dano relevante aos titulares, a Capivara se compromete a:

1. **Conter o incidente** o mais rápido possível
2. **Investigar e documentar** a natureza, dados afetados, número aproximado de titulares envolvidos
3. **Notificar a ANPD** em prazo razoável (referência: 2 dias úteis)
4. **Notificar os titulares afetados** quando o risco for relevante
5. **Aplicar medidas corretivas** pra evitar reincidência

Canal de comunicação de incidentes (interno ou externo): **lgpd@capivara.app**

Se você suspeitar que sua conta ou seus dados foram comprometidos, contate-nos imediatamente.

### 7.3. Adequação dos operadores (Art. 39)

Nossos operadores (Supabase, Vercel, Asaas, Resend) têm contratos com cláusulas de proteção de dados (DPA) alinhadas à LGPD. Para clientes empresariais que precisem de DPA específico (subprocessador), entre em contato pelo lgpd@capivara.app.

## 8. Cookies

A Capivara usa apenas cookies essenciais:
- **Sessão de autenticação** (Supabase Auth)
- **CSRF token** (proteção contra ataques)
- **Preferências locais** (tema, idioma — armazenado em localStorage)

Não usamos cookies de tracking de terceiros (Google Analytics, Facebook Pixel) por padrão. Caso isso mude no futuro, você será notificada e poderá optar.

Detalhes completos: /cookies

## 9. Crianças e adolescentes

A Capivara é restrita a maiores de 18 anos. Não coletamos dados de menores intencionalmente. Se descobrir que coletamos dados de alguém menor de 18, contate-nos imediatamente em lgpd@capivara.app para remoção.

## 10. Transferência internacional

Alguns operadores nossos (Supabase Frankfurt, Resend UE) processam dados fora do Brasil. Garantimos que essa transferência ocorre:
- Em países com nível adequado de proteção (LGPD Art. 33 I), OU
- Com cláusulas contratuais padrão (DPA) (LGPD Art. 33 II)

## 11. Atualizações

Esta Política pode ser atualizada. Mudanças relevantes serão comunicadas por email com 15 dias de antecedência. Versões antigas ficam disponíveis na seção "Meus aceites" do painel.

## 12. Contato

- DPO / Encarregado: lgpd@capivara.app
- Suporte: contato@capivara.app

---

**Ao clicar em "Aceito a Política de Privacidade", você declara que leu, entendeu e concorda com o tratamento dos seus dados conforme descrito acima.**
`,
};

// =============================================================================
// TERMO DE RESPONSABILIDADE POR CONSULTA (pré-consulta)
// =============================================================================
export const CONSULTATION_RESPONSIBILITY: LegalDocument = {
  type: "consultation_responsibility",
  version: "1.1.0",
  title: "Termo de Responsabilidade por Consulta",
  effectiveDate: "2026-05-22",
  shortLabel:
    "Declaro ter base legal pra consultar, aceito que a Capivara só repassa dados de fontes externas e isento de responsabilidade pelo uso.",
  publicUrl: "/responsabilidade-consulta",
  text: `# Termo de Responsabilidade por Consulta

**Versão 1.1.0 · Vigência a partir de 22 de maio de 2026**

Ao iniciar uma consulta de CPF, CNPJ ou dados veiculares na plataforma Capivara, eu, identificado(a) pelos dados de cadastro na minha conta e pelo endereço IP registrado, **declaro e me comprometo expressamente** com o seguinte:

## 1. Da base legal

**1.1.** Tenho base legal legítima (LGPD Art. 7º) para realizar esta consulta, sendo a base legal aplicável uma das seguintes:
- Execução de contrato ou procedimentos preliminares relacionados a contrato (LGPD Art. 7º, V)
- Cumprimento de obrigação legal ou regulatória (LGPD Art. 7º, II)
- Exercício regular de direito em processo judicial, administrativo ou arbitral (LGPD Art. 7º, VI)
- Proteção do crédito (LGPD Art. 7º, X)
- Legítimo interesse (LGPD Art. 7º, IX), com proporcionalidade verificada

**1.2.** A finalidade que declarei no momento da consulta é verdadeira, específica e legítima.

**1.3.** Estou em condições de comprovar essa base legal, caso solicitado por autoridade competente (ANPD, Ministério Público, Poder Judiciário) ou pelo próprio titular dos dados.

## 2. Da minha responsabilidade

**2.1.** Sou inteiramente responsável pelo uso dos dados obtidos nesta consulta, sendo a Capivara apenas intermediária técnica que consulta as bases de dados em meu nome.

**2.2.** Comprometo-me a:
- Não utilizar os dados para discriminação ilegal de qualquer natureza
- Não compartilhar os dados com terceiros sem base legal própria desses terceiros
- Não revender ou redistribuir o relatório obtido
- Adotar medidas técnicas e organizativas para proteger os dados conforme LGPD Art. 46
- Atender solicitações do titular dos dados (LGPD Art. 18) caso ele exerça seus direitos
- Eliminar os dados quando a finalidade for cumprida ou prazo legal expirado

**2.3.** Reconheço que sou o **controlador** dos dados pessoais obtidos nesta consulta para os fins da LGPD, sendo a Capivara apenas **operadora** que executou a busca em meu nome.

## 3. Da Capivara — INTERMEDIAÇÃO TÉCNICA

**3.1.** A Capivara não é responsável pelo uso que faço dos dados após o download do relatório.

**3.2.** A Capivara não verifica nem garante a base legal declarada pelo usuário, atuando como operadora técnica que confia na declaração de finalidade fornecida.

**3.3.** Em caso de uso indevido por mim que cause prejuízo a terceiros ou ensejar multa da ANPD, **assumo integralmente o ônus**, isentando a Capivara de qualquer responsabilidade solidária ou subsidiária.

**3.4. RECONHECIMENTO EXPRESSO DE QUE A CAPIVARA SÓ REPASSA DADOS.**

Reconheço e aceito expressamente que:

**(a)** A Capivara é **apenas intermediária técnica** entre mim e as fontes externas (Receita Federal, Detran, Serasa, Boa Vista, SPC, SCR Bacen, cartórios, bureaus privados etc).

**(b)** A Capivara **não produz, não valida, não certifica e não garante** as informações apresentadas. Todo conteúdo do relatório vem de fontes externas e reflete o que essas fontes informavam **no exato momento da consulta**.

**(c)** Os dados podem estar **desatualizados ou conter erros nas fontes**. A Capivara não tem como verificar. Se isso me causar prejuízo, é problema entre eu e a fonte primária — não com a Capivara.

**(d)** **Especificamente para consulta veicular**: estou ciente que histórico veicular muda diariamente. Sinistro, multa, débito, recall, transferência ou leilão registrado APÓS a minha consulta **não aparecerá** no meu relatório. Para uso oficial (compra/venda formal), preciso confirmar no Detran no dia da operação.

**(e)** **Especificamente para CPF/CNPJ**: score, dívidas e restrições mudam diariamente. Pessoa com score alto pode ficar inadimplente no mês seguinte; empresa ativa pode ser baixada na semana seguinte. Para decisões críticas, devo repetir a consulta na data da decisão.

**(f)** Se EU descobrir DEPOIS uma informação relevante (sinistro, dívida nova, fraude descoberta, problema na pessoa/empresa/veículo) que não estava no relatório porque foi gerada após a consulta — **a Capivara não tem culpa nem responsabilidade**.

**(g)** A Capivara **não substitui** parecer jurídico, contábil, técnico veicular, auditoria especializada ou consulta presencial em órgão oficial.

**(h)** **Em qualquer divergência entre o relatório Capivara e a fonte primária (Detran, Receita, cartório, bureau original), a fonte primária prevalece.**

**3.5.** A Capivara registra em log auditável (consent_logs):
- Meu IP e user-agent no momento da consulta
- Hash do texto deste Termo (versão aceita)
- Timestamp do aceite
- Finalidade declarada
- Identificador da consulta

Esse log é mantido por 5 anos e pode ser apresentado em processo judicial ou administrativo como prova do meu aceite.

## 4. Das condutas vedadas

Declaro estar ciente de que constitui infração grave a este Termo, sujeita a suspensão imediata da conta e responsabilização cível e criminal:
- Usar consultas para perseguição ("stalking") ou intimidação de pessoas físicas
- Usar consultas para discriminação no acesso a emprego, crédito, moradia, serviços
- Compartilhar dados de pessoas sem consentimento ou base legal
- Vender relatórios da Capivara a terceiros sem autorização escrita
- Tentar inferir dados sensíveis (saúde, raça, religião, orientação sexual, política) a partir dos dados obtidos
- Realizar consultas em massa de pessoas sem vínculo comercial pré-existente comigo

## 5. Atualizações deste Termo

Este Termo de Responsabilidade pode ser atualizado. A nova versão será mostrada na próxima consulta após a vigência, exigindo novo aceite. Versões anteriores ficam disponíveis no histórico de aceites.

## 6. Dados desta declaração

Ao aceitar este Termo, autorizo o registro dos seguintes dados em log auditável (LGPD Art. 7º, IX — legítimo interesse de evidência probatória):
- Meu user_id na Capivara
- IP de origem
- User-agent do navegador
- Timestamp ISO 8601
- Hash SHA-256 do texto deste Termo
- Identificador da consulta a que este aceite se refere
- Finalidade que declarei pra esta consulta

---

**Ao prosseguir com a consulta, declaro que li integralmente este Termo, entendi todas as cláusulas e me comprometo com tudo que está escrito acima.**

**Esta declaração tem valor legal de assinatura eletrônica (Lei 14.063/2020) e pode ser usada como prova em qualquer processo judicial ou administrativo.**
`,
};

// =============================================================================
// CONTRATO B2B (onboarding empresa)
// =============================================================================
export const COMPANY_TERMS: LegalDocument = {
  type: "company_terms",
  version: "1.0.0",
  title: "Termos de Uso Empresarial (B2B) — Capivara",
  effectiveDate: "2026-05-22",
  shortLabel:
    "Li e aceito os Termos B2B, declarando ser representante legal autorizado da empresa cadastrada.",
  publicUrl: "/empresa-termos",
  text: `# Termos de Uso Empresarial (B2B) da Capivara

**Versão 1.0.0 · Vigência a partir de 22 de maio de 2026**

Estes Termos B2B complementam os Termos de Uso gerais e a Política de Privacidade da Capivara, regulando especificamente o uso por pessoa jurídica.

Ao cadastrar uma empresa na Capivara e aceitar este documento, o(a) signatário(a) declara:

## 1. Da representação

**1.1.** Sou representante legal devidamente constituído ou procurador com poderes específicos da empresa cadastrada (razão social, CNPJ e endereço informados no cadastro).

**1.2.** Tenho poderes para vincular a empresa a estes Termos, ao Contrato de Serviços e à Política de Privacidade.

**1.3.** Comprometo-me a apresentar, mediante solicitação, procuração ou contrato social comprovando a representação.

## 2. Do serviço B2B

**2.1.** A empresa adquire créditos prepagos ("Pacotes Manada") via gateway Asaas para uso na Plataforma Capivara.

**2.2.** Cada consulta debita um número específico de créditos do saldo da empresa, conforme tabela publicada em /api-publica.

**2.3.** Os créditos não expiram e não geram direito a reembolso após adquiridos. Erro técnico em consulta não realizada gera devolução automática dos créditos.

**2.4.** A empresa pode usar a Plataforma:
- Através do painel web (/empresa)
- Através da API pública (/v1/consultations) com Bearer token

## 3. Da equipe e roles

**3.1.** A empresa pode adicionar membros à equipe, atribuindo papéis:
- **Admin**: tudo (gerenciar equipe, créditos, API keys, criar consultas)
- **Operator**: criar consultas e ver histórico
- **Viewer**: apenas visualizar histórico

**3.2.** A empresa é responsável por:
- Convidar apenas pessoas autorizadas
- Revogar acesso de pessoas desligadas imediatamente
- Manter atualizada a lista de membros

**3.3.** A Capivara não verifica internamente a relação entre cada membro e a empresa. Acesso indevido por membro mal-cadastrado é responsabilidade exclusiva da empresa.

## 4. Da LGPD em ambiente B2B

**4.1.** A empresa é **controladora** dos dados pessoais que consulta. A Capivara é **operadora** que executa a busca por conta e ordem da empresa.

**4.2.** A empresa se compromete a:
- Documentar a base legal para cada consulta (LGPD Art. 37)
- Manter registro próprio de operações de tratamento (LGPD Art. 37)
- Designar Encarregado de Proteção de Dados próprio se aplicável
- Atender direitos do titular nos termos da LGPD Art. 18
- Notificar à ANPD incidentes de segurança envolvendo dados obtidos via Capivara (LGPD Art. 48), se aplicável

**4.3.** A Capivara não responde por infrações à LGPD cometidas pela empresa no uso dos dados, exceto quando demonstradamente decorrentes de falha técnica da Plataforma.

## 5. Da API e webhooks

**5.1.** A empresa pode gerar API Keys no painel /empresa/api. As chaves são prefixadas com "cap_live_" e o hash SHA-256 é armazenado no banco — a chave em texto puro é mostrada APENAS UMA VEZ no momento da criação.

**5.2.** A empresa é responsável por:
- Manter as API keys em segredo
- Nunca expor as chaves em código frontend
- Revogar chaves comprometidas imediatamente
- Auditar uso das chaves periodicamente

**5.3.** Rate limit padrão: 60 chamadas/minuto por chave. Acima disso, retorno HTTP 429.

**5.4.** Webhooks são entregues com assinatura HMAC-SHA256. A empresa deve validar a assinatura no recebimento (instruções em /docs/webhooks).

## 6. Da confidencialidade

**6.1.** A Capivara mantém em sigilo as informações da empresa, exceto quando obrigada por lei ou ordem judicial.

**6.2.** A empresa mantém em sigilo as informações da Capivara, incluindo tabelas de preços negociadas em contrato enterprise, dados técnicos da API e demais informações trocadas em escopo comercial.

## 7. Do faturamento

**7.1.** NF-e é emitida automaticamente pelo Asaas após confirmação do pagamento de cada recarga.

**7.2.** A empresa é responsável por:
- Conferir os dados fiscais na NF-e
- Solicitar correções dentro do prazo legal
- Manter atualizado o email de faturamento

**7.3.** Em caso de inadimplência de boletos, a empresa fica impedida de fazer novas recargas até a regularização.

## 8. Da rescisão

**8.1.** A empresa pode encerrar o cadastro a qualquer momento, em /configuracoes.

**8.2.** Créditos não utilizados após o encerramento da empresa **não são reembolsados** em dinheiro (são considerados gasto comercial), salvo previsão diversa em contrato enterprise específico.

**8.3.** A Capivara pode suspender ou encerrar o cadastro em caso de:
- Violação dos Termos
- Suspeita de uso fraudulento
- Inadimplência
- Determinação judicial ou regulatória

## 9. Da limitação de responsabilidade

**9.1.** Salvo previsão em contrato enterprise, a Capivara opera em regime de **best effort**, sem SLA contratual de disponibilidade.

**9.2.** Indenização máxima limitada ao valor total pago pela empresa nos 12 meses anteriores ao evento.

**9.3.** A Capivara não responde por:
- Lucros cessantes
- Decisões comerciais tomadas pela empresa baseadas em relatórios
- Inexatidão de dados das fontes externas
- Uso indevido pelos membros da equipe da empresa

## 10. Do foro

Fica eleito o foro da Comarca de São Paulo - SP, com renúncia a qualquer outro.

## 11. Atualizações

Mudanças serão comunicadas com 30 dias de antecedência ao email de faturamento. Versões antigas ficam no histórico de aceites.

---

**Ao aceitar estes Termos B2B, declaro ser representante legal autorizado, ter lido e entendido todas as cláusulas e vincular a empresa cadastrada a estes Termos.**

**Esta declaração tem valor de assinatura eletrônica (Lei 14.063/2020).**
`,
};

// =============================================================================
// TERMOS DA API (geração de key)
// =============================================================================
export const API_TERMS: LegalDocument = {
  type: "api_terms",
  version: "1.0.0",
  title: "Termos de Uso da API Capivara",
  effectiveDate: "2026-05-22",
  shortLabel:
    "Li e aceito os Termos da API, declarando que vou usar a chave de forma segura e dentro das regras.",
  publicUrl: "/api-termos",
  text: `# Termos de Uso da API Capivara

**Versão 1.0.0 · Vigência a partir de 22 de maio de 2026**

Este documento regula especificamente o uso da API pública da Capivara (endpoints /v1/*) e complementa os Termos B2B.

Ao gerar uma API Key e aceitar este documento, eu, na qualidade de administrador autorizado da empresa cadastrada, declaro:

## 1. Da chave de acesso

**1.1.** A chave gerada (formato cap_live_xxxxxxxx) é confidencial e identifica a empresa cadastrada em todas as chamadas.

**1.2.** A chave em texto puro é mostrada **apenas uma vez** no momento da criação. A Capivara guarda apenas o hash SHA-256 — não há como recuperar uma chave perdida (será necessário gerar outra).

**1.3.** Comprometo-me a:
- Armazenar a chave em local seguro (variáveis de ambiente, secret manager)
- Nunca expor a chave em código frontend, repositório público ou logs
- Revogar imediatamente qualquer chave suspeita de comprometimento
- Não compartilhar a chave com pessoas fora da equipe autorizada da empresa

**1.4.** Qualquer uso feito com a chave é atribuído à empresa cadastrada. A empresa responde por todas as consultas realizadas com a chave, ainda que por terceiros que tenham obtido acesso indevido.

## 2. Do uso técnico

**2.1.** A API segue padrão REST com autenticação Bearer. Detalhes em /docs/api.

**2.2.** Rate limit padrão: 60 chamadas/min por chave. Status 429 retorna \`Retry-After\`.

**2.3.** Idempotência: enviar \`external_reference\` único garante que o mesmo target+plano não seja cobrado duas vezes.

**2.4.** Cache 24h: consulta repetida (mesmo target + mesmo plano) em até 24h não debita créditos.

## 3. Das obrigações pela finalidade

**3.1.** Cada chamada à API herda a finalidade implícita declarada nos Termos B2B aceitos pela empresa.

**3.2.** Quando o uso da API for para finalidade diferente (ex: nova vertical de negócio), a empresa deve registrar a nova base legal em sua documentação interna (LGPD Art. 37).

**3.3.** A Capivara registra em log:
- Cada chamada à API com IP, timestamp, chave usada, payload
- Resultado (status code, consultation_id quando aplicável)

Esses logs ficam por 6 meses.

## 4. Do webhook

**4.1.** A empresa pode cadastrar URLs de webhook em /empresa/webhooks para receber eventos:
- \`consultation.completed\`
- \`consultation.failed\`
- \`payment.confirmed\`

**4.2.** Os webhooks são assinados com HMAC-SHA256. A empresa deve validar a assinatura no recebimento (timing-safe).

**4.3.** Retry exponencial: tentamos entregar 6 vezes (1m, 5m, 30m, 2h, 6h, 24h). Após isso, marcamos como esgotado.

**4.4.** A URL do webhook deve ser HTTPS em produção. URLs http não são aceitas.

## 5. Da segurança

**5.1.** É expressamente proibido:
- Tentar realizar engenharia reversa da API
- Tentar enumerar chaves de outras empresas
- Tentar bypass de rate limit usando múltiplas chaves coordenadas
- Realizar scraping massivo da Plataforma fora da API
- Distribuir ou compartilhar a documentação confidencial não publicada

**5.2.** A Capivara monitora padrões anômalos e pode bloquear chaves preventivamente em caso de:
- Volume incompatível com perfil contratado
- Padrão de query semelhante a coleta massiva sem finalidade comercial clara
- Tentativa de exploração de vulnerabilidades

## 6. Da disponibilidade

**6.1.** A API opera em regime best effort. Sem SLA contratual de disponibilidade, salvo contrato enterprise específico.

**6.2.** Manutenções programadas comunicadas no /docs/api com 24h de antecedência.

## 7. Da revogação

**7.1.** A empresa pode revogar suas chaves a qualquer momento em /empresa/api.

**7.2.** A Capivara pode revogar chaves em caso de:
- Violação destes Termos
- Suspeita de comprometimento
- Inadimplência da empresa

## 8. Dos dados do aceite

Ao gerar a chave e aceitar estes Termos, registramos em log auditável (consent_logs):
- ID do usuário admin que gerou a chave
- Empresa associada
- IP e user-agent
- Hash deste documento
- Texto completo desta versão
- Timestamp

Esse log fica por 5 anos.

---

**Ao aceitar estes Termos da API, declaro ser administrador autorizado, ter lido integralmente este documento e me comprometer com o uso seguro e legítimo da chave que será gerada.**
`,
};

// =============================================================================
// POLITICA DE COOKIES
// =============================================================================
export const COOKIE_POLICY: LegalDocument = {
  type: "cookie_policy",
  version: "1.0.0",
  title: "Política de Cookies da Capivara",
  effectiveDate: "2026-05-22",
  shortLabel: "Aceito a política de cookies essenciais",
  publicUrl: "/cookies",
  text: `# Política de Cookies da Capivara

**Versão 1.0.0 · Vigência a partir de 22 de maio de 2026**

## O que são cookies

Cookies são pequenos arquivos que sites colocam no seu dispositivo pra reconhecer você em visitas futuras, manter você logada, lembrar preferências e medir uso.

## Quais cookies usamos

A Capivara usa **apenas cookies essenciais** — sem cookies de marketing ou tracking de terceiros por padrão.

### Cookies essenciais (estritamente necessários)

| Nome | Função | Duração |
|---|---|---|
| sb-access-token | Sessão de autenticação Supabase | 1 hora |
| sb-refresh-token | Renovação da sessão | 7 dias |
| capivara-csrf | Proteção contra CSRF | Sessão |
| capivara-theme | Preferência de tema (claro/escuro) | 1 ano |

Esses cookies são **necessários pra plataforma funcionar**. Sem eles, você não consegue fazer login ou usar funcionalidades autenticadas.

### Cookies que NÃO usamos

- ❌ Google Analytics 4 (com perfil identificável)
- ❌ Facebook Pixel
- ❌ Cookies de retargeting/remarketing
- ❌ Cookies de rede de afiliados

## Localstorage (não é cookie, mas vale mencionar)

Algumas preferências ficam no \`localStorage\` do navegador:
- Última categoria escolhida em /consultar
- Estado de filtros em /empresa/historico
- Preferência de visualização do carrossel

Tudo isso fica no SEU dispositivo. Não vai pro servidor.

## Como desabilitar

Você pode bloquear cookies nas configurações do seu navegador. Mas vale lembrar que **sem cookies essenciais, a Capivara não funciona** (login quebra).

Se você usar a Capivara em modo anônimo/incógnito, os cookies são apagados ao fechar a janela.

## Mudanças

Caso a Capivara adicione cookies não-essenciais no futuro (ex: pra A/B testing ou analytics agregado), você será notificada por banner persistente e poderá optar.

## Contato

Dúvidas: lgpd@capivara.app
`,
};

// =============================================================================
// Coleção e helpers
// =============================================================================

export const ALL_DOCUMENTS: Record<DocumentType, LegalDocument> = {
  terms_of_use: TERMS_OF_USE,
  privacy_policy: PRIVACY_POLICY,
  cookie_policy: COOKIE_POLICY,
  consultation_responsibility: CONSULTATION_RESPONSIBILITY,
  company_terms: COMPANY_TERMS,
  api_terms: API_TERMS,
};

export function getDocument(type: DocumentType): LegalDocument {
  return ALL_DOCUMENTS[type];
}

/** SHA-256 do texto completo do documento. Identidade do snapshot. */
export function hashDocument(doc: LegalDocument): string {
  return createHash("sha256").update(doc.text).digest("hex");
}
