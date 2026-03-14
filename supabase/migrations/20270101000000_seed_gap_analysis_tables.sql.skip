-- ==============================================================================
-- WAVE XX SEED: Gap Analysis Missing Tables
-- ==============================================================================

-- 1. stakeholders
INSERT INTO public.stakeholders (id, tenant_id, name, email, role, department) VALUES
  ('ea000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Ayşe Yılmaz', 'ayse@sentinelbank.com.tr', 'CFO', 'Finance'),
  ('ea000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Mehmet Demir', 'mehmet@sentinelbank.com.tr', 'CTO', 'IT'),
  ('ea000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'Zeynep Kaya', 'zeynep@sentinelbank.com.tr', 'CRO', 'Risk')
ON CONFLICT DO NOTHING;

-- 2. data_sources
INSERT INTO public.data_sources (id, name, source_type, status, last_sync_at) VALUES
  ('eb000000-0000-0000-0000-000000000001', 'Core Banking Oracle', 'CORE_BANKING', 'ACTIVE', '2026-03-08T10:00:00Z'),
  ('eb000000-0000-0000-0000-000000000002', 'HRMS SAP', 'HR', 'ACTIVE', '2026-03-08T09:30:00Z')
ON CONFLICT DO NOTHING;

-- 3. automation_rules
INSERT INTO public.automation_rules (id, tenant_id, title, description, trigger_event, conditions, actions, is_active) VALUES
  ('ec000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'High Risk Finding Alert', 'Alert CAE on CRITICAL finding', 'FINDING_CREATED', '{"severity":"CRITICAL"}', '[{"type":"EMAIL","target":"cae@sentinelbank.com.tr"}]', true),
  ('ec000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'Action Overdue Notification', 'Notify Action Owner', 'ACTION_OVERDUE', '{"status":"overdue"}', '[{"type":"IN_APP_NOTIFICATION"}]', true)
ON CONFLICT DO NOTHING;



-- 5. playbook_entries
INSERT INTO public.playbook_entries (id, tenant_id, title, content, tags, author_id) VALUES
  ('ee000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Incident Response Standard', 'Standard operating procedure for data breach', ARRAY['security', 'incident']::text[], '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

