import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

export interface ComplianceFramework {
  id: string;
  tenant_id: string;
  name: string;
  short_code: string | null;
  version: string | null;
  description: string | null;
  authority: string | null;
  effective_date: string | null;
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  created_at: string;
  updated_at: string;
}

export interface FrameworkRequirement {
  id: string;
  tenant_id: string;
  framework_id: string;
  code: string;
  title: string;
  description: string;
  category: string | null;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
  updated_at: string;
}

export interface ControlMapping {
  id: string;
  tenant_id: string;
  control_ref: string;
  control_title: string;
  requirement_id: string;
  coverage_strength: 'FULL' | 'PARTIAL' | 'WEAK';
  match_score: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequirementWithMappings extends FrameworkRequirement {
  mappings: ControlMapping[];
}

export interface FrameworkCoverageStats {
  framework_id: string;
  tenant_id: string;
  name: string;
  short_code: string;
  authority: string;
  status: string;
  total_requirements: number;
  covered_requirements: number;
  gap_count: number;
  coverage_pct: number;
  avg_match_score: number;
}

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

export function useFrameworks() {
  return useQuery({
    queryKey: ['compliance-frameworks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compliance_frameworks')
        .select('*')
        .eq('status', 'ACTIVE')
        .order('authority', { ascending: true })
        .order('name', { ascending: true });
      if (error) throw error;
      return data as ComplianceFramework[];
    },
  });
}

export function useFrameworkCoverage() {
  return useQuery({
    queryKey: ['framework-coverage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('framework_coverage_stats')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data || []) as FrameworkCoverageStats[];
    },
  });
}

export function useFrameworkRequirements(frameworkId?: string) {
  return useQuery({
    queryKey: ['framework-requirements', frameworkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('framework_requirements')
        .select('*')
        .eq('framework_id', frameworkId!)
        .order('code', { ascending: true });
      if (error) throw error;
      return data as FrameworkRequirement[];
    },
    enabled: !!frameworkId,
  });
}

export function useRequirementMappings(requirementIds: string[]) {
  return useQuery({
    queryKey: ['requirement-mappings', requirementIds],
    queryFn: async () => {
      if (!requirementIds.length) return [];
      const { data, error } = await supabase
        .from('control_requirement_mappings')
        .select('*')
        .in('requirement_id', requirementIds);
      if (error) throw error;
      return (data || []) as ControlMapping[];
    },
    enabled: requirementIds.length > 0,
  });
}

export function useCreateMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      control_ref: string;
      control_title: string;
      requirement_id: string;
      coverage_strength: 'FULL' | 'PARTIAL' | 'WEAK';
      match_score: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('control_requirement_mappings')
        .insert({ tenant_id: TENANT_ID, ...input })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['framework-coverage'] });
      qc.invalidateQueries({ queryKey: ['requirement-mappings'] });
      qc.invalidateQueries({ queryKey: ['framework-requirements'] });
    },
  });
}

export function useDeleteMapping() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('control_requirement_mappings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['framework-coverage'] });
      qc.invalidateQueries({ queryKey: ['requirement-mappings'] });
      qc.invalidateQueries({ queryKey: ['framework-requirements'] });
    },
  });
}
