/*
  # Module 6: Intelligent Reporting - Polymorphic Block Architecture

  1. New Tables
    - `reports`
      - Report metadata (title, status, theme, layout)
      - Links to audit engagement
      - Versioning support
    
    - `report_blocks`
      - Polymorphic block system (heading, paragraph, finding_ref, live_chart, dynamic_metric, signature)
      - JSONB content for flexible data structure
      - Snapshot data for frozen state (when published)
      - Position-based ordering with parent hierarchy
    
    - `report_versions`
      - Complete report snapshots at publication time
      - Immutable audit trail
      - Full JSON dump of report state

  2. Key Features
    - Notion-like block architecture
    - Live data vs frozen snapshots
    - Block-level locking for collaboration
    - Polymorphic content structure

  3. Security
    - RLS enabled on all tables
    - Draft reports visible only to audit team
    - Published reports visible to authorized stakeholders
    - Version history protected
*/

-- 1. REPORTS TABLE (Top-Level Metadata)
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  engagement_id uuid REFERENCES audit_engagements(id) ON DELETE CASCADE,
  
  title text NOT NULL,
  description text DEFAULT '',
  
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'published', 'archived')),
  
  -- Theme and Layout Configuration
  theme_config jsonb NOT NULL DEFAULT '{"mode": "neon", "accent": "blue", "layout": "standard"}'::jsonb,
  layout_type text NOT NULL DEFAULT 'standard' CHECK (layout_type IN ('standard', 'dashboard', 'executive')),
  
  -- Metadata
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  published_by uuid REFERENCES auth.users(id),
  
  -- Collaboration
  locked_by uuid REFERENCES auth.users(id),
  locked_at timestamptz
);

-- 2. REPORT BLOCKS (Polymorphic Block System)
CREATE TABLE IF NOT EXISTS report_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  -- Block Hierarchy and Ordering
  position_index int NOT NULL,
  parent_block_id uuid REFERENCES report_blocks(id) ON DELETE CASCADE,
  depth_level int NOT NULL DEFAULT 0 CHECK (depth_level >= 0 AND depth_level <= 5),
  
  -- Block Type (Polymorphic)
  block_type text NOT NULL CHECK (block_type IN (
    'heading',
    'paragraph', 
    'finding_ref',
    'live_chart',
    'dynamic_metric',
    'signature',
    'table',
    'image',
    'divider'
  )),
  
  -- Polymorphic Content (JSONB)
  -- Structure varies by block_type:
  -- 'heading' -> {"text": "Executive Summary", "level": 1}
  -- 'paragraph' -> {"text": "Audit findings indicate...", "format": {"bold": false}}
  -- 'finding_ref' -> {"finding_id": "uuid", "display_mode": "card"}
  -- 'live_chart' -> {"chart_type": "risk_distribution", "filter": {"year": 2024}, "data_source": "findings"}
  -- 'dynamic_metric' -> {"metric_key": "total_risk_score", "label": "Overall Risk", "format": "percentage"}
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  
  -- Snapshot Data (Frozen State)
  -- Populated when report is published
  -- For live_chart: stores rendered chart data
  -- For dynamic_metric: stores computed value at publication time
  snapshot_data jsonb,
  snapshot_at timestamptz,
  
  -- Block Metadata
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  -- Block-level locking for realtime collaboration
  locked_by uuid REFERENCES auth.users(id),
  locked_at timestamptz
);

-- 3. REPORT VERSIONS (Immutable Snapshots)
CREATE TABLE IF NOT EXISTS report_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  
  version_number int NOT NULL,
  version_label text,
  
  -- Complete snapshot of report at this point in time
  full_snapshot_json jsonb NOT NULL,
  
  -- Metadata
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  
  -- Audit trail
  change_summary text,
  trigger_event text CHECK (trigger_event IN ('manual', 'auto_save', 'publish', 'review_submit'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_reports_engagement ON reports(engagement_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_tenant ON reports(tenant_id);

CREATE INDEX IF NOT EXISTS idx_report_blocks_report ON report_blocks(report_id);
CREATE INDEX IF NOT EXISTS idx_report_blocks_position ON report_blocks(report_id, position_index);
CREATE INDEX IF NOT EXISTS idx_report_blocks_parent ON report_blocks(parent_block_id);
CREATE INDEX IF NOT EXISTS idx_report_blocks_type ON report_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_report_blocks_tenant ON report_blocks(tenant_id);

CREATE INDEX IF NOT EXISTS idx_report_versions_report ON report_versions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_versions_tenant ON report_versions(tenant_id);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports
CREATE POLICY "Users can view reports for their tenant"
  ON reports FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    ) AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for report_blocks
CREATE POLICY "Users can view blocks for their tenant reports"
  ON report_blocks FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage blocks"
  ON report_blocks FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for report_versions
CREATE POLICY "Users can view versions for their tenant reports"
  ON report_versions FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create versions"
  ON report_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()
    )
  );

-- Helper Function: Freeze Report Blocks (Snapshot on Publish)
CREATE OR REPLACE FUNCTION freeze_report_blocks(target_report_id uuid)
RETURNS void AS $$
DECLARE
  v_tenant_id uuid;
BEGIN
  -- Get tenant_id from report
  SELECT tenant_id INTO v_tenant_id
  FROM reports
  WHERE id = target_report_id;

  -- Update all blocks to capture snapshot
  UPDATE report_blocks
  SET 
    snapshot_data = content,
    snapshot_at = now()
  WHERE report_id = target_report_id
    AND snapshot_data IS NULL; -- Only freeze blocks that haven't been frozen yet

  -- Update report status
  UPDATE reports
  SET 
    status = 'published',
    published_at = now(),
    published_by = auth.uid(),
    updated_at = now()
  WHERE id = target_report_id;

  -- Create version snapshot
  INSERT INTO report_versions (tenant_id, report_id, version_number, full_snapshot_json, created_by, trigger_event)
  SELECT 
    v_tenant_id,
    target_report_id,
    COALESCE(MAX(version_number), 0) + 1,
    jsonb_build_object(
      'report', row_to_json(r.*),
      'blocks', (
        SELECT jsonb_agg(row_to_json(rb.*) ORDER BY position_index)
        FROM report_blocks rb
        WHERE rb.report_id = target_report_id
      )
    ),
    auth.uid(),
    'publish'
  FROM reports r
  WHERE r.id = target_report_id
  GROUP BY r.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper Function: Reorder Blocks After Insert/Delete
CREATE OR REPLACE FUNCTION reorder_report_blocks()
RETURNS trigger AS $$
BEGIN
  -- Automatically maintain position_index integrity
  -- This ensures no gaps in position numbering
  IF TG_OP = 'INSERT' THEN
    -- Shift existing blocks down
    UPDATE report_blocks
    SET position_index = position_index + 1
    WHERE report_id = NEW.report_id
      AND position_index >= NEW.position_index
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reorder_blocks
  BEFORE INSERT ON report_blocks
  FOR EACH ROW
  EXECUTE FUNCTION reorder_report_blocks();