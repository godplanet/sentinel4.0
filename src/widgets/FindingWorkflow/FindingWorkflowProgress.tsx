import { Check, Clock, AlertCircle, FileText } from 'lucide-react';
import clsx from 'clsx';

export type WorkflowStage =
  | 'DRAFT'
  | 'SENT_TO_AUDITEE'
  | 'AUDITEE_REVIEWING'
  | 'AUDITEE_ACCEPTED'
  | 'AUDITEE_OBJECTED'
  | 'AUDITOR_REVIEWING'
  | 'MANAGER_REVIEWING'
  | 'NEGOTIATION'
  | 'CONSENSUS_REACHED'
  | 'FINAL'
  | 'REMEDIATION_STARTED'
  | 'REMEDIATION_COMPLETED'
  | 'VERIFIED'
  | 'CLOSED';

interface WorkflowStep {
  id: string;
  label: string;
  stage: WorkflowStage;
  icon: React.ComponentType<{ className?: string }>;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: '1',
    label: 'Taslak',
    stage: 'DRAFT',
    icon: FileText,
  },
  {
    id: '2',
    label: 'İnceleme',
    stage: 'AUDITEE_REVIEWING',
    icon: Clock,
  },
  {
    id: '3',
    label: 'Yanıt',
    stage: 'AUDITEE_ACCEPTED',
    icon: Check,
  },
  {
    id: '4',
    label: 'Kesinleşti',
    stage: 'FINAL',
    icon: Check,
  },
];

interface FindingWorkflowProgressProps {
  currentStage: WorkflowStage;
  dueDate?: string;
  className?: string;
}

export const FindingWorkflowProgress = ({
  currentStage,
  dueDate,
  className,
}: FindingWorkflowProgressProps) => {
  const getStepStatus = (step: WorkflowStep) => {
    const stageOrder: Record<WorkflowStage, number> = {
      DRAFT: 1,
      SENT_TO_AUDITEE: 2,
      AUDITEE_REVIEWING: 2,
      AUDITEE_ACCEPTED: 3,
      AUDITEE_OBJECTED: 3,
      AUDITOR_REVIEWING: 3,
      MANAGER_REVIEWING: 3,
      NEGOTIATION: 3,
      CONSENSUS_REACHED: 3,
      FINAL: 4,
      REMEDIATION_STARTED: 4,
      REMEDIATION_COMPLETED: 4,
      VERIFIED: 4,
      CLOSED: 4,
    };

    const currentOrder = stageOrder[currentStage] || 0;
    const stepOrder = stageOrder[step.stage] || 0;

    if (currentOrder > stepOrder) return 'completed';
    if (currentOrder === stepOrder) return 'current';
    return 'upcoming';
  };

  const getCurrentStageLabel = () => {
    const labels: Record<WorkflowStage, string> = {
      DRAFT: 'Taslak Aşamasında',
      SENT_TO_AUDITEE: 'Denetlenene Gönderildi',
      AUDITEE_REVIEWING: 'İnceleme Aşamasında',
      AUDITEE_ACCEPTED: 'Kabul Edildi',
      AUDITEE_OBJECTED: 'İtiraz Edildi',
      AUDITOR_REVIEWING: 'Müfettiş İncelemesinde',
      MANAGER_REVIEWING: 'Yönetici Onayında',
      NEGOTIATION: 'Müzakere Aşamasında',
      CONSENSUS_REACHED: 'Mutabakata Varıldı',
      FINAL: 'Kesinleşti',
      REMEDIATION_STARTED: 'Giderim Başladı',
      REMEDIATION_COMPLETED: 'Giderim Tamamlandı',
      VERIFIED: 'Doğrulandı',
      CLOSED: 'Kapatıldı',
    };
    return labels[currentStage] || currentStage;
  };

  return (
    <div className={clsx('bg-white/80 backdrop-blur-xl rounded-lg border border-gray-200', className)}>
      {/* Current Status Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600 font-medium">Bulgu Durumu</div>
              <div className="text-lg font-semibold text-gray-900">{getCurrentStageLabel()}</div>
            </div>
          </div>
          {dueDate && (
            <div className="text-right">
              <div className="text-xs text-gray-600">Son Yanıt Tarihi</div>
              <div className="text-sm font-semibold text-orange-600">
                {new Date(dueDate).toLocaleDateString('tr-TR')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="px-6 py-6">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-green-500 transition-all duration-500"
            style={{
              width: `${(WORKFLOW_STEPS.findIndex((s) => getStepStatus(s) === 'current') / (WORKFLOW_STEPS.length - 1)) * 100}%`,
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {WORKFLOW_STEPS.map((step, index) => {
              const status = getStepStatus(step);
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                      status === 'completed'
                        ? 'bg-green-500 border-green-500 text-white'
                        : status === 'current'
                          ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                          : 'bg-white border-gray-300 text-gray-400'
                    )}
                  >
                    {status === 'completed' ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <div
                      className={clsx(
                        'text-xs font-medium',
                        status === 'current'
                          ? 'text-blue-600'
                          : status === 'completed'
                            ? 'text-green-600'
                            : 'text-gray-500'
                      )}
                    >
                      {step.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Required Notice (if in review stage) */}
      {currentStage === 'AUDITEE_REVIEWING' && (
        <div className="px-6 py-4 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-blue-900">Aksiyon Gerekli</div>
              <div className="text-xs text-blue-700 mt-0.5">
                Bu bulguyu incelemeniz ve yanıt vermeniz geklenmektedir
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Objection Notice */}
      {currentStage === 'AUDITEE_OBJECTED' && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-100">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-red-900">İtiraz Edildi</div>
              <div className="text-xs text-red-700 mt-0.5">
                Risk kabul belgesi yüklenmesi gerekmektedir
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
