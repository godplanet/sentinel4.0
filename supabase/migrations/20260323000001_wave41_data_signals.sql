-- =============================================================================
-- Wave 41: Data Signals & Seismograph
-- =============================================================================

-- 1. external_data_signals — Dış Kaynaklı Risk Sinyalleri
CREATE TABLE IF NOT EXISTS public.external_data_signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  signal_type     TEXT NOT NULL,               -- 'MACRO_ECONOMIC', 'CYBER', 'REGULATORY', 'MARKET'
  signal_source   TEXT NOT NULL,               -- 'TCMB', 'BDDK', 'SPK', 'CERT-TR', 'BLOOMBERG'
  title           TEXT NOT NULL,
  description     TEXT,
  signal_strength NUMERIC(5,2) NOT NULL DEFAULT 1.0, -- 0-10 scale
  impact_score    NUMERIC(5,2) NOT NULL DEFAULT 0,
  severity        TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  is_active       BOOLEAN NOT NULL DEFAULT true,
  triggered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at      TIMESTAMPTZ,
  raw_data        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. seismograph_logs — Sismograf Titreşim Kayıtları (Probe istisna akışı)
CREATE TABLE IF NOT EXISTS public.seismograph_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  log_hour        TIMESTAMPTZ NOT NULL,        -- Saat bazında gruplama için
  hour_label      TEXT NOT NULL,               -- "00:00", "01:00" ... "23:00"
  exceptions      INTEGER NOT NULL DEFAULT 0, -- Bu saatte tespit edilen istisna sayısı
  passes          INTEGER NOT NULL DEFAULT 0, -- Bu saatte geçen kontrol sayısı
  signal_strength NUMERIC(5,2) NOT NULL DEFAULT 0,
  peak_probe_id   UUID REFERENCES public.probes(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ext_signals_tenant    ON public.external_data_signals(tenant_id, triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_ext_signals_active    ON public.external_data_signals(tenant_id, is_active, severity);
CREATE INDEX IF NOT EXISTS idx_seismo_tenant_hour    ON public.seismograph_logs(tenant_id, log_hour DESC);

-- RLS
ALTER TABLE public.external_data_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seismograph_logs      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ext_signals_access"
  ON public.external_data_signals FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "seismo_access"
  ON public.seismograph_logs FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
