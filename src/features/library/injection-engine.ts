import { supabase } from '@/shared/api/supabase';
import type { TemplateStep } from '@/entities/library/types';

/**
 * AUDIT PROGRAM INJECTION ENGINE
 *
 * Transmutes program templates into live workpaper test steps.
 * This is the bridge between the Library (Blueprint) and Execution (Reality).
 *
 * Flow:
 * 1. Fetch template steps from `template_steps`
 * 2. Transmute: control_title + test_procedure -> workpaper_test_steps.description
 * 3. Bulk insert into workpaper_test_steps
 * 4. Initialize all steps as incomplete
 * 5. Return count of injected steps
 */

export interface InjectionResult {
  success: boolean;
  stepsInjected: number;
  workpaperId: string;
  error?: string;
}

export async function injectProgramToWorkpaper(
  templateId: string,
  workpaperId: string
): Promise<InjectionResult> {
  try {
    // Fetch all steps from the template
    const { data: templateSteps, error: fetchError } = await supabase
      .from('template_steps')
      .select('*')
      .eq('template_id', templateId)
      .order('step_order');

    if (fetchError) throw fetchError;
    if (!templateSteps || templateSteps.length === 0) {
      throw new Error('Template has no steps to inject');
    }

    // Transmute template steps into workpaper test steps
    const workpaperSteps = templateSteps.map((step: TemplateStep, index) => ({
      workpaper_id: workpaperId,
      step_order: index + 1,
      description: formatTestStepDescription(step),
      is_completed: false,
      auditor_comment: '',
    }));

    // Bulk insert
    const { error: insertError, data: inserted } = await supabase
      .from('workpaper_test_steps')
      .insert(workpaperSteps)
      .select();

    if (insertError) throw insertError;

    return {
      success: true,
      stepsInjected: inserted?.length || 0,
      workpaperId,
    };
  } catch (error) {
    console.error('Injection failed:', error);
    return {
      success: false,
      stepsInjected: 0,
      workpaperId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Format a template step into a workpaper test step description
 * Combines control info with procedure for maximum context
 */
function formatTestStepDescription(step: TemplateStep): string {
  return `[${step.control_id}] ${step.control_title}\n\n${step.test_procedure}\n\nExpected Evidence: ${step.expected_evidence}\nTesting Method: ${step.testing_method}`;
}

/**
 * Inject to a NEW workpaper (creates workpaper first)
 * Used when deploying a template to a fresh engagement
 */
export async function injectProgramToNewWorkpaper(
  templateId: string,
  engagementId: string,
  workpaperTitle: string
): Promise<InjectionResult> {
  try {
    // Fetch template details
    const { data: template, error: templateError } = await supabase
      .from('program_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (templateError) throw templateError;
    if (!template) throw new Error('Template not found');

    // Create a new workpaper for this engagement
    const { data: workpaper, error: wpError } = await supabase
      .from('workpapers')
      .insert({
        step_id: engagementId, // We'll link to engagement via step_id (or create proper FK)
        status: 'draft',
        data: {
          template_id: templateId,
          template_title: template.title,
          workpaper_title: workpaperTitle || template.title,
        },
        version: 1,
      })
      .select()
      .single();

    if (wpError) throw wpError;
    if (!workpaper) throw new Error('Failed to create workpaper');

    // Now inject the steps
    return await injectProgramToWorkpaper(templateId, workpaper.id);
  } catch (error) {
    console.error('Injection to new workpaper failed:', error);
    return {
      success: false,
      stepsInjected: 0,
      workpaperId: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Preview injection (dry run)
 * Returns what would be injected without actually inserting
 */
export async function previewInjection(templateId: string): Promise<{
  stepCount: number;
  estimatedHours: number;
  steps: Array<{ order: number; title: string; description: string }>;
}> {
  const { data: template, error: templateError } = await supabase
    .from('program_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError) throw templateError;

  const { data: steps, error: stepsError } = await supabase
    .from('template_steps')
    .select('*')
    .eq('template_id', templateId)
    .order('step_order');

  if (stepsError) throw stepsError;

  return {
    stepCount: steps?.length || 0,
    estimatedHours: template?.estimated_hours || 0,
    steps:
      steps?.map((step: TemplateStep, index) => ({
        order: index + 1,
        title: `[${step.control_id}] ${step.control_title}`,
        description: step.test_procedure.substring(0, 150) + '...',
      })) || [],
  };
}
