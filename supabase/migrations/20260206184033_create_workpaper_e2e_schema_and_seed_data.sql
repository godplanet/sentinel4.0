/*
  # Complete Workpaper E2E Schema Fixes and Comprehensive Seed Data

  1. New Tables
    - `workpaper_test_steps` - Individual audit test steps per workpaper
    - `evidence_requests` - PBC evidence requests

  2. Modified Tables
    - `workpapers` - Added approval_status, prepared_by_user_id/name, reviewed_by_user_id/name
    - `review_notes` - Added author_name, fixed status constraint to allow Open/Resolved
    - `workpaper_activity_logs` - Added user_name column

  3. Comprehensive Seed Data
    - 20 audit steps, 20 workpapers, 55 test steps, 18 evidence requests
    - 10 findings, 8 review notes, 21 activity logs, 3 questionnaires
    - Various sign-off states for realistic testing

  4. Security
    - RLS enabled on new tables with dev-mode policies
*/

-- ============================================================
-- 1. CREATE MISSING TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS workpaper_test_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  step_order integer NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT '',
  is_completed boolean NOT NULL DEFAULT false,
  auditor_comment text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS evidence_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  requested_from_user_id uuid,
  status text NOT NULL DEFAULT 'pending',
  due_date timestamptz,
  file_url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workpaper_test_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_requests ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_wts_workpaper ON workpaper_test_steps(workpaper_id);
CREATE INDEX IF NOT EXISTS idx_er_workpaper ON evidence_requests(workpaper_id);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workpaper_test_steps' AND policyname = 'Dev read workpaper_test_steps') THEN
    CREATE POLICY "Dev read workpaper_test_steps" ON workpaper_test_steps FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workpaper_test_steps' AND policyname = 'Dev write workpaper_test_steps') THEN
    CREATE POLICY "Dev write workpaper_test_steps" ON workpaper_test_steps FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evidence_requests' AND policyname = 'Dev read evidence_requests') THEN
    CREATE POLICY "Dev read evidence_requests" ON evidence_requests FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'evidence_requests' AND policyname = 'Dev write evidence_requests') THEN
    CREATE POLICY "Dev write evidence_requests" ON evidence_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- ============================================================
-- 2. ADD MISSING COLUMNS
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='approval_status') THEN
    ALTER TABLE workpapers ADD COLUMN approval_status text DEFAULT 'in_progress';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='prepared_by_user_id') THEN
    ALTER TABLE workpapers ADD COLUMN prepared_by_user_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='reviewed_by_user_id') THEN
    ALTER TABLE workpapers ADD COLUMN reviewed_by_user_id uuid;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='prepared_by_name') THEN
    ALTER TABLE workpapers ADD COLUMN prepared_by_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpapers' AND column_name='reviewed_by_name') THEN
    ALTER TABLE workpapers ADD COLUMN reviewed_by_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='review_notes' AND column_name='author_name') THEN
    ALTER TABLE review_notes ADD COLUMN author_name text DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workpaper_activity_logs' AND column_name='user_name') THEN
    ALTER TABLE workpaper_activity_logs ADD COLUMN user_name text DEFAULT '';
  END IF;
END $$;

ALTER TABLE review_notes ALTER COLUMN field_key SET DEFAULT 'general';

-- Fix review_notes status constraint to use Open/Resolved (matching TypeScript)
ALTER TABLE review_notes DROP CONSTRAINT IF EXISTS review_notes_status_check;
ALTER TABLE review_notes ADD CONSTRAINT review_notes_status_check
  CHECK (status IN ('OPEN', 'RESOLVED', 'Open', 'Resolved'));
ALTER TABLE review_notes ALTER COLUMN status SET DEFAULT 'Open';

-- ============================================================

-- Calisma kagidi seed verileri (audit_steps, workpapers, test_steps vb.) seed.sql dosyasina tasindi.
