import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { CCMAlert, CCMTransaction } from '@/entities/ccm/types';

export function useCCMAlerts() {
  return useQuery({
    queryKey: ['ccm-alerts'],
    queryFn: async (): Promise<CCMAlert[]> => {
      const { data, error } = await supabase
        .from('ccm_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching CCM alerts:', error);
        throw error;
      }
      return data || [];
    },
    refetchInterval: 15_000, // Refresh every 15s to catch new anomalies
  });
}

export function useCCMTransactions(limit: number = 50) {
  return useQuery({
    queryKey: ['ccm-transactions', limit],
    queryFn: async (): Promise<CCMTransaction[]> => {
      const { data, error } = await supabase
        .from('ccm_transactions')
        .select('*')
        .order('transaction_date', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching CCM transactions:', error);
        throw error;
      }
      // Extremely defensive return
      return data || [];
    },
    refetchInterval: 15_000,
  });
}
