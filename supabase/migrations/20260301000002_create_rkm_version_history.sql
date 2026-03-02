/*
  # RKM Zaman Makinesi — Version History Tablosu

  rkm_risks kaydı güncellendiğinde önceki halini rkm_risk_versions'a kopyalar.
  Bu sayede "Time Machine" UI ile her değişiklik görülebilir ve rollback yapılabilir.
*/

CREATE TABLE IF NOT EXISTS rkm_risk_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id        uuid NOT NULL REFERENCES rkm_risks(id) ON DELETE CASCADE,
  tenant_id      uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  version_number int  NOT NULL DEFAULT 1,
  snapshot       jsonb NOT NULL,
  changed_by     text NOT NULL DEFAULT 'Sistem',
  change_summary text NOT NULL DEFAULT '',
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rkm_versions_risk    ON rkm_risk_versions(risk_id);
CREATE INDEX IF NOT EXISTS idx_rkm_versions_created ON rkm_risk_versions(created_at DESC);

ALTER TABLE rkm_risk_versions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rkm_risk_versions' AND policyname='anon_rkm_versions_select') THEN
    CREATE POLICY "anon_rkm_versions_select" ON rkm_risk_versions FOR SELECT TO anon USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rkm_risk_versions' AND policyname='anon_rkm_versions_insert') THEN
    CREATE POLICY "anon_rkm_versions_insert" ON rkm_risk_versions FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='rkm_risk_versions' AND policyname='auth_rkm_versions_all') THEN
    CREATE POLICY "auth_rkm_versions_all" ON rkm_risk_versions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Trigger: her UPDATE öncesi mevcut satırı versions tablosuna kopyala
CREATE OR REPLACE FUNCTION trg_rkm_risk_version_snapshot()
RETURNS TRIGGER AS $$
DECLARE
  v_max_ver int;
BEGIN
  SELECT COALESCE(MAX(version_number), 0) INTO v_max_ver
  FROM rkm_risk_versions WHERE risk_id = OLD.id;

  INSERT INTO rkm_risk_versions (risk_id, tenant_id, version_number, snapshot, changed_by, change_summary)
  VALUES (
    OLD.id,
    OLD.tenant_id,
    v_max_ver + 1,
    to_jsonb(OLD),
    COALESCE(current_setting('app.current_user_name', true), 'Sistem'),
    'Otomatik snapshot — güncelleme öncesi'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_rkm_before_update ON rkm_risks;
CREATE TRIGGER trg_rkm_before_update
BEFORE UPDATE ON rkm_risks
FOR EACH ROW EXECUTE FUNCTION trg_rkm_risk_version_snapshot();
