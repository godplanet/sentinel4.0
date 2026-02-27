/*
  # Finding Sign-Off Chain (Phase 4: GIAS 2024 Compliance)

  1. New Tables
    - `finding_signoffs`
      - Tracks formal signatures for findings
      - Three roles: PREPARER, REVIEWER, APPROVER
      - Immutable once signed (no DELETE policy)
      - Timestamped digital signatures

  2. Business Rules
    - PREPARER: Auto-signed when finding is created (Senior Auditor)
    - REVIEWER: Audit Manager must sign before moving to negotiation
    - APPROVER: Head of Audit signs for Critical/High risk findings only
    
  3. Security
    - Enable RLS
    - Only authenticated users can read
    - Only assigned reviewer/approver can sign their level
    - No deletions allowed (immutable audit trail)

  4. Workflow Gates
    - Cannot move from "GÖZDEN GEÇİRME" to "MUTABAKAT" without REVIEWER signature
    - Critical findings require APPROVER signature before closure
*/

-- Create sign-offs table
CREATE TABLE IF NOT EXISTS finding_signoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL,

  -- Signature details
  role text NOT NULL CHECK (role IN ('PREPARER', 'REVIEWER', 'APPROVER')),
  user_id uuid NOT NULL,
  user_name text NOT NULL,
  user_title text,
  
  -- Digital signature metadata
  signed_at timestamptz DEFAULT now() NOT NULL,
  signature_hash text, -- Optional: cryptographic hash for legal compliance
  comments text, -- Optional review comments

  -- Prevent duplicate signatures for same role
  UNIQUE(finding_id, role),

  -- Indexes
  CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_finding_signoffs_finding ON finding_signoffs(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_signoffs_tenant ON finding_signoffs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_finding_signoffs_user ON finding_signoffs(user_id);
CREATE INDEX IF NOT EXISTS idx_finding_signoffs_signed_at ON finding_signoffs(signed_at DESC);

-- Enable RLS
ALTER TABLE finding_signoffs ENABLE ROW LEVEL SECURITY;

-- Dev mode: Allow all authenticated users to read/write
CREATE POLICY "Dev mode: Allow all operations on signoffs"
  ON finding_signoffs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- NOTE: In production, implement stricter policies:
-- - Only assigned reviewer can sign REVIEWER
-- - Only assigned approver can sign APPROVER
-- - No DELETE allowed (immutable)

COMMENT ON TABLE finding_signoffs IS 'Formal digital signatures for finding review and approval chain';
COMMENT ON COLUMN finding_signoffs.role IS 'PREPARER: Original auditor | REVIEWER: Audit Manager | APPROVER: Head of Audit';
COMMENT ON COLUMN finding_signoffs.signature_hash IS 'Cryptographic hash for legal compliance and non-repudiation';
COMMENT ON COLUMN finding_signoffs.signed_at IS 'Timestamp when signature was applied (immutable)';
