/*
  # Add dev mode RLS policies for review_notes and compliance_regulations

  1. Review Notes Table
    - Add dev mode policies for SELECT, INSERT, UPDATE, DELETE
    - Grant access to anon and authenticated roles
  
  2. Compliance Regulations Table
    - Add dev mode policies for SELECT, INSERT, UPDATE, DELETE
    - Grant access to anon and authenticated roles
    - Table already has 10 records but was inaccessible due to missing policies

  3. Security
    - Both tables already have RLS enabled
    - These are permissive dev mode policies for testing
*/

-- Review Notes Policies
CREATE POLICY "Dev mode: Allow anon/authenticated SELECT on review_notes"
  ON review_notes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Dev mode: Allow anon/authenticated INSERT on review_notes"
  ON review_notes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Dev mode: Allow anon/authenticated UPDATE on review_notes"
  ON review_notes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Dev mode: Allow anon/authenticated DELETE on review_notes"
  ON review_notes FOR DELETE
  TO anon, authenticated
  USING (true);

-- Compliance Regulations Policies
CREATE POLICY "Dev mode: Allow anon/authenticated SELECT on compliance_regulations"
  ON compliance_regulations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Dev mode: Allow anon/authenticated INSERT on compliance_regulations"
  ON compliance_regulations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Dev mode: Allow anon/authenticated UPDATE on compliance_regulations"
  ON compliance_regulations FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Dev mode: Allow anon/authenticated DELETE on compliance_regulations"
  ON compliance_regulations FOR DELETE
  TO anon, authenticated
  USING (true);
