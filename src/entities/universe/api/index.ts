import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { AuditEntity, EntityType } from '../model/types';

const TENANT = ACTIVE_TENANT_ID;
const KEYS = {
  all: ['audit-entities'] as const,
  detail: (id: string) => ['audit-entities', id] as const,
  entityFindingCounts: ['entity-finding-counts'] as const,
};

/** Birim karnesi için entity bazında bulgu sayıları (engagement → entity ilişkisi üzerinden). */
export interface EntityFindingCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export async function fetchEntityFindingCounts(): Promise<Record<string, EntityFindingCounts>> {
  const { data, error } = await supabase
    .from('audit_findings')
    .select('severity, audit_engagements!inner(entity_id)');
  if (error) return {};
  const byEntity: Record<string, EntityFindingCounts> = {};
  const normalize = (s: string) => (s || '').toUpperCase();
  for (const row of data || []) {
    const entityId = (row.audit_engagements as { entity_id: string } | null)?.entity_id;
    if (!entityId) continue;
    if (!byEntity[entityId]) byEntity[entityId] = { critical: 0, high: 0, medium: 0, low: 0 };
    const sev = normalize(row.severity as string);
    if (sev === 'CRITICAL') byEntity[entityId].critical += 1;
    else if (sev === 'HIGH') byEntity[entityId].high += 1;
    else if (sev === 'MEDIUM') byEntity[entityId].medium += 1;
    else if (sev === 'LOW') byEntity[entityId].low += 1;
  }
  return byEntity;
}

export function useEntityFindingCounts() {
  return useQuery({
    queryKey: KEYS.entityFindingCounts,
    queryFn: fetchEntityFindingCounts,
  });
}

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
