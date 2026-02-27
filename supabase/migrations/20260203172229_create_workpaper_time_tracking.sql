CREATE TABLE IF NOT EXISTS time_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workpaper_id uuid REFERENCES workpapers(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  hours_spent numeric(5,2) NOT NULL CHECK (hours_spent > 0 AND hours_spent <= 24),
  activity_date date NOT NULL DEFAULT CURRENT_DATE,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_hours CHECK (hours_spent > 0)
);

ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all time logs"
  ON time_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own time logs"
  ON time_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time logs"
  ON time_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own time logs"
  ON time_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_time_logs_workpaper ON time_logs(workpaper_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_user ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_date ON time_logs(activity_date DESC);

-- =====================================================
-- ALTER: Add total_hours_spent to workpapers
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workpapers' AND column_name = 'total_hours_spent'
  ) THEN
    ALTER TABLE workpapers ADD COLUMN total_hours_spent numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- =====================================================
-- FUNCTION: Update workpaper total hours on time log changes
-- =====================================================

CREATE OR REPLACE FUNCTION update_workpaper_total_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE workpapers
    SET total_hours_spent = COALESCE((
      SELECT SUM(hours_spent)
      FROM time_logs
      WHERE workpaper_id = OLD.workpaper_id
    ), 0)
    WHERE id = OLD.workpaper_id;
    RETURN OLD;
  ELSE
    UPDATE workpapers
    SET total_hours_spent = COALESCE((
      SELECT SUM(hours_spent)
      FROM time_logs
      WHERE workpaper_id = NEW.workpaper_id
    ), 0)
    WHERE id = NEW.workpaper_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_workpaper_hours_on_insert ON time_logs;
DROP TRIGGER IF EXISTS trigger_update_workpaper_hours_on_update ON time_logs;
DROP TRIGGER IF EXISTS trigger_update_workpaper_hours_on_delete ON time_logs;

CREATE TRIGGER trigger_update_workpaper_hours_on_insert
AFTER INSERT ON time_logs
FOR EACH ROW
EXECUTE FUNCTION update_workpaper_total_hours();

CREATE TRIGGER trigger_update_workpaper_hours_on_update
AFTER UPDATE ON time_logs
FOR EACH ROW
EXECUTE FUNCTION update_workpaper_total_hours();

CREATE TRIGGER trigger_update_workpaper_hours_on_delete
AFTER DELETE ON time_logs
FOR EACH ROW
EXECUTE FUNCTION update_workpaper_total_hours();

-- =====================================================
-- FUNCTION: Get time tracking summary by workpaper
-- =====================================================

CREATE OR REPLACE FUNCTION get_workpaper_time_summary(p_workpaper_id uuid)
RETURNS TABLE(
  total_hours numeric,
  total_entries integer,
  contributors integer,
  avg_hours_per_day numeric,
  date_range daterange
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(tl.hours_spent), 0)::numeric as total_hours,
    COUNT(*)::integer as total_entries,
    COUNT(DISTINCT tl.user_id)::integer as contributors,
    COALESCE(AVG(tl.hours_spent), 0)::numeric as avg_hours_per_day,
    CASE
      WHEN COUNT(*) > 0 THEN
        daterange(MIN(tl.activity_date), MAX(tl.activity_date), '[]')
      ELSE NULL
    END as date_range
  FROM time_logs tl
  WHERE tl.workpaper_id = p_workpaper_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- =====================================================
-- VIEW: Time tracking overview
-- =====================================================

CREATE OR REPLACE VIEW workpaper_time_overview AS
SELECT
  w.id as workpaper_id,
  w.title as workpaper_title,
  w.wp_code as workpaper_code,
  w.total_hours_spent,
  COUNT(tl.id) as log_count,
  COUNT(DISTINCT tl.user_id) as contributor_count,
  MIN(tl.activity_date) as first_log_date,
  MAX(tl.activity_date) as last_log_date
FROM workpapers w
LEFT JOIN time_logs tl ON tl.workpaper_id = w.id
GROUP BY w.id, w.title, w.wp_code, w.total_hours_spent;
