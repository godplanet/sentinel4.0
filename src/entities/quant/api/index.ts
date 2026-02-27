import { supabase } from '@/shared/api/supabase';
import type { QuantScenario, CreateQuantScenarioInput } from '../model/types';

export async function fetchQuantScenarios(): Promise<QuantScenario[]> {
  const { data, error } = await supabase
    .from('quant_scenarios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function fetchQuantScenario(id: string): Promise<QuantScenario | null> {
  const { data, error } = await supabase
    .from('quant_scenarios')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createQuantScenario(input: CreateQuantScenarioInput): Promise<QuantScenario> {
  const { data, error } = await supabase
    .from('quant_scenarios')
    .insert([{
      title: input.title,
      description: input.description || null,
      min_loss: input.min_loss,
      likely_loss: input.likely_loss,
      max_loss: input.max_loss,
      probability: input.probability,
      simulated_var_95: input.simulated_var_95 || input.likely_loss,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateQuantScenario(id: string, updates: Partial<QuantScenario>): Promise<QuantScenario> {
  const { data, error } = await supabase
    .from('quant_scenarios')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteQuantScenario(id: string): Promise<void> {
  const { error } = await supabase
    .from('quant_scenarios')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
