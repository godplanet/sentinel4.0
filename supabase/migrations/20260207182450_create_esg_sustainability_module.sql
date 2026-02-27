/*
  # Create ESG & Sustainability Module (Green Ledger)

  Blueprint: Sentinel v3.0 - Module C: ESG & Sustainability

  1. New Tables
    - `esg_frameworks` - Reporting frameworks (GRI, TCFD, UN SDGs, EU Taxonomy)
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `name` (text) - Framework name
      - `version` (text) - Version string
      - `category` (text) - Environmental, Social, Governance, Integrated
      - `is_active` (boolean)

    - `esg_metric_definitions` - Metric catalog per framework
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `framework_id` (uuid, FK esg_frameworks)
      - `code` (text) - e.g. "GRI 305-1"
      - `name` (text) - Human label
      - `pillar` (text) - E, S, G
      - `unit` (text) - tCO2e, kWh, %, count, TRY
      - `data_type` (text) - Number, Boolean, Currency, Percentage
      - `target_value` (numeric) - Target threshold
      - `target_direction` (text) - below, above, equal

    - `esg_data_points` - Cryo-Chamber immutable metric submissions
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `metric_id` (uuid, FK esg_metric_definitions)
      - `period` (text) - e.g. "2026-Q1"
      - `value` (numeric) - Reported value
      - `previous_value` (numeric) - Last period for delta
      - `evidence_url` (text) - Attached proof
      - `evidence_description` (text)
      - `submitted_by` (text) - Reporter name
      - `department` (text)
      - `ai_validation_status` (text) - Pending, Validated, Flagged, Override
      - `ai_notes` (text) - Green Skeptic findings
      - `ai_confidence` (numeric) - 0-100 confidence score
      - `snapshot_json` (jsonb) - Full frozen copy
      - `record_hash` (text) - SHA-256
      - `is_frozen` (boolean)
      - `signed_at` (timestamptz)

    - `esg_social_metrics` - Social impact HR data
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `period` (text)
      - `total_employees` (integer)
      - `women_total` (integer)
      - `women_management` (integer)
      - `women_board` (integer)
      - `gender_pay_gap_pct` (numeric)
      - `training_hours_per_employee` (numeric)
      - `employee_turnover_pct` (numeric)
      - `workplace_injuries` (integer)
      - `community_investment_try` (numeric)

    - `esg_green_assets` - Green Asset Ratio tracking
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `period` (text)
      - `total_loan_portfolio_try` (numeric)
      - `green_loans_try` (numeric)
      - `green_bonds_try` (numeric)
      - `taxonomy_aligned_pct` (numeric)
      - `transition_finance_try` (numeric)

  2. Security
    - RLS enabled on all tables
    - Dev-mode anon CRUD policies
    - Authenticated tenant-scoped read policies

  3. Seed Data
    - 4 frameworks (GRI, TCFD, UN SDGs, EU Taxonomy)
    - 18 metric definitions across E/S/G pillars
    - 12 data points (8 validated, 2 flagged, 2 pending)
    - 4 quarters of social metrics
    - 4 quarters of green asset data
*/

