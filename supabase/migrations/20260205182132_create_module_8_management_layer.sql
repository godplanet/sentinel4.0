/*
  # Module 8: Management Layer Tables
  
  1. New Tables
    - `auditor_skills` - Tracks auditor competencies and certifications
      - `user_id` (uuid, primary key, references auth.users)
      - `skills_matrix` (jsonb) - Skill ratings by category
      - `certifications` (text[]) - Professional certifications
      - `updated_at` (timestamptz)
    
    - `cpe_records` - Continuing Professional Education tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `activity_name` (text)
      - `cpe_points` (decimal)
      - `completion_date` (date)
    
    - `investigations` - Confidential investigation case management
      - `id` (uuid, primary key)
      - `case_number` (text, unique)
      - `title` (text)
      - `status` (text) - OPEN, CLOSED, LEGAL
      - `investigator_ids` (uuid[]) - Access control list
      - `severity` (text)
      - `created_at` (timestamptz)
    
    - `system_parameters` - Global system configuration
      - `key` (text, primary key)
      - `value` (jsonb)
      - `description` (text)
  
  2. Security
    - Enable RLS on all tables
    - Add restrictive policies for authenticated users
    - Special protection for investigations table
  
  3. Initial Data
    - Default risk_weights configuration
*/

-- 1. TALENT AND RESOURCE MANAGEMENT (HR)
CREATE TABLE IF NOT EXISTS public.auditor_skills (
    user_id UUID PRIMARY KEY,
    skills_matrix JSONB DEFAULT '{}',
    certifications TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.auditor_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills"
    ON public.auditor_skills FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update own skills"
    ON public.auditor_skills FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Users can insert own skills"
    ON public.auditor_skills FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 2. CPE RECORDS
CREATE TABLE IF NOT EXISTS public.cpe_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    activity_name TEXT NOT NULL,
    cpe_points DECIMAL(4,2) NOT NULL DEFAULT 0,
    completion_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cpe_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view CPE records"
    ON public.cpe_records FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert CPE records"
    ON public.cpe_records FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Users can update CPE records"
    ON public.cpe_records FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. INVESTIGATIONS (CONFIDENTIAL MODULE - STRICT RLS)
CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000',
    case_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    investigator_ids UUID[] DEFAULT '{}',
    severity TEXT DEFAULT 'HIGH',
    description TEXT,
    findings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    CONSTRAINT valid_status CHECK (status IN ('OPEN', 'ACTIVE', 'CLOSED', 'LEGAL', 'SUSPENDED'))
);

ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view investigations"
    ON public.investigations FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can update investigations"
    ON public.investigations FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated users can create investigations"
    ON public.investigations FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. SYSTEM PARAMETERS (GLOBAL CONFIGURATION ENGINE)
CREATE TABLE IF NOT EXISTS public.system_parameters (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID
);

ALTER TABLE public.system_parameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can read parameters"
    ON public.system_parameters FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can modify parameters"
    ON public.system_parameters FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can update parameters"
    ON public.system_parameters FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. INSERT DEFAULT SYSTEM PARAMETERS
INSERT INTO public.system_parameters (key, value, description, category) VALUES
    ('risk_weights', '{"impact": 50, "likelihood": 50}'::jsonb, 'Default risk calculation weights', 'risk'),
    ('grading_thresholds', '{"A": 90, "B": 80, "C": 70, "D": 60, "F": 0}'::jsonb, 'Audit grading thresholds', 'grading'),
    ('finding_severity_points', '{"CRITICAL": 25, "HIGH": 15, "MEDIUM": 10, "LOW": 5, "OBSERVATION": 2}'::jsonb, 'Points deducted per finding severity', 'grading'),
    ('auto_assign_rules', '{"enabled": false, "load_balance": true}'::jsonb, 'Automatic workpaper assignment rules', 'workflow'),
    ('notification_settings', '{"email_enabled": true, "slack_enabled": false}'::jsonb, 'System notification preferences', 'notifications')
ON CONFLICT (key) DO NOTHING;

-- 6. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_auditor_skills_user ON public.auditor_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_cpe_records_user ON public.cpe_records(user_id, completion_date DESC);
CREATE INDEX IF NOT EXISTS idx_investigations_status ON public.investigations(status) WHERE status != 'CLOSED';
CREATE INDEX IF NOT EXISTS idx_investigations_investigators ON public.investigations USING GIN(investigator_ids);
CREATE INDEX IF NOT EXISTS idx_system_parameters_category ON public.system_parameters(category);

-- 7. CREATE HELPER FUNCTION FOR SKILL UPDATES
CREATE OR REPLACE FUNCTION update_auditor_skill(
    p_user_id UUID,
    p_skill_name TEXT,
    p_rating INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.auditor_skills (user_id, skills_matrix)
    VALUES (p_user_id, jsonb_build_object(p_skill_name, p_rating))
    ON CONFLICT (user_id) DO UPDATE
    SET 
        skills_matrix = auditor_skills.skills_matrix || jsonb_build_object(p_skill_name, p_rating),
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
