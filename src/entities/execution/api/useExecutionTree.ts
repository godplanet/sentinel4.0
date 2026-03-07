import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export function useExecutionTree() {
  return useQuery({
    queryKey: ['execution-risk-tree'],
    queryFn: async () => {
      // FSD & Gerçek Veri Kuralı: Mock veriler silindi, doğrudan Supabase'den beslenir.
      const { data, error } = await supabase.from('audit_entities').select('*');
      if (error) throw error;
      return data || [];
    },
  });
}
