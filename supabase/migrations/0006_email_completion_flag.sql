-- ============================================================================
-- 0006_email_completion_flag.sql
--
-- Marca quando o email de "consulta pronta" foi enviado, pra evitar reenvio
-- se /api/pdf/render for chamado novamente (regeracao manual de PDF).
-- ============================================================================

ALTER TABLE capivara.consultations
  ADD COLUMN IF NOT EXISTS email_completion_sent_at TIMESTAMPTZ;

COMMENT ON COLUMN capivara.consultations.email_completion_sent_at IS
  'Timestamp do envio do email de "consulta pronta" (idempotencia).';
