-- ============================================================================
-- 0010_lgpd_exports_bucket.sql
--
-- Bucket pra exports de dados solicitados via LGPD Art. 18 V.
-- Signed URL com validade de 24h.
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('capivara-lgpd-exports', 'capivara-lgpd-exports', false)
ON CONFLICT (id) DO NOTHING;

-- RLS: usuario so pode ler seus proprios arquivos (subpasta = user_id)
CREATE POLICY "users_read_own_lgpd_exports" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'capivara-lgpd-exports'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
