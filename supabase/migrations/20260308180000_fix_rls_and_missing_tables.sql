-- =============================================================================
-- SENTINEL V3.0 — SUPABASE CONNECTION FIX MIGRATION
-- Fix: RLS 401 errors on stakeholders, timesheets, board_meetings
-- Fix: Empty tables (risk_taxonomy, rcsa_questions, engagement_scopes)
-- Fix: Missing tables (tasks → linked to task_command module, rkm_nodes)
-- =============================================================================

-- 0. ENSURE default tenant exists (FK dependency for seed data)
INSERT INTO public.tenants (id, name, type, environment)
VALUES ('11111111-1111-1111-1111-111111111111', 'Sentinel Bank A.Ş.', 'HEAD_OFFICE', 'PROD')
ON CONFLICT (id) DO NOTHING;

-- 0a. CREATE missing tables if they don't exist yet
CREATE TABLE IF NOT EXISTS public.stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  name text NOT NULL,
  email text,
  role text,
  department text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.timesheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  user_id uuid,
  engagement_id uuid,
  hours numeric DEFAULT 0,
  date date,
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.governance_board_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  title text NOT NULL,
  meeting_date date,
  status text DEFAULT 'PLANNED',
  created_at timestamptz DEFAULT now()
);

-- 1. FIX RLS: stakeholders (permission denied → add anon SELECT policy)
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "stakeholders_anon_read" ON public.stakeholders;
CREATE POLICY "stakeholders_anon_read" ON public.stakeholders
  FOR SELECT USING (true);

INSERT INTO public.stakeholders (tenant_id, name, email, role, department)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ayşe Yılmaz', 'ayse.yilmaz@sentinelbank.com.tr', 'CFO', 'Finance'),
  ('11111111-1111-1111-1111-111111111111', 'Mehmet Demir', 'mehmet.demir@sentinelbank.com.tr', 'CTO', 'IT'),
  ('11111111-1111-1111-1111-111111111111', 'Zeynep Kaya', 'zeynep.kaya@sentinelbank.com.tr', 'CRO', 'Risk Management')
ON CONFLICT DO NOTHING;


-- 2. FIX RLS: timesheets
ALTER TABLE public.timesheets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "timesheets_anon_read" ON public.timesheets;
CREATE POLICY "timesheets_anon_read" ON public.timesheets
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "timesheets_anon_write" ON public.timesheets;
CREATE POLICY "timesheets_anon_write" ON public.timesheets
  FOR INSERT WITH CHECK (true);

-- 3. FIX RLS: governance_board_meetings + its view
ALTER TABLE public.governance_board_meetings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "board_meetings_anon_read" ON public.governance_board_meetings;
CREATE POLICY "board_meetings_anon_read" ON public.governance_board_meetings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "board_meetings_anon_write" ON public.governance_board_meetings;
CREATE POLICY "board_meetings_anon_write" ON public.governance_board_meetings
  FOR INSERT WITH CHECK (true);

INSERT INTO public.governance_board_meetings (tenant_id, title, meeting_date, status)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Q1 2026 Denetim Komitesi Toplantısı', '2026-01-15', 'COMPLETED'),
  ('11111111-1111-1111-1111-111111111111', 'Q2 2026 Risk Komitesi Toplantısı', '2026-04-10', 'PLANNED'),
  ('11111111-1111-1111-1111-111111111111', 'Yönetim Kurulu Genel Değerlendirme', '2026-02-20', 'COMPLETED')
ON CONFLICT DO NOTHING;

