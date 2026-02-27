import { supabase } from '@/shared/api/supabase';
import type {
  Survey,
  SurveyResponse,
  CreateSurveyInput,
  SubmitSurveyResponseInput,
  SurveyWithStats,
  SurveyAssignment,
  CreateSurveyAssignmentInput,
} from '../model/types';

export async function fetchSurveys(filters?: { target_audience?: string; is_active?: boolean }): Promise<Survey[]> {
  let query = supabase.from('surveys').select('*');

  if (filters?.target_audience) {
    query = query.eq('target_audience', filters.target_audience);
  }
  if (filters?.is_active !== undefined) {
    query = query.eq('is_active', filters.is_active);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchSurvey(id: string): Promise<Survey | null> {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createSurvey(input: CreateSurveyInput): Promise<Survey> {
  const { data, error } = await supabase
    .from('surveys')
    .insert([{
      title: input.title,
      description: input.description || null,
      target_audience: input.target_audience,
      form_schema: input.form_schema,
      is_active: input.is_active ?? true,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSurvey(id: string, updates: Partial<Survey>): Promise<Survey> {
  const { data, error } = await supabase
    .from('surveys')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSurvey(id: string): Promise<void> {
  const { error } = await supabase
    .from('surveys')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function submitSurveyResponse(input: SubmitSurveyResponseInput): Promise<SurveyResponse> {
  const score = calculateScore(input.answers);

  const { data, error } = await supabase
    .from('survey_responses')
    .insert([{
      survey_id: input.survey_id,
      engagement_id: input.engagement_id || null,
      answers: input.answers,
      score,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', surveyId)
    .order('submitted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchSurveyStats(surveyId: string): Promise<{ count: number; averageScore: number | null }> {
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('score')
    .eq('survey_id', surveyId);

  if (error) throw error;

  const count = responses?.length || 0;
  const scores = responses?.filter(r => r.score !== null).map(r => r.score as number) || [];
  const averageScore = scores.length > 0
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length
    : null;

  return { count, averageScore };
}

function calculateScore(answers: Record<string, any>): number | null {
  const ratings = Object.values(answers).filter(val => typeof val === 'number') as number[];
  if (ratings.length === 0) return null;

  const sum = ratings.reduce((acc, val) => acc + val, 0);
  const max = ratings.length * 5;
  return (sum / max) * 100;
}

export async function findStakeholderSatisfactionTemplate(): Promise<Survey | null> {
  const { data, error } = await supabase
    .from('surveys')
    .select('*')
    .or(
      'title.ilike.%Stakeholder Satisfaction%,' +
      'title.ilike.%Paydaş Memnuniyet%,' +
      'title.ilike.%satisfaction%'
    )
    .eq('is_active', true)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function createSurveyAssignment(
  input: CreateSurveyAssignmentInput,
): Promise<SurveyAssignment> {
  const { data, error } = await supabase
    .from('survey_assignments')
    .insert([{
      survey_id:     input.survey_id,
      engagement_id: input.engagement_id  ?? null,
      auditee_id:    input.auditee_id     ?? null,
      triggered_by:  input.triggered_by   ?? 'AUDIT_CLOSED',
      metadata:      input.metadata       ?? {},
      tenant_id:     input.tenant_id      ?? 'default',
      status:        'PENDING',
    }])
    .select()
    .single();

  if (error) throw error;
  return data as SurveyAssignment;
}

export async function fetchSurveyAssignments(
  engagementId: string,
): Promise<SurveyAssignment[]> {
  const { data, error } = await supabase
    .from('survey_assignments')
    .select('*')
    .eq('engagement_id', engagementId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as SurveyAssignment[];
}
