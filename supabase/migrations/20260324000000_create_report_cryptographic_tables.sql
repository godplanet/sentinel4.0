-- ============================================================
-- Wave 40: Cryptographic Report Sealer & Snapshot System
-- Migration: 20260324000000
-- ============================================================

-- 1. Rapor Anlık Görüntüsü (Immutable Snapshot)
--    WORM: oluşturulduktan sonra hiçbir alan güncellenmez.
CREATE TABLE IF NOT EXISTS report_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL,             -- Kaynak rapor ID (reports tablosuna FK)
  snapshot_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  snapshot_by     TEXT,                      -- Mühürleyen kullanıcı adı/email
  content_json    JSONB NOT NULL DEFAULT '{}', -- Mühürleme anındaki tiptap/JSON içerik
  title           TEXT NOT NULL DEFAULT '',
  status_at_seal  TEXT NOT NULL DEFAULT 'published',  -- Mühürlendiğindeki durum
  hash_sha256     TEXT,                      -- SHA-256 içerik parmak izi
  metadata        JSONB NOT NULL DEFAULT '{}', -- Ek adli meta veri
  is_verified     BOOLEAN GENERATED ALWAYS AS (hash_sha256 IS NOT NULL) STORED
);

-- 2. Kriptografik İmza Kayıtları
CREATE TABLE IF NOT EXISTS cryptographic_signatures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id       UUID NOT NULL,
  snapshot_id     UUID REFERENCES report_snapshots(id) ON DELETE SET NULL,
  signer_name     TEXT NOT NULL,
  signer_role     TEXT NOT NULL,
  signer_email    TEXT,
  signature_type  TEXT NOT NULL DEFAULT 'APPROVAL'
                    CHECK (signature_type IN ('APPROVAL','DISSENT','REJECTION','SEAL')),
  signed_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Dijital mühür: imzacı adı + timestamp + rapor ID + tür → SHA-256 hash
  signature_hash  TEXT,
  ip_address      TEXT,
  user_agent      TEXT,
  dissent_comment TEXT,        -- Şerh veya red gerekçesi
  order_index     INTEGER NOT NULL DEFAULT 0
);

-- 3. İndeksler
CREATE INDEX IF NOT EXISTS idx_report_snapshots_report_id    ON report_snapshots(report_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_sigs_report_id         ON cryptographic_signatures(report_id, signed_at DESC);
CREATE INDEX IF NOT EXISTS idx_crypto_sigs_snapshot_id       ON cryptographic_signatures(snapshot_id);

-- 4. Snapshot'lar ve imzalar güncellenmez — trigger ile koruma
CREATE OR REPLACE FUNCTION prevent_snapshot_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'WORM: report_snapshots are immutable. Snapshot ID: %', OLD.id;
END;
$$;

DROP TRIGGER IF EXISTS immutable_snapshot ON report_snapshots;
CREATE TRIGGER immutable_snapshot
  BEFORE UPDATE ON report_snapshots
  FOR EACH ROW EXECUTE FUNCTION prevent_snapshot_update();

-- 5. RLS Kapalı
ALTER TABLE report_snapshots          DISABLE ROW LEVEL SECURITY;
ALTER TABLE cryptographic_signatures  DISABLE ROW LEVEL SECURITY;
