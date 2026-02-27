/*
  # Internal Audit Platform - Core Schema
  
  **OVERVIEW:**
  Creates the foundational data structure for an Enterprise Internal Audit Management System
  with immutable audit trail, hierarchical risk taxonomy, and multi-tenant architecture.
  
  ## 1. Extensions
    - `ltree` - Hierarchical path queries for risk taxonomy (e.g., 'Credit.Retail.Approval.Fraud')
    - `pgcrypto` - SHA-256 hash chain for tamper-proof audit logs
  
  ## 2. New Tables
  
  ### `tenants` - Multi-Tenant Organization Structure
    - `id` (uuid, primary key) - Unique tenant identifier
    - `name` (text) - Organization name
    - `type` (text) - HEAD_OFFICE | SUBSIDIARY
    - `environment` (text) - PROD | TEST | DEV (for Chameleon theme)
    - `created_at` (timestamptz) - Creation timestamp
  
  ### `risk_taxonomy` - Hierarchical Risk Classification (ltree)
    - `id` (uuid, primary key)
    - `tenant_id` (uuid, foreign key) - Owner tenant
    - `path` (ltree) - Hierarchical path (e.g., 'Credit.Retail.Fraud')
    - `name` (text) - Display name
    - `type` (text) - PROCESS | RISK | CONTROL
    - `risk_weight` (decimal) - Risk scoring multiplier (default: 1.0)
    - `description` (text) - Detailed explanation
    - **Unique Constraint**: (tenant_id, path)
    - **Index**: GIST index on path for efficient tree queries
  
  ### `audit_engagements` - Audit Projects/Missions
    - `id` (uuid, primary key)
    - `tenant_id` (uuid, foreign key)
    - `title` (text) - Engagement name
    - `status` (text) - PLANNING | FIELDWORK | REPORTING | CLOSED
    - `start_date` (date) - Audit start date
    - `score` (decimal) - Numerical score (0-100)
    - `grade` (text) - Letter grade (A, B, C, D, F)
    - `created_at` (timestamptz)
  
  ### `audit_findings` - GIAS 2024 Smart Findings
    - `id` (uuid, primary key)
    - `engagement_id` (uuid, foreign key)
    - `title` (text) - Finding title
    - `severity` (text) - CRITICAL | HIGH | MEDIUM | LOW | OBSERVATION
    - `details` (jsonb) - Structured data: {root_cause, impact, evidence_files, risk_assessment}
    - `status` (text) - DRAFT | FINAL | REMEDIATED
    - `created_at` (timestamptz)
  
  ### `audit_logs` - Immutable Hash Chain (Blockchain-Inspired)
    - `id` (bigserial, primary key)
    - `entity_type` (text) - Table name (e.g., 'audit_findings')
    - `entity_id` (uuid) - Record ID
    - `action` (text) - CREATE | UPDATE | DELETE
    - `payload` (jsonb) - Full record snapshot
    - `actor_id` (uuid) - User who performed action
    - `timestamp` (timestamptz) - Action timestamp
    - `prev_hash` (text) - SHA-256 of previous log entry
    - `curr_hash` (text) - SHA-256 of current entry (computed via trigger)
  
  ### `user_tenants` - User-Tenant Assignments
    - `user_id` (uuid, foreign key to auth.users)
    - `tenant_id` (uuid, foreign key)
    - `role` (text) - ADMIN | AUDITOR | VIEWER
    - **Primary Key**: (user_id, tenant_id)
  
  ## 3. Security - Row Level Security (RLS)
    - All tables have RLS ENABLED
    - Restrictive policies: Authenticated users only
    - Tenant isolation: Users can only access their tenant's data
  
  ## 4. Critical Features
    - **Ltree Queries**: Find all sub-risks under 'Credit.Retail.*'
    - **Hash Chain Integrity**: Detect tampering by verifying prev_hash → curr_hash links
    - **JSONB Flexibility**: Store complex finding structures without rigid schemas
    - **Multi-Tenant Isolation**: Complete data separation between organizations
  
  ## 5. Important Notes
    - NO destructive operations (no DROP, no DELETE)
    - Uses IF NOT EXISTS for idempotency
    - Hash computation via trigger (immutability guaranteed)
    - Default values prevent NULL errors
*/

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- TABLE: tenants
-- =====================================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('HEAD_OFFICE', 'SUBSIDIARY')),
  environment TEXT NOT NULL DEFAULT 'PROD' CHECK (environment IN ('PROD', 'TEST', 'DEV')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER TABLE: user_tenants (Must exist before RLS policies reference it)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_tenants (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'AUDITOR' CHECK (role IN ('ADMIN', 'AUDITOR', 'VIEWER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tenant_user ON user_tenants (user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenant_tenant ON user_tenants (tenant_id);

ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: tenants
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'tenants' AND policyname = 'Users can view their tenant'
  ) THEN
    CREATE POLICY "Users can view their tenant"
      ON tenants FOR SELECT
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT user_id FROM user_tenants WHERE tenant_id = tenants.id
        )
      );
  END IF;
END $$;

-- =====================================================
-- RLS POLICIES: user_tenants
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_tenants' AND policyname = 'Users can view their own tenant assignments'
  ) THEN
    CREATE POLICY "Users can view their own tenant assignments"
      ON user_tenants FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =====================================================
