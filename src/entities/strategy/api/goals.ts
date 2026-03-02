import { supabase } from '@/shared/api/supabase';
import type { StrategicGoal, AuditObjectiveSimple } from '../model/types';

/**
 * strategic_bank_goals tablosundan stratejik hedefleri getirir.
 */
export async function fetchStrategicGoals(): Promise<StrategicGoal[]> {
  const { data, error } = await supabase
    .from('strategic_bank_goals')
    .select('id, title, description, progress, risk_appetite, linked_audit_objective_ids')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('fetchStrategicGoals: tablo erişim hatası, boş döndürülüyor.', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    progress: row.progress ?? 0,
    riskAppetite: (row.risk_appetite ?? 'Medium') as 'Low' | 'Medium' | 'High',
    linkedAuditObjectives: (row.linked_audit_objective_ids as string[]) ?? [],
  }));
}

/**
 * strategic_audit_objectives tablosundan denetim hedeflerini getirir.
 */
export async function fetchAuditObjectivesSimple(): Promise<AuditObjectiveSimple[]> {
  const { data, error } = await supabase
    .from('strategic_audit_objectives')
    .select('id, title, type, status')
    .order('created_at', { ascending: true });

  if (error) {
    console.warn('fetchAuditObjectivesSimple: tablo erişim hatası, boş döndürülüyor.', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    type: (row.type ?? 'Assurance') as 'Assurance' | 'Advisory',
    status: (row.status ?? 'On Track') as 'On Track' | 'At Risk' | 'Off Track',
  }));
}
