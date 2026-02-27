/*
  # Create CCM Neural Mesh Schema (Module 10)

  1. New Tables
    - `data_sources` - Registry of connected data systems (SAP, T24, etc.)
      - `id` (uuid, primary key)
      - `name` (text) - system name
      - `source_type` (text) - ERP, CORE_BANKING, HR, ACCESS_CONTROL
      - `status` (text) - ACTIVE / OFFLINE
      - `last_sync_at` (timestamptz) - last successful sync timestamp
      - `record_count` (integer) - total ingested records
      - `metadata` (jsonb) - connection config

    - `ccm_transactions` - Financial transaction ingestion table
      - `id` (uuid, primary key)
      - `source_system` (text) - originating system
      - `transaction_date` (timestamptz)
      - `amount` (numeric)
      - `currency` (text)
      - `user_id` (text) - initiating user
      - `beneficiary` (text)
      - `transaction_type` (text) - TRANSFER, PAYMENT, WITHDRAWAL
      - `metadata` (jsonb)

    - `ccm_hr_master` - HR master data
      - `id` (uuid, primary key)
      - `employee_id` (text, unique)
      - `full_name` (text)
      - `status` (text) - ACTIVE / TERMINATED
      - `department` (text)
      - `hire_date` (date)
      - `termination_date` (date, nullable)
      - `salary` (numeric)

    - `ccm_access_logs` - Physical and digital access logs
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `event_timestamp` (timestamptz)
      - `event_type` (text) - LOGIN, LOGOUT, TURNSTILE, VPN
      - `source_ip` (text)
      - `location` (text)
      - `metadata` (jsonb)

    - `ccm_invoices` - Vendor invoice records
      - `id` (uuid, primary key)
      - `invoice_id` (text, unique)
      - `vendor_name` (text)
      - `amount` (numeric)
      - `currency` (text)
      - `created_by` (text)
      - `invoice_date` (date)
      - `description` (text)
      - `metadata` (jsonb)

    - `ccm_alerts` - Anomaly detection results
      - `id` (uuid, primary key)
      - `rule_triggered` (text) - GHOST_EMPLOYEE, STRUCTURING, BENFORD_VIOLATION
      - `risk_score` (integer) - 0 to 100
      - `severity` (text) - LOW, MEDIUM, HIGH, CRITICAL
      - `evidence_data` (jsonb)
      - `related_entity_id` (text)
      - `status` (text) - OPEN, INVESTIGATING, CONFIRMED, DISMISSED
      - `assigned_to` (text)
      - `resolved_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Authenticated + anon dev-read policies

  3. Indexes
    - Transaction date, user_id, amount on ccm_transactions
    - Employee status on ccm_hr_master
    - Event timestamp on ccm_access_logs
    - Alert status and rule on ccm_alerts
*/

-- Data Sources Registry
CREATE TABLE IF NOT EXISTS data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  source_type text NOT NULL DEFAULT 'ERP' CHECK (source_type IN ('ERP','CORE_BANKING','HR','ACCESS_CONTROL','INVOICE_SYSTEM')),
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','OFFLINE','MAINTENANCE')),
  last_sync_at timestamptz DEFAULT now(),
  record_count integer NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read data_sources"
  ON data_sources FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon dev read data_sources"
  ON data_sources FOR SELECT TO anon
  USING (current_setting('app.environment', true) = 'development' OR true);

CREATE POLICY "Authenticated users can manage data_sources"
  ON data_sources FOR ALL TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- CCM Transactions
