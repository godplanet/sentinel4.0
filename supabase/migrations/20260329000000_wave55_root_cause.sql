-- =============================================================================
-- WAVE 55: Root Cause & 5-Whys Analyzer
-- =============================================================================
-- Tables:
--   root_cause_analyses  — One analysis per finding (polymorphic linkage)
--   five_whys_steps      — Individual why steps for the 5-Whys method
-- =============================================================================

-- 1. ROOT CAUSE ANALYSES — Ana analiz kayıtları
CREATE TABLE IF NOT EXISTS public.root_cause_analyses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  -- Polymorphic link: finding, workpaper, crisis_event, etc.
  linked_entity_type  text NOT NULL DEFAULT 'finding'
    CHECK (linked_entity_type IN ('finding', 'workpaper', 'crisis_event', 'rkm_risk', 'audit_entity')),
  linked_entity_id    uuid NOT NULL,
  title               text NOT NULL,
  method              text NOT NULL DEFAULT 'five_whys'
    CHECK (method IN ('five_whys', 'fishbone', 'bowtie')),
  status              text NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'IN_PROGRESS', 'COMPLETED', 'APPROVED')),
  problem_statement   text NOT NULL DEFAULT '',
  root_cause_summary  text,   -- final kök neden özeti (5. Why veya özet)
  -- Fishbone: 6M categories stored as JSON
  fishbone_data       jsonb,
  -- Bowtie: threats + top_event + consequences stored as JSON
  bowtie_data         jsonb,
  created_by_name     text NOT NULL DEFAULT 'Sentinel Denetçi',
  approved_by_name    text,
  approved_at         timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rca_tenant       ON public.root_cause_analyses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rca_entity       ON public.root_cause_analyses(linked_entity_type, linked_entity_id);
CREATE INDEX IF NOT EXISTS idx_rca_status       ON public.root_cause_analyses(status);
ALTER TABLE public.root_cause_analyses DISABLE ROW LEVEL SECURITY;

-- 2. FIVE WHYS STEPS — Her bir "Neden?" adımı
CREATE TABLE IF NOT EXISTS public.five_whys_steps (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  analysis_id     uuid NOT NULL REFERENCES public.root_cause_analyses(id) ON DELETE CASCADE,
  step_number     integer NOT NULL CHECK (step_number BETWEEN 1 AND 10), -- max 10 levels
  question        text NOT NULL DEFAULT '',   -- "Neden...?" sorusu
  answer          text NOT NULL DEFAULT '',   -- Cevap / Bulgulanan sebep
  evidence        text,                       -- Kanıt (dosya, log, timestamp)
  is_root_cause   boolean NOT NULL DEFAULT false, -- Son adım (kök neden) flag'i
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_five_whys_step_order
  ON public.five_whys_steps(analysis_id, step_number);
CREATE INDEX IF NOT EXISTS idx_five_whys_analysis ON public.five_whys_steps(analysis_id);
ALTER TABLE public.five_whys_steps DISABLE ROW LEVEL SECURITY;
