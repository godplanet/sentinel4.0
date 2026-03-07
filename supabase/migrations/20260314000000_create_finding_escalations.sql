-- ============================================================================
-- MIGRATION: Wave 14 - CAE Escalation Desk (Finding-based)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  finding_id uuid NOT NULL REFERENCES public.audit_findings(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'REVIEWING' CHECK (status IN ('REVIEWING', 'ESCALATED_TO_BOARD', 'RETURNED_FOR_ACTION', 'CLOSED')),
  escalation_level text NOT NULL DEFAULT 'CAE' CHECK (escalation_level IN ('CAE', 'AUDIT_COMMITTEE', 'BOARD_OF_DIRECTORS')),
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.escalation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  escalation_id uuid NOT NULL REFERENCES public.escalations(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  actor_id uuid NOT NULL,
  action_type text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "escalations_select_anon" ON public.escalations FOR SELECT TO anon USING (true);
CREATE POLICY "escalations_select" ON public.escalations FOR SELECT TO authenticated USING (true);
CREATE POLICY "escalations_insert_anon" ON public.escalations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "escalations_insert" ON public.escalations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "escalations_update_anon" ON public.escalations FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "escalations_update" ON public.escalations FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "escalation_logs_select_anon" ON public.escalation_logs FOR SELECT TO anon USING (true);
CREATE POLICY "escalation_logs_select" ON public.escalation_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "escalation_logs_insert_anon" ON public.escalation_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "escalation_logs_insert" ON public.escalation_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "escalation_logs_update_anon" ON public.escalation_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "escalation_logs_update" ON public.escalation_logs FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
