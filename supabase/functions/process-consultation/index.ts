// VERSAO LOCAL — re-deploy via MCP deploy_edge_function depois de editar.
// =========================================================================
// Capivara · Edge Function process-consultation (v3 — hardening 2026-07-23)
//
// Disparada pelo webhook Asaas apos confirmacao de pagamento, ou
// direto pelo painel B2B/avulso quando consulta cria status='paid'.
//
// Fluxo:
//   1. Recebe { consultationId }
//   2. Carrega a consulta no Supabase (guard status='paid')
//   3. Marca status='processing'
//   4. Identifica APIs do plano
//   5. Pra cada API: cache hit OU reserva+APIFULL+upsert (race-safe)
//   6. Consolida result_jsonb
//   7. Refund (total ou parcial) OU PDF render — AWAITED antes do return
//   8. UPDATE consultations
//
// Idempotencia: se status != 'paid', retorna 200 sem fazer nada.
//
// Fixes v3 (auditoria 2026-07-23):
//   - EdgeRuntime.waitUntil() em vez de fire-and-forget (Deno drop antes do fetch partir)
//   - hits do cache calculado corretamente (parenteses + select hits)
//   - Reservation com marker _pending pra evitar race no cache-miss (2 requests
//     paralelos ao mesmo target+API pagavam APIFULL 2x)
//   - Refund parcial: se successCount > 0 mas failCount > 0, refund proporcional
//   - INTERNAL_WEBHOOK_SECRET dedicado (nao usa mais SERVICE_ROLE_KEY como bearer)
//   - Guard env vars nao-nulas antes de criar client
//   - paid_at gravado quando ausente (recover-stuck retomada)
// =========================================================================

// @ts-expect-error - deno runtime
import { createClient } from "jsr:@supabase/supabase-js@2";

import {
  socioPrincipal,
  particionarPorAlvo,
  type SocioEncontrado,
} from "./socios.ts";
// @ts-expect-error - deno global EdgeRuntime
declare const EdgeRuntime: { waitUntil: (p: Promise<unknown>) => void } | undefined;

type ProcessRequest = { consultationId: string };

const APIFULL_BASE = "https://api.apifull.com.br/api";
const APIFULL_TIMEOUT = 30_000;
const APIFULL_MAX_RETRIES = 2;

// Marker usado pra reservar cache slot enquanto APIFULL responde.
const RESERVATION_TTL_MS = 120_000; // 2min pra completar (senao expira)
const POLL_INTERVAL_MS = 1000;
const POLL_MAX_MS = 30_000;

// =========================================================================
// MAPPING APIFULL — espelha src/lib/apifull/mapping.ts
// (Inline pq Edge Function nao tem acesso ao bundle Next)
// =========================================================================

interface ApiFullEndpoint {
  internal: string;
  path: string;
  nome: string;
  categoria: string;
  paramType: "placa" | "cpf" | "cnpj" | "cep";
  custoCentavos: number;
  /** TTL do cache (horas). Sincronizado com src/lib/apifull/mapping.ts. */
  cacheTTLHours: number;
}

