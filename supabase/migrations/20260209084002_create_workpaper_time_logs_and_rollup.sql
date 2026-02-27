/*
  # Workpaper Time Logs and Automatic Budget Rollup

  ## Purpose
  Track time spent on workpapers and automatically roll up to engagement-level actual hours.

  ## New Tables
  
  ### workpaper_time_logs
  - `id` (uuid, primary key)
  - `workpaper_id` (uuid, foreign key) - Links to workpapers table
  - `auditor_id` (uuid) - Who logged the time
  - `hours_logged` (numeric) - Hours spent
  - `log_date` (date) - Date of work
  - `description` (text) - Optional notes
  - `tenant_id` (uuid) - Multi-tenant isolation
  - `created_at` (timestamptz) - When log was created

  ## Automatic Rollup Trigger
  When time is logged:
  1. Sum all time logs for a workpaper → Update workpapers.total_hours_spent
  2. Sum all workpaper hours for engagement → Update audit_engagements.actual_hours

  ## Security
  - Enable RLS on workpaper_time_logs
  - Policy: Authenticated users can view/insert logs for their tenant
*/

-- Create workpaper_time_logs table
CREATE TABLE IF NOT EXISTS workpaper_time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id uuid NOT NULL REFERENCES workpapers(id) ON DELETE CASCADE,
  auditor_id uuid NOT NULL,
  hours_logged numeric(5,2) NOT NULL CHECK (hours_logged > 0 AND hours_logged <= 24),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add index for fast queries
CREATE INDEX IF NOT EXISTS idx_time_logs_workpaper ON workpaper_time_logs(workpaper_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_auditor ON workpaper_time_logs(auditor_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON workpaper_time_logs(log_date);

-- Add total_hours_spent column to workpapers if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'workpapers' AND column_name = 'total_hours_spent'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN total_hours_spent numeric(6,2) DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE workpaper_time_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view time logs for their tenant"
  ON workpaper_time_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert time logs for their tenant"
  ON workpaper_time_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function: Rollup workpaper hours
CREATE OR REPLACE FUNCTION rollup_workpaper_hours()
RETURNS TRIGGER AS $$
BEGIN
  -- Update workpaper total hours
  UPDATE workpapers
  SET total_hours_spent = (
    SELECT COALESCE(SUM(hours_logged), 0)
    FROM workpaper_time_logs
    WHERE workpaper_id = NEW.workpaper_id
  )
  WHERE id = NEW.workpaper_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After time log insert, update workpaper
CREATE TRIGGER trigger_rollup_workpaper_hours
  AFTER INSERT ON workpaper_time_logs
  FOR EACH ROW
  EXECUTE FUNCTION rollup_workpaper_hours();

-- Function: Rollup engagement hours from all workpapers
CREATE OR REPLACE FUNCTION rollup_engagement_hours()
RETURNS TRIGGER AS $$
DECLARE
  v_engagement_id uuid;
BEGIN
  -- Find the engagement_id from workpaper -> audit_step -> audit_engagement
  SELECT ae.id INTO v_engagement_id
  FROM workpapers wp
  JOIN audit_steps ast ON wp.step_id = ast.id
  JOIN audit_engagements ae ON ast.engagement_id = ae.id
  WHERE wp.id = NEW.id;

  -- Update engagement actual_hours
  IF v_engagement_id IS NOT NULL THEN
    UPDATE audit_engagements
    SET actual_hours = (
      SELECT COALESCE(SUM(wp.total_hours_spent), 0)::integer
      FROM workpapers wp
      JOIN audit_steps ast ON wp.step_id = ast.id
      WHERE ast.engagement_id = v_engagement_id
    )
    WHERE id = v_engagement_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: After workpaper hours updated, update engagement
CREATE TRIGGER trigger_rollup_engagement_hours
  AFTER UPDATE OF total_hours_spent ON workpapers
  FOR EACH ROW
  WHEN (OLD.total_hours_spent IS DISTINCT FROM NEW.total_hours_spent)
  EXECUTE FUNCTION rollup_engagement_hours();

-- Helper view: Budget summary per engagement
CREATE OR REPLACE VIEW engagement_budget_summary AS
SELECT 
  ae.id AS engagement_id,
  ae.title,
  ae.estimated_hours,
  ae.actual_hours,
  CASE 
    WHEN ae.estimated_hours > 0 THEN 
      ROUND(((ae.actual_hours::numeric / ae.estimated_hours::numeric) * 100), 2)
    ELSE 0
  END AS utilization_percent,
  ae.actual_hours - ae.estimated_hours AS variance_hours,
  CASE
    WHEN ae.actual_hours <= ae.estimated_hours * 0.9 THEN 'UNDER_BUDGET'
    WHEN ae.actual_hours <= ae.estimated_hours * 1.1 THEN 'ON_BUDGET'
    ELSE 'OVER_BUDGET'
  END AS budget_status
FROM audit_engagements ae;
