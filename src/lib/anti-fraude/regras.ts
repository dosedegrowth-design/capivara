/**
 * Regras anti-fraude que nao dependem do banco.
 *
 * Ficam separadas do `index.ts` de proposito: sao funcoes puras, entao dao
 * pra testar sem subir Supabase (`npm run test:fraude`). O que precisa de
 * consulta (velocidade, blocklist, historico) mora no index.
 *
 * As regras SQL (capivara.check_fraud_rules) cuidam de velocidade por USUARIO.
 * O buraco que elas nao cobrem: quem cria conta nova a cada bloqueio. Por isso
 * a avaliacao aqui tambem olha IP e o proprio documento consultado.
 */

export type Severidade = "info" | "baixa" | "media" | "alta";
export type Acao = "permitir" | "sinalizar" | "bloquear";

export interface Sinal {
  regra: string;
  severidade: Severidade;
  acao: Acao;
  descricao: string;
  metadata?: Record<string, unknown>;
}

/** Documentos que circulam em tutorial/gerador e nao pertencem a ninguem. */
const DOCUMENTOS_DE_TESTE = new Set([
  "11111111111",
  "12345678909",
  "00000000000191", // Banco do Brasil — CNPJ usado em todo exemplo de API
  "11222333000181",
]);

/**
 * Consultar documento de teste nao e fraude: e quase sempre alguem explorando.
 * Vale sinalizar (pra nao gastar API a toa em escala) mas nunca bloquear.
 */
export function regraDocumentoDeTeste(targetNormalizado: string): Sinal | null {
  if (!DOCUMENTOS_DE_TESTE.has(targetNormalizado)) return null;
  return {
    regra: "documento_de_teste",
    severidade: "info",
    acao: "sinalizar",
    descricao: "Documento conhecido de exemplo/gerador",
    metadata: { target: targetNormalizado },
  };
}

/**
 * Cliente declarou "consulta a mim mesmo" mas o documento e outro.
 *
 * Importa pra LGPD: self_check e a finalidade com menor exigencia de
 * justificativa. Declarar self_check pra consultar terceiro e exatamente o
 * desvio de finalidade que o Art. 6 veda — e o registro do aceite fica falso.
 */
export function regraAutoconsultaDivergente(
  finalidade: string,
  targetNormalizado: string,
  documentoDoCadastro: string | null | undefined
): Sinal | null {
  if (finalidade !== "self_check") return null;
  const cadastro = (documentoDoCadastro ?? "").replace(/\D/g, "");
  // Sem CPF no cadastro nao da pra comparar — outra regra ja exige cadastro
  // completo antes de consultar.
  if (!cadastro) return null;
  if (cadastro === targetNormalizado) return null;
  return {
    regra: "autoconsulta_divergente",
    severidade: "media",
    acao: "sinalizar",
    descricao:
      'Finalidade declarada "consulta a mim mesmo" com documento diferente do cadastro',
    metadata: { documento_confere: false },
  };
}

/**
 * Muitos alvos DIFERENTES do mesmo IP numa janela curta.
 *
 * A regra SQL conta consultas por usuario; essa conta alvos distintos por IP,
 * que e o padrao de quem esta varrendo lista — e sobrevive a troca de conta.
 */
export function regraVarreduraPorIp(
  alvosDistintosNaJanela: number,
  limiteSinalizar = 10,
  limiteBloquear = 25
): Sinal | null {
  if (alvosDistintosNaJanela >= limiteBloquear) {
    return {
      regra: "varredura_por_ip",
      severidade: "alta",
      acao: "bloquear",
      descricao: `${alvosDistintosNaJanela} documentos diferentes consultados do mesmo IP em 1h`,
      metadata: { alvos_distintos: alvosDistintosNaJanela },
    };
  }
  if (alvosDistintosNaJanela >= limiteSinalizar) {
    return {
      regra: "varredura_por_ip",
      severidade: "media",
      acao: "sinalizar",
      descricao: `${alvosDistintosNaJanela} documentos diferentes consultados do mesmo IP em 1h`,
      metadata: { alvos_distintos: alvosDistintosNaJanela },
    };
  }
  return null;
}

/** Documento, usuario ou IP na blocklist — decisao manual do admin. */
export function regraBlocklist(
  entrada: { tipo: string; motivo: string | null } | null
): Sinal | null {
  if (!entrada) return null;
  return {
    regra: "blocklist",
    severidade: "alta",
    acao: "bloquear",
    descricao: entrada.motivo ?? `Bloqueio manual (${entrada.tipo})`,
    metadata: { tipo: entrada.tipo },
  };
}

/** A acao mais severa entre os sinais manda. */
export function decidir(sinais: Sinal[]): Acao {
  if (sinais.some((s) => s.acao === "bloquear")) return "bloquear";
  if (sinais.some((s) => s.acao === "sinalizar")) return "sinalizar";
  return "permitir";
}

/** Mensagem pro cliente. Nunca conta qual regra pegou. */
export function mensagemDeBloqueio(): string {
  return "Não conseguimos liberar esta consulta agora. Se você acha que é engano, fale com o suporte.";
}
