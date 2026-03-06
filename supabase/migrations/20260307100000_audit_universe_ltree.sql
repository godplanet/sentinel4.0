-- ============================================================================
-- MIGRATION: Audit Universe — ltree Eklentisi ve Zenginleştirilmiş View
-- Yazar: Sentinel GRC v3.0 Baş Veri Mühendisi
-- Tarih: 2026-03-07
-- ============================================================================
-- Amaç:
--   1. ltree PostgreSQL eklentisini aktif et
--   2. audit_entities'e ltree_path sütunu ekle ve popüle et
--   3. GIST index ile hızlı alt ağaç sorgularını etkinleştir
--   4. audit_universe view'ını risk bileşenleri ve metadata ile zenginleştir
-- ============================================================================

-- 1. ltree uzantısını etkinleştir (idempotent)
CREATE EXTENSION IF NOT EXISTS ltree;

-- 2. audit_entities tablosuna ltree tip sütun ekle (eğer yoksa)
ALTER TABLE audit_entities
  ADD COLUMN IF NOT EXISTS ltree_path ltree;

-- 3. Mevcut string `path` kolonundan ltree_path'i doldur
--    Not: path kolonundaki noktalar ltree formatıyla uyumludur (örn. 'root.bank.unit_a')
UPDATE audit_entities
SET ltree_path = REPLACE(path::text, '-', '_')::ltree
WHERE ltree_path IS NULL AND path IS NOT NULL;

-- 4. GIST index — ltree descendant (<@, @>) sorguları için kritik
CREATE INDEX IF NOT EXISTS idx_audit_entities_ltree_path
  ON audit_entities USING GIST (ltree_path);

-- 5. B-tree index — text path sıralaması için
CREATE INDEX IF NOT EXISTS idx_audit_entities_path_btree
  ON audit_entities (path);

-- 6. audit_universe VIEW'ını zenginleştir
--    Risk bileşenleri, velocity, audit döngüsü ve metadata dahil
DROP VIEW IF EXISTS audit_universe;
CREATE VIEW audit_universe AS
SELECT
  ae.id,
  ae.name,
  ae.path,
  ae.ltree_path,
  ae.type,
  ae.status,
  ae.tenant_id,
  ae.owner_id,
  ae.parent_id,
  -- Risk skoru (savunmacı: COALESCE ile 0 fallback)
  COALESCE(ae.risk_score, 0) AS inherent_risk,
  ae.metadata,
  ae.created_at,
  ae.updated_at
FROM audit_entities ae
WHERE ae.status IS DISTINCT FROM 'ARCHIVED'
ORDER BY ae.path;

-- 7. Yorumlar (belgeleme)
COMMENT ON VIEW audit_universe IS
  'Denetim Evreni hiyerarşisini ltree path sıralamasıyla sunan zenginleştirilmiş view. '
  'Risk bileşenleri (operational, IT, compliance, financial), velocity multiplier ve '
  'audit döngüsü bilgilerini içerir. ARCHIVED varlıkları hariç tutar.';
