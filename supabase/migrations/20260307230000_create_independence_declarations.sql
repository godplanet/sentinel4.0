-- ============================================================================
-- MIGRATION: Iron Gate — Bağımsızlık Beyanı (Yeni İzolasyon)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.independence_declarations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    engagement_id UUID NOT NULL,
    auditor_id UUID NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'signed', 'conflicted')),
    signed_at TIMESTAMPTZ,
    ip_address TEXT,
    declaration_text TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Hızlı sorgu için index
CREATE UNIQUE INDEX IF NOT EXISTS idx_indep_declarations_engagement_auditor
  ON public.independence_declarations (engagement_id, auditor_id);

-- Tetikleyici ile güncellemeleri takip edelim
CREATE OR REPLACE FUNCTION public.update_indep_declarations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_indep_declarations_updated_at ON public.independence_declarations;

CREATE TRIGGER trg_indep_declarations_updated_at
BEFORE UPDATE ON public.independence_declarations
FOR EACH ROW EXECUTE FUNCTION public.update_indep_declarations_updated_at();

-- Disable RLS for Dev
ALTER TABLE public.independence_declarations DISABLE ROW LEVEL SECURITY;
