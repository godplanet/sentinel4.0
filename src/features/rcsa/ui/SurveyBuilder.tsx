import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { AlertTriangle, ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { fetchRCSAQuestions, saveRCSAQuestions } from '../api/rcsa-surveys';
import type { RCSAQuestionType } from '../types';

const QUESTION_TYPES: { value: RCSAQuestionType; label: string }[] = [
 { value: 'TEXT', label: 'Açık Uçlu' },
 { value: 'BOOLEAN', label: 'Evet / Hayır' },
 { value: 'MULTIPLE_CHOICE', label: 'Çoktan Seçmeli' },
];

interface EditableQuestion {
 id: string;
 text: string;
 type: RCSAQuestionType;
 optionsInput: string;
 triggerEnabled: boolean;
 triggerValue: string;
 weight: number;
}

interface SurveyBuilderProps {
 campaignId: string;
}

function toEditable(
 questions: Awaited<ReturnType<typeof fetchRCSAQuestions>>,
): EditableQuestion[] {
 return (questions || []).map((q, index) => ({
 id: q.id,
 text: q.text,
 type: q.type,
 optionsInput: (q.options ?? []).join(', '),
 triggerEnabled: !!q.trigger_finding_if_value,
 triggerValue: q.trigger_finding_if_value ?? '',
 weight: q.weight ?? questions.length - index,
 }));
}

export const SurveyBuilder = ({ campaignId }: SurveyBuilderProps) => {
 const queryClient = useQueryClient();

 const { data, isLoading } = useQuery({
 queryKey: ['rcsa-questions', campaignId],
 queryFn: () => fetchRCSAQuestions(campaignId),
 });

 const [items, setItems] = useState<EditableQuestion[]>([]);

 // İlk ve sonraki yüklemelerde sunucudaki soruları local state'e geçir
 useEffect(() => {
 if (data) {
 setItems(toEditable(data));
 }
 }, [data]);

 const saveMutation = useMutation({
 mutationFn: () =>
 saveRCSAQuestions({
 campaignId,
 questions: (items || []).map((q) => ({
 text: q.text,
 type: q.type,
 options:
 q.type === 'MULTIPLE_CHOICE'
 ? q.optionsInput
 .split(',')
 .map((o) => o.trim())
 .filter((o) => o.length > 0)
 : q.type === 'BOOLEAN'
 ? ['Evet', 'Hayır']
 : [],
 triggerValue: q.triggerEnabled ? q.triggerValue.trim() || null : null,
 weight: q.weight,
 })),
 }),
 onSuccess: () => {
 void queryClient.invalidateQueries({ queryKey: ['rcsa-questions', campaignId] });
 toast.success('RCSA anket soruları kaydedildi.');
 },
 onError: () => {
 toast.error('Sorular kaydedilirken bir hata oluştu.');
 },
 });

 const handleAddQuestion = () => {
 setItems((prev) => [
 ...prev,
 {
 id: `temp-${Date.now()}`,
 text: '',
 type: 'TEXT',
 optionsInput: '',
 triggerEnabled: false,
 triggerValue: '',
 weight: prev.length + 1,
 },
 ]);
 };

 const handleRemoveQuestion = (id: string) => {
 setItems((prev) => (prev || []).filter((q) => q.id !== id));
 };

 const handleChange = <K extends keyof EditableQuestion>(
 id: string,
 field: K,
 value: EditableQuestion[K],
 ) => {
 setItems((prev) =>
 (prev || []).map((q) => (q.id === id ? { ...q, [field]: value } : q)),
 );
 };

 const moveQuestion = (fromIndex: number, toIndex: number) => {
 setItems((prev) => {
 if (toIndex < 0 || toIndex >= prev.length) return prev;
 const copy = [...prev];
 const [moved] = copy.splice(fromIndex, 1);
 copy.splice(toIndex, 0, moved);
 return (copy || []).map((q, idx) => ({ ...q, weight: copy.length - idx }));
 });
 };

 return (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-sm font-semibold text-slate-800">
 RCSA Anket Tasarımı
 </h2>
 <p className="text-xs text-slate-500">
 Bu kampanya için iş birimlerine gidecek self-assessment sorularını tanımlayın.
 </p>
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={handleAddQuestion}
 className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
 >
 <Plus className="h-4 w-4" />
 Soru Ekle
 </button>
 <button
 type="button"
 onClick={() => saveMutation.mutate()}
 disabled={saveMutation.isLoading}
 className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
 >
 {saveMutation.isLoading ? 'Kaydediliyor...' : 'Anketi Kaydet'}
 </button>
 </div>
 </div>

 {isLoading && items.length === 0 && (
 <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-canvas px-3 py-4 text-xs text-slate-500">
 <AlertTriangle className="h-4 w-4 text-amber-500" />
 Sorular yükleniyor...
 </div>
 )}

 {items.length === 0 && !isLoading && (
 <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-canvas px-4 py-4 text-center text-xs text-slate-500">
 <AlertTriangle className="h-5 w-5 text-slate-400" />
 <p>Bu kampanya için henüz tanımlı RCSA sorusu yok.</p>
 <button
 type="button"
 onClick={handleAddQuestion}
 className="mt-1 inline-flex items-center gap-2 rounded-lg border border-blue-500 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
 >
 <Plus className="h-4 w-4" />
 İlk Soruyu Oluştur
 </button>
 </div>
 )}

 <div className="space-y-3">
 {(items || []).map((q, index) => (
 <div
 key={q.id}
 className="group rounded-xl border border-slate-200 bg-surface p-4 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
 >
 <div className="flex items-start gap-3">
 <div className="flex flex-col gap-1">
 <button
 type="button"
 className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-canvas text-slate-500"
 onClick={() => moveQuestion(index, index - 1)}
 title="Yukarı taşı"
 >
 <ArrowUp className="h-4 w-4" />
 </button>
 <button
 type="button"
 className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-canvas text-slate-500"
 onClick={() => moveQuestion(index, index + 1)}
 title="Aşağı taşı"
 >
 <ArrowDown className="h-4 w-4" />
 </button>
 <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-canvas text-slate-500">
 <GripVertical className="h-4 w-4" />
 </div>
 </div>

 <div className="flex-1 space-y-3">
 <div className="flex flex-col gap-3 md:flex-row">
 <div className="flex-1 space-y-1">
 <label className="text-xs font-semibold text-slate-700">
 Soru Metni
 </label>
 <input
 type="text"
 value={q.text}
 onChange={(e) => handleChange(q.id, 'text', e.target.value)}
 className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 placeholder="Bu süreçte görev ayrılığı prensibi uygulanıyor mu?"
 />
 </div>
 <div className="w-full space-y-1 md:w-52">
 <label className="text-xs font-semibold text-slate-700">
 Soru Tipi
 </label>
 <select
 value={q.type}
 onChange={(e) =>
 handleChange(q.id, 'type', e.target.value as RCSAQuestionType)
 }
 className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 >
 {(QUESTION_TYPES || []).map((type) => (
 <option key={type.value} value={type.value}>
 {type.label}
 </option>
 ))}
 </select>
 </div>
 </div>

 {q.type === 'MULTIPLE_CHOICE' && (
 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-700">
 Seçenekler (virgülle ayırın)
 </label>
 <input
 type="text"
 value={q.optionsInput}
 onChange={(e) =>
 handleChange(q.id, 'optionsInput', e.target.value)
 }
 className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 placeholder="Evet, Hayır, Kısmen"
 />
 </div>
 )}

 <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
 <div className="space-y-1">
 <div className="flex items-center justify-between">
 <label className="text-xs font-semibold text-slate-700">
 Zafiyet Tetikleyici Kural (Auto-Finding Trigger)
 </label>
 <label className="flex items-center gap-1 text-[11px] text-slate-500">
 <input
 type="checkbox"
 checked={q.triggerEnabled}
 onChange={(e) =>
 handleChange(q.id, 'triggerEnabled', e.target.checked)
 }
 className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
 />
 Aktif
 </label>
 </div>
 <input
 type="text"
 value={q.triggerValue}
 onChange={(e) =>
 handleChange(q.id, 'triggerValue', e.target.value)
 }
 disabled={!q.triggerEnabled}
 className={clsx(
 'w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1',
 q.triggerEnabled
 ? 'border-rose-300 bg-white text-slate-900 focus:border-rose-500 focus:ring-rose-500'
 : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed',
 )}
 placeholder="Örn: Hayır"
 />
 <p className="text-[11px] text-slate-500">
 Örn: Eğer cevap <span className="font-semibold">Hayır</span> ise otomatik
 bulgu tetiklensin.
 </p>
 </div>

 <div className="space-y-1">
 <label className="text-xs font-semibold text-slate-700">
 Ağırlık (Weight)
 </label>
 <input
 type="number"
 min={0}
 step={0.1}
 value={q.weight}
 onChange={(e) =>
 handleChange(q.id, 'weight', parseFloat(e.target.value) || 0)
 }
 className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
 />
 <p className="text-[11px] text-slate-500">
 Skor ve risk sapması hesaplarında kullanılacak önem katsayısı.
 </p>
 </div>
 </div>
 </div>

 <button
 type="button"
 onClick={() => handleRemoveQuestion(q.id)}
 className="ml-2 mt-1 rounded-lg border border-slate-200 bg-canvas p-2 text-slate-400 hover:border-rose-300 hover:text-rose-600 transition-colors"
 title="Soruyu Sil"
 >
 <Trash2 className="h-4 w-4" />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
};

