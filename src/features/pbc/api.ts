import { supabase } from '@/shared/api/supabase';

export interface PBCRequest {
  id: string;
  engagement_id: string | null;
  title: string;
  description: string;
  requested_from: string;
  assigned_to: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePBCRequestInput {
  title: string;
  description: string;
  requested_from: string;
  priority: PBCRequest['priority'];
  due_date: string | null;
  engagement_id: string | null;
}

export async function fetchPBCRequests(engagementId?: string): Promise<PBCRequest[]> {
  let query = supabase
    .from('pbc_requests')
    .select('*')
    .order('created_at', { ascending: false });

  if (engagementId) {
    query = query.eq('engagement_id', engagementId);
  }

  const { data } = await query;
  return (data as PBCRequest[]) || [];
}

export async function createPBCRequest(input: CreatePBCRequestInput): Promise<void> {
  const { error } = await supabase.from('pbc_requests').insert({
    title: input.title,
    description: input.description,
    requested_from: input.requested_from,
    priority: input.priority,
    due_date: input.due_date || null,
    engagement_id: input.engagement_id || null,
    status: 'PENDING',
  });
  if (error) throw error;
}

export async function updatePBCRequestStatus(
  id: string,
  status: PBCRequest['status'],
): Promise<void> {
  const { error } = await supabase
    .from('pbc_requests')
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}
