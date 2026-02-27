import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ============================================
// TYPES
// ============================================

export interface LibraryProcess {
  id: string;
  code: string;
  title: string;
  description: string | null;
  risk_weight: number;
  process_type: 'PRIMARY' | 'SUPPORT' | 'MANAGEMENT' | null;
  industry_vertical: string | null;
  frameworks: string[];
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibraryRisk {
  id: string;
  process_id: string;
  risk_code: string | null;
  risk_title: string;
  description: string;
  risk_category: string | null;
  risk_subcategory: string | null;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_type: 'STRATEGIC' | 'OPERATIONAL' | 'FINANCIAL' | 'COMPLIANCE' | 'REPUTATIONAL' | 'TECHNOLOGY' | null;
  potential_impact: string | null;
  default_inherent_impact: number | null;
  default_inherent_likelihood: number | null;
  default_inherent_volume: number | null;
  bddk_reference: string | null;
  iso27001_reference: string | null;
  cobit_reference: string | null;
  masak_reference: string | null;
  sox_reference: string | null;
  tags: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibraryControl {
  id: string;
  risk_id: string;
  code: string;
  title: string;
  description: string;
  control_objective: string | null;
  control_type: 'Preventive' | 'Detective' | 'Corrective' | 'Directive';
  automation_type: 'Manual' | 'Automated' | 'IT-Dependent' | 'Hybrid';
  frequency: 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Event-Driven';
  is_key_control: boolean;
  control_nature: 'MANUAL' | 'AUTOMATED' | 'HYBRID' | null;
  control_category: string | null;
  control_owner_role: string | null;
  responsible_department: string | null;
  default_design_rating: number | null;
  default_operating_rating: number | null;
  testing_procedure: string | null;
  test_frequency: string | null;
  evidence_requirements: string | null;
  framework_references: Record<string, any>;
  tags: string[];
  custom_attributes: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProcessDTO {
  code: string;
  title: string;
  description?: string;
  risk_weight?: number;
  process_type?: 'PRIMARY' | 'SUPPORT' | 'MANAGEMENT';
  industry_vertical?: string;
  frameworks?: string[];
  tags?: string[];
}

export interface CreateRiskDTO {
  process_id: string;
  risk_code?: string;
  risk_title: string;
  description: string;
  risk_category?: string;
  risk_subcategory?: string;
  risk_level?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  risk_type?: 'STRATEGIC' | 'OPERATIONAL' | 'FINANCIAL' | 'COMPLIANCE' | 'REPUTATIONAL' | 'TECHNOLOGY';
  potential_impact?: string;
  default_inherent_impact?: number;
  default_inherent_likelihood?: number;
  default_inherent_volume?: number;
  bddk_reference?: string;
  iso27001_reference?: string;
  cobit_reference?: string;
  masak_reference?: string;
  sox_reference?: string;
  tags?: string[];
}

export interface CreateControlDTO {
  risk_id: string;
  code: string;
  title: string;
  description: string;
  control_objective?: string;
  control_type: 'Preventive' | 'Detective' | 'Corrective' | 'Directive';
  automation_type: 'Manual' | 'Automated' | 'IT-Dependent' | 'Hybrid';
  frequency: 'Continuous' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Event-Driven';
  is_key_control?: boolean;
  control_nature?: 'MANUAL' | 'AUTOMATED' | 'HYBRID';
  control_category?: string;
  control_owner_role?: string;
  responsible_department?: string;
  default_design_rating?: number;
  default_operating_rating?: number;
  testing_procedure?: string;
  test_frequency?: string;
  evidence_requirements?: string;
  framework_references?: Record<string, any>;
  tags?: string[];
  custom_attributes?: Record<string, any>;
}

// ============================================
// PROCESSES
// ============================================

export function useLibraryProcesses() {
  return useQuery({
    queryKey: ['library-processes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('library_processes')
        .select('*')
        .eq('is_active', true)
        .order('code');

      if (error) throw error;
      return data as LibraryProcess[];
    },
  });
}

export function useCreateProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateProcessDTO) => {
      const { data, error } = await supabase
        .from('library_processes')
        .insert([dto])
        .select()
        .single();

      if (error) throw error;
      return data as LibraryProcess;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-processes'] });
    },
  });
}

export function useUpdateProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LibraryProcess> & { id: string }) => {
      const { data, error } = await supabase
        .from('library_processes')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LibraryProcess;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-processes'] });
    },
  });
}

export function useDeleteProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('library_processes')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-processes'] });
    },
  });
}

// ============================================
// RISKS
// ============================================

