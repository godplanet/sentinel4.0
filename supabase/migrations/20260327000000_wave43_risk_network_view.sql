-- =============================================================================
-- WAVE 43: Quantum Risk Graph — risk_edges table + risk_network_view
-- =============================================================================
-- Creates explicit risk relationship edges between rkm_risks and audit_entities.
-- Replaces the random link generation in RiskNetworkLoader.tsx.
-- =============================================================================

-- 1. risk_edges: explicit directed risk relationships
CREATE TABLE IF NOT EXISTS public.risk_edges (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  source_id     uuid NOT NULL,            -- references rkm_risks.id (risk node)
  target_id     uuid NOT NULL,            -- references rkm_risks.id (risk node)
  relationship_type text NOT NULL DEFAULT 'CORRELATED'
    CHECK (relationship_type IN (
      'CORRELATED',    -- iki risk birbiriyle ilişkili
      'CAUSAL',        -- source → target (nedensellik)
      'MITIGATION',    -- source bir kontrol olarak target'ı azaltır
      'ESCALATION',    -- source gerçekleşirse target tetiklenir
      'DEPENDENCY'     -- target, source'a bağımlı
    )),
  weight        numeric(4,2) NOT NULL DEFAULT 1.0,  -- bağ ağırlığı (0-5)
  description   text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_edges_tenant    ON public.risk_edges(tenant_id);
CREATE INDEX IF NOT EXISTS idx_risk_edges_source    ON public.risk_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_risk_edges_target    ON public.risk_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_risk_edges_active    ON public.risk_edges(is_active);

ALTER TABLE public.risk_edges DISABLE ROW LEVEL SECURITY;

-- 2. risk_network_view: flat denormalized view for React-Force-Graph
--    Joins rkm_risks (nodes) + risk_edges (links) in single query
CREATE OR REPLACE VIEW public.risk_network_view AS
SELECT
  r.id                                  AS node_id,
  r.risk_code,
  r.risk_name,
  r.risk_category,
  r.process_area,
  r.residual_rating,
  r.residual_score,
  r.inherent_score,
  r.is_active,
  -- outgoing edges (as JSON array)
  COALESCE(
    (
      SELECT json_agg(json_build_object(
        'edge_id',           e.id,
        'target_id',         e.target_id,
        'relationship_type', e.relationship_type,
        'weight',            e.weight
      ))
      FROM public.risk_edges e
      WHERE e.source_id = r.id AND e.is_active = true
    ),
    '[]'::json
  )                                     AS outgoing_edges,
  -- incoming count (for node sizing)
  (
    SELECT COUNT(*)
    FROM public.risk_edges e
    WHERE e.target_id = r.id AND e.is_active = true
  )                                     AS incoming_edge_count
FROM public.rkm_risks r
WHERE r.is_active = true;
