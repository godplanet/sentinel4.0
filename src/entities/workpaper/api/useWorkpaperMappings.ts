import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { ApprovalStatus } from '@/widgets/WorkpaperGrid';

export interface WorkpaperMapping {
  id: string;
  approval_status: ApprovalStatus;
}

export function useWorkpaperMappings() {
  return useQuery({
    queryKey: ['workpaper-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workpapers')
        .select('id, approval_status, data');

      if (error) throw error;
      if (!data) return {};

      const map: Record<string, WorkpaperMapping> = {};
      for (const wp of data) {
        const controlRef = (wp.data as Record<string, unknown> | null)?.control_ref as string | undefined;
        if (controlRef) {
          map[controlRef] = {
            id: wp.id,
            approval_status: (wp.approval_status as ApprovalStatus) || 'in_progress',
          };
        }
      }
      return map;
    }
  });
}