-- =========================================================================
-- Capivara · Migration 0005 — Anti-fraude + Cron jobs
--
-- Conteudo:
-- 1. Tabela capivara.fraud_alerts (sinais detectados)
-- 2. Funcao capivara.check_fraud_rules() — chamada pela server action
--    iniciarConsultaAction ANTES de criar consulta. Retorna OK/FLAG/BLOCK.
-- 3. Cron jobs pg_cron:
--    - capivara-cleanup-cache (1x/dia 03:00 UTC) — DELETE api_cache expirado
--    - capivara-anonymize-old (1x/dia 04:00 UTC) — anonimiza consultas > 90d
--    - capivara-recover-stuck (a cada 5min) — recupera jobs travados em
--      processing > 5min, marcando status='paid' pra Edge Function retomar
-- =========================================================================

CREATE TABLE IF NOT EXISTS capivara.fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES capivara.profiles(id) ON DELETE SET NULL,
  consultation_id UUID REFERENCES capivara.consultations(id) ON DELETE SET NULL,
  rule_name TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES capivara.profiles(id),
  action_taken TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user
  ON capivara.fraud_alerts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_unresolved
  ON capivara.fraud_alerts(severity, created_at DESC) WHERE resolved = false;

ALTER TABLE capivara.fraud_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_read_fraud_alerts" ON capivara.fraud_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

CREATE POLICY "admins_update_fraud_alerts" ON capivara.fraud_alerts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Regras anti-fraude
CREATE OR REPLACE FUNCTION capivara.check_fraud_rules(
  p_user_id UUID,
  p_target_normalized TEXT,
  p_ip_address TEXT
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
DECLARE
  v_recent_count INT;
  v_same_target_users INT;
  v_failed_payments INT;
  v_status TEXT := 'OK';
BEGIN
  -- Regra 1: > 20 consultas em 1h pelo mesmo user
  SELECT COUNT(*) INTO v_recent_count
  FROM capivara.consultations
  WHERE user_id = p_user_id
    AND created_at > now() - interval '1 hour';

  IF v_recent_count > 20 THEN
    INSERT INTO capivara.fraud_alerts (user_id, rule_name, severity, description, metadata, ip_address, action_taken)
    VALUES (p_user_id, 'high_velocity', 'medium',
      format('Usuario fez %s consultas na ultima 1h', v_recent_count),
      jsonb_build_object('count', v_recent_count),
      p_ip_address, 'flag');
    v_status := 'FLAG';
  END IF;

  -- Regra 2: mesmo target consultado por 5+ users distintos em 24h (info)
  SELECT COUNT(DISTINCT user_id) INTO v_same_target_users
  FROM capivara.consultations
  WHERE target_normalized = p_target_normalized
    AND created_at > now() - interval '24 hours'
    AND user_id != p_user_id;

  IF v_same_target_users >= 5 THEN
    INSERT INTO capivara.fraud_alerts (user_id, rule_name, severity, description, metadata, ip_address, action_taken)
    VALUES (p_user_id, 'same_target_hot', 'low',
      format('Target consultado por %s usuarios diferentes em 24h', v_same_target_users),
      jsonb_build_object('target_normalized', p_target_normalized, 'distinct_users', v_same_target_users),
      p_ip_address, 'flag');
  END IF;

  -- Regra 3: 3+ pagamentos falhados em 24h
  SELECT COUNT(*) INTO v_failed_payments
  FROM capivara.transactions
  WHERE user_id = p_user_id
    AND status IN ('expired', 'cancelled')
    AND created_at > now() - interval '24 hours';

  IF v_failed_payments >= 3 THEN
    INSERT INTO capivara.fraud_alerts (user_id, rule_name, severity, description, metadata, ip_address, action_taken)
    VALUES (p_user_id, 'payment_failures', 'high',
      format('%s pagamentos falhados em 24h', v_failed_payments),
      jsonb_build_object('count', v_failed_payments),
      p_ip_address, 'block');
    v_status := 'BLOCK';
  END IF;

  -- Regra 4: > 50 consultas/24h (anti-scraping serio)
  SELECT COUNT(*) INTO v_recent_count
  FROM capivara.consultations
  WHERE user_id = p_user_id
    AND created_at > now() - interval '24 hours';

  IF v_recent_count > 50 THEN
    INSERT INTO capivara.fraud_alerts (user_id, rule_name, severity, description, metadata, ip_address, action_taken)
    VALUES (p_user_id, 'extreme_velocity', 'high',
      format('Usuario fez %s consultas em 24h - possivel scraping', v_recent_count),
      jsonb_build_object('count_24h', v_recent_count),
      p_ip_address, 'block');
    v_status := 'BLOCK';
  END IF;

  RETURN v_status;
END;
$$;

GRANT EXECUTE ON FUNCTION capivara.check_fraud_rules(UUID, TEXT, TEXT)
  TO authenticated, service_role;

-- ---- Cron jobs via pg_cron ----
SELECT cron.schedule(
  'capivara-cleanup-cache',
  '0 3 * * *',
  $$DELETE FROM capivara.api_cache WHERE expires_at < now();$$
);

SELECT cron.schedule(
  'capivara-anonymize-old',
  '0 4 * * *',
  $$
  UPDATE capivara.consultations
  SET
    result_jsonb = '{"_anonymized": true}'::jsonb,
    pdf_url = NULL,
    target_value = '[anonimizado]',
    ip_address = NULL,
    user_agent = NULL
  WHERE expires_at < now()
    AND result_jsonb IS NOT NULL
    AND result_jsonb->>'_anonymized' IS NULL;
  $$
);

SELECT cron.schedule(
  'capivara-recover-stuck',
  '*/5 * * * *',
  $$
  UPDATE capivara.consultations
  SET status = 'paid'
  WHERE status = 'processing'
    AND processing_started_at < now() - interval '5 minutes';
  $$
);
