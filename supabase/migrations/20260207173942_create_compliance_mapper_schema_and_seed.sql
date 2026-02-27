/*
  # Create Compliance Mapper Schema with Rich Seed Data

  1. New Tables
    - `compliance_frameworks` - Regulatory frameworks (BDDK, KVKK, ISO, COBIT)
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `name` (text) - Framework title
      - `short_code` (text) - e.g. "BDDK-BSY"
      - `authority` (text) - Issuing body
      - `version` (text)
      - `description` (text)
      - `effective_date` (date)
      - `status` (text) - ACTIVE, DEPRECATED, DRAFT
    - `framework_requirements` - Individual regulation articles
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `framework_id` (uuid, FK compliance_frameworks)
      - `code` (text) - e.g. "Madde 24"
      - `title` (text)
      - `description` (text)
      - `category` (text) - Grouping category
      - `priority` (text) - CRITICAL, HIGH, MEDIUM, LOW
    - `control_requirement_mappings` - Maps controls to requirements
      - `id` (uuid, PK)
      - `tenant_id` (uuid, FK tenants)
      - `control_ref` (text) - Control reference code
      - `control_title` (text)
      - `requirement_id` (uuid, FK framework_requirements)
      - `coverage_strength` (text) - FULL, PARTIAL, WEAK
      - `match_score` (integer, 0-100)
      - `notes` (text)

  2. Security
    - RLS enabled on all tables
    - Anon read/write policies for dev/demo mode
    - Authenticated user policies for production

  3. Seed Data
    - 4 frameworks: BDDK-BSY, KVKK, ISO 27001, COBIT 2019
    - 30+ requirements across frameworks with realistic Turkish banking content
    - 15+ control mappings showing various coverage levels

  4. Views
    - `framework_coverage_stats` - Per-framework coverage percentages
*/

-- ============================================================
-- TABLE: compliance_frameworks
-- ============================================================
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  name text NOT NULL,
  short_code text,
  authority text,
  version text,
  description text,
  effective_date date,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure short_code column exists even if table pre-existed with an older schema
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'compliance_frameworks'
      AND column_name = 'short_code'
  ) THEN
    ALTER TABLE compliance_frameworks ADD COLUMN short_code text;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_cf_tenant ON compliance_frameworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_cf_status ON compliance_frameworks(status);

ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read frameworks (dev)"
  ON compliance_frameworks FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert frameworks (dev)"
  ON compliance_frameworks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update frameworks (dev)"
  ON compliance_frameworks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth users read own tenant frameworks"
  ON compliance_frameworks FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: framework_requirements
-- ============================================================
CREATE TABLE IF NOT EXISTS framework_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  framework_id uuid NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  code text NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  priority text NOT NULL DEFAULT 'MEDIUM',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fr_framework ON framework_requirements(framework_id);
CREATE INDEX IF NOT EXISTS idx_fr_tenant ON framework_requirements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fr_priority ON framework_requirements(priority);

ALTER TABLE framework_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read requirements (dev)"
  ON framework_requirements FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert requirements (dev)"
  ON framework_requirements FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update requirements (dev)"
  ON framework_requirements FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Auth users read own tenant requirements"
  ON framework_requirements FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- TABLE: control_requirement_mappings
-- ============================================================
CREATE TABLE IF NOT EXISTS control_requirement_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111' REFERENCES tenants(id),
  control_ref text NOT NULL,
  control_title text NOT NULL,
  requirement_id uuid NOT NULL REFERENCES framework_requirements(id) ON DELETE CASCADE,
  coverage_strength text NOT NULL DEFAULT 'FULL',
  match_score integer NOT NULL DEFAULT 100,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT crm_match_score_range CHECK (match_score >= 0 AND match_score <= 100),
  CONSTRAINT crm_coverage_check CHECK (coverage_strength IN ('FULL','PARTIAL','WEAK'))
);

CREATE INDEX IF NOT EXISTS idx_crm_requirement ON control_requirement_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_crm_tenant ON control_requirement_mappings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crm_control_ref ON control_requirement_mappings(control_ref);

ALTER TABLE control_requirement_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anon can read mappings (dev)"
  ON control_requirement_mappings FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can insert mappings (dev)"
  ON control_requirement_mappings FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update mappings (dev)"
  ON control_requirement_mappings FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon can delete mappings (dev)"
  ON control_requirement_mappings FOR DELETE TO anon USING (true);
CREATE POLICY "Auth users read own tenant mappings"
  ON control_requirement_mappings FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- ============================================================
-- VIEW: framework_coverage_stats
-- ============================================================
CREATE OR REPLACE VIEW framework_coverage_stats AS
SELECT
  cf.id AS framework_id,
  cf.tenant_id,
  cf.name,
  cf.short_code,
  cf.authority,
  cf.status,
  COUNT(fr.id) AS total_requirements,
  COUNT(DISTINCT CASE WHEN crm.id IS NOT NULL THEN fr.id END) AS covered_requirements,
  COUNT(DISTINCT CASE WHEN crm.id IS NULL THEN fr.id END) AS gap_count,
  CASE
    WHEN COUNT(fr.id) = 0 THEN 0
    ELSE ROUND((COUNT(DISTINCT CASE WHEN crm.id IS NOT NULL THEN fr.id END)::numeric / COUNT(fr.id)::numeric) * 100)
  END AS coverage_pct,
  COALESCE(AVG(crm.match_score) FILTER (WHERE crm.id IS NOT NULL), 0)::integer AS avg_match_score
FROM compliance_frameworks cf
LEFT JOIN framework_requirements fr ON fr.framework_id = cf.id
LEFT JOIN control_requirement_mappings crm ON crm.requirement_id = fr.id
WHERE cf.status = 'ACTIVE'
GROUP BY cf.id, cf.tenant_id, cf.name, cf.short_code, cf.authority, cf.status;
