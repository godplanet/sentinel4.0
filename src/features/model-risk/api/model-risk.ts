import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/api/supabase';

const TENANT_ID = '11111111-1111-1111-1111-111111111111';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ModelType = 'LLM' | 'XGBoost' | 'Random Forest' | 'Neural Network';
export type RiskTier  = 'critical' | 'high' | 'medium' | 'low';
export type ModelStatus = 'development' | 'active' | 'deprecated' | 'suspended';
export type TestType  = 'BIAS' | 'HALLUCINATION' | 'DRIFT' | 'FAIRNESS';
export type TestStatus = 'pass' | 'fail' | 'warning' | 'pending';

export interface AIModel {
  id: string;
  tenant_id: string;
  model_name: string;
  model_type: ModelType;
  use_case: string;
  vendor: string | null;
  risk_tier: RiskTier;
  status: ModelStatus;
  business_owner: string | null;
  data_sources: string[] | null;
  last_review_at: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModelBiasTest {
  id: string;
  tenant_id: string;
  model_id: string;
  test_type: TestType;
  status: TestStatus;
  total_prompts: number;
  failed_prompts: number;
  findings: string | null;
  metrics: Record<string, number> | null;
  tested_by: string;
  tested_at: string;
}

// ─── AI Models Inventory ──────────────────────────────────────────────────────

export function useModels(filters?: { status?: ModelStatus; riskTier?: RiskTier }) {
  return useQuery({
    queryKey: ['ai-models', TENANT_ID, filters],
    queryFn: async () => {
      let query = supabase
        .from('ai_models_inventory')
        .select('*')
        .eq('tenant_id', TENANT_ID)
        .order('created_at', { ascending: false });

      if (filters?.status)   query = query.eq('status', filters.status);
      if (filters?.riskTier) query = query.eq('risk_tier', filters.riskTier);

      const { data, error } = await query;
      if (error) {
        console.error('[Wave 57] Modeller alınamadı:', error.message);
        return [] as AIModel[];
      }
      return (data ?? []) as AIModel[];
    },
    staleTime: 30_000,
  });
}

// ─── Bias & Hallucination Tests ───────────────────────────────────────────────

export function useBiasTests(modelId?: string) {
  return useQuery({
    queryKey: ['model-bias-tests', TENANT_ID, modelId],
    queryFn: async () => {
      let query = supabase
        .from('model_bias_tests')
        .select('*, ai_models_inventory(model_name, model_type)')
        .eq('tenant_id', TENANT_ID)
        .order('tested_at', { ascending: false });

      if (modelId) query = query.eq('model_id', modelId);

      const { data, error } = await query;
      if (error) {
        console.error('[Wave 57] Test sonuçları alınamadı:', error.message);
        return [] as (ModelBiasTest & { model_name?: string; model_type?: string; failure_rate: number })[];
      }

      // Halüsinasyon veya hata oranlarını hesaplama — sıfıra bölünme koruması!
      return (data ?? []).map(row => {
        const failureRate = (row.failed_prompts / (row.total_prompts || 1)) * 100;
        return {
          ...row,
          model_name: (row.ai_models_inventory as any)?.model_name,
          model_type: (row.ai_models_inventory as any)?.model_type,
          failure_rate: Math.round(failureRate * 10) / 10,
        };
      });
    },
    staleTime: 30_000,
  });
}

export function useUpdateModelStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ModelStatus }) => {
      const { error } = await supabase
        .from('ai_models_inventory')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-models'] }),
  });
}
