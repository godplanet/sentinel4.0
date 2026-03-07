-- ============================================================================
-- MIGRATION: Wave 17 - Katılım Bankacılığı ve Şeri Uyum Modülü (Fatwa-GPT)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.shariah_rulings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_no text NOT NULL,
  standard_name text NOT NULL,
  section text NOT NULL,
  article_no text NOT NULL,
  text text NOT NULL,
  ruling text NOT NULL CHECK (ruling IN ('mandatory', 'recommended', 'permissible', 'discouraged', 'prohibited')),
  risk_level text NOT NULL CHECK (risk_level IN ('critical', 'high', 'medium', 'low')),
  keywords text[] NOT NULL DEFAULT '{}',
  "references" text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fatwa_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  query text NOT NULL,
  ruling text NOT NULL,
  risk_level text NOT NULL,
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shariah_rulings_standard ON public.shariah_rulings(standard_no);
CREATE INDEX IF NOT EXISTS idx_fatwa_logs_user ON public.fatwa_logs(user_id);

-- RLS
ALTER TABLE public.shariah_rulings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fatwa_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shariah_rulings_select_anon" ON public.shariah_rulings;
CREATE POLICY "shariah_rulings_select_anon" ON public.shariah_rulings FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "shariah_rulings_select" ON public.shariah_rulings;
CREATE POLICY "shariah_rulings_select" ON public.shariah_rulings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "fatwa_logs_select_anon" ON public.fatwa_logs;
CREATE POLICY "fatwa_logs_select_anon" ON public.fatwa_logs FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "fatwa_logs_select" ON public.fatwa_logs;
CREATE POLICY "fatwa_logs_select" ON public.fatwa_logs FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "fatwa_logs_insert_anon" ON public.fatwa_logs;
CREATE POLICY "fatwa_logs_insert_anon" ON public.fatwa_logs FOR INSERT TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "fatwa_logs_insert" ON public.fatwa_logs;
CREATE POLICY "fatwa_logs_insert" ON public.fatwa_logs FOR INSERT TO authenticated WITH CHECK (true);
