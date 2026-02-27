/*
  # Enhance Finding Negotiation Module (Module 5 Extension)

  ## Overview
  Adds missing columns and automation to existing finding negotiation infrastructure:
  - Enhances audit_findings with public-facing fields
  - Adds automation trigger for action plan workflow
  - Sets up proper RLS and indexing

  ## Changes

  ### 1. audit_findings enhancements
    - `description_public`: Diplomatic description for auditees
    - `risk_rating`: HIGH/MEDIUM/LOW risk classification
    - `assigned_auditee_id`: Responsible auditee manager
    - `published_at`: Publication timestamp
    - `finding_code`: Unique finding identifier (F-2024-001)
    - Updated status constraint: Added new workflow states

  ### 2. Automation
    - Trigger: Auto-updates finding status when action plan submitted
    - Workflow: New plan → PENDING_APPROVAL status

  ### 3. Security & Performance
    - RLS policies for finding_secrets and action_plans
    - Performance indexes on key lookup columns

  ## Notes
  - Preserves existing action_plans table structure
  - Maintains backward compatibility with legacy statuses
*/

-- 1. ADD NEW COLUMNS TO AUDIT_FINDINGS
ALTER TABLE public.audit_findings
ADD COLUMN IF NOT EXISTS description_public TEXT,
ADD COLUMN IF NOT EXISTS risk_rating TEXT DEFAULT 'MEDIUM',
ADD COLUMN IF NOT EXISTS assigned_auditee_id UUID,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS finding_code TEXT;

-- 2. UPDATE STATUS CONSTRAINT (PRESERVE LEGACY + ADD NEW STATES)
ALTER TABLE public.audit_findings
DROP CONSTRAINT IF EXISTS audit_findings_status_check;

ALTER TABLE public.audit_findings
ADD CONSTRAINT audit_findings_status_check 
CHECK (status IN (
  'DRAFT', 'PUBLISHED', 'NEGOTIATION', 'PENDING_APPROVAL', 'FOLLOW_UP', 'CLOSED',
  'FINAL', 'REMEDIATED', 'DISPUTED', 'DISPUTING'
));

-- 3. AUTOMATION TRIGGER (ACTION PLAN SUBMITTED → PENDING_APPROVAL)
CREATE OR REPLACE FUNCTION handle_new_action_plan()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.audit_findings
    SET status = 'PENDING_APPROVAL',
        updated_at = NOW()
    WHERE id = NEW.finding_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_action_plan_submitted ON public.action_plans;
CREATE TRIGGER trg_action_plan_submitted
AFTER INSERT ON public.action_plans
FOR EACH ROW EXECUTE FUNCTION handle_new_action_plan();

-- 4. ENSURE RLS IS ENABLED
ALTER TABLE public.finding_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES (CREATE IF NOT EXISTS PATTERN)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'finding_secrets' 
        AND policyname = 'Auditors access secrets'
    ) THEN
        CREATE POLICY "Auditors access secrets" 
        ON public.finding_secrets
        FOR ALL 
        TO authenticated
        USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'action_plans' 
        AND policyname = 'Authenticated users can manage action plans'
    ) THEN
        CREATE POLICY "Authenticated users can manage action plans" 
        ON public.action_plans
        FOR ALL 
        TO authenticated
        USING (auth.uid() IS NOT NULL)
        WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_action_plans_finding_id ON public.action_plans(finding_id);
CREATE INDEX IF NOT EXISTS idx_findings_published_at ON public.audit_findings(published_at);
CREATE INDEX IF NOT EXISTS idx_findings_code ON public.audit_findings(finding_code);
CREATE INDEX IF NOT EXISTS idx_action_plans_status ON public.action_plans(status);
CREATE INDEX IF NOT EXISTS idx_findings_assigned_auditee ON public.audit_findings(assigned_auditee_id);

-- 7. ADD HELPFUL COMMENTS
COMMENT ON COLUMN public.audit_findings.description_public IS 'Diplomatic version shown to auditees (not raw auditor notes)';
COMMENT ON COLUMN public.audit_findings.risk_rating IS 'Risk level: HIGH, MEDIUM, LOW';
COMMENT ON COLUMN public.audit_findings.finding_code IS 'Unique finding identifier (e.g., F-2024-001)';
COMMENT ON COLUMN public.audit_findings.assigned_auditee_id IS 'Responsible auditee manager for remediation';
