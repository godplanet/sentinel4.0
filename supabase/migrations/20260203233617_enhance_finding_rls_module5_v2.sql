/*
  # Module 5: Enhanced RLS for Finding Hub & Auditee Portal

  ## Purpose
  Implements strict data segregation between Auditors and Auditees:
  - **finding_secrets**: ONLY visible to Auditors/Admins (IRON CURTAIN)
  - **audit_findings**: Auditors see all, Auditees see only assigned
  - **action_plans**: Auditees can create/update, Auditors can view all

  ## Security Model
  1. Role-Based Access Control via user_tenants.role
  2. Assignment-Based Access for Auditees (assigned_auditee_id column)
  3. Complete isolation of sensitive data (RCA, auditor notes)

  ## Schema Notes
  - audit_findings links to audit_engagements (which has tenant_id)
  - finding_secrets and action_plans have direct tenant_id columns
  - Join through audit_engagements for finding-level tenant checks
*/

-- =====================================================
-- 1. EXTEND USER ROLES TO INCLUDE AUDITEE
-- =====================================================

DO $$
BEGIN
  -- Drop existing constraint
  ALTER TABLE user_tenants DROP CONSTRAINT IF EXISTS user_tenants_role_check;
  
  -- Recreate with AUDITEE added
  ALTER TABLE user_tenants ADD CONSTRAINT user_tenants_role_check
    CHECK (role IN ('ADMIN', 'AUDITOR', 'VIEWER', 'AUDITEE'));
END $$;

-- =====================================================
-- 2. FINDING_SECRETS: AUDITOR-ONLY (IRON CURTAIN)
-- =====================================================

-- finding_secrets already has RLS enabled and tenant_id column
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view finding secrets in tenant" ON finding_secrets;
DROP POLICY IF EXISTS "Users can create finding secrets" ON finding_secrets;
DROP POLICY IF EXISTS "Users can update finding secrets" ON finding_secrets;
DROP POLICY IF EXISTS "Users can delete finding secrets" ON finding_secrets;

-- IRON CURTAIN: Only Auditors and Admins can access secrets
CREATE POLICY "Auditors can view finding secrets"
  ON finding_secrets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = finding_secrets.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

CREATE POLICY "Auditors can create finding secrets"
  ON finding_secrets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = finding_secrets.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

CREATE POLICY "Auditors can update finding secrets"
  ON finding_secrets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = finding_secrets.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = finding_secrets.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

CREATE POLICY "Auditors can delete finding secrets"
  ON finding_secrets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = finding_secrets.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

-- =====================================================
-- 3. AUDIT_FINDINGS: ROLE-BASED + ASSIGNMENT-BASED
-- =====================================================

-- audit_findings links to audit_engagements (tenant_id is in engagements)
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Auditors can view all findings" ON audit_findings;
DROP POLICY IF EXISTS "Auditees can view assigned findings" ON audit_findings;
DROP POLICY IF EXISTS "Auditors can create findings" ON audit_findings;
DROP POLICY IF EXISTS "Auditors can update findings" ON audit_findings;
DROP POLICY IF EXISTS "Auditors can delete findings" ON audit_findings;

-- Auditors and Admins: Full access to all findings in their tenant
CREATE POLICY "Auditors can view all findings"
  ON audit_findings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_tenants ut
      JOIN audit_engagements ae ON ae.tenant_id = ut.tenant_id
      WHERE ut.user_id = auth.uid()
        AND ae.id = audit_findings.engagement_id
        AND ut.role IN ('AUDITOR', 'ADMIN', 'VIEWER')
    )
  );

CREATE POLICY "Auditors can create findings"
  ON audit_findings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_tenants ut
      JOIN audit_engagements ae ON ae.tenant_id = ut.tenant_id
      WHERE ut.user_id = auth.uid()
        AND ae.id = audit_findings.engagement_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

CREATE POLICY "Auditors can update findings"
  ON audit_findings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_tenants ut
      JOIN audit_engagements ae ON ae.tenant_id = ut.tenant_id
      WHERE ut.user_id = auth.uid()
        AND ae.id = audit_findings.engagement_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_tenants ut
      JOIN audit_engagements ae ON ae.tenant_id = ut.tenant_id
      WHERE ut.user_id = auth.uid()
        AND ae.id = audit_findings.engagement_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

CREATE POLICY "Auditors can delete findings"
  ON audit_findings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_tenants ut
      JOIN audit_engagements ae ON ae.tenant_id = ut.tenant_id
      WHERE ut.user_id = auth.uid()
        AND ae.id = audit_findings.engagement_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

-- Auditees: Can ONLY view findings assigned to them
CREATE POLICY "Auditees can view assigned findings"
  ON audit_findings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_tenants ut
      JOIN audit_engagements ae ON ae.tenant_id = ut.tenant_id
      WHERE ut.user_id = auth.uid()
        AND ae.id = audit_findings.engagement_id
        AND ut.role = 'AUDITEE'
        AND audit_findings.assigned_auditee_id = auth.uid()
    )
  );

