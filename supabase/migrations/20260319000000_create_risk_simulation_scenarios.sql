-- ============================================================
-- Wave 22: Time Travel Risk Simulator — Scenario Tables
-- Migration: 20260319000000
-- ============================================================

-- 1. Makroekonomik Stres Testi Senaryoları
CREATE TABLE IF NOT EXISTS simulation_scenarios (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  type          TEXT NOT NULL DEFAULT 'MACRO',         -- MACRO | REGULATORY | CREDIT | LIQUIDITY
  severity      TEXT NOT NULL DEFAULT 'MEDIUM',        -- LOW | MEDIUM | HIGH | CRITICAL
  quarter_slot  NUMERIC(3,2) NOT NULL DEFAULT 0.5,     -- 0.0 = Q1 2025 ... 1.0 = Q1 2026
  parameters    JSONB NOT NULL DEFAULT '{}',           -- { inflation_rate, gdp_shock, etc. }
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Senaryo bazlı etki vektörleri (entity tip bazında)
CREATE TABLE IF NOT EXISTS scenario_impacts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id         UUID NOT NULL REFERENCES simulation_scenarios(id) ON DELETE CASCADE,
  entity_type         TEXT NOT NULL DEFAULT '*',        -- * | BANK | INSURANCE | LEASING | HOLDING
  base_score_delta    NUMERIC(6,2) NOT NULL DEFAULT 0, -- Pozitif = risk artışı
  total_assets_delta  NUMERIC(8,4) NOT NULL DEFAULT 0, -- % değişim (0.05 = %5 azalma)
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. İndeksler (performans)
CREATE INDEX IF NOT EXISTS idx_scenario_impacts_scenario_id ON scenario_impacts(scenario_id);
CREATE INDEX IF NOT EXISTS idx_simulation_scenarios_active ON simulation_scenarios(is_active, quarter_slot);

-- 4. RLS kapalı (geliştirme ortamı - mevcut proje convention'ına uygun)
ALTER TABLE simulation_scenarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_impacts DISABLE ROW LEVEL SECURITY;
