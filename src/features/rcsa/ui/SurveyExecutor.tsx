import { useMutation, useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchRCSAQuestions, submitRCSAResponses } from '../api/rcsa-surveys';

interface SurveyExecutorProps {
 campaignId: string;
 auditeeId: string;
}

interface LocalAnswer {
 questionId: string;
 answer: string;
}

export const SurveyExecutor = ({ campaignId, auditeeId }: SurveyExecutorProps) => {
 const { data, isLoading } = useQuery({
 queryKey: ['rcsa-questions', campaignId],
 queryFn: () => fetchRCSAQuestions(campaignId),
 });

 const [answers, setAnswers] = useState<LocalAnswer[]>([]);

 const mutation = useMutation({
 mutationFn: () =>
 submitRCSAResponses({
 campaignId,
 auditeeId,
 responses: (answers || []).map((a) => {
 const q = data?.find((question) => question.id === a.questionId);
 const trigger = (q?.trigger_finding_if_value ?? '').trim();
 const isTriggered =
 trigger.length > 0 && a.answer.trim().toLowerCase() === trigger.toLowerCase();
 return {
 questionId: a.questionId,
 answer: a.answer,
 isFindingTriggered: isTriggered,
 };
 }),
 }),
 onSuccess: () => {
 toast.success('RCSA yanıtlarınız kaydedildi.');
 },
 onError: () => {
 toast.error('Yanıtlar kaydedilirken bir hata oluştu.');
 },
 });

 const triggerMap = useMemo(() => {
 const map = new Map<string, boolean>();
 if (!data) return map;
 for (const q of data) {
 const trigger = (q.trigger_finding_if_value ?? '').trim();
 if (!trigger) continue;
 const answer = answers.find((a) => a.questionId === q.id)?.answer ?? '';
 if (answer.trim().toLowerCase() === trigger.toLowerCase()) {
 map.set(q.id, true);
 }
 }
 return map;
 }, [answers, data]);

 const handleAnswerChange = (questionId: string, value: string) => {
 setAnswers((prev) => {
 const exists = prev.find((a) => a.questionId === questionId);
 if (!exists) {
 return [...prev, { questionId, answer: value }];
 }
 return (prev || []).map((a) =>
 a.questionId === questionId ? { ...a, answer: value } : a,
 );
 });
 };

 const getAnswer = (questionId: string): string =>
 answers.find((a) => a.questionId === questionId)?.answer ?? '';

 const handleSubmit = (event: React.FormEvent) => {
 event.preventDefault();
 if (!data || data.length === 0) return;
 mutation.mutate();
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-12 text-sm text-slate-500">
 Anket yükleniyor...
 </div>
 );
 }

 if (!data || data.length === 0) {
 return (
 <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-canvas px-4 py-10 text-center text-sm text-slate-500">
 <AlertTriangle className="h-6 w-6 text-slate-400" />
 <p>Bu kampanya için henüz yanıtlanacak soru tanımlanmamış.</p>
 </div>
 );
 }

 return (
 <form
 onSubmit={handleSubmit}
 className="mx-auto max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-surface/90 p-4 shadow-sm"
 >
 <div className="flex flex-col gap-1">
 <h2 className="text-base font-semibold text-slate-900">
 RCSA Self-Assessment Anketi
 </h2>
 <p className="text-xs text-slate-500">
 Lütfen soruları kurum prosedürleri ve fiili uygulamalar ışığında dürüstçe
 yanıtlayın. Kritik yanıtlar otomatik olarak denetim günlüğüne işlenecektir.
 </p>
 </div>

 <div className="space-y-5">
 {(data || []).map((q, index) => {
 const value = getAnswer(q.id);
 const isTriggered = triggerMap.get(q.id) ?? false;

 return (
 <div
 key={q.id}
 className={clsx(
 'rounded-xl border px-4 py-3 bg-canvas transition-all',
 isTriggered
 ? 'border-rose-300/80 bg-rose-50/60'
 : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50',
 )}
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-[11px] font-semibold text-slate-400">
 Soru {index + 1}
 </span>
 {q.weight > 1 && (
 <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono text-amber-300">
 W={q.weight.toFixed(1)}
 </span>
 )}
 </div>
 <p className="mt-1 text-sm font-semibold text-slate-900">
 {q.text}
 </p>
 </div>
 </div>

 <div className="mt-3">
 {q.type === 'TEXT' && (
 <textarea
 value={value}
 onChange={(e) => handleAnswerChange(q.id, e.target.value)}
 rows={3}
 className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 placeholder="Gözlemlerinizi ve mevcut kontrol ortamını açıklayın..."
 />
 )}

 {q.type === 'BOOLEAN' && (
 <div className="flex gap-2">
 {['Evet', 'Hayır'].map((choice) => (
 <button
 key={choice}
 type="button"
 onClick={() => handleAnswerChange(q.id, choice)}
 className={clsx(
 'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
 value === choice
 ? 'border-blue-600 bg-blue-600 text-white'
 : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400',
 )}
 >
 {choice}
 </button>
 ))}
 </div>
 )}

 {q.type === 'MULTIPLE_CHOICE' && (
 <div className="flex flex-wrap gap-2">
 {(Array.isArray(q.options) ? q.options : []).map((opt) => (
 <button
 key={opt}
 type="button"
 onClick={() => handleAnswerChange(q.id, opt)}
 className={clsx(
 'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
 value === opt
 ? 'border-blue-600 bg-blue-600 text-white'
 : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400',
 )}
 >
 {opt}
 </button>
 ))}
 </div>
 )}
 </div>

 {isTriggered && (
 <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-[11px] text-rose-900">
 <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-rose-500" />
 <p>
 Bu yanıtınız kurum politikalarına aykırıdır, denetim günlüğüne
 gözlem/bulgu olarak kaydedilecektir.
 </p>
 </div>
 )}
 </div>
 );
 })}
 </div>

 <div className="flex items-center justify-end gap-2 pt-2">
 <button
 type="submit"
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-70"
 disabled={mutation.isLoading}
 >
 {mutation.isLoading ? (
 'Gönderiliyor...'
 ) : (
 <>
 <CheckCircle2 className="h-4 w-4" />
 Yanıtları Gönder
 </>
 )}
 </button>
 </div>
 </form>
 );
};

