/**
 * Rapor listesi — Tek doğru kaynak: public.reports tablosu
 * Mock yok; Supabase reports + isteğe bağlı audit_engagements JOIN
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

/**
 * reports tablosu + engagement başlığı (JOIN) — Tek doğru kaynak tipi.
 */
export interface ReportListItem {
  id: string;
  title: string;
  description: string | null;
  status: string;
  version: number;
  parent_report_id: string | null;
  amendment_note: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  published_by: string | null;
  locked_at: string | null;
  locked_by: string | null;
  engagement_id: string | null;
  /** Denetim görevi adı (audit_engagements.title) */
  engagement_title: string | null;
}

/** Entity tipi: Report = ReportListItem (Supabase reports tablosu) */
export type Report = ReportListItem;

const REPORTS_QUERY_KEY = ['reports-list'] as const;

async function fetchReports(): Promise<ReportListItem[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `
      id,
      title,
      description,
      status,
      version,
      parent_report_id,
      amendment_note,
      created_at,
      updated_at,
      published_at,
      published_by,
      locked_at,
      locked_by,
      engagement_id,
      audit_engagements!reports_engagement_id_fkey(title)
    `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: Record<string, unknown>) => {
    const engagement = row.audit_engagements as { title?: string } | null;
    return {
      id: row.id as string,
      title: row.title as string,
      description: (row.description as string) ?? null,
      status: row.status as string,
      version: (row.version as number) ?? 1,
      parent_report_id: (row.parent_report_id as string) ?? null,
      amendment_note: (row.amendment_note as string) ?? null,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
      published_at: (row.published_at as string) ?? null,
      published_by: (row.published_by as string) ?? null,
      locked_at: (row.locked_at as string) ?? null,
      locked_by: (row.locked_by as string) ?? null,
      engagement_id: (row.engagement_id as string) ?? null,
      engagement_title: engagement?.title ?? null,
    } satisfies ReportListItem;
  });
}

export function useReports() {
  const query = useQuery({
    queryKey: REPORTS_QUERY_KEY,
    queryFn: fetchReports,
    staleTime: 60_000,
  });

  return {
    reports: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}

export { REPORTS_QUERY_KEY };

/** Varsayılan tenant (demo/seed ile uyumlu) */
const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';

/**
 * reports tablosunda yeni taslak rapor oluşturur (Tek doğru kaynak).
 * Mock yok; doğrudan Supabase INSERT.
 */
export async function createReport(options?: {
  title?: string;
  description?: string;
  engagement_id?: string;
  tenant_id?: string;
}): Promise<string> {
  const title =
    options?.title ??
    `Yeni Denetim Raporu — ${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`;
  const { data, error } = await supabase
    .from('reports')
    .insert({
      tenant_id: options?.tenant_id ?? DEFAULT_TENANT_ID,
      title,
      description: options?.description ?? '',
      status: 'draft',
      engagement_id: options?.engagement_id ?? null,
    })
    .select('id')
    .single();

  if (error) throw error;
  if (!data?.id) throw new Error('Rapor oluşturuldu ancak ID alınamadı.');
  return data.id as string;
}
