/*
  # Rapor Şablon Motoru: m6_report_templates Tablosu

  ## Özet
  Şablonları hard-coded frontend listesinden veritabanına taşır.
  TemplateSelectorModal bu tablodan okuyacak; yeni raporlar oluştururken
  layout_type ve default_sections bilgisi doğrudan şablondan aktarılacaktır.

  ## Yeni Tablolar
  1. `m6_report_templates`
     - `id` (uuid, PK)
     - `name` (text) — Şablonun görünen adı
     - `description` (text) — Açıklama
     - `icon` (text) — Lucide ikon adı
     - `layout_type` (text) — standard_audit | investigation | info_note | blank
     - `default_sections` (jsonb) — [{title, orderIndex}] dizisi
     - `tags` (text[]) — Etiketler
     - `estimated_pages` (text) — Tahmini sayfa sayısı
     - `is_active` (boolean)

  ## Değişiklikler: m6_reports
  - `layout_type` sütunu eklenir (standard_audit | investigation | info_note)
  - `template_id` sütunu eklenir (m6_report_templates.id FK)

  ## Değişiklikler: m6_report_blocks
  - block_type CHECK kısıtı 'financial_grid' değerini kapsayacak şekilde güncellenir

  ## Güvenlik
  - RLS aktif; anon + authenticated tam erişim (dev-mode)
*/

-- ── Şablon tablosu ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS m6_report_templates (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text        NOT NULL,
  description      text        NOT NULL DEFAULT '',
  icon             text        NOT NULL DEFAULT 'FileText',
  layout_type      text        NOT NULL DEFAULT 'standard_audit'
                     CHECK (layout_type IN ('standard_audit', 'investigation', 'info_note', 'blank')),
  default_sections jsonb       NOT NULL DEFAULT '[]',
  tags             text[]      NOT NULL DEFAULT '{}',
  estimated_pages  text        NOT NULL DEFAULT 'Sınırsız',
  is_active        boolean     NOT NULL DEFAULT true,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE m6_report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can read templates"
  ON m6_report_templates FOR SELECT TO anon USING (true);

CREATE POLICY "auth can read templates"
  ON m6_report_templates FOR SELECT TO authenticated USING (true);

CREATE POLICY "anon can insert templates"
  ON m6_report_templates FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "auth can insert templates"
  ON m6_report_templates FOR INSERT TO authenticated WITH CHECK (true);

-- ── m6_reports: layout_type + template_id sütunları ─────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'm6_reports' AND column_name = 'layout_type'
  ) THEN
    ALTER TABLE m6_reports ADD COLUMN layout_type text NOT NULL DEFAULT 'standard_audit';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'm6_reports' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE m6_reports ADD COLUMN template_id uuid REFERENCES m6_report_templates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ── m6_report_blocks: financial_grid CHECK kısıtı güncelle ───────────────────
DO $$
BEGIN
  ALTER TABLE m6_report_blocks DROP CONSTRAINT IF EXISTS m6_report_blocks_block_type_check;
  ALTER TABLE m6_report_blocks
    ADD CONSTRAINT m6_report_blocks_block_type_check
    CHECK (block_type IN (
      'heading', 'paragraph', 'finding_ref', 'live_chart',
      'dynamic_metric', 'ai_summary', 'financial_grid'
    ));
EXCEPTION WHEN others THEN NULL;
END $$;
