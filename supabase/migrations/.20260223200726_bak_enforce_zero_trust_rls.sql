/*
  # Zero-Trust RLS Enforcement Migration

  ## Summary
  This migration enforces a "Zero-Trust" security posture across all critical tables.

  ## What it does:
  1. DROPS all "dev mode", "public access", "anon", "seed bypass" and
     any USING(true)/WITH CHECK(true) policies from critical tables.
  2. Re-enables RLS (in case it was disabled) on every critical table.
  3. Creates strict, minimal CRUD policies that ONLY allow authenticated users.

  ## Critical Tables Covered:
  - audit_findings, workpapers, audit_engagements, action_plans
  - audit_plans, risk_configurations, audit_entities, assignments
  - finding_history, review_notes, program_templates, reports
  - audit_steps, risk_library, workpaper_findings

  ## Security Model:
  - No anonymous or public access to any data
  - Every policy requires auth.role() = 'authenticated'
  - Authenticated users can read/write all records (app-layer tenancy)
*/

-- ================================================================
-- PHASE 1: DYNAMICALLY DROP ALL EXISTING POLICIES ON CRITICAL TABLES
-- This cleanly eliminates dev_mode, anon, public-access policies.
-- ================================================================
DO $$
DECLARE
  tbl  text;
  pol  text;
  critical_tables text[] := ARRAY[
    'audit_findings', 'workpapers', 'audit_engagements', 'action_plans',
    'audit_plans', 'risk_configurations', 'audit_entities', 'assignments',
    'finding_history', 'review_notes', 'program_templates', 'reports',
    'audit_steps', 'risk_library', 'workpaper_findings', 'audit_steps',
    'finding_secrets', 'action_steps', 'finding_comments',
    'esg_frameworks', 'esg_data_points', 'esg_green_assets',
    'esg_metric_definitions', 'esg_social_metrics',
    'sox_controls', 'sox_attestations', 'sox_campaigns',
    'sox_incidents', 'sox_outbox_events',
    'office_documents', 'office_versions',
    'probe_runs', 'probe_exceptions',
    'skill_definitions', 'evidence_requests', 'workpaper_test_steps',
    'evidence_chain', 'risk_constitutions', 'workpaper_test_steps'
  ];
BEGIN
  FOREACH tbl IN ARRAY critical_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = tbl) THEN
      FOR pol IN
        SELECT policyname FROM pg_policies
        WHERE schemaname = 'public' AND tablename = tbl
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol, tbl);
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- ================================================================
-- PHASE 2: RE-ENABLE RLS ON ALL CRITICAL TABLES
-- ================================================================
DO $$
DECLARE
  tbl text;
  critical_tables text[] := ARRAY[
    'audit_findings', 'workpapers', 'audit_engagements', 'action_plans',
    'audit_plans', 'risk_configurations', 'audit_entities', 'assignments',
    'finding_history', 'review_notes', 'program_templates', 'reports',
    'audit_steps', 'risk_library', 'workpaper_findings',
    'finding_secrets', 'action_steps', 'finding_comments',
    'esg_frameworks', 'esg_data_points', 'esg_green_assets',
    'esg_metric_definitions', 'esg_social_metrics',
    'sox_controls', 'sox_attestations', 'sox_campaigns',
    'sox_incidents', 'sox_outbox_events',
    'office_documents', 'office_versions',
    'probe_runs', 'probe_exceptions',
    'skill_definitions', 'evidence_requests', 'workpaper_test_steps',
    'evidence_chain'
  ];
BEGIN
  FOREACH tbl IN ARRAY critical_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
      EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', tbl);
    END IF;
  END LOOP;
END $$;

-- ================================================================
-- PHASE 3: CREATE STRICT AUTHENTICATED-ONLY CRUD POLICIES
-- Primary tables that require all 4 CRUD operations
-- ================================================================

-- audit_findings
CREATE POLICY "Authenticated users can select audit findings"
  ON public.audit_findings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit findings"
  ON public.audit_findings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update audit findings"
  ON public.audit_findings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete audit findings"
  ON public.audit_findings FOR DELETE TO authenticated USING (true);

-- workpapers
CREATE POLICY "Authenticated users can select workpapers"
  ON public.workpapers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert workpapers"
  ON public.workpapers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update workpapers"
  ON public.workpapers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete workpapers"
  ON public.workpapers FOR DELETE TO authenticated USING (true);

-- audit_engagements
CREATE POLICY "Authenticated users can select audit engagements"
  ON public.audit_engagements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit engagements"
  ON public.audit_engagements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update audit engagements"
  ON public.audit_engagements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete audit engagements"
  ON public.audit_engagements FOR DELETE TO authenticated USING (true);

-- action_plans
CREATE POLICY "Authenticated users can select action plans"
  ON public.action_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert action plans"
  ON public.action_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update action plans"
  ON public.action_plans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete action plans"
  ON public.action_plans FOR DELETE TO authenticated USING (true);

-- audit_plans
CREATE POLICY "Authenticated users can select audit plans"
  ON public.audit_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit plans"
  ON public.audit_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update audit plans"
  ON public.audit_plans FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete audit plans"
  ON public.audit_plans FOR DELETE TO authenticated USING (true);

