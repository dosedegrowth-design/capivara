/**
 * Tipos espelhando o schema 'capivara' do Supabase.
 *
 * IMPORTANTE: este arquivo e escrito a mao por agora. Quando o time crescer,
 * substituir por geracao automatica via:
 *   supabase gen types typescript --project-id hkjukobqpjezhpxzplpj --schema capivara
 *
 * Manter sincronizado com supabase/migrations/0001_initial_schema.sql.
 */

export type AccountType = "pf" | "pj_admin" | "pj_member" | "admin";
export type PlanTier = "start" | "pro" | "plus" | "master" | "corporate";
export type CompanyRole = "admin" | "operator" | "viewer";
export type ConsultaCategory = "cpf" | "cnpj" | "veicular";
export type PaymentType = "pix" | "boleto" | "cartao_avista" | "folhas";
export type ConsultationStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "completed"
  | "error"
  | "expired"
  | "refunded";
export type TransactionType = "consultation" | "recharge" | "refund";
export type TransactionStatus =
  | "pending"
  | "paid"
  | "expired"
  | "cancelled"
  | "refunded";
export type ErrorSeverity = "info" | "warning" | "error" | "critical";

// =========================================================================
// Tabelas — formato `Row` (SELECT), `Insert`, `Update`
// =========================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  cpf: string | null;
  phone: string | null;
  account_type: AccountType;
  active_company_id: string | null;
  lgpd_accepted_at: string | null;
  asaas_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  razao_social: string | null;
  owner_id: string;
  /** @deprecated Use balance_cents. Mantido por compat ate cleanup. */
  folhas_balance: number;
  /** Saldo B2B em centavos de R$. Cada consulta debita precoB2B_centavos do plano. */
  balance_cents: number;
  plan_tier: PlanTier;
  fiscal_settings: Record<string, unknown>;
  email_billing: string | null;
  asaas_customer_id: string | null;
  custom_logo_url: string | null;
  cache_extended_days: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: CompanyRole;
  cost_center: string | null;
  invited_at: string;
  accepted_at: string | null;
}

export interface Consultation {
  id: string;
  user_id: string;
  company_id: string | null;
  category: ConsultaCategory;
  plan_tier: string;
  target_value: string;
  target_normalized: string;
  target_hash: string;
  finality: string;
  finality_description: string | null;
  payment_type: PaymentType;
  amount_cents: number;
  /** @deprecated Use amount_cents. Mantido por compat ate cleanup. */
  folhas_used: number;
  asaas_payment_id: string | null;
  status: ConsultationStatus;
  result_jsonb: Record<string, unknown> | null;
  pdf_url: string | null;
  cache_hit: boolean;
  cached_from_id: string | null;
  api_calls_log: unknown[];
  api_total_cost_cents: number;
  ip_address: string | null;
  user_agent: string | null;
  cost_center: string | null;
  created_at: string;
  paid_at: string | null;
  processing_started_at: string | null;
  completed_at: string | null;
  expires_at: string;
}

export interface Transaction {
  id: string;
  user_id: string | null;
  company_id: string | null;
  type: TransactionType;
  reference_id: string | null;
  payment_method: Exclude<PaymentType, "folhas">;
  amount_cents: number;
  /** @deprecated Use amount_cents. Mantido por compat. Em recargas, amount_cents = valor pago, e a empresa recebe saldoTotal_centavos (= amount_cents + bonus) em balance_cents. */
  folhas_added: number;
  bonus_percentage: number;
  asaas_payment_id: string | null;
  asaas_customer_id: string | null;
  asaas_response: Record<string, unknown> | null;
  pix_qrcode: string | null;
  pix_copy_paste: string | null;
  boleto_url: string | null;
  boleto_barcode: string | null;
  invoice_url: string | null;
  invoice_number: string | null;
  status: TransactionStatus;
  due_date: string | null;
  paid_at: string | null;
  expired_at: string | null;
  created_at: string;
}

export interface ApiCacheEntry {
  cache_key: string;
  api_name: string;
  target_hash: string;
  result_jsonb: Record<string, unknown>;
  cost_cents: number;
  hits: number;
  created_at: string;
  expires_at: string;
}

export interface ErrorLog {
  id: string;
  context: string;
  severity: ErrorSeverity;
  user_id: string | null;
  consultation_id: string | null;
  message: string;
  stack_trace: string | null;
  metadata: Record<string, unknown> | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_email: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  changes: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}
