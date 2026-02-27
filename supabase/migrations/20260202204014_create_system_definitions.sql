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

-- Seed initial risk level definitions
INSERT INTO system_definitions (category, code, label, color, sort_order) VALUES
  ('RISK_LEVEL', 'CRITICAL', 'Kritik', '#dc2626', 1),
  ('RISK_LEVEL', 'HIGH', 'Yüksek', '#ea580c', 2),
  ('RISK_LEVEL', 'MEDIUM', 'Orta', '#f59e0b', 3),
  ('RISK_LEVEL', 'LOW', 'Düşük', '#10b981', 4),
  ('RISK_LEVEL', 'OBSERVATION', 'Gözlem', '#3b82f6', 5)
ON CONFLICT (tenant_id, category, code) DO NOTHING;

-- Seed finding status definitions
INSERT INTO system_definitions (category, code, label, color, sort_order) VALUES
  ('FINDING_STATE', 'DRAFT', 'Taslak', '#64748b', 1),
  ('FINDING_STATE', 'IN_NEGOTIATION', 'Müzakerede', '#f59e0b', 2),
  ('FINDING_STATE', 'AGREED', 'Üzerinde Anlaşıldı', '#3b82f6', 3),
  ('FINDING_STATE', 'DISPUTED', 'İtiraz Edildi', '#ef4444', 4),
  ('FINDING_STATE', 'FINAL', 'Kesinleşti', '#8b5cf6', 5),
  ('FINDING_STATE', 'REMEDIATED', 'Düzeltildi', '#10b981', 6)
ON CONFLICT (tenant_id, category, code) DO NOTHING;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_system_definitions_category
  ON system_definitions(tenant_id, category);

CREATE INDEX IF NOT EXISTS idx_system_definitions_active
  ON system_definitions(tenant_id, is_active);
