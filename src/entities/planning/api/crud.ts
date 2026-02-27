import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import { AuditEngagement, CreateEngagementInput } from '../model/types';

export async function createEngagement(input: CreateEngagementInput): Promise<AuditEngagement> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .insert({
      tenant_id: input.tenant_id || ACTIVE_TENANT_ID,
      plan_id: input.plan_id,
      entity_id: input.entity_id,
      title: input.title,
      audit_type: input.audit_type,
      start_date: input.start_date,
      end_date: input.end_date,
      risk_snapshot_score: input.risk_snapshot_score,
      estimated_hours: input.estimated_hours || 40,
      actual_hours: 0,
      status: 'PLANNED',
    })
    .select()
    .single();

  if (error) throw new Error(`Engagement oluşturulamadı: ${error.message}`);
  return data;
}

export async function updateEngagement(
  id: string,
  updates: Partial<AuditEngagement>
): Promise<AuditEngagement> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .update(updates)
    .eq('id', id)
    .eq('tenant_id', ACTIVE_TENANT_ID)
    .select()
    .single();

  if (error) throw new Error(`Engagement güncellenemedi: ${error.message}`);
  return data;
}

export async function deleteEngagement(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('audit_engagements')
    .delete()
    .eq('id', id)
    .eq('tenant_id', ACTIVE_TENANT_ID);

  if (error) throw new Error(`Engagement silinemedi: ${error.message}`);
  return true;
}

export async function getEngagementById(id: string): Promise<AuditEngagement | null> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', ACTIVE_TENANT_ID)
    .maybeSingle();

  if (error) throw new Error(`Engagement bulunamadı: ${error.message}`);
  return data;
}

export async function getAllEngagements(planId?: string): Promise<AuditEngagement[]> {
  let query = supabase
    .from('audit_engagements')
    .select('*')
    .eq('tenant_id', ACTIVE_TENANT_ID);

  if (planId) {
    query = query.eq('plan_id', planId);
  }

  const { data, error } = await query.order('start_date', { ascending: false });

  if (error) throw new Error(`Engagement listesi alınamadı: ${error.message}`);
  return data || [];
}
