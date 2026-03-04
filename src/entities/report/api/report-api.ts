/**
 * Rapor API — Tek doğru kaynak: public.reports + report_blocks
 */

import { supabase } from '@/shared/api/supabase';
import type {
  M6Report,
  M6ReportBlock,
  M6ReviewNote,
  ReportSection,
  ExecutiveSummary,
} from '../model/types';

const DEFAULT_TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── DB row types (reports + report_blocks) ───────────────────────────────────

interface DbReportBlock {
  id: string;
  report_id: string;
  position_index: number;
  parent_block_id: string | null;
  depth_level: number;
  block_type: string;
  content?: Record<string, unknown>;
  snapshot_data?: Record<string, unknown> | null;
}

interface DbExecutiveSummary {
  score?: number;
  grade?: string;
  assuranceLevel?: string;
  assurance_level?: string;
  trend?: number;
  trendDelta?: number;
  previousGrade?: string;
  previous_grade?: string;
  findingCounts?: { critical: number; high: number; medium: number; low: number; observation: number };
  keyMetrics?: { criticalFindings?: number; highFindings?: number; mediumFindings?: number; lowFindings?: number };
  briefingNote?: string;
  boardNote?: string;
  aiNarrative?: string;
  sections?: { auditOpinion?: string; criticalRisks?: string; strategicRecommendations?: string; managementAction?: string };
  managementResponse?: string;
  layoutType?: string;
  dynamicMetrics?: unknown;
  dynamicSections?: unknown;
}

