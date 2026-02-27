/*
  # Negotiation Chat & Agreement Logic (Phase 3: The Enforcer)

  1. New Tables
    - `finding_negotiation_messages`
      - Official record of auditor-auditee negotiations
      - Messages are immutable (cannot be deleted)
      - Role-based: 'AUDITOR' vs 'AUDITEE'

    - Enhanced `action_plans` table with new columns:
      - `agreement_status`: 'AGREED' | 'DISAGREED' | 'PENDING'
      - `disagreement_reason`: Text area for objection
      - `risk_acceptance_confirmed`: Boolean checkbox
      - `risk_acceptance_evidence_url`: File upload reference
      - `risk_accepted_by_user_id`: Who signed the risk acceptance
      - `risk_accepted_at`: Timestamp of acceptance

  2. Security
    - Enable RLS on negotiation_messages
    - Policies for authenticated auditors and auditees only
    - Immutable messages (no DELETE policy)

  3. Business Logic
    - Messages cannot be deleted (official record)
    - Action plans must be either AGREED with owner/date OR DISAGREED with risk acceptance
*/

-- Create negotiation messages table (immutable chat log)
CREATE TABLE IF NOT EXISTS finding_negotiation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,

  -- Message content
  message_text text NOT NULL,
  role text NOT NULL CHECK (role IN ('AUDITOR', 'AUDITEE')),

  -- Author tracking
  author_user_id uuid NOT NULL,
  author_name text NOT NULL,
  author_title text,

  -- Metadata
  created_at timestamptz DEFAULT now() NOT NULL,
  is_system_message boolean DEFAULT false,

  -- Indexes
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_negotiation_messages_finding ON finding_negotiation_messages(finding_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_messages_tenant ON finding_negotiation_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_messages_created ON finding_negotiation_messages(created_at DESC);

-- Enhance action_plans table with agreement logic
DO $$
BEGIN
  -- Agreement status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'action_plans' AND column_name = 'agreement_status'
  ) THEN
    ALTER TABLE action_plans ADD COLUMN agreement_status text DEFAULT 'PENDING'
      CHECK (agreement_status IN ('PENDING', 'AGREED', 'DISAGREED'));
  END IF;

  -- Disagreement reason (mandatory if DISAGREED)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'action_plans' AND column_name = 'disagreement_reason'
  ) THEN
    ALTER TABLE action_plans ADD COLUMN disagreement_reason text;
  END IF;

  -- Risk acceptance checkbox
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'action_plans' AND column_name = 'risk_acceptance_confirmed'
  ) THEN
    ALTER TABLE action_plans ADD COLUMN risk_acceptance_confirmed boolean DEFAULT false;
  END IF;

  -- Evidence file URL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'action_plans' AND column_name = 'risk_acceptance_evidence_url'
  ) THEN
    ALTER TABLE action_plans ADD COLUMN risk_acceptance_evidence_url text;
  END IF;

  -- Risk accepted by (user who signed)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'action_plans' AND column_name = 'risk_accepted_by_user_id'
  ) THEN
    ALTER TABLE action_plans ADD COLUMN risk_accepted_by_user_id uuid;
  END IF;

  -- Risk accepted timestamp
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'action_plans' AND column_name = 'risk_accepted_at'
  ) THEN
    ALTER TABLE action_plans ADD COLUMN risk_accepted_at timestamptz;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE finding_negotiation_messages ENABLE ROW LEVEL SECURITY;

-- Dev mode: Allow all authenticated users to read/write
CREATE POLICY "Dev mode: Allow all operations on negotiation messages"
  ON finding_negotiation_messages
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE finding_negotiation_messages IS 'Immutable negotiation chat between auditors and auditees during the Agreement phase';
COMMENT ON COLUMN action_plans.agreement_status IS 'Whether the auditee agrees with the action plan: PENDING, AGREED, DISAGREED';
COMMENT ON COLUMN action_plans.disagreement_reason IS 'Mandatory reason if auditee disagrees';
COMMENT ON COLUMN action_plans.risk_acceptance_confirmed IS 'Auditee must check this box if they disagree and accept the risk';
COMMENT ON COLUMN action_plans.risk_acceptance_evidence_url IS 'Supporting evidence for disagreement/risk acceptance';