export function useLibraryRisks(processId?: string) {
  return useQuery({
    queryKey: ['library-risks', processId],
    queryFn: async () => {
      let query = supabase
        .from('library_risks')
        .select('*')
        .eq('is_active', true);

      if (processId) {
        query = query.eq('process_id', processId);
      }

      const { data, error } = await query.order('risk_code');

      if (error) throw error;
      return data as LibraryRisk[];
    },
    enabled: processId !== undefined,
  });
}

export function useCreateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateRiskDTO) => {
      const { data, error } = await supabase
        .from('library_risks')
        .insert([dto])
        .select()
        .single();

      if (error) throw error;
      return data as LibraryRisk;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-risks'] });
    },
  });
}

export function useUpdateRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LibraryRisk> & { id: string }) => {
      const { data, error } = await supabase
        .from('library_risks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LibraryRisk;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-risks'] });
    },
  });
}

export function useDeleteRisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('library_risks')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-risks'] });
    },
  });
}

// ============================================
// CONTROLS
// ============================================

export function useLibraryControls(riskId?: string) {
  return useQuery({
    queryKey: ['library-controls', riskId],
    queryFn: async () => {
      let query = supabase
        .from('library_controls')
        .select('*')
        .eq('is_active', true);

      if (riskId) {
        query = query.eq('risk_id', riskId);
      }

      const { data, error } = await query.order('code');

      if (error) throw error;
      return data as LibraryControl[];
    },
    enabled: riskId !== undefined,
  });
}

export function useCreateControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateControlDTO) => {
      const { data, error } = await supabase
        .from('library_controls')
        .insert([dto])
        .select()
        .single();

      if (error) throw error;
      return data as LibraryControl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-controls'] });
    },
  });
}

export function useUpdateControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LibraryControl> & { id: string }) => {
      const { data, error } = await supabase
        .from('library_controls')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as LibraryControl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-controls'] });
    },
  });
}

export function useDeleteControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('library_controls')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-controls'] });
    },
  });
}

// ============================================
// IMPORT TO ENGAGEMENT (Critical Function)
// ============================================

export function useImportToEngagement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      engagementId,
      controlIds
    }: {
      engagementId: string;
      controlIds: string[]
    }) => {
      const { data: controls, error: fetchError } = await supabase
        .from('library_controls')
        .select(`
          *,
          library_risks!inner (
            risk_title,
            risk_code,
            description,
            risk_category,
            default_inherent_impact,
            default_inherent_likelihood,
            library_processes!inner (
              code,
              title
            )
          )
        `)
        .in('id', controlIds);

      if (fetchError) throw fetchError;
      if (!controls || controls.length === 0) {
        throw new Error('No controls found');
      }

      const auditSteps = controls.map((control: any) => ({
        audit_id: engagementId,
        step_code: control.code,
        step_title: control.title,
        step_description: control.description,
        step_type: 'CONTROL_TEST' as const,
        control_type: control.control_type?.toUpperCase(),
        control_frequency: control.frequency?.toUpperCase(),
        control_automation: control.automation_type?.toUpperCase(),
        is_key_control: control.is_key_control,
        status: 'NOT_STARTED' as const,
        assigned_to: null,
        estimated_hours: null,
        notes: `Imported from Library: ${control.library_risks?.library_processes?.code} > ${control.library_risks?.risk_code || 'Risk'}\n\nControl Objective: ${control.control_objective || 'N/A'}\n\nTesting Procedure: ${control.testing_procedure || 'To be defined'}`,
        custom_fields: {
          library_control_id: control.id,
          library_risk_id: control.risk_id,
          process_code: control.library_risks?.library_processes?.code,
          risk_title: control.library_risks?.risk_title,
          control_owner_role: control.control_owner_role,
          responsible_department: control.responsible_department,
          framework_references: control.framework_references,
        },
      }));

      const { data, error: insertError } = await supabase
        .from('audit_steps')
        .insert(auditSteps)
        .select();

      if (insertError) throw insertError;
      return { imported: data.length, steps: data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-steps'] });
    },
  });
}

// ============================================
// SEARCH FUNCTION
// ============================================

export function useSearchControls(params?: {
  control_type?: string;
  automation_type?: string;
  frequency?: string;
  key_only?: boolean;
}) {
  return useQuery({
    queryKey: ['search-library-controls', params],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('search_library_controls', {
          p_control_type: params?.control_type || null,
          p_automation_type: params?.automation_type || null,
          p_frequency: params?.frequency || null,
          p_key_only: params?.key_only || false,
        });

      if (error) throw error;
      return data;
    },
  });
}
