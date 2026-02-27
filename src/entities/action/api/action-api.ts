import { supabase } from '@/shared/api/supabase';
import type {
  ActionAgingMetrics,
  CreateEvidenceInput,
  CreateRequestInput,
} from '../model/types';

export async function getActionsWithAging(): Promise<ActionAgingMetrics[]> {
  const { data, error } = await supabase
    .from('view_action_aging_metrics')
    .select('*')
    .order('performance_delay_days', { ascending: false });

  if (error) throw error;
  return (data ?? []) as ActionAgingMetrics[];
}

export async function uploadEvidence(
  actionId: string,
  file: File,
  aiScore: number,
): Promise<void> {
  const storagePath = `action-evidence/${actionId}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('action-evidence')
    .upload(storagePath, file, { upsert: false });

  if (uploadError) {
    console.warn('Storage upload skipped (bucket may not exist):', uploadError.message);
  }

  const fileHash = await computeSha256(file);

  const payload: CreateEvidenceInput = {
    action_id: actionId,
    storage_path: storagePath,
    file_hash: fileHash,
    ai_confidence_score: aiScore,
  };

  const { error } = await supabase.from('action_evidence').insert(payload);
  if (error) throw error;
}

export async function submitRequest(
  payload: CreateRequestInput,
): Promise<void> {
  const { error } = await supabase.from('action_requests').insert({
    action_id:      payload.action_id,
    type:           payload.type,
    justification:  payload.justification,
    requested_date: payload.requested_date ?? null,
    expiration_date: payload.expiration_date ?? null,
    status:         'pending',
  });
  if (error) throw error;
}

async function computeSha256(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
