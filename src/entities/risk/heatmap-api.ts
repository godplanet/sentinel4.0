import { supabase } from '@/shared/api/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
 AssessmentWithDetails,
 CreateAssessmentInput,
 RiskAssessment,
 RiskDefinition,
} from './heatmap-types';

const TENANT = '11111111-1111-1111-1111-111111111111';

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
 .from('risk_library')
 .select('id, risk_code, title, static_fields')
 .eq('tenant_id', TENANT)
 .order('title');
 if (error) throw error;
 return (data || []).map(r => ({
 id: r.id,
 title: r.title,
 category: r.static_fields?.category || 'other',
 }));
 },
 });
}

export function useCreateRiskDefinition() {
 const qc = useQueryClient();
 return useMutation({
 mutationFn: async (input: Omit<RiskDefinition, 'id' | 'tenant_id' | 'created_at' | 'updated_at' | 'is_active'>) => {
 const { data, error } = await supabase
 .from('risk_definitions')
 .insert({ ...input, tenant_id: TENANT })
 .select()
 .single();
 if (error) throw error;
 return data as RiskDefinition;
 },
 onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.definitions }),
 });
}

export function useRiskAssessments() {
 return useQuery({
 queryKey: KEYS.assessments,
 queryFn: async () => {
 const { data, error } = await supabase
 .from('risk_assessments')
 .select('*')
 .eq('tenant_id', TENANT)
 .order('assessed_at', { ascending: false });
 if (error) throw error;
 return data as RiskAssessment[];
 },
 });
}

export function useHeatmapData() {
 return useQuery({
 queryKey: KEYS.heatmap,
 queryFn: async () => {
 const { data: assessments, error: aErr } = await supabase
 .from('risk_assessments')
 .select('*')
 .eq('tenant_id', TENANT);
 if (aErr) throw aErr;

 const { data: entities, error: eErr } = await supabase
 .from('audit_entities')
 .select('id, name, type')
 .eq('tenant_id', TENANT);
 if (eErr) throw eErr;

 const entityMap = new Map((entities || []).map((e: { id: string; name: string; type: string }) => [e.id, e]));

 const enriched: AssessmentWithDetails[] = (assessments || []).map((a: RiskAssessment & { entity_id: string; risk_definition_id: string }) => {
 const entity = entityMap.get(a.entity_id);
 const impact = a.inherent_impact ?? 1;
 const likelihood = a.inherent_likelihood ?? 1;
 const residualImpact = a.residual_impact ?? impact;
 const residualLikelihood = a.residual_likelihood ?? likelihood;
 const ceRaw = a.control_effectiveness ?? 0;
 return {
 id: a.id,
 tenant_id: a.tenant_id,
 entity_id: a.entity_id,
 risk_id: a.risk_definition_id,
 impact,
 likelihood,
 inherent_risk_score: impact * likelihood,
 control_effectiveness: ceRaw / 100,
 residual_score: residualImpact * residualLikelihood,
 justification: a.notes || '',
 assessed_at: a.assessment_date,
 risk_title: a.risk_title || 'Bilinmeyen Risk',
 risk_category: a.risk_category || 'Diger',
 entity_name: entity?.name ?? 'Bilinmeyen Varlik',
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
 tenant_id: TENANT,
 entity_id: input.entity_id,
 risk_definition_id: input.risk_id,
 inherent_impact: input.impact,
 inherent_likelihood: input.likelihood,
 residual_impact: input.impact,
 residual_likelihood: input.likelihood,
 control_effectiveness: Math.round((input.control_effectiveness || 0) * 100),
 notes: input.justification,
 assessment_date: new Date().toISOString(),
 status: 'active',
 })
 .select()
 .single();
 if (error) throw error;
 return data;
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
