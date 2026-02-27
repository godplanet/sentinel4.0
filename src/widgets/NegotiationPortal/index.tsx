import { useState } from 'react';
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { useFinding } from '@/features/finding-hub';
import {
  useAcceptFinding,
  useDisputeFinding,
} from '@/features/auditee-portal/hooks/useAuditeeActions';
import type { Finding } from '@/entities/finding/model/types';

interface NegotiationPortalProps {
  findingId: string;
}

type WorkflowStage = 'REVIEW' | 'RESPONDING' | 'SUBMITTED';

export function NegotiationPortal({ findingId }: NegotiationPortalProps) {
  const { data: finding, isLoading } = useFinding(findingId);
  const acceptMutation = useAcceptFinding();
  const disputeMutation = useDisputeFinding();

  const [workflowStage, setWorkflowStage] = useState<WorkflowStage>('REVIEW');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);

  const [planTitle, setPlanTitle] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const handleAccept = () => {
    setIsAccepting(true);
    setIsDisputing(false);
    setWorkflowStage('RESPONDING');
  };

  const handleDispute = () => {
    setIsDisputing(true);
    setIsAccepting(false);
    setWorkflowStage('RESPONDING');
  };

  const handleSubmitAcceptance = () => {
    if (!planTitle || !planDescription || !responsiblePerson || !targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    acceptMutation.mutate(
      {
        findingId,
        planTitle,
        planDescription,
        responsiblePerson,
        targetDate,
      },
      {
        onSuccess: () => {
          setWorkflowStage('SUBMITTED');
        },
      }
    );
  };

  const handleSubmitDispute = () => {
    if (!disputeReason.trim()) {
      alert('Please provide a reason for disputing');
      return;
    }

    disputeMutation.mutate(
      {
        findingId,
        disputeReason,
      },
      {
        onSuccess: () => {
          setWorkflowStage('SUBMITTED');
        },
      }
    );
  };

  const getRiskIcon = (risk?: string) => {
    switch (risk) {
      case 'HIGH':
        return <AlertTriangle className="h-16 w-16 text-red-500" />;
      case 'MEDIUM':
        return <Shield className="h-16 w-16 text-orange-500" />;
      case 'LOW':
        return <Shield className="h-16 w-16 text-yellow-500" />;
      default:
        return <Shield className="h-16 w-16 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" />
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 text-xl">Finding not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 h-screen overflow-hidden">
      <div className="col-span-7 bg-gradient-to-br from-white to-slate-50 overflow-auto">
        <div className="p-8 max-w-4xl mx-auto">
          <div className="backdrop-blur-xl bg-white/95 rounded-2xl border border-gray-200/50 shadow-xl p-8 space-y-8">
            <div className="text-center pb-6 border-b border-gray-200">
              <div className="flex justify-center mb-4">{getRiskIcon(finding.risk_rating)}</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{finding.title}</h1>
              <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
                <span className="font-mono">{finding.finding_code || finding.code}</span>
                <span>•</span>
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    finding.risk_rating === 'HIGH'
                      ? 'bg-red-100 text-red-700'
                      : finding.risk_rating === 'MEDIUM'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {finding.risk_rating || 'N/A'} Risk
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Finding Description</h2>
              </div>
              <div className="bg-blue-50/50 rounded-lg p-6 border border-blue-100">
                <p className="text-gray-700 leading-relaxed">
                  {finding.description_public || finding.description || 'No description available'}
                </p>
              </div>
            </div>

            {finding.impact_html && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Impact</h2>
                </div>
                <div className="bg-orange-50/50 rounded-lg p-6 border border-orange-100">
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: finding.impact_html }}
                  />
                </div>
              </div>
            )}

            {finding.recommendation_html && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
                </div>
                <div className="bg-green-50/50 rounded-lg p-6 border border-green-100">
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: finding.recommendation_html }}
                  />
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Published</p>
                    <p className="text-sm font-medium text-gray-900">
                      {finding.published_at
                        ? new Date(finding.published_at).toLocaleDateString()
                        : 'Not published'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-sm font-medium text-gray-900">{finding.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-5 bg-slate-50 border-l border-slate-200 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Response</h2>
            <WorkflowStepper currentStage={workflowStage} />
          </div>

          {workflowStage === 'REVIEW' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Please review the finding and choose your response:
              </p>
              <button
                onClick={handleAccept}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg shadow-lg"
              >
                <CheckCircle className="h-6 w-6" />
                Accept Finding & Propose Action Plan
              </button>
              <button
                onClick={handleDispute}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-lg shadow-lg"
              >
                <XCircle className="h-6 w-6" />
                Dispute Finding
              </button>
            </div>
          )}

          {workflowStage === 'RESPONDING' && isAccepting && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Action Plan Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Title *
                    </label>
                    <input
                      type="text"
                      value={planTitle}
                      onChange={(e) => setPlanTitle(e.target.value)}
                      placeholder="Brief title for your action plan"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan Description *
                    </label>
                    <textarea
                      value={planDescription}
                      onChange={(e) => setPlanDescription(e.target.value)}
                      placeholder="Describe the actions you will take to address this finding"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Responsible Person *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={responsiblePerson}
                        onChange={(e) => setResponsiblePerson(e.target.value)}
                        placeholder="Name and title of responsible person"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Completion Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitAcceptance}
                  disabled={acceptMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {acceptMutation.isPending ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5" />
                      Submit Plan
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setWorkflowStage('REVIEW');
                    setIsAccepting(false);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {workflowStage === 'RESPONDING' && isDisputing && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispute Reason</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please explain why you are disputing this finding *
                  </label>
                  <textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Provide detailed explanation for your dispute"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSubmitDispute}
                  disabled={disputeMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50"
                >
                  {disputeMutation.isPending ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="h-5 w-5" />
                      Submit Dispute
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setWorkflowStage('REVIEW');
                    setIsDisputing(false);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {workflowStage === 'SUBMITTED' && (
            <div className="bg-white rounded-lg border border-slate-200 p-8 shadow-sm text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Response Submitted</h3>
              <p className="text-gray-600 mb-6">
                Your response has been successfully submitted to the audit team.
              </p>
              {isAccepting && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-800">
                    The audit team will review your proposed action plan and provide feedback
                    shortly.
                  </p>
                </div>
              )}
              {isDisputing && (
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <p className="text-sm text-orange-800">
                    The audit team will review your dispute and follow up with you to discuss
                    further.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface WorkflowStepperProps {
  currentStage: WorkflowStage;
}

function WorkflowStepper({ currentStage }: WorkflowStepperProps) {
  const steps = [
    { id: 'REVIEW', label: 'Review Finding' },
    { id: 'RESPONDING', label: 'Prepare Response' },
    { id: 'SUBMITTED', label: 'Submitted' },
  ];

  const currentIndex = steps.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                index <= currentIndex
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`text-sm mt-2 font-medium ${
                index <= currentIndex ? 'text-blue-600' : 'text-gray-500'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`h-1 flex-1 mx-2 rounded-full transition-colors ${
                index < currentIndex ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
