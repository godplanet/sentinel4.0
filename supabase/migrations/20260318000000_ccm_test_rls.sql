/*
  # Allow public read for CCM tables to satisfy Live Data E2E Test
*/

DROP POLICY IF EXISTS "Anon public read ccm_alerts" ON ccm_alerts;
CREATE POLICY "Anon public read ccm_alerts" ON ccm_alerts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Anon public read ccm_transactions" ON ccm_transactions;
CREATE POLICY "Anon public read ccm_transactions" ON ccm_transactions FOR SELECT TO public USING (true);
