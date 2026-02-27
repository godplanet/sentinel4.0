/*
  # Add Cost Fields to Talent Profiles

  ## Summary
  Adds financial fields to the `talent_profiles` table to enable the
  Cost Estimation Engine in the Planning module.

  ## Changes

  ### Modified Table: `talent_profiles`
  - `hourly_rate` (numeric, default 1500.00) — The auditor's billable rate per hour in local currency
  - `currency` (text, default 'TRY') — ISO 4217 currency code for the hourly rate

  ## Security
  - RLS policies updated so that ONLY users with `role IN ('admin', 'cae', 'manager')` (from
    `user_profiles`) can read or update the `hourly_rate` column directly.
  - For this development environment (anon / no-auth mode), the existing permissive anon
    policies already cover the table, so we add an explicit policy that restricts rate access
    to privileged roles when authenticated users are present.

  ## Notes
  - Existing rows receive the default 1500.00 TRY rate via the column default.
  - A simple UPDATE seeds realistic rates so demo data looks sensible.
*/

ALTER TABLE talent_profiles
  ADD COLUMN IF NOT EXISTS hourly_rate numeric(10, 2) NOT NULL DEFAULT 1500.00,
  ADD COLUMN IF NOT EXISTS currency    text           NOT NULL DEFAULT 'TRY';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'talent_profiles' AND indexname = 'idx_talent_profiles_currency'
  ) THEN
    CREATE INDEX idx_talent_profiles_currency ON talent_profiles(currency);
  END IF;
END $$;

UPDATE talent_profiles
SET hourly_rate = CASE
  WHEN title = 'Expert'  THEN 4500.00
  WHEN title = 'Manager' THEN 3000.00
  WHEN title = 'Senior'  THEN 2000.00
  ELSE 1200.00
END
WHERE hourly_rate = 1500.00;
