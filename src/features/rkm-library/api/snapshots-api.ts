import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

// ─── Tipler ──────────────────────────────────────────────────────────────────

export interface RkmRiskVersion {
  id: string;
  risk_id: string;
  tenant_id: string;
  version_number: number;
  snapshot: RkmRiskSnapshot;
  changed_by: string;
  change_summary: string;
  created_at: string;
}

export interface RkmRiskSnapshot {
  id: string;
  risk_code?: string;
  risk_title?: string;
  risk_status?: string;
  inherent_impact?: number;
  inherent_likelihood?: number;
  inherent_score?: number;
  inherent_rating?: string;
  residual_impact?: number;
  residual_likelihood?: number;
  residual_score?: number;
  residual_rating?: string;
  control_design_rating?: number;
  control_operating_rating?: number;
  control_effectiveness?: number;
  risk_category?: string;
  risk_owner?: string;
  updated_at?: string;
  [key: string]: unknown;
}

// ─── Query Keys ──────────────────────────────────────────────────────────────

const KEYS = {
  versions: (riskId: string) => ['rkm-risk-versions', riskId] as const,
};

// ─── Fetch ───────────────────────────────────────────────────────────────────

export async function fetchRiskVersions(riskId: string): Promise<RkmRiskVersion[]> {
  const { data, error } = await supabase
    .from('rkm_risk_versions')
    .select('*')
    .eq('risk_id', riskId)
    .order('version_number', { ascending: false });

  if (error) throw error;
  return (data ?? []) as RkmRiskVersion[];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRiskVersions(riskId: string | undefined | null) {
  return useQuery({
    queryKey: KEYS.versions(riskId ?? ''),
    queryFn: () => fetchRiskVersions(riskId!),
    enabled: !!riskId,
    staleTime: 30_000,
  });
}

// ─── Rollback Mutation ───────────────────────────────────────────────────────

export interface RollbackPayload {
  riskId: string;
  snapshot: RkmRiskSnapshot;
  versionNumber: number;
}

/**
 * Seçilen versiyon snapshot'ını alıp rkm_risks tablosunu günceller.
 * NOT: GENERATED ALWAYS AS kolonlar (inherent_score, residual_score, vb.) güncellenmez
 * — hesaplanan alanlar veritabanı tarafından otomatik güncellenecektir.
 */
async function rollbackToVersion({ riskId, snapshot }: RollbackPayload): Promise<void> {
  const allowedFields: (keyof RkmRiskSnapshot)[] = [
    'risk_title',
    'risk_status',
    'risk_owner',
    'risk_category',
    'risk_subcategory',
    'risk_description',
    'inherent_impact',
    'inherent_likelihood',
    'inherent_volume',
    'residual_impact',
    'residual_likelihood',
    'control_design_rating',
    'control_operating_rating',
    'last_test_date',
    'test_result',
    'bddk_reference',
    'iso27001_reference',
    'risk_response_strategy',
  ];

  const update: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (snapshot[field] !== undefined) {
      update[field] = snapshot[field];
    }
  }

  const { error } = await supabase
    .from('rkm_risks')
    .update(update)
    .eq('id', riskId);

  if (error) throw error;
}

export function useRollbackRiskVersion(riskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RollbackPayload) => rollbackToVersion(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.versions(riskId) });
      queryClient.invalidateQueries({ queryKey: ['rkm-risks'] });
    },
  });
}
