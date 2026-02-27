import { supabase } from '@/shared/api/supabase';
import type { VaultAccessRequest, VaultRole, VaultApproval } from './types';
import { VAULT_ROLE_NAMES } from './types';

const VALID_ROLES: VaultRole[] = ['CAE', 'DEPUTY', 'MANAGER'];

export async function fetchVaultAccess(caseId: string): Promise<VaultAccessRequest | null> {
  const { data, error } = await supabase
    .from('vault_access_requests')
    .select('*')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as VaultAccessRequest | null;
}

export async function requestAccess(caseId: string, requester: string): Promise<VaultAccessRequest> {
  const { data, error } = await supabase
    .from('vault_access_requests')
    .insert({
      case_id: caseId,
      requested_by: requester,
      approvals: [],
      required_approvals: 2,
      status: 'PENDING',
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Failed to create vault access request');
  return data as VaultAccessRequest;
}

export async function grantApproval(
  requestId: string,
  role: VaultRole,
): Promise<{ request: VaultAccessRequest; unlocked: boolean }> {
  if (!VALID_ROLES.includes(role)) {
    throw new Error(`Gecersiz rol: ${role}. Sadece CAE, DEPUTY veya MANAGER onay verebilir.`);
  }

  const { data: current, error: fetchErr } = await supabase
    .from('vault_access_requests')
    .select('*')
    .eq('id', requestId)
    .maybeSingle();

  if (fetchErr) throw fetchErr;
  if (!current) throw new Error('Erisim talebi bulunamadi');

  const existing = (current.approvals || []) as VaultApproval[];

  if (existing.some((a) => a.role === role)) {
    throw new Error(`${role} rolu zaten onay vermis.`);
  }

  if (current.status !== 'PENDING') {
    throw new Error('Bu talep artik guncellenemiyor.');
  }

  const newApproval: VaultApproval = {
    role,
    name: VAULT_ROLE_NAMES[role],
    approved_at: new Date().toISOString(),
  };

  const updatedApprovals = [...existing, newApproval];
  const quorumMet = updatedApprovals.length >= (current.required_approvals || 2);

  const updatePayload: Record<string, unknown> = {
    approvals: updatedApprovals,
    updated_at: new Date().toISOString(),
  };

  if (quorumMet) {
    updatePayload.status = 'UNLOCKED';
    updatePayload.unlocked_at = new Date().toISOString();
  }

  const { data: updated, error: updateErr } = await supabase
    .from('vault_access_requests')
    .update(updatePayload)
    .eq('id', requestId)
    .select()
    .maybeSingle();

  if (updateErr) throw updateErr;
  if (!updated) throw new Error('Guncelleme basarisiz');

  return {
    request: updated as VaultAccessRequest,
    unlocked: quorumMet,
  };
}

export async function fetchInterrogationLogs(caseId: string) {
  const { data, error } = await supabase
    .from('interrogation_logs')
    .select('*')
    .eq('case_id', caseId)
    .order('session_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createInterrogationSession(
  caseId: string,
  suspectName: string,
  interviewer: string,
) {
  const { data: sessions } = await supabase
    .from('interrogation_logs')
    .select('session_number')
    .eq('case_id', caseId)
    .order('session_number', { ascending: false })
    .limit(1);

  const nextSession = sessions && sessions.length > 0 ? (sessions[0].session_number || 0) + 1 : 1;

  const { data, error } = await supabase
    .from('interrogation_logs')
    .insert({
      case_id: caseId,
      session_number: nextSession,
      suspect_name: suspectName,
      interviewer_name: interviewer,
      transcript: [],
      ai_contradiction_flags: [],
      status: 'IN_PROGRESS',
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function appendTranscriptLine(
  logId: string,
  currentTranscript: unknown[],
  line: { speaker: string; text: string; ts: string },
) {
  const updated = [...currentTranscript, line];

  const { data, error } = await supabase
    .from('interrogation_logs')
    .update({ transcript: updated })
    .eq('id', logId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function addContradictionFlag(
  logId: string,
  currentFlags: unknown[],
  flag: Record<string, unknown>,
) {
  const updated = [...currentFlags, flag];

  const { data, error } = await supabase
    .from('interrogation_logs')
    .update({ ai_contradiction_flags: updated })
    .eq('id', logId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function completeInterrogation(logId: string) {
  const { data, error } = await supabase
    .from('interrogation_logs')
    .update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString(),
    })
    .eq('id', logId)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
