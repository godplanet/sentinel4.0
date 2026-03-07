import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export const ESCALATION_KEYS = {
  all: ['finding_escalations'] as const,
};

export type EscalationLevel = 'CAE' | 'AUDIT_COMMITTEE' | 'BOARD_OF_DIRECTORS';
export type EscalationStatus = 'REVIEWING' | 'ESCALATED_TO_BOARD' | 'RETURNED_FOR_ACTION' | 'CLOSED';

export interface AuditFindingDetails {
  id: string;
  title: string;
  description: string;
  kerd_base_score?: number;
  severity?: string;
  status?: string;
}

export interface FindingEscalation {
  id: string;
  tenant_id: string;
  finding_id: string;
  status: EscalationStatus;
  escalation_level: EscalationLevel;
  reason: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  finding?: AuditFindingDetails; // Joined finding data
  logs?: any[]; 
}

/**
 * Fetches taking all pending and active escalations.
 */
export async function fetchEscalations(): Promise<FindingEscalation[]> {
  const { data, error } = await supabase
    .from('escalations')
    .select(`
      *,
      finding:audit_findings (
        id, title, description, kerd_base_score, severity, status
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[SENTINEL] Error fetching escalations:', error);
    return [];
  }

  return (data || []) as FindingEscalation[];
}

export function useFindingEscalations() {
  return useQuery({
    queryKey: ESCALATION_KEYS.all,
    queryFn: fetchEscalations,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * CAE Decision Action: Updates the escalation status and logs the action
 */
export function useUpdateEscalationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, decision, notes, actorId }: { id: string; decision: string; notes: string; actorId?: string }) => {
      // Find current user id if not provided (fallback mechanism)
      let resolvedActorId = actorId;
      if (!resolvedActorId) {
        // Test environment fallback
        const localUser = localStorage.getItem('sentinel_user');
        if (localUser) {
          resolvedActorId = JSON.parse(localUser).id;
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          resolvedActorId = user?.id;
        }
      }

      if (!resolvedActorId) {
         throw new Error('Kullanıcı bulunamadı');
      }

      // Update escalation
      const { error: updateError } = await supabase
        .from('escalations')
        .update({ status: decision, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      // Log action
      const { error: logError } = await supabase
        .from('escalation_logs')
        .insert({
          escalation_id: id,
          actor_id: resolvedActorId,
          action_type: decision,
          notes,
        });

      if (logError) throw logError;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ESCALATION_KEYS.all });
    },
  });
}
