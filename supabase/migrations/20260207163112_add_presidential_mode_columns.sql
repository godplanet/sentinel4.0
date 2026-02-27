/*
  # Add Presidential Mode Columns

  1. Modified Tables
    - `reports`
      - `executive_summary_ai` (text) - AI-generated executive summary for board presentation
    - `workpapers`
      - `qa_score` (integer, default 0) - AI quality assurance score (0-100)
      - `qa_notes` (jsonb) - Structured AI quality findings and suggestions

  2. Important Notes
    - Uses IF NOT EXISTS checks for safe re-run
    - No data loss - only adds new nullable columns
    - qa_score defaults to 0 for new workpapers
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'executive_summary_ai'
  ) THEN
    ALTER TABLE reports ADD COLUMN executive_summary_ai text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'qa_score'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN qa_score integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'qa_notes'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN qa_notes jsonb;
  END IF;
END $$;
