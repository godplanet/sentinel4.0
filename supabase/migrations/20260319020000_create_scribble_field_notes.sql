-- =============================================================================
-- Wave 29: Scribble & Field Agent — Saha Notları Tabloları
-- =============================================================================

-- Karalama / serbest not tablosu (SentinelScribble widget zaten bu tabloya yazıyor)
CREATE TABLE IF NOT EXISTS scribbles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  content text NOT NULL,
  linked_context text DEFAULT '',
  is_processed boolean DEFAULT false,
  extracted_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='scribbles' AND column_name='tenant_id') THEN
    CREATE INDEX IF NOT EXISTS idx_scribbles_tenant ON scribbles(tenant_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_scribbles_processed ON scribbles(is_processed);
CREATE INDEX IF NOT EXISTS idx_scribbles_created ON scribbles(created_at DESC);

ALTER TABLE scribbles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon and authenticated can read scribbles"
  ON scribbles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon and authenticated can insert scribbles"
  ON scribbles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update scribbles"
  ON scribbles FOR UPDATE TO authenticated USING (true);

-- Saha ajan ses notları — voice-engine'dan gelen bulgu taslakları
CREATE TABLE IF NOT EXISTS field_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  category text DEFAULT 'Genel',
  location text DEFAULT '',
  audio_source boolean DEFAULT false,
  confidence numeric(4,2) DEFAULT 0.75,
  transcript text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'converted', 'dismissed')),
  converted_finding_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='field_notes' AND column_name='tenant_id') THEN
    CREATE INDEX IF NOT EXISTS idx_field_notes_tenant ON field_notes(tenant_id);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_field_notes_severity ON field_notes(severity);
CREATE INDEX IF NOT EXISTS idx_field_notes_status ON field_notes(status);
CREATE INDEX IF NOT EXISTS idx_field_notes_created ON field_notes(created_at DESC);

ALTER TABLE field_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon and authenticated can read field_notes"
  ON field_notes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anon and authenticated can insert field_notes"
  ON field_notes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update field_notes"
  ON field_notes FOR UPDATE TO authenticated USING (true);
