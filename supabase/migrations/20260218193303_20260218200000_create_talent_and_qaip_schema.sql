/*
  # Talent OS & QAIP — Full Module Schema (v2)

  ## Overview
  This migration extends the existing Talent OS foundation and adds the Survey Engine
  and QAIP enhancements required for Sentinel v4.0. It does NOT drop or recreate any
  existing table — it only adds new tables and new columns.

  ## New Tables

  ### Survey Engine (Parametric Assessment Core)
  1. `survey_templates`   — Stores the dynamic form/survey structure as JSONB (sections, questions, weights)
  2. `survey_assignments` — Links a template to a target user (evaluated) and an evaluator
  3. `qaip_survey_responses`   — Stores answers and the computed total score per assignment

  ### Talent OS Extensions
  4. `user_certifications`  — CISA, CIA, CPA, etc. with expiry tracking
  5. `succession_plans`     — GIAS 10.1 key-person succession mapping (readiness levels)
  6. `kudos_transactions`   — Gamification micro-reward ledger (sender -> receiver)

  ## Altered Tables
  - `talent_profiles`  — Adds `next_level_xp` and `skills_snapshot` (JSONB radar-chart cache)
  - `qaip_reviews`     — Adds `review_type` (HOT_REVIEW | COLD_REVIEW) column

  ## Security
  - RLS enabled on all 6 new tables
  - Separate SELECT / INSERT / UPDATE / DELETE policies per table
  - Dev-mode anon read policies for demo environment
  - Users can always read their own rows; admin role (via user_profiles) can read all

  ## Notes
  1. survey_templates.module values: 'TALENT', 'QAIP', 'ENGAGEMENT'
  2. succession_plans.readiness_level values: 'READY_NOW', 'READY_1_YEAR', 'READY_2_YEARS', 'DEVELOPING'
  3. kudos_transactions.category values: 'EXCELLENCE', 'TEAMWORK', 'INNOVATION', 'MENTORING', 'INTEGRITY'
  4. All uuid PKs use gen_random_uuid()
  5. All FK references to auth.users — not user_profiles — for Supabase compatibility
*/

-- ============================================================
-- SECTION 0: Extend Existing Tables
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'talent_profiles' AND column_name = 'next_level_xp'
  ) THEN
    ALTER TABLE talent_profiles ADD COLUMN next_level_xp integer NOT NULL DEFAULT 1000;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'talent_profiles' AND column_name = 'skills_snapshot'
  ) THEN
    ALTER TABLE talent_profiles ADD COLUMN skills_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qaip_reviews' AND column_name = 'review_type'
  ) THEN
    ALTER TABLE qaip_reviews ADD COLUMN review_type text NOT NULL DEFAULT 'HOT_REVIEW'
      CHECK (review_type IN ('HOT_REVIEW', 'COLD_REVIEW', 'EXTERNAL_REVIEW'));
  END IF;
END $$;

-- ============================================================
-- SECTION 1: Survey Engine
-- ============================================================

CREATE TABLE IF NOT EXISTS survey_templates (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL DEFAULT '',
  module         text        NOT NULL DEFAULT 'TALENT'
                             CHECK (module IN ('TALENT', 'QAIP', 'ENGAGEMENT', 'GENERAL')),
  schema         jsonb       NOT NULL DEFAULT '{}'::jsonb,
  is_active      boolean     NOT NULL DEFAULT true,
  created_by     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id      uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_templates_module    ON survey_templates(module);
CREATE INDEX IF NOT EXISTS idx_survey_templates_is_active ON survey_templates(is_active);

ALTER TABLE survey_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_templates: authenticated can read active"
  ON survey_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "survey_templates: admin can read all"
  ON survey_templates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "survey_templates: admin can insert"
  ON survey_templates FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'auditor')
    )
  );

CREATE POLICY "survey_templates: admin can update"
  ON survey_templates FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "survey_templates: admin can delete"
  ON survey_templates FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "survey_templates: dev anon read"
  ON survey_templates FOR SELECT
  TO anon
  USING (true);

-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS survey_assignments (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id        uuid        NOT NULL REFERENCES survey_templates(id) ON DELETE CASCADE,
  target_user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evaluator_user_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status             text        NOT NULL DEFAULT 'PENDING'
                                 CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  due_date           date,
  tenant_id          uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_survey_assignments_template  ON survey_assignments(template_id);
CREATE INDEX IF NOT EXISTS idx_survey_assignments_target    ON survey_assignments(target_user_id);
CREATE INDEX IF NOT EXISTS idx_survey_assignments_evaluator ON survey_assignments(evaluator_user_id);
CREATE INDEX IF NOT EXISTS idx_survey_assignments_status    ON survey_assignments(status);

ALTER TABLE survey_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "survey_assignments: target can read own"
  ON survey_assignments FOR SELECT
  TO authenticated
  USING (target_user_id = auth.uid() OR evaluator_user_id = auth.uid());

CREATE POLICY "survey_assignments: admin reads all"
  ON survey_assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "survey_assignments: evaluator can insert"
  ON survey_assignments FOR INSERT
  TO authenticated
  WITH CHECK (evaluator_user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'auditor')
    )
  );

CREATE POLICY "survey_assignments: evaluator can update"
  ON survey_assignments FOR UPDATE
  TO authenticated
  USING (evaluator_user_id = auth.uid())
  WITH CHECK (evaluator_user_id = auth.uid());

