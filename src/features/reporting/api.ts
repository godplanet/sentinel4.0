import { supabase } from '@/shared/api/supabase';

export interface DBTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  layout_type: string;
  default_sections: { title: string; orderIndex: number }[];
  tags: string[];
  estimated_pages: string;
  is_active: boolean;
}

export async function fetchReportTemplates(): Promise<DBTemplate[]> {
  const { data, error } = await supabase
    .from('m6_report_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as DBTemplate[];
}

export async function createReportFromTemplate(template: DBTemplate): Promise<string | null> {
  const { data: reportData, error: reportError } = await supabase
    .from('m6_reports')
    .insert({
      title:
        template.layout_type === 'blank'
          ? 'Yeni Denetim Raporu'
          : `${template.name} — ${new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}`,
      status: 'draft',
      layout_type: template.layout_type,
      report_type: template.layout_type,
      risk_level: 'medium',
      auditor_name: 'Denetçi',
      finding_count: 0,
      theme_config: { paperStyle: 'zen_paper', typography: 'merriweather_inter' },
      executive_summary: {
        score: 0,
        grade: 'N/A',
        assuranceLevel: '',
        trend: 0,
        previousGrade: '',
        layoutType: template.layout_type,
        findingCounts: { critical: 0, high: 0, medium: 0, low: 0, observation: 0 },
        briefingNote: '',
        sections: {
          auditOpinion: '',
          criticalRisks: '',
          strategicRecommendations: '',
          managementAction: '',
        },
        dynamicSections: template.default_sections.map((s, idx) => ({
          id: `ds-${idx}`,
          title: s.title,
          content: '',
        })),
        dynamicMetrics:
          template.layout_type === 'investigation'
            ? { maliBoyu: '', olayTarihi: '', ilgiliBirim: '' }
            : undefined,
      },
      workflow: {},
    })
    .select('id')
    .maybeSingle();

  if (reportError) throw reportError;
  const reportId = reportData?.id;
  if (!reportId) return null;

  for (const section of template.default_sections) {
    await supabase.from('m6_report_sections').insert({
      report_id: reportId,
      title: section.title,
      order_index: section.orderIndex,
    });
  }

  return reportId;
}
