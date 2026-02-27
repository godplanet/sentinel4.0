/*
  # Audit Universe - Hierarchical Entity Model

  ## Overview
  This migration establishes the core hierarchical audit universe using PostgreSQL ltree.
  It supports 5-level banking structures: HOLDING → BANK → GROUP → UNIT → PROCESS.

  ## New Tables

  ### `audit_entities`
  Hierarchical entity tree using ltree for path-based queries.

  | Column               | Type      | Description                                      |
  |---------------------|-----------|--------------------------------------------------|
  | id                  | uuid      | Primary key                                      |
  | tenant_id           | uuid      | Multi-tenant isolation (FK to tenants)           |
  | path                | ltree     | Hierarchical path (e.g., holding.bank.retail)    |
  | name                | text      | Display name                                     |
  | type                | enum      | Entity type (HOLDING/BANK/GROUP/UNIT/PROCESS)    |
  | risk_score          | float     | Computed risk score (0-100)                      |
  | velocity_multiplier | float     | Risk velocity factor (default 1.0)               |
  | owner_id            | uuid      | Responsible user (FK to auth.users)              |
  | metadata            | jsonb     | Extensible attributes                            |
  | created_at          | timestamptz | Creation timestamp                              |
  | updated_at          | timestamptz | Last modification timestamp                     |

  ## Indexes
  - GiST index on `path` for fast hierarchical queries (ancestor/descendant lookups)
  - Index on `tenant_id` for multi-tenant isolation
  - Index on `type` for filtering by entity level

  ## Security
  - Row Level Security (RLS) enabled
  - Users can only access entities within their tenant
  - Authenticated users can read entities
  - Only authorized users can modify entities

  ## Important Notes
  1. The ltree extension enables efficient hierarchical queries using path notation
  2. Risk scores are calculated from bottom-up (leaf → root aggregation)
  3. Velocity multiplier adjusts risk: Final Risk = Base Risk * (1 + Velocity)
*/

-- Enable ltree extension for hierarchical paths
CREATE EXTENSION IF NOT EXISTS ltree;

-- Create entity type enum
DO $$ BEGIN
  CREATE TYPE entity_type AS ENUM ('HOLDING', 'BANK', 'GROUP', 'UNIT', 'PROCESS');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create audit_entities table
CREATE TABLE IF NOT EXISTS audit_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  path ltree NOT NULL,
  name text NOT NULL,
  type entity_type NOT NULL,
  risk_score float DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
  velocity_multiplier float DEFAULT 1.0 CHECK (velocity_multiplier >= 0),
  owner_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_entities_path_gist ON audit_entities USING gist(path);
CREATE INDEX IF NOT EXISTS idx_audit_entities_tenant ON audit_entities(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_entities_type ON audit_entities(type);
CREATE INDEX IF NOT EXISTS idx_audit_entities_parent ON audit_entities(subpath(path, 0, -1));

-- Enable Row Level Security
ALTER TABLE audit_entities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view entities in their tenant
CREATE POLICY "Users can view entities in their tenant"
  ON audit_entities
  FOR SELECT
  TO authenticated
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

-- RLS Policy: Users can insert entities in their tenant
CREATE POLICY "Users can insert entities in their tenant"
  ON audit_entities
  FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

-- RLS Policy: Users can update entities in their tenant
CREATE POLICY "Users can update entities in their tenant"
  ON audit_entities
  FOR UPDATE
  TO authenticated
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid)
  WITH CHECK (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

-- RLS Policy: Users can delete entities in their tenant
CREATE POLICY "Users can delete entities in their tenant"
  ON audit_entities
  FOR DELETE
  TO authenticated
  USING (tenant_id = (auth.jwt()->>'tenant_id')::uuid);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_audit_entities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_audit_entities_timestamp ON audit_entities;
CREATE TRIGGER update_audit_entities_timestamp
  BEFORE UPDATE ON audit_entities
  FOR EACH ROW
  EXECUTE FUNCTION update_audit_entities_updated_at();
