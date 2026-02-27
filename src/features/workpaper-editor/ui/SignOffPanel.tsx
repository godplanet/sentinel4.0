/**
 * SIGN-OFF PANEL WITH STATE MACHINE VALIDATION
 * Enforces strict quality control rules
 */

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { XPEngine, formatXPToast } from '@/features/talent-os/lib/XPEngine';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  User,
  Shield,
  Crown,
  Loader2,
} from 'lucide-react';
import {
  canUserSignOff,
  signOffAsPreparer,
  signOffAsReviewer,
  rejectWorkpaper,
  getApprovalHistory,
  type SignOffValidationResult,
  type WorkpaperApprovalStatus,
} from '../workflow';

interface SignOffPanelProps {
  workpaperId: string;
  currentUserId?: string;
  onSignOffComplete?: () => void;
}

export function SignOffPanel({
  workpaperId,
  currentUserId = '11111111-1111-1111-1111-111111111111',
  onSignOffComplete,
}: SignOffPanelProps) {
  const [approvalStatus, setApprovalStatus] = useState<WorkpaperApprovalStatus>('in_progress');
  const [preparerValidation, setPreparerValidation] = useState<SignOffValidationResult | null>(null);
  const [reviewerValidation, setReviewerValidation] = useState<SignOffValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigning, setIsSigning] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [history, setHistory] = useState<any>(null);

  useEffect(() => {
    loadValidation();
  }, [workpaperId]);

  const loadValidation = async () => {
    setIsLoading(true);
    try {
      const [prepValidation, revValidation, historyData] = await Promise.all([
        canUserSignOff(workpaperId, 'preparer', currentUserId),
        canUserSignOff(workpaperId, 'reviewer', currentUserId),
        getApprovalHistory(workpaperId),
      ]);

      setPreparerValidation(prepValidation);
      setReviewerValidation(revValidation);
      setApprovalStatus(historyData.current_status as WorkpaperApprovalStatus);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load validation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignAsPreparer = async () => {
    setIsSigning(true);
    try {
      const result = await signOffAsPreparer(workpaperId, currentUserId);
      if (result.success) {
        await loadValidation();
        onSignOffComplete?.();
        XPEngine.awardWorkpaperXP(currentUserId, 85)
          .then((xpResult) => {
            if (xpResult.awarded) {
              const msg = formatXPToast(xpResult);
              toast.success(`XP Gained! ${msg}`, {
                icon: '📋',
                style: {
                  background: '#0f172a',
                  color: '#4ade80',
                  border: '1px solid rgba(74,222,128,0.3)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                },
                duration: 3500,
              });
            }
          })
          .catch(console.warn);
      } else {
        alert(`Cannot sign off:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Sign-off failed:', error);
      alert('Sign-off failed. Check console for details.');
    } finally {
      setIsSigning(false);
    }
  };

  const handleSignAsReviewer = async () => {
    setIsSigning(true);
    try {
      const result = await signOffAsReviewer(workpaperId, currentUserId);
      if (result.success) {
        await loadValidation();
        onSignOffComplete?.();
        XPEngine.awardWorkpaperXP(currentUserId, 92)
          .then((xpResult) => {
            if (xpResult.awarded) {
              const msg = formatXPToast(xpResult);
              toast.success(`XP Gained! ${msg}`, {
                icon: '⭐',
                style: {
                  background: '#0f172a',
                  color: '#4ade80',
                  border: '1px solid rgba(74,222,128,0.3)',
                  fontFamily: 'monospace',
                  fontSize: '13px',
                },
                duration: 3500,
              });
            }
          })
          .catch(console.warn);
      } else {
        alert(`Cannot sign off:\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      console.error('Sign-off failed:', error);
      alert('Sign-off failed. Check console for details.');
    } finally {
      setIsSigning(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsSigning(true);
    try {
      const rejectedBy = approvalStatus === 'prepared' ? 'reviewer' : 'manager';
      await rejectWorkpaper(workpaperId, rejectedBy, rejectReason, currentUserId);
      setShowRejectModal(false);
      setRejectReason('');
      await loadValidation();
      onSignOffComplete?.();
    } catch (error) {
      console.error('Reject failed:', error);
      alert('Reject failed. Check console for details.');
    } finally {
      setIsSigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const getStatusColor = () => {
    switch (approvalStatus) {
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'prepared':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reviewed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = () => {
    switch (approvalStatus) {
      case 'in_progress':
        return <Clock className="w-5 h-5" />;
      case 'prepared':
        return <User className="w-5 h-5" />;
      case 'reviewed':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-white">
              <Shield className="w-6 h-6" />
              <div>
                <div className="font-bold text-lg">Sign-Off Workflow</div>
                <div className="text-blue-100 text-sm">Quality Control Enforcement</div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 flex items-center gap-2 font-semibold ${getStatusColor()}`}>
              {getStatusIcon()}
              {approvalStatus.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${approvalStatus !== 'in_progress' ? 'bg-green-100' : 'bg-slate-100'}`}>
                <User className={`w-5 h-5 ${approvalStatus !== 'in_progress' ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-1">
                  1. Preparer Sign-Off
                </div>
                {history?.prepared_at ? (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Signed by {history.prepared_by || 'User'} on{' '}
                    {new Date(history.prepared_at).toLocaleString()}
                  </div>
                ) : (
                  <>
                    {preparerValidation?.errors && preparerValidation.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                        {preparerValidation.errors.map((error, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-red-700">
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {preparerValidation?.warnings && preparerValidation.warnings.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                        {preparerValidation.warnings.map((warning, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-yellow-700">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{warning}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={handleSignAsPreparer}
                      disabled={!preparerValidation?.canSignOff || isSigning}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSigning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Signing...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Sign as Preparer
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${approvalStatus === 'reviewed' ? 'bg-green-100' : 'bg-slate-100'}`}>
                <Shield className={`w-5 h-5 ${approvalStatus === 'reviewed' ? 'text-green-600' : 'text-slate-400'}`} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-1">
                  2. Reviewer Sign-Off
                </div>
                {history?.reviewed_at ? (
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Signed by {history.reviewed_by || 'User'} on{' '}
                    {new Date(history.reviewed_at).toLocaleString()}
                  </div>
                ) : (
                  <>
                    {reviewerValidation?.errors && reviewerValidation.errors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                        {reviewerValidation.errors.map((error, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-red-700">
                            <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>{error}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSignAsReviewer}
                        disabled={!reviewerValidation?.canSignOff || isSigning}
                        className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSigning ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Signing...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Sign as Reviewer
                          </>
                        )}
                      </button>
                      {approvalStatus === 'prepared' && (
                        <button
                          onClick={() => setShowRejectModal(true)}
                          disabled={isSigning}
                          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 opacity-50">
              <div className="p-2 rounded-lg bg-slate-100">
                <Crown className="w-5 h-5 text-slate-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900 mb-1">
                  3. Manager Sign-Off
                </div>
                <div className="text-sm text-slate-500">
                  Final approval (available after reviewer signs)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1 text-sm text-blue-800">
                <div className="font-semibold mb-1">Workflow Rules:</div>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Preparer must sign before Reviewer</li>
                  <li>Failed test steps require a Finding to be created</li>
                  <li>Reviewer cannot be the same person as Preparer</li>
                  <li>Rejection wipes all signatures and reverts to In Progress</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <XCircle className="w-6 h-6 text-red-600" />
                Reject Workpaper
              </h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this workpaper is being rejected..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2 text-sm text-yellow-800">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <div>
                    <strong>Warning:</strong> This will wipe the Preparer's signature and revert the workpaper to "In Progress" status.
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isSigning}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
