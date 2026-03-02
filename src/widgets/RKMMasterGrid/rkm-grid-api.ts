import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface RkmGridUpdatePayload {
  id: string;
  field: string;
  value: string | number | null;
}

/**
 * rkm_risks tablosundaki tek bir hücreyi günceller.
 * GENERATED ALWAYS AS (computed) alanları (inherent_score, residual_score, vb.) hariç.
 */
export async function updateRkmRiskCell(payload: RkmGridUpdatePayload): Promise<void> {
  const { id, field, value } = payload;
  const { error } = await supabase
    .from('rkm_risks')
    .update({ [field]: value })
    .eq('id', id);
  if (error) throw error;
}

export const COMPUTED_FIELDS = new Set([
  'inherent_score',
  'inherent_rating',
  'control_effectiveness',
  'residual_score',
  'residual_rating',
]);

export function useRkmCellUpdate(queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRkmRiskCell,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey as string[] });
    },
  });
}
