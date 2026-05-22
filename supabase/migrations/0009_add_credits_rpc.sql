-- ============================================================================
-- 0009_add_credits_rpc.sql
--
-- RPC atomico pra somar creditos (folhas) ao saldo de uma empresa.
-- Chamado pelo webhook Asaas quando uma recarga e confirmada.
-- ============================================================================

CREATE OR REPLACE FUNCTION capivara.add_credits(
  p_company_id UUID,
  p_credits INT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
BEGIN
  IF p_credits <= 0 THEN
    RAISE EXCEPTION 'p_credits deve ser positivo, recebido %', p_credits;
  END IF;

  UPDATE capivara.companies
  SET
    folhas_balance = folhas_balance + p_credits,
    updated_at = now()
  WHERE id = p_company_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Empresa % nao encontrada', p_company_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION capivara.add_credits(UUID, INT) TO service_role;

COMMENT ON FUNCTION capivara.add_credits IS
  'Soma creditos (folhas) ao saldo de uma empresa. Atomic. Chamado pelo webhook Asaas.';
