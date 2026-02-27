/*
  # Audit Grading System

  ## Overview
  Implements the constitutional requirement for automated audit grading.
  The system calculates audit grades based on findings severity and
  methodology settings, following a hybrid deduction model.

  ## Key Features
  1. **Base 100 Grading**: Start at 100, deduct points for findings
  2. **Limiting Rule**: 1 Critical finding → Max grade is 60 (D)
  3. **Severity-Based Deductions**: Configurable deduction points per severity
  4. **Auto-Calculation**: Triggers automatically when findings change
  5. **Letter Grades**: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)

  ## Changes
  1. New Columns
     - `audit_engagements.calculated_grade`: Numeric grade (0-100)
     - `audit_engagements.letter_grade`: Letter representation (A-F)
     - `audit_engagements.grade_limited_by`: Reason if grade was capped

  2. Grading Configuration Table
     - `grading_methodology`: Stores deduction rules per severity

  3. Functions
     - `calculate_engagement_grade()`: Main grading calculation
     - `apply_grading_limits()`: Applies limiting rules (critical finding cap)
     - `update_engagement_grade()`: Trigger function for auto-grading

  4. Triggers
     - Auto-recalculate grade when findings are added/updated/deleted

  ## Grading Logic
  1. Start with base score of 100
  2. Deduct points for each finding based on severity:
     - CRITICAL: -25 points
     - HIGH: -15 points
     - MEDIUM: -8 points
     - LOW: -3 points
     - OBSERVATION: -1 point
  3. Apply limiting rules:
     - If 1+ CRITICAL finding exists → Max grade is 60
  4. Convert to letter grade
*/

-- =====================================================
-- 1. ADD GRADING COLUMNS TO AUDIT_ENGAGEMENTS
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'calculated_grade'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN calculated_grade numeric(5,2) DEFAULT 100.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'letter_grade'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN letter_grade text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'grade_limited_by'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN grade_limited_by text;
  END IF;
END $$;

-- Add check constraint for valid letter grades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_letter_grade'
  ) THEN
    ALTER TABLE audit_engagements 
    ADD CONSTRAINT valid_letter_grade 
    CHECK (letter_grade IN ('A', 'B', 'C', 'D', 'F') OR letter_grade IS NULL);
  END IF;
END $$;

-- =====================================================
-- 2. GRADING METHODOLOGY CONFIGURATION TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS grading_methodology (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  severity text NOT NULL,
  deduction_points numeric(5,2) NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_grading_severity CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OBSERVATION')),
  CONSTRAINT unique_tenant_severity UNIQUE (tenant_id, severity)
);

-- Default grading methodology (will be applied per tenant)
CREATE INDEX idx_grading_methodology_tenant ON grading_methodology(tenant_id);
CREATE INDEX idx_grading_methodology_severity ON grading_methodology(severity);

-- =====================================================
-- 3. MAIN GRADING CALCULATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_engagement_grade(
  p_engagement_id uuid
)
RETURNS TABLE (
  grade numeric,
  letter text,
  limited_by text
) AS $$
DECLARE
  v_base_score numeric := 100.00;
  v_total_deductions numeric := 0.00;
  v_final_grade numeric;
  v_letter_grade text;
  v_limit_reason text := NULL;
  v_has_critical boolean := false;
  v_tenant_id uuid;
