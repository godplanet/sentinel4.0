-- ============================================================================
-- MIGRATION: Evidence Vault — Supabase Storage Bucket (Zero-Trust)
-- Sentinel GRC v3.0 | GIAS 2025 Standard 14.3
-- Tarih: 2026-03-08
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence-vault',
  'evidence-vault',
  false, -- Public erişime kapalı (Sıfır Güven / Zero-Trust)
  52428800, -- 50MB
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public          = false,
  file_size_limit = 52428800;

-- Storage RLS politikaları (dev: anon bypass)
CREATE POLICY "evidence_vault anon upload"
  ON storage.objects FOR INSERT TO anon
  WITH CHECK (bucket_id = 'evidence-vault');

CREATE POLICY "evidence_vault anon read"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'evidence-vault');

-- Authenticated kullanıcılar (prod için)
CREATE POLICY "evidence_vault auth upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'evidence-vault');

CREATE POLICY "evidence_vault auth read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'evidence-vault');

-- Note: storage.buckets is owned by Supabase system role; COMMENT is skipped.
