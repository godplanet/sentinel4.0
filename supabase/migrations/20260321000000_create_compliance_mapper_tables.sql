-- ============================================================
-- Wave 30: Compliance Mapper & Gap Analysis Tables
-- Migration: 20260321000000
-- ============================================================

-- 1. Uyum Çerçeveleri (Frameworks)
CREATE TABLE IF NOT EXISTS compliance_frameworks (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID,
  name           TEXT NOT NULL,
  short_code     TEXT,
  version        TEXT,
  description    TEXT,
  authority      TEXT,
  effective_date DATE,
  status         TEXT NOT NULL DEFAULT 'ACTIVE'
                   CHECK (status IN ('ACTIVE','DEPRECATED','DRAFT')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Çerçeve Gereksinimleri (Requirements / Maddeler)
CREATE TABLE IF NOT EXISTS framework_requirements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID,
  framework_id  UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  category      TEXT,
  priority      TEXT NOT NULL DEFAULT 'MEDIUM'
                  CHECK (priority IN ('CRITICAL','HIGH','MEDIUM','LOW')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Kontrol ↔ Gereksinim Eşleşmeleri
CREATE TABLE IF NOT EXISTS control_requirement_mappings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID,
  control_ref       TEXT NOT NULL,
  control_title     TEXT NOT NULL,
  requirement_id    UUID NOT NULL REFERENCES framework_requirements(id) ON DELETE CASCADE,
  coverage_strength TEXT NOT NULL DEFAULT 'PARTIAL'
                      CHECK (coverage_strength IN ('FULL','PARTIAL','WEAK')),
  match_score       INTEGER NOT NULL DEFAULT 80 CHECK (match_score BETWEEN 0 AND 100),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Özet Görünüm (Gap dashboard metrikleri)
--    compliance_score = covered / total * 100
--    SIFIRA BÖLÜNME: (total_requirements || 1) ile korunmuştur
DROP VIEW IF EXISTS framework_coverage_stats;
CREATE OR REPLACE VIEW framework_coverage_stats AS
SELECT
  f.id                               AS framework_id,
  f.tenant_id,
  f.name,
  COALESCE(f.short_code,'')          AS short_code,
  COALESCE(f.authority,'')           AS authority,
  f.status,
  COUNT(r.id)                        AS total_requirements,
  COUNT(DISTINCT m.requirement_id)   AS covered_requirements,
  COUNT(r.id) - COUNT(DISTINCT m.requirement_id) AS gap_count,
  ROUND(
    COUNT(DISTINCT m.requirement_id)::numeric
    / GREATEST(COUNT(r.id), 1) * 100
  )                                   AS coverage_pct,
  COALESCE(ROUND(AVG(m.match_score)), 0) AS avg_match_score
FROM compliance_frameworks f
LEFT JOIN framework_requirements r   ON r.framework_id = f.id
LEFT JOIN control_requirement_mappings m ON m.requirement_id = r.id
GROUP BY f.id;

-- 5. İndeksler
CREATE INDEX IF NOT EXISTS idx_fw_requirements_framework_id ON framework_requirements(framework_id);
CREATE INDEX IF NOT EXISTS idx_ctrl_mappings_requirement_id ON control_requirement_mappings(requirement_id);
CREATE INDEX IF NOT EXISTS idx_ctrl_mappings_control_ref    ON control_requirement_mappings(control_ref);

-- 6. RLS Kapalı
ALTER TABLE compliance_frameworks         DISABLE ROW LEVEL SECURITY;
ALTER TABLE framework_requirements        DISABLE ROW LEVEL SECURITY;
ALTER TABLE control_requirement_mappings  DISABLE ROW LEVEL SECURITY;
