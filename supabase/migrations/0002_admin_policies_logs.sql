-- =========================================================================
-- Capivara · Migration 0002 — Politicas de admin para tabelas de log
--
-- audit_logs e error_logs sao normalmente populados via service_role
-- (Edge Functions / Route Handlers privilegiados). Esta migration adiciona
-- policy explicita para que usuarios com account_type='admin' possam ler
-- via UI do painel /admin.
--
-- Tambem remove o warning "RLS enabled but no policy" do Supabase advisor.
-- =========================================================================

CREATE POLICY "admins_read_error_logs" ON capivara.error_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

CREATE POLICY "admins_update_error_logs" ON capivara.error_logs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

CREATE POLICY "admins_read_audit_logs" ON capivara.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM capivara.profiles
      WHERE id = auth.uid() AND account_type = 'admin'
    )
  );

-- audit_logs e append-only: nao expor UPDATE/DELETE policies.
-- INSERT em audit_logs e feito apenas via service_role.