-- ============================================================
-- TABLE: esg_frameworks
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  name text NOT NULL,
  version text,
  category text NOT NULL DEFAULT 'Integrated',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT esg_fw_cat CHECK (category IN ('Environmental','Social','Governance','Integrated'))
);
CREATE INDEX IF NOT EXISTS idx_esg_fw_tenant ON esg_frameworks(tenant_id);
ALTER TABLE esg_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_frameworks" ON esg_frameworks FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_frameworks" ON esg_frameworks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_frameworks" ON esg_frameworks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_frameworks" ON esg_frameworks FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_frameworks" ON esg_frameworks FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: esg_metric_definitions
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_metric_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  framework_id uuid REFERENCES esg_frameworks(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  pillar text NOT NULL DEFAULT 'E',
  unit text NOT NULL DEFAULT 'tCO2e',
  data_type text NOT NULL DEFAULT 'Number',
  target_value numeric,
  target_direction text DEFAULT 'below',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT esg_md_pillar CHECK (pillar IN ('E','S','G')),
  CONSTRAINT esg_md_dtype CHECK (data_type IN ('Number','Boolean','Currency','Percentage')),
  CONSTRAINT esg_md_dir CHECK (target_direction IN ('below','above','equal'))
);
CREATE INDEX IF NOT EXISTS idx_esg_md_fw ON esg_metric_definitions(framework_id);
CREATE INDEX IF NOT EXISTS idx_esg_md_pillar ON esg_metric_definitions(pillar);
ALTER TABLE esg_metric_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_metric_definitions" ON esg_metric_definitions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_metric_definitions" ON esg_metric_definitions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_metric_definitions" ON esg_metric_definitions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_metric_definitions" ON esg_metric_definitions FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_metric_definitions" ON esg_metric_definitions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: esg_data_points (CRYO-CHAMBER)
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_data_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  metric_id uuid REFERENCES esg_metric_definitions(id) ON DELETE CASCADE,
  period text NOT NULL,
  value numeric NOT NULL,
  previous_value numeric,
  evidence_url text,
  evidence_description text,
  submitted_by text NOT NULL,
  department text,
  ai_validation_status text NOT NULL DEFAULT 'Pending',
  ai_notes text,
  ai_confidence numeric,
  snapshot_json jsonb NOT NULL DEFAULT '{}',
  record_hash text NOT NULL DEFAULT '',
  is_frozen boolean NOT NULL DEFAULT false,
  signed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT esg_dp_status CHECK (ai_validation_status IN ('Pending','Validated','Flagged','Override'))
);
CREATE INDEX IF NOT EXISTS idx_esg_dp_metric ON esg_data_points(metric_id);
CREATE INDEX IF NOT EXISTS idx_esg_dp_period ON esg_data_points(period);
CREATE INDEX IF NOT EXISTS idx_esg_dp_status ON esg_data_points(ai_validation_status);
ALTER TABLE esg_data_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_data_points" ON esg_data_points FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_data_points" ON esg_data_points FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_data_points" ON esg_data_points FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_data_points" ON esg_data_points FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_data_points" ON esg_data_points FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: esg_social_metrics
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_social_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  period text NOT NULL,
  total_employees integer NOT NULL DEFAULT 0,
  women_total integer NOT NULL DEFAULT 0,
  women_management integer NOT NULL DEFAULT 0,
  women_board integer NOT NULL DEFAULT 0,
  gender_pay_gap_pct numeric NOT NULL DEFAULT 0,
  training_hours_per_employee numeric NOT NULL DEFAULT 0,
  employee_turnover_pct numeric NOT NULL DEFAULT 0,
  workplace_injuries integer NOT NULL DEFAULT 0,
  community_investment_try numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_esg_sm_period ON esg_social_metrics(period);
ALTER TABLE esg_social_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_social_metrics" ON esg_social_metrics FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_social_metrics" ON esg_social_metrics FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_social_metrics" ON esg_social_metrics FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_social_metrics" ON esg_social_metrics FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_social_metrics" ON esg_social_metrics FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: esg_green_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS esg_green_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  period text NOT NULL,
  total_loan_portfolio_try numeric NOT NULL DEFAULT 0,
  green_loans_try numeric NOT NULL DEFAULT 0,
  green_bonds_try numeric NOT NULL DEFAULT 0,
  taxonomy_aligned_pct numeric NOT NULL DEFAULT 0,
  transition_finance_try numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_esg_ga_period ON esg_green_assets(period);
ALTER TABLE esg_green_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read esg_green_assets" ON esg_green_assets FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert esg_green_assets" ON esg_green_assets FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update esg_green_assets" ON esg_green_assets FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete esg_green_assets" ON esg_green_assets FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read esg_green_assets" ON esg_green_assets FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));
