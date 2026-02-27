/*
  # Module F: Advisory Services (Rehberlik Hizmetleri) - GIAS 2024

  1. New Tables
    - `advisory_requests`
      - `id` (uuid, primary key) - Unique request identifier
      - `requester_id` (uuid, FK auth.users) - Manager who submitted the request
      - `department_id` (uuid, FK audit_entities) - Target department/entity
      - `title` (varchar 200) - Short request title
      - `problem_statement` (text) - Description of the problem
      - `desired_outcome` (text) - What the requester hopes to achieve
      - `status` (varchar 50) - PENDING / APPROVED / REJECTED
      - `created_at` (timestamptz) - Submission timestamp

    - `advisory_engagements`
      - `id` (uuid, primary key) - Unique engagement identifier
      - `request_id` (uuid, FK advisory_requests) - Linked intake request
      - `title` (varchar 200) - Engagement title
      - `scope_limitations` (text) - GIAS 2024 mandatory scope limitations
      - `management_responsibility_confirmed` (boolean) - Must be TRUE to proceed
      - `start_date` (date) - Engagement start
      - `target_date` (date) - Target completion date
      - `status` (varchar 50) - PLANNING / FIELDWORK / DRAFTING / COMPLETED
      - `methodology` (varchar 50) - PROCESS_DESIGN / WORKSHOP / INVESTIGATION
      - `created_at` (timestamptz) - Creation timestamp

    - `advisory_insights`
      - `id` (uuid, primary key) - Unique insight identifier
      - `engagement_id` (uuid, FK advisory_engagements) - Parent engagement
      - `title` (varchar 200) - Insight title
      - `observation` (text) - What was observed
      - `recommendation` (text) - Suggested improvement
      - `impact_level` (varchar 20) - STRATEGIC / OPERATIONAL / FINANCIAL
      - `management_response` (text) - Management's response to the advice
      - `status` (varchar 30) - DRAFT / SHARED / ACCEPTED / NOTED
      - `created_at` (timestamptz) - Creation timestamp

    - `independence_conflict_log`
      - `id` (uuid, primary key) - Unique conflict record
      - `auditor_id` (uuid, FK auth.users) - The auditor with the conflict
      - `entity_id` (uuid, FK audit_entities) - The entity involved
      - `engagement_id` (uuid, FK advisory_engagements) - The advisory engagement
      - `engagement_end_date` (date) - When the engagement ended
      - `cooling_off_expires_at` (date, generated) - Auto-calculated: end_date + 1 year

  2. Security
    - RLS enabled on all 4 tables
    - Authenticated users get SELECT, INSERT, UPDATE, DELETE policies
    - No public/anon access to advisory data

  3. Important Notes
    - The `cooling_off_expires_at` column is a GENERATED STORED column for automatic 1-year calculation
    - `management_responsibility_confirmed` defaults to FALSE and must be explicitly set TRUE (GIAS 2024 requirement)
    - This module is physically separated from Assurance tables to enforce the "Digital Chinese Wall"
*/

-- 1. Advisory Requests (Intake from Management)
CREATE TABLE IF NOT EXISTS advisory_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES auth.users(id),
  department_id UUID REFERENCES audit_entities(id),
  title VARCHAR(200) NOT NULL,
  problem_statement TEXT NOT NULL DEFAULT '',
  desired_outcome TEXT NOT NULL DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE advisory_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select advisory_requests"
  ON advisory_requests FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert advisory_requests"
  ON advisory_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update advisory_requests"
  ON advisory_requests FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete advisory_requests"
  ON advisory_requests FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);


-- 2. Advisory Engagements (The Project)
CREATE TABLE IF NOT EXISTS advisory_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES advisory_requests(id),
  title VARCHAR(200) NOT NULL,
  scope_limitations TEXT NOT NULL DEFAULT '',
  management_responsibility_confirmed BOOLEAN NOT NULL DEFAULT false,
  start_date DATE,
  target_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'PLANNING',
  methodology VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE advisory_engagements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select advisory_engagements"
  ON advisory_engagements FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert advisory_engagements"
  ON advisory_engagements FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update advisory_engagements"
  ON advisory_engagements FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete advisory_engagements"
  ON advisory_engagements FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);


-- 3. Advisory Insights (Not Findings - distinct language)
CREATE TABLE IF NOT EXISTS advisory_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id UUID REFERENCES advisory_engagements(id),
  title VARCHAR(200) NOT NULL,
  observation TEXT NOT NULL DEFAULT '',
  recommendation TEXT NOT NULL DEFAULT '',
  impact_level VARCHAR(20) NOT NULL DEFAULT 'OPERATIONAL',
  management_response TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE advisory_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select advisory_insights"
  ON advisory_insights FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert advisory_insights"
  ON advisory_insights FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update advisory_insights"
  ON advisory_insights FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete advisory_insights"
  ON advisory_insights FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);


-- 4. Independence Conflict Log (The Digital Chinese Wall)
CREATE TABLE IF NOT EXISTS independence_conflict_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auditor_id UUID REFERENCES auth.users(id),
  entity_id UUID REFERENCES audit_entities(id),
  engagement_id UUID REFERENCES advisory_engagements(id),
  engagement_end_date DATE NOT NULL,
  cooling_off_expires_at DATE GENERATED ALWAYS AS (engagement_end_date + INTERVAL '1 year') STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE independence_conflict_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can select independence_conflict_log"
  ON independence_conflict_log FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert independence_conflict_log"
  ON independence_conflict_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update independence_conflict_log"
  ON independence_conflict_log FOR UPDATE TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete independence_conflict_log"
  ON independence_conflict_log FOR DELETE TO authenticated
  USING (auth.uid() IS NOT NULL);
