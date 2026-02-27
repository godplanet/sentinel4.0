import { supabase } from '@/shared/api/supabase';
import type { AuditEngagementRow, AuditEntityRow, AuditPlanRow } from '@/shared/types/database.types';

export async function fetchEngagementsList(): Promise<AuditEngagementRow[]> {
  const { data, error } = await supabase
    .from('audit_engagements')
    .select('*')
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchEntitiesSimple(): Promise<AuditEntityRow[]> {
  const { data, error } = await supabase
    .from('audit_entities')
    .select('id, name, risk_score')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function fetchActivePlan(): Promise<AuditPlanRow | null> {
  const { data, error } = await supabase
    .from('audit_plans')
    .select('id, title, period_start, period_end')
    .eq('status', 'APPROVED')
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function fetchInvestigations() {
  const { data, error } = await supabase
    .from('investigations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
