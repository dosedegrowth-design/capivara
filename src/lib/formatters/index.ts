/**
 * Formatadores e normalizadores para os 3 tipos de consulta Capivara.
 * Todas as funcoes sao puras e sem dependencias externas.
 */

// =========================================================================
// CPF — 11 digitos
// =========================================================================

/** Remove tudo que nao for digito. */
export function normalizeCPF(input: string): string {
  return input.replace(/\D/g, "").slice(0, 11);
}

/** Formata como 000.000.000-00 conforme o usuario digita. */
export function formatCPF(input: string): string {
  const d = normalizeCPF(input);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Valida com digito verificador. */
export function isValidCPF(input: string): boolean {
  const cpf = normalizeCPF(input);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false; // todos digitos iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(cpf[10]);
}

// =========================================================================
// CNPJ — 14 digitos
// =========================================================================

export function normalizeCNPJ(input: string): string {
  return input.replace(/\D/g, "").slice(0, 14);
}

/** Formata como 00.000.000/0000-00. */
export function formatCNPJ(input: string): string {
  const d = normalizeCNPJ(input);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** Valida com digito verificador. */
export function isValidCNPJ(input: string): boolean {
  const cnpj = normalizeCNPJ(input);
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, ...weights1];

  const calc = (digits: string, weights: number[]) => {
    const sum = digits
      .split("")
      .reduce((acc, d, i) => acc + parseInt(d) * weights[i], 0);
    const mod = sum % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d13 = calc(cnpj.slice(0, 12), weights1);
  if (d13 !== parseInt(cnpj[12])) return false;
  const d14 = calc(cnpj.slice(0, 13), weights2);
  return d14 === parseInt(cnpj[13]);
}

// =========================================================================
// Placa — Mercosul (LLL0L00) ou antiga (LLL0000)
// =========================================================================

export function normalizePlaca(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 7);
}

/** Formata como AAA-0A00 ou AAA-0000. */
export function formatPlaca(input: string): string {
  const p = normalizePlaca(input);
  if (p.length <= 3) return p;
  return `${p.slice(0, 3)}-${p.slice(3)}`;
}

/** Aceita formato antigo (AAA0000) ou Mercosul (AAA0A00). */
export function isValidPlaca(input: string): boolean {
  const p = normalizePlaca(input);
  if (p.length !== 7) return false;
  // Antiga: 3 letras + 4 numeros
  if (/^[A-Z]{3}[0-9]{4}$/.test(p)) return true;
  // Mercosul: 3 letras + 1 numero + 1 letra + 2 numeros
  if (/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p)) return true;
  return false;
}

// =========================================================================
// Valores monetarios e datas BR
// =========================================================================

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDateBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("pt-BR");
}

export function formatDateTimeBR(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// =========================================================================
// Mascaramento para auditoria/logs
// =========================================================================

/** Mascara CPF: 123.456.789-00 -> 123.***.***-00 */
export function maskCPF(input: string): string {
  const cpf = normalizeCPF(input);
  if (cpf.length !== 11) return formatCPF(input);
  return `${cpf.slice(0, 3)}.***.***-${cpf.slice(9)}`;
}

/** Mascara CNPJ — mantem so prefixo e digitos verificadores. */
export function maskCNPJ(input: string): string {
  const cnpj = normalizeCNPJ(input);
  if (cnpj.length !== 14) return formatCNPJ(input);
  return `${cnpj.slice(0, 2)}.***.***/****-${cnpj.slice(12)}`;
}
