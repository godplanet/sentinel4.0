/*
  # Security Patch: Enable Public Access for Test Environment
  
  ## Purpose
  Enable frontend to read and write to the database in test/development environment.
  This migration applies public access policies to all existing tables.
  
  ## Security Warning
  
  ⚠️ **CRITICAL**: This configuration uses `USING (true) WITH CHECK (true)` which grants
  unrestricted access to all users. This is ONLY acceptable for development/test environments.
  
  **For Production**: Replace with tenant-based RLS policies that check:
  - `tenant_id = current_setting('app.tenant_id')::uuid`
  - User authentication with `TO authenticated`
  - Role-based access control
  
  ## Tables Covered (68 total)
  
  ### Core Audit Tables
  - audit_engagements, audit_findings, audit_steps
  - audit_plans, audit_plans_v2, audit_entities
  - workpapers, workpaper_findings
  - engagement_scopes
  
  ### Findings & Actions
  - action_plans, actions, action_steps, action_requests
  - action_evidence, action_logs
  - finding_comments, finding_evidence, finding_history
  - finding_secrets, finding_workflow_states
  - workflow_transitions, assignments
  
  ### Risk & Knowledge Management
  - risk_library, risk_history, risk_parameters, risk_taxonomy
  - rkm_library, rkm_risks, rkm_processes, rkm_templates
  - library_risks, library_processes, library_controls
  - universe_risk_scores
  
  ### Strategy & Planning
  - strategic_bank_goals, strategic_audit_objectives
  - strategy_alignment_matrix
  
  ### Governance & Compliance
  - governance_docs, policies, policy_attestations
  - compliance_frameworks, framework_requirements
  - control_mappings
  
  ### Monitoring & Incidents
  - probes, probe_logs
  - incidents
  - quant_scenarios
  
  ### GIAS 2024 Modules
  - surveys, survey_responses
  - qaip_checklists, qaip_reviews
  - auditor_profiles, training_records
  - auditor_declarations
  
  ### Reporting
  - reports, report_versions, report_blocks
  - review_notes
  
  ### Execution Support
  - pbc_requests, time_logs
  - auditee_responses, response_milestones
  - evidence_chain
  
  ### System
  - system_definitions, methodology_settings
  - grading_methodology
  - tenants, user_tenants
  - event_outbox, audit_logs
*/

-- Helper function to safely enable RLS and create public policy
CREATE OR REPLACE FUNCTION enable_public_access(table_name text) 
RETURNS void AS $$
BEGIN
  -- Enable RLS
  EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', table_name);
  
  -- Drop existing public access policy if it exists
  EXECUTE format('DROP POLICY IF EXISTS "Public Access" ON public.%I', table_name);
  
  -- Create new public access policy
  EXECUTE format('CREATE POLICY "Public Access" ON public.%I FOR ALL USING (true) WITH CHECK (true)', table_name);
  
  RAISE NOTICE 'Enabled public access for: %', table_name;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Skipped % (error: %)', table_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Apply public access to all tables
SELECT enable_public_access('action_evidence');
SELECT enable_public_access('action_logs');
SELECT enable_public_access('action_plans');
SELECT enable_public_access('action_requests');
SELECT enable_public_access('action_steps');
SELECT enable_public_access('actions');
SELECT enable_public_access('assignments');
SELECT enable_public_access('audit_engagements');
SELECT enable_public_access('audit_entities');
SELECT enable_public_access('audit_findings');
SELECT enable_public_access('audit_logs');
SELECT enable_public_access('audit_plans');
SELECT enable_public_access('audit_plans_v2');
SELECT enable_public_access('audit_steps');
SELECT enable_public_access('auditee_responses');
SELECT enable_public_access('auditor_declarations');
SELECT enable_public_access('auditor_profiles');
SELECT enable_public_access('compliance_frameworks');
SELECT enable_public_access('control_mappings');
SELECT enable_public_access('engagement_scopes');
SELECT enable_public_access('event_outbox');
SELECT enable_public_access('evidence_chain');
SELECT enable_public_access('finding_comments');
SELECT enable_public_access('finding_evidence');
SELECT enable_public_access('finding_history');
SELECT enable_public_access('finding_secrets');
SELECT enable_public_access('finding_workflow_states');
SELECT enable_public_access('framework_requirements');
SELECT enable_public_access('governance_docs');
SELECT enable_public_access('grading_methodology');
SELECT enable_public_access('incidents');
SELECT enable_public_access('library_controls');
SELECT enable_public_access('library_processes');
SELECT enable_public_access('library_risks');
SELECT enable_public_access('methodology_settings');
SELECT enable_public_access('pbc_requests');
SELECT enable_public_access('policies');
SELECT enable_public_access('policy_attestations');
SELECT enable_public_access('probe_logs');
SELECT enable_public_access('probes');
SELECT enable_public_access('qaip_checklists');
SELECT enable_public_access('qaip_reviews');
SELECT enable_public_access('quant_scenarios');
SELECT enable_public_access('report_blocks');
SELECT enable_public_access('report_versions');
SELECT enable_public_access('reports');
SELECT enable_public_access('response_milestones');
SELECT enable_public_access('review_notes');
SELECT enable_public_access('risk_history');
SELECT enable_public_access('risk_library');
SELECT enable_public_access('risk_parameters');
SELECT enable_public_access('risk_taxonomy');
SELECT enable_public_access('rkm_library');
SELECT enable_public_access('rkm_processes');
SELECT enable_public_access('rkm_risks');
SELECT enable_public_access('rkm_templates');
SELECT enable_public_access('strategic_audit_objectives');
SELECT enable_public_access('strategic_bank_goals');
SELECT enable_public_access('strategy_alignment_matrix');
SELECT enable_public_access('survey_responses');
SELECT enable_public_access('surveys');
SELECT enable_public_access('system_definitions');
SELECT enable_public_access('tenants');
SELECT enable_public_access('time_logs');
SELECT enable_public_access('training_records');
SELECT enable_public_access('universe_risk_scores');
SELECT enable_public_access('user_tenants');
SELECT enable_public_access('workflow_transitions');
SELECT enable_public_access('workpaper_findings');
SELECT enable_public_access('workpapers');

-- Clean up helper function
DROP FUNCTION IF EXISTS enable_public_access(text);

-- Verification Report
DO $$
DECLARE
  rec RECORD;
  total_count INT := 0;
  policy_count INT := 0;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'PUBLIC ACCESS VERIFICATION REPORT';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Count tables with RLS enabled
  FOR rec IN 
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
      AND rowsecurity = true
    ORDER BY tablename
  LOOP
    total_count := total_count + 1;
  END LOOP;
  
  -- Count public access policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND policyname = 'Public Access';
  
  RAISE NOTICE 'Tables with RLS enabled: %', total_count;
  RAISE NOTICE 'Public Access policies created: %', policy_count;
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
  RAISE NOTICE 'Status: Test environment security patch applied successfully';
  RAISE NOTICE '═══════════════════════════════════════════════════════════════';
END $$;
