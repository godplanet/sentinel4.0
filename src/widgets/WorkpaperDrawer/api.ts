import { supabase } from '@/shared/api/supabase';
import type { SpreadsheetState } from '@/widgets/SentinelOffice';

export async function fetchWorkpaperSpreadsheetData(
  workpaperId: string,
): Promise<SpreadsheetState | null> {
  const { data } = await supabase
    .from('workpapers')
    .select('spreadsheet_data')
    .eq('id', workpaperId)
    .maybeSingle();

  return (data?.spreadsheet_data as SpreadsheetState) ?? null;
}

export async function saveScratchpad(workpaperId: string, content: string): Promise<void> {
  const { error } = await supabase
    .from('workpapers')
    .update({ auditor_scratchpad: content, updated_at: new Date().toISOString() })
    .eq('id', workpaperId);

  if (error) throw error;
}

export async function saveJournalNotes(workpaperId: string, notes: string): Promise<void> {
  const { error } = await supabase
    .from('workpapers')
    .update({ auditor_notes: notes, updated_at: new Date().toISOString() })
    .eq('id', workpaperId);

  if (error) throw error;
}

export interface NewFindingInput {
  tenant_id: string;
  engagement_id: string;
  workpaper_id: string;
  code: string;
  title: string;
  severity: string;
  state: string;
  description: string;
  detection_html: string;
  impact_html: string;
  recommendation_html: string;
  gias_category: string;
  created_at: string;
  updated_at: string;
}

export interface FindingSecretInput {
  tenant_id: string;
  finding_id: string;
  why_1: string | null;
  why_2: string | null;
  why_3: string | null;
  why_4: string | null;
  why_5: string | null;
  root_cause_summary: string;
  internal_notes: string;
  created_at: string;
  updated_at: string;
}

export async function saveFinding(input: NewFindingInput): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('findings')
    .insert([input])
    .select()
    .single();

  if (error) throw error;
  return data as { id: string };
}

export async function saveFindingSecret(input: FindingSecretInput): Promise<void> {
  const { error } = await supabase.from('finding_secrets').insert([input]);
  if (error) throw error;
}
