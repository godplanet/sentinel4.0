import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type {
  EntityWithVelocity,
  CometPoint,
  KRIConfig,
  CreateKRIInput,
  UpdateKRIInput,
} from './velocity-types';

const TENANT = ACTIVE_TENANT_ID;

const KEYS = {
  velocityEntities: ['velocity-entities'] as const,
  cometData: ['comet-data'] as const,
  kriConfig: ['kri-config'] as const,
};

export function useVelocityEntities() {
  return useQuery({
    queryKey: KEYS.velocityEntities,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('id, name, type, risk_score, risk_velocity_score, last_position, current_position')
        .eq('tenant_id', TENANT)
        .not('current_position', 'is', null)
        .order('name');
      if (error) throw error;
      return data as EntityWithVelocity[];
    },
  });
}

export function useCometData() {
  return useQuery({
    queryKey: KEYS.cometData,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('id, name, type, risk_score, risk_velocity_score, last_position, current_position')
        .eq('tenant_id', TENANT)
        .not('current_position', 'is', null);
      if (error) throw error;

      const comets: CometPoint[] = (data as EntityWithVelocity[]).map(e => {
        const cp = e.current_position!;
        const lp = e.last_position ?? cp;
        const dx = cp.x - lp.x;
        const dy = cp.y - lp.y;
        const direction: CometPoint['direction'] =
          (dx + dy) > 0 ? 'worsening' : (dx + dy) < 0 ? 'improving' : 'stable';

        return {
          id: e.id,
          name: e.name,
          type: e.type,
          cx: cp.x,
          cy: cp.y,
          px: lp.x,
          py: lp.y,
          velocity: Math.abs(e.risk_velocity_score ?? 0),
          riskScore: e.risk_score ?? 0,
          direction,
        };
      });

      return comets;
    },
  });
}

export function useKRIConfigs() {
  return useQuery({
    queryKey: KEYS.kriConfig,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integration_kri_config')
        .select('*')
        .eq('tenant_id', TENANT)
        .order('source_system, kri_name');
      if (error) throw error;
      return data as KRIConfig[];
    },
  });
}

export function useCreateKRI() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateKRIInput) => {
      const { data, error } = await supabase
        .from('integration_kri_config')
        .insert({ ...input, tenant_id: TENANT, description: input.description ?? '' })
        .select()
        .single();
      if (error) throw error;
      return data as KRIConfig;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.kriConfig }),
  });
}

export function useUpdateKRI() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateKRIInput & { id: string }) => {
      const { data, error } = await supabase
        .from('integration_kri_config')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as KRIConfig;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.kriConfig }),
  });
}

export function useDeleteKRI() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('integration_kri_config')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.kriConfig }),
  });
}
