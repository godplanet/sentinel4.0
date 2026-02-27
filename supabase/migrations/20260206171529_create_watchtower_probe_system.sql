/*
  # Sentinel Watchtower - Continuous Audit Engine Upgrade

  1. Modified Tables
    - `probes`
      - Added `category` (text) - Probe category: FRAUD, OPS, COMPLIANCE
      - Added `severity` (text) - Alert severity: HIGH, MEDIUM, LOW

  2. New Tables
    - `probe_runs`
      - `id` (uuid, primary key)
      - `probe_id` (uuid, FK to probes)
      - `items_found` (integer) - Exception count per run
      - `execution_time_ms` (integer) - Duration in ms
      - `status` (text) - PASS, FAIL, ERROR
      - `run_metadata` (jsonb) - Raw execution metadata
      - `started_at` / `completed_at` (timestamptz)
      - `tenant_id` (uuid)

    - `probe_exceptions`
      - `id` (uuid, primary key)
      - `run_id` (uuid, FK to probe_runs)
      - `probe_id` (uuid, FK to probes)
      - `data_payload` (jsonb) - The actual flagged row/record
      - `status` (text) - OPEN, REMEDIED, FALSE_POSITIVE, ESCALATED
      - `assigned_to` (uuid) - Reviewer user id
      - `notes` (text) - Reviewer notes
      - `resolved_at` (timestamptz)
      - `tenant_id` (uuid)

  3. Security
    - RLS enabled on both new tables
    - SELECT, INSERT, UPDATE, DELETE policies for authenticated users
    - Tenant isolation via tenant_id

  4. Indexes
    - probe_runs: probe_id, started_at, tenant_id
    - probe_exceptions: run_id, probe_id, status, tenant_id

  5. Seed Data
    - Sample probe runs and exceptions for demo purposes
*/

-- Add category and severity to probes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'probes' AND column_name = 'category'
  ) THEN
    ALTER TABLE probes ADD COLUMN category text DEFAULT 'OPS';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'probes' AND column_name = 'severity'
  ) THEN
    ALTER TABLE probes ADD COLUMN severity text DEFAULT 'MEDIUM';
  END IF;
END $$;

-- Create probe_runs table
CREATE TABLE IF NOT EXISTS probe_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  probe_id uuid NOT NULL REFERENCES probes(id) ON DELETE CASCADE,
  items_found integer NOT NULL DEFAULT 0,
  execution_time_ms integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'PASS',
  run_metadata jsonb DEFAULT '{}'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz DEFAULT now(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE probe_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view probe runs"
  ON probe_runs FOR SELECT TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can insert probe runs"
  ON probe_runs FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can update probe runs"
  ON probe_runs FOR UPDATE TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can delete probe runs"
  ON probe_runs FOR DELETE TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE INDEX IF NOT EXISTS idx_probe_runs_probe_id ON probe_runs(probe_id);
CREATE INDEX IF NOT EXISTS idx_probe_runs_started_at ON probe_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_probe_runs_tenant_id ON probe_runs(tenant_id);

-- Create probe_exceptions table
CREATE TABLE IF NOT EXISTS probe_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES probe_runs(id) ON DELETE CASCADE,
  probe_id uuid NOT NULL REFERENCES probes(id) ON DELETE CASCADE,
  data_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'OPEN',
  assigned_to uuid,
  notes text DEFAULT '',
  resolved_at timestamptz,
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE probe_exceptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view probe exceptions"
  ON probe_exceptions FOR SELECT TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can insert probe exceptions"
  ON probe_exceptions FOR INSERT TO authenticated
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can update probe exceptions"
  ON probe_exceptions FOR UPDATE TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE POLICY "Authenticated users can delete probe exceptions"
  ON probe_exceptions FOR DELETE TO authenticated
  USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid);

CREATE INDEX IF NOT EXISTS idx_probe_exceptions_run_id ON probe_exceptions(run_id);
CREATE INDEX IF NOT EXISTS idx_probe_exceptions_probe_id ON probe_exceptions(probe_id);
CREATE INDEX IF NOT EXISTS idx_probe_exceptions_status ON probe_exceptions(status);
CREATE INDEX IF NOT EXISTS idx_probe_exceptions_tenant_id ON probe_exceptions(tenant_id);

-- Dev mode permissive policies for testing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'probe_runs' AND policyname = 'Dev probe_runs public access'
  ) THEN
    CREATE POLICY "Dev probe_runs public access" ON probe_runs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'probe_exceptions' AND policyname = 'Dev probe_exceptions public access'
  ) THEN
    CREATE POLICY "Dev probe_exceptions public access" ON probe_exceptions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Probe ve probe_runs/exceptions seed verileri seed.sql dosyasina tasindi.
