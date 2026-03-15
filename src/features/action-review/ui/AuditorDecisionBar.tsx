import { submitRequest } from '@/entities/action/api/action-api';
import type { ActionAgingMetrics } from '@/entities/action/model/types';
import { usePersonaStore } from '@/entities/user/model/persona-store';
import { supabase } from '@/shared/api/supabase';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { addMonths, differenceInDays, format } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 CalendarClock,
 CheckCircle2,
 Clock,
 FileText,
 Loader2,
 ShieldAlert,
 XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const MIN_NOTE_LENGTH = 20;

/** BDDK kuralı: 365 günü aşan BT/Siber kökenli aksiyonlarda CAE onayı zorunludur. */
const BT_SIBER_KEYWORDS = ['BT', 'Siber', 'IT', 'Cyber', 'Bilgi Teknoloji', 'Information Technology'];

function isBtOrSiber(snapshot: ActionAgingMetrics['finding_snapshot']): boolean {
 const category = snapshot?.gias_category ?? '';
 return BT_SIBER_KEYWORDS.some((kw) => category.toLowerCase().includes(kw.toLowerCase()));
}

interface Props {
 action: ActionAgingMetrics;
 onDecision?: (verdict: 'closed' | 'review_rejected') => void;
}

export function AuditorDecisionBar({ action, onDecision }: Props) {
 const [mode, setMode] = useState<'idle' | 'rejecting' | 'extending'>('idle');
 const [reviewNote, setReviewNote] = useState('');
 const [extensionJustification, setExtensionJustification] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const { currentPersona } = usePersonaStore();

 /** Aksiyonun orijinal termininden bu yana geçen gün sayısı */
 const daysSinceOriginal = differenceInDays(new Date(), new Date(action.original_due_date));
 /** BDDK 365 gün kuralı tetiklenmiş mi? */
 const isBddk365Triggered = daysSinceOriginal > 365 && isBtOrSiber(action.finding_snapshot);
 const canApproveExtension = currentPersona === 'CAE';

 const noteValid = reviewNote.trim().length >= MIN_NOTE_LENGTH;
 const extensionNoteValid = extensionJustification.trim().length >= MIN_NOTE_LENGTH;
 const charsLeft = MIN_NOTE_LENGTH - reviewNote.trim().length;

 const extensionMutation = useMutation({
 mutationFn: () => submitRequest({
 action_id: action.id,
 type: 'extension',
 justification: extensionJustification.trim(),
 requested_date: format(addMonths(new Date(action.current_due_date), 3), 'yyyy-MM-dd'),
 }),
 onSuccess: () => {
 toast.success('Süre uzatma talebi CAE incelemesine sevk edildi — BDDK bildirim süreci başlatıldı.');
 setMode('idle');
 setExtensionJustification('');
 },
 onError: () => {
 toast.error('Talep gönderilemedi. Lütfen tekrar deneyin.');
 },
 });

 const handleClose = async () => {
 setSubmitting(true);
 try {
 const { error } = await supabase
 .from('actions')
 .update({ status: 'closed', closed_at: new Date().toISOString() })
 .eq('id', action.id);
 if (error) throw error;
 toast.success('Aksiyon mühürlendi — denetim izi ve tamlık belgesi oluşturuldu.');
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

 toast.success('Kanıt yetersiz bulundu — ilgili birime ret bildirimi iletildi.');
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
 <div className="bg-surface/80 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
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
 <div className="px-4 pt-5 pb-3 border-b border-slate-100">
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
 className="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all resize-none"
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

 {/* BDDK 365 GÜN UZATMA PANELİ */}
 {mode === 'extending' && (
 <motion.div
 key="extend-panel"
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.25, ease: 'easeInOut' }}
 className="overflow-hidden"
 >
 <div className="px-4 pt-5 pb-3 border-b border-orange-100 bg-orange-50/40">
 {/* BDDK 365 Gün Uyarısı */}
 {isBddk365Triggered && (
 <div className="flex items-start gap-3 bg-orange-100 border border-orange-300 rounded-xl p-3 mb-3">
 <ShieldAlert size={16} className="text-orange-700 shrink-0 mt-0.5" />
 <div>
 <p className="text-xs font-black text-orange-900 mb-0.5">
 BDDK Yönetmeliği — 365 Gün Yetki Devri Kuralı
 </p>
 <p className="text-xs text-orange-800 leading-relaxed">
 Bu aksiyon BT/Siber kökenli olup orijinal termininden <strong>{daysSinceOriginal} gün</strong> geçmiştir.
 365 günü aşan aksiyonlarda süre uzatımı doğrudan <strong>Başdenetçi (CAE) onayına</strong> tabidir.
 {!canApproveExtension && (
 <span className="block mt-1 font-bold text-orange-900">
 Mevcut rolünüz ({currentPersona}) bu işlemi onaylamaya yetkili değildir.
 </span>
 )}
 </p>
 </div>
 </div>
 )}

 <div className="flex items-center gap-2 mb-2">
 <CalendarClock size={14} className="text-orange-600" />
 <p className="text-xs font-black text-slate-700 uppercase tracking-wider">
 Uzatma Gerekçesi (Zorunlu)
 </p>
 </div>
 <textarea
 autoFocus
 rows={3}
 value={extensionJustification}
 onChange={(e) => setExtensionJustification(e.target.value)}
 disabled={isBddk365Triggered && !canApproveExtension}
 placeholder="Süre uzatmasının iş gerekçesini açıklayın. En az 20 karakter gereklidir..."
 className="w-full px-4 py-3 bg-surface border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
 />
 <div className="flex items-center justify-between mt-1.5">
 <p className={clsx(
 'text-[11px] font-medium transition-colors',
 extensionNoteValid ? 'text-emerald-600' : 'text-slate-400',
 )}>
 {extensionNoteValid ? '✓ Gerekçe yeterli' : `Daha ${MIN_NOTE_LENGTH - extensionJustification.trim().length} karakter gerekli`}
 </p>
 <span className="text-[11px] text-slate-400 font-mono">
 {extensionJustification.trim().length} / min {MIN_NOTE_LENGTH}
 </span>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="px-4 py-4 flex items-center gap-3">
 {mode === 'idle' ? (
 <>
 {hasNoEvidence && (
 <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg mr-auto">
 <AlertTriangle size={13} />
 <span className="font-medium">Henüz kanıt yüklenmedi</span>
 </div>
 )}
 <div className="flex items-center gap-3 ml-auto">
 {/* BDDK 365 Gün Kuralı: Ek Süre Talep Et butonu (her zaman görünür) */}
 <button
 onClick={() => setMode('extending')}
 disabled={isAlreadyClosed}
 className={clsx(
 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 transition-all',
 isBddk365Triggered
 ? 'border-orange-500 text-orange-700 hover:bg-orange-50'
 : 'border-slate-300 text-slate-500 hover:bg-canvas',
 isAlreadyClosed && 'opacity-40 cursor-not-allowed',
 )}
 title="Aksiyon süresi uzatma talebi oluştur"
 >
 <CalendarClock size={15} />
 Ek Süre Talep Et
 {isBddk365Triggered && (
 <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded ml-1">
 CAE
 </span>
 )}
 </button>

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
 ) : mode === 'rejecting' ? (
 <>
 <button
 onClick={() => { setMode('idle'); setReviewNote(''); }}
 disabled={submitting}
 className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-canvas transition-all"
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
 ) : (
 /* mode === 'extending' */
 <>
 <button
 onClick={() => { setMode('idle'); setExtensionJustification(''); }}
 className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border border-slate-200 text-slate-600 hover:bg-canvas transition-all"
 >
 İptal
 </button>
 <button
 onClick={() => extensionMutation.mutate()}
 disabled={!extensionNoteValid || extensionMutation.isPending || (!canApproveExtension && isBddk365Triggered)}
 className={clsx(
 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ml-auto text-white',
 extensionNoteValid && (canApproveExtension || !isBddk365Triggered)
 ? 'bg-orange-600 hover:bg-orange-700 shadow-sm'
 : 'bg-slate-300 cursor-not-allowed',
 )}
 title={isBddk365Triggered && !canApproveExtension
 ? 'Bu aksiyon için uzatma onayı yalnızca CAE tarafından verilebilir.'
 : undefined}
 >
 {extensionMutation.isPending ? (
 <Loader2 size={16} className="animate-spin" />
 ) : (
 <Clock size={16} />
 )}
 {isBddk365Triggered && !canApproveExtension ? 'CAE Onayı Gerekli' : 'Uzatma Talebini Gönder'}
 </button>
 </>
 )}
 </div>
 </div>
 );
}
