import { supabase } from '@/shared/api/supabase';

export interface PulseResponse {
  id: string;
  user_id: string;
  energy_level: number;
  stress_factor: 'LOW' | 'NORMAL' | 'HIGH';
  notes: string | null;
  week_key: string;
  created_at: string;
}

export interface PulseSubmission {
  user_id: string;
  energy_level: number;
  stress_factor: 'LOW' | 'NORMAL' | 'HIGH';
  notes?: string;
  week_key: string;
}

export function getISOWeekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

export async function submitPulse(payload: PulseSubmission): Promise<void> {
  const { error } = await supabase
    .from('pulse_responses')
    .upsert(payload, { onConflict: 'user_id,week_key' });
  if (error) throw error;
}

export async function hasSubmittedThisWeek(userId: string): Promise<boolean> {
  const weekKey = getISOWeekKey();
  const { data } = await supabase
    .from('pulse_responses')
    .select('id')
    .eq('user_id', userId)
    .eq('week_key', weekKey)
    .maybeSingle();
  return !!data;
}

export async function fetchTeamPulse(weekKey?: string): Promise<PulseResponse[]> {
  const key = weekKey ?? getISOWeekKey();
  const { data, error } = await supabase
    .from('pulse_responses')
    .select('*')
    .eq('week_key', key)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PulseResponse[];
}

export async function fetchRecentPulse(userId: string, limit = 8): Promise<PulseResponse[]> {
  const { data, error } = await supabase
    .from('pulse_responses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as PulseResponse[];
}