CREATE POLICY "survey_assignments: admin can delete"
  ON survey_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "survey_assignments: dev anon read"
  ON survey_assignments FOR SELECT
  TO anon
  USING (true);

-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS qaip_survey_responses (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id  uuid        NOT NULL REFERENCES survey_assignments(id) ON DELETE CASCADE,
  answers        jsonb       NOT NULL DEFAULT '{}'::jsonb,
  score_total    numeric(6,2) NOT NULL DEFAULT 0,
  submitted_at   timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assignment_id)
);

CREATE INDEX IF NOT EXISTS idx_qaip_survey_responses_assignment ON qaip_survey_responses(assignment_id);

ALTER TABLE qaip_survey_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "qaip_survey_responses: owner can read"
  ON qaip_survey_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM survey_assignments sa
      WHERE sa.id = qaip_survey_responses.assignment_id
        AND (sa.target_user_id = auth.uid() OR sa.evaluator_user_id = auth.uid())
    )
  );

CREATE POLICY "qaip_survey_responses: admin reads all"
  ON qaip_survey_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "qaip_survey_responses: evaluator can insert"
  ON qaip_survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM survey_assignments sa
      WHERE sa.id = qaip_survey_responses.assignment_id
        AND sa.evaluator_user_id = auth.uid()
    )
  );

CREATE POLICY "qaip_survey_responses: evaluator can update"
  ON qaip_survey_responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM survey_assignments sa
      WHERE sa.id = qaip_survey_responses.assignment_id
        AND sa.evaluator_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM survey_assignments sa
      WHERE sa.id = qaip_survey_responses.assignment_id
        AND sa.evaluator_user_id = auth.uid()
    )
  );

CREATE POLICY "qaip_survey_responses: admin can delete"
  ON qaip_survey_responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "qaip_survey_responses: dev anon read"
  ON qaip_survey_responses FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- SECTION 2: Talent OS Extensions
-- ============================================================

CREATE TABLE IF NOT EXISTS user_certifications (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text        NOT NULL DEFAULT '',
  issuer       text        NOT NULL DEFAULT '',
  issue_date   date        NOT NULL DEFAULT CURRENT_DATE,
  expiry_date  date,
  status       text        NOT NULL DEFAULT 'PENDING'
               CHECK (status IN ('VERIFIED', 'PENDING', 'EXPIRED', 'REVOKED')),
  credential_url text,
  tenant_id    uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_certs_user_id ON user_certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_certs_status  ON user_certifications(status);
CREATE INDEX IF NOT EXISTS idx_user_certs_expiry  ON user_certifications(expiry_date);

ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_certifications: user reads own"
  ON user_certifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_certifications: admin reads all"
  ON user_certifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'executive')
    )
  );

CREATE POLICY "user_certifications: user inserts own"
  ON user_certifications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_certifications: user updates own"
  ON user_certifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_certifications: admin updates any"
  ON user_certifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "user_certifications: user deletes own"
  ON user_certifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "user_certifications: dev anon read"
  ON user_certifications FOR SELECT
  TO anon
  USING (true);

-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS succession_plans (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  key_position_user_id  uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  successor_user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  readiness_level       text        NOT NULL DEFAULT 'DEVELOPING'
                        CHECK (readiness_level IN ('READY_NOW', 'READY_1_YEAR', 'READY_2_YEARS', 'DEVELOPING')),
  notes                 text,
  tenant_id             uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (key_position_user_id, successor_user_id)
);

CREATE INDEX IF NOT EXISTS idx_succession_key_user      ON succession_plans(key_position_user_id);
CREATE INDEX IF NOT EXISTS idx_succession_successor     ON succession_plans(successor_user_id);
CREATE INDEX IF NOT EXISTS idx_succession_readiness     ON succession_plans(readiness_level);

ALTER TABLE succession_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "succession_plans: involved users can read"
  ON succession_plans FOR SELECT
  TO authenticated
  USING (
    key_position_user_id = auth.uid()
    OR successor_user_id = auth.uid()
  );

CREATE POLICY "succession_plans: admin reads all"
  ON succession_plans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'executive')
    )
  );

CREATE POLICY "succession_plans: admin can insert"
  ON succession_plans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "succession_plans: admin can update"
  ON succession_plans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "succession_plans: admin can delete"
  ON succession_plans FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "succession_plans: dev anon read"
  ON succession_plans FOR SELECT
  TO anon
  USING (true);

-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS kudos_transactions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      integer     NOT NULL DEFAULT 1 CHECK (amount BETWEEN 1 AND 100),
  message     text        NOT NULL DEFAULT '',
  category    text        NOT NULL DEFAULT 'EXCELLENCE'
              CHECK (category IN ('EXCELLENCE', 'TEAMWORK', 'INNOVATION', 'MENTORING', 'INTEGRITY')),
  tenant_id   uuid        NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT kudos_no_self_kudos CHECK (sender_id <> receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_kudos_sender   ON kudos_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_kudos_receiver ON kudos_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_kudos_category ON kudos_transactions(category);

ALTER TABLE kudos_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kudos_transactions: user reads own sent or received"
  ON kudos_transactions FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "kudos_transactions: admin reads all"
  ON kudos_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role IN ('admin', 'executive')
    )
  );

CREATE POLICY "kudos_transactions: authenticated can insert"
  ON kudos_transactions FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "kudos_transactions: admin can delete"
  ON kudos_transactions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
        AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "kudos_transactions: dev anon read"
  ON kudos_transactions FOR SELECT
  TO anon
  USING (true);
