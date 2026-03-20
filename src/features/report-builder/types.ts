export interface ReportTemplate {
  id: string;
  name: string;
  description: string | null;
  file_name: string | null;
  file_content: string | null; // base64
  version: number;
  created_at: string;
}

export interface TemplatePlaceholder {
  id: string;
  template_id: string;
  key: string;
  label: string;
  data_type: 'text' | 'number' | 'date';
  source_type: 'manual' | 'sql' | 'formula';
  default_value: string | null;
  sql_query: string | null;
  formula_expression: string | null;
  sort_order: number;
  required: boolean;
}

export interface GeneratedDocument {
  id: string;
  template_id: string;
  output_file_name: string;
  input_payload: Record<string, string>;
  resolved_payload: Record<string, string>;
  created_at: string;
}

export type PlaceholderValues = Record<string, string>;
