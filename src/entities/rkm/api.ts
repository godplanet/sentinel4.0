import { supabase } from '@/shared/api/supabase';
import type { RkmProcessRow, RkmRiskRow } from '@/shared/types/database.types';

export async function fetchRkmCategories(): Promise<RkmProcessRow[]> {
  const { data, error } = await supabase
    .from('rkm_processes')
    .select('*')
    .eq('level', 1)
    .order('process_code');

  if (error) throw error;
  return data || [];
}

export async function fetchRkmRisksByProcess(processName: string): Promise<RkmRiskRow[]> {
  const { data, error } = await supabase
    .from('rkm_risks')
    .select('residual_rating')
    .eq('main_process', processName);

  if (error) throw error;
  return data || [];
}

export async function fetchRkmTotalRiskCount(): Promise<number> {
  const { count, error } = await supabase
    .from('rkm_risks')
    .select('*', { count: 'exact', head: true });

  if (error) throw error;
  return count || 0;
}
