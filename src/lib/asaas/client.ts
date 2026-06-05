import type {
  AsaasCustomer,
  AsaasPayment,
  CreateCustomerInput,
  CreatePaymentInput,
  PixQrCode,
} from "./types";

/**
 * Cliente Asaas — wrapper minimo da API v3.
 * Suporta PIX, Boleto e Cartao a vista.
 * Doc: https://docs.asaas.com/
 *
 * Uso server-only — nao expor a API key no client.
 */

const ASAAS_BASE_URL_PROD = "https://api.asaas.com/v3";
const ASAAS_BASE_URL_SANDBOX = "https://sandbox.asaas.com/api/v3";

function baseUrl(): string {
  return process.env.ASAAS_ENV === "production"
    ? ASAAS_BASE_URL_PROD
    : ASAAS_BASE_URL_SANDBOX;
}

function apiKey(): string {
  const key = process.env.ASAAS_API_KEY;
  if (!key) {
    throw new Error("ASAAS_API_KEY nao configurada");
  }
  return key;
}

async function asaasFetch<T>(
  path: string,
  init: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(`${baseUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey(),
      ...headers,
    },
    body: json ? JSON.stringify(json) : init.body,
    cache: "no-store",
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Asaas ${res.status}: ${errBody}`);
  }

  return res.json() as Promise<T>;
}

// =========================================================================
// Customers
// =========================================================================

export async function createOrGetCustomer(
  input: CreateCustomerInput
): Promise<AsaasCustomer> {
  // Tenta achar por CPF/CNPJ
  const search = await asaasFetch<{ data: AsaasCustomer[] }>(
    `/customers?cpfCnpj=${encodeURIComponent(input.cpfCnpj)}&limit=1`
  );

  if (search.data && search.data.length > 0) {
    return search.data[0];
  }

  return asaasFetch<AsaasCustomer>("/customers", {
    method: "POST",
    json: input,
  });
}

// =========================================================================
// Payments
// =========================================================================

export async function createPayment(
  input: CreatePaymentInput
): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>("/payments", {
    method: "POST",
    json: input,
  });
}

export async function getPayment(id: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${id}`);
}

export async function getPixQrCode(paymentId: string): Promise<PixQrCode> {
  return asaasFetch<PixQrCode>(`/payments/${paymentId}/pixQrCode`);
}

export async function cancelPayment(id: string): Promise<AsaasPayment> {
  return asaasFetch<AsaasPayment>(`/payments/${id}`, { method: "DELETE" });
}

/**
 * Reembolso total ou parcial de um pagamento confirmado.
 * Doc: https://docs.asaas.com/reference/estornar-cobranca
 *
 * @param paymentId  ID Asaas do pagamento
 * @param valueBrl   Valor em BRL (decimal) — se omitido, Asaas estorna 100%
 * @param description Motivo do estorno
 */
export async function refundPayment(
  paymentId: string,
  valueBrl?: number,
  description?: string
): Promise<AsaasPayment> {
  const body: Record<string, unknown> = {};
  if (typeof valueBrl === "number") body.value = valueBrl;
  if (description) body.description = description;

  return asaasFetch<AsaasPayment>(`/payments/${paymentId}/refund`, {
    method: "POST",
    json: body,
  });
}

// =========================================================================
// Helpers
// =========================================================================

/** Valor em centavos → BRL decimal (Asaas usa decimal). */
export function centavosToReal(centavos: number): number {
  return Number((centavos / 100).toFixed(2));
}

/** Data hoje + N dias como YYYY-MM-DD. */
export function dueDate(daysFromNow = 1): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}
