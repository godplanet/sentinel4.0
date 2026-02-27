/*
  # Add Hybrid Risk Scoring to Audit Entities

  **OVERVIEW:**
  Enhances existing audit_entities table with v2 features:
  - Manual risk override capability with mandatory justification
  - Risk parameters for dynamic configuration
  - Risk history tracking for backtesting
  - Audit planning tables

  ## 1. Table Modifications

  ### `audit_entities` - Add Hybrid Scoring Columns
    - `risk_score_manual` (decimal) - Expert override score (0-100)
    - `override_justification` (text) - Required explanation for manual override
    - `override_by` (text) - User who made the override
    - `override_date` (timestamptz) - When override was applied

  ## 2. New Tables

  ### `risk_parameters` - Dynamic Configuration
  ### `risk_history` - Time-Series Tracking
  ### `audit_plans_v2` - Resource Planning (named v2 to avoid conflicts)

  ## 3. Hybrid Risk Logic
    - Effective Risk = COALESCE(risk_score_manual, risk_score)
    - Manual overrides require justification
*/

-- Add hybrid scoring columns to audit_entities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'risk_score_manual'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN risk_score_manual decimal;
    ALTER TABLE audit_entities ADD CONSTRAINT valid_manual_score_entities
      CHECK (risk_score_manual IS NULL OR (risk_score_manual >= 0 AND risk_score_manual <= 100));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'override_justification'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN override_justification text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'override_by'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN override_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'override_date'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN override_date timestamptz;
  END IF;
END $$;

-- Add constraint: manual score requires justification
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'manual_requires_justification_entities'
  ) THEN
    ALTER TABLE audit_entities ADD CONSTRAINT manual_requires_justification_entities
      CHECK (risk_score_manual IS NULL OR (override_justification IS NOT NULL AND override_justification != ''));
  END IF;
END $$;

-- Create risk_parameters table
CREATE TABLE IF NOT EXISTS risk_parameters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  param_key text NOT NULL,
  param_value decimal NOT NULL,
  min_value decimal,
  max_value decimal,
  description text DEFAULT '',
  is_active boolean DEFAULT true,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, param_key),
  CONSTRAINT valid_param_range CHECK (
    (min_value IS NULL AND max_value IS NULL) OR
    (param_value >= min_value AND param_value <= max_value)
  )
);

-- Create risk_history table
CREATE TABLE IF NOT EXISTS risk_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES audit_entities(id) ON DELETE CASCADE,
  recorded_at timestamptz DEFAULT now(),
  score_type text NOT NULL,
  risk_score decimal NOT NULL,
  score_components jsonb DEFAULT '{}'::jsonb,
  model_version text,
  trigger_event text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_history_score CHECK (risk_score >= 0 AND risk_score <= 100)
);

-- Create audit_plans_v2 table
CREATE TABLE IF NOT EXISTS audit_plans_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  entity_id uuid REFERENCES audit_entities(id) ON DELETE CASCADE,
  year integer DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  quarter text,
  origin text DEFAULT 'RISK_BASED',
  budget_mandays decimal DEFAULT 0,
  actual_mandays decimal DEFAULT 0,
  team_assignment text DEFAULT '',
  priority integer DEFAULT 0,
  start_date date,
  end_date date,
  status text DEFAULT 'DRAFT',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_date_range_v2 CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_risk_parameters_active ON risk_parameters(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_risk_parameters_key ON risk_parameters(param_key);

CREATE INDEX IF NOT EXISTS idx_risk_history_entity ON risk_history(entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_history_recorded ON risk_history(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_risk_history_entity_recorded ON risk_history(entity_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_plans_v2_entity ON audit_plans_v2(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_plans_v2_year_quarter ON audit_plans_v2(year, quarter);
CREATE INDEX IF NOT EXISTS idx_audit_plans_v2_dates ON audit_plans_v2(start_date, end_date);

-- Trigger function for recording risk history
CREATE OR REPLACE FUNCTION record_entity_risk_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Record computed score changes
  IF (TG_OP = 'UPDATE' AND OLD.risk_score IS DISTINCT FROM NEW.risk_score) OR
     (TG_OP = 'INSERT') THEN
    INSERT INTO risk_history (entity_id, score_type, risk_score, trigger_event)
    VALUES (NEW.id, 'COMPUTED', NEW.risk_score, TG_OP);
  END IF;

  -- Record manual score changes
  IF (TG_OP = 'UPDATE' AND OLD.risk_score_manual IS DISTINCT FROM NEW.risk_score_manual AND NEW.risk_score_manual IS NOT NULL) THEN
    INSERT INTO risk_history (entity_id, score_type, risk_score, trigger_event)
    VALUES (NEW.id, 'MANUAL', NEW.risk_score_manual, 'OVERRIDE: ' || COALESCE(NEW.override_justification, 'No justification'));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit_entities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_record_entity_risk_history'
  ) THEN
    CREATE TRIGGER trigger_record_entity_risk_history
      AFTER INSERT OR UPDATE ON audit_entities
      FOR EACH ROW EXECUTE FUNCTION record_entity_risk_history();
  END IF;
END $$;

-- Enable RLS
ALTER TABLE risk_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_plans_v2 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for risk_parameters
CREATE POLICY "Anyone can view risk parameters"
  ON risk_parameters FOR SELECT USING (true);

CREATE POLICY "Authenticated users can modify risk parameters"
  ON risk_parameters FOR ALL
  TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for risk_history
CREATE POLICY "Anyone can view risk history"
  ON risk_history FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert risk history"
  ON risk_history FOR INSERT
  TO authenticated WITH CHECK (true);

-- RLS Policies for audit_plans_v2
CREATE POLICY "Anyone can view audit plans v2"
  ON audit_plans_v2 FOR SELECT USING (true);

CREATE POLICY "Authenticated users can modify audit plans v2"
  ON audit_plans_v2 FOR ALL
  TO authenticated USING (true) WITH CHECK (true);