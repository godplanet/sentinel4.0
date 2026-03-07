-- =============================================================================
-- Wave 79: Zakat Ledger & Participation ESG Auditor — DDL Only
-- Katılım Finans Uyum Denetçisi ve Zekat Defteri
-- =============================================================================

-- Kurumsal Zekat Yükümlülükleri (Corporate Zakat Obligations)
CREATE TABLE IF NOT EXISTS corporate_zakat_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  fiscal_year integer NOT NULL,                -- Örn: 2026
  calculation_method text NOT NULL DEFAULT 'Net Assets'
    CHECK (calculation_method IN ('Net Assets', 'Net Invested Funds', 'Custom/AAOIFI')),
  eligible_assets numeric(20,2) DEFAULT 0,     -- Zekata Tabi Varlıklar
  deductible_liabilities numeric(20,2) DEFAULT 0, -- İndirilebilir Yükümlülükler
  net_zakat_base numeric(20,2) DEFAULT 0,      -- Zekat Matrahı (Varlıklar - Yükümlülükler)
  zakat_rate numeric(5,2) DEFAULT 2.50,        -- Zekat Oranı (Örn: %2.5 veya %2.577)
  calculated_zakat numeric(20,2) DEFAULT 0,    -- Hesaplanmış Zekat Tutarı
  approved_by_shariah_board boolean DEFAULT false, -- Danışma Kurulu Onayı
  status text NOT NULL DEFAULT 'Draft'
    CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Disbursing', 'Paid')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_zakat_tenant ON corporate_zakat_obligations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_zakat_year   ON corporate_zakat_obligations(fiscal_year);

ALTER TABLE corporate_zakat_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read zakat"   ON corporate_zakat_obligations FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert zakat" ON corporate_zakat_obligations FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update zakat" ON corporate_zakat_obligations FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read zakat"   ON corporate_zakat_obligations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert zakat" ON corporate_zakat_obligations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update zakat" ON corporate_zakat_obligations FOR UPDATE TO authenticated USING (true);


-- Kurumsal Bağış ve Zekat Dağıtımı (Charity & Zakat Disbursements)
CREATE TABLE IF NOT EXISTS charity_disbursements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  obligation_id uuid
    REFERENCES corporate_zakat_obligations(id) ON DELETE SET NULL, -- Opsiyonel (Zekat veya normal bağış olabilir)
  fund_type text NOT NULL DEFAULT 'Zakat'
    CHECK (fund_type IN ('Zakat', 'Sadaqah', 'Purification (Arındırma)')),
  beneficiary_name text NOT NULL,              -- Örn: Kızılay, İHH, Darüşşafaka
  disbursement_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(15,2) NOT NULL DEFAULT 0,
  transaction_ref text,                        -- Dekont No / TxHash
  impact_category text,                        -- Örn: Eğitim, Sağlık, Afet Yardımı
  status text NOT NULL DEFAULT 'Completed'
    CHECK (status IN ('Pending', 'Processing', 'Completed', 'Failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_charity_tenant ON charity_disbursements(tenant_id);

ALTER TABLE charity_disbursements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read charity"   ON charity_disbursements FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert charity" ON charity_disbursements FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update charity" ON charity_disbursements FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read charity"   ON charity_disbursements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert charity" ON charity_disbursements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update charity" ON charity_disbursements FOR UPDATE TO authenticated USING (true);


-- Şüpheli / İslami Olmayan Gelir Arındırma (Non-Compliant Income Purification)
CREATE TABLE IF NOT EXISTS non_compliant_income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'
    REFERENCES tenants(id) ON DELETE CASCADE,
  income_source text NOT NULL,                 -- Örn: Gecikme Cezası (Late Payment Penalty Hesapları)
  detection_date date NOT NULL DEFAULT CURRENT_DATE,
  amount numeric(15,2) NOT NULL DEFAULT 0,     -- Arındırılması (Purify) gereken tutar
  justification text,                          -- Neden şüpheli/haram? (Örn: Yanlışlıkla faiz tahakkuku)
  purification_status text NOT NULL DEFAULT 'Pending'
    CHECK (purification_status IN ('Pending', 'In Review', 'Purified', 'Waived')),
  disbursement_id uuid
    REFERENCES charity_disbursements(id) ON DELETE SET NULL, -- Hangi bağışla arındırıldı?
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purify_tenant ON non_compliant_income(tenant_id);

ALTER TABLE non_compliant_income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read nci"   ON non_compliant_income FOR SELECT TO anon   USING (true);
CREATE POLICY "Anon insert nci" ON non_compliant_income FOR INSERT TO anon   WITH CHECK (true);
CREATE POLICY "Anon update nci" ON non_compliant_income FOR UPDATE TO anon   USING (true) WITH CHECK (true);
CREATE POLICY "Auth read nci"   ON non_compliant_income FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert nci" ON non_compliant_income FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update nci" ON non_compliant_income FOR UPDATE TO authenticated USING (true);
