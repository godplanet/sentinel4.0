import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type {
  AdvisoryRequest, AdvisoryEngagement, AdvisoryInsight,
} from './types';

export function useAdvisoryRequests() {
  return useQuery({
    queryKey: ['advisory-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisory_requests')
        .select('*, audit_entities(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map((r: Record<string, unknown>) => ({
        ...r,
        department_name: (r.audit_entities as { name: string } | null)?.name ?? null,
      })) as AdvisoryRequest[];
    },
  });
}

export function useCreateAdvisoryRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Pick<AdvisoryRequest, 'title' | 'problem_statement' | 'desired_outcome' | 'department_id'>) => {
      const { data, error } = await supabase
        .from('advisory_requests')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisory-requests'] });
    },
  });
}

export function useUpdateAdvisoryRequestStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AdvisoryRequest['status'] }) => {
      const { error } = await supabase
        .from('advisory_requests')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisory-requests'] });
    },
  });
}

export function useAdvisoryEngagements() {
  return useQuery({
    queryKey: ['advisory-engagements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisory_engagements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AdvisoryEngagement[];
    },
  });
}

export function useAdvisoryEngagement(id: string | undefined) {
  return useQuery({
    queryKey: ['advisory-engagement', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisory_engagements')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data as AdvisoryEngagement | null;
    },
  });
}

export function useCreateAdvisoryEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<AdvisoryEngagement, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('advisory_engagements')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisory-engagements'] });
      qc.invalidateQueries({ queryKey: ['advisory-requests'] });
    },
  });
}

export function useUpdateAdvisoryEngagement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdvisoryEngagement> & { id: string }) => {
      const { error } = await supabase
        .from('advisory_engagements')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisory-engagements'] });
      qc.invalidateQueries({ queryKey: ['advisory-engagement'] });
    },
  });
}

export function useAdvisoryInsights(engagementId: string | undefined) {
  return useQuery({
    queryKey: ['advisory-insights', engagementId],
    enabled: !!engagementId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advisory_insights')
        .select('*')
        .eq('engagement_id', engagementId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as AdvisoryInsight[];
    },
  });
}

export function useCreateAdvisoryInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Pick<AdvisoryInsight, 'engagement_id' | 'title' | 'observation' | 'recommendation' | 'impact_level'>) => {
      const { data, error } = await supabase
        .from('advisory_insights')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisory-insights'] });
    },
  });
}

export function useUpdateAdvisoryInsight() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AdvisoryInsight> & { id: string }) => {
      const { error } = await supabase
        .from('advisory_insights')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advisory-insights'] });
    },
  });
}
