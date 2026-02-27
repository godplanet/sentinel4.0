/*
  # Add approval_status column to workpapers table

  1. Modified Tables
    - `workpapers`
      - Added `approval_status` (text, default 'in_progress') - Tracks workpaper approval workflow state

  2. Notes
    - Column is needed by the Workpapers Grid page for inline status tracking
    - Existing rows get default value 'in_progress'
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN approval_status text DEFAULT 'in_progress';
  END IF;
END $$;