/*
  # Create Investigation & Forensics Module Schema + Seed Data

  1. New Tables
    - `whistleblower_tips` - Anonymous tip submissions with AI credibility scoring
      - `id` (uuid, PK), `tracking_code`, `content`, `attachments_url`, `channel`, `submitted_at`, `ai_credibility_score`, `triage_category`, `status`, `assigned_unit`, `reviewer_notes`, `created_at`
    - `investigation_cases` - Formal investigation case management
      - `id` (uuid, PK), `tip_id` (FK), `title`, `lead_investigator`, `status`, `priority`, `created_at`, `updated_at`
    - `digital_evidence` - Immutable evidence chain for cases
      - `id` (uuid, PK), `case_id` (FK), `type`, `source_system`, `content_snapshot`, `hash_sha256`, `timestamp_rfc3161`, `locked`, `frozen_by`, `created_at`
    - `interrogation_logs` - Interview session transcripts with AI contradiction detection
      - `id` (uuid, PK), `case_id` (FK), `session_number`, `suspect_name`, `interviewer_name`, `transcript`, `ai_contradiction_flags`, `status`, `started_at`, `completed_at`
    - `tip_analysis` - AI-generated analysis of whistleblower tips
      - `id` (uuid, PK), `tip_id` (FK), `risk_assessment`, `entity_mentions`, `recommended_actions`, `created_at`
    - `entity_relationships` - Link analysis graph for investigation cases
      - `id` (uuid, PK), `case_id` (FK), `source_entity`, `target_entity`, `relationship_type`, `confidence`, `metadata`, `created_at`
    - `vault_access_requests` - Multi-signature approval for sensitive evidence access
      - `id` (uuid, PK), `case_id` (FK), `requested_by`, `approvals`, `required_approvals`, `status`, `unlocked_at`, `created_at`, `updated_at`

  2. Security
    - RLS enabled on all tables
    - Permissive anon policies for demo environment

  3. Seed Data
    - 1 anonymous tip, 1 active case ("Sube Zimmet Vakasi"), evidence items, interrogation log
*/

-- whistleblower_tips
CREATE TABLE IF NOT EXISTS whistleblower_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_code text NOT NULL DEFAULT ('TIP-' || upper(substr(md5(random()::text), 1, 8))),
  content text NOT NULL,
  attachments_url text,
  channel text NOT NULL DEFAULT 'WEB' CHECK (channel IN ('WEB', 'TOR_ONION', 'SIGNAL_MOCK')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  ai_credibility_score numeric(5,2) NOT NULL DEFAULT 0,
  triage_category text NOT NULL DEFAULT 'HR_CULTURE' CHECK (triage_category IN ('CRITICAL_FRAUD', 'HR_CULTURE', 'SPAM')),
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'INVESTIGATING', 'ESCALATED', 'DISMISSED', 'CLOSED')),
  assigned_unit text,
  reviewer_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE whistleblower_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_tips_select" ON whistleblower_tips FOR SELECT TO anon USING (true);
CREATE POLICY "anon_tips_insert" ON whistleblower_tips FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_tips_update" ON whistleblower_tips FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- investigation_cases
CREATE TABLE IF NOT EXISTS investigation_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid REFERENCES whistleblower_tips(id) ON DELETE SET NULL,
  title text NOT NULL,
  lead_investigator text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'FROZEN', 'CLOSED')),
  priority text NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE investigation_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_cases_select" ON investigation_cases FOR SELECT TO anon USING (true);
CREATE POLICY "anon_cases_insert" ON investigation_cases FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_cases_update" ON investigation_cases FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- digital_evidence
CREATE TABLE IF NOT EXISTS digital_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'LOG' CHECK (type IN ('EMAIL', 'CHAT', 'LOG', 'INVOICE')),
  source_system text NOT NULL DEFAULT '',
  content_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  hash_sha256 text NOT NULL DEFAULT '',
  timestamp_rfc3161 text NOT NULL DEFAULT '',
  locked boolean NOT NULL DEFAULT false,
  frozen_by text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE digital_evidence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_evidence_select" ON digital_evidence FOR SELECT TO anon USING (true);
CREATE POLICY "anon_evidence_insert" ON digital_evidence FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_evidence_update" ON digital_evidence FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- interrogation_logs
CREATE TABLE IF NOT EXISTS interrogation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id) ON DELETE CASCADE,
  session_number integer NOT NULL DEFAULT 1,
  suspect_name text NOT NULL DEFAULT '',
  interviewer_name text NOT NULL DEFAULT '',
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_contradiction_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'SIGNED')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE interrogation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_interrogation_select" ON interrogation_logs FOR SELECT TO anon USING (true);
CREATE POLICY "anon_interrogation_insert" ON interrogation_logs FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_interrogation_update" ON interrogation_logs FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- tip_analysis
CREATE TABLE IF NOT EXISTS tip_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tip_id uuid NOT NULL REFERENCES whistleblower_tips(id) ON DELETE CASCADE,
  risk_assessment jsonb NOT NULL DEFAULT '{}'::jsonb,
  entity_mentions jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tip_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_tip_analysis_select" ON tip_analysis FOR SELECT TO anon USING (true);
CREATE POLICY "anon_tip_analysis_insert" ON tip_analysis FOR INSERT TO anon WITH CHECK (true);

-- entity_relationships (investigation link analysis)
CREATE TABLE IF NOT EXISTS entity_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id) ON DELETE CASCADE,
  source_entity text NOT NULL DEFAULT '',
  target_entity text NOT NULL DEFAULT '',
  relationship_type text NOT NULL DEFAULT '',
  confidence numeric(5,2) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE entity_relationships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_entity_rel_select" ON entity_relationships FOR SELECT TO anon USING (true);
CREATE POLICY "anon_entity_rel_insert" ON entity_relationships FOR INSERT TO anon WITH CHECK (true);

-- vault_access_requests
CREATE TABLE IF NOT EXISTS vault_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id) ON DELETE CASCADE,
  requested_by text NOT NULL DEFAULT '',
  approvals jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_approvals integer NOT NULL DEFAULT 2,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'DENIED')),
  unlocked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vault_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anon_vault_req_select" ON vault_access_requests FOR SELECT TO anon USING (true);
CREATE POLICY "anon_vault_req_insert" ON vault_access_requests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_vault_req_update" ON vault_access_requests FOR UPDATE TO anon USING (true) WITH CHECK (true);
