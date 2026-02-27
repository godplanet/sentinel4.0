/*
  # Module 7: Unified Compliance Framework

  ## Purpose
  Enable multi-framework compliance mapping where a single control can satisfy
  requirements from multiple regulatory standards (ISO 27001, COBIT, BDDK, etc.)

  ## New Tables
  
  ### 1. `compliance_frameworks`
  Library of regulatory frameworks and standards
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, foreign key to tenants)
  - `name` (text) - Framework name (e.g., 'ISO 27001:2022')
  - `version` (text) - Version number
  - `description` (text) - Full description
  - `authority` (text) - Issuing authority (e.g., 'ISO', 'BDDK')
  - `effective_date` (date) - When framework becomes effective
  - `status` (text) - ACTIVE, DEPRECATED, DRAFT
  - `created_at`, `updated_at` (timestamps)

  ### 2. `framework_requirements`
  Individual requirements/articles from each framework
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, foreign key to tenants)
  - `framework_id` (uuid, foreign key to compliance_frameworks)
  - `code` (text) - Requirement code (e.g., 'A.9.2', 'Madde 12')
  - `title` (text) - Short title
  - `description` (text) - Full requirement text
  - `category` (text) - Grouping category
  - `priority` (text) - CRITICAL, HIGH, MEDIUM, LOW
  - `created_at`, `updated_at` (timestamps)

  ### 3. `control_mappings`
  Many-to-many mapping between RKM controls and framework requirements
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, foreign key to tenants)
  - `control_id` (uuid, foreign key to library_controls)
  - `requirement_id` (uuid, foreign key to framework_requirements)
  - `match_score` (integer) - Percentage of requirement coverage (0-100)
  - `mapping_type` (text) - DIRECT, PARTIAL, SUPPORTING
  - `notes` (text) - Mapping rationale
  - `created_by` (uuid) - Who created the mapping
  - `created_at`, `updated_at` (timestamps)

  ## Security
  - All tables have tenant_id for multi-tenancy
  - RLS enabled on all tables
  - Policies restrict access to authenticated users within same tenant

  ## Notes
  - One control can map to multiple requirements across different frameworks
  - One requirement can be satisfied by multiple controls
  - Match score enables gap analysis (controls covering <100% need enhancement)
*/

-- =====================================================================
-- TABLE: compliance_frameworks
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    version TEXT,
    description TEXT,
    authority TEXT, -- 'ISO', 'BDDK', 'COBIT', 'NIST'
    effective_date DATE,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_framework_status CHECK (
        status IN ('ACTIVE', 'DEPRECATED', 'DRAFT')
    ),
    CONSTRAINT unique_framework_version UNIQUE (tenant_id, name, version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_frameworks_tenant 
    ON public.compliance_frameworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_frameworks_status 
    ON public.compliance_frameworks(status) WHERE status = 'ACTIVE';

-- RLS
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view frameworks"
    ON public.compliance_frameworks FOR SELECT
    TO authenticated
    USING (tenant_id IN (SELECT id FROM tenants));

CREATE POLICY "Authenticated users can insert frameworks"
    ON public.compliance_frameworks FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id IN (SELECT id FROM tenants));

CREATE POLICY "Authenticated users can update frameworks"
    ON public.compliance_frameworks FOR UPDATE
    TO authenticated
    USING (tenant_id IN (SELECT id FROM tenants))
    WITH CHECK (tenant_id IN (SELECT id FROM tenants));

