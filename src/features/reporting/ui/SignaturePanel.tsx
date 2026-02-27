import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertTriangle, Lock, Shield, FileCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ReportSignature, SignatureStep } from '@/entities/report/model/types';
import {
  getReportSignatures,
  getSignatureChainStatus,
  approveReport,
  approveWithDissent,
  rejectReport,
  getSignatureWorkflow,
} from '../api/signature-api';

interface SignaturePanelProps {
  reportId: string;
  reportStatus: string;
  onStatusChange?: () => void;
  readOnly?: boolean;
  currentUserRole?: string;
  currentUserName?: string;
}

export function SignaturePanel({
  reportId,
  reportStatus,
  onStatusChange,
  readOnly = false,
  currentUserRole = 'CREATOR',
  currentUserName = 'Demo User',
}: SignaturePanelProps) {
  const [signatures, setSignatures] = useState<ReportSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDissentModal, setShowDissentModal] = useState(false);
  const [dissentComment, setDissentComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [canSign, setCanSign] = useState(false);
  const [nextStep, setNextStep] = useState<SignatureStep | null>(null);

  const workflow = getSignatureWorkflow();

  useEffect(() => {
    loadSignatures();
  }, [reportId]);

  const loadSignatures = async () => {
    try {
      setLoading(true);
      const sigs = await getReportSignatures(reportId);
      setSignatures(sigs);

      const status = await getSignatureChainStatus(reportId);
      const next = status.pending_roles[0];

      if (next) {
        const nextStepInfo = workflow.find((s) => s.role === next);
        setNextStep(nextStepInfo || null);
        setCanSign(currentUserRole === next && reportStatus !== 'published');
      } else {
        setNextStep(null);
        setCanSign(false);
      }
    } catch (error) {
      console.error('Error loading signatures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!nextStep || !canSign) return;

    try {
      setActionLoading(true);
      await approveReport(
        reportId,
        currentUserName,
        nextStep.role,
        nextStep.title,
        nextStep.order_index
      );
      await loadSignatures();
      onStatusChange?.();
    } catch (error) {
      console.error('Error approving report:', error);
      toast.error('Onaylama hatası: ' + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveWithDissent = async () => {
    if (!nextStep || !canSign || !dissentComment.trim()) return;

    try {
      setActionLoading(true);
      await approveWithDissent(
        reportId,
        currentUserName,
        nextStep.role,
        nextStep.title,
        nextStep.order_index,
        dissentComment
      );
      setShowDissentModal(false);
      setDissentComment('');
      await loadSignatures();
      onStatusChange?.();
    } catch (error) {
      console.error('Error approving with dissent:', error);
      toast.error('Şerhli onaylama hatası: ' + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = () => {
    if (!nextStep || !canSign) return;
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!nextStep || !canSign || !rejectReason.trim()) return;
    try {
      setActionLoading(true);
      await rejectReport(
        reportId,
        currentUserName,
        nextStep.role,
        nextStep.title,
        nextStep.order_index,
        rejectReason
      );
      setShowRejectModal(false);
      setRejectReason('');
      await loadSignatures();
      onStatusChange?.();
    } catch (error) {
      console.error('Error rejecting report:', error);
      toast.error('Red hatası: ' + (error as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return <Check size={16} className="text-emerald-600" />;
      case 'signed_with_dissent':
        return <AlertTriangle size={16} className="text-amber-600" />;
      case 'rejected':
        return <X size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold border border-emerald-200">
            <Check size={12} />
            İmzalandı
          </span>
        );
      case 'signed_with_dissent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-semibold border border-amber-200">
            <AlertTriangle size={12} />
            Şerhli Onaylandı
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold border border-red-200">
            <X size={12} />
            Reddedildi
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  if (reportStatus === 'published') {
    return (
      <div className="border-t border-slate-200 bg-slate-50 p-6 print:bg-white print:border-t-2 print:border-black print:pt-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6 print:mb-8 print:justify-center">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center print:hidden">
              <Lock size={18} className="text-emerald-600" />
            </div>
            <div className="print:text-center">
              <h3 className="text-lg font-bold text-slate-900 print:text-2xl print:uppercase print:tracking-wider print:mb-2">
                Dijital İmza Zinciri
              </h3>
              <p className="text-xs text-slate-500 print:text-sm print:text-black">
                Bu rapor yayınlanmıştır ve değiştirilemez
              </p>
            </div>
          </div>

          <div className="space-y-3 print:space-y-4">
            {signatures.map((signature, index) => (
              <motion.div
                key={signature.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-slate-200 rounded-lg p-4 signature-block print:rounded-none print:border-2 print:border-black print:p-6"
              >
                <div className="flex items-start justify-between print:block">
                  <div className="flex items-start gap-3 print:block">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center print:hidden">
                      {getStatusIcon(signature.status)}
                    </div>
                    <div className="print:mb-4">
                      <div className="font-semibold text-slate-900 signature-role print:text-base print:font-bold print:mb-2 print:uppercase">
                        {signature.signer_title}
                      </div>
                      <div className="text-sm text-slate-600 signature-name print:text-base print:text-black print:font-semibold print:mb-2">
                        {signature.signer_name}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 signature-date print:text-sm print:text-black print:italic">
                        {new Date(signature.signed_at).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                  <div className="print:mt-4">
                    {getStatusBadge(signature.status)}
                    <div className="hidden print:block print:mt-4">
                      <div className="signature-stamp print:inline-flex">
                        {signature.status === 'signed' && '✓ İMZALI'}
                        {signature.status === 'signed_with_dissent' && '⚠ ŞERHLİ'}
                        {signature.status === 'rejected' && '✗ RED'}
                      </div>
                    </div>
                  </div>
                </div>

                {signature.dissent_comment && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dissent-box print:mt-4 print:pt-4 print:border-t-2 print:border-dashed print:border-black">
                    <div className="text-xs font-bold text-amber-700 mb-1 dissent-title print:text-sm print:text-black print:mb-2">
                      {signature.status === 'rejected' ? 'RED NEDENİ:' : 'ŞERH (KARŞI GÖRÜŞ):'}
                    </div>
                    <div className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded p-2 print:bg-gray-100 print:border-2 print:border-black print:rounded-none print:p-3 print:text-black print:text-base">
                      "{signature.dissent_comment}"
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-6 print:bg-white print:border-t-2 print:border-black print:pt-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6 print:mb-8 print:justify-center">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center print:hidden">
            <Shield size={18} className="text-blue-600" />
          </div>
          <div className="print:text-center">
            <h3 className="text-lg font-bold text-slate-900 print:text-2xl print:uppercase print:tracking-wider print:mb-2">
              İmza Süreci
            </h3>
            <p className="text-xs text-slate-500 print:text-sm print:text-black">
              Rapor onay zinciri - {signatures.length} / {workflow.length} tamamlandı
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          {workflow.map((step, index) => {
            const signature = signatures.find((s) => s.order_index === step.order_index);
            const isPending = !signature;
            const isNext = nextStep?.order_index === step.order_index;

            return (
              <motion.div
                key={step.order_index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white border rounded-lg p-4 signature-block print:rounded-none print:border-2 print:border-black print:p-6 ${
                  isNext ? 'border-blue-500 ring-2 ring-blue-100 print:ring-0' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        signature
                          ? 'bg-emerald-100 text-emerald-700'
                          : isNext
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {signature ? <Check size={16} /> : index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {step.title}
                      </div>
                      {signature ? (
                        <>
                          <div className="text-sm text-slate-600">{signature.signer_name}</div>
                          <div className="text-xs text-slate-400">
                            {new Date(signature.signed_at).toLocaleString('tr-TR')}
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-500">{step.description}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    {signature && getStatusBadge(signature.status)}
                    {isPending && isNext && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
                        <FileCheck size={12} />
                        Bekliyor
                      </span>
                    )}
                  </div>
                </div>

                {signature?.dissent_comment && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-xs font-bold text-amber-700 mb-1">
                      {signature.status === 'rejected' ? 'Red Nedeni:' : 'Şerh:'}
                    </div>
                    <div className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded p-2">
                      "{signature.dissent_comment}"
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {canSign && nextStep && !readOnly && (
          <div className="bg-white border border-blue-200 rounded-lg p-4 print:hidden">
            <div className="text-sm font-semibold text-slate-900 mb-3">
              Sıra sizde: {nextStep.title}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Check size={16} />
                )}
                Onayla
              </button>
              <button
                onClick={() => setShowDissentModal(true)}
                disabled={actionLoading}
                className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg font-semibold text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                <AlertTriangle size={16} />
                Şerhli Onayla
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Reddet
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <X size={18} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Raporu Reddet</h3>
                  <p className="text-xs text-slate-500">Red nedeninizi belirtin</p>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Red Nedeni:</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Örn: Bulgular yeterince belgelenmiş değil, ek inceleme gerekiyor..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleRejectConfirm}
                  disabled={!rejectReason.trim() || actionLoading}
                  className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                  Reddet
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDissentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDissentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Şerhli Onay (Karşı Görüş)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Onayınızla birlikte karşı görüşünüzü belirtin
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Şerh Metni:
                </label>
                <textarea
                  value={dissentComment}
                  onChange={(e) => setDissentComment(e.target.value)}
                  placeholder="Örn: Yönetici Özeti'nde belirtilen risk değerlendirmesine katılmıyorum..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDissentModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={handleApproveWithDissent}
                  disabled={!dissentComment.trim() || actionLoading}
                  className="flex-1 py-2.5 bg-amber-600 text-white rounded-lg font-semibold text-sm hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  Şerhli Onayla
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
