/**
 * Board Resolution & E-Voting Deck — Ana Sayfa
 * Wave 42: Yönetim Kurulu Karar ve E-Oylama Masası
 *
 * FSD: pages/governance/BoardResolutionPage.tsx
 * Supabase → features/board-voting/api.ts → useResolutions + useCastVote
 * %100 Light Mode | Glassmorphism | Defensive Programming
 */

import {
 useCastVote,
 useResolutions,
 type ResolutionWithVotes,
 type VoteChoice,
} from '@/features/board-voting/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertCircle,
 BarChart3,
 CheckCircle,
 ChevronRight,
 Clock,
 Gavel,
 MinusCircle,
 ShieldCheck,
 Users,
 Vote,
 XCircle,
} from 'lucide-react';
import { useState } from 'react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
 OPEN: { label: 'Oylamada', color: 'bg-blue-100 text-blue-700 border-blue-200' },
 CLOSED: { label: 'Kapalı', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
 DEFERRED: { label: 'Ertelendi', color: 'bg-amber-100 text-amber-700 border-amber-200' },
 WITHDRAWN: { label: 'İptal', color: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const TYPE_LABELS: Record<string, string> = {
 APPROVAL: 'Karar',
 INFORMATION: 'Bilgilendirme',
 INSTRUCTION: 'Talimat',
 ACKNOWLEDGEMENT: 'Kabul',
};

// ─── Resolution Card ─────────────────────────────────────────────────────────

function ResolutionCard({
 res,
 onSelect,
 isSelected,
}: {
 res: ResolutionWithVotes;
 onSelect: () => void;
 isSelected: boolean;
}) {
 const st = STATUS_LABELS[res?.status ?? 'OPEN'] ?? STATUS_LABELS.OPEN;
 const type = TYPE_LABELS[res?.resolution_type ?? 'APPROVAL'] ?? 'Karar';

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={onSelect}
 className={clsx(
 'cursor-pointer rounded-xl border p-4 transition-all',
 'bg-white/70 backdrop-blur-lg shadow-sm',
 isSelected
 ? 'border-blue-400 ring-2 ring-blue-200 shadow-lg'
 : 'border-slate-200 hover:border-blue-200 hover:shadow-md',
 )}
 >
 <div className="flex items-start justify-between gap-3 mb-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full border', st.color)}>
 {st.label}
 </span>
 <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
 {type}
 </span>
 </div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug">{res?.title ?? '—'}</h3>
 <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed line-clamp-2">{res?.description ?? ''}</p>
 </div>
 <ChevronRight size={14} className={clsx('text-slate-300 flex-shrink-0 mt-1 transition-transform', isSelected && 'rotate-90')} />
 </div>

 {/* Oy Çubuğu */}
 <div className="space-y-1.5">
 <div className="flex items-center justify-between text-[10px] text-slate-500">
 <span className="flex items-center gap-1">
 <Users size={10} /> {res?.total_votes ?? 0} / {res?.quorum_required ?? 0} Oy
 </span>
 <span>
 Lehte: <span className="font-bold text-emerald-600">{res?.for_count ?? 0}</span>
 {' · '}
 Aleyhte: <span className="font-bold text-red-500">{res?.against_count ?? 0}</span>
 {' · '}
 Çekimser: <span className="font-bold text-slate-400">{res?.abstain_count ?? 0}</span>
 </span>
 </div>
 <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
 <div
 className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all"
 style={{ width: `${res?.for_pct ?? 0}%` }}
 />
 </div>
 </div>

 {res?.regulatory_ref && (
 <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
 <ShieldCheck size={9} />
 <span className="font-mono truncate">{res.regulatory_ref}</span>
 </div>
 )}
 </motion.div>
 );
}

// ─── Vote Panel ───────────────────────────────────────────────────────────────

function VotePanel({ res }: { res: ResolutionWithVotes }) {
 const [voterName, setVoterName] = useState('');
 const [voterTitle, setVoterTitle] = useState('');
 const [choice, setChoice] = useState<VoteChoice | null>(null);
 const [rationale, setRationale] = useState('');
 const castVote = useCastVote();

 const canVote = res?.status === 'OPEN';

 const handleVote = () => {
 if (!choice || !voterName.trim()) return;
 castVote.mutate(
 {
 resolution_id: res.id,
 member_name: voterName.trim(),
 member_title: voterTitle.trim(),
 vote: choice,
 rationale: rationale.trim() || undefined,
 },
 {
 onSuccess: () => {
 setVoterName('');
 setVoterTitle('');
 setChoice(null);
 setRationale('');
 },
 onError: (err: any) => {
 alert(err?.message ?? 'Oy kullanılırken hata oluştu.');
 },
 }
 );
 };

 return (
 <div className="space-y-5">
 {/* Karar Özeti */}
 <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <div className="flex items-center gap-3 mb-3">
 <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
 <Gavel className="w-5 h-5 text-white" />
 </div>
 <div>
 <div className="text-xs font-bold text-slate-800">{res?.title ?? '—'}</div>
 <div className="text-[10px] text-slate-500">
 {res?.meeting_date
 ? new Date(res.meeting_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
 : 'Toplantı tarihi belirsiz'}
 </div>
 </div>
 </div>
 <p className="text-[11px] text-slate-600 leading-relaxed">{res?.description ?? ''}</p>
 {res?.proposed_by && (
 <div className="mt-2 text-[10px] text-slate-400">
 Teklif eden: <span className="font-semibold text-slate-600">{res.proposed_by}</span>
 </div>
 )}
 </div>

 {/* Oy Dağılımı */}
 <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <h4 className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-2">
 <BarChart3 size={13} className="text-blue-500" />
 Oy Dağılımı ({res?.total_votes ?? 0} / {res?.quorum_required ?? 0} — {res?.quorum_reached ? '✓ Yeter Sayı' : '⚠ Yeter Sayı Yok'})
 </h4>

 <div className="grid grid-cols-3 gap-3 mb-4">
 {[
 { icon: CheckCircle, label: 'Lehte', count: res?.for_count ?? 0, pct: res?.for_pct ?? 0, color: 'text-emerald-500', bg: 'from-emerald-50 to-emerald-100/50' },
 { icon: XCircle, label: 'Aleyhte', count: res?.against_count ?? 0, pct: res?.against_pct ?? 0, color: 'text-red-500', bg: 'from-red-50 to-red-100/50' },
 { icon: MinusCircle, label: 'Çekimser', count: res?.abstain_count ?? 0, pct: Math.round(((res?.abstain_count ?? 0) / ((res?.total_votes || 1))) * 100), color: 'text-slate-400', bg: 'from-slate-50 to-slate-100/50' },
 ].map(({ icon: Icon, label, count, pct, color, bg }) => (
 <div key={label} className={clsx('rounded-xl p-3 bg-gradient-to-br', bg, 'border border-slate-100')}>
 <Icon size={18} className={clsx(color, 'mb-1')} />
 <div className="text-xl font-black text-slate-800">{count}</div>
 <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label} ({pct}%)</div>
 </div>
 ))}
 </div>

 {/* Oy listesi */}
 <div className="space-y-1.5 max-h-52 overflow-y-auto">
 {(res?.votes || []).map((v) => (
 <div key={v?.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50/80 border border-slate-100">
 {v?.vote === 'FOR'
 ? <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
 : v?.vote === 'AGAINST'
 ? <XCircle size={13} className="text-red-400 flex-shrink-0" />
 : <MinusCircle size={13} className="text-slate-400 flex-shrink-0" />}
 <div className="flex-1 min-w-0">
 <span className="text-[11px] font-semibold text-slate-700">{v?.member_name ?? '—'}</span>
 {v?.member_title && <span className="text-[10px] text-slate-400 ml-1">· {v.member_title}</span>}
 {v?.rationale && <div className="text-[10px] text-slate-400 truncate mt-0.5">"{v.rationale}"</div>}
 </div>
 <span className="text-[9px] text-slate-400 flex-shrink-0">
 {new Date(v?.voted_at ?? '').toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 ))}
 {(res?.votes || []).length === 0 && (
 <p className="text-[11px] text-slate-400 text-center py-3">Henüz oy kullanılmadı</p>
 )}
 </div>
 </div>

 {/* Oy Kullan */}
 {canVote && (
 <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200 p-5 shadow-sm">
 <h4 className="text-xs font-bold text-slate-700 mb-4 flex items-center gap-2">
 <Vote size={13} className="text-blue-500" />
 Oy Kullan
 </h4>
 <div className="space-y-3">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="text-[10px] font-bold text-slate-600 mb-1 block">Ad Soyad *</label>
 <input
 value={voterName}
 onChange={(e) => setVoterName(e.target.value)}
 placeholder="Dr. Ahmet Yılmaz"
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
 />
 </div>
 <div>
 <label className="text-[10px] font-bold text-slate-600 mb-1 block">Unvan</label>
 <input
 value={voterTitle}
 onChange={(e) => setVoterTitle(e.target.value)}
 placeholder="Bağımsız Üye"
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 bg-white"
 />
 </div>
 </div>

 <div className="flex gap-2">
 {([
 { v: 'FOR', label: 'Lehte (FOR)', icon: CheckCircle, color: 'emerald' },
 { v: 'AGAINST', label: 'Aleyhte (AGAINST)', icon: XCircle, color: 'red' },
 { v: 'ABSTAIN', label: 'Çekimser', icon: MinusCircle, color: 'slate' },
 ] as const).map(({ v, label, icon: Icon, color }) => (
 <button
 key={v}
 onClick={() => setChoice(v)}
 className={clsx(
 'flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[10px] font-bold transition-all',
 choice === v
 ? color === 'emerald'
 ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg'
 : color === 'red'
 ? 'bg-red-500 text-white border-red-500 shadow-lg'
 : 'bg-slate-500 text-white border-slate-500 shadow-lg'
 : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
 )}
 >
 <Icon size={16} />
 {label}
 </button>
 ))}
 </div>

 <div>
 <label className="text-[10px] font-bold text-slate-600 mb-1 block">Gerekçe (İsteğe Bağlı)</label>
 <textarea
 value={rationale}
 onChange={(e) => setRationale(e.target.value)}
 rows={2}
 placeholder="Oy gerekçenizi kısaca açıklayınız..."
 className="w-full px-3 py-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400/30 resize-none bg-white"
 />
 </div>

 <button
 onClick={handleVote}
 disabled={!choice || !voterName.trim() || castVote.isPending}
 className={clsx(
 'w-full py-2.5 rounded-xl text-sm font-bold transition-all',
 choice && voterName.trim()
 ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg'
 : 'bg-slate-100 text-slate-400 cursor-not-allowed',
 )}
 >
 {castVote.isPending ? 'Kaydediliyor...' : 'Oyumu Kullan — Dijital İmza ile Mühürle'}
 </button>
 </div>
 </div>
 )}

 {!canVote && (
 <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
 <AlertCircle size={14} />
 <span>Bu karar için oylama {STATUS_LABELS[res?.status]?.label ?? res?.status} — oy kullanılamaz.</span>
 </div>
 )}
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BoardResolutionPage() {
 const { data: resolutions, isLoading, error } = useResolutions();
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const selected = (resolutions || []).find((r) => r?.id === selectedId) ?? null;

 const stats = {
 total: (resolutions || []).length,
 oylamada: (resolutions || []).filter((r) => r?.status === 'OPEN').length,
 kabul: (resolutions || []).filter((r) => r?.passed).length,
 toplam: (resolutions || []).reduce((sum, r) => sum + (r?.total_votes ?? 0), 0),
 };

 return (
 <div className="min-h-screen p-4">
 {/* Header */}
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className="mb-4"
 >
 <div className="flex items-center gap-3 mb-1">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm">
 <Gavel className="w-5 h-5 text-white" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-900 tracking-tight">
 Board Resolution & E-Voting Deck
 </h1>
 <p className="text-xs text-slate-500">Yönetim Kurulu Karar ve Elektronik Oylama Masası</p>
 </div>
 </div>

 {/* KPI Satırı */}
 <div className="grid grid-cols-4 gap-3 mt-4">
 {[
 { label: 'Toplam Karar', value: stats.total, icon: Gavel, color: 'text-slate-700' },
 { label: 'Oylamada', value: stats.oylamada, icon: Clock, color: 'text-blue-600' },
 { label: 'Kabul Edilen', value: stats.kabul, icon: CheckCircle, color: 'text-emerald-600' },
 { label: 'Toplam Oy', value: stats.toplam, icon: Vote, color: 'text-indigo-600' },
 ].map(({ label, value, icon: Icon, color }) => (
 <div key={label} className="bg-white/70 backdrop-blur-lg rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
 <Icon size={15} className={clsx(color, 'mb-1')} />
 <div className="text-xl font-black text-slate-800">{value}</div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
 </div>
 ))}
 </div>
 </motion.div>

 {/* Content */}
 {isLoading && (
 <div className="flex items-center justify-center py-20 text-slate-400">
 <div className="w-6 h-6 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin mr-3" />
 <span className="text-sm">Karar listesi yükleniyor...</span>
 </div>
 )}

 {error && (
 <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
 <AlertCircle size={16} />
 Karar listesi yüklenemedi. Lütfen bağlantınızı kontrol edin.
 </div>
 )}

 {!isLoading && !error && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 {/* Sol: Karar Listesi */}
 <div className="space-y-3">
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <Gavel size={11} /> Gündem Maddeleri
 </div>
 {(resolutions || []).length === 0 && !isLoading && (
 <div className="text-center py-12 text-slate-400">
 <Gavel className="w-10 h-10 mx-auto mb-2 opacity-40" />
 <p className="text-sm">Gündemde karar bulunamadı</p>
 </div>
 )}
 {(resolutions || []).map((res) => (
 <ResolutionCard
 key={res?.id}
 res={res}
 onSelect={() => setSelectedId(res?.id === selectedId ? null : res?.id)}
 isSelected={res?.id === selectedId}
 />
 ))}
 </div>

 {/* Sağ: Detay & Oylama */}
 <div>
 <AnimatePresence mode="wait">
 {selected ? (
 <motion.div
 key={selected.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 >
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <Vote size={11} /> Oy Paneli
 </div>
 <VotePanel res={selected} />
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40"
 >
 <Vote className="w-12 h-12 mb-3 opacity-30" />
 <p className="text-sm font-medium">Soldaki listeden bir karar seçin</p>
 <p className="text-xs mt-1">Oy dağılımı ve oylama paneli burada açılır</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>
 )}
 </div>
 );
}
