/*
  # Module 7: Action Tracking & Governance Workbench

  ## Purpose
  This module implements the "Action" layer where findings transform into trackable remediation items.
  Core principles:
  - **Immutability**: Finding context is frozen via snapshot
  - **Dual Aging**: Performance vs Operational delays
  - **Governance**: Auditees cannot self-close actions
  
  ## Key Features
  1. Action Snapshot Architecture (Finding context preserved)
  2. Dual Aging Calculation (Original vs Current due dates)
  3. Evidence Management with file hashing
  4. Extension/Risk Acceptance workflow
  5. Auto-Fix capability configuration
  6. Strict RLS: Only auditors can close actions

  ## Tables Created
  1. `actions` - Core action tracking with finding snapshots
  2. `action_evidence` - Evidence files with integrity hashing
  3. `action_requests` - Extension and risk acceptance requests
  4. `action_logs` - Audit trail for all changes
  5. `view_action_aging` - Dual aging calculations

  ## Security Model
  - Auditees: Can update status to 'evidence_uploaded' only
  - Auditors: Full CRUD + can close actions
  - Evidence required before status change
*/

-- =====================================================
-- 1. ACTIONS TABLE (Core Action Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  finding_id uuid NOT NULL REFERENCES audit_findings(id) ON DELETE RESTRICT,
  
  -- SNAPSHOT: Immutable context (Finding state at action creation)
  -- This field is ONLY written on INSERT, never updated
  finding_snapshot jsonb NOT NULL,
  -- Example: { "title": "Cash Shortage", "risk": "CRITICAL", "audit_date": "2024-01-20", "severity": "HIGH" }
  
  -- ASSIGNMENT
  assignee_unit_name text,
  assignee_user_id uuid REFERENCES auth.users(id),
  auditor_owner_id uuid REFERENCES auth.users(id),
  
  -- DUAL AGING ENGINE
  -- original_due_date: IMMUTABLE (Used for performance measurement)
  original_due_date date NOT NULL,
  -- current_due_date: MUTABLE (Can be extended via requests)
  current_due_date date NOT NULL,
  closed_at timestamptz,
  
  -- STATE MACHINE
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'in_progress',
    'evidence_uploaded',
    'auditor_review',
    'auditor_rejected',
    'risk_acceptance_requested',
    'risk_accepted',
    'closed'
  )),
  
  -- AUTO-FIX CONFIGURATION
  auto_fix_config jsonb,
  -- Example: { "enabled": true, "endpoint": "/api/ldap/reset-policy", "params": {...} }
  
  -- METADATA
  title text NOT NULL,
  description text,
  priority text DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  cost_estimation numeric(15, 2),
  
  -- AUDIT TRAIL
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_actions_tenant ON actions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_actions_finding ON actions(finding_id);
CREATE INDEX IF NOT EXISTS idx_actions_assignee_user ON actions(assignee_user_id);
CREATE INDEX IF NOT EXISTS idx_actions_status ON actions(status);
CREATE INDEX IF NOT EXISTS idx_actions_original_due ON actions(original_due_date);
CREATE INDEX IF NOT EXISTS idx_actions_current_due ON actions(current_due_date);

-- =====================================================
-- 2. ACTION EVIDENCE (File Management)
-- =====================================================

CREATE TABLE IF NOT EXISTS action_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  
  -- FILE METADATA
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint,
  mime_type text,
  
  -- INTEGRITY & SECURITY
  file_hash text NOT NULL,
  -- SHA-256 hash for integrity verification
  
  -- METADATA
  description text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_evidence_action ON action_evidence(action_id);
CREATE INDEX IF NOT EXISTS idx_action_evidence_tenant ON action_evidence(tenant_id);

-- =====================================================
-- 3. ACTION REQUESTS (Extension / Risk Acceptance)
-- =====================================================

CREATE TABLE IF NOT EXISTS action_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  
  -- REQUEST TYPE
  type text NOT NULL CHECK (type IN ('extension', 'risk_acceptance')),
  
  -- EXTENSION DETAILS
  requested_date date,
  -- New due date being requested
  
  -- JUSTIFICATION
  justification text NOT NULL,
  impact_analysis text,
  -- "Why couldn't this be completed on time?"
  
  -- APPROVAL WORKFLOW
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewer_id uuid REFERENCES auth.users(id),
  reviewer_comments text,
  reviewed_at timestamptz,
  
  -- AUDIT TRAIL
  requested_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_requests_action ON action_requests(action_id);
