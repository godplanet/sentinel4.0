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

export interface EngagementRow {
  id: string;
  title: string;
  audit_type: 'COMPREHENSIVE' | 'TARGETED' | 'FOLLOW_UP';
  start_date: string;
  end_date: string;
  status: string;
  estimated_hours: number;
  actual_hours: number;
  risk_snapshot_score: number;
  entity_id: string;
  audit_entities?: { entity_name: string } | null;
}

export async function fetchAnnualEngagements(year: number): Promise<EngagementRow[]> {
  const { data } = await supabase
    .from('audit_engagements')
    .select('*, audit_entities!inner(entity_name)')
    .lte('start_date', `${year}-12-31`)
    .gte('end_date', `${year}-01-01`)
    .order('start_date');
  return (data || []) as EngagementRow[];
}

export async function fetchInvestigations() {
  const { data, error } = await supabase
    .from('investigations')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/** Gantt taslak commit: Birden fazla görevin start_date/end_date değerlerini Supabase'e yazar. */
export interface UpdateEngagementDatesInput {
  engagement_id: string;
  start_date: string;
  end_date: string;
}

export async function updateEngagementDatesBatch(
  updates: UpdateEngagementDatesInput[]
): Promise<void> {
  if (updates.length === 0) return;
  const results = await Promise.all(
    updates.map(({ engagement_id, start_date, end_date }) =>
      supabase
        .from('audit_engagements')
        .update({
          start_date,
          end_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', engagement_id)
    )
  );
  const firstError = results.find((r) => r.error);
  if (firstError?.error) throw firstError.error;
}