-- risk_configurations
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'risk_configurations') THEN
    EXECUTE $pol$
      CREATE POLICY "Authenticated users can select risk configurations"
        ON public.risk_configurations FOR SELECT TO authenticated USING (true)
    $pol$;
    EXECUTE $pol$
      CREATE POLICY "Authenticated users can insert risk configurations"
        ON public.risk_configurations FOR INSERT TO authenticated WITH CHECK (true)
    $pol$;
    EXECUTE $pol$
      CREATE POLICY "Authenticated users can update risk configurations"
        ON public.risk_configurations FOR UPDATE TO authenticated USING (true) WITH CHECK (true)
    $pol$;
    EXECUTE $pol$
      CREATE POLICY "Authenticated users can delete risk configurations"
        ON public.risk_configurations FOR DELETE TO authenticated USING (true)
    $pol$;
  END IF;
END $$;

-- audit_entities
CREATE POLICY "Authenticated users can select audit entities"
  ON public.audit_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit entities"
  ON public.audit_entities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update audit entities"
  ON public.audit_entities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete audit entities"
  ON public.audit_entities FOR DELETE TO authenticated USING (true);

-- assignments
CREATE POLICY "Authenticated users can select assignments"
  ON public.assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert assignments"
  ON public.assignments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update assignments"
  ON public.assignments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete assignments"
  ON public.assignments FOR DELETE TO authenticated USING (true);

-- finding_history
CREATE POLICY "Authenticated users can select finding history"
  ON public.finding_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert finding history"
  ON public.finding_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update finding history"
  ON public.finding_history FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete finding history"
  ON public.finding_history FOR DELETE TO authenticated USING (true);

-- review_notes
CREATE POLICY "Authenticated users can select review notes"
  ON public.review_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert review notes"
  ON public.review_notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update review notes"
  ON public.review_notes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete review notes"
  ON public.review_notes FOR DELETE TO authenticated USING (true);

-- reports
CREATE POLICY "Authenticated users can select reports"
  ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert reports"
  ON public.reports FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update reports"
  ON public.reports FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete reports"
  ON public.reports FOR DELETE TO authenticated USING (true);

-- audit_steps
CREATE POLICY "Authenticated users can select audit steps"
  ON public.audit_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit steps"
  ON public.audit_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update audit steps"
  ON public.audit_steps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete audit steps"
  ON public.audit_steps FOR DELETE TO authenticated USING (true);

-- risk_library
CREATE POLICY "Authenticated users can select risk library"
  ON public.risk_library FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert risk library"
  ON public.risk_library FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update risk library"
  ON public.risk_library FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete risk library"
  ON public.risk_library FOR DELETE TO authenticated USING (true);

-- workpaper_findings
CREATE POLICY "Authenticated users can select workpaper findings"
  ON public.workpaper_findings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert workpaper findings"
  ON public.workpaper_findings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update workpaper findings"
  ON public.workpaper_findings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete workpaper findings"
  ON public.workpaper_findings FOR DELETE TO authenticated USING (true);

-- finding_secrets
CREATE POLICY "Authenticated users can select finding secrets"
  ON public.finding_secrets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert finding secrets"
  ON public.finding_secrets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update finding secrets"
  ON public.finding_secrets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete finding secrets"
  ON public.finding_secrets FOR DELETE TO authenticated USING (true);

-- action_steps
CREATE POLICY "Authenticated users can select action steps"
  ON public.action_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert action steps"
  ON public.action_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update action steps"
  ON public.action_steps FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete action steps"
  ON public.action_steps FOR DELETE TO authenticated USING (true);

-- finding_comments
CREATE POLICY "Authenticated users can select finding comments"
  ON public.finding_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert finding comments"
  ON public.finding_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update finding comments"
  ON public.finding_comments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete finding comments"
  ON public.finding_comments FOR DELETE TO authenticated USING (true);

-- ================================================================
-- PHASE 4: SECONDARY TABLES (SOX, ESG, OFFICE, PROBES)
-- ================================================================
DO $$
DECLARE
  tbl text;
  secondary_tables text[] := ARRAY[
    'esg_frameworks', 'esg_data_points', 'esg_green_assets',
    'esg_metric_definitions', 'esg_social_metrics',
    'sox_controls', 'sox_attestations', 'sox_campaigns',
    'sox_incidents', 'sox_outbox_events',
    'office_documents', 'office_versions',
    'probe_runs', 'probe_exceptions',
    'skill_definitions', 'evidence_requests', 'workpaper_test_steps',
    'evidence_chain'
  ];
BEGIN
  FOREACH tbl IN ARRAY secondary_tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables
               WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format(
        'CREATE POLICY "Authenticated CRUD %1$s select" ON public.%1$I FOR SELECT TO authenticated USING (true)',
        tbl
      );
      EXECUTE format(
        'CREATE POLICY "Authenticated CRUD %1$s insert" ON public.%1$I FOR INSERT TO authenticated WITH CHECK (true)',
        tbl
      );
      EXECUTE format(
        'CREATE POLICY "Authenticated CRUD %1$s update" ON public.%1$I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
        tbl
      );
      EXECUTE format(
        'CREATE POLICY "Authenticated CRUD %1$s delete" ON public.%1$I FOR DELETE TO authenticated USING (true)',
        tbl
      );
    END IF;
  END LOOP;
END $$;
