/*
  # Fix Risk Configuration Table and Seed Data

  1. New Tables
    - `risk_configuration` (Singleton - 1 active row)
      - Complete schema for risk methodology configuration

  2. Security
    - RLS enabled
    - Authenticated + anon can read, update, and insert

  3. Seed Data
    - One default row with KERD-2026 constitution values
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS risk_configuration (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001'::uuid,
  weight_financial numeric NOT NULL DEFAULT 0.35,
  weight_reputation numeric NOT NULL DEFAULT 0.25,
  weight_operational numeric NOT NULL DEFAULT 0.20,
  weight_legal numeric NOT NULL DEFAULT 0.20,
  velocity_multiplier_high numeric NOT NULL DEFAULT 1.5,
  velocity_multiplier_medium numeric NOT NULL DEFAULT 1.2,
  threshold_critical numeric NOT NULL DEFAULT 20,
  threshold_high numeric NOT NULL DEFAULT 16,
  threshold_medium numeric NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_risk_configuration_active_tenant
  ON risk_configuration (tenant_id)
  WHERE is_active = true;

ALTER TABLE risk_configuration ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Authenticated users can read risk configuration'
  ) THEN
    CREATE POLICY "Authenticated users can read risk configuration"
      ON risk_configuration FOR SELECT TO authenticated
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Authenticated users can update risk configuration'
  ) THEN
    CREATE POLICY "Authenticated users can update risk configuration"
      ON risk_configuration FOR UPDATE TO authenticated
      USING (is_active = true) WITH CHECK (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Dev mode read risk configuration'
  ) THEN
    CREATE POLICY "Dev mode read risk configuration"
      ON risk_configuration FOR SELECT TO anon
      USING (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Dev mode update risk configuration'
  ) THEN
    CREATE POLICY "Dev mode update risk configuration"
      ON risk_configuration FOR UPDATE TO anon
      USING (is_active = true) WITH CHECK (is_active = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'risk_configuration' AND policyname = 'Dev mode insert risk configuration'
  ) THEN
    CREATE POLICY "Dev mode insert risk configuration"
      ON risk_configuration FOR INSERT TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Varsayilan risk konfigurasyonu seed.sql dosyasina tasindi.
