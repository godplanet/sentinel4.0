-- =============================================================================
-- WAVE 81: Regulatory Lobbying AI (Auto-Responder)
-- =============================================================================
-- Tables:
--   regulatory_drafts       — Resmi kurumlardan (örn. BDDK, SPK, regülatörler) gelen mevzuat taslakları
--   bank_feedback_reports   — Yapay zeka & uyum ekipleri tarafından hazırlanan geri bildirim dökümanları
-- =============================================================================

-- 1. REGULATORY DRAFTS
CREATE TABLE IF NOT EXISTS public.regulatory_drafts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  regulator_name      text NOT NULL,                 -- Ör: BDDK, KVKK
  draft_title         text NOT NULL,                 -- Ör: Bilgi Sistemleri Tebliği Taslağı
  publication_date    date NOT NULL DEFAULT CURRENT_DATE,
  deadline_date       date NOT NULL,                 -- Görüş bildirme son tarihi
  status              text NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'RESPONDED', 'CLOSED')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reg_drafts_tenant ON public.regulatory_drafts(tenant_id);
ALTER TABLE public.regulatory_drafts DISABLE ROW LEVEL SECURITY;

-- 2. BANK FEEDBACK REPORTS (AI Lobbying Returns)
CREATE TABLE IF NOT EXISTS public.bank_feedback_reports (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  draft_id            uuid NOT NULL REFERENCES public.regulatory_drafts(id) ON DELETE CASCADE,
  report_title        text NOT NULL,
  report_text         text,                          -- AI tarafından üretilen uzun resmi metin
  generated_by_ai     boolean NOT NULL DEFAULT true, -- Kim tarafından oluşturuldu?
  approval_status     text NOT NULL DEFAULT 'DRAFT'
    CHECK (approval_status IN ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'SUBMITTED')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bank_feedback_draft ON public.bank_feedback_reports(draft_id);
ALTER TABLE public.bank_feedback_reports DISABLE ROW LEVEL SECURITY;
