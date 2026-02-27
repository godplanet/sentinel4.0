/*
  # Add Anon INSERT Policy for Risk Configuration

  1. Security
    - Allow anon users to INSERT risk configuration (dev mode)
    - This fixes "Risk konfigürasyonu bulunamadı" error when no data exists
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Dev mode insert risk configuration'
  ) THEN
    CREATE POLICY "Dev mode insert risk configuration"
      ON risk_configuration FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- risk_configuration seed verisi seed.sql dosyasina tasindi.
