import { supabase } from '@/shared/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  AssessmentWithDetails,
  CreateAssessmentInput,
  RiskDefinition,
} from './heatmap-types';

// audit_entities live in the bank tenant
const ORG_TENANT = '11111111-1111-1111-1111-111111111111';
// risk_definitions and risk_assessments use the default dev tenant (RLS policy)
const RISK_TENANT = '00000000-0000-0000-0000-000000000001';

const KEYS = {
  definitions: ['risk-definitions'] as const,
  assessments: ['risk-assessments'] as const,
  heatmap: ['risk-heatmap'] as const,
};

export function useRiskDefinitions() {
  return useQuery({
    queryKey: KEYS.definitions,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('risk_definitions')
        .select('id, title, category')
        .eq('tenant_id', RISK_TENANT)
        .order('title');
      if (error) throw error;
      return (data || []) as { id: string; title: string; category: string }[];
    },
  });
}

export function useHeatmapData() {
  return useQuery({
    queryKey: KEYS.heatmap,
    queryFn: async () => {
      const { data: assessments, error: aErr } = await supabase
        .from('risk_assessments')
        .select('*, risk_definitions(title, category)')
        .eq('tenant_id', RISK_TENANT);
      if (aErr) throw aErr;

      const { data: entities, error: eErr } = await supabase
        .from('audit_entities')
        .select('id, name, type')
        .eq('tenant_id', ORG_TENANT);
      if (eErr) throw eErr;

      const entityMap = new Map((entities || []).map((e: { id: string; name: string; type: string }) => [e.id, e]));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const enriched: AssessmentWithDetails[] = (assessments || []).map((a: any) => {
        const entity = entityMap.get(a.entity_id);
        return {
          id: a.id,
          tenant_id: a.tenant_id,
          entity_id: a.entity_id,
          risk_id: a.risk_id,
          impact: a.impact ?? 1,
          likelihood: a.likelihood ?? 1,
          inherent_risk_score: a.inherent_risk_score ?? (a.impact * a.likelihood),
          control_effectiveness: a.control_effectiveness ?? 0,
          residual_score: a.residual_score ?? (a.impact * a.likelihood),
          justification: a.justification || '',
          assessed_at: a.assessed_at,
          created_at: a.created_at,
          risk_title: a.risk_definitions?.title || 'Bilinmeyen Risk',
          risk_category: a.risk_definitions?.category || 'Diğer',
          entity_name: entity?.name ?? 'Bilinmeyen Varlık',
          entity_type: entity?.type ?? '',
        };
      });

      return enriched;
    },
  });
}

export function useCreateAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAssessmentInput) => {
      const { data, error } = await supabase
        .from('risk_assessments')
        .insert({
          tenant_id: RISK_TENANT,
          entity_id: input.entity_id,
          risk_id: input.risk_id,
          impact: input.impact,
          likelihood: input.likelihood,
          control_effectiveness: input.control_effectiveness || 0,
          justification: input.justification,
        })
        .select()
        .single();
      if (error) throw error;
      return data as RiskDefinition;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.assessments });
      qc.invalidateQueries({ queryKey: KEYS.heatmap });
    },
  });
}

export function useDeleteAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('risk_assessments')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.assessments });
      qc.invalidateQueries({ queryKey: KEYS.heatmap });
    },
  });
}
