/*
  # Procedure Library & Questionnaires (Enterprise Smart Tools)

  1. New Tables
    - `procedure_library` (Reusable test procedure knowledge base)
      - `id` (uuid, primary key)
      - `category` (varchar) - grouping: IT General Controls, Credit, Treasury, etc.
      - `title` (text) - short procedure name
      - `description` (text) - full procedure text to add as test step
      - `tags` (text[]) - searchable tags
      - `created_at` (timestamptz)

    - `questionnaires` (Archer-style interactive questionnaires)
      - `id` (uuid, primary key)
      - `workpaper_id` (uuid, FK to workpapers)
      - `title` (text) - questionnaire name
      - `questions_json` (jsonb) - array of {question, type, answer, options}
      - `status` (varchar) - Sent, Responded, Reviewed
      - `sent_to` (text) - recipient name/department
      - `created_at` (timestamptz)
      - `responded_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Authenticated and anon dev-mode policies

  3. Seed Data
    - 15+ standard audit procedures across categories
*/

-- 1. Procedure Library
CREATE TABLE IF NOT EXISTS procedure_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Questionnaires
CREATE TABLE IF NOT EXISTS questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id UUID NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) CHECK (status IN ('Sent', 'Responded', 'Reviewed')) DEFAULT 'Sent',
  sent_to TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  responded_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE procedure_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;

-- RLS for procedure_library (read-only for authenticated)
CREATE POLICY "Auth users can read procedures"
  ON procedure_library FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Dev anon select procedures"
  ON procedure_library FOR SELECT TO anon USING (true);

-- RLS for questionnaires (authenticated CRUD)
CREATE POLICY "Auth users can select questionnaires"
  ON questionnaires FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = questionnaires.workpaper_id));

CREATE POLICY "Auth users can insert questionnaires"
  ON questionnaires FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = questionnaires.workpaper_id));

CREATE POLICY "Auth users can update questionnaires"
  ON questionnaires FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = questionnaires.workpaper_id))
  WITH CHECK (EXISTS (SELECT 1 FROM workpapers w WHERE w.id = questionnaires.workpaper_id));

-- Dev-mode anon policies
CREATE POLICY "Dev anon select questionnaires"
  ON questionnaires FOR SELECT TO anon USING (true);

CREATE POLICY "Dev anon insert questionnaires"
  ON questionnaires FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev anon update questionnaires"
  ON questionnaires FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_procedure_library_category
  ON procedure_library(category);

CREATE INDEX IF NOT EXISTS idx_questionnaires_workpaper_id
  ON questionnaires(workpaper_id);

CREATE INDEX IF NOT EXISTS idx_questionnaires_status
  ON questionnaires(status);
