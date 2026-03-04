/*
  SLA Escalation Engine — Adil (Nuanced) Motor
  Tavan CAE (Level 3). Yönetim kurulu seviyesi kaldırıldı.
  DDL only; seed data in seed.sql or separate seeder if needed.
*/

-- =============================================================================
-- 1. sla_policies
--    severity: CRITICAL | HIGH | MEDIUM | LOW (actions.priority ile eşleşir)
--    target_level: 1 = Manager, 2 = Director, 3 = CAE (tavan)
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.sla_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  severity text NOT NULL
    CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  max_delay_days int NOT NULL CHECK (max_delay_days >= 0),
  target_level int NOT NULL CHECK (target_level IN (1, 2, 3)),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, severity)
);

COMMENT ON TABLE public.sla_policies IS 'SLA toleransları: severity bazlı max gecikme günü ve hedef seviye (1=Manager, 2=Director, 3=CAE).';
COMMENT ON COLUMN public.sla_policies.target_level IS '1=Manager, 2=Director, 3=CAE (tavan).';

-- =============================================================================
-- 2. escalation_logs
--    CAE kararı: PENDING | TOLERATED | COMMITTEE_FLAGGED
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.escalation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  action_id uuid NOT NULL,
  escalation_level int NOT NULL CHECK (escalation_level IN (1, 2, 3)),
  triggered_at timestamptz NOT NULL DEFAULT now(),
  cae_decision text NOT NULL DEFAULT 'PENDING'
    CHECK (cae_decision IN ('PENDING', 'TOLERATED', 'COMMITTEE_FLAGGED')),
  justification text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.escalation_logs IS 'SLA ihlali eskalasyon kayıtları; CAE kararı burada tutulur.';
COMMENT ON COLUMN public.escalation_logs.cae_decision IS 'PENDING=beklemede, TOLERATED=mazeret kabul, COMMITTEE_FLAGGED=YK raporuna çekilecek.';

CREATE INDEX IF NOT EXISTS idx_escalation_logs_tenant_action
  ON public.escalation_logs (tenant_id, action_id);
CREATE INDEX IF NOT EXISTS idx_escalation_logs_cae_pending
  ON public.escalation_logs (escalation_level, cae_decision)
  WHERE cae_decision = 'PENDING';

-- =============================================================================
-- 3. RLS
-- =============================================================================

ALTER TABLE public.sla_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sla_policies_select" ON public.sla_policies;
CREATE POLICY "sla_policies_select"
  ON public.sla_policies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "sla_policies_select_anon" ON public.sla_policies;
CREATE POLICY "sla_policies_select_anon"
  ON public.sla_policies FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "escalation_logs_select" ON public.escalation_logs;
CREATE POLICY "escalation_logs_select"
  ON public.escalation_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "escalation_logs_select_anon" ON public.escalation_logs;
CREATE POLICY "escalation_logs_select_anon"
  ON public.escalation_logs FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "escalation_logs_insert" ON public.escalation_logs;
CREATE POLICY "escalation_logs_insert"
  ON public.escalation_logs FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "escalation_logs_insert_anon" ON public.escalation_logs;
CREATE POLICY "escalation_logs_insert_anon"
  ON public.escalation_logs FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "escalation_logs_update" ON public.escalation_logs;
CREATE POLICY "escalation_logs_update"
  ON public.escalation_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "escalation_logs_update_anon" ON public.escalation_logs;
CREATE POLICY "escalation_logs_update_anon"
  ON public.escalation_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
