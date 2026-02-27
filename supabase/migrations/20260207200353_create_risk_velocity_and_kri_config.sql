/*
  # Risk Velocity & KRI Configuration

  1. Modified Tables
    - `audit_entities`
      - `risk_velocity_score` (float) - calculated speed of risk movement
      - `last_position` (jsonb) - previous quarter risk position {x, y, date}
      - `current_position` (jsonb) - current quarter risk position {x, y, date}

  2. New Tables
    - `integration_kri_config`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid)
      - `source_system` (text) - e.g. SAP_HR, SIEM, CORE_BANKING
      - `kri_name` (text) - e.g. Staff_Turnover_Rate
      - `threshold_value` (numeric) - trigger threshold
      - `impact_axis` (text) - LIKELIHOOD or IMPACT
      - `impact_weight` (numeric) - how much it moves the bubble
      - `is_active` (boolean)
      - `description` (text)
      - `created_at`, `updated_at` (timestamptz)

  3. Security
    - RLS enabled on integration_kri_config
    - Policies for authenticated + dev mode access
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'risk_velocity_score'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN risk_velocity_score FLOAT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'last_position'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN last_position JSONB DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_entities' AND column_name = 'current_position'
  ) THEN
    ALTER TABLE audit_entities ADD COLUMN current_position JSONB DEFAULT NULL;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS integration_kri_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  source_system TEXT NOT NULL DEFAULT '',
  kri_name TEXT NOT NULL DEFAULT '',
  threshold_value NUMERIC NOT NULL DEFAULT 0,
  impact_axis TEXT NOT NULL DEFAULT 'LIKELIHOOD' CHECK (impact_axis IN ('LIKELIHOOD', 'IMPACT')),
  impact_weight NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE integration_kri_config ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integration_kri_config' AND policyname = 'KRI config read for authenticated'
  ) THEN
    CREATE POLICY "KRI config read for authenticated"
      ON integration_kri_config FOR SELECT
      TO authenticated
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integration_kri_config' AND policyname = 'KRI config insert for authenticated'
  ) THEN
    CREATE POLICY "KRI config insert for authenticated"
      ON integration_kri_config FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integration_kri_config' AND policyname = 'KRI config update for authenticated'
  ) THEN
    CREATE POLICY "KRI config update for authenticated"
      ON integration_kri_config FOR UPDATE
      TO authenticated
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integration_kri_config' AND policyname = 'KRI config delete for authenticated'
  ) THEN
    CREATE POLICY "KRI config delete for authenticated"
      ON integration_kri_config FOR DELETE
      TO authenticated
      USING (auth.uid() IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integration_kri_config' AND policyname = 'dev_kri_config_select'
  ) THEN
    CREATE POLICY "dev_kri_config_select" ON integration_kri_config FOR SELECT TO anon USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integration_kri_config' AND policyname = 'dev_kri_config_insert'
  ) THEN
    CREATE POLICY "dev_kri_config_insert" ON integration_kri_config FOR INSERT TO anon WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integration_kri_config' AND policyname = 'dev_kri_config_update'
  ) THEN
    CREATE POLICY "dev_kri_config_update" ON integration_kri_config FOR UPDATE TO anon USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integration_kri_config' AND policyname = 'dev_kri_config_delete'
  ) THEN
    CREATE POLICY "dev_kri_config_delete" ON integration_kri_config FOR DELETE TO anon USING (true);
  END IF;
END $$;