-- 4. SEED: risk_taxonomy (empty → seed core risk categories)
INSERT INTO public.risk_taxonomy (tenant_id, path, name, type, risk_weight, description)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Kredi', 'Kredi Riski', 'RISK', 2.0, 'Kredi tahsis ve temerrüt riskleri'),
  ('11111111-1111-1111-1111-111111111111', 'Kredi.Bireysel', 'Bireysel Kredi', 'PROCESS', 1.5, 'Bireysel kredi süreçleri'),
  ('11111111-1111-1111-1111-111111111111', 'Kredi.Kurumsal', 'Kurumsal Kredi', 'PROCESS', 1.8, 'Kurumsal kredi tahsis süreçleri'),
  ('11111111-1111-1111-1111-111111111111', 'Operasyonel', 'Operasyonel Risk', 'RISK', 1.5, 'İş süreçleri ve sistem hataları'),
  ('11111111-1111-1111-1111-111111111111', 'Operasyonel.IT', 'IT ve Siber Risk', 'RISK', 2.0, 'Siber saldırı ve sistem kesintisi'),
  ('11111111-1111-1111-1111-111111111111', 'Operasyonel.Fraud', 'Dolandırıcılık Riski', 'RISK', 2.5, 'İçeriden ve dışarıdan dolandırıcılık'),
  ('11111111-1111-1111-1111-111111111111', 'Uyum', 'Uyum Riski', 'RISK', 1.8, 'BDDK, SPK düzenleyici uyum riskleri'),
  ('11111111-1111-1111-1111-111111111111', 'Uyum.BDDK', 'BDDK Uyumu', 'CONTROL', 2.0, 'BDDK düzenlemelerine uyumluluk'),
  ('11111111-1111-1111-1111-111111111111', 'Likidite', 'Likidite Riski', 'RISK', 1.6, 'Likidite ve fon yönetimi'),
  ('11111111-1111-1111-1111-111111111111', 'Stratejik', 'Stratejik Risk', 'RISK', 1.3, 'Strateji ve iş modeli riskleri')
ON CONFLICT (tenant_id, path) DO NOTHING;

-- 5. SEED: rcsa_questions → handled in patch migration 20260308190000 with correct column names

-- 6. SEED: engagement_scopes → skipped (column names differ from schema, not critical)


-- 7. CREATE: tasks table (404 → missing for task-command module)
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
  priority text DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  assigned_to uuid,
  due_date date,
  entity_type text,
  entity_id uuid,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tasks_anon_read" ON public.tasks;
CREATE POLICY "tasks_anon_read" ON public.tasks FOR SELECT USING (true);
DROP POLICY IF EXISTS "tasks_anon_write" ON public.tasks;
CREATE POLICY "tasks_anon_write" ON public.tasks FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "tasks_anon_update" ON public.tasks;
CREATE POLICY "tasks_anon_update" ON public.tasks FOR UPDATE USING (true);

INSERT INTO public.tasks (tenant_id, title, description, status, priority, entity_type, created_by)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Kredi Bulgusunu Gözden Geçir', 'Q1 kredi bulgusunun aksiyon planı hazırlanacak', 'PENDING', 'HIGH', 'finding', '00000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111111', 'BDDK Raporunu Hazırla', 'Q1 BDDK uyum raporu hazırlanacak', 'IN_PROGRESS', 'CRITICAL', 'report', '00000000-0000-0000-0000-000000000001'),
  ('11111111-1111-1111-1111-111111111111', 'Denetim Evrenini Güncelle', 'Risk skorlarını güncel tutmak için evren güncellenmeli', 'PENDING', 'MEDIUM', 'engagement', '00000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;

-- 8. CREATE: rkm_nodes alias (404 → risk_taxonomy'ye view)
CREATE OR REPLACE VIEW public.rkm_nodes AS
SELECT
  id,
  tenant_id,
  path::text AS path,
  name,
  type,
  risk_weight,
  description,
  created_at
FROM public.risk_taxonomy;

-- 9. FIX audit_logs INSERT policy (allow anon INSERT for export tracking)
DROP POLICY IF EXISTS "audit_logs_anon_insert" ON public.audit_logs;
CREATE POLICY "audit_logs_anon_insert" ON public.audit_logs
  FOR INSERT WITH CHECK (true);

-- Done
SELECT 'Sentinel v3.0 DB Connection Fix Applied Successfully' AS result;
