/**
 * GIAS 9.2 Kapasite Eskalasyonu — Yönetim Kuruluna bildirim
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { ConflictCheck } from './conflicts';

export interface EscalationReportInput {
  summary: string;
  details?: Record<string, unknown>;
  report_type?: 'GIAS_9_2_CAPACITY' | 'BUDGET' | 'OTHER';
}

export interface EscalationReportRow {
  id: string;
  report_type: string;
  summary: string;
  details: Record<string, unknown>;
  status: string;
  created_at: string;
}

export async function createEscalationReport(
  input: EscalationReportInput
): Promise<EscalationReportRow> {
  const { data, error } = await supabase
    .from('escalation_reports')
    .insert({
      report_type: input.report_type ?? 'GIAS_9_2_CAPACITY',
      summary: input.summary,
      details: input.details ?? {},
      status: 'PENDING',
    })
    .select('id, report_type, summary, details, status, created_at')
    .single();

  if (error) throw error;
  return data as EscalationReportRow;
}

export function buildEscalationSummary(conflictCheck: ConflictCheck): string {
  const parts: string[] = [];
  if (conflictCheck.overlappingEngagements.length > 0) {
    parts.push(
      `Çakışan denetimler: ${conflictCheck.overlappingEngagements.map((e) => e.title).join(', ')}`
    );
  }
  if (conflictCheck.fatigueWarning) {
    parts.push(conflictCheck.fatigueWarning.message);
  }
  conflictCheck.warnings.forEach((w) => parts.push(w));
  return parts.join('. ') || 'Kaynak/kapasite yetersizliği.';
}

export function useEscalateToBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: EscalationReportInput) => createEscalationReport(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escalation-reports'] });
    },
  });
}
