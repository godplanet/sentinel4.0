-- =============================================================================
-- Wave 35: SOX / ICFR & Skeptic Agent — Şüpheci İtiraz Kayıt Tablosu
-- =============================================================================
-- Skeptic Agent itirazlarını audit-trail olarak kayıt altına alır.
-- Bu tablo PresidentDashboard'daki AI Challenge badge veri kaynağıdır.
-- =============================================================================

CREATE TABLE IF NOT EXISTS skeptic_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  control_id uuid REFERENCES sox_controls(id) ON DELETE SET NULL,
  control_code text NOT NULL,
  department text,
  proposed_status text NOT NULL DEFAULT 'Effective'
    CHECK (proposed_status IN ('Effective', 'Ineffective', 'Not_Tested')),
  severity text NOT NULL DEFAULT 'warning'
    CHECK (severity IN ('warning', 'critical')),
  incident_count integer NOT NULL DEFAULT 0,
  ai_message text NOT NULL,
  justification text DEFAULT '',
  resolution text NOT NULL DEFAULT 'Pending'
    CHECK (resolution IN ('Pending', 'Override', 'Withdrawn')),
  resolved_by text,
  resolved_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skeptic_challenges_tenant   ON skeptic_challenges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_skeptic_challenges_control  ON skeptic_challenges(control_id);
CREATE INDEX IF NOT EXISTS idx_skeptic_challenges_severity ON skeptic_challenges(severity);
CREATE INDEX IF NOT EXISTS idx_skeptic_challenges_created  ON skeptic_challenges(created_at DESC);

ALTER TABLE skeptic_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read skeptic_challenges"
  ON skeptic_challenges FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert skeptic_challenges"
  ON skeptic_challenges FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update skeptic_challenges"
  ON skeptic_challenges FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated read skeptic_challenges"
  ON skeptic_challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert skeptic_challenges"
  ON skeptic_challenges FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update skeptic_challenges"
  ON skeptic_challenges FOR UPDATE TO authenticated USING (true);
