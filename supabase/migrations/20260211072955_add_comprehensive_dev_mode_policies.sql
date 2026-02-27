/*
  # Add comprehensive dev mode policies for all tables

  1. Changes
    - Add public SELECT, INSERT, UPDATE, DELETE policies for all core tables
    - Required for browser-based seeder to work with anon key

  2. Tables affected
    - audit_entities (add DELETE)
    - audit_engagements (add DELETE)
    - audit_findings (add DELETE)
    - workpapers (add DELETE)
    - audit_steps (add all public policies)
    - action_plans (add all public policies)
    - reports (add all public policies)
    - risk_library (add public INSERT, DELETE)
    - audit_plans (add all public policies)
    - finding_history (add all public policies)
    - review_notes (add DELETE)
    - program_templates (add DELETE)

  3. Security
    - These are dev mode only policies for demo/testing environment
*/

-- Helper: create dev mode policies if they don't exist
-- audit_entities: add DELETE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_entities' AND policyname = 'Dev mode public delete entities') THEN
    CREATE POLICY "Dev mode public delete entities" ON audit_entities FOR DELETE TO public USING (true);
  END IF;
END $$;

-- audit_engagements: add DELETE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_engagements' AND policyname = 'Dev mode public delete engagements') THEN
    CREATE POLICY "Dev mode public delete engagements" ON audit_engagements FOR DELETE TO public USING (true);
  END IF;
END $$;

-- audit_findings: add DELETE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_findings' AND policyname = 'Dev mode public delete findings') THEN
    CREATE POLICY "Dev mode public delete findings" ON audit_findings FOR DELETE TO public USING (true);
  END IF;
END $$;

-- workpapers: add DELETE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workpapers' AND policyname = 'Dev mode public delete workpapers') THEN
    CREATE POLICY "Dev mode public delete workpapers" ON workpapers FOR DELETE TO public USING (true);
  END IF;
END $$;

-- audit_steps: add all public policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_steps' AND policyname = 'Dev mode public read steps') THEN
    CREATE POLICY "Dev mode public read steps" ON audit_steps FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_steps' AND policyname = 'Dev mode public insert steps') THEN
    CREATE POLICY "Dev mode public insert steps" ON audit_steps FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_steps' AND policyname = 'Dev mode public update steps') THEN
    CREATE POLICY "Dev mode public update steps" ON audit_steps FOR UPDATE TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_steps' AND policyname = 'Dev mode public delete steps') THEN
    CREATE POLICY "Dev mode public delete steps" ON audit_steps FOR DELETE TO public USING (true);
  END IF;
END $$;

-- action_plans: add all public policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'action_plans' AND policyname = 'Dev mode public read actions') THEN
    CREATE POLICY "Dev mode public read actions" ON action_plans FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'action_plans' AND policyname = 'Dev mode public insert actions') THEN
    CREATE POLICY "Dev mode public insert actions" ON action_plans FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'action_plans' AND policyname = 'Dev mode public update actions') THEN
    CREATE POLICY "Dev mode public update actions" ON action_plans FOR UPDATE TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'action_plans' AND policyname = 'Dev mode public delete actions') THEN
    CREATE POLICY "Dev mode public delete actions" ON action_plans FOR DELETE TO public USING (true);
  END IF;
END $$;

-- reports: add all public policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Dev mode public read reports') THEN
    CREATE POLICY "Dev mode public read reports" ON reports FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Dev mode public insert reports') THEN
    CREATE POLICY "Dev mode public insert reports" ON reports FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Dev mode public update reports') THEN
    CREATE POLICY "Dev mode public update reports" ON reports FOR UPDATE TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reports' AND policyname = 'Dev mode public delete reports') THEN
    CREATE POLICY "Dev mode public delete reports" ON reports FOR DELETE TO public USING (true);
  END IF;
END $$;

-- risk_library: add public INSERT and DELETE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'risk_library' AND policyname = 'Dev mode public insert risks') THEN
    CREATE POLICY "Dev mode public insert risks" ON risk_library FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'risk_library' AND policyname = 'Dev mode public delete risks') THEN
    CREATE POLICY "Dev mode public delete risks" ON risk_library FOR DELETE TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'risk_library' AND policyname = 'Dev mode public update risks') THEN
    CREATE POLICY "Dev mode public update risks" ON risk_library FOR UPDATE TO public USING (true) WITH CHECK (true);
  END IF;
END $$;

-- audit_plans: add all public policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_plans' AND policyname = 'Dev mode public read plans') THEN
    CREATE POLICY "Dev mode public read plans" ON audit_plans FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_plans' AND policyname = 'Dev mode public insert plans') THEN
    CREATE POLICY "Dev mode public insert plans" ON audit_plans FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_plans' AND policyname = 'Dev mode public update plans') THEN
    CREATE POLICY "Dev mode public update plans" ON audit_plans FOR UPDATE TO public USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_plans' AND policyname = 'Dev mode public delete plans') THEN
    CREATE POLICY "Dev mode public delete plans" ON audit_plans FOR DELETE TO public USING (true);
  END IF;
END $$;

-- finding_history: add public policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finding_history' AND policyname = 'Dev mode public read history') THEN
    CREATE POLICY "Dev mode public read history" ON finding_history FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finding_history' AND policyname = 'Dev mode public insert history') THEN
    CREATE POLICY "Dev mode public insert history" ON finding_history FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'finding_history' AND policyname = 'Dev mode public delete history') THEN
    CREATE POLICY "Dev mode public delete history" ON finding_history FOR DELETE TO public USING (true);
  END IF;
END $$;

-- review_notes: add DELETE
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_notes' AND policyname = 'Dev mode public read notes') THEN
    CREATE POLICY "Dev mode public read notes" ON review_notes FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_notes' AND policyname = 'Dev mode public insert notes') THEN
    CREATE POLICY "Dev mode public insert notes" ON review_notes FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_notes' AND policyname = 'Dev mode public delete notes') THEN
    CREATE POLICY "Dev mode public delete notes" ON review_notes FOR DELETE TO public USING (true);
  END IF;
END $$;

-- workpaper_findings: add public policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workpaper_findings' AND policyname = 'Dev mode public read wp findings') THEN
    CREATE POLICY "Dev mode public read wp findings" ON workpaper_findings FOR SELECT TO public USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workpaper_findings' AND policyname = 'Dev mode public insert wp findings') THEN
    CREATE POLICY "Dev mode public insert wp findings" ON workpaper_findings FOR INSERT TO public WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workpaper_findings' AND policyname = 'Dev mode public delete wp findings') THEN
    CREATE POLICY "Dev mode public delete wp findings" ON workpaper_findings FOR DELETE TO public USING (true);
  END IF;
END $$;
