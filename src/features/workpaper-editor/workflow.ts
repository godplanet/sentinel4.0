/**
 * WORKPAPER SIGN-OFF STATE MACHINE
 * Enforces strict quality control rules
 */

import { supabase } from '@/shared/api/supabase';

export type WorkpaperApprovalStatus = 'in_progress' | 'prepared' | 'reviewed';

export interface SignOffValidationResult {
  canSignOff: boolean;
  errors: string[];
  warnings: string[];
}

export interface WorkpaperForValidation {
  id: string;
  approval_status: WorkpaperApprovalStatus;
  prepared_by_user_id?: string;
  reviewed_by_user_id?: string;
  test_steps?: Array<{
    is_completed: boolean;
    test_result?: 'pass' | 'fail' | 'n/a';
  }>;
  findings?: Array<{
    id: string;
    severity: string;
  }>;
}

const CURRENT_USER_ID = '11111111-1111-1111-1111-111111111111';

/**
 * RULE 1: Preparer must sign before Reviewer
 * RULE 2: Cannot sign off if failed tests have no findings
 * RULE 3: Reviewer cannot be same as Preparer
 */
export function validateSignOff(
  workpaper: WorkpaperForValidation,
  role: 'preparer' | 'reviewer' | 'manager',
  userId: string = CURRENT_USER_ID
): SignOffValidationResult {
  const result: SignOffValidationResult = {
    canSignOff: true,
    errors: [],
    warnings: [],
  };

  if (role === 'reviewer') {
    if (!workpaper.prepared_by_user_id) {
      result.canSignOff = false;
      result.errors.push('Preparer must sign off before Reviewer can sign');
    }

    if (workpaper.prepared_by_user_id === userId) {
      result.canSignOff = false;
      result.errors.push('Reviewer cannot be the same person as Preparer');
    }
  }

  if (role === 'manager') {
    if (!workpaper.reviewed_by_user_id) {
      result.canSignOff = false;
      result.errors.push('Reviewer must sign off before Manager can sign');
    }

    if (workpaper.prepared_by_user_id === userId || workpaper.reviewed_by_user_id === userId) {
      result.warnings.push('Manager is same as Preparer/Reviewer - consider independence rules');
    }
  }

  const failedStepsWithoutFindings = (workpaper.test_steps || []).filter(
    (step) => step.is_completed && step.test_result === 'fail'
  );

  if (failedStepsWithoutFindings.length > 0 && (!workpaper.findings || workpaper.findings.length === 0)) {
    result.canSignOff = false;
    result.errors.push(
      `${failedStepsWithoutFindings.length} test step(s) marked as FAILED but no Finding is linked. Create a finding before signing off.`
    );
  }

  const incompleteSteps = (workpaper.test_steps || []).filter((step) => !step.is_completed);
  if (incompleteSteps.length > 0) {
    result.warnings.push(`${incompleteSteps.length} test step(s) are not completed`);
  }

  return result;
}

/**
 * Sign off as Preparer
 */
