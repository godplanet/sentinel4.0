/*
  # Create Sentinel Office Document Vault (Cryo-Chamber)

  Blueprint: Sentinel v3.0 - Sentinel Office with immutable version control

  1. New Tables
    - `office_documents` - Document metadata registry
      - `id` (uuid, PK)
      - `tenant_id` (uuid)
      - `workpaper_id` (uuid, nullable) - Links to audit workpaper
      - `title` (text) - Document title
      - `doc_type` (text) - SPREADSHEET or DOCUMENT
      - `current_version_id` (uuid, nullable)
      - `created_by_name` (text) - Author
      - `is_archived` (boolean) - Soft archive
      - `created_at` / `updated_at` (timestamptz)

    - `office_versions` - Immutable Cryo-Chamber snapshots
      - `id` (uuid, PK)
      - `tenant_id` (uuid)
      - `document_id` (uuid, FK office_documents)
      - `version_number` (integer) - Sequential
      - `content_data` (jsonb) - Full serialized content
      - `content_hash` (text) - SHA-256
      - `change_summary` (text) - Description of change
      - `is_frozen` (boolean)
      - `created_by_name` (text)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on both tables
    - Dev-mode anon policies + authenticated tenant-scoped

  3. Seed Data
    - Credit Sampling spreadsheet with 6 customer rows
    - Draft Finding Report with TipTap JSON
*/

CREATE TABLE IF NOT EXISTS office_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  workpaper_id uuid,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'SPREADSHEET',
  current_version_id uuid,
  created_by_name text NOT NULL DEFAULT '',
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT office_doc_type_chk CHECK (doc_type IN ('SPREADSHEET', 'DOCUMENT'))
);
CREATE INDEX IF NOT EXISTS idx_office_docs_tenant ON office_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_office_docs_workpaper ON office_documents(workpaper_id);
ALTER TABLE office_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read office_documents" ON office_documents FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert office_documents" ON office_documents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update office_documents" ON office_documents FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete office_documents" ON office_documents FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read office_documents" ON office_documents FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

CREATE TABLE IF NOT EXISTS office_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL DEFAULT '11111111-1111-1111-1111-111111111111',
  document_id uuid NOT NULL REFERENCES office_documents(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  content_data jsonb NOT NULL DEFAULT '{}',
  content_hash text NOT NULL DEFAULT '',
  change_summary text,
  is_frozen boolean NOT NULL DEFAULT false,
  created_by_name text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_office_ver_doc ON office_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_office_ver_num ON office_versions(document_id, version_number);
ALTER TABLE office_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anon read office_versions" ON office_versions FOR SELECT TO anon USING (true);
CREATE POLICY "Anon insert office_versions" ON office_versions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon update office_versions" ON office_versions FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Anon delete office_versions" ON office_versions FOR DELETE TO anon USING (true);
CREATE POLICY "Auth read office_versions" ON office_versions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_tenants WHERE user_id = auth.uid()));

-- Sentinel Office belge seed verileri seed.sql dosyasina tasindi.