CREATE INDEX IF NOT EXISTS idx_action_requests_tenant ON action_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_requests_status ON action_requests(status);

-- =====================================================
-- 4. ACTION LOGS (Complete Audit Trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  
  -- CHANGE TRACKING
  event_type text NOT NULL,
  -- Examples: 'status_changed', 'evidence_uploaded', 'auto_fixed', 'extension_requested'
  
  previous_status text,
  new_status text,
  
  -- DETAILS
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  
  -- ACTOR
  actor_id uuid REFERENCES auth.users(id),
  actor_role text,
  
  -- TIMESTAMP
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_action_logs_action ON action_logs(action_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_tenant ON action_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_created ON action_logs(created_at DESC);

-- =====================================================
-- 5. DUAL AGING VIEW (Performance Analytics)
-- =====================================================

DROP VIEW IF EXISTS view_action_aging CASCADE;
CREATE OR REPLACE VIEW view_action_aging AS
SELECT
  a.id,
  a.tenant_id,
  a.finding_id,
  a.title,
  a.status,
  a.priority,
  a.assignee_unit_name,
  a.assignee_user_id,
  a.original_due_date,
  a.current_due_date,
  a.created_at,
  
  -- 1. FINDING AGE (Age from detection)
  -- Days since the finding was first created
  (CURRENT_DATE - (a.finding_snapshot->>'created_at')::date) AS age_from_detection,
  
  -- 2. PERFORMANCE DELAY (Accountability metric - IMMUTABLE)
  -- Days delayed from ORIGINAL due date (extensions don't hide this)
  -- Negative = Early/Not due yet, Positive = Late
  (CURRENT_DATE - a.original_due_date) AS performance_delay_days,
  
  -- 3. OPERATIONAL OVERDUE (Current status - MUTABLE)
  -- Days overdue from CURRENT due date (reflects approved extensions)
  -- This is what operations teams track daily
  (CURRENT_DATE - a.current_due_date) AS operational_overdue_days,
  
  -- 4. EXTENSION GRANTED
  -- Days of extension granted (difference between current and original)
  (a.current_due_date - a.original_due_date) AS extension_days,
  
  -- 5. STATUS FLAGS
  CASE 
    WHEN a.status IN ('closed', 'risk_accepted') THEN false
    WHEN CURRENT_DATE > a.current_due_date THEN true
    ELSE false
  END AS is_operationally_overdue,
  
  CASE
    WHEN a.status IN ('closed', 'risk_accepted') THEN false
    WHEN CURRENT_DATE > a.original_due_date THEN true
    ELSE false
  END AS is_performance_delayed,
  
  -- 6. EVIDENCE COUNT
  (SELECT count(*) FROM action_evidence WHERE action_id = a.id) AS evidence_count,
  
  -- 7. PENDING REQUESTS
  (SELECT count(*) FROM action_requests WHERE action_id = a.id AND status = 'pending') AS pending_requests
  
FROM actions a
WHERE a.status NOT IN ('closed', 'risk_accepted');

-- =====================================================
-- 6. HELPER FUNCTIONS
-- =====================================================

-- Function: Log action changes automatically
CREATE OR REPLACE FUNCTION log_action_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO action_logs (
      tenant_id,
      action_id,
      event_type,
      previous_status,
      new_status,
      description,
      actor_id,
      created_at
    ) VALUES (
      NEW.tenant_id,
      NEW.id,
      'status_changed',
      OLD.status,
      NEW.status,
      format('Status changed from %s to %s', OLD.status, NEW.status),
      auth.uid(),
      now()
    );
  END IF;
  
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_action_change ON actions;
CREATE TRIGGER trg_log_action_change
  BEFORE UPDATE ON actions
  FOR EACH ROW
  EXECUTE FUNCTION log_action_change();

-- Function: Create action from finding
CREATE OR REPLACE FUNCTION create_action_from_finding(
  p_finding_id uuid,
  p_assignee_user_id uuid,
  p_due_date date,
  p_title text DEFAULT NULL,
  p_assignee_unit_name text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_action_id uuid;
  v_finding_snapshot jsonb;
  v_tenant_id uuid;
BEGIN
  -- Get finding data and create snapshot
  SELECT 
    jsonb_build_object(
      'finding_id', af.id,
      'title', af.title,
      'severity', af.severity,
      'risk_rating', af.risk_rating,
      'created_at', af.created_at,
      'gias_category', af.gias_category,
      'description', COALESCE(af.description_public, af.description)
    ),
    ae.tenant_id
  INTO v_finding_snapshot, v_tenant_id
  FROM audit_findings af
  JOIN audit_engagements ae ON ae.id = af.engagement_id
  WHERE af.id = p_finding_id;
  
  IF v_finding_snapshot IS NULL THEN
    RAISE EXCEPTION 'Finding not found: %', p_finding_id;
  END IF;
  
  -- Create action
  INSERT INTO actions (
    tenant_id,
    finding_id,
    finding_snapshot,
    assignee_unit_name,
    assignee_user_id,
    auditor_owner_id,
    original_due_date,
    current_due_date,
    title,
    status,
    created_by
  ) VALUES (
    v_tenant_id,
    p_finding_id,
    v_finding_snapshot,
    p_assignee_unit_name,
    p_assignee_user_id,
    auth.uid(),
    p_due_date,
    p_due_date,
    COALESCE(p_title, v_finding_snapshot->>'title'),
    'pending',
    auth.uid()
  )
  RETURNING id INTO v_action_id;
  
  RETURN v_action_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- ACTIONS: View policies
CREATE POLICY "Users can view actions in tenant"
  ON actions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = actions.tenant_id
    )
  );

-- ACTIONS: Auditors full CRUD
CREATE POLICY "Auditors can create actions"
  ON actions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = actions.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

CREATE POLICY "Auditors can update actions"
  ON actions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = actions.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = actions.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

-- ACTIONS: Auditees LIMITED update (CRITICAL: Cannot close)
CREATE POLICY "Auditees can update assigned actions"
  ON actions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = actions.tenant_id
        AND ut.role = 'AUDITEE'
        AND actions.assignee_user_id = auth.uid()
    )
  )
  WITH CHECK (
    -- IRON RULE: Auditees CANNOT set status to 'closed' or 'risk_accepted'
    status NOT IN ('closed', 'risk_accepted')
    AND
    -- Can only transition to 'evidence_uploaded' if evidence exists
    (CASE 
      WHEN status = 'evidence_uploaded' THEN
        (SELECT count(*) FROM action_evidence WHERE action_id = id) > 0
      ELSE true
    END)
    AND
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = actions.tenant_id
        AND ut.role = 'AUDITEE'
        AND actions.assignee_user_id = auth.uid()
    )
  );

