-- ============================================================================
-- 0014_categoria_cep.sql
--
-- Habilita a categoria 'cep' em consultations — nicho de inteligencia de local
-- (geomarketing): Raio-X do CEP e Estudo de Ponto Comercial.
--
-- O alvo da consulta deixa de ser so documento/placa e passa a aceitar CEP.
-- Nao destrutivo: apenas amplia o CHECK existente (cpf|cnpj|veicular).
-- ============================================================================

ALTER TABLE capivara.consultations
  DROP CONSTRAINT IF EXISTS consultations_category_check;

ALTER TABLE capivara.consultations
  ADD CONSTRAINT consultations_category_check
  CHECK (category IN ('cpf', 'cnpj', 'veicular', 'cep'));

COMMENT ON COLUMN capivara.consultations.category IS
  'Tipo do alvo: cpf | cnpj | veicular (inclui leilao) | cep (geomarketing).';
