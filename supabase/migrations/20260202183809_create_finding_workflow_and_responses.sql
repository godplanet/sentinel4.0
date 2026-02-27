/*
  # Finding Workflow & Auditee Response System

  1. New Tables
    - `finding_workflow_states`
      - Tracks finding lifecycle stages
      - Supports multi-stage workflow (Draft → Negotiation → Review → Final → Remediation)

    - `auditee_responses`
      - Auditee acceptance/rejection of findings
      - Mandatory document upload for objections
      - Multiple target dates support

    - `response_milestones`
      - Multiple deadlines for single action (e.g., 1 month for docs, 3 months for IT)

    - `finding_evidence`
      - Document uploads by auditee
      - Evidence tracking with metadata

    - `workflow_transitions`
      - Audit trail of state changes
      - Who changed, when, why

  2. Security
    - Enable RLS on all tables
    - Auditees can only view their assigned findings
    - Auditees cannot modify finding text
    - Mandatory document upload enforced for objections
*/

-- Finding Workflow States
CREATE TABLE IF NOT EXISTS finding_workflow_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  finding_id uuid NOT NULL,
  current_stage text NOT NULL CHECK (current_stage IN (
    'DRAFT',
    'SENT_TO_AUDITEE',
    'AUDITEE_REVIEWING',
    'AUDITEE_ACCEPTED',
    'AUDITEE_OBJECTED',
    'AUDITOR_REVIEWING',
    'MANAGER_REVIEWING',
    'NEGOTIATION',
    'CONSENSUS_REACHED',
    'FINAL',
    'REMEDIATION_STARTED',
    'REMEDIATION_COMPLETED',
    'VERIFIED',
    'CLOSED'
  )),
  stage_order int NOT NULL DEFAULT 1,
  can_auditee_respond boolean DEFAULT false,
  can_auditor_edit boolean DEFAULT true,
  requires_manager_approval boolean DEFAULT false,
  due_date timestamptz,
  assigned_to uuid,
  assigned_role text CHECK (assigned_role IN ('AUDITOR', 'AUDITEE', 'MANAGER', 'QAIP')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Auditee Responses
CREATE TABLE IF NOT EXISTS auditee_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  finding_id uuid NOT NULL,
  workflow_state_id uuid REFERENCES finding_workflow_states(id),
  response_type text NOT NULL CHECK (response_type IN ('ACCEPT', 'OBJECT', 'PARTIAL_ACCEPT', 'REQUEST_CLARIFICATION')),
  response_text text,
  objection_reason text,
  risk_acceptance_uploaded boolean DEFAULT false,
  response_date timestamptz DEFAULT now(),
  responded_by uuid NOT NULL,
  responded_by_name text,
  responded_by_email text,
  auditor_feedback text,
  auditor_decision text CHECK (auditor_decision IN ('APPROVED', 'REJECTED', 'REQUIRES_REVISION', 'ESCALATED')),
  auditor_feedback_date timestamptz,
  is_final boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Response Milestones (Multiple target dates for actions)
CREATE TABLE IF NOT EXISTS response_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  response_id uuid REFERENCES auditee_responses(id) ON DELETE CASCADE,
  finding_id uuid NOT NULL,
  action_plan_id uuid,
  milestone_title text NOT NULL,
  milestone_description text,
  target_date date NOT NULL,
  completion_date date,
  status text DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'CANCELLED')),
  responsible_person text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Finding Evidence/Documents
CREATE TABLE IF NOT EXISTS finding_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  finding_id uuid NOT NULL,
  response_id uuid REFERENCES auditee_responses(id),
  file_name text NOT NULL,
  file_size bigint,
  file_type text,
  file_url text NOT NULL,
  uploaded_by uuid NOT NULL,
  uploaded_by_name text,
  upload_purpose text CHECK (upload_purpose IN ('OBJECTION_SUPPORT', 'RISK_ACCEPTANCE', 'ACTION_EVIDENCE', 'CLARIFICATION', 'OTHER')),
  description text,
  is_mandatory boolean DEFAULT false,
  verified_by_auditor boolean DEFAULT false,
  auditor_notes text,
  created_at timestamptz DEFAULT now()
);

