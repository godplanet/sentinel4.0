import { supabase } from '@/shared/api/supabase';
import type {
  M6Report,
  M6ReportBlock,
  M6ReviewNote,
  ReportSection,
  ExecutiveSummary,
} from '../model/types';

function mapDbBlockToFrontend(dbBlock: any): M6ReportBlock {
  return {
    id: dbBlock.id,
    type: dbBlock.block_type,
    orderIndex: dbBlock.order_index,
    content: dbBlock.content ?? {},
    snapshotData: dbBlock.snapshot_data ?? null,
  } as M6ReportBlock;
}

function mapDbSectionToFrontend(dbSection: any): ReportSection {
  const blocks: M6ReportBlock[] = (dbSection.m6_report_blocks ?? [])
    .slice()
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map(mapDbBlockToFrontend);
  return {
    id: dbSection.id,
    title: dbSection.title,
    orderIndex: dbSection.order_index,
    blocks,
  };
}

function mapDbExecutiveSummary(dbSummary: any): ExecutiveSummary {
  if (!dbSummary) {
    return {
      score: 0,
      grade: 'N/A',
      assuranceLevel: '',
      trend: 0,
      previousGrade: '',
      findingCounts: { critical: 0, high: 0, medium: 0, low: 0, observation: 0 },
      briefingNote: '',
      sections: {
        auditOpinion: '',
        criticalRisks: '',
        strategicRecommendations: '',
        managementAction: '',
      },
    };
  }
  return {
    score: dbSummary.score ?? 0,
    grade: dbSummary.grade ?? 'N/A',
    assuranceLevel: dbSummary.assuranceLevel ?? dbSummary.assurance_level ?? '',
    trend: typeof dbSummary.trend === 'number'
      ? dbSummary.trend
      : (dbSummary.trendDelta ?? 0),
    previousGrade: dbSummary.previousGrade ?? dbSummary.previous_grade ?? '',
    findingCounts: dbSummary.findingCounts ?? {
      critical: dbSummary.keyMetrics?.criticalFindings ?? 0,
      high: dbSummary.keyMetrics?.highFindings ?? 0,
      medium: dbSummary.keyMetrics?.mediumFindings ?? 0,
      low: dbSummary.keyMetrics?.lowFindings ?? 0,
      observation: 0,
    },
    briefingNote:
      dbSummary.briefingNote ??
      dbSummary.boardNote ??
      dbSummary.aiNarrative ??
      '',
    sections: dbSummary.sections ?? {
      auditOpinion: dbSummary.aiNarrative ?? '',
      criticalRisks: '',
      strategicRecommendations: '',
      managementAction: '',
    },
    managementResponse: dbSummary.managementResponse,
    layoutType: dbSummary.layoutType ?? undefined,
    dynamicMetrics: dbSummary.dynamicMetrics ?? undefined,
    dynamicSections: dbSummary.dynamicSections ?? undefined,
  };
}

function mapDbReviewNote(dbNote: any): M6ReviewNote {
  return {
    id: dbNote.id,
    blockId: dbNote.block_id ?? '',
    selectedText: dbNote.selected_text ?? '',
    comment: dbNote.comment,
    status: dbNote.status as 'open' | 'resolved',
    createdBy: dbNote.created_by ?? '',
    createdAt: dbNote.created_at,
    resolvedAt: dbNote.resolved_at ?? undefined,
  };
}

export function mapDbReportToFrontend(dbReport: any): M6Report {
  const sections: ReportSection[] = (dbReport.m6_report_sections ?? [])
    .slice()
    .sort((a: any, b: any) => a.order_index - b.order_index)
    .map(mapDbSectionToFrontend);
  const reviewNotes: M6ReviewNote[] = (dbReport.m6_review_notes ?? []).map(mapDbReviewNote);
  return {
    id: dbReport.id,
    engagementId: dbReport.engagement_id ?? '',
    title: dbReport.title,
    status: dbReport.status,
    themeConfig: dbReport.theme_config ?? {
      paperStyle: 'zen_paper',
      typography: 'merriweather_inter',
    },
    sections,
    executiveSummary: mapDbExecutiveSummary(dbReport.executive_summary),
    workflow: dbReport.workflow ?? {},
    reviewNotes,
    createdAt: dbReport.created_at,
    updatedAt: dbReport.updated_at,
    publishedAt: dbReport.published_at ?? undefined,
    hashSeal: dbReport.hash_seal ?? undefined,
  };
}

export async function fetchReportData(reportId: string): Promise<M6Report | null> {
  const { data, error } = await supabase
    .from('m6_reports')
    .select('*, m6_report_sections(*, m6_report_blocks(*)), m6_review_notes(*)')
    .eq('id', reportId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return mapDbReportToFrontend(data);
}

export async function fetchFirstDraftReport(): Promise<string | null> {
  const { data, error } = await supabase
    .from('m6_reports')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export async function createSectionDb(
  reportId: string,
  title: string,
  orderIndex: number,
): Promise<{ id: string; title: string; orderIndex: number }> {
  const { data, error } = await supabase
    .from('m6_report_sections')
    .insert({ report_id: reportId, title, order_index: orderIndex })
    .select('id, title, order_index')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Bölüm oluşturulamadı.');
  return { id: data.id, title: data.title, orderIndex: data.order_index };
}

export async function updateReportMetaDb(reportId: string, payload: Record<string, any>): Promise<void> {
  const { error } = await supabase
    .from('m6_reports')
    .update(payload)
    .eq('id', reportId);
  if (error) throw error;
}

export async function upsertBlockDb(sectionId: string, block: M6ReportBlock): Promise<void> {
  const { error } = await supabase
    .from('m6_report_blocks')
    .upsert({
      id: block.id,
      section_id: sectionId,
      block_type: block.type,
      order_index: block.orderIndex,
      content: block.content ?? {},
      snapshot_data: block.snapshotData ?? null,
    });
  if (error) throw error;
}

export async function updateBlockOrdersDb(
  blocks: { id: string; order_index: number }[],
): Promise<void> {
  for (const b of blocks) {
    const { error } = await supabase
      .from('m6_report_blocks')
      .update({ order_index: b.order_index })
      .eq('id', b.id);
    if (error) throw error;
  }
}

export async function deleteBlockDb(blockId: string): Promise<void> {
  const { error } = await supabase
    .from('m6_report_blocks')
    .delete()
    .eq('id', blockId);
  if (error) throw error;
}

export async function publishReportApi(
  reportId: string,
  hashSeal: string,
  blocksSnapshotMap: Record<string, any>,
): Promise<void> {
  const now = new Date().toISOString();
  const { error: reportError } = await supabase
    .from('m6_reports')
    .update({ status: 'published', hash_seal: hashSeal, published_at: now })
    .eq('id', reportId);
  if (reportError) throw reportError;

  for (const [blockId, snapshotData] of Object.entries(blocksSnapshotMap)) {
    const { error } = await supabase
      .from('m6_report_blocks')
      .update({ snapshot_data: snapshotData })
      .eq('id', blockId);
    if (error) throw error;
  }
}
