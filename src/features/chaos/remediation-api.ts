import { supabase } from '@/shared/api/supabase';
import type { IaCRemediation, IaCStatus } from './types';

export async function fetchRemediations(): Promise<IaCRemediation[]> {
  const { data, error } = await supabase
    .from('iac_remediations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as IaCRemediation[];
}

export async function createRemediation(
  payload: Omit<IaCRemediation, 'id' | 'created_at' | 'executed_at' | 'approved_by' | 'execution_log'>,
): Promise<IaCRemediation> {
  const { data, error } = await supabase
    .from('iac_remediations')
    .insert({
      finding_id: payload.finding_id,
      title: payload.title,
      resource_type: payload.resource_type,
      proposed_fix_script: payload.proposed_fix_script,
      language: payload.language,
      status: payload.status,
    })
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data as IaCRemediation;
}

export async function updateRemediationStatus(
  id: string,
  status: IaCStatus,
  log?: Array<{ step: string; status: string; timestamp: string }>,
): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === 'EXECUTED') {
    update.executed_at = new Date().toISOString();
  }
  if (log) {
    update.execution_log = log;
  }

  const { error } = await supabase
    .from('iac_remediations')
    .update(update)
    .eq('id', id);

  if (error) throw error;
}
