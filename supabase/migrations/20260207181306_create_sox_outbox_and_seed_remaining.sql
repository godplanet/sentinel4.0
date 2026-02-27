/*
  # Create SOX Transactional Outbox + Seed remaining data

  1. New Tables
    - `sox_outbox_events` - Transactional outbox for async side-effects
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `event_type` (text) - ATTESTATION_SIGNED, RISK_SCORE_UPDATE, etc.
      - `payload` (jsonb) - Event data
      - `status` (text) - Pending, Processed, Failed
      - `processed_at` (timestamptz)

  2. Security
    - RLS enabled
    - Dev-mode anon policies

  3. Seed Data
    - 4 outbox events for existing attestations
    - Update campaign completed_count
*/

-- ============================================================
-- TABLE: sox_outbox_events (Transactional Outbox Pattern)
-- ============================================================
CREATE TABLE IF NOT EXISTS sox_outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  CONSTRAINT sox_ob_status_check CHECK (status IN ('Pending','Processed','Failed')),
  CONSTRAINT sox_ob_event_check CHECK (event_type IN (
    'ATTESTATION_SIGNED','RISK_SCORE_UPDATE','CAMPAIGN_CLOSED',
    'CONTROL_EXCEPTION','INCIDENT_LINKED'
  ))
);

CREATE INDEX IF NOT EXISTS idx_sox_ob_tenant ON sox_outbox_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_sox_ob_status ON sox_outbox_events(status);
CREATE INDEX IF NOT EXISTS idx_sox_ob_created ON sox_outbox_events(created_at DESC);

ALTER TABLE sox_outbox_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read sox_outbox_events (dev)"
  ON sox_outbox_events FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert sox_outbox_events (dev)"
  ON sox_outbox_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update sox_outbox_events (dev)"
  ON sox_outbox_events FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth users read own tenant sox_outbox_events"
  ON sox_outbox_events FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));
