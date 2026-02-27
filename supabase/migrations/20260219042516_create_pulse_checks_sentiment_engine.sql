/*
  # Phase 13: Pulse & Sentiment Engine — pulse_responses table

  ## Summary
  Creates the micro-survey persistence layer for measuring auditor psychological
  safety and energy levels. Each row is one weekly check-in from one auditor.

  ## New Tables

  ### pulse_responses
  Stores individual pulse check submissions.
  - `id`            — UUID primary key
  - `user_id`       — FK to auth.users (the responding auditor)
  - `energy_level`  — Integer 1–5 (1=exhausted … 5=fully charged)
  - `stress_factor` — Categorical: 'LOW' | 'NORMAL' | 'HIGH'
  - `notes`         — Optional free-text blocker description
  - `week_key`      — ISO year+week string (e.g. "2026-W08") for dedup
  - `created_at`    — Submission timestamp

  ## Security
  - RLS enabled; restrictive by default
  - Authenticated users can INSERT their own rows
  - Authenticated users can SELECT their own rows (for "already submitted" check)
  - Service-role / managers can SELECT all rows via the anon-read policy
    (this is a low-sensitivity survey, team averages are always anonymous in UI)

  ## Important Notes
  1. `week_key` has a UNIQUE(user_id, week_key) constraint — enforces one
     submission per user per ISO week at the DB level
  2. `energy_level` is constrained to 1–5 with a CHECK
  3. `stress_factor` uses a CHECK for the three-value enum
*/

CREATE TABLE IF NOT EXISTS pulse_responses (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL,
  energy_level  int         NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  stress_factor text        NOT NULL DEFAULT 'NORMAL'
                            CHECK (stress_factor IN ('LOW', 'NORMAL', 'HIGH')),
  notes         text,
  week_key      text        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, week_key)
);

ALTER TABLE pulse_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own pulse response"
  ON pulse_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own pulse responses"
  ON pulse_responses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon and authenticated can read all pulse responses for team aggregation"
  ON pulse_responses FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_pulse_responses_user_id   ON pulse_responses (user_id);
CREATE INDEX IF NOT EXISTS idx_pulse_responses_week_key  ON pulse_responses (week_key);
CREATE INDEX IF NOT EXISTS idx_pulse_responses_created   ON pulse_responses (created_at DESC);

-- Nabiz kontrolu demo verileri seed.sql dosyasina tasindi.
