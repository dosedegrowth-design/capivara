-- =========================================================================
-- Capivara · Migration 0004 — Trigger handle_new_user + updated_at
--
-- Quando um novo registro entra em auth.users (signup), cria automaticamente
-- a linha correspondente em capivara.profiles puxando dados do user_metadata.
--
-- Tambem adiciona triggers para atualizar `updated_at` em profiles e companies.
-- =========================================================================

CREATE OR REPLACE FUNCTION capivara.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = capivara, public
AS $$
BEGIN
  INSERT INTO capivara.profiles (id, email, full_name, cpf, phone, account_type, lgpd_accepted_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'pf'),
    CASE
      WHEN (NEW.raw_user_meta_data->>'lgpd_accepted')::boolean THEN now()
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION capivara.handle_new_user();

-- updated_at automatico
CREATE OR REPLACE FUNCTION capivara.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON capivara.profiles
  FOR EACH ROW EXECUTE FUNCTION capivara.set_updated_at();

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON capivara.companies
  FOR EACH ROW EXECUTE FUNCTION capivara.set_updated_at();
