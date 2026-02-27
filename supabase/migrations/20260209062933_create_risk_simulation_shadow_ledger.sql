/*
  # Risk Simulation Shadow Ledger - Time-Travel Risk Simulator

  1. New Tables
    - `risk_simulation_runs`
      - `id` (uuid, primary key)
      - `name` (text) - Scenario name (e.g., "High Cyber Weight Scenario")
      - `constitution_snapshot` (jsonb) - Draft constitution rules used for simulation
      - `created_by` (uuid) - User who ran the simulation
      - `created_at` (timestamptz)
      - `status` (text) - RUNNING, COMPLETED, FAILED
      - `metadata` (jsonb) - Additional simulation parameters

    - `risk_simulation_results`
      - `id` (uuid, primary key)
      - `simulation_id` (uuid, FK to risk_simulation_runs)
      - `entity_id` (uuid) - Reference to audit_universe entity
      - `entity_name` (text) - Cached entity name
      - `original_score` (numeric) - Current live risk score
      - `simulated_score` (numeric) - Calculated score under draft constitution
      - `delta` (numeric) - Difference (simulated - original)
      - `delta_percentage` (numeric) - Percentage change
      - `risk_zone_old` (text) - Current risk zone (CRITICAL, HIGH, MEDIUM, LOW)
      - `risk_zone_new` (text) - Simulated risk zone
      - `zone_changed` (boolean) - Flag for zone crossing
      - `impact_summary` (jsonb) - Detailed breakdown of what changed

  2. Security
    - Enable RLS on both tables
    - Policies for authenticated users to manage their own simulations

  3. Indexes
    - Index on simulation_id for fast result lookups
    - Index on zone_changed for impact analysis queries
*/

-- Create simulation runs table
CREATE TABLE IF NOT EXISTS risk_simulation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  constitution_snapshot JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'RUNNING' CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED')),
  metadata JSONB DEFAULT '{}'::jsonb,
  error_message TEXT
);

-- Create simulation results table (The Shadow Ledger)
CREATE TABLE IF NOT EXISTS risk_simulation_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id UUID NOT NULL REFERENCES risk_simulation_runs(id) ON DELETE CASCADE,
  entity_id UUID NOT NULL,
  entity_name TEXT NOT NULL,
  entity_path TEXT,
  original_score NUMERIC(5,2) DEFAULT 0,
  simulated_score NUMERIC(5,2) DEFAULT 0,
  delta NUMERIC(5,2) DEFAULT 0,
  delta_percentage NUMERIC(5,2) DEFAULT 0,
  risk_zone_old TEXT,
  risk_zone_new TEXT,
  zone_changed BOOLEAN DEFAULT FALSE,
  impact_summary JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_simulation_results_simulation_id
  ON risk_simulation_results(simulation_id);

CREATE INDEX IF NOT EXISTS idx_simulation_results_zone_changed
  ON risk_simulation_results(zone_changed) WHERE zone_changed = TRUE;

CREATE INDEX IF NOT EXISTS idx_simulation_results_entity_id
  ON risk_simulation_results(entity_id);

CREATE INDEX IF NOT EXISTS idx_simulation_runs_created_by
  ON risk_simulation_runs(created_by);

CREATE INDEX IF NOT EXISTS idx_simulation_runs_status
  ON risk_simulation_runs(status);

-- Enable Row Level Security
ALTER TABLE risk_simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_simulation_results ENABLE ROW LEVEL SECURITY;

-- Policies for risk_simulation_runs

-- Users can view their own simulation runs
CREATE POLICY "Users can view own simulation runs"
  ON risk_simulation_runs
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Users can create simulation runs
CREATE POLICY "Users can create simulation runs"
  ON risk_simulation_runs
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Users can update their own simulation runs
CREATE POLICY "Users can update own simulation runs"
  ON risk_simulation_runs
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Users can delete their own simulation runs
CREATE POLICY "Users can delete own simulation runs"
  ON risk_simulation_runs
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Policies for risk_simulation_results

-- Users can view results of their own simulation runs
CREATE POLICY "Users can view own simulation results"
  ON risk_simulation_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM risk_simulation_runs
      WHERE risk_simulation_runs.id = risk_simulation_results.simulation_id
      AND risk_simulation_runs.created_by = auth.uid()
    )
  );

-- Users can insert results for their own simulation runs
CREATE POLICY "Users can insert own simulation results"
  ON risk_simulation_results
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM risk_simulation_runs
      WHERE risk_simulation_runs.id = risk_simulation_results.simulation_id
      AND risk_simulation_runs.created_by = auth.uid()
    )
  );

-- Users can delete results of their own simulation runs
CREATE POLICY "Users can delete own simulation results"
  ON risk_simulation_results
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM risk_simulation_runs
      WHERE risk_simulation_runs.id = risk_simulation_results.simulation_id
      AND risk_simulation_runs.created_by = auth.uid()
    )
  );

-- DEV MODE: Allow public access for testing
CREATE POLICY "Dev mode: allow all on simulation runs"
  ON risk_simulation_runs
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Dev mode: allow all on simulation results"
  ON risk_simulation_results
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Helper view for quick impact analysis
CREATE OR REPLACE VIEW simulation_impact_summary AS
SELECT
  r.simulation_id,
  run.name as simulation_name,
  run.created_at,
  COUNT(*) as total_entities,
  COUNT(*) FILTER (WHERE r.zone_changed = TRUE) as entities_changed,
  COUNT(*) FILTER (WHERE r.risk_zone_new = 'CRITICAL') as critical_count,
  COUNT(*) FILTER (WHERE r.risk_zone_new = 'HIGH') as high_count,
  COUNT(*) FILTER (WHERE r.risk_zone_new = 'MEDIUM') as medium_count,
  COUNT(*) FILTER (WHERE r.risk_zone_new = 'LOW') as low_count,
  AVG(r.delta) as avg_score_change,
  AVG(r.delta_percentage) as avg_percentage_change,
  COUNT(*) FILTER (WHERE r.delta > 0) as entities_increased,
  COUNT(*) FILTER (WHERE r.delta < 0) as entities_decreased
FROM risk_simulation_results r
JOIN risk_simulation_runs run ON run.id = r.simulation_id
GROUP BY r.simulation_id, run.name, run.created_at;

-- Comment on tables
COMMENT ON TABLE risk_simulation_runs IS 'Shadow Ledger: Stores risk simulation sessions with draft constitution snapshots';
COMMENT ON TABLE risk_simulation_results IS 'Shadow Ledger: Stores simulated risk scores without affecting live data';
COMMENT ON VIEW simulation_impact_summary IS 'Aggregated impact metrics for each simulation run';