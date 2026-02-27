import { CheckCircle2, Clock, XCircle, Send, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface WorkflowStep {
  key: string;
  label: string;
}

interface WorkflowStatusBarProps {
  steps: WorkflowStep[];
  currentStep: string;
  completedSteps?: string[];
  rejectedStep?: string | null;
  size?: 'sm' | 'md';
  onStepClick?: (step: string) => void;
}

const DEFAULT_STEPS: WorkflowStep[] = [
  { key: 'DRAFT', label: 'Taslak' },
  { key: 'SUBMITTED', label: 'Gonderildi' },
  { key: 'REVIEW', label: 'Inceleme' },
  { key: 'APPROVED', label: 'Onaylandi' },
];

export function WorkflowStatusBar({
  steps = DEFAULT_STEPS,
  currentStep,
  completedSteps = [],
  rejectedStep = null,
  size = 'md',
  onStepClick,
}: WorkflowStatusBarProps) {
  const currentIdx = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center w-full">
      {steps.map((step, idx) => {
        const isCompleted = completedSteps.includes(step.key) || idx < currentIdx;
        const isCurrent = step.key === currentStep;
        const isRejected = step.key === rejectedStep;
        const isFuture = idx > currentIdx && !isCompleted;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStepClick?.(step.key)}
              disabled={!onStepClick}
              className={clsx(
                'flex items-center gap-2 transition-all',
                onStepClick && 'cursor-pointer hover:opacity-80',
                !onStepClick && 'cursor-default'
              )}
            >
              <div className={clsx(
                'rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                size === 'sm' ? 'w-7 h-7' : 'w-9 h-9',
                isRejected && 'bg-red-600 text-white',
                isCompleted && !isRejected && 'bg-green-600 text-white',
                isCurrent && !isRejected && 'bg-blue-600 text-white ring-4 ring-blue-100',
                isFuture && 'bg-slate-200 text-slate-400',
              )}>
                {isRejected ? (
                  <XCircle size={size === 'sm' ? 14 : 18} />
                ) : isCompleted ? (
                  <CheckCircle2 size={size === 'sm' ? 14 : 18} />
                ) : isCurrent ? (
                  <Clock size={size === 'sm' ? 14 : 18} />
                ) : (
                  <span className={clsx('font-bold', size === 'sm' ? 'text-[10px]' : 'text-xs')}>{idx + 1}</span>
                )}
              </div>

              <span className={clsx(
                'font-semibold whitespace-nowrap',
                size === 'sm' ? 'text-[10px]' : 'text-xs',
                isRejected && 'text-red-700',
                isCompleted && !isRejected && 'text-green-700',
                isCurrent && !isRejected && 'text-blue-700',
                isFuture && 'text-slate-400',
              )}>
                {step.label}
              </span>
            </button>

            {idx < steps.length - 1 && (
              <div className="flex-1 mx-2">
                <div className={clsx(
                  'h-0.5 rounded-full transition-all',
                  idx < currentIdx ? 'bg-green-400' : 'bg-slate-200'
                )} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
