-- =========================================================================
-- Capivara · Migration 0016 — UF escolhida pelo cliente
--
-- Certidao de debitos estaduais exige o estado. O cliente escolhe no
-- formulario (ou manda `uf` na API) e a Edge repassa pra APIFULL.
-- Aditiva: coluna nova e nula; nenhum dado existente muda.
-- =========================================================================
ALTER TABLE capivara.consultations
  ADD COLUMN IF NOT EXISTS target_uf TEXT
  CHECK (target_uf IS NULL OR target_uf ~ '^[A-Z]{2}$');

COMMENT ON COLUMN capivara.consultations.target_uf IS
  'UF escolhida pelo cliente (certidao estadual). NULL quando o produto nao pede estado.';
