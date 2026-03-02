/*
  # Risk Constitution v3 — Anayasa (Birim Karnesi, Not Cetveli, Veto Kuralları)
  UI: Ayarlar > Risk Anayasası (risk-constitution). Birim Karnesi bu tabloyu okur.
  Tek aktif satır per tenant (is_active = true).
*/

CREATE TABLE IF NOT EXISTS public.risk_constitution_v3 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  version text NOT NULL DEFAULT '1.0',
  dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  impact_matrix jsonb NOT NULL DEFAULT '[]'::jsonb,
  veto_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  risk_ranges jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_risk_constitution_v3_active_tenant
  ON public.risk_constitution_v3 (tenant_id)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_risk_constitution_v3_tenant
  ON public.risk_constitution_v3 (tenant_id);

ALTER TABLE public.risk_constitution_v3 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_risk_constitution_v3"
  ON public.risk_constitution_v3 FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "authenticated_select_risk_constitution_v3"
  ON public.risk_constitution_v3 FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "authenticated_insert_risk_constitution_v3"
  ON public.risk_constitution_v3 FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "authenticated_update_risk_constitution_v3"
  ON public.risk_constitution_v3 FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "anon_insert_risk_constitution_v3"
  ON public.risk_constitution_v3 FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "anon_update_risk_constitution_v3"
  ON public.risk_constitution_v3 FOR UPDATE TO anon
  USING (true) WITH CHECK (true);

COMMENT ON TABLE public.risk_constitution_v3 IS 'Risk Anayasası v3 — not aralıkları (risk_ranges), veto kuralları (veto_rules), boyutlar ve etki matrisi. Birim Karnesi ve ayarlar sayfası bu tabloyu kullanır.';
