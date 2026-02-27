/*
  # Create Scribbles Table (Sentinel Scribble - AI Auditor's Notebook)

  1. New Tables
    - `scribbles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content` (text) - raw notebook content
      - `is_processed` (boolean, default false) - whether AI magic has been applied
      - `linked_workpaper_id` (uuid, nullable) - optional link to current workpaper
      - `linked_context` (text, nullable) - page/route context when note was taken
      - `extracted_data` (jsonb, nullable) - AI extraction results
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `scribbles` table
    - Add policies for authenticated users to manage their own scribbles
    - Dev-mode permissive policy for testing
*/

CREATE TABLE IF NOT EXISTS scribbles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  content TEXT DEFAULT '',
  is_processed BOOLEAN DEFAULT false,
  linked_workpaper_id UUID,
  linked_context TEXT,
  extracted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scribbles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own scribbles"
  ON scribbles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scribbles"
  ON scribbles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scribbles"
  ON scribbles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scribbles"
  ON scribbles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scribbles' AND policyname = 'dev_mode_scribbles_select'
  ) THEN
    CREATE POLICY "dev_mode_scribbles_select" ON scribbles FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scribbles' AND policyname = 'dev_mode_scribbles_insert'
  ) THEN
    CREATE POLICY "dev_mode_scribbles_insert" ON scribbles FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scribbles' AND policyname = 'dev_mode_scribbles_update'
  ) THEN
    CREATE POLICY "dev_mode_scribbles_update" ON scribbles FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'scribbles' AND policyname = 'dev_mode_scribbles_delete'
  ) THEN
    CREATE POLICY "dev_mode_scribbles_delete" ON scribbles FOR DELETE TO anon USING (true);
  END IF;
END $$;
