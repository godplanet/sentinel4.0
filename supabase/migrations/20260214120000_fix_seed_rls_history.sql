-- SİSTEM STABİLİZASYONU İÇİN RLS BYPASS (Sadece Dev/Test Ortamı İçin)
-- Bu script, tohumlama (seeding) işleminin bloklanmasını engeller.
-- Trigger tarafından tetiklenen tarihçe ve log tablolarına izin verir.

DO $$ 
DECLARE 
  t text;
  tables text[] := ARRAY[
    'risk_history', 
    'finding_history'
  ];
BEGIN
  FOREACH t IN ARRAY tables
  LOOP
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      EXECUTE format('DROP POLICY IF EXISTS "Dev_Bypass_%I" ON public.%I', t, t);
      EXECUTE format('CREATE POLICY "Dev_Bypass_%I" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)', t, t);
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    END IF;
  END LOOP;
END $$;