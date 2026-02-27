import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';
import { buildHierarchyFromLTree } from '../lib/ltree-parser';
import type { UniverseNode } from '../model/types';

const KEYS = {
  universe: ['audit-universe-hierarchy'] as const,
};

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
