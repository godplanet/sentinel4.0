-- =============================================================================
-- Wave 54: Auto-Deck & Board Presentation Generator
-- =============================================================================

-- 1. presentation_decks — Kurul Sunumu Kataloğu
CREATE TABLE IF NOT EXISTS public.presentation_decks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  title           TEXT NOT NULL,
  subtitle        TEXT,
  deck_type       TEXT NOT NULL DEFAULT 'BOARD_REPORT',
  -- 'BOARD_REPORT', 'AUDIT_COMMITTEE', 'MANAGEMENT_UPDATE', 'RISK_REVIEW'
  period          TEXT,                            -- '2026 Q1', '2025 Yıllık'
  status          TEXT NOT NULL DEFAULT 'draft',   -- 'draft', 'ready', 'presented', 'archived'
  total_slides    INTEGER NOT NULL DEFAULT 0,
  theme           TEXT NOT NULL DEFAULT 'sentinel', -- 'sentinel', 'executive', 'minimal'
  generated_by    TEXT NOT NULL DEFAULT 'Auto-Deck AI',
  engagement_id   UUID REFERENCES public.audit_engagements(id) ON DELETE SET NULL,
  presented_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. slide_blocks — Slayt İçerikleri
CREATE TABLE IF NOT EXISTS public.slide_blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  deck_id         UUID NOT NULL REFERENCES public.presentation_decks(id) ON DELETE CASCADE,
  slide_order     INTEGER NOT NULL DEFAULT 1,
  slide_type      TEXT NOT NULL DEFAULT 'CONTENT',
  -- 'COVER', 'EXECUTIVE_SUMMARY', 'KPI', 'FINDINGS', 'RECOMMENDATIONS', 'CONTENT', 'CLOSING'
  title           TEXT NOT NULL,
  subtitle        TEXT,
  body_content    TEXT,                            -- Slayt metin içeriği
  chart_config    JSONB,                           -- Recharts / chart konfigürasyonu
  kpi_data        JSONB,                           -- KPI kartı verisi: [{label, value, trend}]
  speaker_notes   TEXT,
  is_locked       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_decks_tenant      ON public.presentation_decks(tenant_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_slides_deck       ON public.slide_blocks(deck_id, slide_order);
CREATE INDEX IF NOT EXISTS idx_slides_tenant     ON public.slide_blocks(tenant_id, deck_id);

-- RLS
ALTER TABLE public.presentation_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slide_blocks       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "decks_access"
  ON public.presentation_decks FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "slides_access"
  ON public.slide_blocks FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
