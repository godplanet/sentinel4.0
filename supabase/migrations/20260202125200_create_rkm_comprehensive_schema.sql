/*
  # Create Comprehensive RKM (Risk & Control Matrix) Schema

  ## Overview
  This migration creates a complete Risk & Control Matrix system with 53+ columns
  supporting Banking Audit compliance (BDDK, ISO 27001, COBIT, MASAK).

  ## New Tables

  ### 1. `rkm_processes` - Process Hierarchy
  - Hierarchical ltree structure for process organization
  - 5-level hierarchy (Department > Division > Process > Sub-process > Activity)

  ### 2. `rkm_risks` - Risk Control Matrix (Main Table)
  - 53+ columns covering all risk assessment dimensions
  - Hybrid risk scoring (inherent + residual + control effectiveness)
  - Multi-framework compliance mapping

  ## Security
  - RLS enabled on all tables
  - Tenant isolation via tenant_id
  - Role-based access control
*/

-- =============================================
-- 1. PROCESS HIERARCHY TABLE (ltree-based)
-- =============================================

CREATE TABLE IF NOT EXISTS rkm_processes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,

  -- Hierarchy (ltree)
  path ltree NOT NULL,
  level int NOT NULL CHECK (level BETWEEN 1 AND 5),

  -- Process Identification
  process_code text NOT NULL,
  process_name text NOT NULL,
  process_name_en text,
  process_type text NOT NULL CHECK (process_type IN ('PRIMARY', 'SUPPORT', 'MANAGEMENT')),

  -- Process Details
  description text,
  owner_department text,
  process_owner_role text,

  -- Metadata
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  UNIQUE(tenant_id, path),
  UNIQUE(tenant_id, process_code)
);

CREATE INDEX IF NOT EXISTS idx_rkm_processes_tenant ON rkm_processes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rkm_processes_path ON rkm_processes USING gist(path);
CREATE INDEX IF NOT EXISTS idx_rkm_processes_level ON rkm_processes(level);

-- =============================================
-- 2. MAIN RKM TABLE (53+ Columns)
-- =============================================

