import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import { Finding, FindingSeverity } from '../model/types';

export interface CreateFindingInput {
  tenant_id?: string;
  engagement_id: string;
  title: string;
  severity: FindingSeverity;
  description?: string;
  finding_year?: number;
  state?: string;
  status?: string;
}

export async function createFinding(input: CreateFindingInput): Promise<Finding | null> {
  const currentYear = new Date().getFullYear();

  const { data, error } = await supabase
    .from('audit_findings')
    .insert({
      tenant_id: input.tenant_id || ACTIVE_TENANT_ID,
      engagement_id: input.engagement_id,
      title: input.title,
      severity: input.severity,
      description: input.description || '',
      finding_year: input.finding_year || currentYear,
      state: input.state || 'DRAFT',
      status: input.status || 'DRAFT',
      details: {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating finding:', error);
    return null;
  }

  return data;
}

export async function updateFinding(
  id: string,
  updates: Partial<Finding>
): Promise<Finding | null> {
  const { data, error } = await supabase
    .from('audit_findings')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating finding:', error);
    return null;
  }

  return data;
}

export async function deleteFinding(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('audit_findings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting finding:', error);
    return false;
  }

  return true;
}

export async function getFindingById(id: string): Promise<Finding | null> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching finding:', error);
    return null;
  }

  return data;
}

export async function getAllFindings(engagementId?: string): Promise<Finding[]> {
  let query = supabase.from('audit_findings').select('*');

  if (engagementId) {
    query = query.eq('engagement_id', engagementId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching findings:', error);
    return [];
  }

  return data || [];
}
