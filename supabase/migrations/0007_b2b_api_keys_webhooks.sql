-- ============================================================================
-- 0007_b2b_api_keys_webhooks.sql
--
-- Infraestrutura B2B: API keys + Webhooks com retry e logs.
--
-- - api_keys: chaves de acesso a API publica /v1/consultations
-- - webhook_endpoints: URLs cadastradas pra notificacao de eventos
-- - webhook_deliveries: log de tentativas e retries
-- - consultations.api_key_id + external_reference: rastreio de origem B2B
-- ============================================================================

-- ----------------------------------------------------------------------------
-- API Keys
-- ----------------------------------------------------------------------------
CREATE TABLE capivara.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES capivara.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES capivara.profiles(id) ON DELETE SET NULL,

  name TEXT NOT NULL,
  -- Hash SHA-256 da chave completa. Nunca guardamos a chave em texto puro.
  key_hash TEXT NOT NULL UNIQUE,
  -- Prefixo publico mostrado na UI (ex: cap_live_a1b2c3).
  key_prefix TEXT NOT NULL,

  scopes TEXT[] NOT NULL DEFAULT ARRAY['consultations:write','consultations:read'],
  rate_limit_per_min INT DEFAULT 60,

  last_used_at TIMESTAMPTZ,
  total_calls INT NOT NULL DEFAULT 0,

  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES capivara.profiles(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_capivara_api_keys_company ON capivara.api_keys(company_id);
CREATE INDEX idx_capivara_api_keys_hash ON capivara.api_keys(key_hash) WHERE revoked_at IS NULL;

COMMENT ON TABLE capivara.api_keys IS 'Chaves de API B2B. Hash SHA-256 da chave completa.';

-- ----------------------------------------------------------------------------
-- Consultations: ligacao com API key e referencia externa
-- ----------------------------------------------------------------------------
ALTER TABLE capivara.consultations
  ADD COLUMN IF NOT EXISTS api_key_id UUID REFERENCES capivara.api_keys(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS external_reference TEXT,
  ADD COLUMN IF NOT EXISTS callback_url TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web','api'));

CREATE INDEX IF NOT EXISTS idx_capivara_consultations_api_key
  ON capivara.consultations(api_key_id, created_at DESC) WHERE api_key_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_capivara_consultations_external_ref
  ON capivara.consultations(company_id, external_reference)
  WHERE external_reference IS NOT NULL;

-- ----------------------------------------------------------------------------
-- Webhook endpoints
-- ----------------------------------------------------------------------------
CREATE TABLE capivara.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES capivara.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES capivara.profiles(id) ON DELETE SET NULL,

  url TEXT NOT NULL,
  description TEXT,
  -- Secret usado pra assinar HMAC-SHA256 do payload.
  secret TEXT NOT NULL,

  events TEXT[] NOT NULL DEFAULT ARRAY[
    'consultation.completed',
    'consultation.failed',
    'payment.confirmed'
  ],

  active BOOLEAN NOT NULL DEFAULT TRUE,
  total_deliveries INT NOT NULL DEFAULT 0,
  total_failures INT NOT NULL DEFAULT 0,
  last_delivery_at TIMESTAMPTZ,
  last_status_code INT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_capivara_webhook_endpoints_company ON capivara.webhook_endpoints(company_id);

-- ----------------------------------------------------------------------------
-- Webhook deliveries (log + retry queue)
-- ----------------------------------------------------------------------------
CREATE TABLE capivara.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES capivara.webhook_endpoints(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES capivara.companies(id) ON DELETE CASCADE,

  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,
  payload JSONB NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivered','failed','exhausted')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 6,

  last_status_code INT,
  last_response TEXT,
  last_error TEXT,

  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_capivara_webhook_deliveries_pending
  ON capivara.webhook_deliveries(next_attempt_at)
  WHERE status = 'pending';

CREATE INDEX idx_capivara_webhook_deliveries_endpoint
  ON capivara.webhook_deliveries(endpoint_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- RLS: api_keys, webhook_endpoints, webhook_deliveries
-- ----------------------------------------------------------------------------
ALTER TABLE capivara.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE capivara.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE capivara.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- API keys: admin da empresa pode CRUD
CREATE POLICY "company_admins_read_api_keys" ON capivara.api_keys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = api_keys.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "company_admins_write_api_keys" ON capivara.api_keys
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = api_keys.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "company_admins_update_api_keys" ON capivara.api_keys
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = api_keys.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Webhook endpoints: mesmo pattern
CREATE POLICY "company_admins_read_webhook_endpoints" ON capivara.webhook_endpoints
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = webhook_endpoints.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "company_admins_write_webhook_endpoints" ON capivara.webhook_endpoints
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = webhook_endpoints.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "company_admins_update_webhook_endpoints" ON capivara.webhook_endpoints
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = webhook_endpoints.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "company_admins_delete_webhook_endpoints" ON capivara.webhook_endpoints
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = webhook_endpoints.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Webhook deliveries: read-only pra admins (logs)
CREATE POLICY "company_admins_read_webhook_deliveries" ON capivara.webhook_deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = webhook_deliveries.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- ----------------------------------------------------------------------------
-- Trigger pra updated_at em webhook_endpoints
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION capivara.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_webhook_endpoints_updated_at
  BEFORE UPDATE ON capivara.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION capivara.touch_updated_at();
