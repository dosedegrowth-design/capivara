-- ============================================================================
-- 0012_balance_cents_migration.sql
--
-- Migra o modelo B2B de "creditos/folhas" pra saldo em R$ (centavos).
--
-- ANTES: empresa tinha folhas_balance (INT, creditos). Cada plano tinha
--        custoFolhasB2B (N creditos). Pacote Manada dava X creditos.
--        Confuso: cliente nao sabia quanto R$ valia cada credito.
--
-- DEPOIS: empresa tem balance_cents (INT, centavos de R$). Cada plano tem
--         precoB2B_centavos. Pacote Manada credita R$ + bonus % no saldo.
--         Direto e claro: "tenho R$ X de saldo, consulta custa R$ Y".
--
-- Estratégia:
--  1. Adiciona companies.balance_cents (INT, default 0, >=0)
--  2. Backfill: balance_cents = folhas_balance * 100 (1 folha = R$ 1, dados teste)
--  3. Cria RPC add_balance_cents (substitui add_credits)
--  4. Mantem folhas_balance/folhas_used/folhas_added como legacy (nao usar)
-- ============================================================================

-- 1. Coluna nova em companies
ALTER TABLE capivara.companies
  ADD COLUMN IF NOT EXISTS balance_cents INT NOT NULL DEFAULT 0
    CHECK (balance_cents >= 0);

-- 2. Backfill dos dados de teste: 1 folha = R$ 1,00 (100 centavos)
UPDATE capivara.companies
SET balance_cents = COALESCE(folhas_balance, 0) * 100
WHERE balance_cents = 0
  AND folhas_balance IS NOT NULL
  AND folhas_balance > 0;

-- 3. RPC atomico pra somar saldo (centavos) na empresa
CREATE OR REPLACE FUNCTION capivara.add_balance_cents(
  p_company_id UUID,
  p_amount_cents INT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
BEGIN
  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'p_amount_cents deve ser positivo, recebido %', p_amount_cents;
  END IF;

  UPDATE capivara.companies
  SET
    balance_cents = balance_cents + p_amount_cents,
    updated_at = now()
  WHERE id = p_company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empresa % nao encontrada', p_company_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION capivara.add_balance_cents(UUID, INT) TO service_role;

COMMENT ON FUNCTION capivara.add_balance_cents IS
  'Soma centavos ao saldo (balance_cents) de uma empresa. Atomic. Chamado pelo webhook Asaas em recargas confirmadas.';

-- 4. RPC pra DEBITAR saldo com check atomico (evita race condition)
--    Retorna true se debitou; false se nao tinha saldo suficiente.
CREATE OR REPLACE FUNCTION capivara.debit_balance_cents(
  p_company_id UUID,
  p_amount_cents INT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
DECLARE
  v_current INT;
BEGIN
  IF p_amount_cents <= 0 THEN
    RAISE EXCEPTION 'p_amount_cents deve ser positivo, recebido %', p_amount_cents;
  END IF;

  -- Lock atomico na linha pra evitar race condition entre consultas paralelas
  SELECT balance_cents INTO v_current
  FROM capivara.companies
  WHERE id = p_company_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empresa % nao encontrada', p_company_id;
  END IF;

  IF v_current < p_amount_cents THEN
    RETURN FALSE;
  END IF;

  UPDATE capivara.companies
  SET
    balance_cents = balance_cents - p_amount_cents,
    updated_at = now()
  WHERE id = p_company_id;

  RETURN TRUE;
END;
$$;

GRANT EXECUTE ON FUNCTION capivara.debit_balance_cents(UUID, INT) TO service_role;

COMMENT ON FUNCTION capivara.debit_balance_cents IS
  'Debita centavos do saldo (balance_cents) de uma empresa. Atomic com lock. Retorna FALSE se saldo insuficiente.';

-- 5. Marca colunas legacy (mantem por enquanto pra compat, mas sem CHECK ativo)
COMMENT ON COLUMN capivara.companies.folhas_balance IS
  'DEPRECATED 2026-05-23: substituido por balance_cents (saldo em R$ centavos). Manter por compat ate cleanup.';

COMMENT ON COLUMN capivara.consultations.folhas_used IS
  'DEPRECATED 2026-05-23: substituido por amount_cents (preco B2B em R$ centavos debitado da empresa).';

COMMENT ON COLUMN capivara.transactions.folhas_added IS
  'DEPRECATED 2026-05-23: substituido por amount_cents. Recarga credita saldoTotal_centavos do pacote em balance_cents.';
