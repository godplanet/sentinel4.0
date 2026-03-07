-- =============================================================================
-- WAVE 71: BoD Evaluation & Skill Matrix (Yönetim Kurulu Yetkinlik Değerlendirmesi)
-- =============================================================================
-- Tables:
--   board_members              — YK üyelerinin profil ve görev bilgileri
--   skill_evaluations          — YK üyelerinin yetkinlik (skill) bazlı puanları
--   board_effectiveness_scores — YK'nın genel etkinlik ve performans skorları
-- =============================================================================

-- 1. BOARD MEMBERS (Yönetim Kurulu Üyeleri)
CREATE TABLE IF NOT EXISTS public.board_members (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  full_name           text NOT NULL,
  role_title          text NOT NULL,                 -- Ör: Bağımsız YK Üyesi, Risk Komitesi Bşk.
  appointment_date    date,
  is_independent      boolean NOT NULL DEFAULT false,
  status              text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'RESIGNED', 'SUSPENDED')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_board_members_tenant ON public.board_members(tenant_id);
ALTER TABLE public.board_members DISABLE ROW LEVEL SECURITY;

-- 2. SKILL EVALUATIONS (Yetkinlik Matrisi Ayrıntıları)
CREATE TABLE IF NOT EXISTS public.skill_evaluations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  member_id           uuid NOT NULL REFERENCES public.board_members(id) ON DELETE CASCADE,
  skill_category      text NOT NULL,                 -- Ör: 'Siber Güvenlik', 'Finansal Risk', 'ESG', 'Hukuk'
  score               integer NOT NULL CHECK (score BETWEEN 1 AND 10),
  evaluator_note      text,                          -- 'Siber Güvenlik Vizyon Skoru: 9/10' vb.
  evaluation_year     integer NOT NULL DEFAULT extract(year from now()),
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_evals_member ON public.skill_evaluations(member_id);
ALTER TABLE public.skill_evaluations DISABLE ROW LEVEL SECURITY;

-- 3. BOARD EFFECTIVENESS SCORES (Genel Etkinlik ve Performans)
CREATE TABLE IF NOT EXISTS public.board_effectiveness_scores (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  evaluation_period   text NOT NULL,                 -- Ör: '2025-H2'
  category            text NOT NULL,                 -- Ör: 'Karar Alma Hızı', 'Bağımsızlık', 'Çeşitlilik'
  average_score       numeric(5,2) NOT NULL,         -- Ort. skor (Ör: 8.5)
  findings            text,                          -- İyileştirme alanları
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bod_effectiveness_tenant ON public.board_effectiveness_scores(tenant_id);
ALTER TABLE public.board_effectiveness_scores DISABLE ROW LEVEL SECURITY;
