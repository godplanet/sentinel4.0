-- =============================================================================
-- Wave 58: PQC (Post-Quantum Cryptography) Radar — DDL Only
-- Kuantum Sonrası Şifreleme Radarı ve Kripto Envanteri
-- =============================================================================

-- Kriptografik Varlıklar Envanteri
CREATE TABLE IF NOT EXISTS cryptographic_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  asset_name text NOT NULL,                    -- Örn: "Mobil Bankacılık API Anahtarları"
  system_owner text NOT NULL DEFAULT '',       -- Sistem Sorumlusu (Örn: Dijital Kanallar BT)
  algorithm text NOT NULL,                     -- Mevcut Algoritma (Örn: RSA-2048, ECDSA-256)
  key_size integer,                            -- Anahtar Boyutu (Örn: 2048)
  usage_context text DEFAULT '',               -- Kullanım Yeri (Örn: "Müşteri Kimlik Doğrulama")
  quantum_risk_level text NOT NULL DEFAULT 'Yüksek'
    CHECK (quantum_risk_level IN ('Kritik', 'Yüksek', 'Orta', 'Düşük', 'Güvenli (PQC)')),
  estimated_break_year integer,                -- Kuantum kırılma tahmini (Örn: 2030)
  target_pqc_algorithm text DEFAULT '',        -- Hedef PQC (Örn: ML-KEM / Kyber-768)
  status text NOT NULL DEFAULT 'Envanterde'
    CHECK (status IN ('Envanterde', 'Geçiş Planlandı', 'Geçiş Devam Ediyor', 'Tamamlandı')),
  is_agile boolean DEFAULT false,              -- Kriptografik Çeviklik (Crypto-Agility) var mı?
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crypto_tenant ON cryptographic_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_crypto_risk   ON cryptographic_assets(quantum_risk_level);
CREATE INDEX IF NOT EXISTS idx_crypto_status ON cryptographic_assets(status);

ALTER TABLE cryptographic_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read crypto"    ON cryptographic_assets FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert crypto"  ON cryptographic_assets FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update crypto"  ON cryptographic_assets FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read crypto"    ON cryptographic_assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert crypto"  ON cryptographic_assets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update crypto"  ON cryptographic_assets FOR UPDATE TO authenticated USING (true);


-- PQC Geçiş Planları (Her varlığın altındaki adımlar)
CREATE TABLE IF NOT EXISTS pqc_transition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL
    REFERENCES cryptographic_assets(id) ON DELETE CASCADE,
  phase text NOT NULL DEFAULT 'Keşif'
    CHECK (phase IN ('Keşif', 'Değerlendirme', 'Hibrit Test', 'Tam Geçiş')),
  description text NOT NULL DEFAULT '',        -- Adım açıklaması
  target_date date,                            -- Planlanan bitiş
  status text NOT NULL DEFAULT 'Planlandı'
    CHECK (status IN ('Planlandı', 'Devam Ediyor', 'Tamamlandı', 'Gecikti')),
  budget_estimate numeric(12,2) DEFAULT 0,     -- Tahmini Bütçe (TL/USD vb.)
  assigned_to text DEFAULT '',                 -- Sorumlu kişi/ekip
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pqc_plan_asset  ON pqc_transition_plans(asset_id);
CREATE INDEX IF NOT EXISTS idx_pqc_plan_status ON pqc_transition_plans(status);

ALTER TABLE pqc_transition_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read pqc_plan"   ON pqc_transition_plans FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert pqc_plan" ON pqc_transition_plans FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update pqc_plan" ON pqc_transition_plans FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read pqc_plan"   ON pqc_transition_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert pqc_plan" ON pqc_transition_plans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update pqc_plan" ON pqc_transition_plans FOR UPDATE TO authenticated USING (true);