BEGIN
  -- Get tenant_id for this engagement
  SELECT ae.tenant_id INTO v_tenant_id
  FROM audit_engagements ae
  WHERE ae.id = p_engagement_id;

  -- Check if there are any CRITICAL findings
  SELECT EXISTS(
    SELECT 1 FROM audit_findings
    WHERE engagement_id = p_engagement_id
    AND severity = 'CRITICAL'
    AND status != 'REMEDIATED'
  ) INTO v_has_critical;

  -- Calculate deductions based on findings and methodology
  SELECT COALESCE(SUM(
    CASE af.severity
      WHEN 'CRITICAL' THEN COALESCE(gm.deduction_points, 25)
      WHEN 'HIGH' THEN COALESCE(gm.deduction_points, 15)
      WHEN 'MEDIUM' THEN COALESCE(gm.deduction_points, 8)
      WHEN 'LOW' THEN COALESCE(gm.deduction_points, 3)
      WHEN 'OBSERVATION' THEN COALESCE(gm.deduction_points, 1)
      ELSE 0
    END
  ), 0) INTO v_total_deductions
  FROM audit_findings af
  LEFT JOIN grading_methodology gm 
    ON gm.severity = af.severity 
    AND gm.tenant_id = v_tenant_id
    AND gm.is_active = true
  WHERE af.engagement_id = p_engagement_id
  AND af.status != 'REMEDIATED';

  -- Calculate final grade
  v_final_grade := v_base_score - v_total_deductions;

  -- Apply limiting rule: Critical finding caps grade at 60
  IF v_has_critical AND v_final_grade > 60 THEN
    v_final_grade := 60;
    v_limit_reason := 'Grade capped at 60 (D) due to CRITICAL finding(s)';
  END IF;

  -- Ensure grade doesn't go below 0
  IF v_final_grade < 0 THEN
    v_final_grade := 0;
  END IF;

  -- Convert to letter grade
  v_letter_grade := CASE
    WHEN v_final_grade >= 90 THEN 'A'
    WHEN v_final_grade >= 80 THEN 'B'
    WHEN v_final_grade >= 70 THEN 'C'
    WHEN v_final_grade >= 60 THEN 'D'
    ELSE 'F'
  END;

  RETURN QUERY SELECT v_final_grade, v_letter_grade, v_limit_reason;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. AUTO-UPDATE GRADE TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_engagement_grade()
RETURNS TRIGGER AS $$
DECLARE
  v_engagement_id uuid;
  v_grade_result RECORD;
BEGIN
  -- Determine engagement_id from trigger context
  IF TG_OP = 'DELETE' THEN
    v_engagement_id := OLD.engagement_id;
  ELSE
    v_engagement_id := NEW.engagement_id;
  END IF;

  -- Calculate new grade
  SELECT * INTO v_grade_result
  FROM calculate_engagement_grade(v_engagement_id);

  -- Update engagement with new grade
  UPDATE audit_engagements
  SET 
    calculated_grade = v_grade_result.grade,
    letter_grade = v_grade_result.letter,
    grade_limited_by = v_grade_result.limited_by,
    updated_at = now()
  WHERE id = v_engagement_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. ATTACH TRIGGERS TO AUDIT_FINDINGS
-- =====================================================

DROP TRIGGER IF EXISTS trg_update_grade_on_finding_change ON audit_findings;
CREATE TRIGGER trg_update_grade_on_finding_change
AFTER INSERT OR UPDATE OR DELETE ON audit_findings
FOR EACH ROW
EXECUTE FUNCTION update_engagement_grade();

-- =====================================================
-- 6. ROW LEVEL SECURITY FOR GRADING_METHODOLOGY
-- =====================================================

ALTER TABLE grading_methodology ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view grading methodology in tenant"
  ON grading_methodology FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create grading methodology"
  ON grading_methodology FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update grading methodology"
  ON grading_methodology FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete grading methodology"
  ON grading_methodology FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- 7. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN audit_engagements.calculated_grade IS
  'Auto-calculated numeric grade (0-100) based on findings severity and methodology settings';

COMMENT ON COLUMN audit_engagements.letter_grade IS
  'Letter grade representation: A (90-100), B (80-89), C (70-79), D (60-69), F (<60)';

COMMENT ON COLUMN audit_engagements.grade_limited_by IS
  'Reason if grade was capped by limiting rules (e.g., Critical finding present)';

COMMENT ON TABLE grading_methodology IS
  'Configurable deduction points per finding severity for tenant-specific grading methodology';

COMMENT ON FUNCTION calculate_engagement_grade IS
  'Calculates audit grade based on findings and applies limiting rules (e.g., Critical finding cap at 60)';
