import { supabase } from '@/shared/api/supabase';
import type {
  ProgramTemplate,
  TemplateStep,
  ProgramTemplateWithSteps,
  CreateProgramTemplateInput,
  CreateTemplateStepInput,
  UpdateTemplateStepInput,
} from './types';

export async function fetchProgramTemplates(): Promise<ProgramTemplateWithSteps[]> {
  const { data: templates, error: templatesError } = await supabase
    .from('program_templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (templatesError) throw templatesError;
  if (!templates) return [];

  const templatesWithSteps = await Promise.all(
    templates.map(async (template) => {
      const { data: steps, error: stepsError } = await supabase
        .from('template_steps')
        .select('*')
        .eq('template_id', template.id)
        .order('step_order');

      if (stepsError) throw stepsError;

      return {
        ...template,
        steps: steps || [],
        step_count: steps?.length || 0,
      };
    })
  );

  return templatesWithSteps;
}

export async function fetchProgramTemplate(id: string): Promise<ProgramTemplateWithSteps | null> {
  const { data: template, error: templateError } = await supabase
    .from('program_templates')
    .select('*')
    .eq('id', id)
    .single();

  if (templateError) throw templateError;
  if (!template) return null;

  const { data: steps, error: stepsError } = await supabase
    .from('template_steps')
    .select('*')
    .eq('template_id', id)
    .order('step_order');

  if (stepsError) throw stepsError;

  return {
    ...template,
    steps: steps || [],
    step_count: steps?.length || 0,
  };
}

export async function createProgramTemplate(input: CreateProgramTemplateInput): Promise<ProgramTemplate> {
  const { data, error } = await supabase
    .from('program_templates')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTemplateStep(input: CreateTemplateStepInput): Promise<TemplateStep> {
  const { data, error } = await supabase
    .from('template_steps')
    .insert(input)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTemplateStep(input: UpdateTemplateStepInput): Promise<TemplateStep> {
  const { id, ...updates } = input;

  const { data, error } = await supabase
    .from('template_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTemplateStep(id: string): Promise<void> {
  const { error } = await supabase
    .from('template_steps')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function reorderTemplateSteps(templateId: string, stepIds: string[]): Promise<void> {
  const updates = stepIds.map((id, index) => ({
    id,
    step_order: index + 1,
  }));

  for (const update of updates) {
    await supabase
      .from('template_steps')
      .update({ step_order: update.step_order })
      .eq('id', update.id);
  }
}
