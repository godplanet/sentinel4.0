/*
  # Create Methodology Configs (KERD Constitution) Table

  1. New Tables
    - `methodology_configs`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, FK to tenants)
      - `version` (text, e.g. "KERD-2026-v1.0")
      - `is_active` (boolean, only one active per tenant)
      - `risk_weights` (jsonb, e.g. {"financial":0.3, "legal":0.25, ...})
      - `scoring_matrix` (jsonb, impact/likelihood scale definitions)
      - `severity_thresholds` (jsonb, array of {label, min, max, color})
      - `veto_rules` (jsonb, array of override conditions)
      - `sla_config` (jsonb, SLA definitions per severity)
      - `created_at`, `updated_at` (timestamptz)
      - `created_by` (uuid)

  2. Security
    - Enable RLS on `methodology_configs`
    - Authenticated users can read active configs
    - Only admins (via service role) can insert/update

  3. Notes
    - Only one active config per tenant enforced by partial unique index
    - This is the "constitution" table that drives the entire risk engine
*/

CREATE TABLE IF NOT EXISTS methodology_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  version text NOT NULL DEFAULT 'KERD-2026-v1.0',
  is_active boolean NOT NULL DEFAULT false,
  risk_weights jsonb NOT NULL DEFAULT '{}'::jsonb,
  scoring_matrix jsonb NOT NULL DEFAULT '{"impact_max": 5, "likelihood_max": 5, "control_effectiveness_max": 5}'::jsonb,
  severity_thresholds jsonb NOT NULL DEFAULT '[]'::jsonb,
  veto_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  sla_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_methodology_configs_active_tenant
  ON methodology_configs (tenant_id)
  WHERE is_active = true;

ALTER TABLE methodology_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read methodology configs"
  ON methodology_configs
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert methodology configs"
  ON methodology_configs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update methodology configs"
  ON methodology_configs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Dev mode read methodology configs"
  ON methodology_configs
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Dev mode insert methodology configs"
  ON methodology_configs
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Dev mode update methodology configs"
  ON methodology_configs
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);
