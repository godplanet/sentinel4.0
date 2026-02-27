/**
 * WORKFLOW ACTION BUTTONS
 *
 * Context-aware buttons that trigger state transitions.
 * Displays validation errors in modal before transition.
 */

import { useState } from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { transitionFindingState, getAvailableActions, type FindingWorkflowState } from '../workflow';
import {
  notifyFindingIssued,
  notifyFindingValidated,
  notifyFindingClosed,
} from '../notifications';

interface WorkflowActionButtonsProps {
  findingId: string;
  currentState: FindingWorkflowState;
  auditeeId?: string;
  responseDueDate?: string;
  onStateChange: (newState: FindingWorkflowState) => void;
  userId: string;
  tenantId: string;
}

export function WorkflowActionButtons({
  findingId,
  currentState,
  auditeeId,
  responseDueDate,
  onStateChange,
  userId,
  tenantId,
}: WorkflowActionButtonsProps) {
  const [loading, setLoading] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  const actions = getAvailableActions(currentState);

  const handleAction = async (targetState: FindingWorkflowState) => {
    setLoading(true);
    setValidationErrors([]);
    setValidationWarnings([]);

    try {
      const result = await transitionFindingState(findingId, targetState, userId, tenantId);

      if (!result.success) {
        setValidationErrors([result.error || 'Unknown error']);
        setShowValidationModal(true);
        setLoading(false);
        return;
      }

      if (result.validation && (result.validation.errors.length > 0 || result.validation.warnings.length > 0)) {
        setValidationErrors(result.validation.errors);
        setValidationWarnings(result.validation.warnings);
        setShowValidationModal(true);
        setLoading(false);
        return;
      }

      // Trigger notifications
      if (targetState === 'ISSUED_FOR_RESPONSE' && auditeeId && responseDueDate) {
        const { data: finding } = await supabase
          .from('audit_findings')
          .select('title')
          .eq('id', findingId)
          .single();

        if (finding) {
          await notifyFindingIssued(
            findingId,
            finding.title,
            auditeeId,
            responseDueDate,
            tenantId
          );
        }
      }

      if (targetState === 'VALIDATED' && auditeeId) {
        const { data: finding } = await supabase
          .from('audit_findings')
          .select('title')
          .eq('id', findingId)
          .single();

        if (finding) {
          await notifyFindingValidated(findingId, finding.title, auditeeId, tenantId);
        }
      }

      if (targetState === 'CLOSED' && auditeeId) {
        const { data: finding } = await supabase
          .from('audit_findings')
          .select('title')
          .eq('id', findingId)
          .single();

        if (finding) {
          await notifyFindingClosed(findingId, finding.title, auditeeId, tenantId);
        }
      }

      onStateChange(targetState);
    } catch (error) {
      console.error('Transition error:', error);
      setValidationErrors(['An unexpected error occurred']);
      setShowValidationModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3 flex-wrap">
        {actions.map((action) => (
          <button
            key={action.action}
            onClick={() => handleAction(action.targetState)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${action.buttonClass} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : action.label}
          </button>
        ))}
      </div>

      {showValidationModal && (
        <ValidationModal
          errors={validationErrors}
          warnings={validationWarnings}
          onClose={() => setShowValidationModal(false)}
        />
      )}
    </>
  );
}

interface ValidationModalProps {
  errors: string[];
  warnings: string[];
  onClose: () => void;
}

function ValidationModal({ errors, warnings, onClose }: ValidationModalProps) {
  const isBlocked = errors.length > 0;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isBlocked ? 'bg-rose-500/20' : 'bg-amber-500/20'}`}>
                <AlertTriangle className={`w-5 h-5 ${isBlocked ? 'text-rose-400' : 'text-amber-400'}`} />
              </div>
              <h3 className="text-base font-semibold text-white">
                {isBlocked ? 'Geçiş Engellendi' : 'Doğrulama Uyarıları'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/8 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mb-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
                <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-rose-300 text-sm mb-2">
                    Devam edilemiyor:
                  </h4>
                  <ul className="space-y-1 text-sm text-rose-400/80">
                    {errors.map((error, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="mb-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-300 text-sm mb-2">
                    Uyarılar:
                  </h4>
                  <ul className="space-y-1 text-sm text-amber-400/80">
                    {warnings.map((warning, index) => (
                      <li key={index} className="flex items-start gap-1.5">
                        <span className="mt-1 w-1 h-1 rounded-full bg-amber-500 flex-shrink-0" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-medium transition-colors border border-white/8"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
