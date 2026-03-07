-- =============================================================================
-- Wave 78: Deepfake & Synthetic Identity Shield
-- =============================================================================

-- 1. biometric_audits — Biyometrik Kimlik Doğrulama Logları
CREATE TABLE IF NOT EXISTS public.biometric_audits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id),
  channel             TEXT NOT NULL,               -- 'Video_Call', 'Mobile_App', 'ATM_Camera'
  customer_id         TEXT,                        -- Eşleşen müşteri numarası
  session_id          TEXT NOT NULL,               -- Doğrulama seansı referansı
  liveliness_score    NUMERIC(5,2) NOT NULL,       -- Canlılık testi skoru (0-100)
  voice_match_score   NUMERIC(5,2),                -- Ses frekans eşleşme skoru (0-100)
  face_match_score    NUMERIC(5,2),                -- Yüz tanıma eşleşme skoru (0-100)
  overall_confidence  NUMERIC(5,2) NOT NULL,       -- Genel güven skoru
  status              TEXT NOT NULL DEFAULT 'pending', -- 'passed', 'failed', 'manual_review', 'pending'
  analyzed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. deepfake_alerts — Sentetik Medya / Deepfake Tespiti Alarmları
CREATE TABLE IF NOT EXISTS public.deepfake_alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id),
  audit_id            UUID NOT NULL REFERENCES public.biometric_audits(id) ON DELETE CASCADE,
  alert_type          TEXT NOT NULL,               -- 'Voice_Cloning', 'Face_Swap', 'AI_Generated_Video'
  deepfake_probability NUMERIC(5,2) NOT NULL,      -- Sentetik olma olasılığı (0-100)
  detected_artifacts  JSONB,                       -- Tespit edilen anomaliler (örn. {"lip_sync_error": true, "audio_frequency_jump": 0.8})
  severity            TEXT NOT NULL DEFAULT 'high', -- 'critical', 'high', 'medium'
  action_taken        TEXT NOT NULL DEFAULT 'blocked', -- 'blocked', 'flagged', 'session_terminated'
  description         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. kyc_synthetic_logs — Kimlik Avı (KYC) ve Sentetik Kimlik İzleme
CREATE TABLE IF NOT EXISTS public.kyc_synthetic_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id),
  applicant_name      TEXT NOT NULL,
  national_id         TEXT,
  risk_factors        JSONB,                       -- {"ghost_address": true, "reused_phone": true}
  synthetic_risk_score NUMERIC(5,2) NOT NULL,      -- Sentetik Kimlik (Frankenstein Identity) Skoru
  decision            TEXT NOT NULL DEFAULT 'review', -- 'approve', 'reject', 'review'
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_biometric_audits_tenant ON public.biometric_audits(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_deepfake_alerts_tenant ON public.deepfake_alerts(tenant_id, severity);
CREATE INDEX IF NOT EXISTS idx_kyc_synthetic_logs_tenant ON public.kyc_synthetic_logs(tenant_id, decision);

-- RLS
ALTER TABLE public.biometric_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deepfake_alerts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_synthetic_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "biometric_audits_access"
  ON public.biometric_audits FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "deepfake_alerts_access"
  ON public.deepfake_alerts FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "kyc_synthetic_logs_access"
  ON public.kyc_synthetic_logs FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
