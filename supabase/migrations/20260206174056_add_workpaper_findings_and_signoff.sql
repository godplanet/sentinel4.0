/*
  # Workpaper Findings and Sign-off Workflow

  1. New Tables
    - `workpaper_findings`
      - `id` (uuid, primary key)
      - `workpaper_id` (uuid, foreign key to workpapers)
      - `title` (text, not null)
      - `description` (text)
      - `severity` (varchar: CRITICAL|HIGH|MEDIUM|LOW)
      - `source_ref` (text) - reference to test step or evidence
      - `created_at` (timestamptz)

  2. Changes to workpapers
    - Add `prepared_by_user_id` (uuid)
    - Add `prepared_at` (timestamptz)
    - Add `reviewed_by_user_id` (uuid)
    - Add `reviewed_at` (timestamptz)
    - Add `approval_status` (varchar: in_progress|prepared|reviewed)

  3. Security
    - Enable RLS on workpaper_findings
    - Add policies for authenticated users to manage findings
    - Dev-mode anon policies for testing
*/

-- Create workpaper_findings table
CREATE TABLE IF NOT EXISTS workpaper_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id UUID NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  severity VARCHAR(20) CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')) DEFAULT 'MEDIUM',
  source_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add sign-off columns to workpapers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'prepared_by_user_id'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN prepared_by_user_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'prepared_at'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN prepared_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'reviewed_by_user_id'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN reviewed_by_user_id UUID;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'reviewed_at'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN approval_status VARCHAR(20)
      CHECK (approval_status IN ('in_progress', 'prepared', 'reviewed'))
      DEFAULT 'in_progress';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE workpaper_findings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workpaper_findings (match pattern of existing tables)

CREATE POLICY "Authenticated users can select workpaper_findings"
  ON workpaper_findings FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_findings.workpaper_id));

CREATE POLICY "Authenticated users can insert workpaper_findings"
  ON workpaper_findings FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_findings.workpaper_id));

CREATE POLICY "Authenticated users can update workpaper_findings"
  ON workpaper_findings FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_findings.workpaper_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_findings.workpaper_id));

CREATE POLICY "Authenticated users can delete workpaper_findings"
  ON workpaper_findings FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = workpaper_findings.workpaper_id));

-- Dev-mode anon policies for testing
CREATE POLICY "Dev anon select workpaper_findings"
  ON workpaper_findings FOR SELECT TO anon USING (true);

CREATE POLICY "Dev anon insert workpaper_findings"
  ON workpaper_findings FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev anon update workpaper_findings"
  ON workpaper_findings FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Dev anon delete workpaper_findings"
  ON workpaper_findings FOR DELETE TO anon USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workpaper_findings_workpaper_id
  ON workpaper_findings(workpaper_id);

CREATE INDEX IF NOT EXISTS idx_workpaper_findings_severity
  ON workpaper_findings(severity);

-- Add sample findings data
DO $$
DECLARE
  v_wp_id UUID;
BEGIN
  SELECT id INTO v_wp_id FROM workpapers LIMIT 1;

  IF v_wp_id IS NOT NULL THEN
    INSERT INTO workpaper_findings (workpaper_id, title, description, severity, source_ref) VALUES
      (v_wp_id, 'Eksik Teminat Değerlemesi', '2 kredi dosyasında teminat değerlemesinin 6 aydan eski olduğu tespit edilmiştir. BDDK düzenlemelerine göre yıllık güncelleme zorunludur.', 'HIGH', 'Test Step 2'),
      (v_wp_id, 'Dosya Eksikliği', 'İncelenen 25 dosyanın 2 tanesinde zorunlu kredi başvuru formlarının eksik olduğu görülmüştür.', 'MEDIUM', 'Test Step 1');
  END IF;
END $$;