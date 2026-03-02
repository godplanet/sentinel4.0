/*
  GIAS 9.2 Kapasite Eskalasyonu — Yönetim Kuruluna bildirim
  Çakışma ve kaynak yetersizliğinin resmi eskale kaydı.
*/

CREATE TABLE IF NOT EXISTS escalation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  report_type text NOT NULL DEFAULT 'GIAS_9_2_CAPACITY' CHECK (report_type IN ('GIAS_9_2_CAPACITY', 'BUDGET', 'OTHER')),
  summary text NOT NULL,
  details jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACKNOWLEDGED', 'RESOLVED')),
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_escalation_reports_tenant ON escalation_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_escalation_reports_created ON escalation_reports(created_at DESC);

ALTER TABLE escalation_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read escalation_reports"
  ON escalation_reports FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated insert escalation_reports"
  ON escalation_reports FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Service role full access escalation_reports"
  ON escalation_reports FOR ALL TO service_role USING (true) WITH CHECK (true);