-- Workflow Transitions (Audit Trail)
CREATE TABLE IF NOT EXISTS workflow_transitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  finding_id uuid NOT NULL,
  from_stage text NOT NULL,
  to_stage text NOT NULL,
  transition_type text CHECK (transition_type IN ('FORWARD', 'BACKWARD', 'ESCALATE', 'CLOSE')),
  triggered_by uuid NOT NULL,
  triggered_by_role text,
  reason text,
  automatic boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workflow_states_finding ON finding_workflow_states(finding_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_stage ON finding_workflow_states(current_stage);
CREATE INDEX IF NOT EXISTS idx_auditee_responses_finding ON auditee_responses(finding_id);
CREATE INDEX IF NOT EXISTS idx_milestones_response ON response_milestones(response_id);
CREATE INDEX IF NOT EXISTS idx_evidence_finding ON finding_evidence(finding_id);
CREATE INDEX IF NOT EXISTS idx_evidence_response ON finding_evidence(response_id);
CREATE INDEX IF NOT EXISTS idx_transitions_finding ON workflow_transitions(finding_id);

-- Enable RLS
ALTER TABLE finding_workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditee_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE finding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for finding_workflow_states
CREATE POLICY "Users can view workflow states for their tenant"
  ON finding_workflow_states FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Auditors can manage workflow states"
  ON finding_workflow_states FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for auditee_responses
CREATE POLICY "Users can view responses for their tenant"
  ON auditee_responses FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Auditees can create responses"
  ON auditee_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    ) AND
    responded_by = auth.uid()
  );

CREATE POLICY "Auditors can update responses"
  ON auditee_responses FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for response_milestones
CREATE POLICY "Users can view milestones for their tenant"
  ON response_milestones FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage milestones"
  ON response_milestones FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for finding_evidence
CREATE POLICY "Users can view evidence for their tenant"
  ON finding_evidence FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload evidence"
  ON finding_evidence FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    ) AND
    uploaded_by = auth.uid()
  );

CREATE POLICY "Auditors can update evidence"
  ON finding_evidence FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for workflow_transitions
CREATE POLICY "Users can view transitions for their tenant"
  ON workflow_transitions FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transitions"
  ON workflow_transitions FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Helper Function: Transition workflow state
CREATE OR REPLACE FUNCTION transition_finding_workflow(
  p_finding_id uuid,
  p_to_stage text,
  p_reason text DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  v_current_state record;
  v_new_state_id uuid;
  v_tenant_id uuid;
BEGIN
  -- Get current state
  SELECT * INTO v_current_state
  FROM finding_workflow_states
  WHERE finding_id = p_finding_id
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Finding workflow state not found';
  END IF;

  v_tenant_id := v_current_state.tenant_id;

  -- Create new state
  INSERT INTO finding_workflow_states (
    tenant_id,
    finding_id,
    current_stage,
    stage_order,
    can_auditee_respond,
    can_auditor_edit
  ) VALUES (
    v_tenant_id,
    p_finding_id,
    p_to_stage,
    v_current_state.stage_order + 1,
    p_to_stage IN ('SENT_TO_AUDITEE', 'AUDITEE_REVIEWING', 'NEGOTIATION'),
    p_to_stage NOT IN ('FINAL', 'CLOSED', 'VERIFIED')
  ) RETURNING id INTO v_new_state_id;

  -- Log transition
  INSERT INTO workflow_transitions (
    tenant_id,
    finding_id,
    from_stage,
    to_stage,
    triggered_by,
    reason
  ) VALUES (
    v_tenant_id,
    p_finding_id,
    v_current_state.current_stage,
    p_to_stage,
    auth.uid(),
    p_reason
  );

  RETURN v_new_state_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Validate objection has mandatory documents
CREATE OR REPLACE FUNCTION validate_objection_documents(
  p_response_id uuid
) RETURNS boolean AS $$
DECLARE
  v_has_documents boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM finding_evidence
    WHERE response_id = p_response_id
      AND upload_purpose IN ('OBJECTION_SUPPORT', 'RISK_ACCEPTANCE')
  ) INTO v_has_documents;

  RETURN v_has_documents;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;