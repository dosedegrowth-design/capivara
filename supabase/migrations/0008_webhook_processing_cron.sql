-- ============================================================================
-- 0008_webhook_processing_cron.sql
--
-- Cron job pg_cron que chama a Edge Function `process-webhooks` a cada 1 min.
-- A Edge Function pega ate 20 deliveries pendentes da fila webhook_deliveries,
-- assina HMAC e POST pra URL cadastrada, com retry exponencial.
--
-- Requer: extensao pg_net (HTTP client server-side) ja ativa no Supabase.
--
-- Tambem: helper RPC `touch_api_key` pra atualizar last_used_at + total_calls
-- atomicamente (chamado pela API publica /v1/consultations).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ----------------------------------------------------------------------------
-- RPC: touch_api_key (atomico)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION capivara.touch_api_key(p_api_key_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
BEGIN
  UPDATE capivara.api_keys
  SET
    last_used_at = now(),
    total_calls = total_calls + 1
  WHERE id = p_api_key_id;
END;
$$;

GRANT EXECUTE ON FUNCTION capivara.touch_api_key(UUID) TO service_role;

-- ----------------------------------------------------------------------------
-- Cron: dispara process-webhooks a cada 1 minuto
--
-- Usa pg_net.http_post pra chamar a Edge Function. As vars
-- `app.supabase_url` e `app.service_role_key` devem ser configuradas
-- pelo Supabase (geralmente via project secrets).
--
-- Como fallback, lemos current_setting com default vazio e nao agendamos
-- se nao houver config.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_url TEXT := current_setting('app.settings.supabase_url', TRUE);
  v_key TEXT := current_setting('app.settings.service_role_key', TRUE);
BEGIN
  -- Sempre tenta agendar; falha silenciosa se vars nao existem
  IF v_url IS NULL OR v_key IS NULL THEN
    RAISE NOTICE 'process-webhooks cron NAO agendado: vars app.settings.* ausentes. Configure no Dashboard Supabase e re-execute o agendamento manual.';
  ELSE
    PERFORM cron.schedule(
      'capivara-process-webhooks',
      '* * * * *',
      format(
        $cron$
        SELECT net.http_post(
          url := %L,
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', %L
          ),
          body := '{}'::jsonb
        );
        $cron$,
        v_url || '/functions/v1/process-webhooks',
        'Bearer ' || v_key
      )
    );
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- Backfill manual: se o DO acima nao agendou, criar comando comentado abaixo
-- pro DevOps rodar com as vars certas:
--
-- SELECT cron.schedule(
--   'capivara-process-webhooks',
--   '* * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://<project-ref>.supabase.co/functions/v1/process-webhooks',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
-- ----------------------------------------------------------------------------
