/*
  # Create QAIP Checklists & Reviews Tables + Seed Data

  1. New Tables
    - `qaip_checklists`
      - `id` (uuid, primary key)
      - `title` (text) - checklist name
      - `description` (text) - purpose description
      - `criteria` (jsonb) - array of { id, text, weight } objects
      - `tenant_id` (uuid)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `qaip_reviews`
      - `id` (uuid, primary key)
      - `engagement_id` (uuid, nullable) - linked audit engagement
      - `reviewer_id` (uuid, nullable) - who performed the review
      - `checklist_id` (uuid) - references qaip_checklists
      - `results` (jsonb) - criteria evaluation results
      - `total_score` (integer) - computed compliance score
      - `status` (text) - IN_PROGRESS, COMPLETED, APPROVED
      - `notes` (text, nullable) - reviewer notes
      - `tenant_id` (uuid)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Dev-mode permissive policies for authenticated users

  3. Seed Data
    - 3 default checklists covering standard QAIP review criteria
    - 2 sample reviews for demonstration
*/

CREATE TABLE IF NOT EXISTS qaip_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE qaip_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read qaip_checklists"
  ON qaip_checklists FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert qaip_checklists"
  ON qaip_checklists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update qaip_checklists"
  ON qaip_checklists FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete qaip_checklists"
  ON qaip_checklists FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_checklists' AND policyname = 'Dev read qaip_checklists'
  ) THEN
    CREATE POLICY "Dev read qaip_checklists"
      ON qaip_checklists FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_checklists' AND policyname = 'Dev write qaip_checklists'
  ) THEN
    CREATE POLICY "Dev write qaip_checklists"
      ON qaip_checklists FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS qaip_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid,
  reviewer_id uuid,
  checklist_id uuid REFERENCES qaip_checklists(id),
  results jsonb DEFAULT '{}'::jsonb,
  total_score integer DEFAULT 0,
  status text DEFAULT 'IN_PROGRESS',
  notes text,
  tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE qaip_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read qaip_reviews"
  ON qaip_reviews FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert qaip_reviews"
  ON qaip_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update qaip_reviews"
  ON qaip_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete qaip_reviews"
  ON qaip_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_reviews' AND policyname = 'Dev read qaip_reviews'
  ) THEN
    CREATE POLICY "Dev read qaip_reviews"
      ON qaip_reviews FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'qaip_reviews' AND policyname = 'Dev write qaip_reviews'
  ) THEN
    CREATE POLICY "Dev write qaip_reviews"
      ON qaip_reviews FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- QAIP kontrol listesi ve inceleme seed verileri seed.sql dosyasina tasindi.
