import { useState } from 'react';
import { X, ShieldAlert, CheckSquare, Square, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import type { M6ReportStatus } from '@/entities/report';

const QAIP_CHECKS = [
  'Tüm bulgular GIAS 2024 standartlarına göre kanıtlandırılmıştır.',
  'Yönetici Özeti kalite standartlarına ve BDDK formatına uygundur.',
  'İmla, dilbilgisi ve üslup kontrolleri yapılmıştır.',
] as const;

const STATUS_LABELS: Partial<Record<M6ReportStatus, string>> = {
  in_review: 'İncelemeye Gönder',
  cae_review: 'Yönetici Olarak Onayla',
  published: 'CAE Olarak Yayınla ve Dondur',
};

interface QAIPGateModalProps {
  isOpen: boolean;
  targetStatus: M6ReportStatus;
  openNoteCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function QAIPGateModal({
  isOpen,
  targetStatus,
  openNoteCount,
  onClose,
  onConfirm,
}: QAIPGateModalProps) {
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  if (!isOpen) return null;

  const allChecked = checks.every(Boolean);
  const hasBlocker = openNoteCount > 0;
  const canConfirm = !hasBlocker && allChecked;
  const actionLabel = STATUS_LABELS[targetStatus] ?? 'Onayla ve İlerle';

  const toggleCheck = (index: number) => {
    setChecks((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    setChecks([false, false, false]);
    onConfirm();
  };

  const handleClose = () => {
    setChecks([false, false, false]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={18} className="text-blue-600" />
            <h2 className="font-sans font-semibold text-slate-900 text-base">
              QAIP Kalite Kontrol Kapısı
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-xs font-sans text-slate-500 mb-5 leading-relaxed">
            <strong className="text-slate-700">"{actionLabel}"</strong> aksiyonu öncesinde GIAS 2024
            Standart 11.1 (Kalite Güvence) gereklilikleri kontrol edilmektedir.
          </p>

          {hasBlocker ? (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-sans font-semibold text-red-700 mb-1">
                  İşlem Engellenmiştir
                </p>
                <p className="text-sm font-sans text-red-600 leading-relaxed">
                  Cevaplanmamış{' '}
                  <strong>{openNoteCount}</strong> adet gözden geçirme notu var.
                  Lütfen önce bu notları çözün.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5">
              <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-sans text-emerald-700">
                Tüm gözden geçirme notları çözülmüştür. Lütfen aşağıdaki QAIP kontrol listesini
                tamamlayın.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-xs font-sans font-semibold uppercase tracking-widest text-slate-400">
              QAIP Onay Listesi
            </p>
            {QAIP_CHECKS.map((label, index) => (
              <button
                key={index}
                disabled={hasBlocker}
                onClick={() => toggleCheck(index)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  hasBlocker
                    ? 'border-slate-100 bg-slate-50 cursor-not-allowed opacity-50'
                    : checks[index]
                    ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <span className={`flex-shrink-0 mt-0.5 ${checks[index] ? 'text-emerald-600' : 'text-slate-300'}`}>
                  {checks[index] ? <CheckSquare size={16} /> : <Square size={16} />}
                </span>
                <span
                  className={`text-sm font-sans leading-relaxed ${
                    checks[index] ? 'text-emerald-800 line-through decoration-emerald-400' : 'text-slate-700'
                  }`}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-sm font-sans font-medium text-slate-600 hover:bg-slate-200 transition-colors"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-sans font-semibold text-white transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
          >
            Onayla ve İlerle
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
