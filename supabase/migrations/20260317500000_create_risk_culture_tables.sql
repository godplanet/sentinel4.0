/*
  # Wave 61: Risk Culture & Tone at the Top Pulse

  ## Tablolar
  1. `culture_surveys`   — Risk kültürü ve etik algı anketleri (kampanyalar)
  2. `sentiment_scores`  — Anketlere verilen yanıtların analiz skorları ve duygu ölçümleri
*/

-- ============================================================
-- 1. culture_surveys
-- ============================================================
CREATE TABLE IF NOT EXISTS public.culture_surveys (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  survey_code         text        NOT NULL,
  title               text        NOT NULL,
  description         text        NOT NULL DEFAULT '',
  target_audience     text        NOT NULL DEFAULT 'ALL',
                      -- Örn: 'BRANCH_STAFF', 'HQ_MANAGEMENT', 'C_LEVEL', 'ALL'
  status              text        NOT NULL DEFAULT 'DRAFT'
                      CHECK (status IN ('DRAFT','ACTIVE','CLOSED','ARCHIVED')),
  start_date          date,
  end_date            date,
  total_responses     integer     NOT NULL DEFAULT 0,
  participation_rate  numeric     NOT NULL DEFAULT 0, -- Yüzde olarak (0-100)
  overall_score       numeric     NOT NULL DEFAULT 0, -- (0-100 arası genel kültür/etik skoru)
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_culture_surveys_tenant ON public.culture_surveys(tenant_id);
CREATE INDEX IF NOT EXISTS idx_culture_surveys_status ON public.culture_surveys(status);
ALTER TABLE public.culture_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "culture_surveys: auth read"   ON public.culture_surveys FOR SELECT TO authenticated USING (true);
CREATE POLICY "culture_surveys: auth write"  ON public.culture_surveys FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "culture_surveys: anon read"   ON public.culture_surveys FOR SELECT TO anon          USING (true);
CREATE POLICY "culture_surveys: anon insert" ON public.culture_surveys FOR INSERT TO anon          WITH CHECK (true);

-- ============================================================
-- 2. sentiment_scores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sentiment_scores (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid        NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111'::uuid,
  survey_id           uuid        NOT NULL REFERENCES public.culture_surveys(id) ON DELETE CASCADE,
  department_name     text        NOT NULL,
  category            text        NOT NULL DEFAULT 'ETHICS'
                      CHECK (category IN (
                        'ETHICS', 'SPEAK_UP', 'TONE_AT_THE_TOP',
                        'ACCOUNTABILITY', 'RISK_AWARENESS'
                      )),
  score               numeric     NOT NULL DEFAULT 0,  -- (0-100)
  sentiment_label     text        NOT NULL DEFAULT 'NEUTRAL'
                      CHECK (sentiment_label IN ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'CRITICAL')),
  response_count      integer     NOT NULL DEFAULT 0,
  key_themes          text[],     -- En sık geçen kelimeler/temalar
  detected_at         timestamptz NOT NULL DEFAULT now(),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sentiment_scores_survey ON public.sentiment_scores(survey_id);
CREATE INDEX IF NOT EXISTS idx_sentiment_scores_category ON public.sentiment_scores(category);
ALTER TABLE public.sentiment_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sentiment_scores: auth read"   ON public.sentiment_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "sentiment_scores: auth write"  ON public.sentiment_scores FOR ALL    TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "sentiment_scores: anon read"   ON public.sentiment_scores FOR SELECT TO anon          USING (true);
CREATE POLICY "sentiment_scores: anon insert" ON public.sentiment_scores FOR INSERT TO anon          WITH CHECK (true);
