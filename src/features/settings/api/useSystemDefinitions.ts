import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface SystemDefinition {
  id: string;
  tenant_id: string;
  category: string;
  code: string;
  label: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSystemDefinitions = (category?: string) => {
  return useQuery({
    queryKey: ['system-definitions', category],
    queryFn: async () => {
      let query = supabase
        .from('system_definitions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as SystemDefinition[];
    },
  });
};

export const useUpdateDefinition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      label,
      color,
    }: {
      id: string;
      label: string;
      color: string;
    }) => {
      const { data, error } = await supabase
        .from('system_definitions')
        .update({
          label,
          color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-definitions'] });
    },
  });
};
