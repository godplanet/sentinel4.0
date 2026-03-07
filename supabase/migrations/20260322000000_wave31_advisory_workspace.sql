-- =============================================================================
-- Wave 31: Advisory & Consulting Workspace — Ek Tablolar
-- =============================================================================

-- 1. advisory_services — Danışmanlık hizmet kataloğu (scope + pricing)
CREATE TABLE IF NOT EXISTS public.advisory_services (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  engagement_id   UUID REFERENCES public.advisory_engagements(id) ON DELETE SET NULL,
  title           TEXT NOT NULL,
  service_type    TEXT NOT NULL DEFAULT 'CONSULTING'
                  CHECK (service_type IN (
                    'CONSULTING',
                    'TRAINING',
                    'PROCESS_DESIGN',
                    'GAP_ANALYSIS',
                    'RISK_WORKSHOP'
                  )),
  description     TEXT,
  regulatory_ref  TEXT,       -- BDDK, GIAS, SOX md.no vb.
  estimated_hours INTEGER DEFAULT 0,
  fee_basis       TEXT DEFAULT 'INTERNAL'
                  CHECK (fee_basis IN ('INTERNAL', 'FIXED', 'HOURLY')),
  status          TEXT NOT NULL DEFAULT 'SCOPING'
                  CHECK (status IN (
                    'SCOPING', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
                  )),
  deliverable     TEXT,       -- Beklenen çıktı
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. advisory_canvas_blocks — AdvisoryCanvasTab'ın Supabase karşılığı
CREATE TABLE IF NOT EXISTS public.advisory_canvas_blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id   UUID NOT NULL REFERENCES public.advisory_engagements(id) ON DELETE CASCADE,
  block_type      TEXT NOT NULL DEFAULT 'process'
                  CHECK (block_type IN ('process', 'decision', 'note')),
  text_content    TEXT NOT NULL DEFAULT '',
  position_index  INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_advisory_services_tenant_id   ON public.advisory_services(tenant_id);
CREATE INDEX IF NOT EXISTS idx_advisory_services_engagement  ON public.advisory_services(engagement_id);
CREATE INDEX IF NOT EXISTS idx_advisory_services_status      ON public.advisory_services(status);
CREATE INDEX IF NOT EXISTS idx_advisory_canvas_engagement    ON public.advisory_canvas_blocks(engagement_id, position_index);

-- RLS
ALTER TABLE public.advisory_services      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisory_canvas_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advisory_services_access"
  ON public.advisory_services FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "advisory_canvas_blocks_access"
  ON public.advisory_canvas_blocks FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
