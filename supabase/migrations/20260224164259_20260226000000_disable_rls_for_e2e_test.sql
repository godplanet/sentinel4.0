/*
  # E2E Test: RLS Bypass Policies

  ## Purpose
  Adds permissive "dev mode" RLS policies to core audit tables so that
  end-to-end integration tests can INSERT/SELECT/UPDATE/DELETE without
  needing an authenticated Supabase session.

  ## Tables Affected
  - audit_entities
  - audit_plans
  - audit_engagements
  - audit_steps
  - workpapers
  - workpaper_findings
  - audit_findings
  - actions

  ## Security Notes
  - These policies target the `anon` and `authenticated` roles.
  - Existing production policies are NOT dropped; these are additive.
  - Must be removed / disabled before deploying to production.
*/

-- audit_entities
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_entities' AND policyname = 'e2e_bypass_all'
  ) THEN
    CREATE POLICY "e2e_bypass_all"
      ON audit_entities
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- audit_plans
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_plans' AND policyname = 'e2e_bypass_all'
  ) THEN
    CREATE POLICY "e2e_bypass_all"
      ON audit_plans
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- audit_engagements
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_engagements' AND policyname = 'e2e_bypass_all'
  ) THEN
    CREATE POLICY "e2e_bypass_all"
      ON audit_engagements
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- audit_steps
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_steps' AND policyname = 'e2e_bypass_all'
  ) THEN
    CREATE POLICY "e2e_bypass_all"
      ON audit_steps
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- workpapers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'workpapers' AND policyname = 'e2e_bypass_all'
  ) THEN
    CREATE POLICY "e2e_bypass_all"
      ON workpapers
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- workpaper_findings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'workpaper_findings' AND policyname = 'e2e_bypass_all'
  ) THEN
    CREATE POLICY "e2e_bypass_all"
      ON workpaper_findings
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- audit_findings
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'audit_findings' AND policyname = 'e2e_bypass_all'
  ) THEN
    CREATE POLICY "e2e_bypass_all"
      ON audit_findings
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- actions
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'actions' AND policyname = 'e2e_bypass_all'
  ) THEN
    CREATE POLICY "e2e_bypass_all"
      ON actions
      FOR ALL
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
