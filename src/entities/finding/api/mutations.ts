import { supabase } from '@/shared/api/supabase';
import type { AuditFindingRow } from '@/shared/types/database.types';

export interface CreateFindingInput {
  title: string;
  severity: string;
  code?: string;
  gias_category?: string;
  auditee_department?: string;
  impact_score?: number;
  likelihood_score?: number;
  financial_impact?: number;
  detection?: string;
  impact?: string;
  root_cause?: string;
  recommendation?: string;
  why_1?: string;
  why_2?: string;
  why_3?: string;
  why_4?: string;
  why_5?: string;
}

export async function createFinding(input: CreateFindingInput): Promise<AuditFindingRow> {
  const { data, error } = await supabase
    .from('audit_findings')
    .insert({
      title: input.title,
      severity: input.severity,
      status: 'DRAFT',
      main_status: 'DRAFT',
      state: 'DRAFT',
      gias_category: input.gias_category || null,
      auditee_department: input.auditee_department || null,
      impact_score: input.impact_score,
      likelihood_score: input.likelihood_score,
      financial_impact: input.financial_impact,
      details: {
        code: input.code,
        detection: input.detection,
        impact: input.impact,
        root_cause: input.root_cause,
        recommendation: input.recommendation,
        five_whys: {
          why_1: input.why_1,
          why_2: input.why_2,
          why_3: input.why_3,
          why_4: input.why_4,
          why_5: input.why_5,
        },
      },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
