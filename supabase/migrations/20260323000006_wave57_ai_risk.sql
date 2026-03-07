-- =============================================================================
-- Wave 57: AI & LLM Model Risk Management
-- =============================================================================

-- 1. ai_models_inventory — Yapay Zeka / Makine Öğrenmesi Modelleri Envanteri
CREATE TABLE IF NOT EXISTS public.ai_models_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  model_name      TEXT NOT NULL,
  model_type      TEXT NOT NULL,               -- 'LLM', 'XGBoost', 'Random Forest', 'Neural Network'
  use_case        TEXT NOT NULL,               -- 'Kredi Karar Motoru', 'Chatbot', 'Dolandırıcılık Tespiti'
  vendor          TEXT,                        -- 'OpenAI', 'In-House', 'Google'
  risk_tier       TEXT NOT NULL DEFAULT 'high',-- 'critical', 'high', 'medium', 'low'
  status          TEXT NOT NULL DEFAULT 'active', -- 'development', 'active', 'deprecated', 'suspended'
  business_owner  TEXT,
  data_sources    JSONB,
  last_review_at  TIMESTAMPTZ,
  next_review_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. model_bias_tests — Bias (Ön Yargı) ve Halüsinasyon Test Sonuçları
CREATE TABLE IF NOT EXISTS public.model_bias_tests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  model_id        UUID NOT NULL REFERENCES public.ai_models_inventory(id) ON DELETE CASCADE,
  test_type       TEXT NOT NULL,               -- 'BIAS', 'HALLUCINATION', 'DRIFT', 'FAIRNESS'
  status          TEXT NOT NULL DEFAULT 'pending', -- 'pass', 'fail', 'warning', 'pending'
  total_prompts   INTEGER NOT NULL DEFAULT 0,  -- Test edilen örnek/prompt sayısı
  failed_prompts  INTEGER NOT NULL DEFAULT 0,  -- Hata/halüsinasyon veren örnek sayısı
  findings        TEXT,                        -- Test bulguları özeti
  metrics         JSONB,                       -- {'accuracy': 0.92, 'demographic_parity': 0.81}
  tested_by       TEXT NOT NULL DEFAULT 'system',
  tested_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_models_tenant   ON public.ai_models_inventory(tenant_id, status, risk_tier);
CREATE INDEX IF NOT EXISTS idx_bias_tests_model   ON public.model_bias_tests(model_id, tested_at DESC);
CREATE INDEX IF NOT EXISTS idx_bias_tests_tenant  ON public.model_bias_tests(tenant_id, status);

-- RLS
ALTER TABLE public.ai_models_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_bias_tests    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_models_inventory_access"
  ON public.ai_models_inventory FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "model_bias_tests_access"
  ON public.model_bias_tests FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
