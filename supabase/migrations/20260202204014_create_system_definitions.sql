/*
  # Create System Definitions Table

  1. New Tables
    - `system_definitions`
      - `id` (uuid, primary key)
      - `tenant_id` (uuid)
      - `category` (text) - e.g., 'RISK_LEVEL', 'FINDING_STATUS'
      - `code` (text) - e.g., 'CRITICAL', 'HIGH'
      - `label` (text) - Turkish label
      - `color` (text) - Hex color code
      - `sort_order` (integer) - Display order
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `system_definitions` table
    - Add policy for authenticated users to read definitions
    - Add policy for admins to update definitions

  3. Initial Data
    - Seed with default risk levels
*/

-- Create system_definitions table
CREATE TABLE IF NOT EXISTS system_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  category text NOT NULL,
  code text NOT NULL,
  label text NOT NULL,
  color text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, category, code)
);

-- Enable RLS
ALTER TABLE system_definitions ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read all definitions
CREATE POLICY "Authenticated users can read system definitions"
  ON system_definitions
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Authenticated users can update definitions (in real app, restrict to admins)
CREATE POLICY "Authenticated users can update system definitions"
  ON system_definitions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed verileri: supabase/seed.sql
-- `npx supabase db push` sonrası seed.sql ayrıca uygulanır.

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_definitions_category
  ON system_definitions(tenant_id, category);

CREATE INDEX IF NOT EXISTS idx_system_definitions_active
  ON system_definitions(tenant_id, is_active);
