/*
  # Create Activity Logs & Enhance Review Notes

  1. Modified Tables
    - `review_notes` - Add author_name column for display purposes

  2. New Tables
    - `workpaper_activity_logs` - Immutable audit trail (Black Box)
      - `id` (uuid, primary key)
      - `workpaper_id` (uuid, not null)
      - `user_id` (uuid, nullable)
      - `user_name` (text, display name)
      - `action_type` (varchar, e.g. STATUS_CHANGE, SIGN_OFF, NOTE_ADDED)
      - `details` (text, human-readable description)
      - `created_at` (timestamptz)

  3. Security
    - Enable RLS on workpaper_activity_logs
    - Activity logs are append-only (insert + select only)
*/

-- 1. Add author_name to existing review_notes if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'review_notes' AND column_name = 'author_name'
    ) THEN
        ALTER TABLE review_notes ADD COLUMN author_name TEXT NOT NULL DEFAULT 'Denetci';
    END IF;
END $$;

-- 2. Create Activity Logs table
CREATE TABLE IF NOT EXISTS workpaper_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workpaper_id UUID NOT NULL,
    user_id UUID,
    user_name TEXT NOT NULL DEFAULT 'System',
    action_type VARCHAR(50) NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workpaper_activity_logs_workpaper
    ON workpaper_activity_logs(workpaper_id);

ALTER TABLE workpaper_activity_logs ENABLE ROW LEVEL SECURITY;

-- 3. RLS for activity logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'workpaper_activity_logs' AND policyname = 'Anyone can read activity logs'
    ) THEN
        CREATE POLICY "Anyone can read activity logs"
            ON workpaper_activity_logs FOR SELECT TO anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'workpaper_activity_logs' AND policyname = 'Anyone can insert activity logs'
    ) THEN
        CREATE POLICY "Anyone can insert activity logs"
            ON workpaper_activity_logs FOR INSERT TO anon WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'workpaper_activity_logs' AND policyname = 'Auth users can read activity logs'
    ) THEN
        CREATE POLICY "Auth users can read activity logs"
            ON workpaper_activity_logs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'workpaper_activity_logs' AND policyname = 'Auth users can insert activity logs'
    ) THEN
        CREATE POLICY "Auth users can insert activity logs"
            ON workpaper_activity_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- 4. Ensure review_notes dev-mode policies exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'review_notes' AND policyname = 'Dev anon read review_notes'
    ) THEN
        BEGIN
            CREATE POLICY "Dev anon read review_notes"
                ON review_notes FOR SELECT TO anon USING (true);
        EXCEPTION WHEN duplicate_object THEN
            -- Policy already exists, safe to ignore
            NULL;
        END;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'review_notes' AND policyname = 'Dev anon insert review_notes'
    ) THEN
        BEGIN
            CREATE POLICY "Dev anon insert review_notes"
                ON review_notes FOR INSERT TO anon WITH CHECK (true);
        EXCEPTION WHEN duplicate_object THEN
            -- Policy already exists, safe to ignore
            NULL;
        END;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'review_notes' AND policyname = 'Dev anon update review_notes'
    ) THEN
        BEGIN
            CREATE POLICY "Dev anon update review_notes"
                ON review_notes FOR UPDATE TO anon USING (true) WITH CHECK (true);
        EXCEPTION WHEN duplicate_object THEN
            -- Policy already exists, safe to ignore
            NULL;
        END;
    END IF;
END $$;
