import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { AuditEntity, EntityType } from '../model/types';

const TENANT = ACTIVE_TENANT_ID;
const KEYS = {
  all: ['audit-entities'] as const,
  detail: (id: string) => ['audit-entities', id] as const,
};

export function useAuditEntities() {
  return useQuery({
    queryKey: KEYS.all,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('*')
        .eq('tenant_id', TENANT)
        .order('path');
      if (error) throw error;
      return data as AuditEntity[];
    },
  });
}

export function useAuditEntity(id: string | null) {
  return useQuery({
    queryKey: KEYS.detail(id ?? ''),
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_entities')
        .select('*')
        .eq('id', id!)
        .maybeSingle();
      if (error) throw error;
      return data as AuditEntity | null;
    },
  });
}

interface CreateEntityInput {
  name: string;
  type: EntityType;
  parent_id?: string | null;
  path: string;
  risk_score?: number;
  velocity_multiplier?: number;
  status?: string;
  metadata?: Record<string, unknown>;
}

export function useCreateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEntityInput) => {
      const { data, error } = await supabase
        .from('audit_entities')
        .insert({ ...input, tenant_id: TENANT })
        .select()
        .single();
      if (error) throw error;
      return data as AuditEntity;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CreateEntityInput>) => {
      const { data, error } = await supabase
        .from('audit_entities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as AuditEntity;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteEntity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('audit_entities')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
export * from './taxonomy-api';
export * from './taxonomy-hooks';
