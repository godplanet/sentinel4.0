import { supabase } from '@/shared/api/supabase';
import type { UserCpeRecord } from '../types';

export interface CpeGoal {
  id: string;
  user_id: string;
  year: number;
  goal_hours: number;
}

export interface CreateCpeRecordPayload {
  user_id: string;
  title: string;
  provider: string;
  credit_hours: number;
  date_earned: string;
  notes?: string;
  evidence_url?: string;
}

export async function fetchCpeRecords(
  userId: string,
  year?: number
): Promise<UserCpeRecord[]> {
  let query = supabase
    .from('user_cpe_records')
    .select('*')
    .eq('user_id', userId)
    .order('date_earned', { ascending: false });

  if (year) {
    const start = `${year}-01-01`;
    const end   = `${year}-12-31`;
    query = query.gte('date_earned', start).lte('date_earned', end);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as UserCpeRecord[];
}

export async function createCpeRecord(
  payload: CreateCpeRecordPayload
): Promise<UserCpeRecord> {
  const { data, error } = await supabase
    .from('user_cpe_records')
    .insert(payload)
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Insert returned no data');
  return data as UserCpeRecord;
}

export async function deleteCpeRecord(id: string): Promise<void> {
  const { error } = await supabase.from('user_cpe_records').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchCpeGoal(
  userId: string,
  year: number
): Promise<CpeGoal | null> {
  const { data, error } = await supabase
    .from('cpe_annual_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('year', year)
    .maybeSingle();

  if (error) throw error;
  return data as CpeGoal | null;
}

export async function upsertCpeGoal(
  userId: string,
  year: number,
  goalHours: number
): Promise<CpeGoal> {
  const { data, error } = await supabase
    .from('cpe_annual_goals')
    .upsert({ user_id: userId, year, goal_hours: goalHours }, { onConflict: 'user_id,year' })
    .select()
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Upsert returned no data');
  return data as CpeGoal;
}

export async function fetchPassedAttempts(userId: string) {
  const { data, error } = await supabase
    .from('academy_attempts')
    .select(`
      id,
      score,
      passed,
      completed_at,
      xp_awarded,
      exam:academy_exams(
        id,
        title,
        course:academy_courses(id, title, category)
      )
    `)
    .eq('user_id', userId)
    .eq('passed', true)
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
