-- =============================================================================
-- Wave 72: Shadow IT & Shadow AI Hunter
-- =============================================================================

-- 1. shadow_it_assets — Çalışanlar tarafından izinsiz kullanılan uygulamalar
CREATE TABLE IF NOT EXISTS public.shadow_it_assets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id),
  app_name            TEXT NOT NULL,               -- 'Dropbox', 'WeTransfer', 'Notion'
  category            TEXT NOT NULL,               -- 'Cloud Storage', 'Generative AI', 'Productivity'
  risk_score          NUMERIC(5,2) NOT NULL DEFAULT 50.0,
  risk_level          TEXT NOT NULL DEFAULT 'medium', -- 'critical', 'high', 'medium', 'low'
  active_users_count  INTEGER NOT NULL DEFAULT 1,
  total_traffic_mb    NUMERIC(15,2) NOT NULL DEFAULT 0.0, -- MB/GB cinsinden trafik
  status              TEXT NOT NULL DEFAULT 'discovered', -- 'discovered', 'blocked', 'approved', 'under_review'
  first_seen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. unauthorized_ai_logs — İzinsiz Yapay Zeka Trafiği ve Veri Sızıntısı Şüpheleri
CREATE TABLE IF NOT EXISTS public.unauthorized_ai_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES public.tenants(id),
  asset_id            UUID REFERENCES public.shadow_it_assets(id) ON DELETE CASCADE,
  device_ip           TEXT NOT NULL,
  user_email          TEXT,                        -- Eşleşmişse
  ai_service_name     TEXT NOT NULL,               -- 'ChatGPT', 'Claude', 'Midjourney', 'DeepL'
  payload_size_bytes  BIGINT NOT NULL DEFAULT 0,
  alert_type          TEXT NOT NULL DEFAULT 'data_exfiltration_risk', -- 'data_exfiltration_risk', 'policy_violation'
  severity            TEXT NOT NULL DEFAULT 'high', -- 'critical', 'high', 'medium', 'low'
  action_taken        TEXT NOT NULL DEFAULT 'alerted', -- 'blocked_by_proxy', 'alerted', 'allowed'
  description         TEXT,
  occurred_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_shadow_it_tenant ON public.shadow_it_assets(tenant_id, status, risk_level);
CREATE INDEX IF NOT EXISTS idx_unauth_ai_logs_tenant ON public.unauthorized_ai_logs(tenant_id, severity, action_taken);
CREATE INDEX IF NOT EXISTS idx_unauth_ai_logs_asset ON public.unauthorized_ai_logs(asset_id);

-- RLS
ALTER TABLE public.shadow_it_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unauthorized_ai_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "shadow_it_access"
  ON public.shadow_it_assets FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "unauth_ai_access"
  ON public.unauthorized_ai_logs FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