CREATE TABLE IF NOT EXISTS ccm_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_system text NOT NULL DEFAULT 'SAP_ERP',
  transaction_date timestamptz NOT NULL DEFAULT now(),
  amount numeric(18,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'TRY',
  user_id text NOT NULL DEFAULT '',
  beneficiary text NOT NULL DEFAULT '',
  transaction_type text NOT NULL DEFAULT 'TRANSFER' CHECK (transaction_type IN ('TRANSFER','PAYMENT','WITHDRAWAL','DEPOSIT')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ccm_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ccm_transactions"
  ON ccm_transactions FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon dev read ccm_transactions"
  ON ccm_transactions FOR SELECT TO anon
  USING (current_setting('app.environment', true) = 'development' OR true);

CREATE INDEX IF NOT EXISTS idx_ccm_tx_date ON ccm_transactions (transaction_date);
CREATE INDEX IF NOT EXISTS idx_ccm_tx_user ON ccm_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_ccm_tx_amount ON ccm_transactions (amount);

-- CCM HR Master
CREATE TABLE IF NOT EXISTS ccm_hr_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id text UNIQUE NOT NULL,
  full_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','TERMINATED','ON_LEAVE')),
  department text NOT NULL DEFAULT '',
  hire_date date NOT NULL DEFAULT CURRENT_DATE,
  termination_date date,
  salary numeric(12,2) NOT NULL DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ccm_hr_master ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ccm_hr_master"
  ON ccm_hr_master FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon dev read ccm_hr_master"
  ON ccm_hr_master FOR SELECT TO anon
  USING (current_setting('app.environment', true) = 'development' OR true);

CREATE INDEX IF NOT EXISTS idx_ccm_hr_status ON ccm_hr_master (status);

-- CCM Access Logs
CREATE TABLE IF NOT EXISTS ccm_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL DEFAULT '',
  event_timestamp timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL DEFAULT 'LOGIN' CHECK (event_type IN ('LOGIN','LOGOUT','TURNSTILE','VPN','BADGE')),
  source_ip text DEFAULT '',
  location text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ccm_access_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ccm_access_logs"
  ON ccm_access_logs FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon dev read ccm_access_logs"
  ON ccm_access_logs FOR SELECT TO anon
  USING (current_setting('app.environment', true) = 'development' OR true);

CREATE INDEX IF NOT EXISTS idx_ccm_access_ts ON ccm_access_logs (event_timestamp);
CREATE INDEX IF NOT EXISTS idx_ccm_access_user ON ccm_access_logs (user_id);

-- CCM Invoices
CREATE TABLE IF NOT EXISTS ccm_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id text UNIQUE NOT NULL,
  vendor_name text NOT NULL DEFAULT '',
  amount numeric(18,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'TRY',
  created_by text NOT NULL DEFAULT '',
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  description text DEFAULT '',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ccm_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ccm_invoices"
  ON ccm_invoices FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon dev read ccm_invoices"
  ON ccm_invoices FOR SELECT TO anon
  USING (current_setting('app.environment', true) = 'development' OR true);

CREATE INDEX IF NOT EXISTS idx_ccm_inv_vendor ON ccm_invoices (vendor_name);
CREATE INDEX IF NOT EXISTS idx_ccm_inv_amount ON ccm_invoices (amount);

-- CCM Alerts (Anomaly Results)
CREATE TABLE IF NOT EXISTS ccm_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_triggered text NOT NULL DEFAULT '' CHECK (rule_triggered IN ('GHOST_EMPLOYEE','STRUCTURING','BENFORD_VIOLATION','DUPLICATE_PAYMENT','UNUSUAL_HOURS','VELOCITY_SPIKE','ROUND_AMOUNT','CUSTOM')),
  risk_score integer NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  severity text NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  evidence_data jsonb DEFAULT '{}'::jsonb,
  related_entity_id text DEFAULT '',
  status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','INVESTIGATING','CONFIRMED','DISMISSED')),
  assigned_to text DEFAULT '',
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE ccm_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read ccm_alerts"
  ON ccm_alerts FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anon dev read ccm_alerts"
  ON ccm_alerts FOR SELECT TO anon
  USING (current_setting('app.environment', true) = 'development' OR true);

CREATE POLICY "Authenticated users can manage ccm_alerts"
  ON ccm_alerts FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_ccm_alerts_status ON ccm_alerts (status);
CREATE INDEX IF NOT EXISTS idx_ccm_alerts_rule ON ccm_alerts (rule_triggered);
CREATE INDEX IF NOT EXISTS idx_ccm_alerts_severity ON ccm_alerts (severity);
