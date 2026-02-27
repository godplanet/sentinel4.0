/*
  # Expand XP Ledger — Observation & Mentorship source types

  ## Summary
  Adds three new XP earning categories to the ledger and introduces
  mentorship relationship tracking on auditor profiles.

  ## Changes

  ### xp_ledger
  - DROP + RECREATE the source_type CHECK constraint to include:
    OBSERVATION, MENTORSHIP, TRAINING_GIVEN
  - Seeded demo entries for all three new types

  ### auditor_profiles
  - New `mentees` uuid[] column — optional array of mentee user IDs
    managed by the Senior Auditor owning the row
  - New `mentor_id` uuid column — the mentor assigned to this auditor

  ## Notes
  1. Existing rows are unaffected; constraint only validates new inserts
  2. The mentees/mentor_id columns default to NULL/empty to avoid
     breaking existing profile queries
*/

-- ============================================================
-- 1.  Widen the source_type check constraint on xp_ledger
-- ============================================================

ALTER TABLE xp_ledger
  DROP CONSTRAINT IF EXISTS xp_ledger_source_type_check;

ALTER TABLE xp_ledger
  ADD CONSTRAINT xp_ledger_source_type_check
  CHECK (source_type IN (
    'FINDING', 'WORKPAPER', 'CERTIFICATE', 'EXAM', 'KUDOS',
    'OBSERVATION', 'MENTORSHIP', 'TRAINING_GIVEN'
  ));

-- ============================================================
-- 2.  Add mentorship columns to auditor_profiles
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditor_profiles' AND column_name = 'mentees'
  ) THEN
    ALTER TABLE auditor_profiles
      ADD COLUMN mentees uuid[] NOT NULL DEFAULT '{}';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auditor_profiles' AND column_name = 'mentor_id'
  ) THEN
    ALTER TABLE auditor_profiles
      ADD COLUMN mentor_id uuid;
  END IF;
END $$;

-- ============================================================

-- Gozlem ve mentorluk XP seed girisleri seed.sql dosyasina tasindi.
