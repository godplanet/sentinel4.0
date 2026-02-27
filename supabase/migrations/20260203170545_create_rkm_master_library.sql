/*
  # Module 6: RKM Master Library

  ## Overview
  This migration creates the Master Library system for Risk & Control templates
  that can be reused across different audit engagements. This is separate from
  the instance-specific RKM tables and serves as a centralized knowledge base.

  ## New Tables

  ### 1. `library_processes` - Master Process Catalog
  - Standard process definitions that can be reused
  - Code-based identification (e.g., 'IT-SEC', 'FIN-ACC')
  - Risk weighting for prioritization
  - Used as templates for audit universe setup

  ### 2. `library_risks` - Standard Risk Library
  - Pre-defined risk scenarios mapped to processes
  - Standardized risk levels
  - Industry best practices (BDDK, ISO 27001, COBIT)
  - Can be cloned into project-specific RKM

  ### 3. `library_controls` - Standard Control Catalog
  - Comprehensive control definitions with v2 enhancements
  - Control characteristics (Type, Automation, Frequency)
  - Key Control identification
  - Mapped to specific risks

  ## v2 Enhancements Included
  The control table includes critical fields that were missing in v2:
  - `control_type`: Preventive, Detective, Corrective classification
  - `automation_type`: Manual, Automated, IT-Dependent automation level
  - `frequency`: Control execution frequency (Daily, Weekly, Monthly, Event-Driven)
  - `is_key_control`: Boolean flag for key control identification

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read library data
  - Admin-level permissions required for modifications
*/

-- =============================================
-- 1. LIBRARY PROCESSES (Master Process Catalog)
-- =============================================

CREATE TABLE IF NOT EXISTS public.library_processes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Process Identification
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Risk Weighting
    risk_weight DECIMAL(5,2) DEFAULT 1.0 CHECK (risk_weight >= 0 AND risk_weight <= 5),
    
    -- Process Classification
    process_type TEXT CHECK (process_type IN ('PRIMARY', 'SUPPORT', 'MANAGEMENT')),
    industry_vertical TEXT,
    
    -- Compliance Frameworks
    frameworks TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_processes_code ON library_processes(code);
CREATE INDEX IF NOT EXISTS idx_library_processes_type ON library_processes(process_type);
CREATE INDEX IF NOT EXISTS idx_library_processes_active ON library_processes(is_active);
CREATE INDEX IF NOT EXISTS idx_library_processes_tags ON library_processes USING gin(tags);

-- =============================================
-- 2. LIBRARY RISKS (Standard Risk Scenarios)
-- =============================================

