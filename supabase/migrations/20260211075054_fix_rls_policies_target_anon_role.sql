/*
  # Fix RLS policies to explicitly target anon role
  
  1. Problem
    - Policies created with `TO public` are not being applied to the `anon` role in Supabase PostgREST
    - This causes all table counts to return 0 when queried via the Supabase JS client (anon key)
  
  2. Solution
    - Drop all `TO public` dev mode policies
    - Recreate them with `TO anon, authenticated` so both roles can access data
  
  3. Tables affected
    - audit_entities, audit_engagements, audit_findings, workpapers, audit_steps
    - action_plans, reports, risk_library, audit_plans, finding_history
    - review_notes, program_templates, workpaper_findings, user_profiles, tenants
    - compliance_regulations
*/

-- Drop all existing dev mode public policies and recreate with explicit anon targeting
DO $$ 
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname, tablename 
    FROM pg_policies 
    WHERE policyname LIKE 'Dev mode public%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- audit_entities
CREATE POLICY "anon_select_audit_entities" ON audit_entities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_audit_entities" ON audit_entities FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_audit_entities" ON audit_entities FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_audit_entities" ON audit_entities FOR DELETE TO anon, authenticated USING (true);

-- audit_engagements
CREATE POLICY "anon_select_audit_engagements" ON audit_engagements FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_audit_engagements" ON audit_engagements FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_audit_engagements" ON audit_engagements FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_audit_engagements" ON audit_engagements FOR DELETE TO anon, authenticated USING (true);

-- audit_findings
CREATE POLICY "anon_select_audit_findings" ON audit_findings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_audit_findings" ON audit_findings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_audit_findings" ON audit_findings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_audit_findings" ON audit_findings FOR DELETE TO anon, authenticated USING (true);

-- workpapers
CREATE POLICY "anon_select_workpapers" ON workpapers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_workpapers" ON workpapers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_workpapers" ON workpapers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_workpapers" ON workpapers FOR DELETE TO anon, authenticated USING (true);

-- audit_steps
CREATE POLICY "anon_select_audit_steps" ON audit_steps FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_audit_steps" ON audit_steps FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_audit_steps" ON audit_steps FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_audit_steps" ON audit_steps FOR DELETE TO anon, authenticated USING (true);

-- action_plans
CREATE POLICY "anon_select_action_plans" ON action_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_action_plans" ON action_plans FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_action_plans" ON action_plans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_action_plans" ON action_plans FOR DELETE TO anon, authenticated USING (true);

-- reports
CREATE POLICY "anon_select_reports" ON reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_reports" ON reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_reports" ON reports FOR DELETE TO anon, authenticated USING (true);

-- risk_library
CREATE POLICY "anon_select_risk_library" ON risk_library FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_risk_library" ON risk_library FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_risk_library" ON risk_library FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_risk_library" ON risk_library FOR DELETE TO anon, authenticated USING (true);

-- audit_plans
CREATE POLICY "anon_select_audit_plans" ON audit_plans FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_audit_plans" ON audit_plans FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_audit_plans" ON audit_plans FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_audit_plans" ON audit_plans FOR DELETE TO anon, authenticated USING (true);

-- finding_history
CREATE POLICY "anon_select_finding_history" ON finding_history FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_finding_history" ON finding_history FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_delete_finding_history" ON finding_history FOR DELETE TO anon, authenticated USING (true);

-- review_notes
CREATE POLICY "anon_select_review_notes" ON review_notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_review_notes" ON review_notes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_delete_review_notes" ON review_notes FOR DELETE TO anon, authenticated USING (true);

-- workpaper_findings
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'workpaper_findings') THEN
    CREATE POLICY "anon_select_workpaper_findings" ON workpaper_findings FOR SELECT TO anon, authenticated USING (true);
    CREATE POLICY "anon_insert_workpaper_findings" ON workpaper_findings FOR INSERT TO anon, authenticated WITH CHECK (true);
    CREATE POLICY "anon_delete_workpaper_findings" ON workpaper_findings FOR DELETE TO anon, authenticated USING (true);
  END IF;
END $$;

-- user_profiles (drop and recreate to ensure anon is explicitly targeted)
DROP POLICY IF EXISTS "Dev mode public read" ON user_profiles;
DROP POLICY IF EXISTS "Dev mode public insert" ON user_profiles;
DROP POLICY IF EXISTS "Dev mode public update" ON user_profiles;
DROP POLICY IF EXISTS "Dev mode public delete" ON user_profiles;
CREATE POLICY "anon_select_user_profiles" ON user_profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_user_profiles" ON user_profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_user_profiles" ON user_profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_user_profiles" ON user_profiles FOR DELETE TO anon, authenticated USING (true);

-- tenants
DROP POLICY IF EXISTS "Dev mode public read tenants" ON tenants;
DROP POLICY IF EXISTS "Dev mode public insert tenants" ON tenants;
DROP POLICY IF EXISTS "Dev mode public update tenants" ON tenants;
DROP POLICY IF EXISTS "Dev mode public delete tenants" ON tenants;
CREATE POLICY "anon_select_tenants" ON tenants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_insert_tenants" ON tenants FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "anon_update_tenants" ON tenants FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "anon_delete_tenants" ON tenants FOR DELETE TO anon, authenticated USING (true);
