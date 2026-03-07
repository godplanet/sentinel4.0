/*
  # Wave 85: Employee Stress & Fraud Correlation Engine

  1. `employee_financial_stress` - Personelin (anonim/kimliksiz) finansal stres indikasyonları (maaş haczi, kredi skoru vd.)
  2. `fraud_triangle_scores` - İlgili personel profiline ait Fraud Üçgeni (Baskı, Fırsat, Rasyonalizasyon) puanları
  3. `hr_correlation_alerts` - Sistem tarafından üretilen İK & Fraud korelasyon / suiistimal riski alarmları
*/

-- ============================================================
-- 1. employee_financial_stress
-- ============================================================
CREATE TABLE IF NOT EXISTS public.employee_financial_stress (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  anon_employee_id    text        NOT NULL, -- KVKK gereği anonim ID, örn: "EMP-1042"
  department          text        NOT NULL, 
  job_title           text        NOT NULL, -- Örn: "Hazine Uzmanı"
  salary_garnishment  boolean     NOT NULL DEFAULT false, -- Maaşında icra haczi var mı?
  credit_score_drop   boolean     NOT NULL DEFAULT false, -- Kredi notunda ani düşüş var mı? (Geniş izinli veri ile)
  lifestyle_mismatch  boolean     NOT NULL DEFAULT false, -- Maaş / Yaşam tarzı uyuşmazlığı ihbarı
  financial_stress_score numeric  NOT NULL DEFAULT 0,     -- (0-100)
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_emp_stress_tenant ON public.employee_financial_stress(tenant_id);
ALTER TABLE public.employee_financial_stress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stress: auth read"  ON public.employee_financial_stress FOR SELECT TO authenticated USING (true);
CREATE POLICY "stress: auth write" ON public.employee_financial_stress FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "stress: anon read"  ON public.employee_financial_stress FOR SELECT TO anon          USING (true);
CREATE POLICY "stress: anon write" ON public.employee_financial_stress FOR ALL    TO anon          USING (true) WITH CHECK (true);

-- ============================================================
-- 2. fraud_triangle_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.fraud_triangle_scores (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  anon_employee_id    text        NOT NULL,
  pressure_score      numeric     NOT NULL DEFAULT 0, -- (Baskı - Finansal Sıkıntı)
  opportunity_score   numeric     NOT NULL DEFAULT 0, -- (Fırsat - Sistem Yetkileri, Zafiyet)
  rationalization_score numeric   NOT NULL DEFAULT 0, -- (Haklı Çıkarma - İK performansı düşük / mobbing ihtimali)
  total_fraud_risk    numeric     NOT NULL DEFAULT 0, -- Genel Risk Yüzdesi
  last_evaluated_at   timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_triangle_tenant ON public.fraud_triangle_scores(tenant_id);
ALTER TABLE public.fraud_triangle_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "triangle: auth read"  ON public.fraud_triangle_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "triangle: auth write" ON public.fraud_triangle_scores FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "triangle: anon read"  ON public.fraud_triangle_scores FOR SELECT TO anon          USING (true);
CREATE POLICY "triangle: anon write" ON public.fraud_triangle_scores FOR ALL    TO anon          USING (true) WITH CHECK (true);

-- ============================================================
-- 3. hr_correlation_alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.hr_correlation_alerts (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  anon_employee_id    text        NOT NULL,
  alert_severity      text        NOT NULL DEFAULT 'HIGH'
                      CHECK (alert_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  fraud_vector        text        NOT NULL, -- Örn: 'EMBEZZLEMENT' (Zimmet), 'DATA_THEFT', vb.
  description         text        NOT NULL,
  status              text        NOT NULL DEFAULT 'OPEN'
                      CHECK (status IN ('OPEN', 'INVESTIGATING', 'MONITORING', 'CLOSED')),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hr_alerts_tenant ON public.hr_correlation_alerts(tenant_id);
ALTER TABLE public.hr_correlation_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hr_alerts: auth read"  ON public.hr_correlation_alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "hr_alerts: auth write" ON public.hr_correlation_alerts FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "hr_alerts: anon read"  ON public.hr_correlation_alerts FOR SELECT TO anon          USING (true);
CREATE POLICY "hr_alerts: anon write" ON public.hr_correlation_alerts FOR ALL    TO anon          USING (true) WITH CHECK (true);
