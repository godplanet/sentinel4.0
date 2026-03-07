-- ============================================================
-- Wave 44: Core Banking API Connectors
-- Migration: 20260325000000
-- Tables: external_data_pipelines, core_sync_logs
-- ============================================================

-- 1. Dış Veri Pipeline Tanımları (Konfigürasyon)
CREATE TABLE IF NOT EXISTS external_data_pipelines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_code    TEXT NOT NULL UNIQUE,         -- Örn: "MIZAN-DAILY", "EFT-INTRADAY"
  name             TEXT NOT NULL,                -- İnsan dostu ad
  description      TEXT,
  system_source    TEXT NOT NULL,                -- Örn: "CORE_BANKING", "MIS", "SWIFT"
  target_table     TEXT NOT NULL,                -- Supabase hedef tablosu
  schedule_cron    TEXT,                         -- Cron ifadesi (örn: "0 6 * * *")
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  sync_type        TEXT NOT NULL DEFAULT 'PULL'
                     CHECK (sync_type IN ('PULL','PUSH','BIDIRECTIONAL')),
  data_format      TEXT NOT NULL DEFAULT 'JSON'
                     CHECK (data_format IN ('JSON','CSV','XML','FIXED_LENGTH')),
  auth_type        TEXT NOT NULL DEFAULT 'API_KEY'
                     CHECK (auth_type IN ('API_KEY','OAUTH2','MTLS','SFTP','DB_LINK')),
  endpoint_url     TEXT,                        -- NULL: DB/SFTP bağlantıları için
  last_success_at  TIMESTAMPTZ,
  last_error_at    TIMESTAMPTZ,
  last_error_msg   TEXT,
  record_count     BIGINT DEFAULT 0,            -- Son çalıştırmadaki kayıt sayısı
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Eşitleme Logları (Her çalıştırmanın izlenebilir kaydı)
CREATE TABLE IF NOT EXISTS core_sync_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id     UUID NOT NULL REFERENCES external_data_pipelines(id) ON DELETE CASCADE,
  pipeline_code   TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  -- Süre (ms) — sıfıra bölünme koruması DB katmanında gerekmiyor ama uygulama katmanında (x || 1)
  duration_ms     INTEGER,
  status          TEXT NOT NULL DEFAULT 'RUNNING'
                    CHECK (status IN ('RUNNING','SUCCESS','FAILED','PARTIAL','CANCELLED')),
  records_fetched INTEGER DEFAULT 0,
  records_written INTEGER DEFAULT 0,
  records_failed  INTEGER DEFAULT 0,
  error_code      TEXT,
  error_detail    TEXT,
  triggered_by    TEXT NOT NULL DEFAULT 'SCHEDULER'
                    CHECK (triggered_by IN ('SCHEDULER','MANUAL','WEBHOOK','API')),
  triggered_user  TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'
);

-- 3. İndeksler
CREATE INDEX IF NOT EXISTS idx_pipelines_active       ON external_data_pipelines(is_active, system_source);
CREATE INDEX IF NOT EXISTS idx_sync_logs_pipeline_id  ON core_sync_logs(pipeline_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status       ON core_sync_logs(status, started_at DESC);

-- 4. RLS Kapalı (geliştirme ortamı)
ALTER TABLE external_data_pipelines  DISABLE ROW LEVEL SECURITY;
ALTER TABLE core_sync_logs           DISABLE ROW LEVEL SECURITY;
