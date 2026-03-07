-- =============================================================================
-- WAVE 60: Red Team & BAS (Breach and Attack Simulation) Tracker
-- =============================================================================
-- Tables:
--   red_team_campaigns  — Sızma testleri, phishing simülasyonları ve BAS kampanyaları
--   bas_attack_logs     — Her bir kampanya altındaki tekil saldırı/sömürü denemeleri
-- =============================================================================

-- 1. RED TEAM CAMPAIGNS — Ana Kampanya Tablosu
CREATE TABLE IF NOT EXISTS public.red_team_campaigns (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  campaign_code       text NOT NULL UNIQUE,
  title               text NOT NULL,
  description         text,
  campaign_type       text NOT NULL DEFAULT 'PHISHING' 
    CHECK (campaign_type IN ('PHISHING', 'BAS', 'PEN_TEST', 'PHYSICAL_BREACH', 'SOCIAL_ENGINEERING')),
  status              text NOT NULL DEFAULT 'PLANNED'
    CHECK (status IN ('PLANNED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELED')),
  severity            text NOT NULL DEFAULT 'HIGH'
    CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  target_systems      text[] NOT NULL DEFAULT '{}',   -- Hedeflenen sistemler/uygulamalar
  start_date          timestamptz,
  end_date            timestamptz,
  success_rate        numeric(5,2),                   -- Başarı oranı (ör: Oltaya düşenler / Toplam)
  lead_operator       text NOT NULL DEFAULT '',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_red_team_campaigns_tenant ON public.red_team_campaigns(tenant_id);
CREATE INDEX IF NOT EXISTS idx_red_team_campaigns_status ON public.red_team_campaigns(status);
ALTER TABLE public.red_team_campaigns DISABLE ROW LEVEL SECURITY;


-- 2. BAS ATTACK LOGS — Tekil Saldırı Denemesi Logları
CREATE TABLE IF NOT EXISTS public.bas_attack_logs (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  campaign_id         uuid NOT NULL REFERENCES public.red_team_campaigns(id) ON DELETE CASCADE,
  attack_vector       text NOT NULL,                  -- Ör: "Credential Harvesting", "Lateral Movement"
  target_asset        text NOT NULL,                  -- Etkilenen IP, e-posta veya sunucu
  status              text NOT NULL DEFAULT 'ATTEMPTED'
    CHECK (status IN ('ATTEMPTED', 'SUCCESS', 'BLOCKED', 'DETECTED', 'IGNORED')),
  timestamp           timestamptz NOT NULL DEFAULT now(),
  mitre_tactic        text,                           -- Ör: "TA0001 - Initial Access"
  mitre_technique     text,                           -- Ör: "T1566 - Phishing"
  finding_details     text,                           -- Saldırı detayları / payload bilgisi
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bas_attack_logs_campaign ON public.bas_attack_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_bas_attack_logs_status   ON public.bas_attack_logs(status);
ALTER TABLE public.bas_attack_logs DISABLE ROW LEVEL SECURITY;
