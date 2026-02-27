/**
 * FINDING LIFECYCLE STATE MACHINE
 *
 * Enforces strict transitions between states and prevents "status jumping".
 *
 * States:
 * 1. DRAFT - Only auditor sees it
 * 2. ISSUED_FOR_RESPONSE - Auditee gets notification, can edit management response
 * 3. UNDER_REVIEW - Auditor reviews the response
 * 4. VALIDATED - Action plan agreed, moves to follow-up pool
 * 5. CLOSED - All actions completed and verified
 *
 * Transition Rules (The Guardrails):
 * - DRAFT -> ISSUED: Block if root cause, impact, or risk rating is empty
 * - ISSUED -> VALIDATED: Block if management response or target date is empty
 * - VALIDATED -> CLOSED: Block if any linked action plan is not 100% complete
 */

import { supabase } from '@/shared/api/supabase';
import {
  findStakeholderSatisfactionTemplate,
  createSurveyAssignment,
} from '@/entities/survey/api';

export type FindingWorkflowState =
  | 'DRAFT'
  | 'ISSUED_FOR_RESPONSE'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'CLOSED';

export interface Finding {
  id: string;
  title: string;
  workflow_state: FindingWorkflowState;
  root_cause?: string | null;
  impact?: string | null;
  risk_rating?: string | null;
  management_response?: string | null;
  target_completion_date?: string | null;
  auditee_id?: string | null;
  issued_at?: string | null;
  validated_at?: string | null;
  closed_at?: string | null;
  response_due_date?: string | null;
}

export interface TransitionValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StateTransitionResult {
  success: boolean;
  newState: FindingWorkflowState;
  error?: string;
  validation?: TransitionValidation;
}

/**
 * Get allowed transitions from current state
 */
export function getAllowedTransitions(currentState: FindingWorkflowState): FindingWorkflowState[] {
  const transitions: Record<FindingWorkflowState, FindingWorkflowState[]> = {
    DRAFT: ['ISSUED_FOR_RESPONSE'],
    ISSUED_FOR_RESPONSE: ['UNDER_REVIEW', 'DRAFT'], // Can send back to draft if needed
    UNDER_REVIEW: ['VALIDATED', 'ISSUED_FOR_RESPONSE'], // Can send back for revision
    VALIDATED: ['CLOSED', 'UNDER_REVIEW'], // Can reopen if needed
    CLOSED: ['VALIDATED'], // Can reopen if new issues found
  };

  return transitions[currentState] || [];
}

/**
 * Check if transition is allowed
 */
export function isTransitionAllowed(
  fromState: FindingWorkflowState,
  toState: FindingWorkflowState
): boolean {
  const allowed = getAllowedTransitions(fromState);
  return allowed.includes(toState);
}

/**
 * Validate DRAFT -> ISSUED_FOR_RESPONSE transition
 */