const APIFULL_ENDPOINTS: ApiFullEndpoint[] = [
  // Veicular
  { internal: "placa-basica", path: "placa-basica", nome: "Placa Super Basica", categoria: "veicular", paramType: "placa", custoCentavos: 9, cacheTTLHours: 168 },
  { internal: "placa-basica-propria", path: "agregados-propria", nome: "Placa Basica (propria)", categoria: "veicular", paramType: "placa", custoCentavos: 11, cacheTTLHours: 168 },
  { internal: "fipe", path: "fipe", nome: "Tabela FIPE", categoria: "veicular", paramType: "placa", custoCentavos: 12, cacheTTLHours: 720 },
  { internal: "bin-nacional", path: "ic-bin-nacional", nome: "BIN Nacional", categoria: "veicular", paramType: "placa", custoCentavos: 330, cacheTTLHours: 168 },
  { internal: "bin-estadual", path: "ic-bin-estadual", nome: "BIN Estadual", categoria: "veicular", paramType: "placa", custoCentavos: 304, cacheTTLHours: 168 },
  { internal: "recall", path: "ic-recall", nome: "Recall pendente", categoria: "veicular", paramType: "placa", custoCentavos: 396, cacheTTLHours: 24 },
  { internal: "gravame", path: "gravame", nome: "Gravame / Alienacao", categoria: "veicular", paramType: "placa", custoCentavos: 242, cacheTTLHours: 6 },
  { internal: "proprietario-placa", path: "ic-proprietario-atual", nome: "Proprietario atual", categoria: "veicular", paramType: "placa", custoCentavos: 376, cacheTTLHours: 6 },
  { internal: "historico-roubo-furto", path: "roubo-furto", nome: "Historico Roubo/Furto", categoria: "veicular", paramType: "placa", custoCentavos: 396, cacheTTLHours: 24 },
  { internal: "leilao", path: "leilao", nome: "Historico de Leilao", categoria: "leilao", paramType: "placa", custoCentavos: 964, cacheTTLHours: 24 },
  { internal: "foto-leilao", path: "ic-foto-leilao", nome: "Foto do Leilao", categoria: "leilao", paramType: "placa", custoCentavos: 1320, cacheTTLHours: 720 },
  { internal: "certificado-seguranca-veicular", path: "csv-renainf-renajud-recall-bin-proprietario", nome: "CSV Completo", categoria: "veicular", paramType: "placa", custoCentavos: 495, cacheTTLHours: 12 },
  { internal: "crlv", path: "crlv", nome: "CRLV digital", categoria: "veicular", paramType: "placa", custoCentavos: 2231, cacheTTLHours: 168 },
  { internal: "vip-car", path: "ic-vipcar", nome: "Vip Car (analise tecnica)", categoria: "leilao", paramType: "placa", custoCentavos: 3432, cacheTTLHours: 24 },
  { internal: "rastreamento-veicular", path: "veiculo-rastreamento", nome: "Rastreamento de Veiculo", categoria: "veicular", paramType: "placa", custoCentavos: 8712, cacheTTLHours: 12 },
  { internal: "veiculo-debitos", path: "veiculo-dados-debitos", nome: "Multas e Debitos do Veiculo", categoria: "veicular", paramType: "placa", custoCentavos: 297, cacheTTLHours: 12 },
  { internal: "renainf", path: "renainf", nome: "RENAINF (infracoes nacionais)", categoria: "veicular", paramType: "placa", custoCentavos: 396, cacheTTLHours: 12 },
  { internal: "renajud", path: "renajud", nome: "RENAJUD (restricoes judiciais)", categoria: "veicular", paramType: "placa", custoCentavos: 396, cacheTTLHours: 24 },
  { internal: "atpv-e", path: "atpv-e", nome: "ATPV-e (2a via)", categoria: "veicular", paramType: "placa", custoCentavos: 240, cacheTTLHours: 168 },
  { internal: "placa-radar", path: "placa-radar", nome: "Placa Radar (passagens)", categoria: "veicular", paramType: "placa", custoCentavos: 83, cacheTTLHours: 24 },
  // Pessoa
  { internal: "cpf-simples", path: "pf-dadosbasicos", nome: "CPF Simples", categoria: "pessoa", paramType: "cpf", custoCentavos: 11, cacheTTLHours: 168 },
  { internal: "cpf-completo", path: "ic-cpf-completo", nome: "CPF Completo", categoria: "pessoa", paramType: "cpf", custoCentavos: 66, cacheTTLHours: 168 },
  { internal: "cpf-ultra-completo", path: "cpf-ultra", nome: "CPF Ultra Completo", categoria: "pessoa", paramType: "cpf", custoCentavos: 292, cacheTTLHours: 168 },
  { internal: "cpf-ultra-socios", path: "cpf-ultra", nome: "CPF Ultra dos socios", categoria: "pessoa", paramType: "cpf", custoCentavos: 292, cacheTTLHours: 168 },
  // Empresa
  { internal: "processos-judiciais-pf", path: "pf-processos-judiciais", nome: "Processos Judiciais (PF)", categoria: "juridico", paramType: "cpf", custoCentavos: 31, cacheTTLHours: 24 },
  { internal: "antecedentes-criminais", path: "cert-pf-antecedentes-criminais", nome: "Certidao de Antecedentes Criminais", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "darkweb-pf", path: "pf-darkweb", nome: "Exposicao na Dark Web", categoria: "pessoa", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 168 },
  { internal: "dados-financeiros-pf", path: "pf-dados-financeiros", nome: "Renda e Patrimonio estimados", categoria: "pessoa", paramType: "cpf", custoCentavos: 141, cacheTTLHours: 168 },
  { internal: "pessoas-relacionadas", path: "pf-pessoas-relacionadas", nome: "Vinculos e Parentes", categoria: "pessoa", paramType: "cpf", custoCentavos: 22, cacheTTLHours: 168 },
  { internal: "dados-profissionais", path: "pf-dados-profissionais", nome: "Vida Profissional", categoria: "pessoa", paramType: "cpf", custoCentavos: 44, cacheTTLHours: 168 },
  { internal: "cnh", path: "pf-cnh-v2", nome: "Carteira Nacional de Habilitacao", categoria: "pessoa", paramType: "cpf", custoCentavos: 267, cacheTTLHours: 168 },
  { internal: "veiculos-por-cpf", path: "pf-veiculos", nome: "Veiculos no CPF", categoria: "veicular", paramType: "cpf", custoCentavos: 528, cacheTTLHours: 168 },
  { internal: "imoveis", path: "consulta-imoveis", nome: "Imoveis (capitais)", categoria: "pessoa", paramType: "cpf", custoCentavos: 770, cacheTTLHours: 720 },
  { internal: "processos-judiciais-pj", path: "pj-processos-judiciais", nome: "Processos Judiciais (PJ)", categoria: "juridico", paramType: "cnpj", custoCentavos: 31, cacheTTLHours: 24 },
  { internal: "quadro-societario", path: "pj-quadro-societario", nome: "Quadro Societario", categoria: "empresa", paramType: "cnpj", custoCentavos: 31, cacheTTLHours: 168 },
  { internal: "veiculos-por-cnpj", path: "pj-veiculos", nome: "Frota da Empresa", categoria: "veicular", paramType: "cnpj", custoCentavos: 528, cacheTTLHours: 168 },
  { internal: "sintegra", path: "pj-sintegra", nome: "Sintegra", categoria: "empresa", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 168 },
  { internal: "cnpj-completo", path: "cnpj", nome: "CNPJ Completo", categoria: "empresa", paramType: "cnpj", custoCentavos: 7, cacheTTLHours: 168 },
  // Credito (score muda → TTL curto)
  { internal: "boa-vista-essencial", path: "scpc-boavista", nome: "Boa Vista Essencial", categoria: "credito", paramType: "cpf", custoCentavos: 303, cacheTTLHours: 4 },
  { internal: "serasa-basico", path: "r-cadastrais-score-dividas", nome: "Serasa Basico", categoria: "credito", paramType: "cpf", custoCentavos: 304, cacheTTLHours: 4 },
  { internal: "serasa-premium", path: "serasa-premium", nome: "Serasa Premium", categoria: "credito", paramType: "cpf", custoCentavos: 739, cacheTTLHours: 4 },
  { internal: "spc-brasil", path: "spc-brasil", nome: "SPC Brasil", categoria: "credito", paramType: "cpf", custoCentavos: 840, cacheTTLHours: 4 },
  { internal: "scr-bacen", path: "scr-premium", nome: "SCR BACEN", categoria: "credito", paramType: "cpf", custoCentavos: 628, cacheTTLHours: 4 },
  { internal: "scr-bacen-socios", path: "scr-premium", nome: "SCR BACEN dos socios", categoria: "credito", paramType: "cpf", custoCentavos: 628, cacheTTLHours: 4 },
  { internal: "quod", path: "ic-quod", nome: "QUOD", categoria: "credito", paramType: "cpf", custoCentavos: 526, cacheTTLHours: 4 },
  { internal: "cred-completa-plus", path: "e-boavista", nome: "Cred Completa Plus", categoria: "credito", paramType: "cpf", custoCentavos: 274, cacheTTLHours: 4 },
  // Juridico
  { internal: "cnd-trabalhista", path: "cert-pf-debitos-trabalhistas", nome: "CNDT", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-pgfn-pf", path: "cert-pf-pgfn", nome: "Certidao PGFN (Receita/PGFN)", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-acoes-trabalhistas-pf", path: "cert-pf-acoes-trabalhistas", nome: "Certidao de Acoes Trabalhistas", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-cnj-pf", path: "cert-pf-negativa-cnj", nome: "Certidao Negativa CNJ", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-cgu-pf", path: "cert-pf-negativa-cgu", nome: "Certidao Negativa CGU", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-nada-consta-pf", path: "cert-pf-judicial-nada-consta", nome: "Certidao Judicial Nada Consta", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-divida-ativa-pf", path: "cert-pf-divida-ativa-pgfn", nome: "Divida Ativa PGFN", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-ibama-pf", path: "cert-pf-negativa-ibama", nome: "Certidao Negativa IBAMA", categoria: "juridico", paramType: "cpf", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-fgts-pj", path: "cert-pj-fgts", nome: "Certidao FGTS (CRF)", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-pgfn-pj", path: "cert-pj-pgfn", nome: "Certidao PGFN (Receita/PGFN)", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-situacao-cadastral-pj", path: "cert-pj-situacao-cadastral", nome: "Certidao de Situacao Cadastral", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-debitos-trabalhistas-pj", path: "cert-pj-debitos-trabalhistas", nome: "CNDT (Debitos Trabalhistas)", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-acoes-trabalhistas-pj", path: "cert-pj-acoes-trabalhistas", nome: "Certidao de Acoes Trabalhistas", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-cnj-pj", path: "cert-pj-negativa-cnj", nome: "Certidao Negativa CNJ", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-cgu-pj", path: "cert-pj-negativa-cgu", nome: "Certidao Negativa CGU", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-pcd-pj", path: "cert-pj-contratacao-pcd", nome: "Certidao de Contratacao de PCD", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "cert-ibama-pj", path: "cert-pj-negativa-ibama", nome: "Certidao Negativa IBAMA", categoria: "juridico", paramType: "cnpj", custoCentavos: 116, cacheTTLHours: 24 },
  { internal: "pld-pf", path: "pf-compliance-pld-v3", nome: "Compliance PLD (PEP, sancoes, risco)", categoria: "juridico", paramType: "cpf", custoCentavos: 225, cacheTTLHours: 24 },
  { internal: "pld-pj", path: "pj-compliance-pld-v3", nome: "Compliance PLD da Empresa", categoria: "juridico", paramType: "cnpj", custoCentavos: 675, cacheTTLHours: 24 },
  { internal: "pld-qsa", path: "pj-compliance-pld-qsa-v3", nome: "Compliance PLD dos Socios (QSA)", categoria: "juridico", paramType: "cnpj", custoCentavos: 675, cacheTTLHours: 24 },
  { internal: "obito", path: "pf-obito", nome: "Dados de Obito", categoria: "pessoa", paramType: "cpf", custoCentavos: 9, cacheTTLHours: 168 },
  { internal: "mandados-prisao", path: "pf-mandados-prisao", nome: "Mandados de Prisao (BNMP)", categoria: "juridico", paramType: "cpf", custoCentavos: 22, cacheTTLHours: 24 },
  { internal: "protesto-nacional", path: "protesto-nacional", nome: "Protesto Nacional", categoria: "juridico", paramType: "cpf", custoCentavos: 376, cacheTTLHours: 24 },
  { internal: "protesto-nacional-pj", path: "protesto-nacional", nome: "Protesto Nacional (empresa)", categoria: "juridico", paramType: "cnpj", custoCentavos: 376, cacheTTLHours: 24 },
  { internal: "cadin", path: "cadin", nome: "CADIN (dividas federais)", categoria: "juridico", paramType: "cpf", custoCentavos: 88, cacheTTLHours: 24 },
  { internal: "acoes-processos", path: "r-acoes-e-processos-judiciais", nome: "Acoes e Processos Judiciais", categoria: "juridico", paramType: "cpf", custoCentavos: 198, cacheTTLHours: 24 },
  { internal: "mercado-sociodemografico", path: "mercado-sociodemografico", nome: "Perfil sociodemografico do CEP", categoria: "local", paramType: "cep", custoCentavos: 33, cacheTTLHours: 720 },
  { internal: "mercado-infraestrutura", path: "mercado-infraestrutura-urbana", nome: "Indice de infraestrutura urbana", categoria: "local", paramType: "cep", custoCentavos: 18, cacheTTLHours: 720 },
  { internal: "mercado-macroeconomicos", path: "mercado-macroeconomicos", nome: "Indicadores macroeconomicos", categoria: "local", paramType: "cep", custoCentavos: 33, cacheTTLHours: 720 },
  { internal: "mercado-concorrencia", path: "mercado-concorrencia", nome: "Score de concorrencia", categoria: "local", paramType: "cep", custoCentavos: 33, cacheTTLHours: 720 },
  { internal: "mercado-risco-geografico", path: "mercado-risco-geografico", nome: "Risco geografico", categoria: "local", paramType: "cep", custoCentavos: 33, cacheTTLHours: 720 },
  { internal: "mercado-propensao-seguro", path: "mercado-propensao-seguro", nome: "Propensao a seguro", categoria: "local", paramType: "cep", custoCentavos: 18, cacheTTLHours: 720 },
  { internal: "mercado-gastos-alimentacao", path: "mercado-gastos-alimentacao", nome: "Gastos com alimentacao", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-consumo", path: "mercado-gastos-consumo", nome: "Gastos com consumo", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-diversos", path: "mercado-gastos-diversos", nome: "Gastos com diversos", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-educacao", path: "mercado-gastos-educacao", nome: "Gastos com educacao", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-habitacao", path: "mercado-gastos-habitacao", nome: "Gastos com habitacao", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-higiene", path: "mercado-gastos-higiene", nome: "Gastos com higiene", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-recreacao", path: "mercado-gastos-recreacao", nome: "Gastos com recreacao", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-saude", path: "mercado-gastos-saude", nome: "Gastos com saude", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-servicos", path: "mercado-gastos-servicos", nome: "Gastos com servicos", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-transporte", path: "mercado-gastos-transporte", nome: "Gastos com transporte", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
  { internal: "mercado-gastos-vestuario", path: "mercado-gastos-vestuario", nome: "Gastos com vestuario", categoria: "local", paramType: "cep", custoCentavos: 9, cacheTTLHours: 720 },
];

function findEndpoint(internal: string): ApiFullEndpoint | undefined {
  return APIFULL_ENDPOINTS.find((e) => e.internal === internal);
}

// =========================================================================
// APIFULL HTTP CLIENT
// =========================================================================

interface ApiFullCallResult {
  ok: boolean;
  status: "sucesso" | "erro" | "not_found" | "rate_limited" | "timeout" | "internal_error";
  dados?: Record<string, unknown>;
  errorMessage?: string;
  durationMs: number;
  httpStatus?: number;
}

/** Resultado normalizado de UMA chamada (direta ou encadeada no socio). */
interface ResultadoChamada {
  internal: string;
  path: string;
  nome: string;
  categoria: string;
  status: string;
  dados?: Record<string, unknown>;
  costCents: number;
  durationMs: number;
  errorMessage?: string;
  sobreSocio?: {
    nome: string | null;
    cpf_mascarado: string;
    qualificacao: string | null;
  };
}

/** SHA-256 hex — cache key por target da CHAMADA, nao da consulta. */
async function sha256Hex(texto: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** O que o cliente informou nessa consulta. */
function alvoDaCategoria(categoria: string): "placa" | "cpf" | "cnpj" | "cep" {
  if (categoria === "cpf") return "cpf";
  if (categoria === "cnpj") return "cnpj";
  if (categoria === "cep") return "cep";
  return "placa";
}

/** CPF mascarado pro log/resultado — nunca gravar o numero inteiro a toa. */
function mascararCpf(cpf: string): string {
  return cpf.length === 11 ? `***.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-**` : "***";
}

async function callApiFull(
  ep: ApiFullEndpoint,
  target: string,
  token: string
): Promise<ApiFullCallResult> {
  const url = `${APIFULL_BASE}/${ep.path}`;
  const body: Record<string, unknown> = { link: ep.path };

  switch (ep.paramType) {
    case "placa": body.placa = target; break;
    case "cpf": body.cpf = target; break;
    case "cnpj": body.cnpj = target; break;
    case "cep": body.cep = target; break;
  }

  // Varios endpoints (protesto-nacional, cadin, certidoes...) esperam o campo
  // generico `document`/`documento` em vez de cpf/cnpj. Mandar os dois e' seguro:
  // a APIFULL ignora campo que nao usa, e evita um paramType novo pra cada API.
  if (ep.paramType === "cpf" || ep.paramType === "cnpj") {
    body.document = target;
    body.documento = target;
  }

  const startedAt = Date.now();

  for (let attempt = 0; attempt <= APIFULL_MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = Math.pow(3, attempt - 1) * 1000;
      await new Promise((r) => setTimeout(r, delay));
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), APIFULL_TIMEOUT);

    try {
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timer);

      const durationMs = Date.now() - startedAt;

      if (resp.status === 404) {
        return { ok: true, status: "not_found", dados: undefined, durationMs, httpStatus: 404 };
      }
      if (resp.status === 429) {
        if (attempt < APIFULL_MAX_RETRIES) continue;
        return { ok: false, status: "rate_limited", errorMessage: "Rate limit", durationMs, httpStatus: 429 };
      }
      if (resp.status >= 500) {
        if (attempt < APIFULL_MAX_RETRIES) continue;
        return { ok: false, status: "internal_error", errorMessage: `5xx ${resp.status}`, durationMs, httpStatus: resp.status };
      }
      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        return { ok: false, status: "erro", errorMessage: `${resp.status}: ${text.slice(0, 200)}`, durationMs, httpStatus: resp.status };
      }

      const json = await resp.json() as { status?: string; dados?: Record<string, unknown>; message?: string };
      if (json.status === "erro") {
        return { ok: false, status: "erro", errorMessage: json.message ?? "APIFULL erro", durationMs, httpStatus: 200 };
      }
      return { ok: true, status: "sucesso", dados: json.dados, durationMs, httpStatus: 200 };
    } catch (err) {
      clearTimeout(timer);
      const isAbort = err instanceof Error && err.name === "AbortError";
      if (attempt < APIFULL_MAX_RETRIES) {
        console.warn(`[apifull] ${ep.path} tentativa ${attempt + 1} falhou:`, err);
        continue;
      }
      return {
        ok: false,
        status: isAbort ? "timeout" : "internal_error",
        errorMessage: err instanceof Error ? err.message : String(err),
        durationMs: Date.now() - startedAt,
      };
    }
  }

  return { ok: false, status: "internal_error", errorMessage: "retry esgotado", durationMs: Date.now() - startedAt };
}

