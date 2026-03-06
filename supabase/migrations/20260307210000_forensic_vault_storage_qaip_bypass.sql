-- ============================================================================
-- MIGRATION: Forensic Evidence Vault — Supabase Storage Bucket
-- Sentinel GRC v3.0 | GIAS 2025 Standard 14.3
-- Tarih: 2026-03-07
-- ============================================================================
-- Bu migrasyon:
--   1. evidence-vault Storage bucket'ını tanımlar (SQL erişilebilen metadata)
--   2. digital_evidence tablosuna storage_path / mime_type / file_name sütunları ekler
--   3. Storage anon RLS politikaları (dev ortamı)
-- ============================================================================

-- 1. digital_evidence tablosuna Storage meta sütunları ekle
ALTER TABLE public.digital_evidence
  ADD COLUMN IF NOT EXISTS storage_path TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS file_size BIGINT,
  ADD COLUMN IF NOT EXISTS mime_type TEXT,
  ADD COLUMN IF NOT EXISTS uploaded_by UUID;

-- 2. Storage path için index
CREATE INDEX IF NOT EXISTS idx_digital_evidence_case
  ON public.digital_evidence (case_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_digital_evidence_locked
  ON public.digital_evidence (case_id, locked);

-- 3. Storage bucket politikası: sadece okuma için anon erişim
--    (Yükleme uygulama katmanından yapılır — Supabase Storage API)
--    Not: Bucket oluşturma Supabase Dashboard'dan yapılır:
--    Bucket Name: evidence-vault | Public: false | File size limit: 50MB

-- 4. qaip tablolarına da anon bypass ekle (dev ortamı)
DO $$
BEGIN
  -- qaip_checklists anon select
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_checklists' AND policyname = 'Dev anon read qaip_checklists v2'
  ) THEN
    EXECUTE 'CREATE POLICY "Dev anon read qaip_checklists v2" ON qaip_checklists FOR SELECT TO anon USING (true)';
  END IF;

  -- qaip_reviews anon select
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_reviews' AND policyname = 'Dev anon read qaip_reviews v2'
  ) THEN
    EXECUTE 'CREATE POLICY "Dev anon read qaip_reviews v2" ON qaip_reviews FOR SELECT TO anon USING (true)';
  END IF;

  -- qaip_reviews anon insert
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_reviews' AND policyname = 'Dev anon write qaip_reviews v2'
  ) THEN
    EXECUTE 'CREATE POLICY "Dev anon write qaip_reviews v2" ON qaip_reviews FOR INSERT TO anon WITH CHECK (true)';
  END IF;
END $$;

-- 5. digital_evidence: storage_path sütunu için güvenli var-olma kontrolü
-- (storage_path daha önce yoktu, content_snapshot içindeydi)
-- Yorum: Mevcut kayıtlarda storage_path NULL kalabilir, yeni kayıtlar dolu gelir.

COMMENT ON TABLE public.digital_evidence IS
  'GIAS 2025 Standard 14.3 — Forensic Evidence Vault. '
  'locked=true olan kayıtlar değiştirilemez (Immutable). '
  'hash_sha256 + timestamp_rfc3161 çifti adli delil zincirini doğrular.';