export async function signOffAsPreparer(workpaperId: string, userId: string = CURRENT_USER_ID) {
  const { data: workpaper, error: fetchError } = await supabase
    .from('workpapers')
    .select(
      `
      id,
      approval_status,
      prepared_by_user_id,
      reviewed_by_user_id
    `
    )
    .eq('id', workpaperId)
    .maybeSingle();

  if (fetchError || !workpaper) {
    throw new Error('Failed to fetch workpaper');
  }

  const { data: testSteps } = await supabase
    .from('workpaper_test_steps')
    .select('is_completed')
    .eq('workpaper_id', workpaperId);

  const { data: findings } = await supabase
    .from('workpaper_findings')
    .select('id, severity')
    .eq('workpaper_id', workpaperId);

  const validation = validateSignOff(
    {
      ...workpaper,
      test_steps: testSteps || [],
      findings: findings || [],
    },
    'preparer',
    userId
  );

  if (!validation.canSignOff) {
    return {
      success: false,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  const { error: updateError } = await supabase
    .from('workpapers')
    .update({
      prepared_by_user_id: userId,
      prepared_at: new Date().toISOString(),
      approval_status: 'prepared',
    })
    .eq('id', workpaperId);

  if (updateError) {
    throw new Error('Failed to sign off');
  }

  await logActivity(workpaperId, userId, 'SIGN_OFF', 'Preparer signed off workpaper');

  return {
    success: true,
    errors: [],
    warnings: validation.warnings,
  };
}

/**
 * Sign off as Reviewer
 */
export async function signOffAsReviewer(workpaperId: string, userId: string = CURRENT_USER_ID) {
  const { data: workpaper, error: fetchError } = await supabase
    .from('workpapers')
    .select(
      `
      id,
      approval_status,
      prepared_by_user_id,
      reviewed_by_user_id
    `
    )
    .eq('id', workpaperId)
    .maybeSingle();

  if (fetchError || !workpaper) {
    throw new Error('Failed to fetch workpaper');
  }

  const { data: testSteps } = await supabase
    .from('workpaper_test_steps')
    .select('is_completed')
    .eq('workpaper_id', workpaperId);

  const { data: findings } = await supabase
    .from('workpaper_findings')
    .select('id, severity')
    .eq('workpaper_id', workpaperId);

  const validation = validateSignOff(
    {
      ...workpaper,
      test_steps: testSteps || [],
      findings: findings || [],
    },
    'reviewer',
    userId
  );

  if (!validation.canSignOff) {
    return {
      success: false,
      errors: validation.errors,
      warnings: validation.warnings,
    };
  }

  const { error: updateError } = await supabase
    .from('workpapers')
    .update({
      reviewed_by_user_id: userId,
      reviewed_at: new Date().toISOString(),
      approval_status: 'reviewed',
    })
    .eq('id', workpaperId);

  if (updateError) {
    throw new Error('Failed to sign off');
  }

  await logActivity(workpaperId, userId, 'SIGN_OFF', 'Reviewer signed off workpaper');

  return {
    success: true,
    errors: [],
    warnings: validation.warnings,
  };
}

/**
 * Reject workpaper (wipes signatures and reverts to in_progress)
 */
export async function rejectWorkpaper(
  workpaperId: string,
  rejectedBy: 'reviewer' | 'manager',
  reason: string,
  userId: string = CURRENT_USER_ID
) {
  const updates: Record<string, unknown> = {
    approval_status: 'in_progress',
  };

  if (rejectedBy === 'reviewer') {
    updates.prepared_by_user_id = null;
    updates.prepared_at = null;
  } else if (rejectedBy === 'manager') {
    updates.prepared_by_user_id = null;
    updates.prepared_at = null;
    updates.reviewed_by_user_id = null;
    updates.reviewed_at = null;
  }

  const { error } = await supabase.from('workpapers').update(updates).eq('id', workpaperId);

  if (error) {
    throw new Error('Failed to reject workpaper');
  }

  await logActivity(
    workpaperId,
    userId,
    'UNSIGN',
    `${rejectedBy === 'reviewer' ? 'Reviewer' : 'Manager'} rejected workpaper: ${reason}`
  );

  return {
    success: true,
  };
}

/**
 * Check if user can sign off
 */
export async function canUserSignOff(
  workpaperId: string,
  role: 'preparer' | 'reviewer' | 'manager',
  userId: string = CURRENT_USER_ID
): Promise<SignOffValidationResult> {
  const { data: workpaper } = await supabase
    .from('workpapers')
    .select(
      `
      id,
      approval_status,
      prepared_by_user_id,
      reviewed_by_user_id
    `
    )
    .eq('id', workpaperId)
    .maybeSingle();

  if (!workpaper) {
    return {
      canSignOff: false,
      errors: ['Workpaper not found'],
      warnings: [],
    };
  }

  const { data: testSteps } = await supabase
    .from('workpaper_test_steps')
    .select('is_completed')
    .eq('workpaper_id', workpaperId);

  const { data: findings } = await supabase
    .from('workpaper_findings')
    .select('id, severity')
    .eq('workpaper_id', workpaperId);

  return validateSignOff(
    {
      ...workpaper,
      test_steps: testSteps || [],
      findings: findings || [],
    },
    role,
    userId
  );
}

/**
 * Log activity
 */
async function logActivity(
  workpaperId: string,
  userId: string,
  actionType: string,
  details: string
) {
  await supabase.from('workpaper_activity_logs').insert({
    workpaper_id: workpaperId,
    user_id: userId,
    user_name: 'Current User',
    action_type: actionType,
    details,
  });
}

/**
 * Get workpaper approval history
 */
export async function getApprovalHistory(workpaperId: string) {
  const { data: workpaper } = await supabase
    .from('workpapers')
    .select('prepared_by_user_id, prepared_at, reviewed_by_user_id, reviewed_at, approval_status')
    .eq('id', workpaperId)
    .maybeSingle();

  const { data: activities } = await supabase
    .from('workpaper_activity_logs')
    .select('*')
    .eq('workpaper_id', workpaperId)
    .in('action_type', ['SIGN_OFF', 'UNSIGN'])
    .order('created_at', { ascending: false });

  return {
    current_status: workpaper?.approval_status || 'in_progress',
    prepared_by: workpaper?.prepared_by_user_id,
    prepared_at: workpaper?.prepared_at,
    reviewed_by: workpaper?.reviewed_by_user_id,
    reviewed_at: workpaper?.reviewed_at,
    history: activities || [],
  };
}