// =========================================================================
// CACHE HELPERS (com race protection)
// =========================================================================

type CachedEntry = {
  result_jsonb: Record<string, unknown> & { _pending?: boolean };
  cost_cents: number;
  hits: number;
};

async function readCache(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string
): Promise<CachedEntry | null> {
  const { data } = await supabase
    .from("api_cache")
    .select("result_jsonb, cost_cents, hits, expires_at")
    .eq("cache_key", cacheKey)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle();
  return (data as CachedEntry | null) ?? null;
}

async function pollCacheUntilReady(
  supabase: ReturnType<typeof createClient>,
  cacheKey: string,
  maxMs: number
): Promise<CachedEntry | null> {
  const deadline = Date.now() + maxMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const c = await readCache(supabase, cacheKey);
    if (c && !c.result_jsonb?._pending) return c;
  }
  return null;
}

// =========================================================================
// MAIN
// =========================================================================

// @ts-expect-error - deno global
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = (await req.json().catch(() => null)) as ProcessRequest | null;
  if (!body?.consultationId) {
    return resp(400, { error: "consultationId obrigatorio" });
  }

  // @ts-expect-error - deno
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  // @ts-expect-error - deno
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  // @ts-expect-error - deno
  const apifullToken = Deno.env.get("APIFULL_API_KEY");
  // Novo em v3: secret dedicado pra chamadas internas (nao reusa SERVICE_ROLE)
  // Fallback pro service key durante transicao — remover em release seguinte.
  // @ts-expect-error - deno
  const internalSecret = Deno.env.get("INTERNAL_WEBHOOK_SECRET") ?? serviceKey;

  if (!supabaseUrl || !serviceKey) {
    console.error("[process-consultation] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes");
    return resp(500, { error: "Configuracao Supabase ausente" });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    db: { schema: "capivara" },
    auth: { persistSession: false },
  });

  // ---- 1. Carregar consulta ----
  const { data: consulta, error: loadErr } = await supabase
    .from("consultations")
    .select("*")
    .eq("id", body.consultationId)
    .maybeSingle();

  if (loadErr || !consulta) {
    return resp(404, { error: "Consulta nao encontrada" });
  }

  if (consulta.status !== "paid") {
    return resp(200, { ok: true, message: "Consulta nao esta paga, ignorando." });
  }

  // ---- 2. Marca processing e paid_at (se ausente) ----
  await supabase
    .from("consultations")
    .update({
      status: "processing",
      processing_started_at: new Date().toISOString(),
      // Grava paid_at se ainda nao setado (recover-stuck retomou consulta sem paid_at)
      paid_at: consulta.paid_at ?? new Date().toISOString(),
    })
    .eq("id", consulta.id);

  // ---- 3. Resolve APIs do plan_tier ----
  const apis = extractApis(consulta);
  if (apis.length === 0) {
    console.warn(`[process-consultation] consulta ${consulta.id} sem APIs definidas, marcando completed sem dados`);
    await supabase
      .from("consultations")
      .update({
        status: "completed",
        result_jsonb: { _empty: true, message: "Plano sem APIs mapeadas" },
        completed_at: new Date().toISOString(),
      })
      .eq("id", consulta.id);
    return resp(200, { ok: true, message: "Plano sem APIs" });
  }

  if (!apifullToken) {
    console.error("[process-consultation] APIFULL_API_KEY nao configurada");
    await supabase
      .from("consultations")
      .update({
        status: "error",
        result_jsonb: { _error: "APIFULL_API_KEY ausente" },
      })
      .eq("id", consulta.id);
    return resp(500, { error: "APIFULL_API_KEY nao configurada" });
  }

  // ---- 4. Orquestra chamadas APIFULL com cache (race-safe) ----
  const target = consulta.target_normalized as string;
  const targetHash = consulta.target_hash as string;

  // O guard acima ja garantiu o token; a funcao abaixo e' hoisted, entao o
  // narrowing nao alcanca ela — captura numa const tipada.
  const tokenApiFull: string = apifullToken;

  // Executa UMA chamada (cache-aware). O target vem por parametro porque as
  // APIs de socio rodam com o CPF do socio, nao com o CNPJ da empresa.
  async function executarChamada(
    internal: string,
    targetChamada: string,
    hashChamada: string,
    socio?: SocioEncontrado
  ): Promise<ResultadoChamada> {
      const ep = findEndpoint(internal);
      if (!ep) {
        return {
          internal,
          path: internal,
          nome: internal,
          categoria: "desconhecido",
          status: "internal_error" as const,
          errorMessage: `Endpoint "${internal}" nao mapeado`,
          dados: undefined,
          costCents: 0,
          durationMs: 0,
        };
      }

      const cacheKey = `${ep.path}:${hashChamada}`;

      // (A) Cache read
      const cached = await readCache(supabase, cacheKey);

      if (cached && !cached.result_jsonb?._pending) {
        // Cache HIT real. Incrementa hits (fix: parenteses)
        await supabase
          .from("api_cache")
          .update({ hits: (cached.hits ?? 0) + 1 })
          .eq("cache_key", cacheKey);
        return {
          internal,
          path: ep.path,
          nome: ep.nome,
          categoria: ep.categoria,
          status: "cached" as const,
          dados: cached.result_jsonb,
          costCents: 0,
          durationMs: 0,
        };
      }

      if (cached && cached.result_jsonb?._pending) {
        // Alguem esta processando. Poll ate ficar pronto ou timeout.
        const polled = await pollCacheUntilReady(supabase, cacheKey, POLL_MAX_MS);
        if (polled) {
          await supabase
            .from("api_cache")
            .update({ hits: (polled.hits ?? 0) + 1 })
            .eq("cache_key", cacheKey);
          return {
            internal,
            path: ep.path,
            nome: ep.nome,
            categoria: ep.categoria,
            status: "cached" as const,
            dados: polled.result_jsonb,
            costCents: 0,
            durationMs: 0,
          };
        }
        // Timeout: reserva expirou ou processo travou. Continua e chama APIFULL.
      }

      // (B) Reserva slot no cache com _pending marker (evita race).
      // Se conflito: alguem reservou entre readCache e agora. Recheca+poll.
      const reserveExpiry = new Date(Date.now() + RESERVATION_TTL_MS).toISOString();
      const { error: reserveErr } = await supabase
        .from("api_cache")
        .insert({
          cache_key: cacheKey,
          api_name: ep.path,
          target_hash: hashChamada,
          result_jsonb: { _pending: true },
          cost_cents: 0,
          hits: 0,
          expires_at: reserveExpiry,
        });

      // Codigo 23505 = unique_violation (PK conflict) — conflito legitimo de race.
      const isConflict = reserveErr && ((reserveErr as { code?: string }).code === "23505");

      if (isConflict) {
        // Aguarda a outra chamada terminar
        const polled = await pollCacheUntilReady(supabase, cacheKey, POLL_MAX_MS);
        if (polled && !polled.result_jsonb?._pending) {
          await supabase
            .from("api_cache")
            .update({ hits: (polled.hits ?? 0) + 1 })
            .eq("cache_key", cacheKey);
          return {
            internal,
            path: ep.path,
            nome: ep.nome,
            categoria: ep.categoria,
            status: "cached" as const,
            dados: polled.result_jsonb,
            costCents: 0,
            durationMs: 0,
          };
        }
        // Se timeout — segue e tenta chamar mesmo (custo dobrado mas nao trava)
      }

      // (C) Cache miss / expiracao / reserva bem-sucedida — chama APIFULL
      const apiResult = await callApiFull(ep, targetChamada, tokenApiFull);

      // (D) Grava resultado real no cache (upsert sobre a reserva)
      if (apiResult.ok && (apiResult.status === "sucesso" || apiResult.status === "not_found")) {
        const expiresAt = new Date(Date.now() + ep.cacheTTLHours * 60 * 60 * 1000).toISOString();
        await supabase
          .from("api_cache")
          .upsert({
            cache_key: cacheKey,
            api_name: ep.path,
            target_hash: hashChamada,
            result_jsonb: apiResult.dados ?? { _not_found: true },
            cost_cents: ep.custoCentavos,
            hits: 1,
            expires_at: expiresAt,
          }, { onConflict: "cache_key" });
      } else {
        // APIFULL falhou — remove reserva pra permitir retry futuro rapido
        // (senao a reserva _pending vale ate reserveExpiry bloqueando reruns)
        await supabase.from("api_cache").delete().eq("cache_key", cacheKey);
      }

      return {
        internal,
        path: ep.path,
        nome: ep.nome,
        categoria: ep.categoria,
        status: apiResult.status,
        dados: apiResult.dados,
        costCents: apiResult.ok && apiResult.status === "sucesso" ? ep.custoCentavos : 0,
        durationMs: apiResult.durationMs,
        errorMessage: apiResult.errorMessage,
        ...(socio
          ? {
            sobreSocio: {
              nome: socio.nome ?? null,
              cpf_mascarado: mascararCpf(socio.cpf),
              qualificacao: socio.qualificacao ?? null,
            },
          }
          : {}),
      };
  }

  // ---- 4b. Duas fases: direto, depois o que depende do socio ----
  //
  // Planos de CNPJ (Socios/Premium/Total) incluem APIs que pedem CPF — "CPF
  // Ultra dos socios", SCR dos socios, CNDT. Antes a Edge mandava o CNPJ da
  // empresa no campo `cpf`: a chamada era paga e nao voltava nada util.
  // Agora a fase 1 consulta a empresa, a gente extrai o CPF do socio
  // principal do que voltou, e a fase 2 roda com esse CPF.
  const alvoConsulta = alvoDaCategoria(String(consulta.category ?? ""));
  const { diretas: apisDiretas, deSocio: apisDeSocio } = particionarPorAlvo(
    apis,
    alvoConsulta,
    (internal) => findEndpoint(internal)?.paramType
  );

  const resultadosDiretos = await Promise.all(
    apisDiretas.map((internal) => executarChamada(internal, target, targetHash))
  );

  let socioUsado: SocioEncontrado | null = null;
  let resultadosDeSocio: ResultadoChamada[] = [];

  if (apisDeSocio.length > 0) {
    socioUsado = socioPrincipal(resultadosDiretos.map((r) => r.dados));

    if (socioUsado) {
      const hashSocio = await sha256Hex(socioUsado.cpf);
      console.log(
        `[process-consultation] socio encontrado (${mascararCpf(socioUsado.cpf)}) — ${apisDeSocio.length} API(s) encadeada(s)`
      );
      resultadosDeSocio = await Promise.all(
        apisDeSocio.map((internal) =>
          executarChamada(internal, socioUsado!.cpf, hashSocio, socioUsado!)
        )
      );
    } else {
      // Sem CPF de socio no retorno da empresa: NAO chama com o CNPJ (era
      // dinheiro jogado fora). Marca como nao entregue — o refund parcial
      // proporcional devolve a parte do cliente.
      console.log(
        `[process-consultation] nenhum socio PF no retorno do CNPJ — ${apisDeSocio.length} API(s) puladas`
      );
      resultadosDeSocio = apisDeSocio.map((internal) => {
        const ep = findEndpoint(internal);
        return {
          internal,
          path: ep?.path ?? internal,
          nome: ep?.nome ?? internal,
          categoria: ep?.categoria ?? "pessoa",
          status: "not_found" as const,
          dados: undefined,
          costCents: 0,
          durationMs: 0,
          errorMessage:
            "Empresa sem socio pessoa fisica identificado — consulta de socio nao executada (sem cobranca)",
        };
      });
    }
  }

  const callResults = [...resultadosDiretos, ...resultadosDeSocio];

  // ---- 5. Consolida result_jsonb ----
  const sections: Record<string, unknown> = {};
  const callsLog: unknown[] = [];
  let custoTotal = 0;
  let successCount = 0;
  const apisQueFalharam: string[] = [];

  for (const r of callResults) {
    sections[r.internal] = {
      nome: r.nome,
      categoria: r.categoria,
      status: r.status,
      dados: r.dados ?? null,
      error: r.errorMessage,
    };
    callsLog.push({
      api: r.path,
      status: r.status,
      cost_cents: r.costCents,
      duration_ms: r.durationMs,
      error: r.errorMessage,
    });
    custoTotal += r.costCents;

    if (r.status === "sucesso" || r.status === "cached") {
      successCount++;
    } else {
      apisQueFalharam.push(r.path);
    }
  }

  const totalApis = callResults.length;
  const failCount = apisQueFalharam.length;
  // Refund total: nenhuma API entregou dado util
  const fullRefund = totalApis > 0 && successCount === 0;
  // Refund parcial: >=1 sucesso mas >=1 falha. Refund proporcional as APIs falhadas.
  const partialRefund = !fullRefund && failCount > 0 && successCount > 0;
  const refundEligible = fullRefund || partialRefund;

  // Valor cobrado do cliente pra essa consulta (amount_cents em centavos)
  const amountCents = (consulta.amount_cents as number | null) ?? 0;
  let refundAmountCents = 0;
  if (fullRefund) refundAmountCents = amountCents;
  else if (partialRefund) {
    // Proporcional: quantidade de APIs falhadas / total
    refundAmountCents = Math.round((amountCents * failCount) / totalApis);
  }

  const resultJsonb = {
    _generated_at: new Date().toISOString(),
    category: consulta.category,
    plan_tier: consulta.plan_tier,
    target: target,
    sections,
    ...(fullRefund ? { _empty_result: true, _failed_apis: apisQueFalharam } : {}),
    ...(partialRefund
      ? {
        _partial_result: true,
        _failed_apis: apisQueFalharam,
        _refund_amount_cents: refundAmountCents,
      }
      : {}),
  };

  // ---- 6. UPDATE consulta ----
  const { error: updateErr } = await supabase
    .from("consultations")
    .update({
      status: "completed",
      result_jsonb: resultJsonb,
      api_calls_log: callsLog,
      api_total_cost_cents: custoTotal,
      completed_at: new Date().toISOString(),
    })
    .eq("id", consulta.id);

  if (updateErr) {
    console.error("[process-consultation] update falhou:", updateErr);
    return resp(500, { error: "Falha ao salvar resultado" });
  }

  // @ts-expect-error - deno
  const siteUrl = Deno.env.get("NEXT_PUBLIC_SITE_URL") ?? "https://suacapivara.com.br";

  // ---- 7. Refund (total/parcial) OU PDF render — AWAITED com waitUntil ----
  // Fire-and-forget nao funciona em Deno Edge (drop apos response). Usa
  // EdgeRuntime.waitUntil se disponivel; senao await antes do return.
  const dispatchPromise = (async () => {
    if (refundEligible) {
      const reason = fullRefund ? "no_data_found" : "partial_data_failure";
      console.warn(
        `[process-consultation] ${consulta.id} refund=${reason} amount=${refundAmountCents}`
      );
      try {
        const refundResp = await fetch(`${siteUrl}/api/consultations/refund`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-key": internalSecret,
          },
          body: JSON.stringify({
            consultationId: consulta.id,
            reason,
            failedApis: apisQueFalharam,
            partialAmountCents: partialRefund ? refundAmountCents : undefined,
          }),
        });
        if (!refundResp.ok) {
          const t = await refundResp.text().catch(() => "");
          console.error(`[process-consultation] refund route retornou ${refundResp.status}: ${t.slice(0, 200)}`);
        }
      } catch (e) {
        console.error("[process-consultation] refund dispatch falhou:", e);
      }
    }

    // PDF render tambem em sucesso parcial (cliente tem parte dos dados)
    if (!fullRefund) {
      try {
        const pdfResp = await fetch(`${siteUrl}/api/pdf/render`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-key": internalSecret,
          },
          body: JSON.stringify({ consultationId: consulta.id }),
        });
        if (!pdfResp.ok) {
          const t = await pdfResp.text().catch(() => "");
          console.error(`[process-consultation] pdf render retornou ${pdfResp.status}: ${t.slice(0, 200)}`);
        }
      } catch (e) {
        console.error("[process-consultation] pdf dispatch falhou:", e);
      }
    }
  })();

  if (typeof EdgeRuntime !== "undefined") {
    EdgeRuntime.waitUntil(dispatchPromise);
  } else {
    // Fallback: await antes de retornar (garante execucao mesmo sem waitUntil)
    await dispatchPromise;
  }

  return resp(200, {
    ok: true,
    consultationId: consulta.id,
    apis_chamadas: apis.length,
    success_count: successCount,
    cache_hits: callResults.filter((r) => r.status === "cached").length,
    falhas: failCount,
    custo_cents: custoTotal,
    refund_triggered: refundEligible,
    refund_reason: fullRefund ? "no_data_found" : partialRefund ? "partial_data_failure" : null,
    refund_amount_cents: refundEligible ? refundAmountCents : 0,
    duration_ms: Math.max(...callResults.map((r) => r.durationMs)),
  });
});

