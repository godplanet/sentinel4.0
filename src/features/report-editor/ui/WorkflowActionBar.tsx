import { useState } from 'react';
import { Send, CheckCircle, RotateCcw, Lock, AlertCircle } from 'lucide-react';
import { useActiveReportStore } from '@/entities/report';
import type { M6ReportStatus } from '@/entities/report';
import { QAIPGateModal } from './QAIPGateModal';

const STATUS_LABELS: Record<M6ReportStatus, string> = {
  draft: 'Taslak',
  in_review: 'Yönetici İncelemesinde',
  cae_review: 'CAE İncelemesinde',
  published: 'Yayınlandı ve Kilitlendi',
  archived: 'Arşivlendi',
};

const STATUS_COLORS: Record<M6ReportStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  in_review: 'bg-amber-50 text-amber-700',
  cae_review: 'bg-blue-50 text-blue-700',
  published: 'bg-emerald-50 text-emerald-700',
  archived: 'bg-slate-100 text-slate-500',
};

export function WorkflowActionBar() {
  const { activeReport, changeReportStatus, publishReport } = useActiveReportStore();
  const [gateModal, setGateModal] = useState<{ open: boolean; targetStatus: M6ReportStatus | null }>({
    open: false,
    targetStatus: null,
  });

  if (!activeReport) return null;

  const { status } = activeReport;
  const isLocked = status === 'published' || status === 'archived';
  const openNoteCount = (activeReport.reviewNotes ?? []).filter((n) => n.status === 'open').length;

  const openGate = (targetStatus: M6ReportStatus) => {
    setGateModal({ open: true, targetStatus });
  };

  const closeGate = () => setGateModal({ open: false, targetStatus: null });

  const handleGateConfirm = () => {
    if (!gateModal.targetStatus) return;
    if (gateModal.targetStatus === 'published') {
      publishReport();
    } else {
      changeReportStatus(gateModal.targetStatus);
    }
    closeGate();
  };

  const handleRevision = () => {
    changeReportStatus('draft');
  };

  return (
    <>
      {gateModal.open && gateModal.targetStatus && (
        <QAIPGateModal
          isOpen={gateModal.open}
          targetStatus={gateModal.targetStatus}
          openNoteCount={openNoteCount}
          onClose={closeGate}
          onConfirm={handleGateConfirm}
        />
      )}

      <div className="no-print report-workflow-bar fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-sans font-semibold ${STATUS_COLORS[status]}`}>
              {isLocked ? <Lock size={11} /> : <AlertCircle size={11} />}
              {STATUS_LABELS[status]}
            </div>

            {openNoteCount > 0 && !isLocked && (
              <div className="flex items-center gap-1.5 text-xs font-sans text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <span className="font-bold">{openNoteCount}</span>
                açık not var
              </div>
            )}

            {status === 'draft' && !openNoteCount && (
              <p className="text-xs text-slate-400 font-sans hidden sm:block">
                Rapor taslak modunda. Yönetici incelemesine göndermek için hazır olduğunuzda ilerleyin.
              </p>
            )}
            {status === 'in_review' && (
              <p className="text-xs text-slate-400 font-sans hidden sm:block">
                Yönetici incelemesi bekleniyor. Onaylayın veya revizyon talep edin.
              </p>
            )}
            {status === 'cae_review' && (
              <p className="text-xs text-slate-400 font-sans hidden sm:block">
                CAE son onayı bekleniyor. Yayınlandığında rapor kilitlenecektir.
              </p>
            )}
            {isLocked && (
              <p className="text-xs text-slate-400 font-sans hidden sm:block">
                Bu rapor yayınlanmış ve değiştirilemez durumdadır.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {status === 'draft' && (
              <button
                onClick={() => openGate('in_review')}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-xl text-sm font-sans font-semibold transition-colors"
              >
                <Send size={15} />
                İncelemeye Gönder
              </button>
            )}

            {status === 'in_review' && (
              <>
                <button
                  onClick={handleRevision}
                  className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-sans font-semibold transition-colors"
                >
                  <RotateCcw size={15} />
                  Revizyon İste
                </button>
                <button
                  onClick={() => openGate('cae_review')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-sans font-semibold transition-colors"
                >
                  <CheckCircle size={15} />
                  Yönetici Olarak Onayla
                </button>
              </>
            )}

            {status === 'cae_review' && (
              <button
                onClick={() => openGate('published')}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#28a745] hover:bg-green-700 text-white rounded-xl text-sm font-sans font-semibold transition-colors"
              >
                <Lock size={15} />
                CAE Olarak Yayınla ve Dondur
              </button>
            )}

            {isLocked && (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-sans font-semibold cursor-default">
                <Lock size={15} />
                Rapor Kilitli
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
