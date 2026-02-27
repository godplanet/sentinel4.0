-- SİSTEM STABİLİZASYONU İÇİN RLS BYPASS (Sadece Dev/Test Ortamı İçin)
-- Bu script, anonim kullanıcının (Seeder) trigger üzerinden tarihçe yazabilmesi için kalkanları indirir.

-- Risk History için Bypass
DROP POLICY IF EXISTS "Dev_Bypass_risk_history" ON public.risk_history;
CREATE POLICY "Dev_Bypass_risk_history" ON public.risk_history FOR ALL TO anon USING (true) WITH CHECK (true);

-- Finding History için Bypass
DROP POLICY IF EXISTS "Dev_Bypass_finding_history" ON public.finding_history;
CREATE POLICY "Dev_Bypass_finding_history" ON public.finding_history FOR ALL TO anon USING (true) WITH CHECK (true);

-- Action Logs için Bypass
DROP POLICY IF EXISTS "Dev_Bypass_action_logs" ON public.action_logs;
CREATE POLICY "Dev_Bypass_action_logs" ON public.action_logs FOR ALL TO anon USING (true) WITH CHECK (true);

-- Workpaper Activity Logs için Bypass
DROP POLICY IF EXISTS "Dev_Bypass_wp_logs" ON public.workpaper_activity_logs;
CREATE POLICY "Dev_Bypass_wp_logs" ON public.workpaper_activity_logs FOR ALL TO anon USING (true) WITH CHECK (true);