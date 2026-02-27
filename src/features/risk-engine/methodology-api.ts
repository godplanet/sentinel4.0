import { supabase } from '@/shared/api/supabase';
import { ACTIVE_TENANT_ID } from '@/shared/lib/constants';
import type { MethodologyConfig, RiskWeights, SeverityThreshold, VetoRule } from './methodology-types';

const TENANT_ID = ACTIVE_TENANT_ID;

export async function fetchActiveMethodology(): Promise<MethodologyConfig | null> {
  const { data, error } = await supabase
    .from('methodology_configs')
    .select('*')
    .eq('tenant_id', TENANT_ID)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch methodology config:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    veto_logic: data.veto_logic ?? null,
    financial_materiality: data.financial_materiality ?? null,
    grading_rules: data.grading_rules ?? null,
  } as MethodologyConfig;
}

export async function updateMethodologyWeights(
  configId: string,
  weights: RiskWeights,
  thresholds: SeverityThreshold[],
  vetoRules: VetoRule[],
): Promise<boolean> {
  const { error } = await supabase
    .from('methodology_configs')
    .update({
      risk_weights: weights,
      severity_thresholds: thresholds,
      veto_rules: vetoRules,
      updated_at: new Date().toISOString(),
    })
    .eq('id', configId);

  if (error) {
    console.error('Failed to update methodology config:', error.message);
    return false;
  }

  return true;
}

export async function updateVetoLogic(configId: string, vetoLogic: unknown): Promise<boolean> {
  const { error } = await supabase
    .from('methodology_configs')
    .update({
      veto_logic: vetoLogic,
      updated_at: new Date().toISOString(),
    })
    .eq('id', configId);

  if (error) {
    console.error('Failed to update veto logic:', error.message);
    return false;
  }

  return true;
}
