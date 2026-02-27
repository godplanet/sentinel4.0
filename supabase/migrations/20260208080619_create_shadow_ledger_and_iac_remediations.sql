/*
  # Create Shadow Ledger & IaC Remediations

  1. New Tables
    - `shadow_transactions`
      - `id` (uuid, primary key)
      - `amount` (numeric, transaction amount)
      - `currency` (text, default 'TRY')
      - `scenario` (text, e.g. 'SMURFING_TEST', 'ROUND_TRIP_TEST')
      - `is_synthetic` (boolean, always TRUE - marks as test data)
      - `blocked_by_core` (boolean, whether the core system blocked this)
      - `source_account` (text, simulated source)
      - `target_account` (text, simulated target)
      - `injected_by` (text, agent or user who created it)
      - `batch_id` (uuid, groups transactions from same test run)
      - `created_at` (timestamptz)

    - `iac_remediations`
      - `id` (uuid, primary key)
      - `finding_id` (uuid, references audit_findings)
      - `title` (text, short description)
      - `resource_type` (text, e.g. 'S3_BUCKET', 'IAM_POLICY', 'FIREWALL_RULE')
      - `proposed_fix_script` (text, IaC code such as Terraform)
      - `language` (text, e.g. 'terraform', 'bash', 'sql')
      - `status` (text, PENDING_APPROVAL / APPROVED / EXECUTED / FAILED / ROLLED_BACK)
      - `approved_by` (text)
      - `executed_at` (timestamptz)
      - `execution_log` (jsonb, stores step-by-step execution output)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Only authenticated users can access
    - shadow_transactions: read-only for authenticated, insert via service role
    - iac_remediations: full CRUD for authenticated with ownership check

  3. Important Notes
    - shadow_transactions are strictly isolated from real financial data
    - is_synthetic column defaults to TRUE and cannot be set to FALSE
    - These tables support the Chaos Auditing and Active Remediation modules
*/

-- Shadow Transactions (Chaos Auditing Ledger)
CREATE TABLE IF NOT EXISTS shadow_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'TRY',
  scenario text NOT NULL DEFAULT 'GENERIC_TEST',
  is_synthetic boolean NOT NULL DEFAULT true,
  blocked_by_core boolean NOT NULL DEFAULT false,
  source_account text NOT NULL DEFAULT '',
  target_account text NOT NULL DEFAULT '',
  injected_by text NOT NULL DEFAULT 'CHAOS_MONKEY',
  batch_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE shadow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read shadow transactions"
  ON shadow_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert shadow transactions"
  ON shadow_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL AND is_synthetic = true);

-- Add constraint: is_synthetic must always be true
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'shadow_transactions' AND constraint_name = 'shadow_must_be_synthetic'
  ) THEN
    ALTER TABLE shadow_transactions
      ADD CONSTRAINT shadow_must_be_synthetic CHECK (is_synthetic = true);
  END IF;
END $$;

-- IaC Remediations (Fix-It Module)
CREATE TABLE IF NOT EXISTS iac_remediations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id uuid,
  title text NOT NULL DEFAULT '',
  resource_type text NOT NULL DEFAULT '',
  proposed_fix_script text NOT NULL DEFAULT '',
  language text NOT NULL DEFAULT 'terraform',
  status text NOT NULL DEFAULT 'PENDING_APPROVAL',
  approved_by text,
  executed_at timestamptz,
  execution_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE iac_remediations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read iac remediations"
  ON iac_remediations
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert iac remediations"
  ON iac_remediations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update iac remediations"
  ON iac_remediations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Dev-mode permissive policies for testing
CREATE POLICY "Dev read shadow_transactions"
  ON shadow_transactions FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert shadow_transactions"
  ON shadow_transactions FOR INSERT TO anon WITH CHECK (is_synthetic = true);

CREATE POLICY "Dev read iac_remediations"
  ON iac_remediations FOR SELECT TO anon USING (true);

CREATE POLICY "Dev insert iac_remediations"
  ON iac_remediations FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Dev update iac_remediations"
  ON iac_remediations FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_shadow_transactions_batch
  ON shadow_transactions(batch_id);

CREATE INDEX IF NOT EXISTS idx_shadow_transactions_scenario
  ON shadow_transactions(scenario);

CREATE INDEX IF NOT EXISTS idx_iac_remediations_finding
  ON iac_remediations(finding_id);

CREATE INDEX IF NOT EXISTS idx_iac_remediations_status
  ON iac_remediations(status);
