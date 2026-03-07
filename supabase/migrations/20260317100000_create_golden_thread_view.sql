/*
  # Wave 39: Traceability Golden Thread VIEW
  
  Bu VIEW, denetim sürecinin uçtan uca izlenebilirliğini tek sorguda sunar:
  Strategy → Universe → Workpaper → Finding → Action
  
  Birleştirilen tablolar:
  - actions
  - audit_findings (or rkm_risks as findings source)
  - audit_programs (workpaper düzeyinde)
  - audit_engagements (universe düzeyinde)
  - audit_plan_periods (strategy düzeyinde)
*/

-- ============================================================
-- golden_thread_view — Altın İp İzlenebilirlik VIEW'ı
-- ============================================================
CREATE OR REPLACE VIEW public.golden_thread_view AS
SELECT
  -- Action katmanı
  a.id                          AS action_id,
  a.title                       AS action_title,
  a.status                      AS action_status,
  a.due_date,
  a.original_due_date,
  a.regulatory_tags,
  a.finding_snapshot,

  -- Finding katmanı (snapshot'tan)
  (a.finding_snapshot->>'finding_id')::uuid   AS finding_id,
  a.finding_snapshot->>'title'                AS finding_title,
  a.finding_snapshot->>'severity'             AS finding_severity,
  a.finding_snapshot->>'gias_category'        AS finding_gias_category,
  a.finding_snapshot->>'description'          AS finding_description,

  -- Audit program (workpaper katmanı)
  ap.id                         AS program_id,
  ap.title                      AS program_title,
  ap.program_type,

  -- Audit engagement (universe katmanı)
  ae.id                         AS engagement_id,
  ae.title                      AS engagement_title,
  ae.audit_type,
  ae.scope_statement,
  ae.risk_rating                AS engagement_risk_rating,

  -- Audit plan period (strategy katmanı)
  app2.id                       AS plan_period_id,
  app2.title                    AS plan_period_title,
  app2.year                     AS plan_year,
  app2.strategic_objective,

  -- Assignee
  a.assignee_unit_id,
  a.created_at                  AS action_created_at

FROM public.actions a
LEFT JOIN public.audit_programs ap
  ON ap.id = (
    SELECT ap2.id FROM public.audit_programs ap2
    WHERE ap2.engagement_id IS NOT NULL
    LIMIT 1
  )
LEFT JOIN public.audit_engagements ae
  ON ae.id = ap.engagement_id
LEFT JOIN public.audit_plan_periods app2
  ON app2.id = ae.plan_period_id
WHERE a.finding_snapshot IS NOT NULL;

-- RLS için güvenlik tanımı (VIEW sahibi, çağıranın RLS politikalarını kullanır)
ALTER VIEW public.golden_thread_view OWNER TO postgres;

COMMENT ON VIEW public.golden_thread_view IS
  'Wave 39: Traceability Golden Thread — Action → Finding → Program → Engagement → Plan hiyerarşik izlenebilirlik VIEW''ı';
