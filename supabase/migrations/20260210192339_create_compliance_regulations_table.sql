/*
  # Create compliance_regulations table

  1. New Tables
    - `compliance_regulations`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid, foreign key to tenants)
      - `code` (text, NOT NULL - e.g., 'BDDK', 'MASAK', 'KVKK')
      - `title` (text, NOT NULL)
      - `category` (text, NOT NULL)
      - `article` (text, nullable - specific article/section reference)
      - `description` (text, NOT NULL)
      - `severity` (text, NOT NULL - critical/high/medium/low)
      - `framework` (text, nullable - e.g., 'GIAS2024', 'BASEL_III')
      - `is_active` (boolean, default true)
      - `metadata` (jsonb, for flexible additional data)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add dev mode policies for unrestricted access
  
  3. Indexes
    - Index on tenant_id for multi-tenancy
    - Index on code for fast lookups
    - Index on category for filtering
*/

CREATE TABLE IF NOT EXISTS compliance_regulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('BDDK', 'TCMB', 'MASAK', 'SPK', 'KVKK', 'DIGER')),
  article TEXT,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  framework TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_regulations_tenant ON compliance_regulations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_regulations_code ON compliance_regulations(code);
CREATE INDEX IF NOT EXISTS idx_compliance_regulations_category ON compliance_regulations(category);
CREATE INDEX IF NOT EXISTS idx_compliance_regulations_severity ON compliance_regulations(severity);

ALTER TABLE compliance_regulations ENABLE ROW LEVEL SECURITY;

-- Dev mode public read policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'compliance_regulations' AND policyname = 'Dev mode public read'
  ) THEN
    CREATE POLICY "Dev mode public read"
      ON compliance_regulations FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Dev mode public insert policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'compliance_regulations' AND policyname = 'Dev mode public insert'
  ) THEN
    CREATE POLICY "Dev mode public insert"
      ON compliance_regulations FOR INSERT
      TO public
      WITH CHECK (true);
  END IF;
END $$;

-- Mevzuat referans verileri (BDDK, MASAK, KVKK vb.) seed.sql dosyasina tasindi.
