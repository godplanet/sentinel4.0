import { supabase } from '@/shared/api/supabase';
import type { RiskConstitutionData } from './types';

export async function fetchConstitution(): Promise<RiskConstitutionData | null> {
  const { data, error } = await supabase
    .from('risk_constitution_v3')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch constitution:', error.message);
    return null;
  }
  return data;
}

export async function updateConstitution(
  id: string,
  updates: Partial<Pick<RiskConstitutionData, 'dimensions' | 'impact_matrix' | 'veto_rules' | 'risk_ranges'>>,
): Promise<boolean> {
  const { error } = await supabase
    .from('risk_constitution_v3')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Failed to update constitution:', error.message);
    return false;
  }
  return true;
}
