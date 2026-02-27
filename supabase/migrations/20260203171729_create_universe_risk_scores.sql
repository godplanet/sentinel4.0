/*
  # Create Universe Risk Scores Table

  1. New Table
    - `universe_risk_scores`
      - Stores annual risk assessments for audit entities
      - Tracks impact, likelihood, and calculated risk scores
      - Supports multi-year planning
      - Used by Macro Risk Assessment feature

  2. Security
    - Enable RLS on table
    - Add policies for authenticated users to CRUD

  3. Indexes
    - entity_id for fast lookups
    - assessment_year for filtering by year
    - risk_score DESC for top-N queries
*/

-- =====================================================
-- TABLE: universe_risk_scores
-- =====================================================

CREATE TABLE IF NOT EXISTS universe_risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES audit_entities(id) ON DELETE CASCADE,
  assessment_year integer NOT NULL,
  impact_score integer NOT NULL CHECK (impact_score >= 1 AND impact_score <= 5),
  likelihood_score integer NOT NULL CHECK (likelihood_score >= 1 AND likelihood_score <= 5),
  risk_score integer GENERATED ALWAYS AS (impact_score * likelihood_score) STORED,
  notes text,
  assessed_by uuid REFERENCES auth.users(id),
  assessed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(entity_id, assessment_year)
);

ALTER TABLE universe_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view risk scores"
  ON universe_risk_scores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert risk scores"
  ON universe_risk_scores FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update risk scores"
  ON universe_risk_scores FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete risk scores"
  ON universe_risk_scores FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_universe_risk_scores_entity ON universe_risk_scores(entity_id);
CREATE INDEX IF NOT EXISTS idx_universe_risk_scores_year ON universe_risk_scores(assessment_year);
CREATE INDEX IF NOT EXISTS idx_universe_risk_scores_risk_score ON universe_risk_scores(risk_score DESC);
