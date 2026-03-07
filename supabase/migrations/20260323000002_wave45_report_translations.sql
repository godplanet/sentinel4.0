-- =============================================================================
-- Wave 45: AI Report Translator — report_translations
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.report_translations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id),
  report_id         UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  source_language   TEXT NOT NULL DEFAULT 'tr',   -- ISO 639-1: 'tr', 'en', 'ar'
  target_language   TEXT NOT NULL DEFAULT 'en',
  source_text       TEXT NOT NULL,
  translated_text   TEXT NOT NULL,
  section_key       TEXT,                          -- 'executive_summary', 'findings', 'recommendations'
  translation_model TEXT NOT NULL DEFAULT 'gpt-4o',
  confidence_score  NUMERIC(5,4),                 -- 0.0000 – 1.0000
  is_reviewed       BOOLEAN NOT NULL DEFAULT false,
  reviewed_by       TEXT,
  reviewed_at       TIMESTAMPTZ,
  created_by        TEXT NOT NULL DEFAULT 'system',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_report_translations_report     ON public.report_translations(report_id, target_language);
CREATE INDEX IF NOT EXISTS idx_report_translations_tenant     ON public.report_translations(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_report_translations_section    ON public.report_translations(report_id, section_key, target_language);

-- RLS
ALTER TABLE public.report_translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "translations_access"
  ON public.report_translations FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
