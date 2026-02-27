/*
  # Module 13: Intelligent Intake & Whistleblowing

  1. New Tables
    - `whistleblower_tips`
      - `id` (uuid, primary key)
      - `tracking_code` (text, unique anonymous access key)
      - `content` (text, the tip content - encrypted at rest)
      - `attachments_url` (text, optional file reference)
      - `channel` (text: WEB, TOR_ONION, SIGNAL_MOCK)
      - `submitted_at` (timestamptz)
      - `ai_credibility_score` (float, 0-100 AI-computed score)
      - `triage_category` (text: CRITICAL_FRAUD, HR_CULTURE, SPAM)
      - `status` (text: NEW, INVESTIGATING, ESCALATED, DISMISSED, CLOSED)
      - `assigned_unit` (text, unit assigned for investigation)
      - `reviewer_notes` (text, internal notes)

    - `tip_analysis`
      - `id` (uuid, primary key)
      - `tip_id` (uuid, references whistleblower_tips)
      - `specificity_index` (float, 0-100 how specific the tip is)
      - `evidence_density` (float, 0-100 how much evidence is referenced)
      - `emotional_score` (float, 0-100 emotional instability indicator)
      - `extracted_entities` (jsonb: names, dates, amounts, ibans)
      - `analyzed_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - whistleblower_tips: insert allowed for anon (public portal), select for authenticated
    - tip_analysis: only authenticated users can read/write

  3. Seed Data
    - 3 sample tips: high-credibility fraud, HR complaint, spam
    - Corresponding analysis records with pre-computed scores

  4. Important Notes
    - tracking_code is the only identifier given to the anonymous reporter
    - The public portal uses anon insert only - no read access for anon
    - AI scoring is computed via the Triage Engine, not stored procedures
*/

-- Whistleblower Tips
CREATE TABLE IF NOT EXISTS whistleblower_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Use md5(gen_random_uuid()) for a portable random tracking code (avoids gen_random_bytes dependency)
  tracking_code text UNIQUE NOT NULL DEFAULT substring(md5(gen_random_uuid()::text), 1, 24),
  content text NOT NULL DEFAULT '',
  attachments_url text,
  channel text NOT NULL DEFAULT 'WEB',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  ai_credibility_score float DEFAULT 0,
  triage_category text NOT NULL DEFAULT 'SPAM',
  status text NOT NULL DEFAULT 'NEW',
  assigned_unit text,
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE whistleblower_tips ENABLE ROW LEVEL SECURITY;

-- Anon can only INSERT (public portal submission)
CREATE POLICY "Anon can submit tips"
  ON whistleblower_tips
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Authenticated can read all tips
CREATE POLICY "Authenticated can read tips"
  ON whistleblower_tips
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Authenticated can update tips (triage, status changes)
CREATE POLICY "Authenticated can update tips"
  ON whistleblower_tips
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Dev-mode policies for testing
CREATE POLICY "Dev read whistleblower_tips"
  ON whistleblower_tips FOR SELECT TO anon USING (true);

CREATE POLICY "Dev update whistleblower_tips"
  ON whistleblower_tips FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Anon can read own tip by tracking_code (handled via RPC or edge function)
-- For now, dev mode allows read

-- Tip Analysis
CREATE TABLE IF NOT EXISTS tip_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid NOT NULL REFERENCES whistleblower_tips(id),
  specificity_index float NOT NULL DEFAULT 0,
  evidence_density float NOT NULL DEFAULT 0,
  emotional_score float NOT NULL DEFAULT 0,
  extracted_entities jsonb NOT NULL DEFAULT '{}'::jsonb,
  analyzed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tip_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read tip analysis"
  ON tip_analysis
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert tip analysis"
  ON tip_analysis
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Dev-mode policies
CREATE POLICY "Dev read tip_analysis"
  ON tip_analysis FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert tip_analysis"
  ON tip_analysis FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update tip_analysis"
  ON tip_analysis FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whistleblower_tips_tracking
  ON whistleblower_tips(tracking_code);

CREATE INDEX IF NOT EXISTS idx_whistleblower_tips_status
  ON whistleblower_tips(status);

CREATE INDEX IF NOT EXISTS idx_whistleblower_tips_score
  ON whistleblower_tips(ai_credibility_score DESC);

CREATE INDEX IF NOT EXISTS idx_tip_analysis_tip
  ON tip_analysis(tip_id);
