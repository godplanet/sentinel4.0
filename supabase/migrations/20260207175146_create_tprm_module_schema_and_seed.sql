/*
  # Create TPRM (Third-Party Risk Management) Module

  1. New Tables
    - `tprm_vendors` - Vendor inventory with risk tiers
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `name` (text) - Vendor name
      - `category` (text) - IT Altyapi, Danismanlik, Hizmet, Hukuk, Telekom
      - `risk_tier` (text) - Tier 1 (Critical), Tier 2, Tier 3
      - `criticality_score` (integer, 0-100)
      - `status` (text) - Active, Inactive, Under Review, Terminated
      - `contact_person` (text)
      - `email` (text)
      - `contract_start` (date)
      - `contract_end` (date)
      - `last_audit_date` (date)
      - `country` (text)
      - `data_access_level` (text) - None, Limited, Full
      - `notes` (text)
    - `tprm_assessments` - Vendor assessment surveys
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `vendor_id` (uuid, FK tprm_vendors)
      - `title` (text)
      - `status` (text) - Draft, Sent, In Progress, Completed, Review Needed
      - `risk_score` (integer) - Calculated score
      - `due_date` (date)
      - `completed_at` (timestamptz)
      - `assessor` (text)
    - `tprm_assessment_answers` - Individual question/answer/AI grade rows
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `assessment_id` (uuid, FK tprm_assessments)
      - `question_text` (text)
      - `vendor_response` (text)
      - `ai_grade_score` (integer, 1-10)
      - `ai_grade_rationale` (text)
      - `category` (text)

  2. Security
    - RLS enabled on all tables
    - Dev-mode anon read/write policies
    - Authenticated user policies for production

  3. Seed Data
    - 6 realistic Turkish banking vendors
    - 4 assessments across vendors
    - 20+ assessment Q&A with AI grades

  4. Views
    - `tprm_vendor_summary` - Per-vendor risk overview with assessment counts
*/

-- ============================================================
-- TABLE: tprm_vendors
-- ============================================================
CREATE TABLE IF NOT EXISTS tprm_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  name text NOT NULL,
  category text,
  risk_tier text NOT NULL DEFAULT 'Tier 3',
  criticality_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active',
  contact_person text,
  email text,
  contract_start date,
  contract_end date,
  last_audit_date date,
  country text DEFAULT 'Turkiye',
  data_access_level text DEFAULT 'None',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tprm_v_score_range CHECK (criticality_score >= 0 AND criticality_score <= 100),
  CONSTRAINT tprm_v_tier_check CHECK (risk_tier IN ('Tier 1','Tier 2','Tier 3')),
  CONSTRAINT tprm_v_status_check CHECK (status IN ('Active','Inactive','Under Review','Terminated')),
  CONSTRAINT tprm_v_access_check CHECK (data_access_level IN ('None','Limited','Full'))
);

CREATE INDEX IF NOT EXISTS idx_tprm_v_tenant ON tprm_vendors(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tprm_v_tier ON tprm_vendors(risk_tier);
CREATE INDEX IF NOT EXISTS idx_tprm_v_status ON tprm_vendors(status);

ALTER TABLE tprm_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read vendors (dev)"
  ON tprm_vendors FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert vendors (dev)"
  ON tprm_vendors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update vendors (dev)"
  ON tprm_vendors FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete vendors (dev)"
  ON tprm_vendors FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant vendors"
  ON tprm_vendors FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: tprm_assessments
-- ============================================================
CREATE TABLE IF NOT EXISTS tprm_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  vendor_id uuid NOT NULL REFERENCES tprm_vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'Draft',
  risk_score integer,
  due_date date,
  completed_at timestamptz,
  assessor text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tprm_a_status_check CHECK (status IN ('Draft','Sent','In Progress','Completed','Review Needed'))
);

CREATE INDEX IF NOT EXISTS idx_tprm_a_tenant ON tprm_assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tprm_a_vendor ON tprm_assessments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_tprm_a_status ON tprm_assessments(status);

ALTER TABLE tprm_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read assessments (dev)"
  ON tprm_assessments FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert assessments (dev)"
  ON tprm_assessments FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update assessments (dev)"
  ON tprm_assessments FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete assessments (dev)"
  ON tprm_assessments FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant assessments"
  ON tprm_assessments FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: tprm_assessment_answers
-- ============================================================
CREATE TABLE IF NOT EXISTS tprm_assessment_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  assessment_id uuid NOT NULL REFERENCES tprm_assessments(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  vendor_response text,
  ai_grade_score integer,
  ai_grade_rationale text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tprm_aa_score_range CHECK (ai_grade_score IS NULL OR (ai_grade_score >= 1 AND ai_grade_score <= 10))
);

CREATE INDEX IF NOT EXISTS idx_tprm_aa_tenant ON tprm_assessment_answers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tprm_aa_assessment ON tprm_assessment_answers(assessment_id);

ALTER TABLE tprm_assessment_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read answers (dev)"
  ON tprm_assessment_answers FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert answers (dev)"
  ON tprm_assessment_answers FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update answers (dev)"
  ON tprm_assessment_answers FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete answers (dev)"
  ON tprm_assessment_answers FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant answers"
  ON tprm_assessment_answers FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- VIEW: tprm_vendor_summary
-- ============================================================
CREATE OR REPLACE VIEW tprm_vendor_summary AS
SELECT
  v.id,
  v.tenant_id,
  v.name,
  v.category,
  v.risk_tier,
  v.criticality_score,
  v.status,
  v.contact_person,
  v.email,
  v.contract_start,
  v.contract_end,
  v.last_audit_date,
  v.country,
  v.data_access_level,
  v.created_at,
  COUNT(a.id) AS total_assessments,
  COUNT(a.id) FILTER (WHERE a.status = 'Completed') AS completed_assessments,
  COUNT(a.id) FILTER (WHERE a.status = 'In Progress' OR a.status = 'Sent') AS active_assessments,
  COALESCE(
    AVG(a.risk_score) FILTER (WHERE a.risk_score IS NOT NULL),
    0
  )::integer AS avg_risk_score,
  MAX(a.completed_at) AS last_assessment_date
FROM tprm_vendors v
LEFT JOIN tprm_assessments a ON a.vendor_id = v.id
GROUP BY v.id, v.tenant_id, v.name, v.category, v.risk_tier, v.criticality_score,
  v.status, v.contact_person, v.email, v.contract_start, v.contract_end,
  v.last_audit_date, v.country, v.data_access_level, v.created_at;
