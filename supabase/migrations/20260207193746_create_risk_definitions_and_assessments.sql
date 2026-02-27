/*
  # Risk Definitions & Assessments Tables

  1. Modified Tables
    - `audit_entities`: add parent_id, status columns

  2. New Tables
    - `risk_definitions`: risk library (category, base scores)
    - `risk_assessments`: immutable heatmap assessments (Cryo-Chamber)

  3. Security
    - RLS enabled on both tables
    - Dev-mode anon/authenticated policies
*/

-- Add parent_id and status to audit_entities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'parent_id'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN parent_id UUID REFERENCES audit_entities(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'status'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN status VARCHAR(20) DEFAULT 'Active';
  END IF;
END $$;

-- Risk Definitions (The Risk Library)
CREATE TABLE IF NOT EXISTS risk_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  title VARCHAR(200) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  base_impact INT NOT NULL DEFAULT 3 CHECK (base_impact BETWEEN 1 AND 5),
  base_likelihood INT NOT NULL DEFAULT 3 CHECK (base_likelihood BETWEEN 1 AND 5),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE risk_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_definitions_anon_read"
  ON risk_definitions FOR SELECT TO anon
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_definitions_anon_insert"
  ON risk_definitions FOR INSERT TO anon
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_definitions_anon_update"
  ON risk_definitions FOR UPDATE TO anon
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_definitions_anon_delete"
  ON risk_definitions FOR DELETE TO anon
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_definitions_auth_read"
  ON risk_definitions FOR SELECT TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_definitions_auth_write"
  ON risk_definitions FOR INSERT TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_definitions_auth_update"
  ON risk_definitions FOR UPDATE TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_definitions_auth_delete"
  ON risk_definitions FOR DELETE TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- Risk Assessments (Cryo-Chamber: immutable heatmap rows)
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  entity_id UUID NOT NULL REFERENCES audit_entities(id) ON DELETE CASCADE,
  risk_id UUID NOT NULL REFERENCES risk_definitions(id) ON DELETE CASCADE,
  impact INT NOT NULL CHECK (impact BETWEEN 1 AND 5),
  likelihood INT NOT NULL CHECK (likelihood BETWEEN 1 AND 5),
  inherent_risk_score INT GENERATED ALWAYS AS (impact * likelihood) STORED,
  control_effectiveness NUMERIC(3,2) DEFAULT 0 CHECK (control_effectiveness BETWEEN 0 AND 1),
  residual_score NUMERIC(5,2) GENERATED ALWAYS AS (
    (impact * likelihood) * (1 - control_effectiveness)
  ) STORED,
  justification TEXT,
  assessed_by UUID,
  assessed_at TIMESTAMPTZ DEFAULT NOW(),
  version_hash VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_assessments_entity ON risk_assessments(entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_risk ON risk_assessments(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_score ON risk_assessments(inherent_risk_score DESC);

ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "risk_assessments_anon_read"
  ON risk_assessments FOR SELECT TO anon
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_assessments_anon_insert"
  ON risk_assessments FOR INSERT TO anon
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_assessments_anon_update"
  ON risk_assessments FOR UPDATE TO anon
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_assessments_anon_delete"
  ON risk_assessments FOR DELETE TO anon
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_assessments_auth_read"
  ON risk_assessments FOR SELECT TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_assessments_auth_write"
  ON risk_assessments FOR INSERT TO authenticated
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_assessments_auth_update"
  ON risk_assessments FOR UPDATE TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid)
  WITH CHECK (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);

CREATE POLICY "risk_assessments_auth_delete"
  ON risk_assessments FOR DELETE TO authenticated
  USING (tenant_id = '00000000-0000-0000-0000-000000000001'::uuid);
