-- =============================================================================
-- Wave 38: Ultimate Grading Engine V4 & Scorecard
-- =============================================================================

-- 1. grading_scales — Derecelendirme Ölçeği Kataloğu
CREATE TABLE IF NOT EXISTS public.grading_scales (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES public.tenants(id),
  name            TEXT NOT NULL,           -- "BDDK Standard", "KERD-2026"
  version         TEXT NOT NULL DEFAULT '1.0',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  base_score      INTEGER NOT NULL DEFAULT 100,
  deduction_config JSONB NOT NULL DEFAULT '{
    "critical": 25,
    "high": 10,
    "medium": 5,
    "low": 1
  }'::JSONB,
  capping_rules   JSONB NOT NULL DEFAULT '[]'::JSONB,
  grade_scale     JSONB NOT NULL DEFAULT '[
    {"grade":"A+","min_score":95,"color":"#10b981","label":"Kusursuz"},
    {"grade":"A","min_score":90,"color":"#34d399","label":"Çok İyi"},
    {"grade":"B+","min_score":85,"color":"#60a5fa","label":"İyi+"},
    {"grade":"B","min_score":80,"color":"#3b82f6","label":"İyi"},
    {"grade":"C+","min_score":75,"color":"#fbbf24","label":"Kabul Edilebilir+"},
    {"grade":"C","min_score":70,"color":"#f59e0b","label":"Kabul Edilebilir"},
    {"grade":"D","min_score":60,"color":"#f97316","label":"Zayıf"},
    {"grade":"F","min_score":0,"color":"#ef4444","label":"Başarısız"}
  ]'::JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. audit_grades — Her denetim görevinin hesaplanmış notu
CREATE TABLE IF NOT EXISTS public.audit_grades (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id      UUID REFERENCES public.audit_engagements(id) ON DELETE CASCADE,
  grading_scale_id   UUID REFERENCES public.grading_scales(id) ON DELETE SET NULL,
  tenant_id          UUID NOT NULL REFERENCES public.tenants(id),
  final_score        NUMERIC(5,2) NOT NULL DEFAULT 0,
  final_grade        TEXT NOT NULL DEFAULT 'F',
  assurance_opinion  TEXT NOT NULL DEFAULT 'GUVENCE_YOK',
  base_score         INTEGER NOT NULL DEFAULT 100,
  total_deductions   NUMERIC(5,2) NOT NULL DEFAULT 0,
  capping_triggered  BOOLEAN NOT NULL DEFAULT false,
  capping_reason     TEXT,
  waterfall_breakdown JSONB,
  count_critical     INTEGER NOT NULL DEFAULT 0,
  count_high         INTEGER NOT NULL DEFAULT 0,
  count_medium       INTEGER NOT NULL DEFAULT 0,
  count_low          INTEGER NOT NULL DEFAULT 0,
  graded_by          TEXT NOT NULL DEFAULT 'system',
  graded_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (engagement_id)
);

-- 3. grade_history — Zaman İçinde Not Değişim Günlüğü
CREATE TABLE IF NOT EXISTS public.grade_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id     UUID NOT NULL REFERENCES public.audit_engagements(id) ON DELETE CASCADE,
  tenant_id         UUID NOT NULL REFERENCES public.tenants(id),
  previous_grade    TEXT,
  new_grade         TEXT NOT NULL,
  previous_score    NUMERIC(5,2),
  new_score         NUMERIC(5,2) NOT NULL,
  change_reason     TEXT,
  changed_by        TEXT NOT NULL DEFAULT 'system',
  changed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grading_scales_tenant   ON public.grading_scales(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_grades_engagement ON public.audit_grades(engagement_id);
CREATE INDEX IF NOT EXISTS idx_audit_grades_tenant     ON public.audit_grades(tenant_id, final_grade);
CREATE INDEX IF NOT EXISTS idx_grade_history_engage    ON public.grade_history(engagement_id, changed_at DESC);

-- Group Consolidation View
CREATE OR REPLACE VIEW public.view_group_consolidation AS
SELECT
  ae.tenant_id,
  ae.plan_id,
  COUNT(ae.id)                                       AS engagement_count,
  ROUND(
    SUM(ag.final_score * COALESCE(ae.risk_weight_factor, 1.0)) /
    NULLIF(SUM(COALESCE(ae.risk_weight_factor, 1.0)), 0),
    2
  )                                                  AS weighted_average_score,
  ROUND(AVG(ag.final_score), 2)                      AS simple_average_score,
  COUNT(CASE WHEN ag.capping_triggered THEN 1 END)   AS capped_count,
  SUM(COALESCE(ae.risk_weight_factor, 1.0))          AS total_risk_weight,
  MIN(ag.final_score)                                AS min_score,
  MAX(ag.final_score)                                AS max_score
FROM public.audit_engagements ae
JOIN public.audit_grades ag ON ag.engagement_id = ae.id
WHERE ae.status = 'completed'
  AND ae.plan_id IS NOT NULL
GROUP BY ae.tenant_id, ae.plan_id;

-- RLS
ALTER TABLE public.grading_scales  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_grades    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grade_history   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grading_scales_access"
  ON public.grading_scales FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "audit_grades_access"
  ON public.audit_grades FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);

CREATE POLICY "grade_history_access"
  ON public.grade_history FOR ALL TO authenticated
  USING (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID)
  WITH CHECK (tenant_id = '11111111-1111-1111-1111-111111111111'::UUID);
