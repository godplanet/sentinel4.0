import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { buildHierarchyFromLTree } from '../lib/ltree-parser';
import type { UniverseNode } from '../model/types';

const KEYS = {
  universe: ['audit-universe-hierarchy'] as const,
  impact: (id: string) => ['entity-impact-analysis', id] as const,
};

// ─── Etki Analizi Tipleri ─────────────────────────────────────────────────────

export interface EntityImpactAnalysis {
  entity_id: string;
  entity_path: string;
  descendant_count: number;
  rkm_risk_count: number;
  open_finding_count: number;
}

// ─── Impact Analysis API ─────────────────────────────────────────────────────

export async function fetchEntityImpactAnalysis(entityId: string): Promise<EntityImpactAnalysis> {
  const { data, error } = await supabase.rpc('get_entity_impact_analysis', {
    p_entity_id: entityId,
  });
  if (error) throw error;
  return data as EntityImpactAnalysis;
}

export function useEntityImpactAnalysis(entityId: string | null) {
  return useQuery({
    queryKey: KEYS.impact(entityId ?? ''),
    queryFn: () => fetchEntityImpactAnalysis(entityId!),
    enabled: !!entityId,
    staleTime: 0,
  });
}

// ─── Entity Silme API ────────────────────────────────────────────────────────

export async function archiveAuditEntity(entityId: string): Promise<void> {
  const { error } = await supabase
    .from('audit_entities')
    .update({ status: 'ARCHIVED' })
    .eq('id', entityId);
  if (error) throw error;
}

export async function fetchAuditUniverse(): Promise<UniverseNode[]> {
  const { data, error } = await supabase
    .from('audit_universe')
    .select('id, name, path, type, inherent_risk, residual_risk, owner_id, tenant_id')
    .order('path');
  if (error) throw error;
  return (data ?? []) as UniverseNode[];
}

export function useAuditUniverse() {
  return useQuery({
    queryKey: KEYS.universe,
    queryFn: async () => {
      const flat = await fetchAuditUniverse();
      return buildHierarchyFromLTree(flat);
    },
  });
}
