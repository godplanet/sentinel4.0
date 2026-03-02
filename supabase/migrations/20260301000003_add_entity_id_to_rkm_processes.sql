/*
  # rkm_processes — Denetim Evreni Bağlantısı

  Etki analizi (get_entity_impact_analysis) ve planlama için
  süreçlerin hangi audit_entities düğümüne ait olduğunu tutar.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'rkm_processes' AND column_name = 'entity_id'
  ) THEN
    ALTER TABLE public.rkm_processes
    ADD COLUMN entity_id uuid REFERENCES public.audit_entities(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_rkm_processes_entity ON public.rkm_processes(entity_id);
  END IF;
END $$;
