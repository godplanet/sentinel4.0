-- =============================================================================
-- Wave 58: PQC (Post-Quantum Cryptography) Radar
-- =============================================================================

-- 1. cryptographic_assets — Kriptografik Envanter
CREATE TABLE IF NOT EXISTS public.cryptographic_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  asset_name      TEXT NOT NULL,               -- 'Mobil Bankacılık API Anahtarları', 'Veritabanı Şifreleme Anahtarı'
  algorithm       TEXT NOT NULL,               -- 'RSA-2048', 'ECC-256', 'AES-256-GCM', 'Kyber-768'
  key_size        INTEGER,                     -- 2048, 256, 768 vs.
  quantum_risk    TEXT NOT NULL DEFAULT 'high',-- 'critical', 'high', 'medium', 'low', 'safe' (PQC)
  usage_context   TEXT NOT NULL,               -- 'Data in Transit', 'Data at Rest', 'Digital Signature'
  expiration_date TIMESTAMPTZ,
  owner_dept      TEXT,                        -- 'IT Security', 'Digital Banking'
  status          TEXT NOT NULL DEFAULT 'active', -- 'active', 'migrating', 'retired'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. pqc_transition_plans — Kuantum Sonrası Geçiş Planları
CREATE TABLE IF NOT EXISTS public.pqc_transition_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  asset_id        UUID NOT NULL REFERENCES public.cryptographic_assets(id) ON DELETE CASCADE,
  target_algorithm TEXT NOT NULL,              -- 'ML-KEM (Kyber)', 'ML-DSA (Dilithium)'
  target_date     DATE NOT NULL,               -- Geçişin tamamlanması planlanan tarih
  budget_usd      NUMERIC(10,2),
  status          TEXT NOT NULL DEFAULT 'planning', -- 'planning', 'in_progress', 'testing', 'completed'
  progress_pct    INTEGER NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_crypto_assets_tenant ON public.cryptographic_assets(tenant_id, quantum_risk);
CREATE INDEX IF NOT EXISTS idx_pqc_plans_asset      ON public.pqc_transition_plans(asset_id);
CREATE INDEX IF NOT EXISTS idx_pqc_plans_tenant     ON public.pqc_transition_plans(tenant_id, status);

-- RLS
ALTER TABLE public.cryptographic_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pqc_transition_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "crypto_assets_access"
  ON public.cryptographic_assets FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "pqc_plans_access"
  ON public.pqc_transition_plans FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
