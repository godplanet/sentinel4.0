import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { FindingSeverityCounts, EngagementGradingRow, GroupConsolidationRow } from './types';

const TENANT_ID = ACTIVE_TENANT_ID;

export async function fetchFindingCounts(engagementId: string): Promise<FindingSeverityCounts> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('severity')
    .eq('engagement_id', engagementId);

  if (error) {
    console.error('Failed to fetch finding counts:', error.message);
    return { count_critical: 0, count_high: 0, count_medium: 0, count_low: 0, total: 0 };
  }

  const counts: FindingSeverityCounts = {
    count_critical: 0,
    count_high: 0,
    count_medium: 0,
    count_low: 0,
    total: data?.length ?? 0,
  };

  for (const row of data ?? []) {
    const sev = (row.severity ?? '').toLowerCase();
    if (sev.includes('critical') || sev.includes('kritik') || sev.includes('bordo')) {
      counts.count_critical++;
    } else if (sev.includes('high') || sev.includes('yuksek') || sev.includes('yüksek')) {
      counts.count_high++;
    } else if (sev.includes('medium') || sev.includes('orta')) {
      counts.count_medium++;
    } else {
      counts.count_low++;
    }
  }

  return counts;
}

export async function saveEngagementGrade(
  engagementId: string,
  grade: {
    baseScore: number;
    totalDeductions: number;
    finalScore: number;
    finalGrade: string;
    assuranceOpinion: string;
    cappingTriggered: boolean;
    cappingReason: string | null;
    waterfall: unknown[];
  },
): Promise<boolean> {
  const { error } = await supabase
    .from('audit_engagements')
    .update({
      base_score: grade.baseScore,
      total_deductions: grade.totalDeductions,
      final_score: grade.finalScore,
      final_grade: grade.finalGrade,
      assurance_opinion: grade.assuranceOpinion,
      capping_triggered: grade.cappingTriggered,
      capping_reason: grade.cappingReason,
      grading_breakdown: grade.waterfall,
      calculated_grade: grade.finalScore,
      letter_grade: grade.finalGrade,
      grade_limited_by: grade.cappingTriggered ? grade.cappingReason : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', engagementId);

  if (error) {
    console.error('Failed to save engagement grade:', error.message);
    return false;
  }

  return true;
}

export async function fetchEngagementGradings(planId?: string): Promise<EngagementGradingRow[]> {
  let query = supabase
    .from('audit_engagements')
    .select('id, title, final_score, final_grade, assurance_opinion, capping_triggered, capping_reason, risk_weight_factor, total_deductions, grading_breakdown')
    .eq('tenant_id', TENANT_ID);

  if (planId) {
    query = query.eq('plan_id', planId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch engagement gradings:', error.message);
    return [];
  }

  return (data ?? []) as EngagementGradingRow[];
}

export async function fetchGroupConsolidation(): Promise<GroupConsolidationRow[]> {
  const { data, error } = await supabase
    .from('view_group_consolidation')
    .select('*')
    .eq('tenant_id', TENANT_ID);

  if (error) {
    console.error('Failed to fetch group consolidation:', error.message);
    return [];
  }

  return (data ?? []) as GroupConsolidationRow[];
}
