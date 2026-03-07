import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface PBCRequest {
  id: string;
  engagement_id: string | null;
  title: string;
  description: string;
  requested_from: string;
  assigned_to: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePBCRequestInput {
  title: string;
  description: string;
  requested_from: string;
  priority: PBCRequest['priority'];
  due_date: string | null;
  engagement_id: string | null;
}

export const pbcKeys = {
  all: ['pbc-requests'] as const,
  byEngagement: (engagementId: string | null) => ['pbc-requests', engagementId] as const,
};

export function usePBCRequests(engagementId?: string | null) {
  return useQuery({
    queryKey: pbcKeys.byEngagement(engagementId || null),
    queryFn: async () => {
      let query = supabase
        .from('pbc_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (engagementId) {
        query = query.eq('engagement_id', engagementId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Failed to fetch PBC requests:', error);
        return [];
      }
      return (data as PBCRequest[]) || [];
    },
  });
}

export function useCreatePBCRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePBCRequestInput) => {
      const { data, error } = await supabase.from('pbc_requests').insert({
        title: input.title,
        description: input.description,
        requested_from: input.requested_from,
        priority: input.priority,
        due_date: input.due_date || null,
        engagement_id: input.engagement_id || null,
        status: 'PENDING',
      }).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pbcKeys.all });
    },
  });
}

export function useUpdatePBCStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PBCRequest['status'] }) => {
      const { data, error } = await supabase
        .from('pbc_requests')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pbcKeys.all });
    },
  });
}

export function useUploadPBC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, file }: { requestId: string; file: File }) => {
      const path = `evidence/${requestId}/${Date.now()}_${file.name}`;
      
      const { error: uploadErr } = await supabase.storage.from('evidence').upload(path, file);
      if (uploadErr) throw uploadErr;

      // Update status to IN_PROGRESS or SUBMITTED if pending
      await supabase
        .from('pbc_requests')
        .update({ status: 'SUBMITTED', updated_at: new Date().toISOString() })
        .eq('id', requestId);

      // Log the evidence
      const { error: evidenceErr } = await supabase.from('pbc_evidence').insert({
        pbc_request_id: requestId,
        file_name: file.name,
        file_path: path,
        file_size_bytes: file.size,
      });
      if (evidenceErr) throw evidenceErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pbcKeys.all });
    },
  });
}
