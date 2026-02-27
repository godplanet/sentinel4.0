import { supabase } from '@/shared/api/supabase';
import type { SystemParameterRow } from '@/shared/types/database.types';

export async function fetchSystemParameters(): Promise<SystemParameterRow[]> {
  const { data, error } = await supabase
    .from('system_parameters')
    .select('*')
    .order('category', { ascending: true });

  if (error) throw error;
  return data || [];
}
