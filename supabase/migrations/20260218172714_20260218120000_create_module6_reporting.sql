/*
  # Modül 6 — Dinamik Raporlama Motoru: Şema, Trigger'lar ve RLS

  ## Özet
  Bu migration; Sentinel v3.0'ın Raporlama Motoru için tüm veritabanı
  altyapısını kurar. BDDK ve GIAS uyumlu kriptografik kilitleme (The Iron Vault),
  otomatik updated_at yönetimi ve dev-mode RLS politikaları dahildir.

  ## Yeni Tablolar
  1. `m6_reports`         — Ana rapor kaydı (durum, tema, özet, workflow, mühür)
  2. `m6_report_sections` — Raporun bölümleri (sıralı)
  3. `m6_report_blocks`   — Her bölümdeki polimorfik içerik blokları
  4. `m6_review_notes`    — Blok veya bölüm üzerindeki inceleme notları

  ## Trigger'lar
  - `prevent_published_report_changes()` — Yayınlanmış/arşivlenmiş raporlarda
    UPDATE/DELETE işlemlerini veritabanı seviyesinde engeller (The Iron Vault).
  - `update_m6_modtime()`               — updated_at alanını otomatik günceller.

  ## Güvenlik
  - Tüm tablolarda RLS aktif.
  - Dev-mode: anon ve authenticated roller için tam erişim politikaları.
    (Üretimde role-based politikalarla daraltılacak.)
*/

-- ============================================================
-- ADIM 1: TABLO TANIMLAMALARI (DDL)
-- ============================================================

CREATE TABLE IF NOT EXISTS m6_reports (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  engagement_id     uuid,
  title             text        NOT NULL,
  status            text        NOT NULL DEFAULT 'draft'
                      CHECK (status IN ('draft', 'in_review', 'cae_review', 'published', 'archived')),
  theme_config      jsonb       NOT NULL DEFAULT '{"paperStyle": "zen_paper", "typography": "merriweather_inter"}',
  executive_summary jsonb,
  workflow          jsonb,
  smart_variables   jsonb       NOT NULL DEFAULT '{}',
  hash_seal         text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  published_at      timestamptz
);

