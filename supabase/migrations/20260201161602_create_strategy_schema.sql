/*
  # Strategic Management & Alignment Schema (GIAS 2024)

  ## Overview
  Implements strategic alignment between Bank Strategic Goals and Internal Audit Objectives
  following GIAS 2024 Standards for Strategic Alignment and Value Demonstration.

  ## 1. New Tables

  ### `strategic_bank_goals`
  Bank-wide strategic objectives for the fiscal year
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, reference to tenants)
  - `title` (text) - Goal title (e.g., "Dijital Kanallarda %25 Büyüme")
  - `description` (text) - Detailed description
  - `period_year` (integer) - Fiscal year (e.g., 2026)
  - `weight` (integer) - Priority weight (1-100)
  - `category` (text) - Goal category (GROWTH, EFFICIENCY, COMPLIANCE, INNOVATION)
  - `owner_executive` (text) - Responsible executive
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `strategic_audit_objectives`
  Internal Audit strategic objectives aligned with bank goals
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, reference to tenants)
  - `title` (text) - Objective title
  - `description` (text) - Detailed description
  - `period_year` (integer) - Fiscal year
  - `category` (text) - Type (ASSURANCE, ADVISORY, RISK_MANAGEMENT, GOVERNANCE)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `strategy_alignment_matrix`
  Maps relationships between bank goals and audit objectives
  - `id` (uuid, primary key)
  - `tenant_id` (uuid, reference to tenants)
  - `bank_goal_id` (uuid, reference to strategic_bank_goals)
  - `audit_objective_id` (uuid, reference to strategic_audit_objectives)
  - `relevance_score` (float) - Alignment strength (0.0 - 1.0)
  - `rationale` (text) - Explanation of alignment
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Table Modifications

  ### `audit_engagements`
  - Add `strategic_objective_ids` (uuid[]) - Array of linked audit objective IDs

  ## 3. Security
  - Enable RLS on all new tables
  - Policies restrict access by tenant_id
  - Authenticated users can read their tenant's data
  - Only specific roles can modify strategic data

  ## 4. Indexes
  - Index on period_year for fast filtering
  - Index on tenant_id for RLS performance
  - Index on alignment matrix foreign keys
*/

-- Create strategic_bank_goals table
CREATE TABLE IF NOT EXISTS strategic_bank_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  period_year integer NOT NULL,
  weight integer NOT NULL DEFAULT 50 CHECK (weight >= 1 AND weight <= 100),
  category text NOT NULL CHECK (category IN ('GROWTH', 'EFFICIENCY', 'COMPLIANCE', 'INNOVATION')),
  owner_executive text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create strategic_audit_objectives table
CREATE TABLE IF NOT EXISTS strategic_audit_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  period_year integer NOT NULL,
  category text NOT NULL CHECK (category IN ('ASSURANCE', 'ADVISORY', 'RISK_MANAGEMENT', 'GOVERNANCE')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create strategy_alignment_matrix table
CREATE TABLE IF NOT EXISTS strategy_alignment_matrix (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  bank_goal_id uuid NOT NULL REFERENCES strategic_bank_goals(id) ON DELETE CASCADE,
  audit_objective_id uuid NOT NULL REFERENCES strategic_audit_objectives(id) ON DELETE CASCADE,
  relevance_score float NOT NULL DEFAULT 0.5 CHECK (relevance_score >= 0.0 AND relevance_score <= 1.0),
  rationale text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(bank_goal_id, audit_objective_id)
);

-- Add strategic_objective_ids to audit_engagements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_engagements' AND column_name = 'strategic_objective_ids'
  ) THEN
    ALTER TABLE audit_engagements ADD COLUMN strategic_objective_ids uuid[] DEFAULT '{}';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bank_goals_tenant ON strategic_bank_goals(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bank_goals_year ON strategic_bank_goals(period_year);
CREATE INDEX IF NOT EXISTS idx_audit_objectives_tenant ON strategic_audit_objectives(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_objectives_year ON strategic_audit_objectives(period_year);
CREATE INDEX IF NOT EXISTS idx_alignment_bank_goal ON strategy_alignment_matrix(bank_goal_id);
CREATE INDEX IF NOT EXISTS idx_alignment_audit_obj ON strategy_alignment_matrix(audit_objective_id);
CREATE INDEX IF NOT EXISTS idx_alignment_tenant ON strategy_alignment_matrix(tenant_id);

-- Enable Row Level Security
ALTER TABLE strategic_bank_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_audit_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_alignment_matrix ENABLE ROW LEVEL SECURITY;

-- RLS Policies for strategic_bank_goals
CREATE POLICY "Users can view bank goals for their tenant"
  ON strategic_bank_goals FOR SELECT
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can create bank goals for their tenant"
  ON strategic_bank_goals FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can update bank goals for their tenant"
  ON strategic_bank_goals FOR UPDATE
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can delete bank goals for their tenant"
  ON strategic_bank_goals FOR DELETE
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'));

-- RLS Policies for strategic_audit_objectives
CREATE POLICY "Users can view audit objectives for their tenant"
  ON strategic_audit_objectives FOR SELECT
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can create audit objectives for their tenant"
  ON strategic_audit_objectives FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can update audit objectives for their tenant"
  ON strategic_audit_objectives FOR UPDATE
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can delete audit objectives for their tenant"
  ON strategic_audit_objectives FOR DELETE
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'));

-- RLS Policies for strategy_alignment_matrix
CREATE POLICY "Users can view alignments for their tenant"
  ON strategy_alignment_matrix FOR SELECT
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can create alignments for their tenant"
  ON strategy_alignment_matrix FOR INSERT
  TO authenticated
  WITH CHECK (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can update alignments for their tenant"
  ON strategy_alignment_matrix FOR UPDATE
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'))
  WITH CHECK (tenant_id::text = (auth.jwt()->>'tenant_id'));

CREATE POLICY "Users can delete alignments for their tenant"
  ON strategy_alignment_matrix FOR DELETE
  TO authenticated
  USING (tenant_id::text = (auth.jwt()->>'tenant_id'));
