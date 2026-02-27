import { supabase } from '@/shared/api/supabase';
import type {
  SurveyTemplateRow,
  SurveyAssignmentRow,
  SurveyResponseRow,
  SurveyAnswers,
  SurveySchema,
  SurveyAssignmentWithTemplate,
  FullSurveyContext,
  CreateSurveyTemplateInput,
  CreateSurveyAssignmentInput,
  SubmitSurveyResponseInput,
} from '@/shared/types/survey';

export async function fetchTemplates(): Promise<SurveyTemplateRow[]> {
  const { data, error } = await supabase
    .from('survey_templates')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SurveyTemplateRow[];
}

export async function fetchTemplate(id: string): Promise<SurveyTemplateRow | null> {
  const { data, error } = await supabase
    .from('survey_templates')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as SurveyTemplateRow | null;
}

export async function createTemplate(input: CreateSurveyTemplateInput): Promise<SurveyTemplateRow> {
  const { data, error } = await supabase
    .from('survey_templates')
    .insert([{ ...input, is_active: input.is_active ?? true }])
    .select()
    .single();
  if (error) throw error;
  return data as SurveyTemplateRow;
}

export async function updateTemplate(
  id: string,
  updates: Partial<CreateSurveyTemplateInput>,
): Promise<SurveyTemplateRow> {
  const { data, error } = await supabase
    .from('survey_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as SurveyTemplateRow;
}

export async function fetchAllAssignments(): Promise<FullSurveyContext[]> {
  const { data: assignments, error: aErr } = await supabase
    .from('survey_assignments')
    .select('*')
    .order('created_at', { ascending: false });
  if (aErr) throw aErr;

  if (!assignments || assignments.length === 0) return [];

  const templateIds = [...new Set(assignments.map((a) => a.template_id))];
  const assignmentIds = assignments.map((a) => a.id);

  const [{ data: templates }, { data: responses }] = await Promise.all([
    supabase.from('survey_templates').select('*').in('id', templateIds),
    supabase.from('survey_responses').select('*').in('assignment_id', assignmentIds),
  ]);

  const templateMap = new Map((templates ?? []).map((t) => [t.id, t as SurveyTemplateRow]));
  const responseMap = new Map((responses ?? []).map((r) => [r.assignment_id, r as SurveyResponseRow]));

  return (assignments as SurveyAssignmentRow[])
    .filter((a) => templateMap.has(a.template_id))
    .map((a) => ({
      ...a,
      template: templateMap.get(a.template_id)!,
      response: responseMap.get(a.id) ?? null,
    }));
}

export async function fetchResponseByAssignment(assignmentId: string): Promise<SurveyResponseRow | null> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('assignment_id', assignmentId)
    .maybeSingle();
  if (error) throw error;
  return data as SurveyResponseRow | null;
}

export async function submitResponse(input: SubmitSurveyResponseInput): Promise<SurveyResponseRow> {
  const { data, error } = await supabase
    .from('survey_responses')
    .upsert(
      [
        {
          assignment_id: input.assignment_id,
          answers: input.answers,
          score_total: input.score_total,
          submitted_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'assignment_id' },
    )
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from('survey_assignments')
    .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
    .eq('id', input.assignment_id);

  return data as SurveyResponseRow;
}

export function computeScore(answers: SurveyAnswers, schema: SurveySchema): number {
  if (schema.scoring_method === 'SUM') {
    let sum = 0;
    for (const section of schema.sections) {
      for (const question of section.questions) {
        const ans = answers[section.id]?.[question.id];
        if (ans) sum += ans.score;
      }
    }
    return sum;
  }

  let weightedSum = 0;
  let totalWeight = 0;

  for (const section of schema.sections) {
    const sectionWeight = section.weight ?? 1;
    for (const question of section.questions) {
      const ans = answers[section.id]?.[question.id];
      if (!ans) continue;
      const questionWeight = question.weight ?? 1;
      const maxScore = getQuestionMaxScore(question);
      if (maxScore > 0) {
        weightedSum += (ans.score / maxScore) * questionWeight * sectionWeight;
        totalWeight += questionWeight * sectionWeight;
      }
    }
  }

  return totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 100) : 0;
}

function getQuestionMaxScore(question: { type: string; weight: number; max?: number }): number {
  switch (question.type) {
    case 'RATING': return 5 * question.weight;
    case 'NUMERIC': return question.weight;
    default: return question.weight;
  }
}
