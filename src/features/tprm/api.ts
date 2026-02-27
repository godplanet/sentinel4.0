import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface TPRMVendor {
  id: string;
  tenant_id: string;
  name: string;
  category: string | null;
  risk_tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  criticality_score: number;
  status: 'Active' | 'Inactive' | 'Under Review' | 'Terminated';
  contact_person: string | null;
  email: string | null;
  contract_start: string | null;
  contract_end: string | null;
  last_audit_date: string | null;
  country: string | null;
  data_access_level: 'None' | 'Limited' | 'Full';
  notes: string | null;
  created_at: string;
}

export interface TPRMVendorSummary extends TPRMVendor {
  total_assessments: number;
  completed_assessments: number;
  active_assessments: number;
  avg_risk_score: number;
  last_assessment_date: string | null;
}

export interface TPRMAssessment {
  id: string;
  tenant_id: string;
  vendor_id: string;
  title: string;
  status: 'Draft' | 'Sent' | 'In Progress' | 'Completed' | 'Review Needed';
  risk_score: number | null;
  due_date: string | null;
  completed_at: string | null;
  assessor: string | null;
  created_at: string;
}

export interface TPRMAnswer {
  id: string;
  tenant_id: string;
  assessment_id: string;
  question_text: string;
  vendor_response: string | null;
  ai_grade_score: number | null;
  ai_grade_rationale: string | null;
  category: string | null;
  created_at: string;
}

export function useVendors() {
  return useQuery({
    queryKey: ['tprm-vendors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tprm_vendor_summary')
        .select('*')
        .order('criticality_score', { ascending: false });
      if (error) throw error;
      return (data || []) as TPRMVendorSummary[];
    },
  });
}

export function useVendor(id?: string) {
  return useQuery({
    queryKey: ['tprm-vendor', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tprm_vendor_summary')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data as TPRMVendorSummary | null;
    },
    enabled: !!id,
  });
}

export function useVendorAssessments(vendorId?: string) {
  return useQuery({
    queryKey: ['tprm-assessments', vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tprm_assessments')
        .select('*')
        .eq('vendor_id', vendorId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as TPRMAssessment[];
    },
    enabled: !!vendorId,
  });
}

export function useAssessmentAnswers(assessmentId?: string) {
  return useQuery({
    queryKey: ['tprm-answers', assessmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tprm_assessment_answers')
        .select('*')
        .eq('assessment_id', assessmentId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as TPRMAnswer[];
    },
    enabled: !!assessmentId,
  });
}

export function useUpdateAnswer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      assessment_id: string;
      ai_grade_score: number;
      ai_grade_rationale: string;
    }) => {
      const { data, error } = await supabase
        .from('tprm_assessment_answers')
        .update({
          ai_grade_score: input.ai_grade_score,
          ai_grade_rationale: input.ai_grade_rationale,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tprm-answers', vars.assessment_id] });
    },
  });
}

export function useUpdateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string } & Partial<Pick<TPRMVendor, 'status' | 'risk_tier' | 'criticality_score' | 'notes'>>) => {
      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from('tprm_vendors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tprm-vendors'] });
      qc.invalidateQueries({ queryKey: ['tprm-vendor'] });
    },
  });
}

export function useUpdateAssessmentScore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; vendor_id: string; risk_score: number; status?: string }) => {
      const update: Record<string, unknown> = {
        risk_score: input.risk_score,
        updated_at: new Date().toISOString(),
      };
      if (input.status) update.status = input.status;
      const { data, error } = await supabase
        .from('tprm_assessments')
        .update(update)
        .eq('id', input.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['tprm-assessments', vars.vendor_id] });
      qc.invalidateQueries({ queryKey: ['tprm-vendors'] });
      qc.invalidateQueries({ queryKey: ['tprm-vendor'] });
    },
  });
}
