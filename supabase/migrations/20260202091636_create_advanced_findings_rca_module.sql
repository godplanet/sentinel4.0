/*
  # MODÜL 4.2: Gelişmiş Bulgu ve RCA Altyapısı

  ## Overview
  This migration enhances the audit findings system with:
  - Root Cause Analysis (5 Whys methodology)
  - Multi-dimensional Impact Assessment (Financial, Operational, Reputational)
  - AI-powered analysis and suggestions
  - Assignment and remediation tracking
  - Evidence chain integrity controls

  ## New Columns in `audit_findings`
  
  ### 1. details (JSONB)
  Flexible structured data containing:
  - **condition**: Current state/what was found
  - **criteria**: Expected state/regulatory requirement
  - **root_cause**: 
    - category: People | Process | Technology
    - method: 5_WHYS
    - whys: Array of 5 questions in the chain
    - description: Final root cause description
  - **impact**:
    - financial: Numeric impact
    - operational: Low | Medium | High | Critical
    - reputational: Low | Medium | High | Critical
  - **ai_analysis**:
    - suggestion: AI-generated recommendation
    - confidence: 0-100 confidence score

  ### 2. assigned_to (UUID)
  User responsible for remediation/closure

  ### 3. remediation_date (TIMESTAMPTZ)
  Target completion date for remediation

  ## Security
  - Enhanced constraint on evidence_chain to ensure hash integrity
  - All new columns follow existing RLS policies

  ## Notes
  - Uses JSONB for flexibility and performance
  - 5 Whys methodology aligns with IIA standards
  - Impact categories support GIAS 2024 framework
*/

-- 1. Add details JSONB column with structured default
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'details'
  ) THEN
    ALTER TABLE public.audit_findings
    ADD COLUMN details JSONB DEFAULT '{
      "condition": "",
      "criteria": "",
      "root_cause": {
        "category": "Process",
        "method": "5_WHYS",
        "whys": ["", "", "", "", ""],
        "description": ""
      },
      "impact": {
        "financial": 0,
        "operational": "Low",
        "reputational": "Low"
      },
      "ai_analysis": {
        "suggestion": "",
        "confidence": 0
      }
    }'::jsonb;
  END IF;
END $$;

-- 2. Add assignment and remediation tracking columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE public.audit_findings
    ADD COLUMN assigned_to UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'remediation_date'
  ) THEN
    ALTER TABLE public.audit_findings
    ADD COLUMN remediation_date TIMESTAMPTZ;
  END IF;
END $$;

-- 3. Add hash integrity constraint to evidence_chain
DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'check_hash_presence'
    AND table_name = 'evidence_chain'
  ) THEN
    -- Check if the column exists first
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'evidence_chain' AND column_name = 'sha256_hash'
    ) THEN
      ALTER TABLE public.evidence_chain
      ADD CONSTRAINT check_hash_presence CHECK (length(sha256_hash) > 0);
    END IF;
  END IF;
END $$;

-- 4. Create helper function to validate 5 Whys structure
CREATE OR REPLACE FUNCTION validate_five_whys(details JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if root_cause exists and has required fields
  IF NOT (details ? 'root_cause') THEN
    RETURN FALSE;
  END IF;
  
  -- Check if whys array has 5 elements
  IF jsonb_array_length(details->'root_cause'->'whys') != 5 THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 5. Add comment for documentation
COMMENT ON COLUMN public.audit_findings.details IS 
'JSONB structure containing: condition, criteria, root_cause (5 Whys), impact (financial/operational/reputational), and ai_analysis';

COMMENT ON COLUMN public.audit_findings.assigned_to IS 
'UUID of user responsible for remediation/closure of this finding';

COMMENT ON COLUMN public.audit_findings.remediation_date IS 
'Target completion date for remediation actions';
