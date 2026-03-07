-- ============================================================
-- Wave 59: Greenwashing Detector & Sustainable Finance
-- Migration: 20260331000000
-- Tables: green_bonds, esg_fund_audits
-- ============================================================

-- 1. Sürdürülebilir Finans / Yeşil Tahvil Kayıtları (Green Bonds & Loans)
CREATE TABLE IF NOT EXISTS green_bonds (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument_code     TEXT NOT NULL UNIQUE,          -- Örn: "GB-2026-SUN-01"
  project_name        TEXT NOT NULL,
  borrower_name       TEXT NOT NULL,
  sector              TEXT NOT NULL DEFAULT 'RENEWABLE_ENERGY'
                        CHECK (sector IN ('RENEWABLE_ENERGY','CLEAN_TRANSPORT','GREEN_BUILDINGS','SUSTAINABLE_WATER','CIRCULAR_ECONOMY','POLLUTION_PREVENTION')),
  amount_issued       NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (amount_issued > 0),
  currency            TEXT NOT NULL DEFAULT 'USD',
  issue_date          DATE NOT NULL,
  maturity_date       DATE NOT NULL,
  -- Kupon/Faiz Oranı ve ESG İndirim Primi (Greenium)
  interest_rate       NUMERIC(5,2) NOT NULL,
  esg_premium_bps     INTEGER NOT NULL DEFAULT 0,    -- Örn: 15 basis points indirim
  -- İklim/Sürdürülebilirlik Hedefleri (KPIs)
  kpi_target          TEXT,                          -- Örn: "Yılda 50,000 ton CO2 azaltımı"
  -- Bağımsız Değerlendirme (Second Party Opinion)
  spo_provider        TEXT,                          -- Örn: "Sustainalytics", "Vigeo Eiris"
  spo_status          TEXT NOT NULL DEFAULT 'ALIGNMENT_CONFIRMED'
                        CHECK (spo_status IN ('PENDING','ALIGNMENT_CONFIRMED','DEVIATION_DETECTED','WITHDRAWN')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ESG Fon Kullanım Denetimleri (Fund Audits) - Greenwashing tespiti için
CREATE TABLE IF NOT EXISTS esg_fund_audits (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bond_id             UUID NOT NULL REFERENCES green_bonds(id) ON DELETE CASCADE,
  bond_code           TEXT NOT NULL,
  audit_date          DATE NOT NULL,
  auditor_name        TEXT NOT NULL,                 -- Örn: "İç Denetim - Kurumsal Krediler", "Ernst & Young"
  -- Fon Kullanımı
  total_fund          NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (total_fund >= 0),
  allocated_to_green  NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (allocated_to_green >= 0),
  deviated_amount     NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (deviated_amount >= 0),
  -- Net sapma oranı (Deviated / Total * 100) -> Uygulama katmanında (total || 1) koruması ile gösterilir
  deviation_reason    TEXT,                          -- Sapma gerekçesi (Örn: "Fosil yakıt yan operasyonlarına kaydırma")
  -- Greenwashing Risk Metrikleri
  risk_level          TEXT NOT NULL DEFAULT 'LOW'
                        CHECK (risk_level IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  kpi_status          TEXT NOT NULL DEFAULT 'ON_TRACK'
                        CHECK (kpi_status IN ('ON_TRACK','DELAYED','MISSED','DATA_UNAVAILABLE')),
  carbon_footprint_ton NUMERIC(15,2),                -- Gerçeklesen karbon ayak izi tasarrufu
  findings            TEXT NOT NULL,
  -- Aksiyon ve Statü
  requires_action     BOOLEAN NOT NULL DEFAULT FALSE,
  status              TEXT NOT NULL DEFAULT 'COMPLETED'
                        CHECK (status IN ('PLANNED','IN_PROGRESS','COMPLETED','ESCALATED')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. İndeksler
CREATE INDEX IF NOT EXISTS idx_green_bonds_sector    ON green_bonds(sector, spo_status);
CREATE INDEX IF NOT EXISTS idx_esg_audits_bond_id    ON esg_fund_audits(bond_id, audit_date DESC);
CREATE INDEX IF NOT EXISTS idx_esg_audits_risk_level ON esg_fund_audits(risk_level, status);

-- 4. RLS Kapalı
ALTER TABLE green_bonds      DISABLE ROW LEVEL SECURITY;
ALTER TABLE esg_fund_audits  DISABLE ROW LEVEL SECURITY;
