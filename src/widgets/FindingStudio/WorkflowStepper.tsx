import { Check, Circle, Clock, AlertTriangle, Lock } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

interface WorkflowStep {
  key: string;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

export interface ActionPlan {
  id: string;
  agreement_status: 'PENDING' | 'AGREED' | 'DISAGREED';
  owner_user_id?: string;
  due_date?: string;
  disagreement_reason?: string;
  risk_acceptance_confirmed?: boolean;
}

interface WorkflowStepperProps {
  currentStatus: string;
  actionPlans: ActionPlan[];
  onStatusChange?: (newStatus: string) => void;
  hasReviewerSignature?: boolean;
}

const WORKFLOW_STAGES = [
  { key: 'draft', label: 'TASLAK' },
  { key: 'review', label: 'GÖZDEN GEÇİRME' },
  { key: 'negotiation', label: 'MUTABAKAT' },
  { key: 'tracking', label: 'TAKİP' },
  { key: 'closed', label: 'KAPANIŞ' }
];

export function WorkflowStepper({
  currentStatus,
  actionPlans,
  onStatusChange,
  hasReviewerSignature = false
}: WorkflowStepperProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const currentIndex = WORKFLOW_STAGES.findIndex(s => s.key === currentStatus);

  const steps: WorkflowStep[] = WORKFLOW_STAGES.map((stage, index) => ({
    ...stage,
    status: index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'pending'
  }));

  // Validation logic for moving to "MUTABAKAT" (negotiation) stage
  const validateTransitionToNegotiation = (): { valid: boolean; error?: string } => {
    if (!hasReviewerSignature) {
      return {
        valid: false,
        error: 'Bulgu henüz yönetici tarafından onaylanmadı. Mutabakat aşamasına geçiş için yönetici imzası zorunludur.'
      };
    }
    return { valid: true };
  };

  // Validation logic for moving to "TAKİP" (tracking) stage
  const validateTransitionToTracking = (): { valid: boolean; error?: string } => {
    if (actionPlans.length === 0) {
      return { valid: false, error: 'En az bir aksiyon planı oluşturulmalıdır.' };
    }

    for (const plan of actionPlans) {
      if (plan.agreement_status === 'PENDING') {
        return {
          valid: false,
          error: 'Tüm aksiyon planları için mutabakat durumu belirlenmeli (Mutabıkım veya Mutabık Değilim).'
        };
      }

      if (plan.agreement_status === 'AGREED') {
        if (!plan.owner_user_id || !plan.due_date) {
          return {
            valid: false,
            error: 'Mutabık olunan aksiyonlar için sorumlu kişi ve termin tarihi zorunludur.'
          };
        }
      }

      if (plan.agreement_status === 'DISAGREED') {
        if (!plan.disagreement_reason || plan.disagreement_reason.length < 20) {
          return {
            valid: false,
            error: 'Mutabık olunmayan aksiyonlar için itiraz gerekçesi (min. 20 karakter) zorunludur.'
          };
        }
        if (!plan.risk_acceptance_confirmed) {
          return {
            valid: false,
            error: 'Mutabık olunmayan aksiyonlar için risk kabul onayı verilmelidir.'
          };
        }
      }
    }

    return { valid: true };
  };

  const handleStepClick = (targetStage: string) => {
    if (!onStatusChange) return;

    const targetIndex = WORKFLOW_STAGES.findIndex(s => s.key === targetStage);

    // Can't skip forward more than one step
    if (targetIndex > currentIndex + 1) {
      setValidationError('Aşamaları atlayamazsınız. Sırayla ilerlemelisiniz.');
      setTimeout(() => setValidationError(null), 4000);
      return;
    }

    // Can't go backward
    if (targetIndex < currentIndex) {
      setValidationError('Geriye doğru hareket edemezsiniz. Aşamalar tek yönlüdür.');
      setTimeout(() => setValidationError(null), 4000);
      return;
    }

    // Special validation when moving from GÖZDEN GEÇİRME to MUTABAKAT
    if (currentStatus === 'review' && targetStage === 'negotiation') {
      const validation = validateTransitionToNegotiation();
      if (!validation.valid) {
        setValidationError(validation.error!);
        setTimeout(() => setValidationError(null), 6000);
        return;
      }
    }

    // Special validation when moving from MUTABAKAT to TAKİP
    if (currentStatus === 'negotiation' && targetStage === 'tracking') {
      const validation = validateTransitionToTracking();
      if (!validation.valid) {
        setValidationError(validation.error!);
        setTimeout(() => setValidationError(null), 6000);
        return;
      }
    }

    setValidationError(null);
    onStatusChange(targetStage);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const canClick = onStatusChange && index <= currentIndex + 1;
          const isBlockedBySignature = currentStatus === 'review' && step.key === 'negotiation' && !hasReviewerSignature;
          const isBlockedByAgreement = currentStatus === 'negotiation' && step.key === 'tracking';
          const isBlocked = isBlockedBySignature || isBlockedByAgreement;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => canClick && handleStepClick(step.key)}
                    disabled={!canClick}
                    className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all font-semibold text-sm relative',
                      step.status === 'completed' && 'bg-blue-600 text-white shadow-md',
                      step.status === 'active' && 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg ring-4 ring-blue-100',
                      step.status === 'pending' && 'bg-slate-200 text-slate-400',
                      canClick && step.status !== 'completed' && 'hover:scale-110 cursor-pointer',
                      !canClick && 'cursor-not-allowed'
                    )}
                  >
                    {step.status === 'completed' ? (
                      <Check size={18} strokeWidth={3} />
                    ) : step.status === 'active' ? (
                      <Clock size={18} />
                    ) : (
                      <Circle size={10} fill="currentColor" />
                    )}
                    {isBlocked && (
                      <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                        <Lock size={12} />
                      </div>
                    )}
                  </button>
                </div>

                <div
                  className={clsx(
                    'text-xs font-bold tracking-wide transition-colors whitespace-nowrap',
                    step.status === 'completed' && 'text-blue-600',
                    step.status === 'active' && 'text-blue-700',
                    step.status === 'pending' && 'text-slate-400'
                  )}
                >
                  {step.label}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={clsx(
                    'w-24 h-0.5 mx-4 transition-colors',
                    index < currentIndex ? 'bg-blue-600' : 'bg-slate-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Validation Error Toast */}
      {validationError && (
        <div className="bg-red-100 border-2 border-red-500 rounded-lg px-4 py-3 text-sm text-red-900 flex items-start gap-3 animate-pulse shadow-lg">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold mb-1">⛔ İşlem Engellendi</div>
            <div>{validationError}</div>
          </div>
        </div>
      )}
    </div>
  );
}
