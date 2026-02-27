/**
 * PROGRAM TEMPLATE ENGINE
 * Loads standard audit procedures from library into workpapers
 */

import { supabase } from '@/shared/api/supabase';

export interface ProcedureTemplate {
  id: string;
  category: string;
  title: string;
  description: string;
  tags: string[];
  created_at: string;
}

export interface TemplateCategory {
  name: string;
  count: number;
  procedures: ProcedureTemplate[];
}

export interface ApplyTemplateResult {
  success: boolean;
  steps_created: number;
  errors: string[];
}

/**
 * Get all procedure categories
 */
export async function getProcedureCategories(): Promise<TemplateCategory[]> {
  const { data, error } = await supabase
    .from('procedure_library')
    .select('*')
    .order('category, title');

  if (error) {
    console.error('Failed to fetch procedures:', error);
    return [];
  }

  const categoriesMap = new Map<string, ProcedureTemplate[]>();

  (data || []).forEach((proc) => {
    if (!categoriesMap.has(proc.category)) {
      categoriesMap.set(proc.category, []);
    }
    categoriesMap.get(proc.category)!.push(proc);
  });

  return Array.from(categoriesMap.entries()).map(([name, procedures]) => ({
    name,
    count: procedures.length,
    procedures,
  }));
}

/**
 * Get procedures by category
 */
export async function getProceduresByCategory(category: string): Promise<ProcedureTemplate[]> {
  const { data, error } = await supabase
    .from('procedure_library')
    .select('*')
    .eq('category', category)
    .order('title');

  if (error) {
    console.error('Failed to fetch procedures:', error);
    return [];
  }

  return data || [];
}

/**
 * Search procedures by keyword
 */
export async function searchProcedures(keyword: string): Promise<ProcedureTemplate[]> {
  const { data, error } = await supabase
    .from('procedure_library')
    .select('*')
    .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .order('title');

  if (error) {
    console.error('Failed to search procedures:', error);
    return [];
  }

  return data || [];
}

/**
 * Apply template to workpaper (inject procedures as test steps)
 */
export async function applyTemplateToWorkpaper(
  workpaperId: string,
  procedureIds: string[]
): Promise<ApplyTemplateResult> {
  const result: ApplyTemplateResult = {
    success: false,
    steps_created: 0,
    errors: [],
  };

  if (procedureIds.length === 0) {
    result.errors.push('No procedures selected');
    return result;
  }

  const { data: procedures, error: fetchError } = await supabase
    .from('procedure_library')
    .select('*')
    .in('id', procedureIds)
    .order('category, title');

  if (fetchError || !procedures) {
    result.errors.push('Failed to fetch procedures from library');
    return result;
  }

  const { data: existingSteps } = await supabase
    .from('workpaper_test_steps')
    .select('step_order')
    .eq('workpaper_id', workpaperId)
    .order('step_order', { ascending: false })
    .limit(1);

  const startOrder = existingSteps && existingSteps.length > 0 ? existingSteps[0].step_order + 1 : 1;

  const testSteps = procedures.map((proc, index) => ({
    workpaper_id: workpaperId,
    step_order: startOrder + index,
    description: proc.description,
    is_completed: false,
    auditor_comment: '',
  }));

  const { error: insertError, data: insertedSteps } = await supabase
    .from('workpaper_test_steps')
    .insert(testSteps)
    .select();

  if (insertError) {
    result.errors.push(`Failed to insert test steps: ${insertError.message}`);
    return result;
  }

  result.success = true;
  result.steps_created = insertedSteps?.length || 0;

  await supabase.from('workpaper_activity_logs').insert({
    workpaper_id: workpaperId,
    user_id: '11111111-1111-1111-1111-111111111111',
    user_name: 'System',
    action_type: 'STEP_COMPLETED',
    details: `Loaded ${result.steps_created} procedures from template`,
  });

  return result;
}

/**
 * Apply entire category to workpaper
 */
export async function applyCategoryToWorkpaper(
  workpaperId: string,
  category: string
): Promise<ApplyTemplateResult> {
  const { data: procedures } = await supabase
    .from('procedure_library')
    .select('id')
    .eq('category', category);

  if (!procedures || procedures.length === 0) {
    return {
      success: false,
      steps_created: 0,
      errors: ['No procedures found in this category'],
    };
  }

  return applyTemplateToWorkpaper(
    workpaperId,
    procedures.map((p) => p.id)
  );
}

/**
 * Get suggested templates based on workpaper context
 */
export async function getSuggestedTemplates(workpaperId: string): Promise<TemplateCategory[]> {
  const { data: workpaper } = await supabase
    .from('workpapers')
    .select('step_id')
    .eq('id', workpaperId)
    .maybeSingle();

  if (!workpaper) {
    return [];
  }

  const categories = await getProcedureCategories();

  return categories.slice(0, 5);
}

/**
 * Create custom procedure in library
 */
export async function createCustomProcedure(input: {
  category: string;
  title: string;
  description: string;
  tags?: string[];
}): Promise<ProcedureTemplate | null> {
  const { data, error } = await supabase
    .from('procedure_library')
    .insert({
      category: input.category,
      title: input.title,
      description: input.description,
      tags: input.tags || [],
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create procedure:', error);
    return null;
  }

  return data;
}

/**
 * Get workpaper test steps count
 */
export async function getWorkpaperStepsCount(workpaperId: string): Promise<number> {
  const { count } = await supabase
    .from('workpaper_test_steps')
    .select('id', { count: 'exact', head: true })
    .eq('workpaper_id', workpaperId);

  return count || 0;
}

/**
 * Clear all test steps from workpaper
 */
export async function clearWorkpaperSteps(workpaperId: string): Promise<boolean> {
  const { error } = await supabase
    .from('workpaper_test_steps')
    .delete()
    .eq('workpaper_id', workpaperId);

  if (error) {
    console.error('Failed to clear test steps:', error);
    return false;
  }

  await supabase.from('workpaper_activity_logs').insert({
    workpaper_id: workpaperId,
    user_id: '11111111-1111-1111-1111-111111111111',
    user_name: 'System',
    action_type: 'STEP_COMPLETED',
    details: 'Cleared all test steps',
  });

  return true;
}
