-- ============================================================================
-- 0011_consent_logs.sql
--
-- Registro de aceite de documentos legais. Pra respaldo juridico em caso de
-- disputa, ANPD ou questao judicial.
--
-- Princípios:
-- 1. NUNCA alterar um aceite ja registrado (append-only)
-- 2. Guardar o TEXTO COMPLETO do que foi aceito (nao so referencia ao
--    documento atual — se o doc mudar depois, o aceite antigo ainda tem
--    a versao que o usuario realmente leu)
-- 3. Hash SHA-256 do texto pra garantir integridade
-- 4. IP + User-Agent pra rastreio forense
-- 5. Metadata flexivel pra contexto (consultation_id, finalidade, etc)
-- ============================================================================

CREATE TABLE capivara.consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES capivara.profiles(id) ON DELETE CASCADE,
  company_id UUID REFERENCES capivara.companies(id) ON DELETE SET NULL,

  -- Tipo do documento aceito. Lista controlada (CHECK abaixo).
  document_type TEXT NOT NULL CHECK (document_type IN (
    'terms_of_use',              -- Termos de Uso (cadastro)
    'privacy_policy',            -- Politica de Privacidade (cadastro)
    'cookie_policy',             -- Politica de Cookies (banner)
    'consultation_responsibility', -- Termo de Responsabilidade por Consulta (pre-consulta B2C/B2B)
    'company_terms',             -- Contrato B2B (onboarding empresa)
    'api_terms'                  -- Termos da API (geracao de key)
  )),

  -- Versao do documento (semver-like: "1.0.0", "1.1.0")
  document_version TEXT NOT NULL,

  -- Hash SHA-256 do conteudo HTML/markdown que foi mostrado pro usuario.
  -- Pra provar judicialmente que o texto nao foi adulterado depois.
  document_hash TEXT NOT NULL,

  -- TEXTO COMPLETO aceito (snapshot imutavel). Pesa mais no banco mas
  -- e o que da seguranca juridica real.
  document_text TEXT NOT NULL,

  -- Quando aceitou
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Forensics
  ip_address TEXT,
  user_agent TEXT,

  -- Contexto adicional: pra aceite de consulta especifica, guarda
  -- { consultation_id, target_hash, plan_id, finality }
  metadata JSONB DEFAULT '{}',

  -- Indice composto pra query rapida "qual o ultimo aceite de tipo X pelo user Y"
  CONSTRAINT consent_logs_text_not_empty CHECK (length(document_text) > 100)
);

CREATE INDEX idx_consent_logs_user_type
  ON capivara.consent_logs(user_id, document_type, accepted_at DESC);

CREATE INDEX idx_consent_logs_company
  ON capivara.consent_logs(company_id, accepted_at DESC)
  WHERE company_id IS NOT NULL;

CREATE INDEX idx_consent_logs_consultation
  ON capivara.consent_logs((metadata->>'consultation_id'))
  WHERE metadata->>'consultation_id' IS NOT NULL;

COMMENT ON TABLE capivara.consent_logs IS
  'Registro append-only de aceite de documentos legais. Pra respaldo judicial.';

-- ----------------------------------------------------------------------------
-- RLS: usuario ve so o proprio. Admins veem tudo (audit).
-- ----------------------------------------------------------------------------
ALTER TABLE capivara.consent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_consents" ON capivara.consent_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "admins_read_all_consents" ON capivara.consent_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- Nunca permitir UPDATE ou DELETE (append-only)
CREATE POLICY "no_update_consents" ON capivara.consent_logs
  FOR UPDATE USING (false);

CREATE POLICY "no_delete_consents" ON capivara.consent_logs
  FOR DELETE USING (false);

-- ----------------------------------------------------------------------------
-- View helper: ultimo aceite de cada tipo por usuario
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW capivara.v_latest_consents AS
SELECT DISTINCT ON (user_id, document_type)
  user_id,
  document_type,
  document_version,
  document_hash,
  accepted_at,
  ip_address
FROM capivara.consent_logs
ORDER BY user_id, document_type, accepted_at DESC;

COMMENT ON VIEW capivara.v_latest_consents IS
  'Ultimo aceite de cada tipo por usuario. Pra check rapido "aceitou versao atual?".';

-- ----------------------------------------------------------------------------
-- RPC pra registrar aceite (service-role only — proxy via server action)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION capivara.log_consent(
  p_user_id UUID,
  p_company_id UUID,
  p_document_type TEXT,
  p_document_version TEXT,
  p_document_hash TEXT,
  p_document_text TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO capivara.consent_logs (
    user_id, company_id, document_type, document_version, document_hash,
    document_text, accepted_at, ip_address, user_agent, metadata
  ) VALUES (
    p_user_id, p_company_id, p_document_type, p_document_version, p_document_hash,
    p_document_text, now(), p_ip_address, p_user_agent, p_metadata
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION capivara.log_consent(
  UUID, UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB
) TO service_role;
