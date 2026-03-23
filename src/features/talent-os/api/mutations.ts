import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuditorTitle, Specialization } from '../types';
import { talentOsKeys } from './queries';

export interface CreateAuditorInput {
  full_name: string;
  title: AuditorTitle;
  department: string;
  specialization: Specialization;
  hourly_rate: number;
  is_available: boolean;
  total_xp?: number;
  current_level?: number;
  fatigue_score?: number;
  burnout_zone?: 'GREEN' | 'AMBER' | 'RED';
  active_hours_last_3_weeks?: number;
  travel_load?: number;
  consecutive_high_stress_projects?: number;
}

export interface UpdateAuditorInput extends Partial<CreateAuditorInput> {
  id: string;
}

export function useCreateAuditor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAuditorInput) => {
      const { data, error } = await supabase
        .from('talent_profiles')
        .insert({
          ...input,
          tenant_id: ACTIVE_TENANT_ID,
          total_xp: input.total_xp ?? 0,
          current_level: input.current_level ?? 1,
          fatigue_score: input.fatigue_score ?? 0,
          burnout_zone: input.burnout_zone ?? 'GREEN',
          active_hours_last_3_weeks: input.active_hours_last_3_weeks ?? 0,
          travel_load: input.travel_load ?? 0,
          consecutive_high_stress_projects: input.consecutive_high_stress_projects ?? 0,
          currency: 'TRY',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: talentOsKeys.profiles() }),
  });
}

export function useUpdateAuditor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateAuditorInput) => {
      const { data, error } = await supabase
        .from('talent_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: talentOsKeys.profiles() }),
  });
}

export function useDeleteAuditor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('talent_profiles')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: talentOsKeys.profiles() }),
  });
}
