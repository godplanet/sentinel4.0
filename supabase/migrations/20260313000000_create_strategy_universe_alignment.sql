-- ============================================================================
-- MIGRATION: Neural Map & Strategic Alignment Integration
-- Sentinel GRC v3.0 | GIAS 2025 Standard 9.2
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.strategy_universe_alignment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.strategic_bank_goals(id) ON DELETE CASCADE,
    universe_node_id UUID NOT NULL REFERENCES public.audit_entities(id) ON DELETE CASCADE,
    alignment_score NUMERIC DEFAULT 100 CHECK (alignment_score >= 0 AND alignment_score <= 100),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Hızlı erişim için index
CREATE UNIQUE INDEX IF NOT EXISTS idx_strategy_universe_alignment_unique 
  ON public.strategy_universe_alignment (goal_id, universe_node_id);

CREATE INDEX IF NOT EXISTS idx_strategy_universe_alignment_node 
  ON public.strategy_universe_alignment (universe_node_id);

-- Disable RLS for Dev
ALTER TABLE public.strategy_universe_alignment DISABLE ROW LEVEL SECURITY;
