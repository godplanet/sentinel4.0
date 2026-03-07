-- ============================================================
-- Wave 56: ORM Loss Database & Fines Tracker
-- Migration: 20260330000000
-- Tables: operational_losses, regulatory_fines
-- ============================================================

-- 1. Operasyonel Kayıp Olayları (Basel II/III ORM Event Data)
CREATE TABLE IF NOT EXISTS operational_losses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_code        TEXT NOT NULL UNIQUE,            -- Örn: "ORM-2026-0001"
  event_date        DATE NOT NULL,
  discovery_date    DATE,
  -- Basel II / ORM Olay Sınıflandırması
  event_type        TEXT NOT NULL DEFAULT 'INTERNAL_FRAUD'
                      CHECK (event_type IN (
                        'INTERNAL_FRAUD','EXTERNAL_FRAUD','EMPLOYMENT_PRACTICES',
                        'CLIENTS_PRODUCTS','DAMAGE_TO_ASSETS','BUSINESS_DISRUPTION',
                        'EXECUTION_DELIVERY','REGULATORY_NON_COMPLIANCE'
                      )),
  risk_category     TEXT NOT NULL DEFAULT 'OPERATIONAL',
  business_line     TEXT NOT NULL,                   -- Örn: "RETAIL_BANKING","CORPORATE_FINANCE"
  department        TEXT NOT NULL,
  description       TEXT NOT NULL,
  -- Finansal etkiler (TRY)
  gross_loss        NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (gross_loss >= 0),
  recovery_amount   NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (recovery_amount >= 0),
  insurance_recovery NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (insurance_recovery >= 0),
  -- net_loss = gross - recovery - insurance (uygulama katmanında hesaplanır)
  -- Sıfıra bölünme: (gross_loss || 0) ile uyumlu, DB default 0
  net_loss          NUMERIC(18,2) GENERATED ALWAYS AS (
    gross_loss - recovery_amount - insurance_recovery
  ) STORED,
  -- Statü
  status            TEXT NOT NULL DEFAULT 'OPEN'
                      CHECK (status IN ('OPEN','UNDER_REVIEW','PROVISIONED','CLOSED','LITIGATED')),
  provisioning_pct  INTEGER NOT NULL DEFAULT 0 CHECK (provisioning_pct BETWEEN 0 AND 100),
  root_cause        TEXT,
  control_failure   TEXT,
  corrective_action TEXT,
  responsible_dept  TEXT,
  bddk_reportable   BOOLEAN NOT NULL DEFAULT FALSE,
  reported_to_bddk  BOOLEAN NOT NULL DEFAULT FALSE,
  report_deadline   DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. İdari Para Cezaları (Regulatory Fines)
CREATE TABLE IF NOT EXISTS regulatory_fines (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fine_code         TEXT NOT NULL UNIQUE,            -- Örn: "FINE-BDDK-2026-001"
  related_loss_id   UUID REFERENCES operational_losses(id) ON DELETE SET NULL,
  regulator         TEXT NOT NULL,                   -- BDDK, SPK, MASAK, KVKK
  penalty_type      TEXT NOT NULL DEFAULT 'ADMINISTRATIVE'
                      CHECK (penalty_type IN ('ADMINISTRATIVE','CRIMINAL','CIVIL','RESTRICTION')),
  subject           TEXT NOT NULL,                   -- Cezanın konusu
  legal_basis       TEXT,                            -- Dayandığı kanun maddesi
  fine_amount       NUMERIC(18,2) NOT NULL DEFAULT 0 CHECK (fine_amount > 0),
  currency          TEXT NOT NULL DEFAULT 'TRY',
  imposed_date      DATE NOT NULL,
  payment_deadline  DATE,
  paid_date         DATE,
  paid_amount       NUMERIC(18,2) DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'UNPAID'
                      CHECK (status IN ('UNPAID','PARTIAL','PAID','CONTESTED','WAIVED')),
  appeal_status     TEXT,
  appeal_deadline   DATE,
  is_appealed       BOOLEAN NOT NULL DEFAULT FALSE,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Özet View (ORM Dashboard metrikleri)
CREATE OR REPLACE VIEW orm_loss_summary AS
SELECT
  event_type,
  COUNT(id)                                       AS event_count,
  COALESCE(SUM(gross_loss), 0)                    AS total_gross_loss,
  COALESCE(SUM(net_loss), 0)                      AS total_net_loss,
  COALESCE(SUM(recovery_amount), 0)               AS total_recovery,
  -- Ortalama kayıp: sıfıra bölünme GREATEST ile korunmuştur
  COALESCE(ROUND(SUM(gross_loss) / GREATEST(COUNT(id), 1), 2), 0) AS avg_loss_per_event,
  COUNT(CASE WHEN bddk_reportable AND NOT reported_to_bddk THEN 1 END) AS pending_bddk_reports
FROM operational_losses
WHERE status <> 'CLOSED'
GROUP BY event_type;

-- 4. İndeksler
CREATE INDEX IF NOT EXISTS idx_orm_losses_event_type  ON operational_losses(event_type, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_orm_losses_status      ON operational_losses(status, bddk_reportable);
CREATE INDEX IF NOT EXISTS idx_reg_fines_regulator    ON regulatory_fines(regulator, status);
CREATE INDEX IF NOT EXISTS idx_reg_fines_deadline     ON regulatory_fines(payment_deadline) WHERE status = 'UNPAID';

-- 5. RLS Kapalı
ALTER TABLE operational_losses  DISABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_fines    DISABLE ROW LEVEL SECURITY;
