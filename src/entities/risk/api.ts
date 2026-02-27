/*
 * Risk Library API
 * Location: entities/risk/api.ts (FSD Architecture)
 */

import { supabase } from '@/shared/api/supabase';

export interface RiskLibraryItem {
  id: string;
  risk_code: string;
  title: string;
  inherent_score: number;
  residual_score: number;
  control_effectiveness: number;
  template_id: string | null;
  static_fields: Record<string, any>;
  dynamic_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RkmTemplate {
  id: string;
  module_type: 'RKM' | 'FINDING' | 'ACTION';
  name: string;
  description: string;
  schema_definition: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const riskLibraryApi = {
  async getAllRisks() {
    const { data, error } = await supabase
      .from('risk_library')
      .select('*')
      .order('inherent_score', { ascending: false });

    if (error) throw error;
    return data as RiskLibraryItem[];
  },

  async getRiskById(id: string) {
    const { data, error } = await supabase
      .from('risk_library')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as RiskLibraryItem | null;
  },

  async createRisk(risk: Partial<RiskLibraryItem>) {
    const { data, error } = await supabase
      .from('risk_library')
      .insert(risk)
      .select()
      .single();

    if (error) throw error;
    return data as RiskLibraryItem;
  },

  async updateRisk(id: string, updates: Partial<RiskLibraryItem>) {
    const { data, error } = await supabase
      .from('risk_library')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as RiskLibraryItem;
  },

  async deleteRisk(id: string) {
    const { error } = await supabase
      .from('risk_library')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getTemplates(moduleType: 'RKM' | 'FINDING' | 'ACTION' = 'RKM') {
    const { data, error } = await supabase
      .from('rkm_templates')
      .select('*')
      .eq('module_type', moduleType)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data as RkmTemplate[];
  },

  async getTemplateById(id: string) {
    const { data, error } = await supabase
      .from('rkm_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as RkmTemplate | null;
  },

  async createTemplate(template: Partial<RkmTemplate>) {
    const { data, error } = await supabase
      .from('rkm_templates')
      .insert(template)
      .select()
      .single();

    if (error) throw error;
    return data as RkmTemplate;
  },

  async updateTemplate(id: string, updates: Partial<RkmTemplate>) {
    const { data, error } = await supabase
      .from('rkm_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as RkmTemplate;
  },
};
