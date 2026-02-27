/*
  # Agile Audit Execution Engine - Sprint Architecture

  1. New Tables
    - `audit_engagements_v2`
      - `id` (uuid, primary key)
      - `title` (text) - Engagement name
      - `description` (text) - Engagement description
      - `service_template_id` (uuid, FK -> audit_service_templates) - Source template
      - `status` (text) - PLANNED, ACTIVE, COMPLETED
      - `total_sprints` (integer) - Number of sprints
      - `start_date` / `end_date` (date)
      - `team_members` (jsonb) - Assigned auditor IDs and roles
      - `tenant_id` (uuid)

    - `audit_sprints`
      - `id` (uuid, primary key)
      - `engagement_id` (uuid, FK -> audit_engagements_v2)
      - `sprint_number` (integer) - Sequential sprint number (1, 2, 3...)
      - `title` (text) - Sprint name
      - `goal` (text) - Sprint goal description
      - `start_date` / `end_date` (date)
      - `status` (text) - PLANNED, ACTIVE, COMPLETED
      - `tenant_id` (uuid)

    - `audit_tasks`
      - `id` (uuid, primary key)
      - `sprint_id` (uuid, FK -> audit_sprints)
      - `engagement_id` (uuid, FK -> audit_engagements_v2)
      - `title` (text) - Task / user story title
      - `description` (text) - Task description
      - `assigned_to` (uuid, FK -> talent_profiles) - Assigned auditor
      - `assigned_name` (text) - Auditor display name
      - `status` (text) - TODO, IN_PROGRESS, CLIENT_REVIEW, DONE
      - `priority` (text) - LOW, MEDIUM, HIGH, CRITICAL
      - `validation_status` (text) - OPEN, CLIENT_REVIEW, VALIDATED
      - `evidence_links` (jsonb) - Array of evidence references
      - `story_points` (integer) - Effort estimation
      - `xp_awarded` (boolean) - Whether XP was already given for completion
      - `tenant_id` (uuid)

  2. Security
    - RLS enabled on all tables
    - Authenticated user policies for CRUD
    - Dev-mode read for anon

  3. Indexes
    - audit_sprints: engagement_id, status
    - audit_tasks: sprint_id, engagement_id, assigned_to, status
*/

-- ============================================================
-- Table 1: audit_engagements_v2 (Agile Engagements)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_engagements_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  service_template_id uuid REFERENCES audit_service_templates(id),
  status text NOT NULL DEFAULT 'PLANNED'
    CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED')),
  total_sprints integer NOT NULL DEFAULT 1,
  start_date date,
  end_date date,
  team_members jsonb NOT NULL DEFAULT '[]'::jsonb,
  tenant_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagements_v2_status ON audit_engagements_v2(status);
CREATE INDEX IF NOT EXISTS idx_engagements_v2_template ON audit_engagements_v2(service_template_id);

ALTER TABLE audit_engagements_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "engagements_v2_select_auth"
  ON audit_engagements_v2 FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "engagements_v2_insert_auth"
  ON audit_engagements_v2 FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "engagements_v2_update_auth"
  ON audit_engagements_v2 FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "engagements_v2_delete_auth"
  ON audit_engagements_v2 FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "engagements_v2_dev_read"
  ON audit_engagements_v2 FOR SELECT TO anon
  USING (true);

-- ============================================================
-- Table 2: audit_sprints (Sprint Architecture)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id uuid NOT NULL REFERENCES audit_engagements_v2(id) ON DELETE CASCADE,
  sprint_number integer NOT NULL DEFAULT 1,
  title text NOT NULL DEFAULT '',
  goal text DEFAULT '',
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'PLANNED'
    CHECK (status IN ('PLANNED', 'ACTIVE', 'COMPLETED')),
  tenant_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(engagement_id, sprint_number)
);

CREATE INDEX IF NOT EXISTS idx_sprints_engagement ON audit_sprints(engagement_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON audit_sprints(status);

ALTER TABLE audit_sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sprints_select_auth"
  ON audit_sprints FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "sprints_insert_auth"
  ON audit_sprints FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "sprints_update_auth"
  ON audit_sprints FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "sprints_delete_auth"
  ON audit_sprints FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "sprints_dev_read"
  ON audit_sprints FOR SELECT TO anon
  USING (true);

-- ============================================================
-- Table 3: audit_tasks (User Stories / Living Workpapers)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sprint_id uuid NOT NULL REFERENCES audit_sprints(id) ON DELETE CASCADE,
  engagement_id uuid NOT NULL REFERENCES audit_engagements_v2(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  assigned_to uuid REFERENCES talent_profiles(id),
  assigned_name text DEFAULT '',
  status text NOT NULL DEFAULT 'TODO'
    CHECK (status IN ('TODO', 'IN_PROGRESS', 'CLIENT_REVIEW', 'DONE')),
  priority text NOT NULL DEFAULT 'MEDIUM'
    CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  validation_status text NOT NULL DEFAULT 'OPEN'
    CHECK (validation_status IN ('OPEN', 'CLIENT_REVIEW', 'VALIDATED')),
  evidence_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  story_points integer NOT NULL DEFAULT 1,
  xp_awarded boolean NOT NULL DEFAULT false,
  tenant_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tasks_sprint ON audit_tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_engagement ON audit_tasks(engagement_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON audit_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON audit_tasks(status);

ALTER TABLE audit_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_auth"
  ON audit_tasks FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_insert_auth"
  ON audit_tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_update_auth"
  ON audit_tasks FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_delete_auth"
  ON audit_tasks FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_dev_read"
  ON audit_tasks FOR SELECT TO anon
  USING (true);
