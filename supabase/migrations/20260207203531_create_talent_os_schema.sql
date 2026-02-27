/*
  # Sentinel Talent OS - Resource Management Schema

  1. New Tables
    - `talent_profiles`
      - `id` (uuid, primary key) - Unique talent profile identifier
      - `user_id` (uuid) - Reference to auth.users
      - `full_name` (text) - Auditor display name
      - `avatar_url` (text) - Profile photo URL
      - `title` (text) - Role enum: Junior, Senior, Manager, Expert
      - `department` (text) - Department name
      - `total_xp` (integer) - Accumulated experience points
      - `current_level` (integer 1-5) - Current proficiency level
      - `fatigue_score` (float) - Fatigue index 0-100
      - `burnout_zone` (text) - Zone enum: GREEN, AMBER, RED
      - `last_audit_date` (timestamptz) - Date of last completed audit
      - `consecutive_high_stress_projects` (integer) - Streak of demanding assignments
      - `active_hours_last_3_weeks` (float) - Logged hours in rolling 3-week window
      - `travel_load` (float) - Travel burden score 0-100
      - `is_available` (boolean) - Current availability flag
      - `tenant_id` (uuid) - Multi-tenant isolation key

    - `talent_skills`
      - `id` (uuid, primary key) - Unique skill record
      - `auditor_id` (uuid, FK -> talent_profiles.id) - Owning auditor
      - `skill_name` (text) - Skill domain (e.g. Cyber, Shariah, DataAnalytics)
      - `proficiency_level` (integer 1-5) - 1=Awareness, 5=Master
      - `earned_xp` (integer) - XP earned in this skill
      - `tenant_id` (uuid)

    - `audit_service_templates`
      - `id` (uuid, primary key)
      - `service_name` (text) - Template name (e.g. IT Deep Dive)
      - `description` (text) - Template description
      - `required_skills` (jsonb) - Skill requirements map: {"Cyber": 4, "Data": 2}
      - `standard_duration_sprints` (integer) - Expected duration in sprints
      - `complexity` (text) - LOW, MEDIUM, HIGH, CRITICAL
      - `tenant_id` (uuid)

  2. Security
    - RLS enabled on all three tables
    - Policies for authenticated users to read/write own data
    - Dev-mode permissive read policy for testing

  3. Indexes
    - talent_profiles: user_id, burnout_zone, is_available
    - talent_skills: auditor_id, skill_name
    - audit_service_templates: service_name
*/

-- ============================================================
-- Table 1: talent_profiles (Auditor Talent Profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS talent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  full_name text NOT NULL DEFAULT '',
  avatar_url text,
  title text NOT NULL DEFAULT 'Junior'
    CHECK (title IN ('Junior', 'Senior', 'Manager', 'Expert')),
  department text DEFAULT '',
  total_xp integer NOT NULL DEFAULT 0,
  current_level integer NOT NULL DEFAULT 1
    CHECK (current_level BETWEEN 1 AND 5),
  fatigue_score float NOT NULL DEFAULT 0
    CHECK (fatigue_score BETWEEN 0 AND 100),
  burnout_zone text NOT NULL DEFAULT 'GREEN'
    CHECK (burnout_zone IN ('GREEN', 'AMBER', 'RED')),
  last_audit_date timestamptz,
  consecutive_high_stress_projects integer NOT NULL DEFAULT 0,
  active_hours_last_3_weeks float NOT NULL DEFAULT 0,
  travel_load float NOT NULL DEFAULT 0
    CHECK (travel_load BETWEEN 0 AND 100),
  is_available boolean NOT NULL DEFAULT true,
  tenant_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON talent_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_burnout ON talent_profiles(burnout_zone);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_available ON talent_profiles(is_available);

ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talent_profiles_select_authenticated"
  ON talent_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "talent_profiles_insert_authenticated"
  ON talent_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "talent_profiles_update_authenticated"
  ON talent_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "talent_profiles_delete_authenticated"
  ON talent_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "talent_profiles_dev_read"
  ON talent_profiles FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- Table 2: talent_skills (Auditor Skill Matrix)
-- ============================================================
CREATE TABLE IF NOT EXISTS talent_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auditor_id uuid NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL DEFAULT '',
  proficiency_level integer NOT NULL DEFAULT 1
    CHECK (proficiency_level BETWEEN 1 AND 5),
  earned_xp integer NOT NULL DEFAULT 0,
  tenant_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(auditor_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_talent_skills_auditor ON talent_skills(auditor_id);
CREATE INDEX IF NOT EXISTS idx_talent_skills_name ON talent_skills(skill_name);

ALTER TABLE talent_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "talent_skills_select_authenticated"
  ON talent_skills FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM talent_profiles
      WHERE talent_profiles.id = talent_skills.auditor_id
      AND talent_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "talent_skills_insert_authenticated"
  ON talent_skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM talent_profiles
      WHERE talent_profiles.id = talent_skills.auditor_id
      AND talent_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "talent_skills_update_authenticated"
  ON talent_skills FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM talent_profiles
      WHERE talent_profiles.id = talent_skills.auditor_id
      AND talent_profiles.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM talent_profiles
      WHERE talent_profiles.id = talent_skills.auditor_id
      AND talent_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "talent_skills_delete_authenticated"
  ON talent_skills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM talent_profiles
      WHERE talent_profiles.id = talent_skills.auditor_id
      AND talent_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "talent_skills_dev_read"
  ON talent_skills FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- Table 3: audit_service_templates (Service Catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_service_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  required_skills jsonb NOT NULL DEFAULT '{}'::jsonb,
  standard_duration_sprints integer NOT NULL DEFAULT 1,
  complexity text NOT NULL DEFAULT 'MEDIUM'
    CHECK (complexity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  tenant_id uuid DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_templates_name ON audit_service_templates(service_name);

ALTER TABLE audit_service_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_templates_select_authenticated"
  ON audit_service_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "service_templates_insert_authenticated"
  ON audit_service_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "service_templates_update_authenticated"
  ON audit_service_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "service_templates_delete_authenticated"
  ON audit_service_templates FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "service_templates_dev_read"
  ON audit_service_templates FOR SELECT
  TO anon
  USING (true);
