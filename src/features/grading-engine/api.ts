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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Wave 38: React Query Wrappers ─────────────────────────────────────────

export interface AuditGrade {
  id: string;
  engagement_id: string | null;
  grading_scale_id: string | null;
  tenant_id: string;
  final_score: number;
  final_grade: string;
  assurance_opinion: string;
  base_score: number;
  total_deductions: number;
  capping_triggered: boolean;
  capping_reason: string | null;
  waterfall_breakdown: unknown[] | null;
  count_critical: number;
  count_high: number;
  count_medium: number;
  count_low: number;
  graded_by: string;
  graded_at: string;
}

export interface GradeHistoryRow {
  id: string;
  engagement_id: string;
  previous_grade: string | null;
  new_grade: string;
  previous_score: number | null;
  new_score: number;
  change_reason: string | null;
  changed_by: string;
  changed_at: string;
}

export function useEngagementGradings(planId?: string) {
  return useQuery({
    queryKey: ['engagement-gradings', planId ?? 'all'],
    queryFn: () => fetchEngagementGradings(planId),
    staleTime: 30_000,
  });
}

export function useAuditGrades(tenantId: string = '11111111-1111-1111-1111-111111111111') {
  return useQuery({
    queryKey: ['audit-grades', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_grades')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('graded_at', { ascending: false });
      if (error) return [] as AuditGrade[];
      return (data ?? []) as AuditGrade[];
    },
    staleTime: 30_000,
  });
}

export function useGradeHistory(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['grade-history', engagementId],
    enabled: !!engagementId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('grade_history')
        .select('*')
        .eq('engagement_id', engagementId!)
        .order('changed_at', { ascending: false });
      if (error) return [] as GradeHistoryRow[];
      return (data ?? []) as GradeHistoryRow[];
    },
  });
}

export function useSaveAuditGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      engagementId,
      tenantId = '11111111-1111-1111-1111-111111111111',
      grade,
    }: {
      engagementId: string;
      tenantId?: string;
      grade: {
        finalScore: number;
        finalGrade: string;
        assuranceOpinion: string;
        baseScore: number;
        totalDeductions: number;
        cappingTriggered: boolean;
        cappingReason: string | null;
        waterfallBreakdown: unknown[];
        countCritical?: number;
        countHigh?: number;
        countMedium?: number;
        countLow?: number;
        gradedBy?: string;
      };
    }) => {
      // Save to audit_grades (upsert by engagement_id)
      const { error: gradeError } = await supabase
        .from('audit_grades')
        .upsert({
          engagement_id:      engagementId,
          tenant_id:          tenantId,
          final_score:        grade.finalScore,
          final_grade:        grade.finalGrade,
          assurance_opinion:  grade.assuranceOpinion,
          base_score:         grade.baseScore,
          total_deductions:   grade.totalDeductions,
          capping_triggered:  grade.cappingTriggered,
          capping_reason:     grade.cappingReason,
          waterfall_breakdown: grade.waterfallBreakdown,
          count_critical:     grade.countCritical ?? 0,
          count_high:         grade.countHigh ?? 0,
          count_medium:       grade.countMedium ?? 0,
          count_low:          grade.countLow ?? 0,
          graded_by:          grade.gradedBy ?? 'system',
          graded_at:          new Date().toISOString(),
          updated_at:         new Date().toISOString(),
        }, { onConflict: 'engagement_id' });

      if (gradeError) throw gradeError;

      // Also update audit_engagements for backward compat
      await saveEngagementGrade(engagementId, {
        baseScore: grade.baseScore,
        totalDeductions: grade.totalDeductions,
        finalScore: grade.finalScore,
        finalGrade: grade.finalGrade,
        assuranceOpinion: grade.assuranceOpinion,
        cappingTriggered: grade.cappingTriggered,
        cappingReason: grade.cappingReason,
        waterfall: grade.waterfallBreakdown,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['audit-grades'] });
      qc.invalidateQueries({ queryKey: ['engagement-gradings'] });
      qc.invalidateQueries({ queryKey: ['grade-history'] });
    },
  });
}
