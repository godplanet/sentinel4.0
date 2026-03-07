-- ============================================================
-- Wave 86: External Regulator (Guest) Portal & Continuous Assurance
-- Migration: 20260406000000
-- Tables: continuous_assurance_reports, shared_dossiers, regulator_access_logs
-- ============================================================

-- 1. Sürekli Güvence Panosu (Sürekli Denetim Raporları)
CREATE TABLE IF NOT EXISTS continuous_assurance_reports (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code         TEXT NOT NULL UNIQUE,          -- Örn: "CA-2026-Q1-001"
  title               TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT 'CREDIT_RISK'
                        CHECK (category IN ('CREDIT_RISK','LIQUIDITY','MARKET_RISK','OPERATIONAL_RISK','IT_SECURITY','COMPLIANCE')),
  assurance_score_pct NUMERIC(5,2) NOT NULL DEFAULT 100 CHECK (assurance_score_pct BETWEEN 0 AND 100),
  generated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Sistem Durumu
  status              TEXT NOT NULL DEFAULT 'GREEN'
                        CHECK (status IN ('GREEN','AMBER','RED')),
  findings_count      INTEGER NOT NULL DEFAULT 0,
  is_published        BOOLEAN NOT NULL DEFAULT TRUE, -- Dış regülatöre görünürlük
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Dış Regülatörlere Açılan Paylaşımlı Dosyalar (Dossiers)
CREATE TABLE IF NOT EXISTS shared_dossiers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_code        TEXT NOT NULL UNIQUE,          -- Örn: "BDDK-DOS-2026-01"
  title               TEXT NOT NULL,
  description         TEXT,
  dossier_type        TEXT NOT NULL DEFAULT 'AUDIT_EVIDENCE'
                        CHECK (dossier_type IN ('AUDIT_EVIDENCE','POLICY_DOC','REGULATORY_REPORT','BOARD_MINUTES')),
  file_url            TEXT,                          -- S3 veya storage URL simülasyonu
  shared_date         TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Erişim Sınırları
  expires_at          TIMESTAMPTZ,                   -- Ne zamana kadar erişilebilir
  access_level        TEXT NOT NULL DEFAULT 'CONFIDENTIAL'
                        CHECK (access_level IN ('PUBLIC','CONFIDENTIAL','STRICTLY_CONFIDENTIAL')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Regülatör / Dış Denetçi Erişim Logları (Audit Trail of the Auditors)
CREATE TABLE IF NOT EXISTS regulator_access_logs (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulator_name      TEXT NOT NULL,                 -- Örn: "Ahmet Y. (BDDK Murakıp)"
  regulator_agency    TEXT NOT NULL,                 -- Örn: "BDDK", "TCMB", "KPMG (Dış Denetim)"
  action_type         TEXT NOT NULL DEFAULT 'VIEW_DOSSIER'
                        CHECK (action_type IN ('LOGIN','VIEW_DOSSIER','DOWNLOAD_DOSSIER','VIEW_DASHBOARD','LOGOUT')),
  target_resource     TEXT,                          -- İzlenilen materyalin adı veya ID'si
  ip_address          TEXT,
  access_time         TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_success          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. İndeksler
CREATE INDEX IF NOT EXISTS idx_assurance_published ON continuous_assurance_reports(is_published, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_dossiers_type       ON shared_dossiers(dossier_type);
CREATE INDEX IF NOT EXISTS idx_regulator_logs      ON regulator_access_logs(access_time DESC, regulator_agency);

-- 5. RLS Kapalı (Dış okuma portalı simülasyonu)
ALTER TABLE continuous_assurance_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_dossiers              DISABLE ROW LEVEL SECURITY;
ALTER TABLE regulator_access_logs        DISABLE ROW LEVEL SECURITY;