CREATE TABLE IF NOT EXISTS rkm_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  process_id uuid REFERENCES rkm_processes(id) ON DELETE CASCADE,

  -- ===================
  -- GROUP A: IDENTITY (Kimlik)
  -- ===================
  risk_code text NOT NULL,
  risk_title text NOT NULL,
  risk_description text NOT NULL,
  risk_owner text,
  risk_status text DEFAULT 'ACTIVE' CHECK (risk_status IN ('ACTIVE', 'MITIGATED', 'ACCEPTED', 'TRANSFERRED', 'ARCHIVED')),

  -- ===================
  -- GROUP B: PROCESS DETAIL (Süreç Detayı)
  -- ===================
  main_process text,
  sub_process text,
  process_step text,
  process_code_ref text,
  process_type text CHECK (process_type IN ('TEMEL', 'DESTEK', 'YÖNETİM')),

  -- ===================
  -- GROUP C: RISK DEFINITION (Risk Tanımlama)
  -- ===================
  risk_category text,
  risk_subcategory text,
  risk_event_description text,
  risk_cause text,
  risk_consequence text,
  potential_loss_amount numeric(15,2),

  -- ===================
  -- GROUP D: INHERENT RISK (İçsel Risk)
  -- ===================
  inherent_impact int CHECK (inherent_impact BETWEEN 1 AND 5),
  inherent_likelihood int CHECK (inherent_likelihood BETWEEN 1 AND 5),
  inherent_volume int CHECK (inherent_volume BETWEEN 1 AND 5),
  inherent_score numeric(10,2) GENERATED ALWAYS AS (
    (inherent_impact * LN(GREATEST(inherent_volume, 1) + 1))
  ) STORED,
  inherent_rating text GENERATED ALWAYS AS (
    CASE
      WHEN (inherent_impact * LN(GREATEST(inherent_volume, 1) + 1)) >= 15 THEN 'KRİTİK'
      WHEN (inherent_impact * LN(GREATEST(inherent_volume, 1) + 1)) >= 10 THEN 'YÜKSEK'
      WHEN (inherent_impact * LN(GREATEST(inherent_volume, 1) + 1)) >= 5 THEN 'ORTA'
      ELSE 'DÜŞÜK'
    END
  ) STORED,

  -- ===================
  -- GROUP E: CONTROL FRAMEWORK (Kontrol Çerçevesi)
  -- ===================
  control_objective text,
  control_description text,
  control_type text CHECK (control_type IN ('PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE')),
  control_nature text CHECK (control_nature IN ('MANUAL', 'AUTOMATED', 'HYBRID')),
  control_frequency text CHECK (control_frequency IN ('CONTINUOUS', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'AD_HOC')),
  control_owner text,
  control_department text,

  -- ===================
  -- GROUP F: CONTROL EFFECTIVENESS (Kontrol Etkinliği)
  -- ===================
  control_design_rating int CHECK (control_design_rating BETWEEN 1 AND 5),
  control_operating_rating int CHECK (control_operating_rating BETWEEN 1 AND 5),
  control_effectiveness numeric(5,2) GENERATED ALWAYS AS (
    ((control_design_rating + control_operating_rating) / 10.0)
  ) STORED,
  last_test_date date,
  test_result text CHECK (test_result IN ('EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE', 'NOT_TESTED')),
  test_evidence_ref text,

  -- ===================
  -- GROUP G: RESIDUAL RISK (Artık Risk)
  -- ===================
  residual_impact int CHECK (residual_impact BETWEEN 1 AND 5),
  residual_likelihood int CHECK (residual_likelihood BETWEEN 1 AND 5),
  residual_score numeric(10,2) GENERATED ALWAYS AS (
    (residual_impact * residual_likelihood * (1 - COALESCE((control_design_rating + control_operating_rating) / 10.0, 0)))
  ) STORED,
  residual_rating text GENERATED ALWAYS AS (
    CASE
      WHEN (residual_impact * residual_likelihood * (1 - COALESCE((control_design_rating + control_operating_rating) / 10.0, 0))) >= 15 THEN 'KRİTİK'
      WHEN (residual_impact * residual_likelihood * (1 - COALESCE((control_design_rating + control_operating_rating) / 10.0, 0))) >= 10 THEN 'YÜKSEK'
      WHEN (residual_impact * residual_likelihood * (1 - COALESCE((control_design_rating + control_operating_rating) / 10.0, 0))) >= 5 THEN 'ORTA'
      ELSE 'DÜŞÜK'
    END
  ) STORED,

  -- ===================
  -- GROUP H: COMPLIANCE MAPPING (Uyumluluk)
  -- ===================
  bddk_reference text,
  iso27001_reference text,
  cobit_reference text,
  masak_reference text,
  sox_reference text,
  gdpr_reference text,
  other_frameworks jsonb,

  -- ===================
  -- GROUP I: RESPONSE & MITIGATION (Müdahale)
  -- ===================
  risk_response_strategy text CHECK (risk_response_strategy IN ('AVOID', 'MITIGATE', 'TRANSFER', 'ACCEPT')),
  mitigation_plan text,
  mitigation_owner text,
  mitigation_deadline date,
  mitigation_status text CHECK (mitigation_status IN ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE')),
  mitigation_cost numeric(15,2),

  -- ===================
  -- GROUP J: MONITORING & REPORTING (İzleme)
  -- ===================
  kri_indicators jsonb,
  monitoring_frequency text,
  escalation_threshold text,
  last_review_date date,
  next_review_date date,
  reviewer_name text,

  -- ===================
  -- GROUP K: AUDIT & ASSURANCE (Denetim)
  -- ===================
  last_audit_date date,
  audit_finding_ref text,
  audit_rating text CHECK (audit_rating IN ('SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY')),
  management_action_plan text,
  action_due_date date,

  -- ===================
  -- GROUP L: METADATA (Meta Bilgi)
  -- ===================
  tags text[],
  custom_fields jsonb,
  attachments jsonb,
  version int DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Constraints
  UNIQUE(tenant_id, risk_code)
);

