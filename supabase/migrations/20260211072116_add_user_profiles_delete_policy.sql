/*
  # Add delete policy for user_profiles

  1. Changes
    - Add dev mode delete policy to allow nuclear wipe to work

  2. Security
    - Public delete policy (dev mode only)
*/

-- Dev mode public delete policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' AND policyname = 'Dev mode public delete'
  ) THEN
    CREATE POLICY "Dev mode public delete"
      ON user_profiles FOR DELETE
      TO public
      USING (true);
  END IF;
END $$;
