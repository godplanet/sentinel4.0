/**
 * Yönetici Özeti (Executive Summary) — reports tablosu
 * useQuery: reportId ile rapor detayı ve executive_summary (JSONB) çeker.
 * generateSummary: İlgili engagement'a ait audit_findings (HIGH/CRITICAL) ile sentez üretir
 * ve reports.executive_summary'ye UPDATE yazar. 4 Göz onayı payload bu veriyi referans alır.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { fetchReportData } from '@/entities/report/api/report-api';
import type { M6Report } from '@/entities/report/model/types';

const QUERY_KEY_PREFIX = 'report-summary';

interface FindingRow {
  id: string;
  title: string;
  severity: string;
}

async function fetchFindingsByEngagement(engagementId: string): Promise<FindingRow[]> {
  if (!engagementId) return [];
  const { data, error } = await supabase
    .from('audit_findings')
    .select('id, title, severity')
    .eq('engagement_id', engagementId)
    .in('severity', ['HIGH', 'CRITICAL'])
    .order('severity', { ascending: false });
  if (error) throw error;
  return (data ?? []) as FindingRow[];
}

export interface GenerateSummaryInput {
  reportId: string;
}

/** Mevcut rapor executive_summary'sini alıp bulgulardan üretilen metinle birleştirir; reports tablosuna UPDATE atar */
async function generateSummaryPayload(reportId: string): Promise<M6Report> {
  const { data: reportRow, error: reportError } = await supabase
    .from('reports')
    .select('id, engagement_id, executive_summary')
    .eq('id', reportId)
    .maybeSingle();
  if (reportError) throw reportError;
  if (!reportRow) throw new Error('Rapor bulunamadı.');

  const engagementId = (reportRow.engagement_id as string) ?? '';
  const findings = await fetchFindingsByEngagement(engagementId);
  const titles = findings.map((f) => f.title).filter(Boolean);
  const count = titles.length;

  const syntheticText =
    count > 0
      ? `Sentinel AI tarafından sentezlenmiştir: Bu denetimde ${count} adet yüksek/kritik öncelikli risk bulunmuştur. Öne çıkan bulgular: ${titles.slice(0, 5).join('; ')}. Yönetim tarafından aksiyon planları oluşturulması önerilmektedir.`
      : 'Sentinel AI tarafından sentezlenmiştir: Bu denetim kapsamında yüksek veya kritik öncelikli bulgu tespit edilmemiştir.';

  const current = (reportRow.executive_summary ?? {}) as Record<string, unknown>;
  const sections = (current.sections as Record<string, string>) ?? {
    auditOpinion: '',
    criticalRisks: '',
    strategicRecommendations: '',
    managementAction: '',
  };
  const updatedSummary: Record<string, unknown> = {
    ...current,
    briefingNote: syntheticText,
    sections: {
      ...sections,
      auditOpinion: sections.auditOpinion || `<p>${syntheticText}</p>`,
      criticalRisks:
        sections.criticalRisks ||
        (count > 0
          ? `<p>Kritik ve yüksek öncelikli bulgular: ${titles.map((t) => `<strong>${t}</strong>`).join(', ')}.</p>`
          : '<p>Kritik/yüksek öncelikli bulgu kaydı yok.</p>'),
    },
  };

  const { error: updateError } = await supabase
    .from('reports')
    .update({
      executive_summary: updatedSummary,
      updated_at: new Date().toISOString(),
    })
    .eq('id', reportId);
  if (updateError) throw updateError;

  const refreshed = await fetchReportData(reportId);
  if (!refreshed) throw new Error('Rapor güncellendi ancak yeniden yüklenemedi.');
  return refreshed;
}

export function useReportSummary(reportId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: report = null, isLoading, refetch } = useQuery({
    queryKey: [QUERY_KEY_PREFIX, reportId ?? ''],
    queryFn: () => fetchReportData(reportId!),
    enabled: Boolean(reportId),
  });

  const generateMutation = useMutation({
    mutationFn: ({ reportId: id }: GenerateSummaryInput) => generateSummaryPayload(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_PREFIX, variables.reportId] });
    },
  });

  return {
    report,
    isLoading,
    refetch,
    generateSummary: generateMutation.mutateAsync,
    generateMutation,
    isGenerating: generateMutation.isPending,
  };
}
