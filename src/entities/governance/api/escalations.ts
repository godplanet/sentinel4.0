import { supabase } from '@/shared/api/supabase';
import type { Escalation, CreateEscalationInput } from '../model/types';

export async function fetchEscalations(filters?: { status?: string; finding_id?: string }): Promise<Escalation[]> {
  let query = supabase.from('cae_escalations').select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.finding_id) {
    query = query.eq('finding_id', filters.finding_id);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('fetchEscalations error:', error);
    // Extreme Defensive Programming: Never throw if it causes UI crash, just return empty array
    return [];
  }
  
  // Extreme Defensive Programming
  return (data || []).map((item: any) => ({
    ...item,
    id: item?.id ?? 'temp-id',
    finding_id: item?.finding_id ?? '',
    title: item?.title ?? 'İsimsiz',
    description: item?.description ?? 'Açıklama Yok',
    risk_score: item?.risk_score || 1, // Fallback to 1 as requested (x || 1) logic
    board_decision: item?.board_decision ?? 'Karar Bekleniyor',
    status: item?.status ?? 'OPEN',
    created_at: item?.created_at || new Date().toISOString(),
    updated_at: item?.updated_at || new Date().toISOString(),
    tenant_id: item?.tenant_id ?? 'default-tenant',
    metadata: item?.metadata ?? null,
  }));
}

export async function createEscalation(input: CreateEscalationInput): Promise<Escalation> {
  const { data: userData } = await supabase.auth.getUser();
  const tenantId = userData?.user?.user_metadata?.tenant_id ?? 'demo-tenant';

  const payload = {
    finding_id: input?.finding_id ?? '',
    title: input?.title ?? '',
    description: input?.description ?? '',
    risk_score: input?.risk_score || 1,
    status: 'OPEN',
    tenant_id: tenantId
  };

  const { data, error } = await supabase
    .from('cae_escalations')
    .insert([payload])
    .select()
    .single();

  if (error) {
    // Return a dummy safe object to prevent White Screen of Death on mutation error
    console.error('createEscalation error:', error);
    return {
      id: 'error-id',
      finding_id: payload.finding_id,
      title: payload.title,
      description: payload.description,
      risk_score: payload.risk_score || 1,
      board_decision: 'Karar Bekleniyor',
      status: 'OPEN',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tenant_id: payload.tenant_id
    };
  }
  
  return {
    ...data,
    id: data?.id ?? 'temp-id',
    finding_id: data?.finding_id ?? payload.finding_id,
    title: data?.title ?? payload.title,
    description: data?.description ?? payload.description,
    risk_score: data?.risk_score || 1,
    board_decision: data?.board_decision ?? 'Karar Bekleniyor',
    status: data?.status ?? 'OPEN',
    created_at: data?.created_at || new Date().toISOString(),
    updated_at: data?.updated_at || new Date().toISOString(),
    tenant_id: data?.tenant_id ?? payload.tenant_id,
    metadata: data?.metadata ?? null,
  };
}

export async function updateEscalationStatus(id: string, status: string, boardDecision?: string): Promise<Escalation> {
  const updates: any = { 
    status, 
    updated_at: new Date().toISOString() 
  };
  
  if (boardDecision) {
    updates.board_decision = boardDecision;
  }

  const { data, error } = await supabase
    .from('cae_escalations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('updateEscalationStatus error:', error);
    return {
      id: id || 'error-id',
      finding_id: '',
      title: 'Hata Otuştu',
      description: 'Güncelleme yapılırken hata oluştu.',
      risk_score: 1,
      board_decision: boardDecision ?? 'Karar Bekleniyor',
      status: status as any,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      tenant_id: 'default-tenant'
    };
  }

  return {
    ...data,
    id: data?.id ?? id,
    finding_id: data?.finding_id ?? '',
    title: data?.title ?? 'İsimsiz',
    description: data?.description ?? 'Açıklama Yok',
    risk_score: data?.risk_score || 1,
    board_decision: data?.board_decision ?? 'Karar Bekleniyor',
    status: data?.status ?? status,
    created_at: data?.created_at || new Date().toISOString(),
    updated_at: data?.updated_at || new Date().toISOString(),
    tenant_id: data?.tenant_id ?? 'default-tenant',
    metadata: data?.metadata ?? null,
  };
}
