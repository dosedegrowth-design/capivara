-- =========================================================================
-- Capivara · Migration 0003 — Expor schema na API REST do Supabase
--
-- Sem isso, supabase-js retorna 404 quando configurado com
-- { db: { schema: 'capivara' } }.
--
-- A configuracao ja existente preserva os schemas de outros sistemas DDG
-- (crm_onboarding, trafego_ddg, ddg_engine, disparador).
-- =========================================================================

ALTER ROLE authenticator
  SET pgrst.db_schemas = 'public,graphql_public,crm_onboarding,trafego_ddg,ddg_engine,disparador,capivara';

ALTER ROLE authenticator
  SET pgrst.db_extra_search_path = 'public,capivara';

-- Recarrega config do PostgREST sem precisar restart do projeto
NOTIFY pgrst, 'reload config';