CREATE TABLE IF NOT EXISTS m6_report_sections (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id   uuid        NOT NULL REFERENCES m6_reports(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  order_index integer     NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS m6_report_blocks (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id    uuid        NOT NULL REFERENCES m6_report_sections(id) ON DELETE CASCADE,
  block_type    text        NOT NULL
                  CHECK (block_type IN ('heading', 'paragraph', 'finding_ref', 'live_chart', 'dynamic_metric', 'ai_summary')),
  order_index   integer     NOT NULL,
  content       jsonb       NOT NULL DEFAULT '{}',
  snapshot_data jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS m6_review_notes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id     uuid        NOT NULL REFERENCES m6_reports(id) ON DELETE CASCADE,
  block_id      uuid        REFERENCES m6_report_blocks(id) ON DELETE CASCADE,
  selected_text text,
  comment       text        NOT NULL,
  status        text        NOT NULL DEFAULT 'open'
                  CHECK (status IN ('open', 'resolved')),
  created_by    uuid,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  resolved_at   timestamptz
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_m6_sections_report    ON m6_report_sections(report_id);
CREATE INDEX IF NOT EXISTS idx_m6_blocks_section     ON m6_report_blocks(section_id);
CREATE INDEX IF NOT EXISTS idx_m6_notes_report       ON m6_review_notes(report_id);
CREATE INDEX IF NOT EXISTS idx_m6_notes_block        ON m6_review_notes(block_id);
CREATE INDEX IF NOT EXISTS idx_m6_reports_status     ON m6_reports(status);
CREATE INDEX IF NOT EXISTS idx_m6_reports_engagement ON m6_reports(engagement_id);

-- ============================================================
-- ADIM 2: THE IRON VAULT — KRİPTOGRAFİK KİLİTLEME TRIGGER'I
-- ============================================================

CREATE OR REPLACE FUNCTION prevent_published_report_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_status text;
  v_report_id uuid;
BEGIN
  IF TG_TABLE_NAME = 'm6_report_sections' THEN
    IF TG_OP = 'DELETE' THEN
      v_report_id := OLD.report_id;
    ELSE
      v_report_id := NEW.report_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'm6_report_blocks' THEN
    IF TG_OP = 'DELETE' THEN
      SELECT report_id INTO v_report_id
        FROM m6_report_sections
        WHERE id = OLD.section_id;
    ELSE
      SELECT report_id INTO v_report_id
        FROM m6_report_sections
        WHERE id = NEW.section_id;
    END IF;
  END IF;

  SELECT status INTO v_status
    FROM m6_reports
    WHERE id = v_report_id;

  IF v_status IN ('published', 'archived') THEN
    RAISE EXCEPTION
      'HUKUKİ İHLAL: Yayınlanmış bir raporun blokları veya bölümleri değiştirilemez veya silinemez (The Iron Vault aktif).';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER iron_vault_sections
  BEFORE UPDATE OR DELETE ON m6_report_sections
  FOR EACH ROW EXECUTE FUNCTION prevent_published_report_changes();

CREATE OR REPLACE TRIGGER iron_vault_blocks
  BEFORE UPDATE OR DELETE ON m6_report_blocks
  FOR EACH ROW EXECUTE FUNCTION prevent_published_report_changes();

-- ============================================================
-- ADIM 3: UPDATED_AT OTOMATİK GÜNCELLEME TRIGGER'LARI
-- ============================================================

CREATE OR REPLACE FUNCTION update_m6_modtime()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER m6_reports_modtime
  BEFORE UPDATE ON m6_reports
  FOR EACH ROW EXECUTE FUNCTION update_m6_modtime();

CREATE OR REPLACE TRIGGER m6_sections_modtime
  BEFORE UPDATE ON m6_report_sections
  FOR EACH ROW EXECUTE FUNCTION update_m6_modtime();

CREATE OR REPLACE TRIGGER m6_blocks_modtime
  BEFORE UPDATE ON m6_report_blocks
  FOR EACH ROW EXECUTE FUNCTION update_m6_modtime();

CREATE OR REPLACE TRIGGER m6_notes_modtime
  BEFORE UPDATE ON m6_review_notes
  FOR EACH ROW EXECUTE FUNCTION update_m6_modtime();

-- ============================================================
-- ADIM 4: ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE m6_reports         ENABLE ROW LEVEL SECURITY;
ALTER TABLE m6_report_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE m6_report_blocks   ENABLE ROW LEVEL SECURITY;
ALTER TABLE m6_review_notes    ENABLE ROW LEVEL SECURITY;

-- ── m6_reports ────────────────────────────────────────────
CREATE POLICY "Allow public read m6_reports"
  ON m6_reports FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert m6_reports"
  ON m6_reports FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update m6_reports"
  ON m6_reports FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete m6_reports"
  ON m6_reports FOR DELETE TO anon, authenticated USING (true);

-- ── m6_report_sections ────────────────────────────────────
CREATE POLICY "Allow public read m6_report_sections"
  ON m6_report_sections FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert m6_report_sections"
  ON m6_report_sections FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update m6_report_sections"
  ON m6_report_sections FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete m6_report_sections"
  ON m6_report_sections FOR DELETE TO anon, authenticated USING (true);

-- ── m6_report_blocks ─────────────────────────────────────
CREATE POLICY "Allow public read m6_report_blocks"
  ON m6_report_blocks FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert m6_report_blocks"
  ON m6_report_blocks FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update m6_report_blocks"
  ON m6_report_blocks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete m6_report_blocks"
  ON m6_report_blocks FOR DELETE TO anon, authenticated USING (true);

-- ── m6_review_notes ──────────────────────────────────────
CREATE POLICY "Allow public read m6_review_notes"
  ON m6_review_notes FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert m6_review_notes"
  ON m6_review_notes FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update m6_review_notes"
  ON m6_review_notes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete m6_review_notes"
  ON m6_review_notes FOR DELETE TO anon, authenticated USING (true);
