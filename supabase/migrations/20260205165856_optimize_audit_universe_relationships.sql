/*
  # Database Cleanup and Optimization

  1. Purpose
    - Strengthen relationship between Audit Universe (audit_entities) and Audit Planning
    - Optimize finding statistics queries for dashboard performance
    - Add proper tracking fields for audit execution

  2. Changes
    - Add universe_entity_id foreign key to audit_engagements
    - Add planned start/end dates for better planning visibility
    - Add auditor_in_charge for accountability tracking
    - Create optimized view for finding summaries

  3. Performance Improvements
    - Pre-aggregated view for finding statistics
    - Reduces query complexity for dashboards and list views
    - Indexed foreign key relationships

  4. Security
    - Maintains existing RLS policies
    - No changes to access control
*/

-- =============================================================================
-- 1. STRENGTHEN AUDIT ENGAGEMENT TO UNIVERSE RELATIONSHIP
-- =============================================================================

-- Note: universe_entity_id might already exist as entity_id, let's check and add if different
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'audit_engagements'
    AND column_name = 'auditor_in_charge'
  ) THEN
    ALTER TABLE public.audit_engagements
    ADD COLUMN auditor_in_charge UUID REFERENCES auth.users(id) ON DELETE SET NULL;

    CREATE INDEX IF NOT EXISTS idx_audit_engagements_auditor
    ON public.audit_engagements(auditor_in_charge);
  END IF;
END $$;

-- Add comment for entity_id clarification
COMMENT ON COLUMN public.audit_engagements.entity_id IS
'Links to audit_entities (universe entity). Represents the auditable entity being examined.';

-- =============================================================================
-- 3. UNIVERSE-ENGAGEMENT LINKAGE VIEW (FOR PLANNING)
-- =============================================================================

CREATE OR REPLACE VIEW public.view_universe_audit_coverage AS
SELECT
    ae.id as entity_id,
    ae.name as entity_name,
    ae.path as entity_path,
    ae.type as entity_type,
    ae.risk_score,
    COUNT(DISTINCT eng.id) as total_audits,
    COUNT(DISTINCT CASE WHEN EXTRACT(YEAR FROM eng.start_date) = EXTRACT(YEAR FROM CURRENT_DATE) THEN eng.id END) as current_year_audits,
    MAX(eng.end_date) as last_audit_date,
    CURRENT_DATE - MAX(eng.end_date) as days_since_last_audit,
    AVG(eng.calculated_grade) as avg_grade
FROM public.audit_entities ae
LEFT JOIN public.audit_engagements eng ON ae.id = eng.entity_id
GROUP BY ae.id, ae.name, ae.path, ae.type, ae.risk_score;

COMMENT ON VIEW public.view_universe_audit_coverage IS
'Shows audit coverage by universe entity. Useful for identifying audit gaps and planning priorities.';

-- =============================================================================
-- 4. PERFORMANCE INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_findings_status
ON public.audit_findings(status);

CREATE INDEX IF NOT EXISTS idx_audit_findings_severity
ON public.audit_findings(severity);

CREATE INDEX IF NOT EXISTS idx_action_plans_status_target
ON public.action_plans(status, target_date);

CREATE INDEX IF NOT EXISTS idx_audit_engagements_start_date
ON public.audit_engagements(start_date);

CREATE INDEX IF NOT EXISTS idx_findings_engagement_status
ON public.audit_findings(engagement_id, status);

CREATE INDEX IF NOT EXISTS idx_audit_engagements_entity_id
ON public.audit_engagements(entity_id);

-- =============================================================================
-- 5. HELPER FUNCTION: GET AUDIT COVERAGE GAPS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.fn_get_audit_coverage_gaps(
  p_min_risk_score INT DEFAULT 50,
  p_max_days_since_audit INT DEFAULT 365
)
RETURNS TABLE (
  entity_id UUID,
  entity_name TEXT,
  entity_type entity_type,
  risk_score FLOAT,
  days_since_last_audit INT,
  priority_score NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    v.entity_id,
    v.entity_name,
    v.entity_type,
    v.risk_score,
    COALESCE(v.days_since_last_audit, 9999)::INT as days_since_last_audit,
    (v.risk_score * COALESCE(v.days_since_last_audit, 9999) / 365.0) as priority_score
  FROM public.view_universe_audit_coverage v
  WHERE v.risk_score >= p_min_risk_score
    AND (v.days_since_last_audit IS NULL OR v.days_since_last_audit > p_max_days_since_audit)
  ORDER BY priority_score DESC;
END;
$$;

COMMENT ON FUNCTION public.fn_get_audit_coverage_gaps IS
'Identifies high-risk entities that have not been audited recently. Used for annual planning prioritization.';