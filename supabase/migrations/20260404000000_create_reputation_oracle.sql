-- ============================================================
-- Wave 73: Reputational Risk & Sentiment Oracle
-- Migration: 20260404000000
-- Tables: social_sentiment_feeds, reputation_crisis_alerts
-- ============================================================

-- 1. Sosyal Medya ve Haber Akışı (Duygu Analizi Verileri)
CREATE TABLE IF NOT EXISTS social_sentiment_feeds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_platform TEXT NOT NULL CHECK (source_platform IN ('X','LINKEDIN','NEWS','FORUM','APP_STORES','OTHER')),
  post_id         TEXT UNIQUE,                               -- Platformdaki benzersiz ID (varsa)
  author_handle   TEXT,
  content_snippet TEXT NOT NULL,                             -- İçeriğin taranan özeti/metni
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Duygu (Sentiment) Skorlaması NLP (0-100)
  sentiment_type  TEXT NOT NULL DEFAULT 'NEUTRAL'
                    CHECK (sentiment_type IN ('POSITIVE','NEUTRAL','NEGATIVE','TOXIC')),
  sentiment_score INTEGER NOT NULL DEFAULT 50 CHECK (sentiment_score BETWEEN 0 AND 100),
  impact_reach    INTEGER NOT NULL DEFAULT 0,                -- Görüntülenme / Etkileşim sayısı
  -- Entity Teşhisi (Bankanın hangi hizmeti hedef alındı)
  target_entity   TEXT,                                      -- Örn: "Mobil Şube", "Müşteri Hizmetleri"
  is_flagged      BOOLEAN NOT NULL DEFAULT FALSE,            -- İtibar ekibi manuel incelemeye aldı mı?
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. İtibar Krizi Erken Uyarı Alarmları (Crisis Alerting)
CREATE TABLE IF NOT EXISTS reputation_crisis_alerts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_title     TEXT NOT NULL,
  alert_date      TIMESTAMPTZ NOT NULL DEFAULT now(),
  severity        TEXT NOT NULL DEFAULT 'HIGH'
                    CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  -- Metrikler
  negative_ratio_pct NUMERIC(5,2) NOT NULL DEFAULT 0,        -- Negatif yorum oranı (%)
  total_mentions  INTEGER NOT NULL DEFAULT 0,                -- Toplam bahsetme
  -- İtibar Tespiti
  crisis_topic    TEXT NOT NULL,                             -- Örn: "Sistem Çöküntüsü", "Veri İhlali İddiası", "CEO Açıklaması"
  action_plan     TEXT,                                      -- Kurumsal İletişim departmanının planı
  status          TEXT NOT NULL DEFAULT 'MONITORING'
                    CHECK (status IN ('MONITORING','PR_RESPONSE_REQUIRED','MITIGATED','FALSE_ALARM')),
  assigned_to     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. İndeksler
CREATE INDEX IF NOT EXISTS idx_sentiment_published ON social_sentiment_feeds(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_sentiment_type      ON social_sentiment_feeds(sentiment_type);
CREATE INDEX IF NOT EXISTS idx_crisis_status       ON reputation_crisis_alerts(status, severity);

-- 4. RLS Kapalı
ALTER TABLE social_sentiment_feeds       DISABLE ROW LEVEL SECURITY;
ALTER TABLE reputation_crisis_alerts     DISABLE ROW LEVEL SECURITY;
