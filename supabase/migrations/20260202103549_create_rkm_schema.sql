/*
  # Risk Knowledge Management (RKM) Schema

  **OVERVIEW:**
  Creates the Risk Library infrastructure for dynamic risk cataloging with flexible schema support.
  Enables template-based risk assessment forms with custom fields and methodology configuration.

  ## 1. New Tables

  ### `methodology_settings` - Parametric Risk Configuration
    - `id` (uuid, primary key) - Unique setting identifier
    - `tenant_id` (uuid) - Multi-tenant isolation (future-ready)
    - `config_type` (text) - Configuration category (e.g., 'risk_matrix', 'field_glossary')
    - `config_value` (jsonb) - Flexible JSON configuration storage
    - `description` (text) - Human-readable explanation
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last modification timestamp
    - **Unique Constraint**: (tenant_id, config_type) - One config per type per tenant

  ### `rkm_templates` - Dynamic Form Schema Definitions
    - `id` (uuid, primary key) - Template identifier
    - `tenant_id` (uuid) - Multi-tenant isolation
    - `module_type` (text) - Module context: RKM | FINDING | ACTION
    - `name` (text) - Template display name
    - `description` (text) - Template purpose description
    - `schema_definition` (jsonb) - Field definitions with types and validations
    - `is_active` (boolean) - Enable/disable toggle (default: true)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ### `risk_library` - Master Risk Catalog
    - `id` (uuid, primary key) - Risk identifier
    - `tenant_id` (uuid) - Multi-tenant isolation
    - `template_id` (uuid, foreign key) - Link to rkm_templates
    - `risk_code` (text) - Unique risk identifier code
    - `title` (text) - Risk title/name
    - `inherent_score` (decimal) - Raw risk score before controls (0-100)
    - `residual_score` (decimal) - Risk score after controls (0-100)
    - `control_effectiveness` (decimal) - Control strength percentage (0-1)
    - `static_fields` (jsonb) - Structured metadata (category, owner, etc.)
    - `dynamic_data` (jsonb) - Template-based custom fields
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
    - **Foreign Key**: template_id -> rkm_templates(id) RESTRICT

  ## 2. Security
    - Row Level Security (RLS) enabled on all tables
    - Public read access for demo/development
    - Authenticated users can modify data

  ## 3. Performance
    - Index on risk_library(inherent_score DESC) - Fast risk ranking
    - Index on risk_library(residual_score DESC) - Sorted risk views
    - Index on rkm_templates(module_type) - Filtered template queries

  ## 4. Triggers
    - Auto-update `updated_at` timestamp on all tables
*/

-- Create methodology_settings table
CREATE TABLE IF NOT EXISTS methodology_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  config_type text NOT NULL,
  config_value jsonb DEFAULT '{}'::jsonb,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tenant_id, config_type)
);

-- Create rkm_templates table
CREATE TABLE IF NOT EXISTS rkm_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  module_type text NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  schema_definition jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create risk_library table
CREATE TABLE IF NOT EXISTS risk_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  template_id uuid REFERENCES rkm_templates(id) ON DELETE RESTRICT,
  risk_code text NOT NULL,
  title text NOT NULL,
  inherent_score decimal DEFAULT 0,
  residual_score decimal DEFAULT 0,
  control_effectiveness decimal DEFAULT 0,
  static_fields jsonb DEFAULT '{}'::jsonb,
  dynamic_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_risk_library_inherent_score
  ON risk_library(inherent_score DESC);

CREATE INDEX IF NOT EXISTS idx_risk_library_residual_score
  ON risk_library(residual_score DESC);

CREATE INDEX IF NOT EXISTS idx_rkm_templates_module_type
  ON rkm_templates(module_type);

CREATE INDEX IF NOT EXISTS idx_rkm_templates_active
  ON rkm_templates(is_active) WHERE is_active = true;

-- Auto-update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_methodology_settings_updated_at'
  ) THEN
    CREATE TRIGGER update_methodology_settings_updated_at
      BEFORE UPDATE ON methodology_settings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_rkm_templates_updated_at'
  ) THEN
    CREATE TRIGGER update_rkm_templates_updated_at
      BEFORE UPDATE ON rkm_templates
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_risk_library_updated_at'
  ) THEN
    CREATE TRIGGER update_risk_library_updated_at
      BEFORE UPDATE ON risk_library
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE methodology_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rkm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_library ENABLE ROW LEVEL SECURITY;

-- RLS Policies for methodology_settings
CREATE POLICY "Anyone can view methodology settings"
  ON methodology_settings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert methodology settings"
  ON methodology_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update methodology settings"
  ON methodology_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete methodology settings"
  ON methodology_settings FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for rkm_templates
CREATE POLICY "Anyone can view RKM templates"
  ON rkm_templates FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert RKM templates"
  ON rkm_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update RKM templates"
  ON rkm_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete RKM templates"
  ON rkm_templates FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for risk_library
CREATE POLICY "Anyone can view risk library"
  ON risk_library FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert risk library"
  ON risk_library FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update risk library"
  ON risk_library FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete risk library"
  ON risk_library FOR DELETE
  TO authenticated
  USING (true);