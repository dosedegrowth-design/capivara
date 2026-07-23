/**
 * Configuracao centralizada — CNPJ, contato, redes.
 *
 * Valores vem de env vars (NEXT_PUBLIC_*) pra permitir troca sem redeploy.
 * Fallbacks documentam o esperado. Preencher em prod:
 *   NEXT_PUBLIC_CAPIVARA_CNPJ=XX.XXX.XXX/0001-XX
 *   NEXT_PUBLIC_CAPIVARA_RAZAO_SOCIAL=Dose de Growth Marketing LTDA
 *   NEXT_PUBLIC_CAPIVARA_WA_URL=https://wa.me/55XXXXXXXXXXX
 *   NEXT_PUBLIC_CAPIVARA_TEL=(11) XXXX-XXXX
 *   NEXT_PUBLIC_CAPIVARA_EMAIL=contato@suacapivara.com.br
 */

export const CAPIVARA_CONFIG = {
  cnpj: process.env.NEXT_PUBLIC_CAPIVARA_CNPJ ?? "",
  razaoSocial: process.env.NEXT_PUBLIC_CAPIVARA_RAZAO_SOCIAL ?? "Dose de Growth Marketing LTDA",
  wa: process.env.NEXT_PUBLIC_CAPIVARA_WA_URL ?? "",
  tel: process.env.NEXT_PUBLIC_CAPIVARA_TEL ?? "",
  email: process.env.NEXT_PUBLIC_CAPIVARA_EMAIL ?? "contato@suacapivara.com.br",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://suacapivara.com.br",
} as const;

/**
 * Formata CNPJ visivel. Se nao configurado, retorna string vazia
 * (pra UI condicionalmente esconder linha) OU placeholder de dev.
 */
export function cnpjFormatado(): string {
  const cnpj = CAPIVARA_CONFIG.cnpj.trim();
  if (!cnpj) return "";
  // Ja formatado no env? Usa direto. Senao aplica mask.
  if (cnpj.includes(".") || cnpj.includes("/")) return cnpj;
  // 14 digitos → aplica mask
  const only = cnpj.replace(/\D/g, "");
  if (only.length !== 14) return cnpj;
  return only.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

/**
 * Retorna a identificacao completa da controladora pra rodapes/LGPD.
 * Ex: "Dose de Growth Marketing LTDA · CNPJ 12.345.678/0001-99"
 */
export function identificacaoControladora(): string {
  const cnpj = cnpjFormatado();
  if (!cnpj) return CAPIVARA_CONFIG.razaoSocial;
  return `${CAPIVARA_CONFIG.razaoSocial} · CNPJ ${cnpj}`;
}
