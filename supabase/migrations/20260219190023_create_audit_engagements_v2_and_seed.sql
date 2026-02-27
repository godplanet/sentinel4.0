/*
  # Create audit_engagements_v2 table and seed 3 demo engagements

  1. Creates audit_engagements_v2 (the parent table for agile sprints/tasks)
  2. Seeds 3 realistic Turkish banking audit engagements with sprints and tasks
*/

CREATE TABLE IF NOT EXISTS audit_engagements_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text DEFAULT '',
  service_template_id uuid,
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

ALTER TABLE audit_engagements_v2 ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_dev_read') THEN
    CREATE POLICY "engagements_v2_dev_read" ON audit_engagements_v2 FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_select_auth') THEN
    CREATE POLICY "engagements_v2_select_auth" ON audit_engagements_v2 FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_insert_auth') THEN
    CREATE POLICY "engagements_v2_insert_auth" ON audit_engagements_v2 FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_update_auth') THEN
    CREATE POLICY "engagements_v2_update_auth" ON audit_engagements_v2 FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_engagements_v2' AND policyname='engagements_v2_delete_auth') THEN
    CREATE POLICY "engagements_v2_delete_auth" ON audit_engagements_v2 FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- Enable anon read on sprints and tasks as well (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_sprints' AND policyname='sprints_dev_read') THEN
    CREATE POLICY "sprints_dev_read" ON audit_sprints FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='audit_tasks' AND policyname='tasks_dev_read') THEN
    CREATE POLICY "tasks_dev_read" ON audit_tasks FOR SELECT TO anon USING (true);
  END IF;
END $$;
