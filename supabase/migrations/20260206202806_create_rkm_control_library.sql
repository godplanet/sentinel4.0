/*
  # Create RKM Control Library

  1. New Tables
    - `rkm_library_categories`
      - `id` (uuid, primary key)
      - `name` (varchar 100, unique) - Category name e.g. "IT General Controls"
      - `description` (text) - Category description
      - `icon` (varchar 50) - Icon identifier for UI
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

    - `rkm_library_risks`
      - `id` (uuid, primary key)
      - `category_id` (uuid, FK to rkm_library_categories)
      - `risk_title` (text) - Risk name
      - `control_title` (text) - Control objective name
      - `standard_test_steps` (jsonb) - Array of standard test step strings
      - `risk_level` (varchar 20) - HIGH/MEDIUM/LOW
      - `framework_ref` (varchar 100) - Framework reference (COBIT, COSO etc.)
      - `sort_order` (integer) - Display order
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add read-only policies for authenticated users (library is shared reference data)

  3. Seed Data
    - 6 realistic categories: COBIT IT Controls, Credit Processes, AML/CFT, Treasury Operations, Operational Risk, Financial Controls
    - 24 control/risk entries with realistic Turkish banking test steps
*/

-- Categories table
CREATE TABLE IF NOT EXISTS rkm_library_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  icon VARCHAR(50) DEFAULT 'Shield',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rkm_library_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read library categories"
  ON rkm_library_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Risks/Controls table
CREATE TABLE IF NOT EXISTS rkm_library_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES rkm_library_categories(id) ON DELETE CASCADE,
  risk_title TEXT NOT NULL DEFAULT '',
  control_title TEXT NOT NULL DEFAULT '',
  standard_test_steps JSONB DEFAULT '[]'::jsonb,
  risk_level VARCHAR(20) DEFAULT 'MEDIUM',
  framework_ref VARCHAR(100) DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rkm_library_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read library risks"
  ON rkm_library_risks
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Dev-mode permissive policies for demo/testing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_library_categories' AND policyname = 'dev_read_library_categories'
  ) THEN
    CREATE POLICY "dev_read_library_categories"
      ON rkm_library_categories FOR SELECT TO anon USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'rkm_library_risks' AND policyname = 'dev_read_library_risks'
  ) THEN
    CREATE POLICY "dev_read_library_risks"
      ON rkm_library_risks FOR SELECT TO anon USING (true);
  END IF;
END $$;

-- RKM kutuphane seed verileri seed.sql dosyasina tasindi.

CREATE INDEX IF NOT EXISTS idx_rkm_library_risks_category_id ON rkm_library_risks(category_id);
