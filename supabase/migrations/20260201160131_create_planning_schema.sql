/*
  # Audit Planning Schema

  ## Overview
  Creates the Strategic Planning infrastructure for scheduling and managing audit engagements.
  Recreates audit_engagements table with proper Planning Module structure.
  
  ## Changes
  1. Drops existing audit_engagements table (old structure)
  2. Creates audit_plans table (NEW)
  3. Recreates audit_engagements with proper foreign keys to plans and entities
  4. Sets up RLS policies for multi-tenant access control
  5. Creates performance indexes

  ## New Schema

  ### `audit_plans`
  - Annual/quarterly audit plans that organize engagements
  - Tracks approval workflow and versioning
  
  ### `audit_engagements` (Recreated)
  - Links audit plans to specific audit universe entities
  - Captures risk snapshot at planning time (immutable audit trail)
  - Tracks engagement lifecycle and resource assignment
*/

-- =====================================================
-- DROP EXISTING STRUCTURES
-- =====================================================

DROP TABLE IF EXISTS audit_findings CASCADE;
DROP TABLE IF EXISTS audit_engagements CASCADE;

-- =====================================================
-- CREATE AUDIT PLANS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id),

  CONSTRAINT valid_period CHECK (period_end >= period_start),
  CONSTRAINT valid_plan_status CHECK (status IN ('DRAFT', 'APPROVED', 'LOCKED'))
);

-- =====================================================
-- CREATE AUDIT ENGAGEMENTS TABLE
-- =====================================================

CREATE TABLE audit_engagements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES audit_plans(id) ON DELETE CASCADE,
  entity_id uuid NOT NULL REFERENCES audit_entities(id) ON DELETE RESTRICT,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'PLANNED',
  audit_type text NOT NULL DEFAULT 'COMPREHENSIVE',
  start_date date NOT NULL,
  end_date date NOT NULL,
  assigned_auditor_id uuid REFERENCES auth.users(id),
  risk_snapshot_score float NOT NULL DEFAULT 0,
  estimated_hours integer NOT NULL DEFAULT 0,
  actual_hours integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT valid_engagement_dates CHECK (end_date >= start_date),
  CONSTRAINT valid_engagement_status CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  CONSTRAINT valid_audit_type CHECK (audit_type IN ('COMPREHENSIVE', 'TARGETED', 'FOLLOW_UP')),
  CONSTRAINT unique_plan_entity UNIQUE (plan_id, entity_id)
);

-- =====================================================
-- RECREATE AUDIT FINDINGS TABLE
-- =====================================================

CREATE TABLE audit_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
  title text NOT NULL,
  severity text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz DEFAULT now(),

  CONSTRAINT valid_finding_severity CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OBSERVATION')),
  CONSTRAINT valid_finding_status CHECK (status IN ('DRAFT', 'FINAL', 'REMEDIATED'))
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_audit_plans_tenant ON audit_plans(tenant_id);
CREATE INDEX idx_audit_plans_status ON audit_plans(status);
CREATE INDEX idx_audit_plans_period ON audit_plans(period_start, period_end);

CREATE INDEX idx_audit_engagements_tenant ON audit_engagements(tenant_id);
CREATE INDEX idx_audit_engagements_plan ON audit_engagements(plan_id);
CREATE INDEX idx_audit_engagements_entity ON audit_engagements(entity_id);
CREATE INDEX idx_audit_engagements_status ON audit_engagements(status);
CREATE INDEX idx_audit_engagements_auditor ON audit_engagements(assigned_auditor_id);
CREATE INDEX idx_audit_engagements_dates ON audit_engagements(start_date, end_date);

CREATE INDEX idx_audit_findings_engagement ON audit_findings(engagement_id);
CREATE INDEX idx_audit_findings_severity ON audit_findings(severity);
CREATE INDEX idx_audit_findings_status ON audit_findings(status);

-- =====================================================
-- HELPER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE audit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

-- Plans: View
CREATE POLICY "Users can view own tenant plans"
  ON audit_plans FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Plans: Insert
CREATE POLICY "Users can create plans in tenant"
  ON audit_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Plans: Update
CREATE POLICY "Users can update own draft plans"
  ON audit_plans FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
    AND (status = 'DRAFT' OR created_by = auth.uid())
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Plans: Delete
CREATE POLICY "Users can delete draft plans"
  ON audit_plans FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
    AND status = 'DRAFT'
  );

-- Engagements: View
CREATE POLICY "Users can view tenant engagements"
  ON audit_engagements FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Engagements: Insert
CREATE POLICY "Users can create engagements"
  ON audit_engagements FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Engagements: Update
CREATE POLICY "Users can update engagements"
  ON audit_engagements FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
    AND (assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL)
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Engagements: Delete
CREATE POLICY "Users can delete planned engagements"
  ON audit_engagements FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
    AND status = 'PLANNED'
  );

-- Findings: View
CREATE POLICY "Users can view findings in tenant"
  ON audit_findings FOR SELECT
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM audit_engagements 
      WHERE tenant_id IN (
        SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
      )
    )
  );

-- Findings: Insert
CREATE POLICY "Users can create findings"
  ON audit_findings FOR INSERT
  TO authenticated
  WITH CHECK (
    engagement_id IN (
      SELECT id FROM audit_engagements 
      WHERE tenant_id IN (
        SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
      )
    )
  );

-- Findings: Update
CREATE POLICY "Users can update findings"
  ON audit_findings FOR UPDATE
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM audit_engagements 
      WHERE tenant_id IN (
        SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    engagement_id IN (
      SELECT id FROM audit_engagements 
      WHERE tenant_id IN (
        SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
      )
    )
  );

-- Findings: Delete
CREATE POLICY "Users can delete draft findings"
  ON audit_findings FOR DELETE
  TO authenticated
  USING (
    engagement_id IN (
      SELECT id FROM audit_engagements 
      WHERE tenant_id IN (
        SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
      )
    )
    AND status = 'DRAFT'
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_audit_plans_updated_at
  BEFORE UPDATE ON audit_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_engagements_updated_at
  BEFORE UPDATE ON audit_engagements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
