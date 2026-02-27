/**
 * WORKFLOW PROGRESS BAR (Chevron Style)
 *
 * Visual representation of finding lifecycle state machine.
 * Shows: Draft > Issued > Review > Validated > Closed
 */

import { CheckCircle, Circle } from 'lucide-react';
import type { FindingWorkflowState } from '../workflow';

interface WorkflowProgressBarProps {
  currentState: FindingWorkflowState;
  compact?: boolean;
}

interface Step {
  state: FindingWorkflowState;
  label: string;
  shortLabel: string;
}

const steps: Step[] = [
  { state: 'DRAFT', label: 'Draft', shortLabel: 'Draft' },
  { state: 'ISSUED_FOR_RESPONSE', label: 'Issued', shortLabel: 'Issued' },
  { state: 'UNDER_REVIEW', label: 'Review', shortLabel: 'Review' },
  { state: 'VALIDATED', label: 'Validated', shortLabel: 'Valid.' },
  { state: 'CLOSED', label: 'Closed', shortLabel: 'Closed' },
];

const stateOrder: Record<FindingWorkflowState, number> = {
  DRAFT: 0,
  ISSUED_FOR_RESPONSE: 1,
  UNDER_REVIEW: 2,
  VALIDATED: 3,
  CLOSED: 4,
};

export function WorkflowProgressBar({ currentState, compact = false }: WorkflowProgressBarProps) {
  const currentIndex = stateOrder[currentState];

  const getStepStatus = (index: number): 'completed' | 'current' | 'upcoming' => {
    if (index < currentIndex) return 'completed';
    if (index === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStepColor = (status: 'completed' | 'current' | 'upcoming'): string => {
    if (status === 'completed') return 'bg-green-500 text-white border-green-500';
    if (status === 'current') return 'bg-blue-600 text-white border-blue-600';
    return 'bg-slate-200 text-slate-500 border-slate-300';
  };

  const getLineColor = (status: 'completed' | 'current' | 'upcoming'): string => {
    if (status === 'completed') return 'bg-green-500';
    return 'bg-slate-300';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.state} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${getStepColor(
                  status
                )}`}
              >
                {status === 'completed' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              {!isLast && (
                <div className={`w-6 h-0.5 mx-1 ${getLineColor(status)}`} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.state} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${getStepColor(
                    status
                  )}`}
                >
                  {status === 'completed' ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : status === 'current' ? (
                    <Circle className="w-6 h-6 fill-current" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-sm font-medium ${
                      status === 'current'
                        ? 'text-blue-900'
                        : status === 'completed'
                        ? 'text-green-700'
                        : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </div>
                </div>
              </div>
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-2 transition-all ${getLineColor(
                    status
                  )}`}
                  style={{ marginTop: '-20px' }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorkflowChevronBar({ currentState }: WorkflowProgressBarProps) {
  const currentIndex = stateOrder[currentState];

  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex;
        const isCompleted = index < currentIndex;
        const isUpcoming = index > currentIndex;

        return (
          <div
            key={step.state}
            className={`relative flex items-center justify-center px-6 py-2 text-sm font-medium transition-all ${
              isCompleted
                ? 'bg-green-500 text-white'
                : isCurrent
                ? 'bg-blue-600 text-white'
                : 'bg-slate-200 text-slate-500'
            }`}
            style={{
              clipPath:
                index === 0
                  ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%)'
                  : index === steps.length - 1
                  ? 'polygon(12px 0, 100% 0, 100% 100%, 12px 100%, 0 50%)'
                  : 'polygon(12px 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 12px 100%, 0 50%)',
              minWidth: '120px',
            }}
          >
            <span className="relative z-10">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
