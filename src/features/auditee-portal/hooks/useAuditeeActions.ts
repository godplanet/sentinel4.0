import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

interface AcceptFindingPayload {
  findingId: string;
  planTitle: string;
  planDescription: string;
  responsiblePerson: string;
  targetDate: string;
  planDetails?: Record<string, any>;
}

interface DisputeFindingPayload {
  findingId: string;
  disputeReason: string;
}

export function useAcceptFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: AcceptFindingPayload) => {
      const { data: actionPlan, error: planError } = await supabase
        .from('action_plans')
        .insert({
          finding_id: payload.findingId,
          title: payload.planTitle,
          description: payload.planDescription,
          responsible_person: payload.responsiblePerson,
          target_date: payload.targetDate,
          status: 'IN_REVIEW',
          current_state: 'PROPOSED',
          plan_details: payload.planDetails || {},
          progress_percentage: 0,
        })
        .select()
        .single();

      if (planError) throw planError;

      const { data: finding, error: findingError } = await supabase
        .from('audit_findings')
        .update({
          status: 'PENDING_APPROVAL',
          negotiation_started_at: new Date().toISOString(),
        })
        .eq('id', payload.findingId)
        .select()
        .single();

      if (findingError) throw findingError;

      return { finding, actionPlan };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finding', data.finding.id] });
      queryClient.invalidateQueries({ queryKey: ['findings'] });
    },
  });
}

export function useDisputeFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DisputeFindingPayload) => {
      const { data, error } = await supabase
        .from('audit_findings')
        .update({
          status: 'DISPUTING',
          negotiation_started_at: new Date().toISOString(),
        })
        .eq('id', payload.findingId)
        .select()
        .single();

      if (error) throw error;

      const { error: commentError } = await supabase
        .from('finding_comments')
        .insert({
          finding_id: payload.findingId,
          comment_text: payload.disputeReason,
          comment_type: 'DISPUTE',
          author_role: 'AUDITEE',
        });

      if (commentError) throw commentError;

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finding', data.id] });
      queryClient.invalidateQueries({ queryKey: ['findings'] });
    },
  });
}

export function useUpdateActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<{
        description: string;
        target_date: string;
        progress_percentage: number;
        plan_details: Record<string, any>;
      }>;
    }) => {
      const { data, error } = await supabase
        .from('action_plans')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['finding', data.finding_id] });
    },
  });
}
