-- =============================================================================
-- Wave 55: Root Cause & 5-Whys Analyzer — DDL Only (No Seed)
-- Kök Neden ve 5-Neden Analizi Modülü
-- =============================================================================

-- Kök Neden Analiz Oturumu (her bulguya bağlanabilir)
CREATE TABLE IF NOT EXISTS root_cause_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  finding_id uuid,                              -- İlgili bulguya zayıf bağlantı (FK olmadan)
  finding_ref text DEFAULT '',                  -- Bulgu kodu / referansı
  title text NOT NULL,                          -- Analiz başlığı
  problem_statement text NOT NULL DEFAULT '',   -- Problem tanımı
  root_cause text DEFAULT '',                   -- Tespit edilen kök neden
  category text NOT NULL DEFAULT 'Operasyonel'
    CHECK (category IN ('Operasyonel', 'Sistem/BT', 'İnsan', 'Süreç', 'Dış Etken', 'Yönetim')),
  severity text NOT NULL DEFAULT 'Orta'
    CHECK (severity IN ('Kritik', 'Yüksek', 'Orta', 'Düşük')),
  status text NOT NULL DEFAULT 'Devam Ediyor'
    CHECK (status IN ('Taslak', 'Devam Ediyor', 'Tamamlandı', 'Onaylandı')),
  analyst_name text DEFAULT '',
  approved_by text DEFAULT NULL,
  approved_at timestamptz,
  corrective_action text DEFAULT '',            -- Düzeltici eylem önerisi
  preventive_action text DEFAULT '',            -- Önleyici eylem önerisi
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rca_tenant   ON root_cause_analyses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rca_status   ON root_cause_analyses(status);
CREATE INDEX IF NOT EXISTS idx_rca_category ON root_cause_analyses(category);
CREATE INDEX IF NOT EXISTS idx_rca_finding  ON root_cause_analyses(finding_ref);
CREATE INDEX IF NOT EXISTS idx_rca_created  ON root_cause_analyses(created_at DESC);

ALTER TABLE root_cause_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read rca"    ON root_cause_analyses FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert rca"  ON root_cause_analyses FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update rca"  ON root_cause_analyses FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read rca"    ON root_cause_analyses FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert rca"  ON root_cause_analyses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update rca"  ON root_cause_analyses FOR UPDATE TO authenticated USING (true);

-- 5-Neden Adımları: Her satır bir "Neden N → Cevap → Bulgu" adımıdır
CREATE TABLE IF NOT EXISTS five_whys_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  analysis_id uuid NOT NULL
    REFERENCES root_cause_analyses(id) ON DELETE CASCADE,
  step_number integer NOT NULL          -- 1 (ilk "Neden") → 5 (kök neden)
    CHECK (step_number BETWEEN 1 AND 8),-- 5 zorunlu, 8'e kadar uzatılabilir
  why_question text NOT NULL DEFAULT '',-- "Neden bu oldu?"
  answer text NOT NULL DEFAULT '',       -- Cevap
  evidence text DEFAULT '',              -- Kanıt / dayanak
  is_root_cause boolean DEFAULT false,   -- Bu adım kök neden mi?
  contributing_factor text DEFAULT '',   -- Katkıda bulunan faktörler
  ai_suggestion text DEFAULT NULL,       -- AI'ın bir sonraki "Neden" önerisi
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fws_analysis ON five_whys_steps(analysis_id);
CREATE INDEX IF NOT EXISTS idx_fws_ordered  ON five_whys_steps(analysis_id, step_number);
CREATE UNIQUE INDEX IF NOT EXISTS idx_fws_unique_step
  ON five_whys_steps(analysis_id, step_number);

ALTER TABLE five_whys_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read fws"    ON five_whys_steps FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert fws"  ON five_whys_steps FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update fws"  ON five_whys_steps FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read fws"    ON five_whys_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert fws"  ON five_whys_steps FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update fws"  ON five_whys_steps FOR UPDATE TO authenticated USING (true);
