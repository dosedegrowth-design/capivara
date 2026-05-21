-- =========================================================================
-- Capivara · Schema inicial
-- Migracao 0001 — Fundacao do sistema
-- =========================================================================

-- ---- Profiles (extends auth.users) ----
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  cpf TEXT,
  phone TEXT,
  account_type TEXT NOT NULL DEFAULT 'pf' CHECK (account_type IN ('pf', 'pj_admin', 'pj_member', 'admin')),
  active_company_id UUID,
  lgpd_accepted_at TIMESTAMPTZ,
  asaas_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_cpf ON profiles(cpf) WHERE cpf IS NOT NULL;

-- ---- Companies ----
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  razao_social TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  folhas_balance INT DEFAULT 0 CHECK (folhas_balance >= 0),
  plan_tier TEXT DEFAULT 'start' CHECK (plan_tier IN ('start', 'pro', 'plus', 'master', 'corporate')),
  fiscal_settings JSONB DEFAULT '{}',
  email_billing TEXT,
  asaas_customer_id TEXT,
  custom_logo_url TEXT,
  cache_extended_days INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_companies_cnpj ON companies(cnpj);
CREATE INDEX idx_companies_owner ON companies(owner_id);

ALTER TABLE profiles
  ADD CONSTRAINT profiles_active_company_fk
  FOREIGN KEY (active_company_id) REFERENCES companies(id) ON DELETE SET NULL;

-- ---- Company members ----
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  cost_center TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_members_user ON company_members(user_id);

-- ---- Consultations ----
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,

  category TEXT NOT NULL CHECK (category IN ('cpf', 'cnpj', 'veicular')),
  plan_tier TEXT NOT NULL,
  target_value TEXT NOT NULL,
  target_normalized TEXT NOT NULL,
  target_hash TEXT NOT NULL,

  finality TEXT NOT NULL,
  finality_description TEXT,

  payment_type TEXT NOT NULL CHECK (payment_type IN ('pix', 'boleto', 'cartao_avista', 'folhas')),
  amount_cents INT NOT NULL DEFAULT 0,
  folhas_used INT DEFAULT 0,
  asaas_payment_id TEXT,

  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN (
    'pending_payment', 'paid', 'processing', 'completed', 'error', 'expired', 'refunded'
  )),

  result_jsonb JSONB,
  pdf_url TEXT,
  cache_hit BOOLEAN DEFAULT FALSE,
  cached_from_id UUID REFERENCES consultations(id),

  api_calls_log JSONB DEFAULT '[]',
  api_total_cost_cents INT DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  cost_center TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  paid_at TIMESTAMPTZ,
  processing_started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')
);

CREATE INDEX idx_consultations_user ON consultations(user_id, created_at DESC);
CREATE INDEX idx_consultations_company ON consultations(company_id, created_at DESC);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_cache ON consultations(target_hash, plan_tier, created_at DESC);
CREATE INDEX idx_consultations_asaas ON consultations(asaas_payment_id) WHERE asaas_payment_id IS NOT NULL;

-- ---- API cache (24h padrao, configuravel para B2B) ----
CREATE TABLE api_cache (
  cache_key TEXT PRIMARY KEY,
  api_name TEXT NOT NULL,
  target_hash TEXT NOT NULL,
  result_jsonb JSONB NOT NULL,
  cost_cents INT NOT NULL,
  hits INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_api_cache_target ON api_cache(target_hash);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);

-- ---- Transactions (pagamentos B2C avulso + recargas B2B) ----
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

  type TEXT NOT NULL CHECK (type IN ('consultation', 'recharge', 'refund')),
  reference_id UUID,

  payment_method TEXT NOT NULL CHECK (payment_method IN ('pix', 'boleto', 'cartao_avista')),
  amount_cents INT NOT NULL,
  folhas_added INT DEFAULT 0,
  bonus_percentage INT DEFAULT 0,

  asaas_payment_id TEXT UNIQUE,
  asaas_customer_id TEXT,
  asaas_response JSONB,

  pix_qrcode TEXT,
  pix_copy_paste TEXT,
  boleto_url TEXT,
  boleto_barcode TEXT,

  invoice_url TEXT,
  invoice_number TEXT,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'expired', 'cancelled', 'refunded')),

  due_date DATE,
  paid_at TIMESTAMPTZ,
  expired_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_user ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_company ON transactions(company_id, created_at DESC);
CREATE INDEX idx_transactions_asaas ON transactions(asaas_payment_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ---- Error logs (substitui Sentry) ----
CREATE TABLE error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_error_logs_severity ON error_logs(severity, created_at DESC) WHERE resolved = false;
CREATE INDEX idx_error_logs_context ON error_logs(context, created_at DESC);

-- ---- Audit logs (LGPD + segurança) ----
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- =========================================================================
-- RLS — habilitar em todas as tabelas com dados de usuario/empresa
-- =========================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- api_cache nao precisa RLS — sempre acessada via service_role

-- ---- Policies basicas (refinaremos na migration de policies) ----
CREATE POLICY "users_read_own_profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own_profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "members_read_company" ON companies FOR SELECT USING (
  EXISTS (SELECT 1 FROM company_members WHERE company_id = companies.id AND user_id = auth.uid())
);

CREATE POLICY "users_read_own_consultations" ON consultations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "company_members_read_consultations" ON consultations FOR SELECT USING (
  company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM company_members WHERE company_id = consultations.company_id AND user_id = auth.uid()
  )
);

CREATE POLICY "users_read_own_transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "company_admins_read_transactions" ON transactions FOR SELECT USING (
  company_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM company_members
    WHERE company_id = transactions.company_id
      AND user_id = auth.uid()
      AND role = 'admin'
  )
);

-- Admin role bypass via service_role; jamais expor a key no client
