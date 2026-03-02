import { supabase } from '@/shared/api/supabase';
import type { FindingHistory } from '../model/types';

/**
 * Belirtilen bulguna ait denetim izini (Audit Trail) finding_history tablosundan çeker.
 * En yeni kayıttan eskiye sıralı olarak döner.
 */
export async function fetchFindingHistory(findingId: string): Promise<FindingHistory[]> {
  const { data, error } = await supabase
    .from('finding_history')
    .select('*')
    .eq('finding_id', findingId)
    .order('changed_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
