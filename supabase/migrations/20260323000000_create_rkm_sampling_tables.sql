-- ============================================================
-- Wave 36: RKM Master Grid & Sampling Wizard Tables
-- Migration: 20260323000000
-- ============================================================

-- 1. RKM Master Risk Tablosu
--    (Mevcut rkm_risks tablosunu tamamlar / yoksa oluşturur)
CREATE TABLE IF NOT EXISTS rkm_master (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_code                 TEXT NOT NULL UNIQUE,
  risk_title                TEXT NOT NULL,
  risk_owner                TEXT,
  risk_status               TEXT NOT NULL DEFAULT 'ACTIVE'
                              CHECK (risk_status IN ('ACTIVE','MITIGATED','ACCEPTED','TRANSFERRED','ARCHIVED')),
  risk_category             TEXT,
  risk_subcategory          TEXT,
  main_process              TEXT,
  sub_process               TEXT,
  inherent_impact           INTEGER NOT NULL DEFAULT 3 CHECK (inherent_impact BETWEEN 1 AND 5),
  inherent_likelihood       INTEGER NOT NULL DEFAULT 3 CHECK (inherent_likelihood BETWEEN 1 AND 5),
  -- Hesaplanan alan: etki × olasılık
  inherent_score            NUMERIC GENERATED ALWAYS AS (inherent_impact * inherent_likelihood) STORED,
  inherent_rating           TEXT GENERATED ALWAYS AS (
    CASE
      WHEN inherent_impact * inherent_likelihood >= 20 THEN 'KRİTİK'
      WHEN inherent_impact * inherent_likelihood >= 12 THEN 'YÜKSEK'
      WHEN inherent_impact * inherent_likelihood >= 6  THEN 'ORTA'
      ELSE 'DÜŞÜK'
    END
  ) STORED,
  control_type              TEXT DEFAULT 'PREVENTIVE'
                              CHECK (control_type IN ('PREVENTIVE','DETECTIVE','CORRECTIVE','DIRECTIVE')),
  control_nature            TEXT,
  control_design_rating     INTEGER DEFAULT 3 CHECK (control_design_rating BETWEEN 1 AND 5),
  control_operating_rating  INTEGER DEFAULT 3 CHECK (control_operating_rating BETWEEN 1 AND 5),
  -- Kontrol etkinliği = (tasarım + işletim) / 10 → 0-1 arası oran
  control_effectiveness     NUMERIC GENERATED ALWAYS AS (
    (control_design_rating + control_operating_rating)::numeric / 10.0
  ) STORED,
  residual_impact           INTEGER NOT NULL DEFAULT 2 CHECK (residual_impact BETWEEN 1 AND 5),
  residual_likelihood       INTEGER NOT NULL DEFAULT 2 CHECK (residual_likelihood BETWEEN 1 AND 5),
  residual_score            NUMERIC GENERATED ALWAYS AS (residual_impact * residual_likelihood) STORED,
  residual_rating           TEXT GENERATED ALWAYS AS (
    CASE
      WHEN residual_impact * residual_likelihood >= 20 THEN 'KRİTİK'
      WHEN residual_impact * residual_likelihood >= 12 THEN 'YÜKSEK'
      WHEN residual_impact * residual_likelihood >= 6  THEN 'ORTA'
      ELSE 'DÜŞÜK'
    END
  ) STORED,
  bddk_reference            TEXT,
  iso27001_reference        TEXT,
  risk_response_strategy    TEXT DEFAULT 'MITIGATE'
                              CHECK (risk_response_strategy IN ('MITIGATE','ACCEPT','TRANSFER','AVOID')),
  last_audit_date           DATE,
  audit_rating              TEXT DEFAULT 'NEEDS_IMPROVEMENT'
                              CHECK (audit_rating IN ('SATISFACTORY','NEEDS_IMPROVEMENT','UNSATISFACTORY')),
  notes                     TEXT,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Örnekleme Log Tablosu (Sampling Wizard kayıtları)
CREATE TABLE IF NOT EXISTS sampling_logs (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id             UUID,             -- İlgili çalışma kağıdı (nullable)
  population_size          INTEGER NOT NULL CHECK (population_size > 0),
  risk_level               TEXT NOT NULL CHECK (risk_level IN ('low','medium','high')),
  confidence_level         INTEGER NOT NULL CHECK (confidence_level IN (90, 95, 99)),
  expected_error_rate      NUMERIC,          -- Beklenen hata oranı %
  -- Hesaplanan alanlar (UYGULAMA TARAFINDAN doldurulur)
  recommended_sample_size  INTEGER NOT NULL,
  -- Kapsam oranı = sample / population — SIFIRA BÖLÜNME (population_size || 1)
  coverage_pct             NUMERIC GENERATED ALWAYS AS (
    ROUND(recommended_sample_size::numeric / GREATEST(population_size, 1) * 100, 2)
  ) STORED,
  methodology              TEXT,
  justification            TEXT,
  is_full_scope            BOOLEAN NOT NULL DEFAULT FALSE,
  sample_indices           INTEGER[],        -- Rastgele çekilen birim numaraları
  created_by               TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. İndeksler
CREATE INDEX IF NOT EXISTS idx_rkm_master_status   ON rkm_master(risk_status);
CREATE INDEX IF NOT EXISTS idx_rkm_master_category ON rkm_master(risk_category);
CREATE INDEX IF NOT EXISTS idx_sampling_logs_wp    ON sampling_logs(workpaper_id);

-- 4. RLS Kapalı
ALTER TABLE rkm_master    DISABLE ROW LEVEL SECURITY;
ALTER TABLE sampling_logs DISABLE ROW LEVEL SECURITY;
