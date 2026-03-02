import { supabase } from '@/shared/api/supabase';
import type { ScribbleExtractionResult } from './scribble-ai';
import type { FindingSeverity, GIASCategory } from '@/entities/finding/model/types';

export async function saveScribbleMagic(params: {
  content: string;
  linkedContext: string;
  result: ScribbleExtractionResult;
}): Promise<void> {
  await supabase.from('scribbles').insert({
    content: params.content,
    is_processed: true,
    linked_context: params.linkedContext,
    extracted_data: params.result,
  });
}

export async function saveScribbleNote(params: {
  content: string;
  linkedContext: string;
}): Promise<void> {
  await supabase.from('scribbles').insert({
    content: params.content,
    is_processed: false,
    linked_context: params.linkedContext,
  });
}

export interface ScribbleFindingInput {
  code: string;
  title: string;
  severity: FindingSeverity;
  gias_category: GIASCategory | null;
  state: string;
  detection_html: string;
  impact_html: string;
  recommendation_html: string;
  root_cause_analysis: { summary: string };
  impact_score: number;
  likelihood_score: number;
  financial_impact: number;
  auditee_department: string | null;
}

export async function saveScribbleFinding(input: ScribbleFindingInput): Promise<void> {
  const { error } = await supabase.from('findings_v2').insert(input);
  if (error) throw error;
}
