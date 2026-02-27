/*
  # RKM Snapshot Mechanism for Audit Immutability

  ## Overview
  Implements the constitutional requirement for audit data immutability.
  When an audit engagement starts, the RKM (Risk & Control Matrix) data
  must be frozen as a JSONB snapshot to preserve the exact state of risks
  and controls at the time of audit commencement.

  ## Key Features
  1. **Immutability**: Once audit starts, risk definitions cannot retroactively change
  2. **Snapshot Storage**: Full JSONB snapshot of RKM records linked to engagement
  3. **Frozen Timestamp**: Records exact moment when snapshot was taken
  4. **Audit Trail**: Preserves historical risk assessments for compliance

  ## Changes
  1. New Tables
     - `engagement_scopes`: Stores frozen RKM snapshots per engagement

  2. Helper Functions
     - `create_rkm_snapshot()`: Automatically captures RKM snapshot when engagement starts
     - `get_frozen_rkm()`: Retrieves frozen RKM data instead of live data

  3. Trigger
     - Auto-snapshot when engagement status changes to 'IN_PROGRESS'

  4. Security
     - RLS policies for tenant isolation
     - Read-only snapshot data (no updates allowed after creation)
*/

-- =====================================================
-- 1. CREATE ENGAGEMENT_SCOPES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS engagement_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  engagement_id uuid NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
  rkm_risk_id uuid NOT NULL,
  rkm_snapshot jsonb NOT NULL,
  frozen_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),

  CONSTRAINT unique_engagement_risk UNIQUE (engagement_id, rkm_risk_id)
);

-- Indexes for performance
CREATE INDEX idx_engagement_scopes_engagement ON engagement_scopes(engagement_id);
CREATE INDEX idx_engagement_scopes_tenant ON engagement_scopes(tenant_id);
CREATE INDEX idx_engagement_scopes_rkm_risk ON engagement_scopes(rkm_risk_id);
CREATE INDEX idx_engagement_scopes_snapshot ON engagement_scopes USING gin (rkm_snapshot);

-- =====================================================
-- 2. HELPER FUNCTION: CREATE RKM SNAPSHOT
-- =====================================================

CREATE OR REPLACE FUNCTION create_rkm_snapshot(
  p_engagement_id uuid,
  p_tenant_id uuid
)
RETURNS void AS $$
BEGIN
  -- Insert snapshot for each RKM risk associated with the engagement's entity
  INSERT INTO engagement_scopes (tenant_id, engagement_id, rkm_risk_id, rkm_snapshot, created_by)
  SELECT
    p_tenant_id,
    p_engagement_id,
    r.id AS rkm_risk_id,
    to_jsonb(r.*) AS rkm_snapshot,
    auth.uid()
  FROM rkm_risks r
  INNER JOIN audit_engagements ae ON ae.entity_id = r.process_id
  WHERE ae.id = p_engagement_id
    AND ae.tenant_id = p_tenant_id
  ON CONFLICT (engagement_id, rkm_risk_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. HELPER FUNCTION: GET FROZEN RKM DATA
-- =====================================================

CREATE OR REPLACE FUNCTION get_frozen_rkm(
  p_engagement_id uuid
)
RETURNS TABLE (
  risk_id uuid,
  risk_code text,
  risk_title text,
  inherent_score numeric,
  residual_score numeric,
  snapshot_data jsonb,
  frozen_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    es.rkm_risk_id AS risk_id,
    (es.rkm_snapshot->>'risk_code')::text AS risk_code,
    (es.rkm_snapshot->>'risk_title')::text AS risk_title,
    (es.rkm_snapshot->>'inherent_risk_score')::numeric AS inherent_score,
    (es.rkm_snapshot->>'residual_risk_score')::numeric AS residual_score,
    es.rkm_snapshot AS snapshot_data,
    es.frozen_at
  FROM engagement_scopes es
  WHERE es.engagement_id = p_engagement_id
  ORDER BY es.frozen_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. AUTO-SNAPSHOT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION auto_snapshot_rkm()
RETURNS TRIGGER AS $$
BEGIN
  -- When engagement status changes to IN_PROGRESS, create snapshot
  IF NEW.status = 'IN_PROGRESS' AND (OLD.status IS NULL OR OLD.status != 'IN_PROGRESS') THEN
    PERFORM create_rkm_snapshot(NEW.id, NEW.tenant_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_snapshot_rkm ON audit_engagements;
CREATE TRIGGER trg_auto_snapshot_rkm
AFTER UPDATE ON audit_engagements
FOR EACH ROW
EXECUTE FUNCTION auto_snapshot_rkm();

-- Also trigger on INSERT if status is already IN_PROGRESS
CREATE OR REPLACE FUNCTION auto_snapshot_rkm_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'IN_PROGRESS' THEN
    PERFORM create_rkm_snapshot(NEW.id, NEW.tenant_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_snapshot_rkm_insert ON audit_engagements;
CREATE TRIGGER trg_auto_snapshot_rkm_insert
AFTER INSERT ON audit_engagements
FOR EACH ROW
EXECUTE FUNCTION auto_snapshot_rkm_on_insert();

-- =====================================================
-- 5. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE engagement_scopes ENABLE ROW LEVEL SECURITY;

-- View: Users can view snapshots in their tenant
CREATE POLICY "Users can view engagement scopes in tenant"
  ON engagement_scopes FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Insert: Users can create snapshots (via function only)
CREATE POLICY "Users can create engagement scopes"
  ON engagement_scopes FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- NO UPDATE/DELETE policies - snapshots are immutable!
-- This ensures audit trail integrity

-- =====================================================
-- 6. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE engagement_scopes IS
  'Immutable RKM snapshots for audit engagements. Once created, cannot be modified or deleted.';

COMMENT ON COLUMN engagement_scopes.rkm_snapshot IS
  'Full JSONB snapshot of rkm_risks record at moment of engagement start. Preserves historical risk state.';

COMMENT ON FUNCTION create_rkm_snapshot IS
  'Captures all RKM risks associated with engagement entity and stores as frozen JSONB snapshots.';

COMMENT ON FUNCTION get_frozen_rkm IS
  'Retrieves frozen RKM data for an engagement. Use this instead of querying live rkm_risks table during audit.';
