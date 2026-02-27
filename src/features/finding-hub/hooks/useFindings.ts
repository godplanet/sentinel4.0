import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import type { Finding, FindingSecret, ActionPlan, ComprehensiveFinding } from '@/entities/finding/model/types';

interface FindingFilters {
  status?: string[];
  risk_rating?: string[];
  assigned_auditee_id?: string;
  search?: string;
}

export function useFindings(filters?: FindingFilters) {
  return useQuery({
    queryKey: ['findings', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_findings')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status && filters.status.length > 0) {
        query = query.in('status', filters.status);
      }

      if (filters?.risk_rating && filters.risk_rating.length > 0) {
        query = query.in('risk_rating', filters.risk_rating);
      }

      if (filters?.assigned_auditee_id) {
        query = query.eq('assigned_auditee_id', filters.assigned_auditee_id);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,finding_code.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Finding[];
    },
  });
}

export function useFinding(id: string) {
  return useQuery({
    queryKey: ['finding', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_findings')
        .select(`
          *,
          action_plans (*)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as ComprehensiveFinding;
    },
    enabled: !!id,
  });
}

export function useFindingSecret(findingId: string, enabled: boolean = false) {
  return useQuery({
    queryKey: ['finding-secret', findingId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('finding_secrets')
        .select('*')
        .eq('finding_id', findingId)
        .maybeSingle();

      if (error) throw error;
      return data as FindingSecret | null;
    },
    enabled: !!findingId && enabled,
  });
}

export function useFindingKPIs() {
  return useQuery({
    queryKey: ['finding-kpis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_findings')
        .select('status, risk_rating');

      if (error) throw error;

      const findings = data || [];

      return {
        total: findings.length,
        critical: findings.filter((f: any) => f.risk_rating === 'HIGH').length,
        pendingApproval: findings.filter((f: any) => f.status === 'PENDING_APPROVAL').length,
        closed: findings.filter((f: any) => f.status === 'CLOSED').length,
      };
    },
  });
}

export function usePublishFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, description_public }: { id: string; description_public: string }) => {
      const { data, error } = await supabase
        .from('audit_findings')
        .update({
          status: 'PUBLISHED',
          description_public,
          published_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['finding-kpis'] });
    },
  });
}

export function useApproveActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionPlanId: string) => {
      const { data: plan, error: planError } = await supabase
        .from('action_plans')
        .update({ status: 'APPROVED' })
        .eq('id', actionPlanId)
        .select()
        .single();

      if (planError) throw planError;

      const { data, error } = await supabase
        .from('audit_findings')
        .update({ status: 'FOLLOW_UP' })
        .eq('id', plan.finding_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['finding', data.id] });
    },
  });
}

export function useRejectActionPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: plan, error: planError } = await supabase
        .from('action_plans')
        .update({ status: 'IN_REVIEW', auditor_rejection_reason: reason })
        .eq('id', id)
        .select()
        .single();

      if (planError) throw planError;

      const { data, error } = await supabase
        .from('audit_findings')
        .update({ status: 'NEGOTIATION' })
        .eq('id', plan.finding_id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['finding', data.id] });
    },
  });
}
