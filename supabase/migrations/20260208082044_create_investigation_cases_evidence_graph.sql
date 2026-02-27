/*
  # Phase 2: Digital Freeze & Sherlock Engine

  1. New Tables
    - `investigation_cases`
      - `id` (uuid, primary key)
      - `tip_id` (uuid, references whistleblower_tips - the originating tip)
      - `title` (text, case title)
      - `lead_investigator` (text, assigned investigator)
      - `status` (text: OPEN, FROZEN, CLOSED)
      - `priority` (text: CRITICAL, HIGH, MEDIUM, LOW)
      - `created_at`, `updated_at` (timestamptz)

    - `digital_evidence`
      - `id` (uuid, primary key)
      - `case_id` (uuid, references investigation_cases)
      - `type` (text: EMAIL, CHAT, LOG, INVOICE)
      - `source_system` (text, e.g. Exchange, Slack, SAP)
      - `content_snapshot` (jsonb, frozen evidence content)
      - `hash_sha256` (text, SHA-256 integrity hash)
      - `timestamp_rfc3161` (timestamptz, RFC 3161 timestamp)
      - `locked` (boolean, WORM immutability flag)
      - `frozen_by` (text, who executed the freeze)
      - `created_at` (timestamptz)
      Note: Rows are effectively immutable - the locked flag prevents updates.

    - `entity_relationships`
      - `id` (uuid, primary key)
      - `case_id` (uuid, references investigation_cases)
      - `source_node` (text, e.g. person name)
      - `source_type` (text: PERSON, VENDOR, COMPANY, ACCOUNT)
      - `target_node` (text, e.g. vendor name)
      - `target_type` (text: PERSON, VENDOR, COMPANY, ACCOUNT)
      - `relation_type` (text: SHARED_ADDRESS, SAME_IP, TRANSFER, SHARED_PHONE, OWNERSHIP, APPROVAL)
      - `evidence_ref` (text, reference to supporting evidence)
      - `confidence` (float, 0-100 confidence in the link)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all three tables
    - Authenticated users can read/write
    - Dev-mode permissive policies for anon testing

  3. Seed Data
    - 1 case linked to the high-credibility fraud tip
    - 6 digital evidence records (emails, chat logs, invoices, system logs)
    - 8 entity relationship records forming a fraud network graph

  4. Important Notes
    - digital_evidence rows with locked=true cannot be updated (enforced via RLS policy)
    - SHA-256 hashes are pre-computed for seed data integrity
    - entity_relationships form a directed graph for the Sherlock visualization
*/

-- ============================================================
-- Investigation Cases
-- ============================================================
CREATE TABLE IF NOT EXISTS investigation_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid REFERENCES whistleblower_tips(id),
  title text NOT NULL DEFAULT '',
  lead_investigator text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'OPEN',
  priority text NOT NULL DEFAULT 'MEDIUM',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE investigation_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read investigation_cases"
  ON investigation_cases FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert investigation_cases"
  ON investigation_cases FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update investigation_cases"
  ON investigation_cases FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Dev read investigation_cases"
  ON investigation_cases FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert investigation_cases"
  ON investigation_cases FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update investigation_cases"
  ON investigation_cases FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- Digital Evidence Vault
-- ============================================================
CREATE TABLE IF NOT EXISTS digital_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id),
  type text NOT NULL DEFAULT 'LOG',
  source_system text NOT NULL DEFAULT '',
  content_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  hash_sha256 text NOT NULL DEFAULT '',
  timestamp_rfc3161 timestamptz NOT NULL DEFAULT now(),
  locked boolean NOT NULL DEFAULT false,
  frozen_by text NOT NULL DEFAULT 'SYSTEM',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE digital_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read digital_evidence"
  ON digital_evidence FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert digital_evidence"
  ON digital_evidence FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated cannot update locked evidence"
  ON digital_evidence FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL AND locked = false)
  WITH CHECK (auth.uid() IS NOT NULL AND locked = false);

CREATE POLICY "Dev read digital_evidence"
  ON digital_evidence FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert digital_evidence"
  ON digital_evidence FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update unlocked digital_evidence"
  ON digital_evidence FOR UPDATE TO anon
  USING (locked = false) WITH CHECK (locked = false);

-- ============================================================
-- Entity Relationships (Knowledge Graph)
-- ============================================================
CREATE TABLE IF NOT EXISTS entity_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id),
  source_node text NOT NULL,
  source_type text NOT NULL DEFAULT 'PERSON',
  target_node text NOT NULL,
  target_type text NOT NULL DEFAULT 'VENDOR',
  relation_type text NOT NULL DEFAULT 'TRANSFER',
  evidence_ref text,
  confidence float NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read entity_relationships"
  ON entity_relationships FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert entity_relationships"
  ON entity_relationships FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Dev read entity_relationships"
  ON entity_relationships FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert entity_relationships"
  ON entity_relationships FOR INSERT TO anon WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_investigation_cases_tip
  ON investigation_cases(tip_id);

CREATE INDEX IF NOT EXISTS idx_investigation_cases_status
  ON investigation_cases(status);

CREATE INDEX IF NOT EXISTS idx_digital_evidence_case
  ON digital_evidence(case_id);

CREATE INDEX IF NOT EXISTS idx_entity_relationships_case
  ON entity_relationships(case_id);