function validateDraftToIssued(finding: Finding): TransitionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!finding.root_cause || finding.root_cause.trim().length === 0) {
    errors.push('Root Cause is required before issuing to management');
  }

  if (!finding.impact || finding.impact.trim().length === 0) {
    errors.push('Impact description is required before issuing');
  }

  if (!finding.risk_rating || finding.risk_rating.trim().length === 0) {
    errors.push('Risk Rating must be assigned before issuing');
  }

  if (!finding.auditee_id) {
    errors.push('Auditee must be assigned before issuing');
  }

  if (!finding.response_due_date) {
    warnings.push('Consider setting a response due date');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate ISSUED_FOR_RESPONSE -> VALIDATED transition
 */
async function validateIssuedToValidated(finding: Finding): Promise<TransitionValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!finding.management_response || finding.management_response.trim().length === 0) {
    errors.push('Management Response is required before validation');
  }

  if (!finding.target_completion_date) {
    errors.push('Target Completion Date must be set before validation');
  }

  // Check if action plans exist
  const { data: actionPlans, error } = await supabase
    .from('action_plans')
    .select('id')
    .eq('finding_id', finding.id);

  if (error) {
    warnings.push('Could not verify action plans');
  } else if (!actionPlans || actionPlans.length === 0) {
    warnings.push('No action plans linked. Consider creating action plans before validation.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate VALIDATED -> CLOSED transition
 */
async function validateValidatedToClosed(finding: Finding): Promise<TransitionValidation> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if all action plans are 100% complete
  const { data: actionPlans, error } = await supabase
    .from('action_plans')
    .select('id, completion_percentage, status')
    .eq('finding_id', finding.id);

  if (error) {
    errors.push('Failed to verify action plan status');
    return { valid: false, errors, warnings };
  }

  if (!actionPlans || actionPlans.length === 0) {
    errors.push('Cannot close finding without action plans');
    return { valid: false, errors, warnings };
  }

  const incompleteActions = actionPlans.filter(
    (ap) => ap.completion_percentage !== 100 || ap.status !== 'COMPLETED'
  );

  if (incompleteActions.length > 0) {
    errors.push(
      `Cannot close finding: ${incompleteActions.length} action plan(s) are not completed`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate state transition
 */
export async function validateTransition(
  finding: Finding,
  toState: FindingWorkflowState
): Promise<TransitionValidation> {
  const fromState = finding.workflow_state;

  // Check if transition is allowed
  if (!isTransitionAllowed(fromState, toState)) {
    return {
      valid: false,
      errors: [`Cannot transition from ${fromState} to ${toState}`],
      warnings: [],
    };
  }

  // Validate based on transition type
  if (fromState === 'DRAFT' && toState === 'ISSUED_FOR_RESPONSE') {
    return validateDraftToIssued(finding);
  }

  if (fromState === 'ISSUED_FOR_RESPONSE' && toState === 'VALIDATED') {
    return await validateIssuedToValidated(finding);
  }

  if (fromState === 'VALIDATED' && toState === 'CLOSED') {
    return await validateValidatedToClosed(finding);
  }

  // Default: allow transition with no validation
  return { valid: true, errors: [], warnings: [] };
}

/**
 * Execute state transition with validation
 */
export async function transitionFindingState(
  findingId: string,
  toState: FindingWorkflowState,
  userId: string,
  tenantId: string
): Promise<StateTransitionResult> {
  // Get current finding
  const { data: finding, error: fetchError } = await supabase
    .from('audit_findings')
    .select('*')
    .eq('id', findingId)
    .single();

  if (fetchError || !finding) {
    return {
      success: false,
      newState: 'DRAFT',
      error: 'Finding not found',
    };
  }

  // Validate transition
  const validation = await validateTransition(finding as Finding, toState);

  if (!validation.valid) {
    return {
      success: false,
      newState: finding.workflow_state as FindingWorkflowState,
      error: validation.errors.join('; '),
      validation,
    };
  }

  // Prepare update data
  const updateData: Record<string, unknown> = {
    workflow_state: toState,
  };

  // Set timestamps based on state
  if (toState === 'ISSUED_FOR_RESPONSE') {
    updateData.issued_at = new Date().toISOString();
    if (!finding.response_due_date) {
      // Default to 14 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      updateData.response_due_date = dueDate.toISOString().split('T')[0];
    }
  }

  if (toState === 'VALIDATED') {
    updateData.validated_at = new Date().toISOString();
  }

  if (toState === 'CLOSED') {
    updateData.closed_at = new Date().toISOString();
  }

  // Execute transition
  const { error: updateError } = await supabase
    .from('audit_findings')
    .update(updateData)
    .eq('id', findingId);

  if (updateError) {
    return {
      success: false,
      newState: finding.workflow_state as FindingWorkflowState,
      error: `Failed to update state: ${updateError.message}`,
    };
  }

  // Log transition to history (if table exists)
  try {
    await supabase.from('finding_history').insert({
      finding_id: findingId,
      changed_by: userId,
      change_type: 'STATE_CHANGE',
      old_value: finding.workflow_state,
      new_value: toState,
      tenant_id: tenantId,
    });
  } catch (err) {
    // History logging is optional
    console.warn('Could not log to finding_history:', err);
  }

  return {
    success: true,
    newState: toState,
    validation,
  };
}

/**
 * Get state machine status display info
 */
export function getStateDisplayInfo(state: FindingWorkflowState): {
  label: string;
  color: string;
  icon: string;
  description: string;
} {
  const stateInfo: Record<FindingWorkflowState, {
    label: string;
    color: string;
    icon: string;
    description: string;
  }> = {
    DRAFT: {
      label: 'Draft',
      color: 'slate',
      icon: 'FileEdit',
      description: 'Finding is being drafted by auditor',
    },
    ISSUED_FOR_RESPONSE: {
      label: 'Issued',
      color: 'blue',
      icon: 'Send',
      description: 'Issued to management for response',
    },
    UNDER_REVIEW: {
      label: 'Under Review',
      color: 'amber',
      icon: 'Eye',
      description: 'Auditor is reviewing management response',
    },
    VALIDATED: {
      label: 'Validated',
      color: 'green',
      icon: 'CheckCircle',
      description: 'Action plan validated and agreed',
    },
    CLOSED: {
      label: 'Closed',
      color: 'purple',
      icon: 'Lock',
      description: 'All actions completed and verified',
    },
  };

  return stateInfo[state];
}

/**
 * Get available actions for current state
 */
export function getAvailableActions(state: FindingWorkflowState): Array<{
  action: string;
  targetState: FindingWorkflowState;
  label: string;
  buttonClass: string;
}> {
  const actionMap: Record<FindingWorkflowState, Array<{
    action: string;
    targetState: FindingWorkflowState;
    label: string;
    buttonClass: string;
  }>> = {
    DRAFT: [
      {
        action: 'issue',
        targetState: 'ISSUED_FOR_RESPONSE',
        label: 'Issue to Management',
        buttonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      },
    ],
    ISSUED_FOR_RESPONSE: [
      {
        action: 'review',
        targetState: 'UNDER_REVIEW',
        label: 'Start Review',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      },
      {
        action: 'revise',
        targetState: 'DRAFT',
        label: 'Return to Draft',
        buttonClass: 'bg-slate-600 hover:bg-slate-700 text-white',
      },
    ],
    UNDER_REVIEW: [
      {
        action: 'validate',
        targetState: 'VALIDATED',
        label: 'Validate & Approve',
        buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
      },
      {
        action: 'reject',
        targetState: 'ISSUED_FOR_RESPONSE',
        label: 'Request Revision',
        buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
      },
    ],
    VALIDATED: [
      {
        action: 'close',
        targetState: 'CLOSED',
        label: 'Close Finding',
        buttonClass: 'bg-purple-600 hover:bg-purple-700 text-white',
      },
      {
        action: 'reopen',
        targetState: 'UNDER_REVIEW',
        label: 'Reopen for Review',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      },
    ],
    CLOSED: [
      {
        action: 'reopen',
        targetState: 'VALIDATED',
        label: 'Reopen Finding',
        buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
      },
    ],
  };

  return actionMap[state] || [];
}

// ─── GIAS 8.3 IRON GATE ──────────────────────────────────────────────────────

const QAIP_MINIMUM_SCORE = 70;

export type QAIPGateStatus = 'PASS' | 'WARN' | 'BLOCK';

export interface QAIPGateResult {
  status: QAIPGateStatus;
  score: number | null;
  message: string;
  reviewId: string | null;
}

/**
 * Fetches the latest QAIP review for a given audit engagement and determines
 * whether the closure transition is permitted.
 *
 * Gate Rules (GIAS 8.3):
 *  - No QAIP review found          → WARN  (transition allowed with warning)
 *  - score < QAIP_MINIMUM_SCORE    → BLOCK (transition forbidden)
 *  - score >= QAIP_MINIMUM_SCORE   → PASS
 */
export async function checkQAIPGate(
  engagementId: string,
): Promise<QAIPGateResult> {
  const { data: reviews, error } = await supabase
    .from('qaip_reviews')
    .select('id, compliance_score, total_score, status')
    .or(`engagement_id.eq.${engagementId},target_audit_id.eq.${engagementId}`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !reviews || reviews.length === 0) {
    return {
      status: 'WARN',
      score: null,
      message: 'QAIP Değerlendirmesi Eksik. Kapanış onaylandı ancak kayıt oluşturulması tavsiye edilir.',
      reviewId: null,
    };
  }

  const latest = reviews[0];
  const score: number = latest.compliance_score ?? latest.total_score ?? 0;

  if (score < QAIP_MINIMUM_SCORE) {
    return {
      status: 'BLOCK',
      score,
      message: `Kalite Puanı Yetersiz (Mevcut: ${score}). Minimum ${QAIP_MINIMUM_SCORE} gereklidir.`,
      reviewId: latest.id,
    };
  }

  return {
    status: 'PASS',
    score,
    message: `QAIP kontrolü geçildi. Puan: ${score}/100.`,
    reviewId: latest.id,
  };
}

export interface AuditClosureResult {
  success: boolean;
  gateResult: QAIPGateResult;
  surveyDispatched: boolean;
  surveyAssignmentId: string | null;
  message: string;
}

/**
 * Full GIAS 8.3 audit-closure protocol:
 * 1. Iron Gate — QAIP score check.
 * 2. Feedback Loop — auto-dispatch stakeholder satisfaction survey.
 *
 * Returns a structured result; never throws. The caller is responsible for
 * surfacing errors/toasts to the user.
 */
export async function executeAuditClosureProtocol(
  engagementId: string,
  auditeeId: string | null,
  tenantId: string,
  metadata?: Record<string, unknown>,
): Promise<AuditClosureResult> {
  const gateResult = await checkQAIPGate(engagementId);

  if (gateResult.status === 'BLOCK') {
    return {
      success: false,
      gateResult,
      surveyDispatched: false,
      surveyAssignmentId: null,
      message: gateResult.message,
    };
  }

  let surveyAssignmentId: string | null = null;
  let surveyDispatched = false;

  try {
    const template = await findStakeholderSatisfactionTemplate();
    if (template) {
      const assignment = await createSurveyAssignment({
        survey_id:     template.id,
        engagement_id: engagementId,
        auditee_id:    auditeeId ?? undefined,
        triggered_by:  'AUDIT_CLOSED',
        tenant_id:     tenantId,
        metadata:      metadata ?? {},
      });
      surveyAssignmentId = assignment.id;
      surveyDispatched   = true;
    }
  } catch {
    // Survey dispatch failure is non-fatal — log but do not block closure
  }

  return {
    success: true,
    gateResult,
    surveyDispatched,
    surveyAssignmentId,
    message: surveyDispatched
      ? 'Denetim kapatıldı. Memnuniyet anketi denetlenen birime gönderildi.'
      : 'Denetim kapatıldı. (Anket şablonu bulunamadı — manuel gönderim gerekli.)',
  };
}
