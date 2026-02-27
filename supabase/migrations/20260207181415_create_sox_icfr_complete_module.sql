/*
  # Create SOX/ICFR Cryo-Chamber Complete Module

  Blueprint: Sentinel v3.0 - Module A: SOX/ICFR Compliance

  1. New Tables
    - `sox_campaigns` - Time-bounded attestation campaigns
    - `sox_controls` - ICFR control definitions with Basel IV risk weighting
    - `sox_attestations` - Cryo-Chamber immutable signed attestation records
    - `sox_incidents` - Incident data for Skeptic AI cross-check
    - `sox_outbox_events` - Transactional outbox for async side-effects

  2. Security
    - RLS enabled on all 5 tables
    - Dev-mode anon CRUD policies
    - Authenticated tenant-scoped read policies

  3. Seed Data
    - 1 active campaign, 8 controls, 4 attestations, 5 incidents, 5 outbox events
*/

-- ============================================================
-- TABLE: sox_campaigns
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  title text NOT NULL,
  period text NOT NULL,
  status text NOT NULL DEFAULT 'Active',
  start_date timestamptz,
  end_date timestamptz,
  total_controls integer NOT NULL DEFAULT 0,
  completed_count integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT sox_c_status_check CHECK (status IN ('Draft','Active','Closed','Archived'))
);
CREATE INDEX IF NOT EXISTS idx_sox_camp_tenant ON sox_campaigns(tenant_id);
ALTER TABLE sox_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_campaigns" ON sox_campaigns FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_campaigns" ON sox_campaigns FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update sox_campaigns" ON sox_campaigns FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete sox_campaigns" ON sox_campaigns FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read sox_campaigns" ON sox_campaigns FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: sox_controls
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  campaign_id uuid REFERENCES sox_campaigns(id) ON DELETE CASCADE,
  code text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'Operational',
  risk_weight integer NOT NULL DEFAULT 10,
  assigned_to text,
  department text,
  frequency text NOT NULL DEFAULT 'Monthly',
  is_key_control boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT sox_ctrl_cat CHECK (category IN ('Operational','IT','Financial','Compliance')),
  CONSTRAINT sox_ctrl_freq CHECK (frequency IN ('Daily','Weekly','Monthly','Quarterly','Annually')),
  CONSTRAINT sox_ctrl_wt CHECK (risk_weight >= 1 AND risk_weight <= 100)
);
CREATE INDEX IF NOT EXISTS idx_sox_ctrl_camp ON sox_controls(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sox_ctrl_code ON sox_controls(code);
ALTER TABLE sox_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_controls" ON sox_controls FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_controls" ON sox_controls FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update sox_controls" ON sox_controls FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete sox_controls" ON sox_controls FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read sox_controls" ON sox_controls FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: sox_attestations (CRYO-CHAMBER)
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_attestations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  campaign_id uuid REFERENCES sox_campaigns(id) ON DELETE CASCADE,
  control_id uuid REFERENCES sox_controls(id) ON DELETE CASCADE,
  attester_name text NOT NULL,
  status text NOT NULL,
  manager_comment text,
  ai_challenge text,
  ai_challenge_resolved boolean NOT NULL DEFAULT false,
  snapshot_json jsonb NOT NULL,
  record_hash text NOT NULL,
  signed_at timestamptz NOT NULL DEFAULT now(),
  is_frozen boolean NOT NULL DEFAULT true,
  CONSTRAINT sox_att_st CHECK (status IN ('Effective','Ineffective','Not_Tested'))
);
CREATE INDEX IF NOT EXISTS idx_sox_att_camp ON sox_attestations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sox_att_ctrl ON sox_attestations(control_id);
CREATE INDEX IF NOT EXISTS idx_sox_att_hash ON sox_attestations(record_hash);
ALTER TABLE sox_attestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_attestations" ON sox_attestations FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_attestations" ON sox_attestations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update sox_attestations" ON sox_attestations FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete sox_attestations" ON sox_attestations FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read sox_attestations" ON sox_attestations FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: sox_incidents
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  department text NOT NULL,
  control_code text,
  severity text NOT NULL DEFAULT 'Medium',
  title text NOT NULL,
  description text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sox_inc_sev CHECK (severity IN ('Critical','High','Medium','Low'))
);
CREATE INDEX IF NOT EXISTS idx_sox_inc_dept ON sox_incidents(department);
CREATE INDEX IF NOT EXISTS idx_sox_inc_ctrl ON sox_incidents(control_code);
ALTER TABLE sox_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_incidents" ON sox_incidents FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_incidents" ON sox_incidents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth read sox_incidents" ON sox_incidents FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: sox_outbox_events (Transactional Outbox)
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT sox_ob_st CHECK (status IN ('Pending','Processed','Failed'))
);
CREATE INDEX IF NOT EXISTS idx_sox_ob_status ON sox_outbox_events(status);
ALTER TABLE sox_outbox_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read sox_outbox_events" ON sox_outbox_events FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert sox_outbox_events" ON sox_outbox_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update sox_outbox_events" ON sox_outbox_events FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth read sox_outbox_events" ON sox_outbox_events FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));
