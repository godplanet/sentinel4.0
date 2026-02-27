/*
  # Add metadata columns to m6_reports

  ## Summary
  Adds report_type, risk_level, and auditor_name columns to the m6_reports table
  to enable proper display, filtering, and categorization in the Report Library.

  ## Changes to m6_reports
  - `report_type` (text, nullable): Template type — blank, investigation, branch_audit, compliance, executive
  - `risk_level` (text, nullable): Derived risk level — critical, high, medium, low
  - `auditor_name` (text, nullable): Name of the lead auditor
  - `finding_count` (integer, default 0): Total number of findings in this report
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'm6_reports' AND column_name = 'report_type'
  ) THEN
    ALTER TABLE m6_reports ADD COLUMN report_type text DEFAULT 'blank';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'm6_reports' AND column_name = 'risk_level'
  ) THEN
    ALTER TABLE m6_reports ADD COLUMN risk_level text DEFAULT 'medium';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'm6_reports' AND column_name = 'auditor_name'
  ) THEN
    ALTER TABLE m6_reports ADD COLUMN auditor_name text DEFAULT 'Denetçi';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'm6_reports' AND column_name = 'finding_count'
  ) THEN
    ALTER TABLE m6_reports ADD COLUMN finding_count integer DEFAULT 0;
  END IF;
END $$;
