import { supabase } from '@/shared/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { GeneratedDocument, ReportTemplate, TemplatePlaceholder } from './types';

const KEYS = {
  templates: ['report-templates'],
  placeholders: (tid: string) => ['template-placeholders', tid],
  documents: (tid: string) => ['generated-documents', tid],
};

// ── Templates ─────────────────────────────────────────────────────────────────

export function useReportTemplates() {
  return useQuery({
    queryKey: KEYS.templates,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_templates')
        .select('id, name, description, file_name, version, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ReportTemplate[];
    },
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      file_name: string;
      file_content: string;
    }) => {
      const { data, error } = await supabase
        .from('report_templates')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as ReportTemplate;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<ReportTemplate> & { id: string }) => {
      const { error } = await supabase
        .from('report_templates')
        .update(input)
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('report_templates').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.templates }),
  });
}

export async function fetchTemplateWithContent(id: string): Promise<ReportTemplate | null> {
  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .eq('id', id)
    .single();
  if (error) return null;
  return data as ReportTemplate;
}

// ── Placeholders ──────────────────────────────────────────────────────────────

export function usePlaceholders(templateId: string) {
  return useQuery({
    queryKey: KEYS.placeholders(templateId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_placeholders')
        .select('*')
        .eq('template_id', templateId)
        .order('sort_order');
      if (error) throw error;
      return (data ?? []) as TemplatePlaceholder[];
    },
    enabled: !!templateId,
  });
}

export function useUpsertPlaceholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<TemplatePlaceholder> & { template_id: string; key: string }) => {
      if (input.id) {
        const { error } = await supabase
          .from('template_placeholders')
          .update(input)
          .eq('id', input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('template_placeholders').insert(input);
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: KEYS.placeholders(v.template_id) }),
  });
}

export function useDeletePlaceholder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, templateId }: { id: string; templateId: string }) => {
      const { error } = await supabase.from('template_placeholders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: KEYS.placeholders(v.templateId) }),
  });
}

// ── Generated Documents ───────────────────────────────────────────────────────

export function useGeneratedDocuments(templateId: string) {
  return useQuery({
    queryKey: KEYS.documents(templateId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('template_id', templateId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as GeneratedDocument[];
    },
    enabled: !!templateId,
  });
}

export function useSaveGeneratedDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      template_id: string;
      output_file_name: string;
      input_payload: Record<string, string>;
      resolved_payload: Record<string, string>;
    }) => {
      const { error } = await supabase.from('generated_documents').insert(input);
      if (error) throw error;
    },
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: KEYS.documents(v.template_id) }),
  });
}

// ── SQL Test ──────────────────────────────────────────────────────────────────

export async function testSqlQuery(sqlQuery: string): Promise<{ result: string; error?: string }> {
  // Only allow SELECT queries on known safe tables
  const q = sqlQuery.trim().toLowerCase();
  if (!q.startsWith('select')) return { result: '', error: 'Sadece SELECT sorgularına izin verilir.' };

  // Extract table name
  const tableMatch = /from\s+(\w+)/i.exec(sqlQuery);
  if (!tableMatch) return { result: '', error: 'FROM clause bulunamadı.' };
  const tableName = tableMatch[1];

  // Extract column names
  const colSection = sqlQuery.replace(/select\s+/i, '').split(/\s+from\s+/i)[0];
  const cols = colSection === '*' ? undefined : colSection.split(',').map(c => c.trim());

  try {
    let query = supabase.from(tableName).select(cols ? cols.join(',') : '*');

    // Parse simple WHERE clause
    const whereMatch = /where\s+(.+?)(?:limit|order|$)/i.exec(sqlQuery);
    if (whereMatch) {
      const condition = whereMatch[1].trim();
      const eqMatch = /(\w+)\s*=\s*[':"]?(\w+)[':"]?/.exec(condition);
      if (eqMatch) query = query.eq(eqMatch[1], eqMatch[2]);
    }

    const { data, error } = await query.limit(5);
    if (error) return { result: '', error: error.message };
    if (!data || data.length === 0) return { result: '(sonuç yok)', error: undefined };

    // Return first row's relevant value
    const firstRow = data[0];
    const keys = cols && cols[0] !== '*' ? cols : Object.keys(firstRow);
    const value = String(firstRow[keys[0]] ?? '');
    return { result: value, error: undefined };
  } catch (e) {
    return { result: '', error: e instanceof Error ? e.message : 'Sorgu hatası' };
  }
}
