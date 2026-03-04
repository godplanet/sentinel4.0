/*
  # executive_summary kolonu — reports tablosu
  Rapor editörü (Executive Summary) tek kaynak: reports tablosu.
  m6_reports kullanımı kaldırıldığında bu kolon kullanılır.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'executive_summary'
  ) THEN
    ALTER TABLE public.reports
      ADD COLUMN executive_summary jsonb DEFAULT '{}'::jsonb;
    COMMENT ON COLUMN public.reports.executive_summary IS 'Yönetici özeti (skor, grade, sections, findingCounts vb.) — Rapor editörü ve 4 Göz onayı payload bu alanı referans alır.';
  END IF;
END $$;
