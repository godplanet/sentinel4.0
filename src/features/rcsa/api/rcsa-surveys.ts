import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { RCSAQuestion, RCSAQuestionType, RCSAResponse, RCSAResponseInput } from '../types';

export interface SaveRCSAQuestionsInput {
  campaignId: string;
  questions: {
    text: string;
    type: RCSAQuestionType;
    options: string[];
    triggerValue: string | null;
    weight: number;
  }[];
}

export async function fetchRCSAQuestions(campaignId: string): Promise<RCSAQuestion[]> {
  const { data, error } = await supabase
    .from('rcsa_questions')
    .select('*')
    .eq('tenant_id', ACTIVE_TENANT_ID)
    .eq('campaign_id', campaignId)
    .order('weight', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as unknown as RCSAQuestion[];
  return rows.map((q) => ({
    ...q,
    options: Array.isArray(q.options) ? (q.options as string[]) : [],
  }));
}

export async function saveRCSAQuestions(input: SaveRCSAQuestionsInput): Promise<void> {
  const { campaignId, questions } = input;

  // Basit strateji: İlgili kampanyanın önceki sorularını sil, sonra yeni seti ekle.
  const { error: deleteError } = await supabase
    .from('rcsa_questions')
    .delete()
    .eq('tenant_id', ACTIVE_TENANT_ID)
    .eq('campaign_id', campaignId);

  if (deleteError) {
    throw deleteError;
  }

  if (questions.length === 0) {
    return;
  }

  const { error: insertError } = await supabase
    .from('rcsa_questions')
    .insert(
      questions.map((q, index) => ({
        tenant_id: ACTIVE_TENANT_ID,
        campaign_id: campaignId,
        text: q.text,
        type: q.type,
        options: q.options,
        trigger_finding_if_value: q.triggerValue,
        // weight hem öncelik hem de sıralama için kullanılabilir.
        weight: q.weight || questions.length - index,
      })),
    );

  if (insertError) {
    throw insertError;
  }
}

export interface SubmitRCSAResponsesInput {
  campaignId: string;
  auditeeId: string;
  responses: RCSAResponseInput[];
}

export async function submitRCSAResponses(
  input: SubmitRCSAResponsesInput,
): Promise<RCSAResponse[]> {
  const { campaignId, auditeeId, responses } = input;

  if (responses.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('rcsa_responses')
    .insert(
      responses.map((r) => ({
        tenant_id: ACTIVE_TENANT_ID,
        campaign_id: campaignId,
        question_id: r.questionId,
        auditee_id: auditeeId,
        answer: r.answer,
        is_finding_triggered: r.isFindingTriggered,
      })),
    )
    .select('*');

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as RCSAResponse[];
}

