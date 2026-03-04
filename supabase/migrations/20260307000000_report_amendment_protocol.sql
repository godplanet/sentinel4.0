/*
  # GIAS Sıfır Hata (Errors & Omissions) Protokolü — Zeyilname Motoru

  Uluslararası İç Denetim Standartları (GIAS 2024) gereği, mühürlenmiş raporda
  tespit edilen hataların "Revoke & Amend" ile düzeltme versiyonu oluşturulması.
  Eski rapor silinmez; REVOKED_AMENDED damgası ile arşive alınır.

  ## reports tablosu değişiklikleri
  - version (integer, default 1)
  - parent_report_id (uuid, self-FK, nullable)
  - amendment_note (text, nullable)
  - status: 'REVOKED_AMENDED' değeri eklenir
*/

-- 1. Yeni kolonlar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.reports ADD COLUMN version integer NOT NULL DEFAULT 1;
    COMMENT ON COLUMN public.reports.version IS 'Zeyilname zincirinde sürüm numarası; ilk rapor 1, her düzeltme +1';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'parent_report_id'
  ) THEN
    ALTER TABLE public.reports ADD COLUMN parent_report_id uuid REFERENCES public.reports(id) ON DELETE SET NULL;
    COMMENT ON COLUMN public.reports.parent_report_id IS 'Düzeltme ise, geçersiz kılınan orijinal raporun ID''si';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'reports' AND column_name = 'amendment_note'
  ) THEN
    ALTER TABLE public.reports ADD COLUMN amendment_note text;
    COMMENT ON COLUMN public.reports.amendment_note IS 'Düzeltme gerekçesi (GIAS zeyilname açıklaması)';
  END IF;
END $$;

-- 2. status CHECK kısıtına REVOKED_AMENDED ekle
DO $$
BEGIN
  ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_status_check;
  ALTER TABLE public.reports ADD CONSTRAINT reports_status_check
    CHECK (status IN ('draft', 'review', 'published', 'archived', 'REVOKED_AMENDED'));
END $$;

-- 3. İndeks (zeyilname zinciri sorguları için)
CREATE INDEX IF NOT EXISTS idx_reports_parent_report_id
  ON public.reports(parent_report_id)
  WHERE parent_report_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_reports_version
  ON public.reports(version);

COMMENT ON CONSTRAINT reports_status_check ON public.reports IS 'REVOKED_AMENDED: Mühürlü rapor hata/eksiklik nedeniyle geçersiz kılındı; düzeltme versiyonu yayımlandı.';

-- =============================================================================
-- 4. RPC: Revoke & Amend (tek transaction — adli bütünlük)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.report_amend_revoke_and_clone(
  p_report_id uuid,
  p_amendment_note text,
  p_created_by uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old   RECORD;
  v_new_id uuid;
  v_new_block_id uuid;
  v_block RECORD;
BEGIN
  -- 1. Orijinal raporu kilitle ve oku
  SELECT id, tenant_id, engagement_id, title, description, status, theme_config, layout_type,
         version, parent_report_id, created_by, snapshot_data
    INTO v_old
    FROM reports
   WHERE id = p_report_id
     AND status IN ('published', 'archived')
   FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Rapor bulunamadı veya mühürlenmiş (published/archived) değil. Sadece yayımlanmış raporlar düzeltmeye açılabilir.';
  END IF;

  -- 2. Eski raporu REVOKED_AMENDED yap
  UPDATE reports
     SET status = 'REVOKED_AMENDED',
         updated_at = now()
   WHERE id = p_report_id;

  -- 3. Yeni rapor kaydı (clone metadata)
  v_new_id := gen_random_uuid();
  INSERT INTO reports (
    id, tenant_id, engagement_id, title, description, status,
    theme_config, layout_type, version, parent_report_id, amendment_note,
    created_by, created_at, updated_at,
    published_at, published_by, locked_at, locked_by, snapshot_data
  ) VALUES (
    v_new_id,
    v_old.tenant_id,
    v_old.engagement_id,
    v_old.title,
    v_old.description,
    'draft',
    v_old.theme_config,
    v_old.layout_type,
    v_old.version + 1,
    p_report_id,
    p_amendment_note,
    COALESCE(p_created_by, v_old.created_by),
    now(),
    now(),
    NULL, NULL, NULL, NULL,
    v_old.snapshot_data
  );

  -- 4. Blokları kopyala: önce root (parent_block_id NULL), sonra çocuklar; old_id -> new_id eşlemesi
  CREATE TEMP TABLE IF NOT EXISTS _block_id_map (old_id uuid PRIMARY KEY, new_id uuid NOT NULL);

  FOR v_block IN
    SELECT id, tenant_id, position_index, parent_block_id, depth_level, block_type,
           content, snapshot_data, snapshot_at, created_by
      FROM report_blocks
     WHERE report_id = p_report_id
     ORDER BY depth_level ASC, position_index ASC
  LOOP
    INSERT INTO report_blocks (
      tenant_id, report_id, position_index, parent_block_id, depth_level,
      block_type, content, snapshot_data, snapshot_at, created_by
    ) VALUES (
      v_block.tenant_id,
      v_new_id,
      v_block.position_index,
      (SELECT bm.new_id FROM _block_id_map bm WHERE bm.old_id = v_block.parent_block_id),
      v_block.depth_level,
      v_block.block_type,
      v_block.content,
      v_block.snapshot_data,
      v_block.snapshot_at,
      v_block.created_by
    )
    RETURNING id INTO v_new_block_id;
    INSERT INTO _block_id_map (old_id, new_id) VALUES (v_block.id, v_new_block_id);
  END LOOP;

  DROP TABLE IF EXISTS _block_id_map;

  RETURN v_new_id;
END;
$$;

COMMENT ON FUNCTION public.report_amend_revoke_and_clone IS 'GIAS Revoke & Amend: Eski raporu REVOKED_AMENDED yapar, yeni draft rapor + blokları klonlar. Transaction içinde.';
