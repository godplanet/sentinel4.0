/*
  # Add Sentinel Office columns for embedded spreadsheet and document editing

  1. Modified Tables
    - `workpapers`
      - `spreadsheet_data` (jsonb) - Stores the Excel-like grid state (cells, formulas, column/row config)
    - `reports`
      - `smart_content` (jsonb) - Stores the rich text document state with smart variable placeholders

  2. Important Notes
    - Both columns are nullable JSONB for flexible schema
    - Existing rows remain unaffected (NULL default)
    - No destructive operations
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'spreadsheet_data'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN spreadsheet_data jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'smart_content'
  ) THEN
    ALTER TABLE reports ADD COLUMN smart_content jsonb;
  END IF;
END $$;
