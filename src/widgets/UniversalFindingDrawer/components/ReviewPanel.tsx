import {
 addReviewNote,
 fetchFindingSignoffs,
 fetchReviewNotes,
 resolveReviewNote,
 signFinding,
 type ReviewNote,
} from '@/entities/finding/api/review';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
 AlertCircle,
 CheckCircle,
 Clock,
 FileCheck,
 Loader2,
 MessageSquare, Plus,
 Send,
 Shield,
 ShieldCheck,
 User
} from 'lucide-react';
import { useState } from 'react';

interface ReviewPanelProps {
 findingId: string | null;
 currentUserId?: string;
 isReviewer?: boolean;
}

type ReviewTab = 'notes' | 'signoff';

export function ReviewPanel({ findingId, currentUserId = '', isReviewer = false }: ReviewPanelProps) {
 const queryClient = useQueryClient();
 const [activeTab, setActiveTab] = useState<ReviewTab>('notes');
 const [showAddForm, setShowAddForm] = useState(false);
 const [newNoteField, setNewNoteField] = useState('');
 const [newNoteText, setNewNoteText] = useState('');

 const { data: notes = [], isLoading: loadingNotes } = useQuery({
 queryKey: ['review-notes', findingId],
 queryFn: () => fetchReviewNotes(findingId!),
 enabled: !!findingId,
 });

 const { data: signoffs = [], isLoading: loadingSignoffs } = useQuery({
 queryKey: ['finding-signoffs', findingId],
 queryFn: () => fetchFindingSignoffs(findingId!),
 enabled: !!findingId,
 });

 const { mutate: submitNote, isPending: submittingNote } = useMutation({
 mutationFn: ({ field, text }: { field: string; text: string }) =>
 addReviewNote(findingId!, field, text, currentUserId, 'Yönetici'),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['review-notes', findingId] });
 setNewNoteField('');
 setNewNoteText('');
 setShowAddForm(false);
 },
 });

 const { mutate: markResolved } = useMutation({
 mutationFn: (noteId: string) => resolveReviewNote(noteId),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['review-notes', findingId] });
 },
 });

 const { mutate: sign, isPending: signing } = useMutation({
 mutationFn: (role: 'PREPARER' | 'REVIEWER') =>
 signFinding(findingId!, role, currentUserId, 'Demo Kullanıcı'),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['finding-signoffs', findingId] });
 },
 });

 const openNotes = (notes || []).filter((n: ReviewNote) => n.status === 'OPEN');
 const clearedNotes = (notes || []).filter((n: ReviewNote) => n.status === 'CLEARED' || n.status === 'CLOSED');

 const preparerSignoff = signoffs.find((s) => s.role === 'PREPARER');
 const reviewerSignoff = signoffs.find((s) => s.role === 'REVIEWER');

 return (
 <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-300">

 {/* ALT SEKMELER */}
 <div className="flex items-center gap-2 bg-slate-200/50 p-1 rounded-lg shrink-0">
 <button onClick={() => setActiveTab('notes')} className={clsx("flex-1 py-1.5 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2", activeTab === 'notes' ? "bg-surface text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
 <MessageSquare size={16} /> İnceleme Notları {openNotes.length > 0 && <span className="bg-orange-500 text-white text-[10px] px-1.5 rounded-full">{openNotes.length}</span>}
 </button>
 <button onClick={() => setActiveTab('signoff')} className={clsx("flex-1 py-1.5 text-sm font-bold rounded-md transition-all flex items-center justify-center gap-2", activeTab === 'signoff' ? "bg-surface text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
 <ShieldCheck size={16} /> Onay Katmanı (4-Eyes)
 </button>
 </div>

 <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 pr-2">

 {/* ======================================================================= */}
 {/* SEKME 1: GÖZDEN GEÇİRME NOTLARI */}
 {/* ======================================================================= */}
 {activeTab === 'notes' && (
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <p className="text-xs font-medium text-slate-500">Müfettişin düzeltmesi gereken kalite sorunları.</p>
 {isReviewer && (
 <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold hover:bg-orange-200 transition-colors">
 <Plus size={14} /> Yeni Not
 </button>
 )}
 </div>

 {showAddForm && (
 <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl shadow-sm animate-in slide-in-from-top-2">
 <div className="space-y-3">
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">İlgili Alan (Opsiyonel)</label>
 <input type="text" value={newNoteField} onChange={(e) => setNewNoteField(e.target.value)} placeholder="Örn: Kök Neden, Mali Etki..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
 </div>
 <div>
 <label className="text-xs font-bold text-slate-700 mb-1 block">İnceleme Notu</label>
 <textarea value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)} placeholder="Düzeltme talebinizi yazın..." rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
 </div>
 <div className="flex items-center gap-2 pt-2">
 <button
 onClick={() => submitNote({ field: newNoteField, text: newNoteText })}
 disabled={!newNoteText.trim() || submittingNote}
 className="flex-1 flex items-center justify-center gap-2 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-bold text-sm shadow-sm disabled:opacity-60"
 >
 {submittingNote ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
 Notu Gönder
 </button>
 <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 font-bold text-sm">İptal</button>
 </div>
 </div>
 </div>
 )}

 {loadingNotes ? (
 <div className="flex items-center justify-center py-10 text-slate-400">
 <Loader2 size={20} className="animate-spin mr-2" />
 <span className="text-sm">Yükleniyor...</span>
 </div>
 ) : (
 <>
 {openNotes.length > 0 && (
 <div className="space-y-3">
 <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 tracking-wider">
 <Clock size={14} /> Düzeltme Bekleyenler ({openNotes.length})
 </h4>
 {(openNotes || []).map((note: ReviewNote) => (
 <div key={note.id} className="p-4 bg-surface border-l-4 border-orange-500 rounded-r-xl shadow-sm">
 <div className="flex items-start justify-between mb-2">
 <span className="text-xs font-black text-orange-700 bg-orange-100 px-2 py-0.5 rounded uppercase tracking-wider">
 {note.field_reference || 'Genel'}
 </span>
 {!isReviewer && (
 <button onClick={() => markResolved(note.id)} className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 px-2 py-1 rounded-md font-bold flex items-center gap-1 transition-colors">
 <CheckCircle size={14} /> Çözüldü İşaretle
 </button>
 )}
 </div>
 <p className="text-sm text-slate-800 font-medium mb-3">{note.note_text}</p>
 <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
 <User size={12} /> {note.reviewer_name} • {new Date(note.created_at).toLocaleDateString('tr-TR')}
 </div>
 </div>
 ))}
 </div>
 )}

 {clearedNotes.length > 0 && (
 <div className="space-y-3 pt-4 border-t border-slate-200">
 <h4 className="text-xs font-black text-slate-400 uppercase flex items-center gap-2 tracking-wider">
 <CheckCircle size={14} /> Çözülenler ({clearedNotes.length})
 </h4>
 {(clearedNotes || []).map((note: ReviewNote) => (
 <div key={note.id} className="p-4 bg-canvas border border-slate-200 rounded-xl opacity-75 grayscale-[50%]">
 <div className="flex items-start justify-between mb-2">
 <span className="text-xs font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded">
 {note.field_reference || 'Genel'}
 </span>
 <CheckCircle size={16} className="text-emerald-500" />
 </div>
 <p className="text-sm text-slate-600 line-through mb-2">{note.note_text}</p>
 {note.resolution_text && (
 <div className="bg-emerald-50 p-2 rounded text-xs text-emerald-800 font-medium mb-2 border border-emerald-100">
 <span className="font-black">Denetçi Yanıtı:</span> {note.resolution_text}
 </div>
 )}
 </div>
 ))}
 </div>
 )}

 {notes.length === 0 && !showAddForm && (
 <div className="text-center py-16 text-slate-400">
 <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
 <p className="text-sm font-medium">Bu bulgu için inceleme notu bulunmuyor.</p>
 </div>
 )}
 </>
 )}
 </div>
 )}

 {/* ======================================================================= */}
 {/* SEKME 2: ONAY KATMANI (4-Eyes) */}
 {/* ======================================================================= */}
 {activeTab === 'signoff' && (
 <div className="space-y-4">
 <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
 <ShieldCheck className="text-blue-600 w-6 h-6 shrink-0 mt-0.5" />
 <div>
 <h3 className="font-bold text-blue-900 mb-1">Four-Eyes (Dört Göz) Prensibi</h3>
 <p className="text-xs text-blue-800 leading-relaxed font-medium">Uluslararası iç denetim standartları gereği, hiçbir bulgu en az bir yönetici tarafından gözden geçirilip onaylanmadan kesinleşemez veya denetlenene iletilemez.</p>
 </div>
 </div>

 {loadingSignoffs ? (
 <div className="flex items-center justify-center py-10 text-slate-400">
 <Loader2 size={20} className="animate-spin mr-2" />
 <span className="text-sm">Yükleniyor...</span>
 </div>
 ) : (
 <div className="space-y-4 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">

 {/* Hazırlayan (Preparer) */}
 <div className={clsx("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group", preparerSignoff?.status === 'SIGNED' ? "" : "opacity-70")}>
 <div className={clsx("flex items-center justify-center w-14 h-14 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2", preparerSignoff?.status === 'SIGNED' ? "bg-emerald-500" : "bg-slate-300")}>
 {preparerSignoff?.status === 'SIGNED' ? <CheckCircle className="text-white w-6 h-6" /> : <User className="text-white w-6 h-6" />}
 </div>
 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-surface p-5 rounded-xl border border-slate-200 shadow-sm">
 <h4 className="font-black text-slate-800 text-sm mb-1">Hazırlayan (Preparer)</h4>
 {preparerSignoff?.status === 'SIGNED' ? (
 <>
 <p className="text-xs font-bold text-slate-500 mb-2">{preparerSignoff.user_name}</p>
 <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-1 rounded uppercase">
 İMZALANDI • {preparerSignoff.signed_at ? new Date(preparerSignoff.signed_at).toLocaleDateString() : ''}
 </span>
 </>
 ) : (
 <>
 <p className="text-xs text-slate-500 mb-3">Bulgu taslağı hazırlık aşamasında.</p>
 {!isReviewer && (
 <button
 onClick={() => sign('PREPARER')}
 disabled={signing}
 className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm flex items-center justify-center gap-1 disabled:opacity-60"
 >
 {signing ? <Loader2 size={14} className="animate-spin" /> : <FileCheck size={14} />}
 İmzala ve İncelemeye Gönder
 </button>
 )}
 </>
 )}
 </div>
 </div>

 {/* İnceleyen (Reviewer) */}
 <div className={clsx("relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group mt-4", reviewerSignoff?.status === 'SIGNED' ? "" : "opacity-70")}>
 <div className={clsx("flex items-center justify-center w-14 h-14 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2", reviewerSignoff?.status === 'SIGNED' ? "bg-blue-600" : "bg-slate-300")}>
 {reviewerSignoff?.status === 'SIGNED' ? <ShieldCheck className="text-white w-6 h-6" /> : <Shield className="text-white w-6 h-6" />}
 </div>
 <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] bg-surface p-5 rounded-xl border border-slate-200 shadow-sm">
 <h4 className="font-black text-slate-800 text-sm mb-1">Gözden Geçiren (Reviewer)</h4>
 {reviewerSignoff?.status === 'SIGNED' ? (
 <>
 <p className="text-xs font-bold text-slate-500 mb-2">{reviewerSignoff.user_name}</p>
 <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-1 rounded uppercase">
 ONAYLANDI • {reviewerSignoff.signed_at ? new Date(reviewerSignoff.signed_at).toLocaleDateString() : ''}
 </span>
 </>
 ) : (
 <>
 {openNotes.length > 0 ? (
 <div className="flex items-start gap-1 p-2 bg-red-50 rounded-lg border border-red-100 mb-2">
 <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
 <p className="text-[10px] font-bold text-red-700 leading-tight">Önce {openNotes.length} adet açık inceleme notunun çözülmesi gerekmektedir.</p>
 </div>
 ) : (
 <p className="text-xs text-slate-500 mb-3">Onay bekleniyor.</p>
 )}
 {isReviewer && preparerSignoff?.status === 'SIGNED' && openNotes.length === 0 && (
 <button
 onClick={() => sign('REVIEWER')}
 disabled={signing}
 className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center justify-center gap-1 disabled:opacity-60"
 >
 {signing ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
 Yönetici Onayını Ver
 </button>
 )}
 </>
 )}
 </div>
 </div>

 </div>
 )}
 </div>
 )}

 </div>
 </div>
 );
}
