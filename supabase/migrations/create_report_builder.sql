-- Report Builder Tables
-- Run this in Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS report_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_name TEXT,
  file_content TEXT, -- base64 encoded .docx
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS template_placeholders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT,
  data_type TEXT DEFAULT 'text' CHECK (data_type IN ('text','number','date')),
  source_type TEXT DEFAULT 'manual' CHECK (source_type IN ('manual','sql','formula')),
  default_value TEXT,
  sql_query TEXT,
  formula_expression TEXT,
  sort_order INTEGER DEFAULT 0,
  required BOOLEAN DEFAULT FALSE,
  UNIQUE(template_id, key)
);

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES report_templates(id),
  output_file_name TEXT,
  input_payload JSONB DEFAULT '{}',
  resolved_payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE report_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_placeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated/anon access (adjust as needed)
CREATE POLICY "allow_all_report_templates" ON report_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_template_placeholders" ON template_placeholders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_generated_documents" ON generated_documents FOR ALL USING (true) WITH CHECK (true);
