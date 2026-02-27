import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Loader2, AlertTriangle, FileText,
} from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'react-hot-toast';
import { supabase } from '@/shared/api/supabase';
import type { ActionAgingMetrics } from '@/entities/action/model/types';

const MIN_NOTE_LENGTH = 20;

interface Props {
  action: ActionAgingMetrics;
  onDecision?: (verdict: 'closed' | 'review_rejected') => void;
}

export function AuditorDecisionBar({ action, onDecision }: Props) {
  const [mode, setMode] = useState<'idle' | 'rejecting'>('idle');
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const noteValid = reviewNote.trim().length >= MIN_NOTE_LENGTH;
  const charsLeft = MIN_NOTE_LENGTH - reviewNote.trim().length;

  const handleClose = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('actions')
        .update({ status: 'closed', closed_at: new Date().toISOString() })
        .eq('id', action.id);
      if (error) throw error;
      toast.success('Aksiyon başarıyla kapatıldı.');
      onDecision?.('closed');
    } catch (err) {
      console.error(err);
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!noteValid) return;
    setSubmitting(true);
    try {
      const { error: actionErr } = await supabase
        .from('actions')
        .update({ status: 'review_rejected' })
        .eq('id', action.id);
      if (actionErr) throw actionErr;

      const { data: evidenceRows } = await supabase
        .from('action_evidence')
        .select('id')
        .eq('action_id', action.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (evidenceRows && evidenceRows.length > 0) {
        await supabase
          .from('action_evidence')
          .update({ review_note: reviewNote.trim() })
          .eq('id', evidenceRows[0].id);
      }

      toast.success('Kanıt reddedildi. Birime bildirim gönderildi.');
      onDecision?.('review_rejected');
    } catch (err) {
      console.error(err);
      toast.error('Reddetme işlemi sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  const isAlreadyClosed = action.status === 'closed';
  const hasNoEvidence = action.evidence_count === 0;

  return (
    <div className="bg-white/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <AnimatePresence>
        {mode === 'rejecting' && (
          <motion.div
            key="review-note"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pt-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-slate-500" />
                <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Reddetme Gerekçesi (GIAS 2024 Zorunlu)
                </p>
              </div>
              <textarea
                autoFocus
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Kanıtın neden yetersiz veya alakasız olduğunu açıklayın. En az 20 karakter gereklidir..."
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all resize-none"
              />
              <div className="flex items-center justify-between mt-1.5">
                <p className={clsx(
                  'text-[11px] font-medium transition-colors',
                  noteValid ? 'text-emerald-600' : 'text-slate-400',
                )}>
                  {noteValid
                    ? '✓ Gerekçe yeterli'
                    : `Daha ${charsLeft} karakter gerekli`}
                </p>
                <span className="text-[11px] text-slate-400 font-mono">
                  {reviewNote.trim().length} / min {MIN_NOTE_LENGTH}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 py-4 flex items-center gap-3">
        {mode === 'idle' ? (
          <>
            {hasNoEvidence && (
              <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mr-auto">
                <AlertTriangle size={13} />
                <span className="font-medium">Henüz kanıt yüklenmedi</span>
              </div>
            )}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setMode('rejecting')}
                disabled={submitting || isAlreadyClosed || hasNoEvidence}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all',
                  'border-rose-600 text-rose-700 hover:bg-rose-50',
                  (submitting || isAlreadyClosed || hasNoEvidence) && 'opacity-40 cursor-not-allowed',
                )}
              >
                <XCircle size={16} />
                Kanıtı Reddet
              </button>

              <button
                onClick={handleClose}
                disabled={submitting || isAlreadyClosed || hasNoEvidence}
                className={clsx(
                  'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all text-white',
                  'bg-[#28a745] hover:bg-emerald-700 shadow-sm shadow-emerald-200',
                  (submitting || isAlreadyClosed || hasNoEvidence) && 'opacity-40 cursor-not-allowed',
                )}
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                {isAlreadyClosed ? 'Aksiyon Kapatıldı' : 'Onayla & Kapat'}
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => { setMode('idle'); setReviewNote(''); }}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
            >
              İptal
            </button>
            <button
              onClick={handleReject}
              disabled={!noteValid || submitting}
              className={clsx(
                'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ml-auto text-white',
                noteValid
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-sm'
                  : 'bg-slate-300 cursor-not-allowed',
              )}
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <XCircle size={16} />
              )}
              Reddet & Geri Gönder
            </button>
          </>
        )}
      </div>
    </div>
  );
}
