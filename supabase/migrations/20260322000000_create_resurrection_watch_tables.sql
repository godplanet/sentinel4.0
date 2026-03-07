-- ============================================================
-- Wave 32: Resurrection Watch — Zombi Bulgu & Tahmin Tabloları
-- Migration: 20260322000000
-- ============================================================

-- 1. Zombi Bulgu Kayıtları (Resurrection Logs)
--    Daha önce kapatılan bulguların tekrar ortaya çıkışını kaydeder.
CREATE TABLE IF NOT EXISTS resurrection_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id        UUID,                                       -- Orijinal bulgu referansı (nullable: eski bulgular)
  finding_code      TEXT NOT NULL,                             -- Örn: "M6-KRD-2024-042"
  finding_title     TEXT NOT NULL,
  category          TEXT,                                      -- KREDİ, BT, OPERASYONEL, vb.
  risk_level        TEXT NOT NULL DEFAULT 'HIGH'
                      CHECK (risk_level IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  original_closed_at DATE NOT NULL,                            -- İlk kapatılma tarihi
  resurface_date    DATE NOT NULL,                             -- Yeniden tespit tarihi
  previous_close_count INTEGER NOT NULL DEFAULT 1,            -- Kaç kez kapatılmış
  assigned_to       TEXT,
  entity_name       TEXT,
  notes             TEXT,
  status            TEXT NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE','RESOLVED','MONITORING')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tahminsel Risk Uyarıları (Predictive Alerts)
--    Model çıktısından üretilen forward-looking risk sinyalleri.
CREATE TABLE IF NOT EXISTS predictive_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category        TEXT NOT NULL,    -- Risk kategorisi
  alert_type      TEXT NOT NULL DEFAULT 'RECURRENCE'
                    CHECK (alert_type IN ('RECURRENCE','ESCALATION','TREND','THRESHOLD')),
  severity        TEXT NOT NULL DEFAULT 'HIGH'
                    CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  title           TEXT NOT NULL,
  description     TEXT,
  predicted_date  DATE,             -- Tahmini gerçekleşme tarihi
  confidence_pct  INTEGER CHECK (confidence_pct BETWEEN 0 AND 100),
  is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
  source_data     JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. İndeksler
CREATE INDEX IF NOT EXISTS idx_resurrection_logs_status    ON resurrection_logs(status, resurface_date DESC);
CREATE INDEX IF NOT EXISTS idx_resurrection_logs_category  ON resurrection_logs(category);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_severity  ON predictive_alerts(severity, is_acknowledged);
CREATE INDEX IF NOT EXISTS idx_predictive_alerts_category  ON predictive_alerts(category);

-- 4. RLS Kapalı
ALTER TABLE resurrection_logs  DISABLE ROW LEVEL SECURITY;
ALTER TABLE predictive_alerts  DISABLE ROW LEVEL SECURITY;