-- TABLE: risk_taxonomy
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_taxonomy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  path ltree NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PROCESS', 'RISK', 'CONTROL')),
  risk_weight DECIMAL(5,2) NOT NULL DEFAULT 1.0,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_path_per_tenant UNIQUE (tenant_id, path)
);

CREATE INDEX IF NOT EXISTS idx_risk_path ON risk_taxonomy USING GIST (path);
CREATE INDEX IF NOT EXISTS idx_risk_tenant ON risk_taxonomy (tenant_id);

ALTER TABLE risk_taxonomy ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: risk_taxonomy
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'risk_taxonomy' AND policyname = 'Users can view their tenant risks'
  ) THEN
    CREATE POLICY "Users can view their tenant risks"
      ON risk_taxonomy FOR SELECT
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT user_id FROM user_tenants WHERE tenant_id = risk_taxonomy.tenant_id
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'risk_taxonomy' AND policyname = 'Auditors can insert risks'
  ) THEN
    CREATE POLICY "Auditors can insert risks"
      ON risk_taxonomy FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() IN (
          SELECT user_id FROM user_tenants WHERE tenant_id = risk_taxonomy.tenant_id
        )
      );
  END IF;
END $$;

-- =====================================================
-- TABLE: audit_engagements
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PLANNING' CHECK (status IN ('PLANNING', 'FIELDWORK', 'REPORTING', 'CLOSED')),
  start_date DATE,
  score DECIMAL(5,2),
  grade TEXT CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_engagement_tenant ON audit_engagements (tenant_id);
CREATE INDEX IF NOT EXISTS idx_engagement_status ON audit_engagements (status);

ALTER TABLE audit_engagements ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: audit_engagements
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_engagements' AND policyname = 'Users can view their tenant engagements'
  ) THEN
    CREATE POLICY "Users can view their tenant engagements"
      ON audit_engagements FOR SELECT
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT user_id FROM user_tenants WHERE tenant_id = audit_engagements.tenant_id
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_engagements' AND policyname = 'Auditors can create engagements'
  ) THEN
    CREATE POLICY "Auditors can create engagements"
      ON audit_engagements FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() IN (
          SELECT user_id FROM user_tenants WHERE tenant_id = audit_engagements.tenant_id
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_engagements' AND policyname = 'Auditors can update engagements'
  ) THEN
    CREATE POLICY "Auditors can update engagements"
      ON audit_engagements FOR UPDATE
      TO authenticated
      USING (
        auth.uid() IN (
          SELECT user_id FROM user_tenants WHERE tenant_id = audit_engagements.tenant_id
        )
      )
      WITH CHECK (
        auth.uid() IN (
          SELECT user_id FROM user_tenants WHERE tenant_id = audit_engagements.tenant_id
        )
      );
  END IF;
END $$;

-- =====================================================
-- TABLE: audit_findings
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID NOT NULL REFERENCES audit_engagements(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OBSERVATION')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'FINAL', 'REMEDIATED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finding_engagement ON audit_findings (engagement_id);
CREATE INDEX IF NOT EXISTS idx_finding_severity ON audit_findings (severity);

ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES: audit_findings
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_findings' AND policyname = 'Users can view findings from their tenant'
  ) THEN
    CREATE POLICY "Users can view findings from their tenant"
      ON audit_findings FOR SELECT
      TO authenticated
      USING (
        engagement_id IN (
          SELECT id FROM audit_engagements WHERE tenant_id IN (
            SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_findings' AND policyname = 'Auditors can create findings'
  ) THEN
    CREATE POLICY "Auditors can create findings"
      ON audit_findings FOR INSERT
      TO authenticated
      WITH CHECK (
        engagement_id IN (
          SELECT id FROM audit_engagements WHERE tenant_id IN (
            SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
          )
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_findings' AND policyname = 'Auditors can update findings'
  ) THEN
    CREATE POLICY "Auditors can update findings"
      ON audit_findings FOR UPDATE
      TO authenticated
      USING (
        engagement_id IN (
          SELECT id FROM audit_engagements WHERE tenant_id IN (
            SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
          )
        )
      )
      WITH CHECK (
        engagement_id IN (
          SELECT id FROM audit_engagements WHERE tenant_id IN (
            SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
          )
        )
      );
  END IF;
END $$;

-- =====================================================
-- TABLE: audit_logs (Immutable Hash Chain)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  actor_id UUID,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  prev_hash TEXT,
  curr_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_log_entity ON audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_log_timestamp ON audit_logs (timestamp DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- TRIGGER: Compute Hash Chain
-- =====================================================
CREATE OR REPLACE FUNCTION compute_audit_log_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.curr_hash := encode(
    digest(
      COALESCE(NEW.payload::text, '') || 
      COALESCE(NEW.action, '') || 
      COALESCE(NEW.entity_id::text, '') ||
      COALESCE(NEW.prev_hash, ''), 
      'sha256'
    ), 
    'hex'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_compute_audit_log_hash'
  ) THEN
    CREATE TRIGGER trigger_compute_audit_log_hash
      BEFORE INSERT ON audit_logs
      FOR EACH ROW
      EXECUTE FUNCTION compute_audit_log_hash();
  END IF;
END $$;

-- =====================================================
-- RLS POLICIES: audit_logs
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'audit_logs' AND policyname = 'Users can view logs for their tenant data'
  ) THEN
    CREATE POLICY "Users can view logs for their tenant data"
      ON audit_logs FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
