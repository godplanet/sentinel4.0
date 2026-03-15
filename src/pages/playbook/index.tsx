import type { CreatePlaybookEntryInput, PlaybookCategory, PlaybookEntry } from '@/entities/playbook/api';
import {
 createPlaybookEntry,
 deletePlaybookEntry,
 fetchPlaybookEntries,
} from '@/entities/playbook/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, ChevronDown, ChevronUp, Lock, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<PlaybookCategory, { label: string; color: string; bg: string }> = {
 BEST_PRACTICE: { label: 'En İyi Uygulama', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/25' },
 LESSON_LEARNED: { label: 'Öğrenilen Ders', color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/25' },
 RISK_INSIGHT: { label: 'Risk İçgörüsü', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/25' },
 METHODOLOGY: { label: 'Metodoloji', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/25' },
 OBSERVATION: { label: 'Gözlem', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/25' },
};

interface NewEntryForm {
 title: string;
 content: string;
 category: PlaybookCategory;
 tags: string;
 domain: string;
}

const EMPTY_FORM: NewEntryForm = {
 title: '', content: '', category: 'LESSON_LEARNED', tags: '', domain: '',
};

// ─── Entry Card ───────────────────────────────────────────────────────────────

function EntryCard({ entry, onDelete }: { entry: PlaybookEntry; onDelete: (id: string) => void }) {
 const [expanded, setExpanded] = useState(false);
 const meta = CATEGORY_META[entry.category];

 return (
 <div className="bg-slate-900/60 border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-200">
 <button
 className="w-full px-5 py-4 text-left flex items-start gap-4"
 onClick={() => setExpanded((v) => !v)}
 >
 <div className={`mt-0.5 px-2 py-1 rounded-lg border text-[10px] font-semibold uppercase tracking-wider flex-shrink-0 ${meta.bg} ${meta.color}`}>
 {meta.label}
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold text-white truncate">{entry.title}</p>
 <p className="text-xs text-slate-500 mt-0.5">
 {new Date(entry.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
 {entry.domain && <> · <span className="text-slate-400">{entry.domain}</span></>}
 </p>
 </div>
 <div className="flex items-center gap-2 flex-shrink-0 ml-2">
 {entry.tags?.length > 0 && (
 <div className="flex items-center gap-1">
 <Tag className="w-3 h-3 text-slate-500" />
 <span className="text-[10px] text-slate-500">{entry.tags.length}</span>
 </div>
 )}
 {expanded ? (
 <ChevronUp className="w-4 h-4 text-slate-500" />
 ) : (
 <ChevronDown className="w-4 h-4 text-slate-500" />
 )}
 </div>
 </button>

 {expanded && (
 <div className="px-5 pb-4 border-t border-white/6">
 <p className="text-sm text-slate-300 leading-relaxed mt-3 whitespace-pre-wrap">{entry.content}</p>
 {entry.tags?.length > 0 && (
 <div className="flex flex-wrap gap-1.5 mt-3">
 {(entry.tags || []).map((tag) => (
 <span key={tag} className="px-2 py-0.5 bg-slate-800/60 border border-white/8 rounded-full text-[11px] text-slate-400">
 #{tag}
 </span>
 ))}
 </div>
 )}
 <div className="flex justify-end mt-3">
 <button
 onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-transparent hover:border-rose-500/25"
 >
 <Trash2 className="w-3 h-3" />
 Sil
 </button>
 </div>
 </div>
 )}
 </div>
 );
}

// ─── New Entry Modal ──────────────────────────────────────────────────────────

function NewEntryModal({ onClose }: { onClose: () => void }) {
 const queryClient = useQueryClient();
 const [form, setForm] = useState<NewEntryForm>(EMPTY_FORM);

 const createMutation = useMutation({
 mutationFn: (input: CreatePlaybookEntryInput) => createPlaybookEntry(input),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['playbook-entries'] });
 toast.success('Playbook girdisi denetim veri tabanına kaydedildi.');
 onClose();
 },
 onError: () => {
 toast.error('Kayıt başarısız — regülatif veri bütünlüğü doğrulanamadı.');
 },
 });

 function handleSubmit(e: React.FormEvent) {
 e.preventDefault();
 if (!form.title.trim() || !form.content.trim()) return;
 const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
 createMutation.mutate({
 title: form.title,
 content: form.content,
 category: form.category,
 tags,
 domain: form.domain.trim() || null,
 });
 }

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
 <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
 <div className="flex items-center justify-between px-4 py-5 border-b border-white/8">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
 <BookOpen className="w-4 h-4 text-white" />
 </div>
 <h2 className="text-base font-semibold text-white">Yeni Playbook Girdisi</h2>
 </div>
 <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-lg leading-none">×</button>
 </div>

 <form onSubmit={handleSubmit} className="p-4 space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Başlık</label>
 <input
 value={form.title}
 onChange={(e) => setForm({ ...form, title: e.target.value })}
 required
 placeholder="Bu girdi ne hakkında?"
 className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Kategori</label>
 <select
 value={form.category}
 onChange={(e) => setForm({ ...form, category: e.target.value as PlaybookCategory })}
 className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
 >
 {(Object.keys(CATEGORY_META) as PlaybookCategory[]).map((cat) => (
 <option key={cat} value={cat}>{CATEGORY_META[cat].label}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Alan / Domain</label>
 <input
 value={form.domain}
 onChange={(e) => setForm({ ...form, domain: e.target.value })}
 placeholder="ör: Kredi Riski"
 className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">İçerik</label>
 <textarea
 value={form.content}
 onChange={(e) => setForm({ ...form, content: e.target.value })}
 required
 rows={5}
 placeholder="Deneyiminizi, içgörünüzü veya önerdiğiniz yaklaşımı paylaşın..."
 className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 resize-none"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Etiketler (virgülle ayrılmış)</label>
 <input
 value={form.tags}
 onChange={(e) => setForm({ ...form, tags: e.target.value })}
 placeholder="ör: gdpr, iç-kontrol, otomasyon"
 className="w-full px-3.5 py-2.5 bg-slate-800 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
 />
 </div>

 <div className="flex gap-3 pt-2">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-slate-400 hover:text-white hover:bg-surface/5 transition-colors"
 >
 İptal
 </button>
 <button
 type="submit"
 disabled={createMutation.isPending || !form.title.trim() || !form.content.trim()}
 className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
 >
 {createMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PlaybookPage() {
 const queryClient = useQueryClient();
 const [showModal, setShowModal] = useState(false);
 const [search, setSearch] = useState('');
 const [filterCat, setFilterCat] = useState<PlaybookCategory | 'ALL'>('ALL');

 const { data: entries = [], isLoading } = useQuery({
 queryKey: ['playbook-entries'],
 queryFn: fetchPlaybookEntries,
 });

 const deleteMutation = useMutation({
 mutationFn: deletePlaybookEntry,
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ['playbook-entries'] });
 toast.success('Playbook girdisi denetim kayıtlarından kaldırıldı.');
 },
 onError: () => toast.error('Silme işlemi başarısız — lütfen yetkilerinizi kontrol edin.'),
 });

 function handleDelete(id: string) {
 if (!confirm('Bu girdiyi silmek istediğinizden emin misiniz?')) return;
 deleteMutation.mutate(id);
 }

 const filtered = (entries || []).filter((e) => {
 const matchesCat = filterCat === 'ALL' || e.category === filterCat;
 const q = search.toLowerCase();
 const matchesSearch = !q || e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q) || (e.tags ?? []).some((t) => t.toLowerCase().includes(q));
 return matchesCat && matchesSearch;
 });

 const categoryCounts = entries.reduce<Record<string, number>>((acc, e) => {
 acc[e.category] = (acc[e.category] ?? 0) + 1;
 return acc;
 }, {});

 return (
 <div className="min-h-screen text-white p-4">
 {/* Header */}
 <div className="flex items-start justify-between mb-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
 <BookOpen className="w-6 h-6 text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-bold text-white">Denetim Playbook'u</h1>
 <p className="text-sm text-slate-400 mt-0.5">Kurumsal bellek · Öğrenilen dersler · En iyi uygulamalar</p>
 </div>
 </div>
 <button
 onClick={() => setShowModal(true)}
 className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-lg shadow-sky-500/20"
 >
 <Plus className="w-4 h-4" />
 Yeni Girdi
 </button>
 </div>

 {/* Stats bar */}
 <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
 <button
 onClick={() => setFilterCat('ALL')}
 className={`col-span-2 md:col-span-1 flex flex-col items-center justify-center px-4 py-3 rounded-xl border transition-all ${filterCat === 'ALL' ? 'bg-surface/10 border-white/20' : 'bg-slate-900/40 border-white/6 hover:bg-surface/5'}`}
 >
 <span className="text-2xl font-bold text-white">{entries.length}</span>
 <span className="text-[11px] text-slate-400 mt-0.5">Toplam</span>
 </button>
 {(Object.keys(CATEGORY_META) as PlaybookCategory[]).map((cat) => {
 const meta = CATEGORY_META[cat];
 return (
 <button
 key={cat}
 onClick={() => setFilterCat(filterCat === cat ? 'ALL' : cat)}
 className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl border transition-all ${filterCat === cat ? `${meta.bg} border-current` : 'bg-slate-900/40 border-white/6 hover:bg-surface/5'}`}
 >
 <span className={`text-xl font-bold ${meta.color}`}>{categoryCounts[cat] ?? 0}</span>
 <span className="text-[10px] text-slate-500 mt-0.5 text-center leading-tight">{meta.label}</span>
 </button>
 );
 })}
 </div>

 {/* Search */}
 <div className="relative mb-5">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
 <input
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Başlık, içerik veya etiket ara..."
 className="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-white/8 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
 />
 </div>

 {/* Entries */}
 {isLoading ? (
 <div className="flex items-center justify-center h-40 text-slate-500 text-sm">Yükleniyor...</div>
 ) : filtered.length === 0 ? (
 <div className="flex flex-col items-center justify-center h-52 text-center">
 <div className="w-14 h-14 rounded-2xl bg-slate-800/60 border border-white/8 flex items-center justify-center mb-4">
 <Lock className="w-7 h-7 text-slate-600" />
 </div>
 <p className="text-base font-semibold text-slate-400">
 {entries.length === 0 ? 'Henüz girdi yok' : 'Sonuç bulunamadı'}
 </p>
 <p className="text-sm text-slate-600 mt-1 max-w-xs">
 {entries.length === 0
 ? 'İlk kurumsal bellek girdisini oluşturarak Seviye 5\'i aç.'
 : 'Farklı anahtar kelimeler veya filtreler deneyin.'}
 </p>
 {entries.length === 0 && (
 <button
 onClick={() => setShowModal(true)}
 className="mt-4 flex items-center gap-2 px-4 py-2 bg-sky-500/20 border border-sky-500/30 rounded-xl text-sm font-semibold text-sky-300 hover:bg-sky-500/30 transition-colors"
 >
 <Plus className="w-4 h-4" />
 İlk Girdiyi Oluştur
 </button>
 )}
 </div>
 ) : (
 <div className="space-y-3">
 {(filtered || []).map((entry) => (
 <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
 ))}
 </div>
 )}

 {showModal && (
 <NewEntryModal onClose={() => setShowModal(false)} />
 )}
 </div>
 );
}
