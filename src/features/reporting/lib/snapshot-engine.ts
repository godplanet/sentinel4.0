import { supabase } from '@/shared/api/supabase';
import type { Report, ReportBlock, ReportSnapshot } from '@/entities/report/model/types';
import { createReportSnapshot as saveSnapshot } from '../api/signature-api';

export async function captureReportSnapshot(
  reportId: string,
  publishedBy?: string
): Promise<ReportSnapshot> {
  const { data: report, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (reportError) throw reportError;

  const { data: blocks, error: blocksError } = await supabase
    .from('report_blocks')
    .select('*')
    .eq('report_id', reportId)
    .order('position_index', { ascending: true });

  if (blocksError) throw blocksError;

  const findingIds = blocks
    .filter((b: any) => b.block_type === 'finding_ref')
    .map((b: any) => b.content?.finding_id)
    .filter(Boolean);

  let findings: any[] = [];
  if (findingIds.length > 0) {
    const { data: findingsData, error: findingsError } = await supabase
      .from('audit_findings')
      .select('*')
      .in('id', findingIds);

    if (!findingsError && findingsData) {
      findings = findingsData;
    }
  }

  const blocksWithSnapshots = blocks.map((block: any) => {
    if (block.block_type === 'finding_ref' && block.content?.finding_id) {
      const finding = findings.find((f) => f.id === block.content.finding_id);
      return {
        ...block,
        snapshot_data: finding || null,
        snapshot_at: new Date().toISOString(),
      };
    }

    if (block.block_type === 'live_chart' || block.block_type === 'dynamic_metric') {
      return {
        ...block,
        snapshot_data: block.content,
        snapshot_at: new Date().toISOString(),
      };
    }

    return block;
  });

  const snapshot: ReportSnapshot = {
    report: report as Report,
    blocks: blocksWithSnapshots as ReportBlock[],
    findings,
    metadata: {
      snapshot_version: '1.0',
      created_at: new Date().toISOString(),
      created_by: publishedBy,
      total_blocks: blocksWithSnapshots.length,
      total_findings: findings.length,
    },
  };

  return snapshot;
}

export async function freezeReport(reportId: string, publishedBy?: string): Promise<void> {
  const snapshot = await captureReportSnapshot(reportId, publishedBy);

  await saveSnapshot(reportId, snapshot, publishedBy);

  await supabase
    .from('report_blocks')
    .update({
      snapshot_data: supabase.sql`content`,
      snapshot_at: new Date().toISOString(),
    })
    .eq('report_id', reportId);
}

export async function loadFrozenReport(reportId: string): Promise<ReportSnapshot | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('snapshot_data')
    .eq('id', reportId)
    .single();

  if (error) throw error;

  return data?.snapshot_data as ReportSnapshot | null;
}

export function isReportFrozen(report: Report): boolean {
  return report.status === 'published' && !!report.locked_at;
}

export async function canPublishReport(reportId: string): Promise<{
  can_publish: boolean;
  reason?: string;
}> {
  const { data: signatures, error } = await supabase
    .from('report_signatures')
    .select('*')
    .eq('report_id', reportId)
    .order('order_index', { ascending: true });

  if (error) {
    return { can_publish: false, reason: 'Signature data could not be loaded' };
  }

  if (!signatures || signatures.length < 3) {
    return {
      can_publish: false,
      reason: `All signatures required (${signatures?.length || 0}/3)`,
    };
  }

  const hasRejection = signatures.some((s: any) => s.status === 'rejected');
  if (hasRejection) {
    return {
      can_publish: false,
      reason: 'Report has been rejected. Cannot publish.',
    };
  }

  const allSigned = signatures.every(
    (s: any) => s.status === 'signed' || s.status === 'signed_with_dissent'
  );
  if (!allSigned) {
    return {
      can_publish: false,
      reason: 'All approvals must be completed',
    };
  }

  return { can_publish: true };
}
