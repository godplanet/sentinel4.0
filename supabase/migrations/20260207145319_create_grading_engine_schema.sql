/*
  # Grading Engine Schema Extensions

  1. Modified Tables
    - `audit_engagements`
      - `base_score` (numeric) - Starting score before deductions (always 100)
      - `total_deductions` (numeric) - Sum of all finding-based deductions
      - `final_score` (numeric) - Score after deductions and capping
      - `final_grade` (text) - Letter grade A+ through F
      - `assurance_opinion` (text) - TAM_GUVENCE, MAKUL_GUVENCE, SINIRLI_GUVENCE, GUVENCE_YOK
      - `capping_triggered` (boolean) - Whether a capping rule fired
      - `capping_reason` (text) - Human-readable capping explanation
      - `risk_weight_factor` (numeric) - Entity risk weight for group consolidation
      - `grading_breakdown` (jsonb) - Full deduction waterfall detail

    - `methodology_configs`
      - `grading_rules` (jsonb) - Parametric grading constitution

  2. New Views
    - `view_group_consolidation` - Risk-weighted average across engagements

  3. Security
    - Dev-mode permissive policies on new columns (inherited from existing table RLS)
*/

-- =============================================
-- A. Extend audit_engagements with grading columns
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'base_score'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN base_score numeric DEFAULT 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'total_deductions'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN total_deductions numeric DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'final_score'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN final_score numeric DEFAULT 100;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'final_grade'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN final_grade text DEFAULT 'A+';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'assurance_opinion'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN assurance_opinion text DEFAULT 'TAM_GUVENCE';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'capping_triggered'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN capping_triggered boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'capping_reason'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN capping_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'risk_weight_factor'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN risk_weight_factor numeric DEFAULT 1.0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'grading_breakdown'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN grading_breakdown jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- =============================================
-- B. Add grading_rules column to methodology_configs
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'methodology_configs' AND column_name = 'grading_rules'
  ) THEN
    ALTER TABLE methodology_configs ADD COLUMN grading_rules jsonb;
  END IF;
END $$;

-- =============================================
-- C. Group Consolidation View (Risk-Weighted Average)
-- =============================================
CREATE OR REPLACE VIEW view_group_consolidation AS
SELECT
  ae.tenant_id,
  ae.plan_id,
  COUNT(*) AS engagement_count,
  ROUND(
    SUM(COALESCE(ae.final_score, 100) * COALESCE(ae.risk_weight_factor, 1.0))
    / NULLIF(SUM(COALESCE(ae.risk_weight_factor, 1.0)), 0),
    2
  ) AS weighted_average_score,
  ROUND(AVG(COALESCE(ae.final_score, 100)), 2) AS simple_average_score,
  SUM(CASE WHEN ae.capping_triggered = true THEN 1 ELSE 0 END) AS capped_count,
  SUM(COALESCE(ae.risk_weight_factor, 1.0)) AS total_risk_weight,
  MIN(ae.final_score) AS min_score,
  MAX(ae.final_score) AS max_score
FROM audit_engagements ae
WHERE ae.status IN ('completed', 'finalized', 'closed')
GROUP BY ae.tenant_id, ae.plan_id;

-- =============================================
-- D. Index for grading queries
-- =============================================
CREATE INDEX IF NOT EXISTS idx_audit_engagements_final_score
  ON audit_engagements (tenant_id, plan_id, final_score);

CREATE INDEX IF NOT EXISTS idx_audit_findings_engagement_severity
  ON audit_findings (engagement_id, severity);