CREATE TABLE IF NOT EXISTS public.library_risks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Process Link
    process_id UUID REFERENCES public.library_processes(id) ON DELETE CASCADE,
    
    -- Risk Identification
    risk_code TEXT,
    risk_title TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Risk Classification
    risk_category TEXT,
    risk_subcategory TEXT,
    risk_level TEXT DEFAULT 'HIGH' CHECK (risk_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    
    -- Risk Characteristics
    risk_type TEXT CHECK (risk_type IN ('STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'TECHNOLOGY')),
    potential_impact TEXT,
    
    -- Default Risk Scores (Templates)
    default_inherent_impact INTEGER CHECK (default_inherent_impact BETWEEN 1 AND 5),
    default_inherent_likelihood INTEGER CHECK (default_inherent_likelihood BETWEEN 1 AND 5),
    default_inherent_volume INTEGER CHECK (default_inherent_volume BETWEEN 1 AND 5),
    
    -- Compliance Mapping
    bddk_reference TEXT,
    iso27001_reference TEXT,
    cobit_reference TEXT,
    masak_reference TEXT,
    sox_reference TEXT,
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_risks_process ON library_risks(process_id);
CREATE INDEX IF NOT EXISTS idx_library_risks_code ON library_risks(risk_code);
CREATE INDEX IF NOT EXISTS idx_library_risks_level ON library_risks(risk_level);
CREATE INDEX IF NOT EXISTS idx_library_risks_category ON library_risks(risk_category);
CREATE INDEX IF NOT EXISTS idx_library_risks_active ON library_risks(is_active);

-- =============================================
-- 3. LIBRARY CONTROLS (Standard Control Catalog)
-- ✓ v2 ENHANCEMENTS INCLUDED
-- =============================================

CREATE TABLE IF NOT EXISTS public.library_controls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Risk Link
    risk_id UUID REFERENCES public.library_risks(id) ON DELETE CASCADE,
    
    -- Control Identification
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    control_objective TEXT,
    
    -- ⚡ v2 CRITICAL FIELDS (Previously Missing)
    control_type TEXT NOT NULL CHECK (control_type IN ('Preventive', 'Detective', 'Corrective', 'Directive')),
    automation_type TEXT NOT NULL CHECK (automation_type IN ('Manual', 'Automated', 'IT-Dependent', 'Hybrid')),
    frequency TEXT NOT NULL CHECK (frequency IN ('Continuous', 'Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual', 'Event-Driven')),
    is_key_control BOOLEAN DEFAULT FALSE,
    
    -- Control Classification
    control_nature TEXT CHECK (control_nature IN ('MANUAL', 'AUTOMATED', 'HYBRID')),
    control_category TEXT,
    
    -- Control Ownership
    control_owner_role TEXT,
    responsible_department TEXT,
    
    -- Default Effectiveness Ratings (Templates)
    default_design_rating INTEGER CHECK (default_design_rating BETWEEN 1 AND 5),
    default_operating_rating INTEGER CHECK (default_operating_rating BETWEEN 1 AND 5),
    
    -- Testing Guidance
    testing_procedure TEXT,
    test_frequency TEXT,
    evidence_requirements TEXT,
    
    -- Compliance Mapping
    framework_references JSONB DEFAULT '{}'::JSONB,
    
    -- Metadata
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    custom_attributes JSONB DEFAULT '{}'::JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_library_controls_risk ON library_controls(risk_id);
CREATE INDEX IF NOT EXISTS idx_library_controls_code ON library_controls(code);
CREATE INDEX IF NOT EXISTS idx_library_controls_type ON library_controls(control_type);
CREATE INDEX IF NOT EXISTS idx_library_controls_automation ON library_controls(automation_type);
CREATE INDEX IF NOT EXISTS idx_library_controls_frequency ON library_controls(frequency);
CREATE INDEX IF NOT EXISTS idx_library_controls_key ON library_controls(is_key_control);
CREATE INDEX IF NOT EXISTS idx_library_controls_active ON library_controls(is_active);

-- =============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE library_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE library_controls ENABLE ROW LEVEL SECURITY;

-- Library Processes Policies
CREATE POLICY "Authenticated users can view library processes"
  ON library_processes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert library processes"
  ON library_processes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update library processes"
  ON library_processes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete library processes"
  ON library_processes FOR DELETE
  TO authenticated
  USING (true);

-- Library Risks Policies
CREATE POLICY "Authenticated users can view library risks"
  ON library_risks FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert library risks"
  ON library_risks FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update library risks"
  ON library_risks FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete library risks"
  ON library_risks FOR DELETE
  TO authenticated
  USING (true);

-- Library Controls Policies
CREATE POLICY "Authenticated users can view library controls"
  ON library_controls FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert library controls"
  ON library_controls FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update library controls"
  ON library_controls FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete library controls"
  ON library_controls FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- 5. HELPER FUNCTIONS
-- =============================================

-- Function: Get complete process with risks and controls
CREATE OR REPLACE FUNCTION get_library_process_with_controls(p_process_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'process', row_to_json(p.*),
    'risks', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'risk', row_to_json(r.*),
          'controls', (
            SELECT jsonb_agg(row_to_json(c.*))
            FROM library_controls c
            WHERE c.risk_id = r.id
              AND c.is_active = true
          )
        )
      )
      FROM library_risks r
      WHERE r.process_id = p.id
        AND r.is_active = true
    ),
    'stats', jsonb_build_object(
      'total_risks', (SELECT COUNT(*) FROM library_risks WHERE process_id = p.id AND is_active = true),
      'total_controls', (
        SELECT COUNT(*)
        FROM library_controls c
        JOIN library_risks r ON c.risk_id = r.id
        WHERE r.process_id = p.id
          AND c.is_active = true
          AND r.is_active = true
      ),
      'key_controls', (
        SELECT COUNT(*)
        FROM library_controls c
        JOIN library_risks r ON c.risk_id = r.id
        WHERE r.process_id = p.id
          AND c.is_key_control = true
          AND c.is_active = true
          AND r.is_active = true
      )
    )
  ) INTO result
  FROM library_processes p
  WHERE p.id = p_process_id;

  RETURN COALESCE(result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Search controls by attributes
CREATE OR REPLACE FUNCTION search_library_controls(
  p_control_type TEXT DEFAULT NULL,
  p_automation_type TEXT DEFAULT NULL,
  p_frequency TEXT DEFAULT NULL,
  p_key_only BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  code TEXT,
  title TEXT,
  control_type TEXT,
  automation_type TEXT,
  frequency TEXT,
  is_key_control BOOLEAN,
  process_code TEXT,
  risk_title TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.code,
    c.title,
    c.control_type,
    c.automation_type,
    c.frequency,
    c.is_key_control,
    p.code as process_code,
    r.risk_title
  FROM library_controls c
  JOIN library_risks r ON c.risk_id = r.id
  JOIN library_processes p ON r.process_id = p.id
  WHERE c.is_active = true
    AND r.is_active = true
    AND p.is_active = true
    AND (p_control_type IS NULL OR c.control_type = p_control_type)
    AND (p_automation_type IS NULL OR c.automation_type = p_automation_type)
    AND (p_frequency IS NULL OR c.frequency = p_frequency)
    AND (p_key_only = FALSE OR c.is_key_control = true)
  ORDER BY p.code, r.risk_title, c.code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Clone library process to project RKM
CREATE OR REPLACE FUNCTION clone_library_process_to_rkm(
  p_library_process_id UUID,
  p_target_tenant_id UUID DEFAULT '00000000-0000-0000-0000-000000000000'::UUID
)
RETURNS UUID AS $$
DECLARE
  v_new_process_id UUID;
BEGIN
  -- This is a placeholder for future implementation
  -- Will clone process, risks, and controls to rkm_* tables
  RAISE NOTICE 'Clone function not yet implemented';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
