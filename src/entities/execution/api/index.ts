import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type {
  Workpaper,
  AuditStep,
  Evidence,
  WorkpaperFinding,
  WorkpaperData,
  TestResult,
} from '../model/types';

export interface DbEngagement {
  id: string;
  tenant_id: string;
  plan_id: string | null;
  entity_id: string | null;
  title: string;
  audit_type: string;
  start_date: string;
  end_date: string;
  status: string;
  estimated_hours: number;
  actual_hours: number;
  risk_snapshot_score: number | null;
  assigned_auditor_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchWorkpapers(): Promise<Workpaper[]> {
  const { data, error } = await supabase
    .from('workpapers')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchWorkpaper(id: string): Promise<Workpaper | null> {
  const { data, error } = await supabase
    .from('workpapers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createWorkpaper(
  stepId: string,
  initialData: WorkpaperData = {},
  engagementId?: string
): Promise<Workpaper> {
  const { data, error } = await supabase
    .from('workpapers')
    .insert({
      tenant_id: ACTIVE_TENANT_ID,
      step_id: stepId,
      engagement_id: engagementId ?? null,
      data: initialData,
      status: 'draft',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateWorkpaperField(
  workpaperId: string,
  fieldPath: string[],
  value: unknown
): Promise<WorkpaperData> {
  const { data, error } = await supabase.rpc('update_workpaper_field', {
    p_workpaper_id: workpaperId,
    p_field_path: fieldPath,
    p_value: JSON.stringify(value),
  });

  if (error) throw error;
  return data;
}

export async function updateTestResult(
  workpaperId: string,
  testKey: string,
  result: TestResult
): Promise<WorkpaperData> {
  const { data, error } = await supabase.rpc('update_workpaper_test_result', {
    p_workpaper_id: workpaperId,
    p_test_key: testKey,
    p_result: result,
  });

  if (error) throw error;
  return data;
}

export async function addComment(
  workpaperId: string,
  comment: string
): Promise<WorkpaperData> {
  const { data: wp, error: fetchErr } = await supabase
    .from('workpapers')
    .select('data, version')
    .eq('id', workpaperId)
    .maybeSingle();

  if (fetchErr || !wp) throw new Error(fetchErr?.message || 'Workpaper not found');

  const currentData = (wp.data || {}) as WorkpaperData;
  const comments = currentData.comments || [];
  comments.push({
    text: comment,
    author_id: 'current-user',
    timestamp: new Date().toISOString(),
  });

  const updatedData = { ...currentData, comments };

  const { error: updateErr } = await supabase
    .from('workpapers')
    .update({
      data: updatedData,
      version: (wp.version || 0) + 1,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workpaperId);

  if (updateErr) throw updateErr;
  return updatedData;
}

export async function updateWorkpaperStatus(
  workpaperId: string,
  status: 'draft' | 'review' | 'finalized'
): Promise<void> {
  const { error } = await supabase
    .from('workpapers')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workpaperId);

  if (error) throw error;
}

export async function fetchAuditSteps(engagementId?: string): Promise<AuditStep[]> {
  let query = supabase.from('audit_steps').select('*').order('step_code');

  if (engagementId) {
    query = query.eq('engagement_id', engagementId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchEvidence(workpaperId: string): Promise<Evidence[]> {
  const { data, error } = await supabase
    .from('evidence_chain')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchFindings(workpaperId: string): Promise<WorkpaperFinding[]> {
  const { data, error } = await supabase
    .from('workpaper_findings')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function deleteWorkpaper(id: string): Promise<void> {
  const { error } = await supabase.from('workpapers').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchEngagements(): Promise<DbEngagement[]> {
  try {
    const { data, error } = await supabase
      .from('audit_engagements_v2')
      .select('*')
      .eq('tenant_id', ACTIVE_TENANT_ID)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as DbEngagement[];
  } catch {
    return [];
  }
}

export async function fetchEngagement(id: string): Promise<DbEngagement | null> {
  try {
    const { data, error } = await supabase
      .from('audit_engagements_v2')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', ACTIVE_TENANT_ID)
      .maybeSingle();
    if (error) throw error;
    return data as DbEngagement | null;
  } catch {
    return null;
  }
}
