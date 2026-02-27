/*
  # Add playbook_contributions to talent_profiles

  ## Purpose
  Adds a cached counter column to `talent_profiles` tracking how many entries
  the auditor has written to the Corporate Playbook. This counter is the key
  gating variable for the Memory Gate gamification rule:
    "You cannot advance to the next level without at least one Playbook contribution."

  ## Changes
  1. `talent_profiles` — new column `playbook_contributions integer NOT NULL DEFAULT 0`
  2. Back-fills existing rows by counting from `playbook_entries.author_id`
     joined via `talent_profiles.user_id`.
  3. Creates a helper function + trigger that increments the counter whenever
     a new row is inserted into `playbook_entries`.

  ## Security
  No RLS policy changes required — column inherits existing table policies.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'talent_profiles' AND column_name = 'playbook_contributions'
  ) THEN
    ALTER TABLE talent_profiles ADD COLUMN playbook_contributions integer NOT NULL DEFAULT 0;
  END IF;
END $$;

UPDATE talent_profiles tp
SET playbook_contributions = (
  SELECT COUNT(*)::integer
  FROM playbook_entries pe
  WHERE pe.author_id = tp.user_id
)
WHERE tp.user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION increment_playbook_contributions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.author_id IS NOT NULL THEN
    UPDATE talent_profiles
    SET playbook_contributions = playbook_contributions + 1
    WHERE user_id = NEW.author_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_playbook_contributions ON playbook_entries;

CREATE TRIGGER trg_playbook_contributions
  AFTER INSERT ON playbook_entries
  FOR EACH ROW
  EXECUTE FUNCTION increment_playbook_contributions();
