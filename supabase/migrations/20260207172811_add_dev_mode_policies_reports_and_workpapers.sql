/*
  # Add dev-mode anon policies for reports, report_blocks, report_versions, and workpapers

  1. Security Changes
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `reports`
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `report_blocks`
    - Add anon SELECT/INSERT policies for `report_versions`
    - Add anon SELECT/INSERT/UPDATE/DELETE policies for `workpapers`

  2. Notes
    - These policies enable the application to function in development/demo mode
      without requiring authenticated sessions
    - All policies are scoped to the anon role for dev/test environment access
*/

-- reports: anon SELECT
CREATE POLICY "Anon can view reports (dev)"
  ON reports FOR SELECT TO anon
  USING (true);

-- reports: anon INSERT
CREATE POLICY "Anon can create reports (dev)"
  ON reports FOR INSERT TO anon
  WITH CHECK (true);

-- reports: anon UPDATE
CREATE POLICY "Anon can update reports (dev)"
  ON reports FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- reports: anon DELETE
CREATE POLICY "Anon can delete reports (dev)"
  ON reports FOR DELETE TO anon
  USING (true);

-- report_blocks: anon SELECT
CREATE POLICY "Anon can view report blocks (dev)"
  ON report_blocks FOR SELECT TO anon
  USING (true);

-- report_blocks: anon INSERT
CREATE POLICY "Anon can create report blocks (dev)"
  ON report_blocks FOR INSERT TO anon
  WITH CHECK (true);

-- report_blocks: anon UPDATE
CREATE POLICY "Anon can update report blocks (dev)"
  ON report_blocks FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- report_blocks: anon DELETE
CREATE POLICY "Anon can delete report blocks (dev)"
  ON report_blocks FOR DELETE TO anon
  USING (true);

-- report_versions: anon SELECT
CREATE POLICY "Anon can view report versions (dev)"
  ON report_versions FOR SELECT TO anon
  USING (true);

-- report_versions: anon INSERT
CREATE POLICY "Anon can create report versions (dev)"
  ON report_versions FOR INSERT TO anon
  WITH CHECK (true);

-- workpapers: anon SELECT
CREATE POLICY "Anon can view workpapers (dev)"
  ON workpapers FOR SELECT TO anon
  USING (true);

-- workpapers: anon INSERT
CREATE POLICY "Anon can create workpapers (dev)"
  ON workpapers FOR INSERT TO anon
  WITH CHECK (true);

-- workpapers: anon UPDATE
CREATE POLICY "Anon can update workpapers (dev)"
  ON workpapers FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);

-- workpapers: anon DELETE
CREATE POLICY "Anon can delete workpapers (dev)"
  ON workpapers FOR DELETE TO anon
  USING (true);