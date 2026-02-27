/*
  # GIAS 8.3 Feedback Loop — survey_assignments table

  Creates the assignment tracking table for auto-dispatched satisfaction surveys
  on audit closure. Powers the quality gate feedback loop.
*/

CREATE TABLE IF NOT EXISTS survey_assignments (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id     uuid         NOT NULL,
  engagement_id text,
  auditee_id    text,
  status        text         NOT NULL DEFAULT 'PENDING',
  triggered_by  text         NOT NULL DEFAULT 'AUDIT_CLOSED',
  triggered_at  timestamptz  NOT NULL DEFAULT now(),
  completed_at  timestamptz,
  expires_at    timestamptz  NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  metadata      jsonb        NOT NULL DEFAULT '{}'::jsonb,
  tenant_id     text         NOT NULL DEFAULT 'default',
  created_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at    timestamptz  NOT NULL DEFAULT now(),
  CONSTRAINT survey_assignments_status_check CHECK (
    status IN ('PENDING', 'SENT', 'COMPLETED', 'EXPIRED')
  )
);

ALTER TABLE survey_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon select survey_assignments"
  ON survey_assignments FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert survey_assignments"
  ON survey_assignments FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update survey_assignments"
  ON survey_assignments FOR UPDATE TO anon USING (true) WITH CHECK (true);
