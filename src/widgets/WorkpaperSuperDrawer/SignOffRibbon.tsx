import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, ShieldCheck, Lock, Loader2, Undo2, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import clsx from 'clsx';
import type { Workpaper } from '@/entities/workpaper/model/types';

interface SignOffRibbonProps {
  workpaper: Workpaper | null;
  allStepsCompleted: boolean;
  onSignPrepared: () => Promise<void>;
  onSignReviewed: () => Promise<void>;
  onUnsignPrepared: () => Promise<void>;
}

export function SignOffRibbon({
  workpaper,
  allStepsCompleted,
  onSignPrepared,
  onSignReviewed,
  onUnsignPrepared,
}: SignOffRibbonProps) {
  const [submitting, setSubmitting] = useState<'prepared' | 'reviewed' | 'unsign' | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const isPrepared = !!workpaper?.prepared_at;
  const isReviewed = !!workpaper?.reviewed_at;
  const isFullyApproved = isPrepared && isReviewed;

  const handlePrepare = async () => {
    if (!allStepsCompleted) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      return;
    }
    setSubmitting('prepared');
    try {
      await onSignPrepared();
    } finally {
      setSubmitting(null);
    }
  };

  const handleReview = async () => {
    setSubmitting('reviewed');
    try {
      await onSignReviewed();
    } finally {
      setSubmitting(null);
    }
  };

  const handleUnsign = async () => {
    setSubmitting('unsign');
    try {
      await onUnsignPrepared();
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div
      className={clsx(
        'sticky top-0 z-10 border-b transition-colors duration-300',
        isFullyApproved
          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
          : isPrepared
          ? 'bg-gradient-to-r from-blue-50 to-sky-50 border-blue-200'
          : 'bg-slate-50 border-slate-200'
      )}
    >
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-800 font-medium">
                Tum test adimlari tamamlanmadan imza atilamaz. Lutfen once tum adimlari tamamlayin.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div
              className={clsx(
                'flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all',
                isPrepared
                  ? 'bg-white border-emerald-300'
                  : 'bg-white border-slate-200'
              )}
            >
              <div
                className={clsx(
                  'p-1.5 rounded-lg shrink-0',
                  isPrepared ? 'bg-emerald-100' : 'bg-slate-100'
                )}
              >
                <UserCheck
                  size={14}
                  className={isPrepared ? 'text-emerald-600' : 'text-slate-500'}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Hazirlayan
                </p>
                {isPrepared ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                        AD
                      </div>
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {workpaper?.prepared_by_name || 'Denetci'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {workpaper?.prepared_at &&
                        new Date(workpaper.prepared_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Imza bekleniyor</p>
                )}
              </div>
              {isPrepared ? (
                <button
                  onClick={handleUnsign}
                  disabled={isReviewed || submitting === 'unsign'}
                  className="shrink-0 flex items-center gap-1 px-2 py-1 text-[10px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting === 'unsign' ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Undo2 size={10} />
                  )}
                  Geri Al
                </button>
              ) : (
                <button
                  onClick={handlePrepare}
                  disabled={submitting === 'prepared'}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {submitting === 'prepared' ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      Imzalaniyor
                    </>
                  ) : (
                    <>
                      <UserCheck size={11} />
                      Imzala ve Tamamla
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div
              className={clsx(
                'flex items-center gap-2 p-2.5 rounded-xl border-2 transition-all',
                isReviewed
                  ? 'bg-white border-emerald-300'
                  : !isPrepared
                  ? 'bg-slate-100 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200'
              )}
            >
              <div
                className={clsx(
                  'p-1.5 rounded-lg shrink-0',
                  isReviewed
                    ? 'bg-emerald-100'
                    : !isPrepared
                    ? 'bg-slate-200'
                    : 'bg-slate-100'
                )}
              >
                {!isPrepared ? (
                  <Lock size={14} className="text-slate-400" />
                ) : (
                  <ShieldCheck
                    size={14}
                    className={isReviewed ? 'text-emerald-600' : 'text-slate-500'}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                  Gozden Geciren
                </p>
                {isReviewed ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] font-bold text-white">
                        SV
                      </div>
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {workpaper?.reviewed_by_name || 'Supervizor'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {workpaper?.reviewed_at &&
                        new Date(workpaper.reviewed_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                ) : !isPrepared ? (
                  <p className="text-xs text-slate-400">Hazirlayan imzasi bekleniyor</p>
                ) : (
                  <p className="text-xs text-slate-400">Onay bekleniyor</p>
                )}
              </div>
              {isPrepared && !isReviewed && (
                <button
                  onClick={handleReview}
                  disabled={submitting === 'reviewed'}
                  className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white text-[11px] font-bold rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {submitting === 'reviewed' ? (
                    <>
                      <Loader2 size={11} className="animate-spin" />
                      Onaylaniyor
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={11} />
                      Onayla
                    </>
                  )}
                </button>
              )}
              {isReviewed && (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {isFullyApproved && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 flex items-center justify-center gap-2 py-1.5 bg-emerald-100 rounded-lg"
          >
            <CheckCircle2 size={14} className="text-emerald-700" />
            <span className="text-xs font-bold text-emerald-800">
              Workpaper Tam Onayli
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
