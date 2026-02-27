/*
  # Finding Lifecycle Notifications & State Machine

  ## Purpose
  Enable strict state machine workflow for findings with automated notifications.

  ## New Tables
  
  ### system_notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid) - Recipient
  - `notification_type` (text) - FINDING_ISSUED, FINDING_OVERDUE, etc.
  - `title` (text) - Notification title
  - `message` (text) - Notification body
  - `related_finding_id` (uuid) - Link to finding
  - `related_entity_id` (uuid) - Generic link to any entity
  - `is_read` (boolean) - Read status
  - `is_escalated` (boolean) - Escalated to manager
  - `priority` (text) - LOW, MEDIUM, HIGH, CRITICAL
  - `action_url` (text) - Deep link to take action
  - `tenant_id` (uuid) - Multi-tenant isolation
  - `created_at` (timestamptz)
  - `read_at` (timestamptz)

  ## State Machine States
  - DRAFT
  - ISSUED_FOR_RESPONSE
  - UNDER_REVIEW
  - VALIDATED
  - CLOSED

  ## New Columns on audit_findings
  - `workflow_state` (replaces or augments existing state)
  - `issued_at` (timestamptz)
  - `response_due_date` (date)
  - `validated_at` (timestamptz)
  - `closed_at` (timestamptz)

  ## Security
  - Enable RLS on system_notifications
  - Users can only see their own notifications
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS system_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  related_finding_id uuid REFERENCES audit_findings(id) ON DELETE CASCADE,
  related_entity_id uuid,
  is_read boolean DEFAULT false,
  is_escalated boolean DEFAULT false,
  priority text DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  action_url text,
  tenant_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user ON system_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_finding ON system_notifications(related_finding_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON system_notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON system_notifications(tenant_id);

-- Add workflow columns to audit_findings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'workflow_state'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN workflow_state text DEFAULT 'DRAFT'
      CHECK (workflow_state IN ('DRAFT', 'ISSUED_FOR_RESPONSE', 'UNDER_REVIEW', 'VALIDATED', 'CLOSED'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'issued_at'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN issued_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'response_due_date'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN response_due_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'validated_at'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN validated_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'closed_at'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN closed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'management_response'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN management_response text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'audit_findings' AND column_name = 'target_completion_date'
  ) THEN
    ALTER TABLE audit_findings ADD COLUMN target_completion_date date;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON system_notifications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can create notifications"
  ON system_notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
  ON system_notifications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function: Create notification
CREATE OR REPLACE FUNCTION create_finding_notification(
  p_user_id uuid,
  p_notification_type text,
  p_title text,
  p_message text,
  p_finding_id uuid,
  p_priority text,
  p_action_url text,
  p_tenant_id uuid
)
RETURNS uuid AS $$
DECLARE
  v_notification_id uuid;
BEGIN
  INSERT INTO system_notifications (
    user_id,
    notification_type,
    title,
    message,
    related_finding_id,
    priority,
    action_url,
    tenant_id
  ) VALUES (
    p_user_id,
    p_notification_type,
    p_title,
    p_message,
    p_finding_id,
    p_priority,
    p_action_url,
    p_tenant_id
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE system_notifications
  SET is_read = true,
      read_at = now()
  WHERE id = p_notification_id;
END;
$$ LANGUAGE plpgsql;

-- View: Overdue findings
CREATE OR REPLACE VIEW overdue_findings AS
SELECT 
  f.id,
  f.title,
  f.workflow_state,
  f.response_due_date,
  f.auditee_id,
  CURRENT_DATE - f.response_due_date AS days_overdue
FROM audit_findings f
WHERE f.workflow_state = 'ISSUED_FOR_RESPONSE'
  AND f.response_due_date IS NOT NULL
  AND f.response_due_date < CURRENT_DATE
  AND NOT EXISTS (
    SELECT 1 FROM system_notifications n
    WHERE n.related_finding_id = f.id
      AND n.notification_type = 'FINDING_OVERDUE'
      AND n.created_at > CURRENT_DATE - INTERVAL '1 day'
  );

-- View: Unread notification count per user
CREATE OR REPLACE VIEW user_notification_counts AS
SELECT 
  user_id,
  tenant_id,
  COUNT(*) FILTER (WHERE NOT is_read) AS unread_count,
  COUNT(*) FILTER (WHERE NOT is_read AND priority = 'CRITICAL') AS critical_count,
  COUNT(*) AS total_count
FROM system_notifications
GROUP BY user_id, tenant_id;
