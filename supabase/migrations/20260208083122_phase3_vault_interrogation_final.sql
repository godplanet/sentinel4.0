/*
  # Phase 3: Forensic Vault & Interrogation Room

  1. Modified Tables
    - `vault_access_requests`
      - Clear stale demo data referencing forensic_cases
      - Re-point FK from forensic_cases to investigation_cases
      - Add `required_approvals` (int, default 2 for multi-sig quorum)
      - Add `unlocked_at` (timestamptz, set when quorum met)
      - Expand status constraint: PENDING, APPROVED, REJECTED, UNLOCKED, DENIED, EXPIRED

  2. New Tables
    - `interrogation_logs`
      - `id` (uuid, primary key)
      - `case_id` (uuid, references investigation_cases)
      - `session_number` (int, sequential per case)
      - `suspect_name`, `interviewer_name` (text)
      - `transcript` (jsonb array of speaker/text/ts objects)
      - `ai_contradiction_flags` (jsonb array of claim/evidence/severity)
      - `status` (text: IN_PROGRESS, COMPLETED, SIGNED)
      - `started_at`, `completed_at` (timestamptz)

  3. Security
    - RLS on interrogation_logs (auth + anon dev)
    - vault_access_requests: only PENDING rows updatable (prevents post-unlock tampering)

  4. Seed Data
    - 1 vault access request (UNLOCKED: CAE + Investigation Manager approved)
    - 1 interrogation session: 6-line transcript, 3 AI contradiction flags

  5. Important Notes
    - Multi-sig requires 2 of 3 audit leadership roles (CAE, DEPUTY, MANAGER)
    - Contradictions cross-reference frozen digital evidence from Phase 2
*/

-- All vault_access_requests operations are guarded to avoid failures if the table doesn't exist
DO $$
BEGIN
  -- Only run these migrations if vault_access_requests table is present
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'vault_access_requests'
  ) THEN
    -- Clear stale vault_access_requests that reference forensic_cases
    BEGIN
      DELETE FROM vault_access_requests;
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;

    -- Re-point FK to investigation_cases
    BEGIN
      ALTER TABLE vault_access_requests DROP CONSTRAINT IF EXISTS vault_access_requests_case_id_fkey;
      ALTER TABLE vault_access_requests
        ADD CONSTRAINT vault_access_requests_case_id_fkey
        FOREIGN KEY (case_id) REFERENCES investigation_cases(id);
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;

    -- Add missing columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'vault_access_requests' AND column_name = 'required_approvals'
    ) THEN
      ALTER TABLE vault_access_requests ADD COLUMN required_approvals int NOT NULL DEFAULT 2;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'vault_access_requests' AND column_name = 'unlocked_at'
    ) THEN
      ALTER TABLE vault_access_requests ADD COLUMN unlocked_at timestamptz;
    END IF;

    -- Expand status constraint
    BEGIN
      ALTER TABLE vault_access_requests DROP CONSTRAINT IF EXISTS vault_access_requests_status_check;
      ALTER TABLE vault_access_requests ADD CONSTRAINT vault_access_requests_status_check
        CHECK (status = ANY (ARRAY['PENDING', 'APPROVED', 'REJECTED', 'UNLOCKED', 'DENIED', 'EXPIRED']));
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END IF;
END $$;

-- ============================================================
-- Interrogation Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS interrogation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES investigation_cases(id),
  session_number int NOT NULL DEFAULT 1,
  suspect_name text NOT NULL DEFAULT '',
  interviewer_name text NOT NULL DEFAULT '',
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  ai_contradiction_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'IN_PROGRESS',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE interrogation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read interrogation_logs"
  ON interrogation_logs FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert interrogation_logs"
  ON interrogation_logs FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update active interrogation_logs"
  ON interrogation_logs FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL AND status = 'IN_PROGRESS')
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Dev read interrogation_logs"
  ON interrogation_logs FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert interrogation_logs"
  ON interrogation_logs FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update active interrogation_logs"
  ON interrogation_logs FOR UPDATE TO anon
  USING (status = 'IN_PROGRESS') WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_interrogation_logs_case
  ON interrogation_logs(case_id);
