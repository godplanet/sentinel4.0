-- ============================================================================
-- MIGRATION: Iron Gate — Bağımsızlık Beyanı + Strateji-ltree Bağlantısı
-- Sentinel GRC v3.0 | GIAS 2025 Standard II ve IV
-- Tarih: 2026-03-07
-- ============================================================================
-- Amaç:
--   1. auditor_declarations tablosunu engagement_id foreign key ile zenginleştir
--   2. strategic_goals tablosuna ltree_path sütunu ekle (Evren bağlantısı)
--   3. Iron Gate: engagement_declarations view ile beyan durumu sorgulama
--   4. RLS Dev bypass (tüm RLS zaten devre dışı: 20260310000001 migrasyonu)
-- ============================================================================

-- 1. auditor_declarations'a engagement_id sütunu ekle (Iron Gate için)
ALTER TABLE public.auditor_declarations
  ADD COLUMN IF NOT EXISTS engagement_id UUID,
  ADD COLUMN IF NOT EXISTS entity_id UUID,
  ADD COLUMN IF NOT EXISTS has_conflict BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS conflict_description TEXT,
  ADD COLUMN IF NOT EXISTS declaration_text TEXT;

-- 2. Hızlı sorgu için index
CREATE INDEX IF NOT EXISTS idx_declarations_engagement
  ON public.auditor_declarations (user_id, engagement_id)
  WHERE engagement_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_declarations_user_type
  ON public.auditor_declarations (user_id, declaration_type, period_year);

-- 3. strategic_goals tablosuna universe node bağlantısı ekle
--    (strategic_bank_goals olarak da adlandırılıyor)
ALTER TABLE public.strategic_bank_goals
  ADD COLUMN IF NOT EXISTS linked_universe_path TEXT,
  ADD COLUMN IF NOT EXISTS universe_node_id UUID,
  ADD COLUMN IF NOT EXISTS risk_appetite TEXT DEFAULT 'Medium'
    CHECK (risk_appetite IN ('Low', 'Medium', 'High'));

-- 4. strategic_audit_objectives'e universe link
ALTER TABLE public.strategic_audit_objectives
  ADD COLUMN IF NOT EXISTS linked_universe_path TEXT,
  ADD COLUMN IF NOT EXISTS universe_node_id UUID;

-- 5. Iron Gate View: Engagement başına aktif beyan durumu
CREATE OR REPLACE VIEW engagement_declaration_status AS
SELECT
  ae.id                                                          AS engagement_id,
  ae.title                                                       AS engagement_title,
  ae.assigned_auditor_id                                             AS auditor_id,
  ad.id                                                          AS declaration_id,
  ad.signed_at,
  ad.has_conflict,
  ad.conflict_description,
  ad.declaration_type,
  CASE
    WHEN ad.id IS NULL THEN 'MISSING'
    WHEN ad.signed_at IS NULL THEN 'PENDING'
    ELSE 'SIGNED'
  END                                                            AS gate_status
FROM audit_engagements ae
LEFT JOIN public.auditor_declarations ad
  ON  ad.engagement_id = ae.id
  AND ad.user_id       = ae.assigned_auditor_id
  AND ad.declaration_type = 'INDEPENDENCE';

-- 6. Yorum
COMMENT ON VIEW engagement_declaration_status IS
  'GIAS 2025 Standard II.1 — Her engagement için bağımsızlık beyanı durumunu '
  'gösterir. gate_status: MISSING (beyan yok) | PENDING (imzalanmamış) | SIGNED (geçerli).';
