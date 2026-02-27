import { supabase } from '@/shared/api/supabase';
import type { CPERecordRow } from '@/shared/types/database.types';

export async function fetchCPERecords(): Promise<CPERecordRow[]> {
  const { data, error } = await supabase
    .from('cpe_records')
    .select('*')
    .order('completion_date', { ascending: false });

  if (error) throw error;
  return data || [];
}
