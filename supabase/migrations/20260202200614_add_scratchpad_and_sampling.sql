/*
  # Module 4.3: Smart Notebook & Sampling Infrastructure

  ## Summary
  Implements auditor scratchpad (blind mode) and sampling methodology tracking per GIAS 14.1.

  ## Changes
  1. New Columns
    - `auditor_scratchpad` (text): Private notes invisible to auditee (Blind Mode)
    - `sampling_config` (jsonb): Sampling methodology configuration
      - method: JUDGMENTAL | STATISTICAL | CENSUS | ANALYTICAL
      - population_size: Total population count
      - sample_size: Selected sample size
      - rationale: Justification for method and size

  ## Security
  - Scratchpad is auditor-only (not exposed to auditee portal)
  - Sampling config is part of audit documentation trail
  - Both fields logged in audit trail via existing triggers

  ## GIAS Compliance
  - GIAS 14.1: Documents sampling methodology and rationale
  - GIAS 15.2: Preserves working notes and thought process
*/

-- Ensure core workpaper metadata columns exist for sampling views
ALTER TABLE public.workpapers
ADD COLUMN IF NOT EXISTS wp_code TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- Add scratchpad column
ALTER TABLE public.workpapers
ADD COLUMN IF NOT EXISTS auditor_scratchpad TEXT DEFAULT '';

COMMENT ON COLUMN public.workpapers.auditor_scratchpad IS
'Private auditor notes - blind mode (not visible to auditee). Used for brainstorming, risk thoughts, and working notes.';

-- Add sampling configuration
ALTER TABLE public.workpapers
ADD COLUMN IF NOT EXISTS sampling_config JSONB DEFAULT '{
  "method": "JUDGMENTAL",
  "population_size": 0,
  "sample_size": 0,
  "rationale": ""
}'::jsonb;

COMMENT ON COLUMN public.workpapers.sampling_config IS
'GIAS 14.1 - Sampling methodology: method type, population/sample sizes, and selection rationale.';

-- Create index for sampling method queries
CREATE INDEX IF NOT EXISTS idx_workpapers_sampling_method
ON public.workpapers USING gin ((sampling_config -> 'method'));

-- Validation function for sampling config
CREATE OR REPLACE FUNCTION validate_sampling_config(config JSONB)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check required fields
  IF NOT (config ? 'method' AND config ? 'population_size' AND config ? 'sample_size' AND config ? 'rationale') THEN
    RETURN FALSE;
  END IF;

  -- Validate method is one of allowed types
  IF NOT (config->>'method' IN ('JUDGMENTAL', 'STATISTICAL', 'CENSUS', 'ANALYTICAL')) THEN
    RETURN FALSE;
  END IF;

  -- Validate numeric fields
  IF NOT ((config->>'population_size')::numeric >= 0 AND (config->>'sample_size')::numeric >= 0) THEN
    RETURN FALSE;
  END IF;

  -- Sample size cannot exceed population
  IF (config->>'sample_size')::numeric > (config->>'population_size')::numeric AND (config->>'population_size')::numeric > 0 THEN
    RETURN FALSE;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Add constraint to validate sampling config structure
ALTER TABLE public.workpapers
ADD CONSTRAINT check_sampling_config_valid
CHECK (validate_sampling_config(sampling_config));

-- Helper view for sampling statistics
CREATE OR REPLACE VIEW public.v_workpaper_sampling_stats AS
SELECT
  w.id,
  w.step_id,
  w.wp_code,
  w.title,
  w.sampling_config->>'method' as sampling_method,
  (w.sampling_config->>'population_size')::numeric as population_size,
  (w.sampling_config->>'sample_size')::numeric as sample_size,
  CASE
    WHEN (w.sampling_config->>'population_size')::numeric > 0
    THEN ROUND(((w.sampling_config->>'sample_size')::numeric / (w.sampling_config->>'population_size')::numeric * 100)::numeric, 2)
    ELSE 0
  END as sample_percentage,
  w.sampling_config->>'rationale' as rationale,
  w.created_at,
  w.updated_at
FROM public.workpapers w
WHERE w.sampling_config IS NOT NULL;

COMMENT ON VIEW public.v_workpaper_sampling_stats IS
'Statistical view of sampling methodology across workpapers for quality control and review.';

-- Grant appropriate permissions
GRANT SELECT ON public.v_workpaper_sampling_stats TO authenticated;