-- ACTION_EVIDENCE: View and upload
CREATE POLICY "Users can view evidence in tenant"
  ON action_evidence FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_evidence.tenant_id
    )
  );

CREATE POLICY "Assigned users can upload evidence"
  ON action_evidence FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM actions a
      JOIN user_tenants ut ON ut.tenant_id = a.tenant_id
      WHERE a.id = action_evidence.action_id
        AND ut.user_id = auth.uid()
        AND (
          ut.role IN ('AUDITOR', 'ADMIN')
          OR a.assignee_user_id = auth.uid()
        )
    )
  );

-- ACTION_REQUESTS: Standard policies
CREATE POLICY "Users can view requests in tenant"
  ON action_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_requests.tenant_id
    )
  );

CREATE POLICY "Assigned users can create requests"
  ON action_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM actions a
      WHERE a.id = action_requests.action_id
        AND a.assignee_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_requests.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

CREATE POLICY "Auditors can review requests"
  ON action_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_requests.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

-- ACTION_LOGS: Read-only for all
CREATE POLICY "Users can view logs in tenant"
  ON action_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_logs.tenant_id
    )
  );

-- =====================================================
-- 8. COMMENTS
-- =====================================================

COMMENT ON TABLE actions IS 'Core action tracking with immutable finding snapshots for compliance';
COMMENT ON COLUMN actions.finding_snapshot IS 'Frozen finding context at action creation - NEVER updated';
COMMENT ON COLUMN actions.original_due_date IS 'Immutable due date for performance measurement';
COMMENT ON COLUMN actions.current_due_date IS 'Operational due date (can be extended)';
COMMENT ON VIEW view_action_aging IS 'Dual aging calculation: Performance vs Operational delays';
COMMENT ON FUNCTION create_action_from_finding IS 'Creates action with automatic finding snapshot';

COMMENT ON POLICY "Auditees can update assigned actions" ON actions IS 
  'CRITICAL: Auditees cannot self-close actions. Only auditors have closing power.';
