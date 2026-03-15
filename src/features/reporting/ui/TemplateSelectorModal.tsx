/**
 * Rapor oluşturma modalı — Tek doğru kaynak: public.reports tablosu
 * Boş rapor oluşturur; mock veya m6 şablonu yok.
 */

import { createReport } from '@/features/reporting/api/reports-api';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';
import { BookOpen, FileText, Loader2, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface TemplateSelectorModalProps {
 open: boolean;
 onClose: () => void;
}

export function TemplateSelectorModal({ open, onClose }: TemplateSelectorModalProps) {
 const navigate = useNavigate();
 const [error, setError] = useState<string | null>(null);

 const createMutation = useMutation({
 mutationFn: () => createReport(),
 onSuccess: (id) => {
 onClose();
 setError(null);
 navigate(`/reporting/zen-editor/${id}`);
 },
 onError: (err: unknown) => {
 setError(err instanceof Error ? err.message : 'Rapor oluşturulamadı.');
 },
 });

 if (!open) return null;

 const creating = createMutation.isPending;

 return (
 <div
 className="fixed inset-0 z-50 flex items-center justify-center p-4"
 style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)' }}
 >
 <div
 className="bg-surface rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-blue-50 rounded-lg">
 <BookOpen size={18} className="text-blue-600" />
 </div>
 <div>
 <h2 className="font-sans font-semibold text-primary text-base">Yeni Rapor</h2>
 <p className="text-xs font-sans text-slate-500 mt-0.5">
 Boş bir denetim raporu oluşturur (reports tablosu)
 </p>
 </div>
 </div>
 <button
 onClick={onClose}
 disabled={creating}
 className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
 >
 <X size={16} />
 </button>
 </div>

 <div className="flex-1 overflow-y-auto px-4 py-4">
 {error && (
 <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-xs font-sans text-red-700">
 {error}
 </div>
 )}

 <button
 onClick={() => createMutation.mutate()}
 disabled={creating}
 className={clsx(
 'w-full text-left rounded-xl border p-4 transition-all duration-150 flex items-center gap-4',
 'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1',
 creating
 ? 'border-blue-500 shadow-md bg-blue-50/30 cursor-wait'
 : 'border-slate-200 bg-surface hover:border-blue-400 hover:shadow-md cursor-pointer',
 )}
 >
 <div className="flex-shrink-0 p-3 rounded-lg bg-canvas">
 {creating ? (
 <Loader2 size={20} className="animate-spin text-blue-600" />
 ) : (
 <Plus size={20} className="text-slate-600" />
 )}
 </div>
 <div className="flex-1 min-w-0">
 <span className="font-sans font-semibold text-primary text-sm">Boş Rapor</span>
 <p className="text-xs font-sans text-slate-500 mt-1">
 Sıfırdan başlayın; başlık ve içerik düzenleyicide eklenir.
 </p>
 </div>
 <FileText size={16} className="text-slate-300 flex-shrink-0" />
 </button>
 </div>

 <div className="px-4 py-4 border-t border-slate-100 bg-canvas/50">
 <p className="text-[11px] font-sans text-slate-400 text-center">
 Rapor taslak olarak oluşturulacak ve düzenleyici açılacaktır.
 </p>
 </div>
 </div>
 </div>
 );
}
