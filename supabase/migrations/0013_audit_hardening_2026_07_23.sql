-- ============================================================================
-- 0013_audit_hardening_2026_07_23.sql
--
-- Fixes derivados da auditoria de 2026-07-23 (docs/AUDITORIA_2026-07-23.md).
--
-- Conteudo:
--  1. Fix privilege escalation via signup (trigger handle_new_user)
--  2. api_cache: ENABLE RLS + REVOKE privileges (era exposta a authenticated)
--  3. REVOKE default privileges do schema (grant tabela-a-tabela dai em diante)
--  4. asaas_webhook_events — dedup por event_id (idempotencia)
--  5. company_invites — fluxo de convite com token e expiracao
--  6. Storage buckets capivara-relatorios-pdf + capivara-comprovantes (RLS)
--  7. consultations.retry_count — circuit breaker do recover-stuck
--  8. Rewrite cron recover-stuck com retry counter + dead letter
--  9. transactions.payment_method — aceitar 'folhas' e 'balance_cents' (B2B)
-- 10. increment_endpoint_stats — RPC atomica pra webhook_endpoints (fix race)
-- 11. Policies admin: SELECT em consultations e transactions (pra painel)
-- ============================================================================

-- ============================================================================
-- 1. FIX privilege escalation: handle_new_user forcava account_type='pf'
--    (nao aceita mais valor do raw_user_meta_data). Promocao pra admin ou
--    pj_admin agora requer server action com service_role.
-- ============================================================================

CREATE OR REPLACE FUNCTION capivara.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
BEGIN
  INSERT INTO capivara.profiles (id, email, full_name, cpf, phone, account_type, lgpd_accepted_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'phone',
    'pf', -- FORCA pf. Promocao via server action + service_role.
    CASE
      WHEN (NEW.raw_user_meta_data->>'lgpd_accepted')::boolean THEN now()
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. api_cache: RLS + REVOKE (era exposta a authenticated via default privileges)
-- ============================================================================

REVOKE ALL ON capivara.api_cache FROM authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON capivara.api_cache TO service_role;
ALTER TABLE capivara.api_cache ENABLE ROW LEVEL SECURITY;
-- Sem policy: authenticated/anon nao acessam. service_role bypassa RLS.

-- ============================================================================
-- 3. REVOKE default privileges — grant tabela-a-tabela nas migrations futuras
-- ============================================================================

ALTER DEFAULT PRIVILEGES IN SCHEMA capivara
  REVOKE ALL ON TABLES FROM authenticated, anon;
-- service_role mantido (bypassa RLS por design).

-- ============================================================================
-- 4. asaas_webhook_events — dedup por event_id
-- ============================================================================

CREATE TABLE IF NOT EXISTS capivara.asaas_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  payment_id TEXT,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_payload JSONB
);