interface DbReportRow {
  id: string;
  tenant_id: string;
  engagement_id: string | null;
  title: string;
  status: string;
  theme_config?: Record<string, unknown>;
  executive_summary?: DbExecutiveSummary | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  hash_seal?: string | null;
  [key: string]: unknown;
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

function mapDbBlockToFrontend(dbBlock: DbReportBlock): M6ReportBlock {
  return {
    id: dbBlock.id,
    type: dbBlock.block_type,
    orderIndex: dbBlock.position_index,
    content: dbBlock.content ?? {},
    snapshotData: dbBlock.snapshot_data ?? null,
  } as M6ReportBlock;
}

function mapDbExecutiveSummary(dbSummary: DbExecutiveSummary | null | undefined): ExecutiveSummary {
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

/** report_blocks listesinden bölümlere dönüştür: depth 0 + heading level 1 = bölüm başlığı, child'lar = bölüm blokları */
function blocksToSections(blocks: DbReportBlock[]): ReportSection[] {
  const sorted = [...blocks].sort((a, b) => a.position_index - b.position_index);
  const topLevel = sorted.filter((b) => b.parent_block_id == null);
  const sections: ReportSection[] = [];
  for (let i = 0; i < topLevel.length; i++) {
    const head = topLevel[i];
    const isSectionHeader =
      head.block_type === 'heading' &&
      (head.content as { level?: number })?.level === 1;
    const title = isSectionHeader
      ? String((head.content as { text?: string })?.text ?? 'Bölüm')
      : 'İçerik';
    const childBlocks = sorted.filter((b) => b.parent_block_id === head.id);
    const sectionBlocks = isSectionHeader ? [head, ...childBlocks] : [head];
    sections.push({
      id: head.id,
      title,
      orderIndex: i,
      blocks: sectionBlocks.map(mapDbBlockToFrontend),
    });
  }
  if (sections.length === 0 && sorted.length > 0) {
    sections.push({
      id: 'default',
      title: 'İçerik',
      orderIndex: 0,
      blocks: sorted.map(mapDbBlockToFrontend),
    });
  }
  return sections;
}

export function mapDbReportToFrontend(dbReport: DbReportRow, blocks: DbReportBlock[]): M6Report {
  const sections = blocksToSections(blocks);
  return {
    id: dbReport.id,
    engagementId: dbReport.engagement_id ?? '',
    title: dbReport.title,
    status: dbReport.status as M6Report['status'],
    themeConfig: (dbReport.theme_config as M6Report['themeConfig']) ?? {
      paperStyle: 'zen_paper',
      typography: 'merriweather_inter',
    },
    sections,
    executiveSummary: mapDbExecutiveSummary(dbReport.executive_summary),
    workflow: {},
    reviewNotes: [],
    createdAt: dbReport.created_at,
    updatedAt: dbReport.updated_at,
    publishedAt: dbReport.published_at ?? undefined,
    hashSeal: dbReport.hash_seal ?? undefined,
  };
}

export async function fetchReportData(reportId: string): Promise<M6Report | null> {
  const { data: reportRow, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .maybeSingle();
  if (reportError) throw reportError;
  if (!reportRow) return null;

  const { data: blocks = [], error: blocksError } = await supabase
    .from('report_blocks')
    .select('*')
    .eq('report_id', reportId)
    .order('position_index', { ascending: true });
  if (blocksError) throw blocksError;

  return mapDbReportToFrontend(reportRow as DbReportRow, blocks as DbReportBlock[]);
}

export async function fetchFirstDraftReport(): Promise<string | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .eq('status', 'draft')
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
  const { data: report } = await supabase.from('reports').select('tenant_id').eq('id', reportId).single();
  const tenantId = (report?.tenant_id as string) ?? DEFAULT_TENANT_ID;
  const { data: block, error } = await supabase
    .from('report_blocks')
    .insert({
      tenant_id: tenantId,
      report_id: reportId,
      parent_block_id: null,
      position_index: orderIndex,
      depth_level: 0,
      block_type: 'heading',
      content: { text: title, level: 1 },
    })
    .select('id')
    .single();
  if (error) throw error;
  if (!block) throw new Error('Bölüm oluşturulamadı.');
  return { id: block.id, title, orderIndex };
}

export async function updateReportMetaDb(reportId: string, payload: Record<string, unknown>): Promise<void> {
  const { error } = await supabase.from('reports').update(payload).eq('id', reportId);
  if (error) throw error;
}

export async function upsertBlockDb(reportId: string, sectionId: string, block: M6ReportBlock): Promise<void> {
  const { data: report } = await supabase.from('reports').select('tenant_id').eq('id', reportId).single();
  const tenantId = (report?.tenant_id as string) ?? DEFAULT_TENANT_ID;
  const row = {
    tenant_id: tenantId,
    report_id: reportId,
    parent_block_id: sectionId,
    position_index: block.orderIndex,
    depth_level: 1,
    block_type: block.type,
    content: block.content ?? {},
    snapshot_data: block.snapshotData ?? null,
  };
  const { error } = await supabase
    .from('report_blocks')
    .upsert({ id: block.id, ...row }, { onConflict: 'id' });
  if (error) throw error;
}

export async function updateBlockOrdersDb(
  blocks: { id: string; order_index: number }[],
): Promise<void> {
  for (const b of blocks) {
    const { error } = await supabase
      .from('report_blocks')
      .update({ position_index: b.order_index })
      .eq('id', b.id);
    if (error) throw error;
  }
}

export async function deleteBlockDb(blockId: string): Promise<void> {
  const { error } = await supabase.from('report_blocks').delete().eq('id', blockId);
  if (error) throw error;
}

export async function publishReportApi(
  reportId: string,
  hashSeal: string,
  blocksSnapshotMap: Record<string, unknown>,
): Promise<void> {
  const now = new Date().toISOString();
  const { error: reportError } = await supabase
    .from('reports')
    .update({ status: 'published', published_at: now, locked_at: now })
    .eq('id', reportId);
  if (reportError) throw reportError;
  for (const [blockId, snapshotData] of Object.entries(blocksSnapshotMap)) {
    const { error } = await supabase
      .from('report_blocks')
      .update({ snapshot_data: snapshotData })
      .eq('id', blockId);
    if (error) throw error;
  }
}