-- =====================================================================
-- TABLE: framework_requirements
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.framework_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES public.compliance_frameworks(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    priority TEXT NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_requirement_priority CHECK (
        priority IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')
    ),
    CONSTRAINT unique_requirement_code UNIQUE (tenant_id, framework_id, code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_requirements_framework 
    ON public.framework_requirements(framework_id);
CREATE INDEX IF NOT EXISTS idx_requirements_tenant 
    ON public.framework_requirements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_requirements_priority 
    ON public.framework_requirements(priority);

-- RLS
ALTER TABLE public.framework_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view requirements"
    ON public.framework_requirements FOR SELECT
    TO authenticated
    USING (tenant_id IN (SELECT id FROM tenants));

CREATE POLICY "Authenticated users can insert requirements"
    ON public.framework_requirements FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id IN (SELECT id FROM tenants));

CREATE POLICY "Authenticated users can update requirements"
    ON public.framework_requirements FOR UPDATE
    TO authenticated
    USING (tenant_id IN (SELECT id FROM tenants))
    WITH CHECK (tenant_id IN (SELECT id FROM tenants));

-- =====================================================================
-- TABLE: control_mappings
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.control_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES public.library_controls(id) ON DELETE CASCADE,
    requirement_id UUID NOT NULL REFERENCES public.framework_requirements(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL DEFAULT 100,
    mapping_type TEXT NOT NULL DEFAULT 'DIRECT',
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_match_score CHECK (
        match_score >= 0 AND match_score <= 100
    ),
    CONSTRAINT valid_mapping_type CHECK (
        mapping_type IN ('DIRECT', 'PARTIAL', 'SUPPORTING', 'REFERENCE')
    ),
    CONSTRAINT unique_control_requirement_mapping 
        UNIQUE (tenant_id, control_id, requirement_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_mappings_control 
    ON public.control_mappings(control_id);
CREATE INDEX IF NOT EXISTS idx_mappings_requirement 
    ON public.control_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_mappings_tenant 
    ON public.control_mappings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mappings_score 
    ON public.control_mappings(match_score) WHERE match_score < 100;

-- RLS
ALTER TABLE public.control_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view mappings"
    ON public.control_mappings FOR SELECT
    TO authenticated
    USING (tenant_id IN (SELECT id FROM tenants));

CREATE POLICY "Authenticated users can insert mappings"
    ON public.control_mappings FOR INSERT
    TO authenticated
    WITH CHECK (tenant_id IN (SELECT id FROM tenants));

CREATE POLICY "Authenticated users can update mappings"
    ON public.control_mappings FOR UPDATE
    TO authenticated
    USING (tenant_id IN (SELECT id FROM tenants))
    WITH CHECK (tenant_id IN (SELECT id FROM tenants));

CREATE POLICY "Authenticated users can delete mappings"
    ON public.control_mappings FOR DELETE
    TO authenticated
    USING (tenant_id IN (SELECT id FROM tenants));

-- =====================================================================
-- HELPER VIEWS
-- =====================================================================

-- View: Control Coverage by Framework
CREATE OR REPLACE VIEW public.framework_coverage_summary AS
SELECT 
    cf.id AS framework_id,
    cf.name AS framework_name,
    cf.version,
    COUNT(DISTINCT fr.id) AS total_requirements,
    COUNT(DISTINCT cm.control_id) AS mapped_controls,
    COUNT(DISTINCT CASE WHEN cm.match_score = 100 THEN fr.id END) AS fully_covered_requirements,
    COUNT(DISTINCT CASE WHEN cm.match_score < 100 THEN fr.id END) AS partially_covered_requirements,
    COUNT(DISTINCT CASE WHEN cm.id IS NULL THEN fr.id END) AS uncovered_requirements,
    ROUND(
        (COUNT(DISTINCT CASE WHEN cm.match_score = 100 THEN fr.id END)::NUMERIC / 
         NULLIF(COUNT(DISTINCT fr.id), 0)) * 100, 
        2
    ) AS coverage_percentage
FROM public.compliance_frameworks cf
LEFT JOIN public.framework_requirements fr ON cf.id = fr.framework_id
LEFT JOIN public.control_mappings cm ON fr.id = cm.requirement_id
WHERE cf.status = 'ACTIVE'
GROUP BY cf.id, cf.name, cf.version;

-- =====================================================================
-- HELPER FUNCTIONS
-- =====================================================================

-- Function: Get all frameworks covered by a control
CREATE OR REPLACE FUNCTION public.get_control_frameworks(p_control_id UUID)
RETURNS TABLE (
    framework_name TEXT,
    requirement_count BIGINT,
    avg_match_score NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cf.name,
        COUNT(cm.requirement_id),
        ROUND(AVG(cm.match_score), 2)
    FROM public.control_mappings cm
    JOIN public.framework_requirements fr ON cm.requirement_id = fr.id
    JOIN public.compliance_frameworks cf ON fr.framework_id = cf.id
    WHERE cm.control_id = p_control_id
    GROUP BY cf.id, cf.name
    ORDER BY COUNT(cm.requirement_id) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get gap analysis for a framework
CREATE OR REPLACE FUNCTION public.get_framework_gaps(p_framework_id UUID)
RETURNS TABLE (
    requirement_code TEXT,
    requirement_title TEXT,
    priority TEXT,
    coverage_score INTEGER,
    mapped_controls INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        fr.code,
        fr.title,
        fr.priority,
        COALESCE(MAX(cm.match_score), 0) AS coverage_score,
        COUNT(cm.control_id)::INTEGER AS mapped_controls
    FROM public.framework_requirements fr
    LEFT JOIN public.control_mappings cm ON fr.id = cm.requirement_id
    WHERE fr.framework_id = p_framework_id
    GROUP BY fr.id, fr.code, fr.title, fr.priority
    HAVING COALESCE(MAX(cm.match_score), 0) < 100
    ORDER BY 
        CASE fr.priority 
            WHEN 'CRITICAL' THEN 1
            WHEN 'HIGH' THEN 2
            WHEN 'MEDIUM' THEN 3
            WHEN 'LOW' THEN 4
        END,
        COALESCE(MAX(cm.match_score), 0) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;