CREATE INDEX IF NOT EXISTS idx_asaas_events_payment
  ON capivara.asaas_webhook_events(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_asaas_events_processed
  ON capivara.asaas_webhook_events(processed_at DESC);

GRANT SELECT, INSERT ON capivara.asaas_webhook_events TO service_role;
ALTER TABLE capivara.asaas_webhook_events ENABLE ROW LEVEL SECURITY;
-- Sem policy: apenas service_role acessa.

COMMENT ON TABLE capivara.asaas_webhook_events IS
  'Dedup de webhooks Asaas por event.id. INSERT ... ON CONFLICT DO NOTHING antes de processar.';

-- ============================================================================
-- 5. company_invites — fluxo de convite com token opaco e expiracao
-- ============================================================================

CREATE TABLE IF NOT EXISTS capivara.company_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES capivara.companies(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin','operator','viewer')),
  cost_center TEXT,
  -- Token opaco (32+ chars random). Enviado por email.
  token TEXT UNIQUE NOT NULL,
  invited_by UUID NOT NULL REFERENCES capivara.profiles(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by UUID REFERENCES capivara.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_invites_email
  ON capivara.company_invites(lower(email)) WHERE accepted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_company_invites_company
  ON capivara.company_invites(company_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE ON capivara.company_invites TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON capivara.company_invites TO service_role;

ALTER TABLE capivara.company_invites ENABLE ROW LEVEL SECURITY;

-- Admin da empresa ve convites pendentes/aceitos da sua company
CREATE POLICY "company_admins_read_invites" ON capivara.company_invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = company_invites.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Admin insere/atualiza convites da sua company
CREATE POLICY "company_admins_write_invites" ON capivara.company_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = company_invites.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "company_admins_update_invites" ON capivara.company_invites
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM capivara.company_members
      WHERE company_id = company_invites.company_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- Aceite via server action com service_role: nao expomos SELECT por token
-- direto no client (query com token e' feita server-side com service_role).

COMMENT ON TABLE capivara.company_invites IS
  'Convites de equipe. Token opaco, expira em 7 dias. Aceite via server action.';

-- ============================================================================
-- 6. Storage buckets pra PDFs e comprovantes (PRIVADOS)
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('capivara-relatorios-pdf', 'capivara-relatorios-pdf', false),
  ('capivara-comprovantes', 'capivara-comprovantes', false)
ON CONFLICT (id) DO NOTHING;

-- Users leem PDFs de sua propria pasta (subpasta = user_id)
DROP POLICY IF EXISTS "users_read_own_pdfs" ON storage.objects;
CREATE POLICY "users_read_own_pdfs" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'capivara-relatorios-pdf'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "users_read_own_comprovantes" ON storage.objects;
CREATE POLICY "users_read_own_comprovantes" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'capivara-comprovantes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- service_role escreve/deleta (bypassa RLS por default).

-- ============================================================================
-- 7. consultations.retry_count — circuit breaker do recover-stuck
-- ============================================================================

ALTER TABLE capivara.consultations
  ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0;

-- ============================================================================
-- 8. Rewrite cron recover-stuck com retry counter + dead letter
--    Depois de 5 tentativas o job vira 'error' pra investigacao manual.
-- ============================================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'capivara-recover-stuck') THEN
    PERFORM cron.unschedule('capivara-recover-stuck');
  END IF;
END $$;

SELECT cron.schedule(
  'capivara-recover-stuck',
  '*/5 * * * *',
  $$
  UPDATE capivara.consultations
  SET
    status = CASE WHEN retry_count >= 5 THEN 'error' ELSE 'paid' END,
    retry_count = retry_count + 1,
    processing_started_at = NULL
  WHERE status = 'processing'
    AND processing_started_at < now() - interval '5 minutes';
  $$
);

-- ============================================================================
-- 9. transactions.payment_method aceita 'folhas' e 'balance_cents' (B2B)
--    Antes: CHECK falhava em INSERT com type='consultation' + saldo B2B.
-- ============================================================================

ALTER TABLE capivara.transactions
  DROP CONSTRAINT IF EXISTS transactions_payment_method_check;
ALTER TABLE capivara.transactions
  ADD CONSTRAINT transactions_payment_method_check
  CHECK (payment_method IN ('pix', 'boleto', 'cartao_avista', 'folhas', 'balance_cents'));

-- ============================================================================
-- 10. increment_endpoint_stats — RPC atomica (fix race em webhooks/index.ts)
-- ============================================================================

CREATE OR REPLACE FUNCTION capivara.increment_endpoint_stats(
  p_endpoint_id UUID,
  p_delta_ok INT,
  p_delta_fail INT,
  p_last_status_code INT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
BEGIN
  UPDATE capivara.webhook_endpoints
  SET
    total_deliveries = COALESCE(total_deliveries, 0) + p_delta_ok + p_delta_fail,
    total_failures = COALESCE(total_failures, 0) + p_delta_fail,
    last_delivery_at = now(),
    last_status_code = COALESCE(p_last_status_code, last_status_code),
    updated_at = now()
  WHERE id = p_endpoint_id;
END;
$$;

GRANT EXECUTE ON FUNCTION capivara.increment_endpoint_stats(UUID, INT, INT, INT)
  TO service_role, authenticated;

COMMENT ON FUNCTION capivara.increment_endpoint_stats IS
  'Atomicamente incrementa contadores de webhook_endpoints. Usar em vez de read-modify-write.';

-- ============================================================================
-- 11. Policies admin: SELECT em consultations e transactions
--     (0001 so tinha policies pra user/company; admin nao consegue listar
--      pelo painel /admin. Adicionamos aqui.)
-- ============================================================================

DROP POLICY IF EXISTS "admins_read_consultations" ON capivara.consultations;
CREATE POLICY "admins_read_consultations" ON capivara.consultations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

DROP POLICY IF EXISTS "admins_read_transactions" ON capivara.transactions;
CREATE POLICY "admins_read_transactions" ON capivara.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- ============================================================================
-- Fim da migration 0013
-- ============================================================================
