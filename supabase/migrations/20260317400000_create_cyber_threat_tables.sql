/*
  # Wave 53: Cyber Threat Intelligence & Dark Web Monitor

  ## Tablolar
  1. `cyber_threat_feeds`  — OSINT/ tehdit istihbaratı beslemeleri
  2. `darkweb_alerts`      — Dark web sızıntı ve mention uyarıları

  ## Kural: Yalnızca DDL — INSERT → seed.sql
*/

-- ============================================================
-- 1. cyber_threat_feeds
-- ============================================================
CREATE TABLE IF NOT EXISTS public.cyber_threat_feeds (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  feed_source         text        NOT NULL DEFAULT 'INTERNAL',
  threat_type         text        NOT NULL DEFAULT 'MALWARE'
                      CHECK (threat_type IN (
                        'MALWARE','RANSOMWARE','PHISHING','APT','SUPPLY_CHAIN',
                        'INSIDER','DDOS','ZERO_DAY','CREDENTIAL_THEFT','DATA_EXFIL'
                      )),
  title               text        NOT NULL DEFAULT '',
  description         text        NOT NULL DEFAULT '',
  severity            text        NOT NULL DEFAULT 'MEDIUM'
                      CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW','INFORMATIONAL')),
  status              text        NOT NULL DEFAULT 'ACTIVE'
                      CHECK (status IN ('ACTIVE','INVESTIGATING','CONTAINED','RESOLVED','FALSE_POSITIVE')),
  ioc_type            text,       -- Indicator of Compromise: IP, DOMAIN, HASH, URL
  ioc_value           text,
  mitre_tactic        text,
  mitre_technique     text,
  total_vulnerabilities integer   NOT NULL DEFAULT 0,
  affected_systems    text[],
  confidence_score    numeric     NOT NULL DEFAULT 0
                      CHECK (confidence_score BETWEEN 0 AND 100),
  threat_actor        text,
  source_url          text,
  detected_at         timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cyber_feeds_tenant   ON public.cyber_threat_feeds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cyber_feeds_severity ON public.cyber_threat_feeds(severity);
CREATE INDEX IF NOT EXISTS idx_cyber_feeds_type     ON public.cyber_threat_feeds(threat_type);
CREATE INDEX IF NOT EXISTS idx_cyber_feeds_status   ON public.cyber_threat_feeds(status);
CREATE INDEX IF NOT EXISTS idx_cyber_feeds_detected ON public.cyber_threat_feeds(detected_at DESC);

ALTER TABLE public.cyber_threat_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cyber_feeds: auth read"   ON public.cyber_threat_feeds FOR SELECT TO authenticated USING (true);
CREATE POLICY "cyber_feeds: auth write"  ON public.cyber_threat_feeds FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "cyber_feeds: anon read"   ON public.cyber_threat_feeds FOR SELECT TO anon          USING (true);
CREATE POLICY "cyber_feeds: anon insert" ON public.cyber_threat_feeds FOR INSERT TO anon          WITH CHECK (true);

-- ============================================================
-- 2. darkweb_alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.darkweb_alerts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  alert_code          text        NOT NULL DEFAULT '',
  title               text        NOT NULL DEFAULT '',
  description         text        NOT NULL DEFAULT '',
  category            text        NOT NULL DEFAULT 'DATA_LEAK'
                      CHECK (category IN (
                        'DATA_LEAK','CREDENTIAL_DUMP','RANSOMWARE_LISTING',
                        'FORUM_MENTION','MARKET_LISTING','BRAND_ABUSE','EXEC_MENTION'
                      )),
  severity            text        NOT NULL DEFAULT 'HIGH'
                      CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  status              text        NOT NULL DEFAULT 'NEW'
                      CHECK (status IN ('NEW','VALIDATED','ESCALATED','RESOLVED','FALSE_POSITIVE')),
  source_forum        text,
  threat_actor_alias  text,
  affected_data_types text[],
  estimated_records   integer,
  evidence_snippet    text,
  confidence_score    numeric     NOT NULL DEFAULT 0
                      CHECK (confidence_score BETWEEN 0 AND 100),
  feed_id             uuid        REFERENCES public.cyber_threat_feeds(id) ON DELETE SET NULL,
  detected_at         timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_darkweb_alerts_tenant   ON public.darkweb_alerts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_darkweb_alerts_category ON public.darkweb_alerts(category);
CREATE INDEX IF NOT EXISTS idx_darkweb_alerts_severity ON public.darkweb_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_darkweb_alerts_status   ON public.darkweb_alerts(status);
CREATE INDEX IF NOT EXISTS idx_darkweb_alerts_detected ON public.darkweb_alerts(detected_at DESC);

ALTER TABLE public.darkweb_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "darkweb_alerts: auth read"   ON public.darkweb_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "darkweb_alerts: auth write"  ON public.darkweb_alerts FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "darkweb_alerts: anon read"   ON public.darkweb_alerts FOR SELECT TO anon          USING (true);
CREATE POLICY "darkweb_alerts: anon insert" ON public.darkweb_alerts FOR INSERT TO anon          WITH CHECK (true);
