import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── Types ────────────────────────────────────────────────────────────────────

export type QuantumRisk = 'critical' | 'high' | 'medium' | 'low' | 'safe';
export type AssetStatus = 'active' | 'migrating' | 'retired';
export type PlanStatus  = 'planning' | 'in_progress' | 'testing' | 'completed';

export interface CryptoAsset {
  id: string;
  tenant_id: string;
  asset_name: string;
  algorithm: string;
  key_size: number | null;
  quantum_risk: QuantumRisk;
  usage_context: string;
  expiration_date: string | null;
  owner_dept: string | null;
  status: AssetStatus;
  created_at: string;
  updated_at: string;
}

export interface PqcTransitionPlan {
  id: string;
  tenant_id: string;
  asset_id: string;
  target_algorithm: string;
  target_date: string;
  budget_usd: number | null;
  status: PlanStatus;
  progress_pct: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  asset?: CryptoAsset; // joined
}

// ─── Crypto Assets ────────────────────────────────────────────────────────────

export function useCryptoAssets(filters?: { risk?: QuantumRisk; status?: AssetStatus }) {
  return useQuery({
    queryKey: ['crypto-assets', TENANT_ID, filters],
    queryFn: async () => {
      let query = supabase
        .from('cryptographic_assets')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('quantum_risk', { ascending: false });

      if (filters?.risk)   query = query.eq('quantum_risk', filters.risk);
      if (filters?.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      if (error) {
        console.error('[Wave 58] Kripto envanteri alınamadı:', error.message);
        return [] as CryptoAsset[];
      }
      
      // Zorunlu kalkan: (assets || []).map
      return ((data as CryptoAsset[]) || []).map(asset => ({
        ...asset,
        algorithm: asset.algorithm || 'Bilinmiyor',
      }));
    },
    staleTime: 30_000,
  });
}

// ─── Transition Plans ─────────────────────────────────────────────────────────

export function usePqcPlans() {
  return useQuery({
    queryKey: ['pqc-plans', TENANT_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pqc_transition_plans')
        .select('*, cryptographic_assets(*)')
        .eq('tenant_id', TENANT_ID)
        .order('target_date', { ascending: true });

      if (error) {
        console.error('[Wave 58] Geçiş planları alınamadı:', error.message);
        return [] as PqcTransitionPlan[];
      }
      
      // Zorunlu kalkan
      return ((data as any[]) || []).map(row => ({
        ...row,
        asset: row.cryptographic_assets,
      })) as PqcTransitionPlan[];
    },
    staleTime: 30_000,
  });
}

export function useUpdatePlanStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, progress_pct }: { id: string; status: PlanStatus; progress_pct?: number }) => {
      const { error } = await supabase
        .from('pqc_transition_plans')
        .update({
          status,
          ...(progress_pct !== undefined ? { progress_pct } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pqc-plans'] }),
  });
}