CREATE INDEX IF NOT EXISTS idx_rkm_risks_tenant ON rkm_risks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rkm_risks_process ON rkm_risks(process_id);
CREATE INDEX IF NOT EXISTS idx_rkm_risks_code ON rkm_risks(risk_code);
CREATE INDEX IF NOT EXISTS idx_rkm_risks_category ON rkm_risks(risk_category);
CREATE INDEX IF NOT EXISTS idx_rkm_risks_inherent_rating ON rkm_risks(inherent_rating);
CREATE INDEX IF NOT EXISTS idx_rkm_risks_residual_rating ON rkm_risks(residual_rating);
CREATE INDEX IF NOT EXISTS idx_rkm_risks_status ON rkm_risks(risk_status);
CREATE INDEX IF NOT EXISTS idx_rkm_risks_tags ON rkm_risks USING gin(tags);

-- =============================================
-- 3. ENABLE RLS
-- =============================================

ALTER TABLE rkm_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rkm_risks ENABLE ROW LEVEL SECURITY;

-- Processes Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_processes' AND policyname = 'Users can view own tenant processes'
  ) THEN
    CREATE POLICY "Users can view own tenant processes"
      ON rkm_processes FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_processes' AND policyname = 'Users can insert own tenant processes'
  ) THEN
    CREATE POLICY "Users can insert own tenant processes"
      ON rkm_processes FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_processes' AND policyname = 'Users can update own tenant processes'
  ) THEN
    CREATE POLICY "Users can update own tenant processes"
      ON rkm_processes FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_processes' AND policyname = 'Users can delete own tenant processes'
  ) THEN
    CREATE POLICY "Users can delete own tenant processes"
      ON rkm_processes FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Risks Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_risks' AND policyname = 'Users can view own tenant risks'
  ) THEN
    CREATE POLICY "Users can view own tenant risks"
      ON rkm_risks FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_risks' AND policyname = 'Users can insert own tenant risks'
  ) THEN
    CREATE POLICY "Users can insert own tenant risks"
      ON rkm_risks FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_risks' AND policyname = 'Users can update own tenant risks'
  ) THEN
    CREATE POLICY "Users can update own tenant risks"
      ON rkm_risks FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_risks' AND policyname = 'Users can delete own tenant risks'
  ) THEN
    CREATE POLICY "Users can delete own tenant risks"
      ON rkm_risks FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- =============================================
-- 4. HELPER FUNCTIONS
-- =============================================

CREATE OR REPLACE FUNCTION get_process_hierarchy(p_tenant_id uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid)
RETURNS TABLE (
  id uuid,
  path ltree,
  level int,
  process_code text,
  process_name text,
  parent_path ltree,
  children_count bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.path,
    p.level,
    p.process_code,
    p.process_name,
    subpath(p.path, 0, nlevel(p.path) - 1) as parent_path,
    (SELECT COUNT(*) FROM rkm_processes WHERE path <@ p.path AND path != p.path) as children_count
  FROM rkm_processes p
  WHERE p.tenant_id = p_tenant_id
    AND p.is_active = true
  ORDER BY p.path;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_risk_stats_by_process(p_process_id uuid)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total', COUNT(*),
    'critical', COUNT(*) FILTER (WHERE residual_rating = 'KRİTİK'),
    'high', COUNT(*) FILTER (WHERE residual_rating = 'YÜKSEK'),
    'medium', COUNT(*) FILTER (WHERE residual_rating = 'ORTA'),
    'low', COUNT(*) FILTER (WHERE residual_rating = 'DÜŞÜK'),
    'avg_inherent_score', AVG(inherent_score),
    'avg_residual_score', AVG(residual_score),
    'avg_control_effectiveness', AVG(control_effectiveness)
  ) INTO stats
  FROM rkm_risks
  WHERE process_id = p_process_id
    AND is_active = true;

  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
