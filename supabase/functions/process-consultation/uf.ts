/**
 * UF de registro do veiculo, tirada do retorno da consulta basica da placa.
 *
 * O endpoint `crlv` da APIFULL exige o estado (`state`, como codigo numerico).
 * Sem isso o CRLV falhava em todo produto. Em vez de perguntar ao cliente
 * (que muitas vezes nem sabe onde o carro e registrado), a Edge le a UF do
 * que a consulta basica ja devolveu.
 *
 * Tolerante ao formato: procura chave de UF (uf, uf_placa, estado...) com
 * valor de duas letras que seja uma UF valida.
 */

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

// Ordem importa: chave mais especifica primeiro (uf da placa > uf generica).
const CHAVES_UF = ["uf_placa", "ufplaca", "uf_veiculo", "ufveiculo", "uf_registro", "uf", "estado", "sigla_uf"];

function normalizar(k: string): string {
  return k.toLowerCase().replace(/[^a-z_]/g, "");
}

/** Devolve a UF (sigla) ou null. */
export function extrairUfVeiculo(raiz: unknown, profundidadeMax = 5): string | null {
  const achados: { uf: string; prioridade: number }[] = [];

  function visitar(no: unknown, prof: number) {
    if (prof > profundidadeMax || no === null || typeof no !== "object") return;
    if (Array.isArray(no)) {
      for (const item of no) visitar(item, prof + 1);
      return;
    }
    for (const [k, v] of Object.entries(no as Record<string, unknown>)) {
      const chave = normalizar(k);
      const idx = CHAVES_UF.indexOf(chave);
      if (idx >= 0 && typeof v === "string") {
        const uf = v.trim().toUpperCase();
        if (UFS.has(uf)) achados.push({ uf, prioridade: idx });
      }
      // "Municipio/UF" no mesmo campo, ex.: "SAO PAULO/SP" ou "Curitiba - PR"
      if (/municipio|cidade/.test(chave) && typeof v === "string") {
        const m = v.trim().match(/[\/\-]\s*([A-Za-z]{2})$/);
        if (m && UFS.has(m[1].toUpperCase())) achados.push({ uf: m[1].toUpperCase(), prioridade: 50 });
      }
      visitar(v, prof + 1);
    }
  }

  visitar(raiz, 0);
  if (achados.length === 0) return null;
  achados.sort((a, b) => a.prioridade - b.prioridade);
  return achados[0].uf;
}
