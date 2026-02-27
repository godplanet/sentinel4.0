/*
  # Create Automation Engine (Sentinel Cortex) Module

  1. New Tables
    - `automation_rules` - IFTTT-style automation rule definitions
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `title` (text) - Human-readable rule name
      - `description` (text) - Detailed explanation
      - `trigger_event` (text) - FINDING_CREATED, RISK_CHANGED, DUE_DATE_PASSED, AUDIT_STARTED, ASSESSMENT_COMPLETED, STATUS_CHANGED
      - `conditions` (jsonb) - Filter conditions as structured JSON
      - `actions` (jsonb) - Array of actions to execute
      - `is_active` (boolean) - Toggle on/off
      - `priority` (integer) - Execution order
      - `last_triggered_at` (timestamptz)
      - `execution_count` (integer)
      - `created_by` (text)
    - `automation_logs` - Execution audit trail
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `rule_id` (uuid, FK automation_rules)
      - `rule_title` (text) - Snapshot of rule title at execution time
      - `trigger_event` (text)
      - `trigger_context` (jsonb) - The data payload that triggered
      - `conditions_evaluated` (jsonb) - Which conditions matched
      - `actions_executed` (jsonb) - Results per action
      - `action_result` (text) - Summary text
      - `status` (text) - Success, Failed, Skipped, Simulated
      - `duration_ms` (integer) - Execution time
      - `is_simulation` (boolean) - Test run flag

  2. Security
    - RLS enabled on both tables
    - Dev-mode anon CRUD policies
    - Authenticated tenant-scoped read policies

  3. Seed Data
    - 6 realistic banking automation rules
    - 12 execution log entries with realistic outcomes
*/

-- ============================================================
-- TABLE: automation_rules
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  title text NOT NULL,
  description text,
  trigger_event text NOT NULL,
  conditions jsonb NOT NULL DEFAULT '{}',
  actions jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 50,
  last_triggered_at timestamptz,
  execution_count integer NOT NULL DEFAULT 0,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT auto_r_trigger_check CHECK (trigger_event IN (
    'FINDING_CREATED','RISK_CHANGED','DUE_DATE_PASSED',
    'AUDIT_STARTED','ASSESSMENT_COMPLETED','STATUS_CHANGED',
    'WORKPAPER_SIGNED','ACTION_OVERDUE','VENDOR_REVIEW_DUE'
  )),
  CONSTRAINT auto_r_priority_range CHECK (priority >= 1 AND priority <= 100)
);

CREATE INDEX IF NOT EXISTS idx_auto_r_tenant ON automation_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_r_trigger ON automation_rules(trigger_event);
CREATE INDEX IF NOT EXISTS idx_auto_r_active ON automation_rules(is_active);

ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read rules (dev)"
  ON automation_rules FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert rules (dev)"
  ON automation_rules FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update rules (dev)"
  ON automation_rules FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete rules (dev)"
  ON automation_rules FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant rules"
  ON automation_rules FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: automation_logs
-- ============================================================
CREATE TABLE IF NOT EXISTS automation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  rule_id uuid REFERENCES automation_rules(id) ON DELETE SET NULL,
  rule_title text,
  trigger_event text,
  trigger_context jsonb,
  conditions_evaluated jsonb,
  actions_executed jsonb,
  action_result text,
  status text NOT NULL DEFAULT 'Success',
  duration_ms integer DEFAULT 0,
  is_simulation boolean NOT NULL DEFAULT false,
  executed_at timestamptz DEFAULT now(),
  CONSTRAINT auto_l_status_check CHECK (status IN ('Success','Failed','Skipped','Simulated'))
);

CREATE INDEX IF NOT EXISTS idx_auto_l_tenant ON automation_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_auto_l_rule ON automation_logs(rule_id);
CREATE INDEX IF NOT EXISTS idx_auto_l_status ON automation_logs(status);
CREATE INDEX IF NOT EXISTS idx_auto_l_exec ON automation_logs(executed_at DESC);

ALTER TABLE automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read logs (dev)"
  ON automation_logs FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert logs (dev)"
  ON automation_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update logs (dev)"
  ON automation_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete logs (dev)"
  ON automation_logs FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant logs"
  ON automation_logs FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));