// =========================================================================
// Helpers
// =========================================================================

interface ConsultaRow {
  plan_tier: string;
  category: string;
  api_calls_log?: unknown[] | null;
  [key: string]: unknown;
}

function extractApis(consulta: ConsultaRow): string[] {
  if (Array.isArray(consulta.api_calls_log) && consulta.api_calls_log.length > 0) {
    const first = consulta.api_calls_log[0];
    if (typeof first === "string") {
      return consulta.api_calls_log as string[];
    }
  }
  return PLAN_API_MAP[consulta.plan_tier] ?? [];
}

// PLAN_API_MAP — DEVE ficar em sincronia com src/lib/consultas/planos.ts (apisIncluidas).
// Chaves internas espelham `internal` de APIFULL_ENDPOINTS acima.
const PLAN_API_MAP: Record<string, string[]> = {
  // CPF
  "cpf-espiadinha": ["cpf-simples"],
  "cpf-investigacao": ["cpf-completo", "boa-vista-essencial"],
  "cpf-avancada": ["cpf-ultra-completo", "boa-vista-essencial", "serasa-basico", "cred-completa-plus"],
  "cpf-premium": ["cpf-ultra-completo", "boa-vista-essencial", "serasa-premium", "cred-completa-plus", "cnd-trabalhista", "quod"],
  "cpf-raio-x": ["cpf-ultra-completo", "boa-vista-essencial", "serasa-premium", "spc-brasil", "scr-bacen", "cred-completa-plus", "cnd-trabalhista", "quod"],
  // CNPJ
  "cnpj-espiadinha": ["cnpj-completo"],
  "cnpj-socios": ["cnpj-completo", "cpf-ultra-socios", "cnd-trabalhista", "boa-vista-essencial"],
  "cnpj-premium": ["cnpj-completo", "cpf-ultra-socios", "cnd-trabalhista", "cred-completa-plus", "serasa-premium", "boa-vista-essencial"],
  "cnpj-total": ["cnpj-completo", "cpf-ultra-socios", "cnd-trabalhista", "cred-completa-plus", "serasa-premium", "spc-brasil", "scr-bacen-socios", "boa-vista-essencial"],
  // Veicular combos
  "veicular-espiadinha": ["placa-basica", "fipe"],
  "veicular-completo": ["placa-basica", "fipe", "bin-nacional", "recall"],
  "veicular-avancado": ["placa-basica", "fipe", "bin-nacional", "bin-estadual", "proprietario-placa", "gravame", "recall", "historico-roubo-furto"],
  "veicular-premium": ["placa-basica", "fipe", "bin-nacional", "bin-estadual", "proprietario-placa", "gravame", "recall", "historico-roubo-furto", "leilao", "certificado-seguranca-veicular"],
  "veicular-total": ["placa-basica", "fipe", "bin-nacional", "bin-estadual", "proprietario-placa", "gravame", "recall", "historico-roubo-furto", "leilao", "certificado-seguranca-veicular", "vip-car", "crlv", "foto-leilao"],
  // Leilao combos
  "leilao-pre-lance": ["placa-basica", "fipe", "leilao", "foto-leilao", "historico-roubo-furto"],
  "leilao-pos-compra": ["placa-basica", "certificado-seguranca-veicular", "crlv", "gravame"],
  "leilao-auctioneer": ["placa-basica", "fipe", "leilao", "foto-leilao", "historico-roubo-furto", "certificado-seguranca-veicular", "crlv", "gravame", "vip-car"],
  // Avulsos veicular
  "veicular-avulso-fipe": ["fipe", "placa-basica"],
  "veicular-avulso-recall": ["recall", "placa-basica"],
  "veicular-avulso-bin-nacional": ["bin-nacional", "placa-basica"],
  "veicular-avulso-gravame": ["gravame", "placa-basica"],
  "veicular-avulso-bin-estadual": ["bin-estadual", "placa-basica"],
  "veicular-avulso-roubo-furto-basico": ["historico-roubo-furto", "placa-basica"],
  "veicular-avulso-proprietario": ["proprietario-placa", "placa-basica"],
  "local-raio-x-cep": ["mercado-sociodemografico", "mercado-gastos-alimentacao", "mercado-gastos-consumo", "mercado-gastos-diversos", "mercado-gastos-educacao", "mercado-gastos-habitacao", "mercado-gastos-higiene", "mercado-gastos-recreacao", "mercado-gastos-saude", "mercado-gastos-servicos", "mercado-gastos-transporte", "mercado-gastos-vestuario", "mercado-infraestrutura", "mercado-macroeconomicos"],
  "local-ponto-comercial": ["mercado-sociodemografico", "mercado-gastos-alimentacao", "mercado-gastos-consumo", "mercado-gastos-diversos", "mercado-gastos-educacao", "mercado-gastos-habitacao", "mercado-gastos-higiene", "mercado-gastos-recreacao", "mercado-gastos-saude", "mercado-gastos-servicos", "mercado-gastos-transporte", "mercado-gastos-vestuario", "mercado-infraestrutura", "mercado-macroeconomicos", "mercado-concorrencia", "mercado-risco-geografico", "mercado-propensao-seguro"],
  "compliance-kyc-pf": ["pld-pf", "obito", "mandados-prisao", "antecedentes-criminais", "cpf-simples"],
  "compliance-kyc-pj": ["pld-pj", "pld-qsa", "cert-situacao-cadastral-pj", "processos-judiciais-pj", "protesto-nacional-pj", "cnpj-completo"],
  "compliance-pld-pf": ["pld-pf", "cpf-simples"],
  "compliance-pld-pj": ["pld-pj", "cnpj-completo"],
  "juridico-radar-pf": ["processos-judiciais-pf", "protesto-nacional", "cadin", "cert-divida-ativa-pf", "cpf-simples"],
  "juridico-protesto-pf": ["protesto-nacional", "cpf-simples"],
  "juridico-cadin-pf": ["cadin", "cpf-simples"],
  "certidao-kit-pf-essencial": ["cert-pgfn-pf", "cnd-trabalhista", "antecedentes-criminais", "cert-cnj-pf", "cert-nada-consta-pf", "cpf-simples"],
  "certidao-kit-pf-completo": ["cert-pgfn-pf", "cnd-trabalhista", "antecedentes-criminais", "cert-cnj-pf", "cert-nada-consta-pf", "cert-cgu-pf", "cert-acoes-trabalhistas-pf", "cert-divida-ativa-pf", "cert-ibama-pf", "cpf-simples"],
  "certidao-kit-pj-licitacao": ["cert-fgts-pj", "cert-pgfn-pj", "cert-debitos-trabalhistas-pj", "cert-situacao-cadastral-pj", "sintegra", "cnpj-completo"],
  "certidao-kit-pj-completo": ["cert-fgts-pj", "cert-pgfn-pj", "cert-debitos-trabalhistas-pj", "cert-situacao-cadastral-pj", "cert-cgu-pj", "cert-cnj-pj", "cert-acoes-trabalhistas-pj", "cert-pcd-pj", "cert-ibama-pj", "sintegra", "cnpj-completo"],
  "certidao-pgfn-pf": ["cert-pgfn-pf", "cpf-simples"],
  "certidao-cndt-pf": ["cnd-trabalhista", "cpf-simples"],
  "certidao-nada-consta-pf": ["cert-nada-consta-pf", "cpf-simples"],
  "certidao-fgts-pj": ["cert-fgts-pj", "cnpj-completo"],
  "certidao-pgfn-pj": ["cert-pgfn-pj", "cnpj-completo"],
  "certidao-situacao-cadastral-pj": ["cert-situacao-cadastral-pj", "cnpj-completo"],
  "cpf-avulso-processos": ["processos-judiciais-pf", "cpf-simples"],
  "cpf-avulso-antecedentes": ["antecedentes-criminais", "cpf-simples"],
  "cpf-avulso-darkweb": ["darkweb-pf", "cpf-simples"],
  "cpf-avulso-financeiro": ["dados-financeiros-pf", "cpf-simples"],
  "cpf-avulso-vinculos": ["pessoas-relacionadas", "cpf-simples"],
  "cpf-avulso-profissional": ["dados-profissionais", "cpf-simples"],
  "cpf-avulso-cnh": ["cnh", "cpf-simples"],
  "cpf-avulso-veiculos": ["veiculos-por-cpf", "cpf-simples"],
  "cpf-avulso-imoveis": ["imoveis", "cpf-simples"],
  "cnpj-avulso-processos": ["processos-judiciais-pj", "cnpj-completo"],
  "cnpj-avulso-socios": ["quadro-societario", "cnpj-completo"],
  "cnpj-avulso-veiculos": ["veiculos-por-cnpj", "cnpj-completo"],
  "cnpj-avulso-sintegra": ["sintegra", "cnpj-completo"],
  "veicular-avulso-rastreamento": ["rastreamento-veicular", "placa-basica"],
  "veicular-avulso-debitos": ["veiculo-debitos", "placa-basica"],
  "veicular-avulso-renainf": ["renainf", "placa-basica"],
  "veicular-avulso-renajud": ["renajud", "placa-basica"],
  "veicular-avulso-atpve": ["atpv-e", "placa-basica"],
  "veicular-avulso-radar": ["placa-radar", "placa-basica"],
  "veicular-avulso-csv": ["certificado-seguranca-veicular", "placa-basica"],
  "veicular-avulso-crlv": ["crlv", "placa-basica"],
  // Avulsos leilao
  "leilao-avulso-historico": ["leilao", "placa-basica"],
  "leilao-avulso-foto": ["foto-leilao", "placa-basica"],
  "leilao-avulso-vip-car": ["vip-car", "placa-basica"],
};

function resp(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
