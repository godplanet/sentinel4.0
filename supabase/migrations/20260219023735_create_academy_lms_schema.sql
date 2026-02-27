/*
  # Academy LMS Module Schema

  ## Overview
  Integrates the Academy (LMS) from legacy v2 into Sentinel v4.0.
  Covers course catalog, exams, question banks, attempt tracking,
  CPE credit records, and training assignments.

  ## New Tables

  1. `academy_courses` — Course catalog with XP reward and duration
  2. `academy_exams` — Exams linked to courses with pass threshold
  3. `academy_questions` — Question bank per exam (JSONB options)
  4. `academy_attempts` — Per-user exam attempt results
  5. `user_cpe_records` — CPE credit tracking per user
  6. `training_assignments` — Manager-assigned training tasks

  ## Talent OS Integration

  - Trigger `trg_award_xp_on_exam_pass` fires AFTER INSERT OR UPDATE on
    `academy_attempts`. When `passed` flips to TRUE:
      1. Inserts a `kudos_transactions` record (self-awarded XP, category = 'academy')
      2. UPSERTs `auditor_profiles` — increments `current_xp` and re-derives
         `current_level` using the standard 500 XP/level rule.

  ## Security
  - RLS enabled on all tables
  - Dev-mode permissive policies allow anon access (mirrors other tables)
*/

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. ACADEMY COURSES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_courses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  title               text NOT NULL,
  description         text NOT NULL DEFAULT '',
  category            text NOT NULL DEFAULT 'general',
  xp_reward           integer NOT NULL DEFAULT 100,
  estimated_duration  integer NOT NULL DEFAULT 60,
  difficulty          text NOT NULL DEFAULT 'intermediate'
    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_active           boolean NOT NULL DEFAULT true,
  thumbnail_url       text,
  tags                text[] DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE academy_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "academy_courses_anon_select"
  ON academy_courses FOR SELECT TO anon USING (true);

