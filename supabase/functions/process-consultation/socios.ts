/**
 * Extracao do CPF do socio principal a partir do resultado de uma consulta
 * de CNPJ.
 *
 * Por que existe: os planos CNPJ (Socios, Premium, Total) incluem APIs que
 * pedem CPF — "CPF Ultra dos socios", SCR Bacen dos socios, CNDT etc. A Edge
 * mandava o CNPJ da empresa no campo `cpf`, entao essas chamadas nunca
 * retornavam nada util: o cliente pagava pelo plano e recebia so a parte PJ.
 *
 * Como a resposta da APIFULL varia por endpoint (`socios`, `qsa`,
 * `quadro_societario`, nomes de campo diferentes pro documento), o extrator e
 * tolerante: varre a arvore atras de qualquer objeto que pareca um socio e
 * pega o primeiro CPF valido, preferindo quem tem cara de administrador.
 */

export interface SocioEncontrado {
  cpf: string;
  nome?: string;
  qualificacao?: string;
  /** Caminho no JSON onde foi achado — vai pro log, ajuda a depurar. */
  origem: string;
}

const CHAVES_LISTA_SOCIO = [
  "socios",
  "socio",
  "qsa",
  "quadro_societario",
  "quadrosocietario",
  "quadro_de_socios",
  "partners",
  "representantes",
];

const CHAVES_DOC = [
  "cpf",
  "cpf_socio",
  "cpfsocio",
  "documento",
  "document",
  "doc",
  "cpf_cnpj_socio",
  "cpfcnpjsocio",
  "nr_cpf",
  "num_cpf",
  "cpf_representante",
];

const CHAVES_NOME = ["nome", "nome_socio", "nomesocio", "name", "razao_social", "nome_completo"];
const CHAVES_QUALIF = [
  "qualificacao",
  "qualificacao_socio",
  "qual",
  "cargo",
  "funcao",
  "tipo",
  "descricao_qualificacao",
];

function normalizarChave(k: string): string {
  return k
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z_]/g, "");
}

/** So digitos. */
export function somenteDigitos(v: unknown): string {
  return typeof v === "string" || typeof v === "number"
    ? String(v).replace(/\D/g, "")
    : "";
}

/** Validacao de CPF com digito verificador (mesma regra do site). */
export function cpfValido(raw: unknown): boolean {
  const cpf = somenteDigitos(raw);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
  let d1 = (soma * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== Number(cpf[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
  let d2 = (soma * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === Number(cpf[10]);
}

function pegarCampo(obj: Record<string, unknown>, chaves: string[]): unknown {
  for (const [k, v] of Object.entries(obj)) {
    if (chaves.includes(normalizarChave(k))) return v;
  }
  return undefined;
}

/** Administrador/socio-administrador vem antes de socio comum. */
function pesoQualificacao(q?: string): number {
  if (!q) return 0;
  const s = q.toLowerCase();
  if (s.includes("administrador")) return 3;
  if (s.includes("titular") || s.includes("presidente") || s.includes("diretor")) return 2;
  if (s.includes("socio") || s.includes("sócio")) return 1;
  return 0;
}

function extrairDeObjeto(
  obj: Record<string, unknown>,
  origem: string
): SocioEncontrado | null {
  const doc = pegarCampo(obj, CHAVES_DOC);
  const cpf = somenteDigitos(doc);
  // Socio PJ (CNPJ de 14 digitos) nao serve pra API de CPF — ignora.
  if (!cpfValido(cpf)) return null;
  const nomeRaw = pegarCampo(obj, CHAVES_NOME);
  const qualRaw = pegarCampo(obj, CHAVES_QUALIF);
  return {
    cpf,
    nome: typeof nomeRaw === "string" ? nomeRaw : undefined,
    qualificacao: typeof qualRaw === "string" ? qualRaw : undefined,
    origem,
  };
}

/**
 * Varre a arvore e devolve todos os socios com CPF valido, ordenados por
 * relevancia (administrador primeiro) e mantendo a ordem original no empate.
 */
export function extrairSocios(raiz: unknown, profundidadeMax = 6): SocioEncontrado[] {
  const achados: { socio: SocioEncontrado; ordem: number; dentroDeLista: boolean }[] = [];
  let ordem = 0;

  function visitar(no: unknown, caminho: string, prof: number, dentroDeLista: boolean) {
    if (prof > profundidadeMax || no === null || typeof no !== "object") return;

    if (Array.isArray(no)) {
      no.forEach((item, i) => visitar(item, `${caminho}[${i}]`, prof + 1, dentroDeLista));
      return;
    }

    const obj = no as Record<string, unknown>;

    // Objeto que parece um socio: tem documento que valida como CPF.
    // Fora de uma lista de socios, so aceita se a chave do documento for
    // explicitamente de socio — senao o CPF do titular de uma consulta PF
    // qualquer seria confundido com socio.
    const doc = pegarCampo(obj, CHAVES_DOC);
    if (doc !== undefined) {
      const chaveDoc = Object.keys(obj).find((k) => CHAVES_DOC.includes(normalizarChave(k)));
      const chaveEhDeSocio = chaveDoc ? normalizarChave(chaveDoc).includes("socio") : false;
      if (dentroDeLista || chaveEhDeSocio) {
        const s = extrairDeObjeto(obj, caminho);
        if (s) achados.push({ socio: s, ordem: ordem++, dentroDeLista });
      }
    }

    for (const [k, v] of Object.entries(obj)) {
      const ehListaDeSocio = CHAVES_LISTA_SOCIO.includes(normalizarChave(k));
      visitar(v, caminho ? `${caminho}.${k}` : k, prof + 1, dentroDeLista || ehListaDeSocio);
    }
  }

  visitar(raiz, "", 0, false);

  // Dedup por CPF, mantendo a primeira ocorrencia
  const porCpf = new Map<string, (typeof achados)[number]>();
  for (const a of achados) {
    if (!porCpf.has(a.socio.cpf)) porCpf.set(a.socio.cpf, a);
  }

  return [...porCpf.values()]
    .sort((a, b) => {
      const pa = pesoQualificacao(a.socio.qualificacao);
      const pb = pesoQualificacao(b.socio.qualificacao);
      if (pa !== pb) return pb - pa;
      return a.ordem - b.ordem;
    })
    .map((a) => a.socio);
}

/** Socio principal (administrador, ou o primeiro da lista). */
export function socioPrincipal(raiz: unknown): SocioEncontrado | null {
  return extrairSocios(raiz)[0] ?? null;
}

/**
 * Separa as APIs de um plano em: as que rodam com o alvo da consulta e as que
 * precisam do CPF de um socio (so acontece em consulta de CNPJ).
 *
 * `paramTypeDe` devolve o parametro que a API espera, ou undefined se o
 * endpoint nao estiver mapeado — esse caso vai pro grupo direto de proposito,
 * pra continuar caindo no tratamento de erro que ja existe.
 */
export function particionarPorAlvo(
  apis: string[],
  alvoConsulta: "placa" | "cpf" | "cnpj" | "cep",
  paramTypeDe: (internal: string) => string | undefined
): { diretas: string[]; deSocio: string[] } {
  const diretas: string[] = [];
  const deSocio: string[] = [];

  for (const internal of apis) {
    const pt = paramTypeDe(internal);
    if (pt && alvoConsulta === "cnpj" && pt === "cpf") deSocio.push(internal);
    else diretas.push(internal);
  }

  return { diretas, deSocio };
}
