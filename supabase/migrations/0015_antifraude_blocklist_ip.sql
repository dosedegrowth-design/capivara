-- =========================================================================
-- Capivara · Migration 0015 — Anti-fraude: blocklist + velocidade por IP
--
-- Por que: todas as regras de 0005 contam por user_id. Quem e bloqueado cria
-- outra conta e zera o contador. Estas duas pecas fecham o buraco:
--   1. blocklist  — decisao manual do admin, por documento, usuario ou IP
--   2. por IP     — quantos documentos DIFERENTES sairam do mesmo IP em 1h
--
-- Nada aqui remove ou altera dado existente.
-- =========================================================================

-- ---- 1. Blocklist ----
CREATE TABLE IF NOT EXISTS capivara.blocklist (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'documento' (CPF/CNPJ/placa normalizado), 'user' (uuid) ou 'ip'
  tipo         TEXT NOT NULL CHECK (tipo IN ('documento', 'user', 'ip')),
  valor        TEXT NOT NULL,
  motivo       TEXT,
  criado_por   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- NULL = permanente
  expires_at   TIMESTAMPTZ,
  UNIQUE (tipo, valor)
);

-- Sem WHERE com now(): predicado de indice tem que ser IMMUTABLE. A tabela e
-- pequena e o filtro de expiracao sai no proprio SELECT.
CREATE INDEX IF NOT EXISTS idx_blocklist_lookup
  ON capivara.blocklist (tipo, valor);

ALTER TABLE capivara.blocklist ENABLE ROW LEVEL SECURITY;

-- So admin le/escreve. O caminho da consulta usa service_role (SECURITY
-- DEFINER na funcao abaixo), entao o cliente nunca enxerga a lista — saber
-- que esta bloqueado ja e' meio caminho pra contornar.
DROP POLICY IF EXISTS "admins_manage_blocklist" ON capivara.blocklist;
CREATE POLICY "admins_manage_blocklist" ON capivara.blocklist
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles p
      WHERE p.id = auth.uid() AND p.account_type = 'admin'
    )
  );

-- ---- 2. Consulta de sinais (uma ida ao banco em vez de tres) ----
--
-- Devolve o que o TypeScript precisa pra decidir:
--   bloqueio_*        — se documento, user ou IP estao na blocklist
--   alvos_distintos_ip — quantos documentos DIFERENTES esse IP consultou em 1h
--
-- p_ip nulo (chamada sem header de IP) nao zera nada: so pula a parte de IP.
CREATE OR REPLACE FUNCTION capivara.fraude_sinais(
  p_user_id UUID,
  p_target_normalized TEXT,
  p_ip TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
DECLARE
  v_bloqueio        RECORD;
  v_alvos_ip        INT := 0;
BEGIN
  SELECT tipo, motivo INTO v_bloqueio
  FROM capivara.blocklist
  WHERE (expires_at IS NULL OR expires_at > now())
    AND (
      (tipo = 'documento' AND valor = p_target_normalized)
      OR (tipo = 'user' AND valor = p_user_id::text)
      OR (p_ip IS NOT NULL AND tipo = 'ip' AND valor = p_ip)
    )
  -- Bloqueio de documento vem antes: e' o mais especifico.
  ORDER BY CASE tipo WHEN 'documento' THEN 0 WHEN 'user' THEN 1 ELSE 2 END
  LIMIT 1;

  IF p_ip IS NOT NULL THEN
    SELECT COUNT(DISTINCT target_normalized) INTO v_alvos_ip
    FROM capivara.consultations
    WHERE ip_address = p_ip
      AND created_at > now() - interval '1 hour';
  END IF;

  RETURN jsonb_build_object(
    'bloqueado', v_bloqueio.tipo IS NOT NULL,
    'bloqueio_tipo', v_bloqueio.tipo,
    'bloqueio_motivo', v_bloqueio.motivo,
    'alvos_distintos_ip', v_alvos_ip
  );
END;
$$;

GRANT EXECUTE ON FUNCTION capivara.fraude_sinais(UUID, TEXT, TEXT)
  TO service_role;

-- ---- 3. Indice pro COUNT por IP nao virar seq scan ----
CREATE INDEX IF NOT EXISTS idx_consultations_ip_recente
  ON capivara.consultations (ip_address, created_at DESC)
  WHERE ip_address IS NOT NULL;

COMMENT ON TABLE capivara.blocklist IS
  'Bloqueio manual por documento, usuario ou IP. Consultada em capivara.fraude_sinais().';
