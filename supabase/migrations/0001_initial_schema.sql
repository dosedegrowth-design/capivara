-- =========================================================================
-- Capivara · Schema inicial
-- Migracao 0001 — Fundacao do sistema
--
-- IMPORTANTE: Capivara compartilha o projeto Supabase 'DDG' (hkjukobqpjezhpxzplpj)
-- com outros sistemas DDG (dash-supervisao usa o schema 'public' com tabelas
-- SPV_*). Para evitar colisao, TODAS as tabelas Capivara ficam no schema
-- dedicado 'capivara'.
--
-- Para configurar o supabase-js a operar no schema correto:
--   createClient(url, key, { db: { schema: 'capivara' } })
-- =========================================================================

-- ---- Schema isolado ----
CREATE SCHEMA IF NOT EXISTS capivara;

-- Permitir acesso para roles padrao do Supabase
GRANT USAGE ON SCHEMA capivara TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA capivara
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA capivara
  GRANT USAGE, SELECT ON SEQUENCES TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA capivara
  GRANT EXECUTE ON FUNCTIONS TO authenticated, service_role;

-- =========================================================================
-- Tabelas
-- =========================================================================

-- ---- Profiles (extends auth.users) ----
CREATE TABLE capivara.profiles (
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

CREATE INDEX idx_capivara_profiles_email ON capivara.profiles(email);
CREATE INDEX idx_capivara_profiles_cpf ON capivara.profiles(cpf) WHERE cpf IS NOT NULL;

-- ---- Companies ----
CREATE TABLE capivara.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT UNIQUE NOT NULL,
  razao_social TEXT,
  owner_id UUID NOT NULL REFERENCES capivara.profiles(id),
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

CREATE INDEX idx_capivara_companies_cnpj ON capivara.companies(cnpj);
CREATE INDEX idx_capivara_companies_owner ON capivara.companies(owner_id);

ALTER TABLE capivara.profiles
  ADD CONSTRAINT profiles_active_company_fk
  FOREIGN KEY (active_company_id) REFERENCES capivara.companies(id) ON DELETE SET NULL;

-- ---- Company members ----
CREATE TABLE capivara.company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES capivara.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES capivara.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'operator', 'viewer')),
  cost_center TEXT,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(company_id, user_id)
);

CREATE INDEX idx_capivara_company_members_user ON capivara.company_members(user_id);

-- ---- Consultations ----
CREATE TABLE capivara.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES capivara.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES capivara.companies(id) ON DELETE SET NULL,

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
  cached_from_id UUID REFERENCES capivara.consultations(id),

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

CREATE INDEX idx_capivara_consultations_user ON capivara.consultations(user_id, created_at DESC);
CREATE INDEX idx_capivara_consultations_company ON capivara.consultations(company_id, created_at DESC);
CREATE INDEX idx_capivara_consultations_status ON capivara.consultations(status);
CREATE INDEX idx_capivara_consultations_cache ON capivara.consultations(target_hash, plan_tier, created_at DESC);
CREATE INDEX idx_capivara_consultations_asaas ON capivara.consultations(asaas_payment_id) WHERE asaas_payment_id IS NOT NULL;

-- ---- API cache (24h padrao, configuravel para B2B) ----
CREATE TABLE capivara.api_cache (
  cache_key TEXT PRIMARY KEY,
  api_name TEXT NOT NULL,
  target_hash TEXT NOT NULL,
  result_jsonb JSONB NOT NULL,
  cost_cents INT NOT NULL,
  hits INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_capivara_api_cache_target ON capivara.api_cache(target_hash);
CREATE INDEX idx_capivara_api_cache_expires ON capivara.api_cache(expires_at);

-- ---- Transactions (pagamentos B2C avulso + recargas B2B) ----
CREATE TABLE capivara.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES capivara.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES capivara.companies(id) ON DELETE CASCADE,

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

CREATE INDEX idx_capivara_transactions_user ON capivara.transactions(user_id, created_at DESC);
CREATE INDEX idx_capivara_transactions_company ON capivara.transactions(company_id, created_at DESC);
CREATE INDEX idx_capivara_transactions_asaas ON capivara.transactions(asaas_payment_id);
CREATE INDEX idx_capivara_transactions_status ON capivara.transactions(status);

-- ---- Error logs (substitui Sentry) ----
CREATE TABLE capivara.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  user_id UUID REFERENCES capivara.profiles(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES capivara.consultations(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  stack_trace TEXT,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES capivara.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_capivara_error_logs_severity ON capivara.error_logs(severity, created_at DESC) WHERE resolved = false;
CREATE INDEX idx_capivara_error_logs_context ON capivara.error_logs(context, created_at DESC);

-- ---- Audit logs (LGPD + seguranca) ----
CREATE TABLE capivara.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES capivara.profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_capivara_audit_logs_actor ON capivara.audit_logs(actor_id, created_at DESC);
CREATE INDEX idx_capivara_audit_logs_resource ON capivara.audit_logs(resource_type, resource_id);

-- =========================================================================
-- RLS — habilitar em todas as tabelas com dados de usuario/empresa
-- =========================================================================

ALTER TABLE capivara.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE capivara.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE capivara.company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE capivara.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE capivara.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE capivara.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE capivara.audit_logs ENABLE ROW LEVEL SECURITY;
-- api_cache: acessado apenas via service_role (Edge Functions) — sem RLS necessario

-- ---- Policies basicas (refinaremos em migrations futuras se necessario) ----

CREATE POLICY "users_read_own_profile" ON capivara.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own_profile" ON capivara.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_insert_own_profile" ON capivara.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "members_read_company" ON capivara.companies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = companies.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "members_read_own_company_memberships" ON capivara.company_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users_read_own_consultations" ON capivara.consultations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "company_members_read_consultations" ON capivara.consultations
  FOR SELECT USING (
    company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = consultations.company_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "users_read_own_transactions" ON capivara.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "company_admins_read_transactions" ON capivara.transactions
  FOR SELECT USING (
    company_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = transactions.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- =========================================================================
-- Expor o schema capivara na API REST do Supabase (PostgREST)
-- Sem isso, supabase-js nao consegue acessar tabelas do schema custom.
-- =========================================================================
-- Esta configuracao e feita no Dashboard Supabase:
-- Project Settings > API > Exposed schemas → adicionar 'capivara'
-- Documentado em docs/ARQUITETURA.md secao 4.
