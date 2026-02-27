/*
  # Add KERD-2026 Risk Dimension Columns to audit_findings

  1. Modified Tables
    - `audit_findings`
      - `impact_financial` (integer 1-5) - Financial impact dimension
      - `impact_legal` (integer 1-5) - Legal/regulatory impact
      - `impact_reputation` (integer 1-5) - Reputational impact
      - `impact_operational` (integer 1-5) - Operational impact
      - `control_effectiveness` (integer 1-5) - Control effectiveness score
      - `shariah_impact_score` (integer 1-5) - Shari'ah compliance impact
      - `cvss_score` (numeric, nullable) - CVSS score for cyber findings
      - `asset_criticality` (text) - Critical/Major/Minor
      - `calculated_score` (numeric) - Engine-calculated composite score
      - `final_severity` (text) - Engine-determined severity label
      - `is_veto_triggered` (boolean) - Whether a veto rule overrode the score
      - `sla_type` (text) - FIXED_DATE or AGILE_SPRINT

  2. Notes
    - Existing `impact_score` and `likelihood_score` columns are preserved
    - New columns use IF NOT EXISTS pattern to be safe
    - All new integer scores default to 1 (lowest risk)
    - `calculated_score` defaults to 0 until engine runs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'impact_financial'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN impact_financial integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'impact_legal'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN impact_legal integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'impact_reputation'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN impact_reputation integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'impact_operational'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN impact_operational integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'control_effectiveness'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN control_effectiveness integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'shariah_impact_score'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN shariah_impact_score integer NOT NULL DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'cvss_score'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN cvss_score numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'asset_criticality'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN asset_criticality text NOT NULL DEFAULT 'Minor';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'calculated_score'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN calculated_score numeric NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'final_severity'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN final_severity text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'is_veto_triggered'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN is_veto_triggered boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'sla_type'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN sla_type text NOT NULL DEFAULT 'FIXED_DATE';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_findings_kerd_score
  ON audit_findings (calculated_score DESC)
  WHERE calculated_score > 0;

CREATE INDEX IF NOT EXISTS idx_findings_kerd_severity
  ON audit_findings (final_severity)
  WHERE final_severity IS NOT NULL;