-- =====================================================
-- 4. ACTION_PLANS: AUDITEE WRITABLE
-- =====================================================

-- action_plans has direct tenant_id column
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view action plans in tenant" ON action_plans;
DROP POLICY IF EXISTS "Auditors can view all action plans" ON action_plans;
DROP POLICY IF EXISTS "Auditees can view their action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can create action plans" ON action_plans;
DROP POLICY IF EXISTS "Auditees can create action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can update action plans" ON action_plans;
DROP POLICY IF EXISTS "Auditees can update their action plans" ON action_plans;
DROP POLICY IF EXISTS "Users can delete action plans" ON action_plans;
DROP POLICY IF EXISTS "Auditors can delete action plans" ON action_plans;

-- Auditors: Full access to all action plans
CREATE POLICY "Auditors can view all action plans"
  ON action_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_plans.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN', 'VIEWER')
    )
  );

-- Auditees: Can view action plans for their assigned findings
CREATE POLICY "Auditees can view their action plans"
  ON action_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      JOIN audit_findings af ON af.id = action_plans.finding_id
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_plans.tenant_id
        AND ut.role = 'AUDITEE'
        AND af.assigned_auditee_id = auth.uid()
    )
  );

-- Auditees: Can create action plans for their assigned findings
CREATE POLICY "Auditees can create action plans"
  ON action_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      JOIN audit_findings af ON af.id = action_plans.finding_id
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_plans.tenant_id
        AND (
          ut.role IN ('AUDITOR', 'ADMIN')
          OR (ut.role = 'AUDITEE' AND af.assigned_auditee_id = auth.uid())
        )
    )
  );

-- Auditees: Can update their own action plans
CREATE POLICY "Auditees can update their action plans"
  ON action_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      JOIN audit_findings af ON af.id = action_plans.finding_id
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_plans.tenant_id
        AND (
          ut.role IN ('AUDITOR', 'ADMIN')
          OR (ut.role = 'AUDITEE' AND af.assigned_auditee_id = auth.uid())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      JOIN audit_findings af ON af.id = action_plans.finding_id
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_plans.tenant_id
        AND (
          ut.role IN ('AUDITOR', 'ADMIN')
          OR (ut.role = 'AUDITEE' AND af.assigned_auditee_id = auth.uid())
        )
    )
  );

-- Only Admins and Auditors can delete action plans
CREATE POLICY "Auditors can delete action plans"
  ON action_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = action_plans.tenant_id
        AND ut.role IN ('AUDITOR', 'ADMIN')
    )
  );

-- =====================================================
-- 5. FINDING_COMMENTS: BOTH ROLES CAN PARTICIPATE
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view finding comments in tenant" ON finding_comments;
DROP POLICY IF EXISTS "Users can view relevant comments" ON finding_comments;
DROP POLICY IF EXISTS "Users can create finding comments" ON finding_comments;
DROP POLICY IF EXISTS "Users can create comments" ON finding_comments;
DROP POLICY IF EXISTS "Users can update own comments" ON finding_comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON finding_comments;

-- View: Auditors see all, Auditees see comments on their assigned findings
CREATE POLICY "Users can view relevant comments"
  ON finding_comments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      JOIN audit_findings af ON af.id = finding_comments.finding_id
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = finding_comments.tenant_id
        AND (
          ut.role IN ('AUDITOR', 'ADMIN', 'VIEWER')
          OR (ut.role = 'AUDITEE' AND af.assigned_auditee_id = auth.uid())
        )
    )
  );

-- Create: Both roles can comment on findings they can access
CREATE POLICY "Users can create comments"
  ON finding_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      JOIN audit_findings af ON af.id = finding_comments.finding_id
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = finding_comments.tenant_id
        AND (
          ut.role IN ('AUDITOR', 'ADMIN')
          OR (ut.role = 'AUDITEE' AND af.assigned_auditee_id = auth.uid())
        )
    )
    AND finding_comments.author_id = auth.uid()
  );

-- Update: Users can only update their own comments
CREATE POLICY "Users can update own comments"
  ON finding_comments FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- =====================================================
-- 6. HELPER FUNCTION: GET USER ROLE
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role_in_tenant(p_user_id uuid, p_tenant_id uuid)
RETURNS text AS $$
  SELECT role
  FROM user_tenants
  WHERE user_id = p_user_id AND tenant_id = p_tenant_id
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- =====================================================
-- 7. POLICY COMMENTS
-- =====================================================

COMMENT ON POLICY "Auditors can view finding secrets" ON finding_secrets IS
  'IRON CURTAIN: Only Auditors and Admins can access sensitive finding data (RCA, internal notes)';

COMMENT ON POLICY "Auditees can view assigned findings" ON audit_findings IS
  'Auditees can only see findings where they are explicitly assigned via assigned_auditee_id';

COMMENT ON POLICY "Auditees can create action plans" ON action_plans IS
  'Auditees can propose remediation plans for findings assigned to them';

COMMENT ON FUNCTION get_user_role_in_tenant IS
  'Helper function to quickly retrieve user role for a specific tenant. Used in application logic.';