CREATE POLICY "academy_courses_anon_insert"
  ON academy_courses FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "academy_courses_anon_update"
  ON academy_courses FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_academy_courses_tenant ON academy_courses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_academy_courses_category ON academy_courses(category);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. ACADEMY EXAMS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_exams (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           uuid NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
  title               text NOT NULL,
  description         text NOT NULL DEFAULT '',
  passing_score       integer NOT NULL DEFAULT 70
    CHECK (passing_score BETWEEN 0 AND 100),
  time_limit_minutes  integer NOT NULL DEFAULT 30,
  max_attempts        integer NOT NULL DEFAULT 3,
  randomize_questions boolean NOT NULL DEFAULT true,
  is_active           boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE academy_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "academy_exams_anon_select"
  ON academy_exams FOR SELECT TO anon USING (true);

CREATE POLICY "academy_exams_anon_insert"
  ON academy_exams FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "academy_exams_anon_update"
  ON academy_exams FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_academy_exams_course ON academy_exams(course_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ACADEMY QUESTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_questions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id           uuid NOT NULL REFERENCES academy_exams(id) ON DELETE CASCADE,
  question_text     text NOT NULL,
  options           jsonb NOT NULL DEFAULT '[]',
  correct_option_id text NOT NULL,
  points            integer NOT NULL DEFAULT 1,
  explanation       text,
  order_index       integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE academy_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "academy_questions_anon_select"
  ON academy_questions FOR SELECT TO anon USING (true);

CREATE POLICY "academy_questions_anon_insert"
  ON academy_questions FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "academy_questions_anon_update"
  ON academy_questions FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_academy_questions_exam ON academy_questions(exam_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ACADEMY ATTEMPTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS academy_attempts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id       uuid NOT NULL REFERENCES academy_exams(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL,
  score         numeric(5,2) NOT NULL DEFAULT 0,
  passed        boolean NOT NULL DEFAULT false,
  answers       jsonb NOT NULL DEFAULT '{}',
  started_at    timestamptz NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  xp_awarded    integer NOT NULL DEFAULT 0
);

ALTER TABLE academy_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "academy_attempts_anon_select"
  ON academy_attempts FOR SELECT TO anon USING (true);

CREATE POLICY "academy_attempts_anon_insert"
  ON academy_attempts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "academy_attempts_anon_update"
  ON academy_attempts FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_academy_attempts_exam    ON academy_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_academy_attempts_user    ON academy_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_attempts_passed  ON academy_attempts(user_id, passed);

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. USER CPE RECORDS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_cpe_records (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  tenant_id     uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  title         text NOT NULL,
  provider      text NOT NULL DEFAULT '',
  credit_hours  numeric(5,2) NOT NULL DEFAULT 0,
  evidence_url  text,
  status        text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  date_earned   date NOT NULL DEFAULT CURRENT_DATE,
  notes         text,
  reviewed_by   uuid,
  reviewed_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_cpe_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_cpe_records_anon_select"
  ON user_cpe_records FOR SELECT TO anon USING (true);

CREATE POLICY "user_cpe_records_anon_insert"
  ON user_cpe_records FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "user_cpe_records_anon_update"
  ON user_cpe_records FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_user_cpe_records_user   ON user_cpe_records(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cpe_records_status ON user_cpe_records(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. TRAINING ASSIGNMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training_assignments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL,
  course_id     uuid NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
  assigned_by   uuid NOT NULL,
  tenant_id     uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  due_date      date,
  status        text NOT NULL DEFAULT 'assigned'
    CHECK (status IN ('assigned', 'in_progress', 'completed', 'overdue', 'waived')),
  priority      text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('low', 'normal', 'high', 'mandatory')),
  notes         text,
  completed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "training_assignments_anon_select"
  ON training_assignments FOR SELECT TO anon USING (true);

CREATE POLICY "training_assignments_anon_insert"
  ON training_assignments FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "training_assignments_anon_update"
  ON training_assignments FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_training_assignments_user   ON training_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_course ON training_assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_status ON training_assignments(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. TALENT OS INTEGRATION — XP TRIGGER
--
--    Fires after INSERT or UPDATE on academy_attempts.
--    When passed flips to TRUE:
--      a) Inserts a kudos_transaction (self-award, category='academy')
--      b) UPSERTs auditor_profiles — adds xp_reward, recomputes level
--         Level formula: floor(total_xp / 500) + 1, capped at 99
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION award_xp_on_exam_pass()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_xp_reward   integer;
  v_exam_title  text;
  v_course_id   uuid;
BEGIN
  IF NEW.passed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.passed IS TRUE THEN
    RETURN NEW;
  END IF;

  SELECT e.title, e.course_id
    INTO v_exam_title, v_course_id
    FROM academy_exams e
   WHERE e.id = NEW.exam_id;

  SELECT c.xp_reward
    INTO v_xp_reward
    FROM academy_courses c
   WHERE c.id = v_course_id;

  IF v_xp_reward IS NULL OR v_xp_reward <= 0 THEN
    RETURN NEW;
  END IF;

  UPDATE academy_attempts
     SET xp_awarded = v_xp_reward
   WHERE id = NEW.id;

  INSERT INTO kudos_transactions (id, sender_id, receiver_id, amount, message, category)
  VALUES (
    gen_random_uuid(),
    NEW.user_id,
    NEW.user_id,
    v_xp_reward,
    'Academy başarısı: ' || coalesce(v_exam_title, 'Sınav') || ' — ' || v_xp_reward || ' XP kazanıldı',
    'academy'
  );

  INSERT INTO auditor_profiles (user_id, current_xp, current_level, next_level_xp, fatigue_score, updated_at)
  VALUES (
    NEW.user_id,
    v_xp_reward,
    LEAST(floor(v_xp_reward / 500.0)::integer + 1, 99),
    500,
    0,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    current_xp    = auditor_profiles.current_xp + v_xp_reward,
    current_level = LEAST(floor((auditor_profiles.current_xp + v_xp_reward) / 500.0)::integer + 1, 99),
    next_level_xp = (floor((auditor_profiles.current_xp + v_xp_reward) / 500.0)::integer + 2) * 500,
    updated_at    = now();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_award_xp_on_exam_pass ON academy_attempts;

CREATE TRIGGER trg_award_xp_on_exam_pass
  AFTER INSERT OR UPDATE OF passed ON academy_attempts
  FOR EACH ROW
  EXECUTE FUNCTION award_xp_on_exam_pass();
