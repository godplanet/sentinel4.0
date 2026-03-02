import { supabase } from '@/shared/api/supabase';

export interface TimeLog {
  id: string;
  workpaper_id: string;
  user_id: string;
  hours_spent: number;
  activity_date: string;
  description: string;
  created_at: string;
}

export interface TimeLogSummary {
  total_hours: number;
  total_entries: number;
  contributors: number;
  avg_hours_per_day: number;
}

export async function fetchTimeLogs(workpaperId: string): Promise<TimeLog[]> {
  const { data, error } = await supabase
    .from('time_logs')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('activity_date', { ascending: false });

  if (error) throw error;
  return data as TimeLog[];
}

export async function fetchTimeLogsRecent(workpaperId: string): Promise<TimeLog[]> {
  const { data, error } = await supabase
    .from('time_logs')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data as TimeLog[];
}

export async function fetchWorkpaperTotalHours(workpaperId: string): Promise<number> {
  const { data, error } = await supabase
    .from('workpapers')
    .select('total_hours_spent')
    .eq('id', workpaperId)
    .single();

  if (error) throw error;
  return data?.total_hours_spent || 0;
}

export async function fetchWorkpaperTimeSummary(workpaperId: string): Promise<TimeLogSummary> {
  const { data, error } = await supabase
    .rpc('get_workpaper_time_summary', { p_workpaper_id: workpaperId })
    .single();

  if (error) throw error;
  return data as TimeLogSummary;
}

export async function addTimeLog(params: {
  workpaperId: string;
  hours_spent: number;
  activity_date: string;
  description: string;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('time_logs').insert([{
    workpaper_id: params.workpaperId,
    user_id: user.id,
    hours_spent: params.hours_spent,
    activity_date: params.activity_date,
    description: params.description,
  }]);

  if (error) throw error;
}

export async function logTimeEntry(params: {
  workpaperId: string;
  hours_spent: number;
}): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('time_logs').insert([{
    workpaper_id: params.workpaperId,
    user_id: user.id,
    hours_spent: params.hours_spent,
    activity_date: new Date().toISOString().split('T')[0],
  }]);

  if (error) throw error;
}

export async function deleteTimeLog(logId: string): Promise<void> {
  const { error } = await supabase.from('time_logs').delete().eq('id', logId);
  if (error) throw error;
}
