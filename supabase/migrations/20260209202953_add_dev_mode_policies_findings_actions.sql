/*
  # Add Dev Mode Policies for Findings and Actions

  1. Security Changes (DEV MODE ONLY)
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `audit_findings`
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `action_plans`
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `finding_comments`
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `finding_secrets`
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `finding_history`
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `assignments`

  2. Important Notes
    - These policies enable development/demo mode without authentication
    - All policies are scoped to the anon role
    - MUST BE REMOVED OR RESTRICTED in production environment
*/

-- ═══════════════════════════════════════════════════════════════
-- AUDIT_FINDINGS
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Anon can view findings (dev)"
  ON audit_findings FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can create findings (dev)"
  ON audit_findings FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update findings (dev)"
  ON audit_findings FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete findings (dev)"
  ON audit_findings FOR DELETE TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- ACTION_PLANS
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Anon can view action plans (dev)"
  ON action_plans FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can create action plans (dev)"
  ON action_plans FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update action plans (dev)"
  ON action_plans FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete action plans (dev)"
  ON action_plans FOR DELETE TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- FINDING_COMMENTS
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Anon can view comments (dev)"
  ON finding_comments FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can create comments (dev)"
  ON finding_comments FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update comments (dev)"
  ON finding_comments FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete comments (dev)"
  ON finding_comments FOR DELETE TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- FINDING_SECRETS
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Anon can view secrets (dev)"
  ON finding_secrets FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can create secrets (dev)"
  ON finding_secrets FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update secrets (dev)"
  ON finding_secrets FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete secrets (dev)"
  ON finding_secrets FOR DELETE TO anon
  USING (true);

-- ═══════════════════════════════════════════════════════════════
-- FINDING_HISTORY
-- ═══════════════════════════════════════════════════════════════

CREATE POLICY "Anon can view history (dev)"
  ON finding_history FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can create history (dev)"
  ON finding_history FOR INSERT TO anon
  WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- ASSIGNMENTS
-- ═══════════════════════════════════════════════════════════════

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'assignments') THEN
    EXECUTE 'CREATE POLICY "Anon can view assignments (dev)"
      ON assignments FOR SELECT TO anon
      USING (true)';

    EXECUTE 'CREATE POLICY "Anon can create assignments (dev)"
      ON assignments FOR INSERT TO anon
      WITH CHECK (true)';

    EXECUTE 'CREATE POLICY "Anon can update assignments (dev)"
      ON assignments FOR UPDATE TO anon
      USING (true)
      WITH CHECK (true)';

    EXECUTE 'CREATE POLICY "Anon can delete assignments (dev)"
      ON assignments FOR DELETE TO anon
      USING (true)';
  END IF;
END $$;
