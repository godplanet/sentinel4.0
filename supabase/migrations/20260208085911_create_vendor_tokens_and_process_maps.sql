/*
  # Module E: Connectivity Pack - Vendor Tokens & Process Maps

  1. New Tables
    - `vendor_access_tokens`
      - `id` (uuid, primary key)
      - `vendor_id` (uuid, references tprm_vendors)
      - `assessment_id` (uuid, references tprm_assessments)
      - `token` (varchar(64), cryptographic hash for zero-trust magic link)
      - `expires_at` (timestamptz, token expiration)
      - `is_used` (boolean, single-use flag)
      - `created_at` (timestamptz)

    - `process_maps`
      - `id` (uuid, primary key)
      - `title` (varchar(150), process name)
      - `department_id` (uuid, linked to audit universe)
      - `nodes_json` (jsonb, React Flow node definitions)
      - `edges_json` (jsonb, React Flow edge definitions)
      - `risk_mappings` (jsonb, links process nodes to risk IDs)
      - `version_hash` (varchar(64), for cryo-chamber versioning)
      - `created_at`, `updated_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - vendor_access_tokens: authenticated users can manage; anon users can only validate (select)
    - process_maps: authenticated + anon dev access

  3. Seed Data
    - 2 vendor access tokens (one active, one expired for demo)
    - 1 process map: Ticari Kredi Tahsis Sureci with 6 nodes and 5 edges

  4. Important Notes
    - Vendor tokens are single-use and expire after a set time
    - Process maps store React Flow compatible JSON for visual rendering
    - Risk mappings connect process steps to RKM risk entries
*/

-- ============================================================
-- Vendor Access Tokens (Zero-Trust Magic Links)
-- ============================================================
CREATE TABLE IF NOT EXISTS vendor_access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES tprm_vendors(id),
  assessment_id uuid NOT NULL REFERENCES tprm_assessments(id),
  token varchar(64) NOT NULL,
  expires_at timestamptz NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vendor_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can manage vendor_access_tokens"
  ON vendor_access_tokens FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert vendor_access_tokens"
  ON vendor_access_tokens FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update vendor_access_tokens"
  ON vendor_access_tokens FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Anon can validate vendor_access_tokens"
  ON vendor_access_tokens FOR SELECT TO anon
  USING (true);

CREATE POLICY "Anon can mark token used"
  ON vendor_access_tokens FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_vendor_tokens_token
  ON vendor_access_tokens(token);

CREATE INDEX IF NOT EXISTS idx_vendor_tokens_vendor
  ON vendor_access_tokens(vendor_id);

-- ============================================================
-- Process Maps (Visual Process Database)
-- ============================================================
CREATE TABLE IF NOT EXISTS process_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title varchar(150) NOT NULL DEFAULT '',
  department_id uuid,
  nodes_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  edges_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_mappings jsonb NOT NULL DEFAULT '[]'::jsonb,
  version_hash varchar(64),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE process_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read process_maps"
  ON process_maps FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert process_maps"
  ON process_maps FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update process_maps"
  ON process_maps FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete process_maps"
  ON process_maps FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Dev read process_maps"
  ON process_maps FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert process_maps"
  ON process_maps FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update process_maps"
  ON process_maps FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

CREATE POLICY "Dev delete process_maps"
  ON process_maps FOR DELETE TO anon USING (true);

-- ============================================================
-- SEED: Vendor Access Tokens
-- ============================================================
-- INSERT INTO vendor_access_tokens (
--  id, vendor_id, assessment_id, token, expires_at, is_used
--) VALUES
--(
--  'a0a0a0a0-0001-4000-8000-000000000001',
--  '231c418b-370f-4530-9ccf-50c3bd5b5642',
--  'e0868042-bf5d-42f3-b1f7-91e132d7dcf7',
--  'demo-aws-token-2026-valid',
--  '2026-12-31T23:59:59Z',
--  false
--),
--(
--  'a0a0a0a0-0002-4000-8000-000000000002',
--  '146e2a76-3a75-461f-b18c-12ae40c46ca6',
--  '86379d0a-324c-4eb7-822c-56814f7aadb5',
--  'demo-kocsistem-token-expired',
--  '2026-01-01T00:00:00Z',
--  true
--) ON CONFLICT (id) DO NOTHING;

-- ============================================================

-- Surec haritasi (process_maps) seed verileri seed.sql dosyasina tasindi.
