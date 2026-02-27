/*
  Audit Execution & Evidence Chain Module

  This migration creates the core Audit Execution infrastructure for SENTINEL v3.0,
  implementing a flexible JSONB-based workpaper system with immutable evidence tracking
  and automated finding generation.

  1. New Tables

  audit_steps
  Static control framework defining audit procedures and testing requirements.

  workpapers
  Dynamic testing workspace using schemaless JSONB for flexible audit testing.

  evidence_chain
  Immutable evidence tracking with cryptographic verification.

  workpaper_findings  
  Findings linked to specific workpapers with automated generation.

  2. Automation

  Auto-Finding Trigger automatically generates findings when test results fail.

  3. Security

  RLS enabled on all tables with authenticated user policies.

  4. Performance

  GIN index on workpapers JSONB data for fast queries.
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Audit Steps
CREATE TABLE IF NOT EXISTS public.audit_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID,
    step_code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    risk_weight DECIMAL(3,2) DEFAULT 1.0,
    required_evidence_types TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.audit_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit steps"
  ON public.audit_steps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create audit steps"
  ON public.audit_steps FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update audit steps"
  ON public.audit_steps FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete audit steps"
  ON public.audit_steps FOR DELETE
  TO authenticated
  USING (true);

-- 2. Workpapers
CREATE TABLE IF NOT EXISTS public.workpapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    step_id UUID NOT NULL REFERENCES public.audit_steps(id) ON DELETE CASCADE,
    assigned_auditor_id UUID,
    wp_code TEXT,
    title TEXT,
    status TEXT CHECK (status IN ('draft', 'review', 'finalized')) DEFAULT 'draft',
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    version INT DEFAULT 1,
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workpapers_data ON public.workpapers USING gin (data);
CREATE INDEX IF NOT EXISTS idx_workpapers_step ON public.workpapers(step_id);
CREATE INDEX IF NOT EXISTS idx_workpapers_auditor ON public.workpapers(assigned_auditor_id);

ALTER TABLE public.workpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their workpapers"
  ON public.workpapers FOR SELECT
  TO authenticated
  USING (assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL);

CREATE POLICY "Users can create workpapers"
  ON public.workpapers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their workpapers"
  ON public.workpapers FOR UPDATE
  TO authenticated
  USING (assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL)
  WITH CHECK (assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL);

CREATE POLICY "Users can delete their workpapers"
  ON public.workpapers FOR DELETE
  TO authenticated
  USING (assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL);

-- 3. Evidence Chain
CREATE TABLE IF NOT EXISTS public.evidence_chain (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workpaper_id UUID NOT NULL REFERENCES public.workpapers(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash TEXT NOT NULL,
    uploaded_by UUID,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_workpaper ON public.evidence_chain(workpaper_id);

ALTER TABLE public.evidence_chain ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evidence for their workpapers"
  ON public.evidence_chain FOR SELECT
  TO authenticated
  USING (
    workpaper_id IN (
      SELECT id FROM public.workpapers
      WHERE assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL
    )
  );

CREATE POLICY "Users can upload evidence to their workpapers"
  ON public.evidence_chain FOR INSERT
  TO authenticated
  WITH CHECK (
    workpaper_id IN (
      SELECT id FROM public.workpapers
      WHERE assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL
    )
  );

-- 4. Workpaper Findings
CREATE TABLE IF NOT EXISTS public.workpaper_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workpaper_id UUID REFERENCES public.workpapers(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT DEFAULT 'Medium',
    source_ref TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wpfindings_workpaper ON public.workpaper_findings(workpaper_id);

ALTER TABLE public.workpaper_findings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view findings for their workpapers"
  ON public.workpaper_findings FOR SELECT
  TO authenticated
  USING (
    workpaper_id IN (
      SELECT id FROM public.workpapers
      WHERE assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL
    )
  );

CREATE POLICY "Users can create findings for their workpapers"
  ON public.workpaper_findings FOR INSERT
  TO authenticated
  WITH CHECK (
    workpaper_id IN (
      SELECT id FROM public.workpapers
      WHERE assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL
    )
  );

CREATE POLICY "Users can update findings for their workpapers"
  ON public.workpaper_findings FOR UPDATE
  TO authenticated
  USING (
    workpaper_id IN (
      SELECT id FROM public.workpapers
      WHERE assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL
    )
  )
  WITH CHECK (
    workpaper_id IN (
      SELECT id FROM public.workpapers
      WHERE assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL
    )
  );

CREATE POLICY "Users can delete findings for their workpapers"
  ON public.workpaper_findings FOR DELETE
  TO authenticated
  USING (
    workpaper_id IN (
      SELECT id FROM public.workpapers
      WHERE assigned_auditor_id = auth.uid() OR assigned_auditor_id IS NULL
    )
  );

-- 5. Auto-Finding Trigger Function
CREATE OR REPLACE FUNCTION auto_generate_finding()
RETURNS TRIGGER AS $$
DECLARE
    key text;
    value text;
BEGIN
    IF NEW.data -> 'test_results' IS NOT NULL THEN
        FOR key, value IN SELECT * FROM jsonb_each_text(NEW.data -> 'test_results')
        LOOP
            IF value = 'fail' THEN
                IF NOT EXISTS (
                    SELECT 1 FROM public.workpaper_findings 
                    WHERE workpaper_id = NEW.id 
                    AND source_ref = key
                ) THEN
                    INSERT INTO public.workpaper_findings (workpaper_id, title, description, source_ref)
                    VALUES (NEW.id, 'Otomatik Bulgu: ' || key, 'Test başarısız oldu.', key);
                END IF;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_finding ON public.workpapers;
CREATE TRIGGER trg_auto_finding
AFTER UPDATE ON public.workpapers
FOR EACH ROW
EXECUTE FUNCTION auto_generate_finding();
