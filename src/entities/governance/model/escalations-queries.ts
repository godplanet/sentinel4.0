import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEscalations, createEscalation, updateEscalationStatus } from '../api/escalations';
import { CreateEscalationInput } from './types';

export const escalationKeys = {
  all: ['escalations'] as const,
  lists: () => [...escalationKeys.all, 'list'] as const,
  list: (filters: string) => [...escalationKeys.lists(), { filters }] as const,
  details: () => [...escalationKeys.all, 'detail'] as const,
  detail: (id: string) => [...escalationKeys.details(), id] as const,
};

export function useEscalations(filters?: { status?: string; finding_id?: string }) {
  return useQuery({
    queryKey: escalationKeys.list(JSON.stringify(filters || {})),
    queryFn: async () => {
      try {
        const result = await fetchEscalations(filters);
        // Extreme Defensive Programming: double ensure safe mapping at the query layer
        return (result || []).map(item => ({
          ...item,
          risk_score: item?.risk_score || 1,
          board_decision: item?.board_decision ?? 'Karar Bekleniyor',
          title: item?.title ?? 'İsimsiz',
          description: item?.description ?? 'Açıklama Yok',
        }));
      } catch (error) {
        console.error('Failed to fetch escalations:', error);
        return [];
      }
    },
  });
}

export function useEscalateFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateEscalationInput) => {
      // Defensive defaults before passing to API
      const safeInput = {
        ...input,
        risk_score: input?.risk_score || 1,
        title: input?.title ?? 'İsimsiz',
        description: input?.description ?? 'Açıklama belirtilmemiş'
      };
      return createEscalation(safeInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: escalationKeys.lists() });
    },
    onError: (error) => {
      console.error('Escalation failed', error);
      // Preventing crash on mutation hook error by logging
    }
  });
}

export function useUpdateEscalation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, boardDecision }: { id: string; status: string; boardDecision?: string }) => {
      if (!id) {
        console.warn('Escalation ID is required');
        return null;
      }
      return updateEscalationStatus(id, status, boardDecision);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: escalationKeys.lists() });
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: escalationKeys.detail(variables.id) });
      }
    },
    onError: (error) => {
      console.error('Update escalation failed', error);
    }
  });
}
