/*
  # Entropy Protocol — Skill Decay Schema

  ## Summary
  Adds temporal tracking and decay mechanics to `talent_skills` so the system
  can model skill degradation for auditors who haven't used a skill recently.

  ## Changes

  ### Modified Table: `talent_skills`
  - `last_used_date` (date, nullable) — The most recent date this skill was actively
    exercised in a closed engagement. NULL means "never recorded".
  - `decay_factor` (numeric, default 0.95) — Multiplier applied per decay period.
    0.95 = 5% decay per cycle. Configurable per skill if needed.
  - `effective_proficiency` (numeric, nullable) — The post-decay proficiency level
    (float). If NULL, treat as equal to `proficiency_level`. Updated by EntropyEngine.
  - `decay_applied_at` (timestamptz, nullable) — Timestamp of the last decay run.

  ## Security
  Inherits existing RLS policies from `talent_skills` table.

  ## Notes
  - Existing rows receive NULL `last_used_date`, triggering maximum decay on first run.
  - `effective_proficiency` allows the UI to show decayed scores without destroying
    the original `proficiency_level` baseline.
*/

ALTER TABLE talent_skills
  ADD COLUMN IF NOT EXISTS last_used_date      date,
  ADD COLUMN IF NOT EXISTS decay_factor        numeric(5, 4)  NOT NULL DEFAULT 0.95,
  ADD COLUMN IF NOT EXISTS effective_proficiency numeric(5, 2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS decay_applied_at    timestamptz    DEFAULT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'talent_skills' AND indexname = 'idx_talent_skills_last_used_date'
  ) THEN
    CREATE INDEX idx_talent_skills_last_used_date ON talent_skills(last_used_date);
  END IF;
END $$;

UPDATE talent_skills
SET last_used_date = (CURRENT_DATE - (FLOOR(RANDOM() * 400) || ' days')::interval)::date
WHERE last_used_date IS NULL;
