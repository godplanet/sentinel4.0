/*
  # Wave 33: Chaos Lab — Kaos Mühendisliği Tabloları
  
  ## Yeni Tablolar
  1. `chaos_experiments`  — Kaos testi konfigürasyonları (senaryo, açıklama, hedef kontrol)
  2. `chaos_results`      — Her çalıştırmanın sonucu (tespit süresi, kontrol reaksiyonu, başarı oranı)

  ## Güvenlik
  - RLS her tabloda etkin
  - Dev anon bypass politikaları
*/

-- ============================================================
-- 1. chaos_experiments — Test konfigürasyonları
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chaos_experiments (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  title             text        NOT NULL DEFAULT '',
  scenario          text        NOT NULL DEFAULT 'SMURFING_TEST'
                    CHECK (scenario IN ('SMURFING_TEST','ROUND_TRIP_TEST','GHOST_PAYROLL_TEST','BENFORD_MANIPULATION','CREDIT_LIMIT_BYPASS','DORMANT_ACCOUNT_HIJACK')),
  description       text        NOT NULL DEFAULT '',
  target_control    text        NOT NULL DEFAULT '',
  target_table      text        NOT NULL DEFAULT 'shadow_transactions',
  injection_count   integer     NOT NULL DEFAULT 10,
  injection_amount  numeric     NOT NULL DEFAULT 4800,
  severity          text        NOT NULL DEFAULT 'HIGH'
                    CHECK (severity IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  is_active         boolean     NOT NULL DEFAULT true,
  created_by        uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chaos_experiments_tenant   ON public.chaos_experiments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chaos_experiments_scenario ON public.chaos_experiments(scenario);
CREATE INDEX IF NOT EXISTS idx_chaos_experiments_active   ON public.chaos_experiments(is_active);

ALTER TABLE public.chaos_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chaos_experiments: auth read"
  ON public.chaos_experiments FOR SELECT TO authenticated USING (true);
CREATE POLICY "chaos_experiments: auth insert"
  ON public.chaos_experiments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "chaos_experiments: auth update"
  ON public.chaos_experiments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "chaos_experiments: anon read"
  ON public.chaos_experiments FOR SELECT TO anon USING (true);
CREATE POLICY "chaos_experiments: anon insert"
  ON public.chaos_experiments FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- 2. chaos_results — Her çalıştırma sonuçları
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chaos_results (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  experiment_id       uuid        REFERENCES public.chaos_experiments(id) ON DELETE SET NULL,
  batch_id            text        NOT NULL DEFAULT '',
  scenario            text        NOT NULL DEFAULT 'SMURFING_TEST',
  transactions_injected integer   NOT NULL DEFAULT 0,
  total_amount        numeric     NOT NULL DEFAULT 0,
  control_reaction    text        NOT NULL DEFAULT 'MISSED'
                      CHECK (control_reaction IN ('BLOCKED','DETECTED','MISSED')),
  detection_time_ms   integer     NOT NULL DEFAULT 0,
  alert_triggered     boolean     NOT NULL DEFAULT false,
  alert_id            text,
  notes               text,
  run_by              uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  ran_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chaos_results_tenant       ON public.chaos_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_chaos_results_experiment   ON public.chaos_results(experiment_id);
CREATE INDEX IF NOT EXISTS idx_chaos_results_scenario     ON public.chaos_results(scenario);
CREATE INDEX IF NOT EXISTS idx_chaos_results_ran_at       ON public.chaos_results(ran_at DESC);

ALTER TABLE public.chaos_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chaos_results: auth read"
  ON public.chaos_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "chaos_results: auth insert"
  ON public.chaos_results FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "chaos_results: anon read"
  ON public.chaos_results FOR SELECT TO anon USING (true);
CREATE POLICY "chaos_results: anon insert"
  ON public.chaos_results FOR INSERT TO anon WITH CHECK (true);
