/**
 * GIAS 2.2 Bağımsızlık Duvarı — Danışmanlık Çin Seddi
 * Denetçi atama sürecinde bağımsızlık ihlali kontrolü için API fonksiyonları.
 */

import { supabase } from '@/shared/api/supabase';

export interface AuditorProfileRow {
  user_id: string;
  title: string | null;
  department: string | null;
  skills_matrix: Record<string, unknown>;
  cpe_credits: number;
  full_name: string;
  email: string;
}

export interface IndependenceConflictRow {
  auditor_id: string;
  entity_id: string;
  engagement_end_date: string;
  cooling_off_expires_at: string;
}

/**
 * Tüm denetçi profillerini user_profiles ile birleştirerek döndürür.
 */
export async function fetchAuditorProfiles(): Promise<AuditorProfileRow[]> {
  const { data, error } = await supabase
    .from('auditor_profiles')
    .select(`
      user_id,
      title,
      department,
      skills_matrix,
      cpe_credits,
      user_profiles!inner(full_name, email)
    `)
    .order('user_id');

  if (error) throw error;

  return (data ?? []).map((row) => {
    const profile = row.user_profiles as { full_name: string; email: string } | null;
    return {
      user_id: row.user_id,
      title: row.title,
      department: row.department,
      skills_matrix: (row.skills_matrix ?? {}) as Record<string, unknown>,
      cpe_credits: row.cpe_credits ?? 0,
      full_name: profile?.full_name ?? 'İsimsiz Denetçi',
      email: profile?.email ?? '',
    };
  });
}

/**
 * GIAS 2.2 — Bir denetçinin belirtilen entity ID'lerle aktif soğuma süresi çakışmalarını getirir.
 * `independence_conflict_log` tablosunun `cooling_off_expires_at` >= bugün olan kayıtlarını döndürür.
 */
export async function fetchAdvisoryConflicts(
  auditorId: string,
  entityIds: string[],
): Promise<IndependenceConflictRow[]> {
  if (!auditorId || entityIds.length === 0) return [];

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('independence_conflict_log')
    .select('auditor_id, entity_id, engagement_end_date, cooling_off_expires_at')
    .eq('auditor_id', auditorId)
    .in('entity_id', entityIds)
    .gte('cooling_off_expires_at', today);

  if (error) {
    console.warn('independence_conflict_log sorgusu başarısız:', error.message);
    return [];
  }

  return (data ?? []) as IndependenceConflictRow[];
}
