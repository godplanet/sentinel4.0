/**
 * Wave 42: ResolutionDeck — YK Karar & E-Oylama Bileşeni
 *
 * Light Mode, Apple Glassmorphism, C-Level ciddiyetinde.
 * Supabase'den canlı veri çeker.
 * SIFIRA BÖLÜNME ve nullish değer korumaları zorunludur.
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
 AlertTriangle,
 Calendar,
 CheckCircle2,
 ChevronDown, ChevronUp,
 Loader2,
 MinusCircle,
 Scale,
 ShieldCheck,
 Users,
 Vote,
 XCircle,
} from 'lucide-react';
import { useState } from 'react';

/* ──────────────────────────────────────────────────────────
 Sabitler
 ────────────────────────────────────────────────────────── */

const VOTE_CONFIG: Record<VoteChoice, { label: string; icon: typeof CheckCircle2; color: string; bg: string; ring: string }> = {
 FOR: { label: 'Kabul', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-300' },
 AGAINST: { label: 'Red', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-300' },
 ABSTAIN: { label: 'Çekimser', icon: MinusCircle, color: 'text-slate-600', bg: 'bg-slate-50', ring: 'ring-slate-300' },
};

const TYPE_LABELS: Record<string, string> = {
 APPROVAL: 'Onay',
 INFORMATION: 'Bilgilendirme',
 INSTRUCTION: 'Talimat',
 ACKNOWLEDGEMENT: 'Teyit',
};

const STATUS_BADGES: Record<string, { label: string; cls: string }> = {
 OPEN: { label: 'Açık', cls: 'bg-blue-100 text-blue-800 border-blue-200' },
 CLOSED: { label: 'Kapandı', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
 DEFERRED: { label: 'Ertelendi', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
 WITHDRAWN: { label: 'Geri Çekildi', cls: 'bg-slate-100 text-slate-600 border-slate-200' },
};

/* ──────────────────────────────────────────────────────────
 Oy Çubuğu
 ────────────────────────────────────────────────────────── */
function VoteBar({ res }: { res: ResolutionWithVotes }) {
 const forPct = res.for_pct ?? 0;
 const againstPct = res.against_pct ?? 0;
 const abstainPct = 100 - forPct - againstPct;

 return (
 <div className="space-y-1.5">
 <div className="flex h-2.5 rounded-full overflow-hidden bg-slate-100">
 <div style={{ width: `${forPct}%` }} className="bg-emerald-500 transition-all" />
 <div style={{ width: `${againstPct}%` }} className="bg-red-500 transition-all" />
 <div style={{ width: `${abstainPct > 0 ? abstainPct : 0}%` }} className="bg-slate-300 transition-all" />
 </div>
 <div className="flex gap-4 text-[10px] font-medium text-slate-500">
 <span className="text-emerald-700">Kabul %{forPct}</span>
 <span className="text-red-700">Red %{againstPct}</span>
 <span>Çekimser {res.abstain_count ?? 0}</span>
 <span className="ml-auto">{res.total_votes ?? 0} / {res.quorum_required ?? '?'} Yeter Sayı</span>
 </div>
 </div>
 );
}

/* ──────────────────────────────────────────────────────────
 Karar Kartı
 ────────────────────────────────────────────────────────── */
function ResolutionCard({ res }: { res: ResolutionWithVotes }) {
 const [expanded, setExpanded] = useState(false);
 const { mutate: castVote, isPending } = useCastVote();
 const statusBadge = STATUS_BADGES[res.status] ?? STATUS_BADGES.OPEN;
 const typeLbl = TYPE_LABELS[res.resolution_type] ?? res.resolution_type;

 function handleVote(choice: VoteChoice) {
 castVote({
 resolution_id: res.id,
 member_name: 'Demo Kullanıcı',
 member_title: 'YK Üyesi (Demo)',
 vote: choice,
 });
 }

 return (
 <motion.div
 layout
 className="bg-surface border border-slate-200 rounded-xl shadow-sm overflow-hidden"
 >
 {/* Başlık Satırı */}
 <button
 className="w-full text-left px-5 pt-5 pb-4 flex items-start gap-4"
 onClick={() => setExpanded(e => !e)}
 aria-expanded={expanded}
 >
 <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
 <Vote size={18} className="text-amber-400" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex flex-wrap items-center gap-2 mb-1">
 <span className={clsx('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border', statusBadge.cls)}>
 {statusBadge.label}
 </span>
 <span className="text-[10px] font-medium text-slate-400 uppercase">{typeLbl}</span>
 </div>
 <h4 className="text-sm font-bold text-primary leading-snug">{res.title}</h4>
 {res.meeting_date && (
 <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
 <Calendar size={11} />
 {new Date(res.meeting_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
 </div>
 )}
 </div>
 {/* Sonuç rozeti */}
 {res.status === 'CLOSED' && (
 <span className={clsx('shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border', res.passed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200')}>
 {res.passed ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
 {res.passed ? 'Geçti' : 'Reddedildi'}
 </span>
 )}
 <div className="shrink-0 text-slate-400 mt-1">
 {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
 </div>
 </button>

 {/* Oy Çubuğu (her zaman görünür) */}
 <div className="px-5 pb-4">
 <VoteBar res={res} />
 </div>

 {/* Genişletilmiş Bölüm */}
 <AnimatePresence>
 {expanded && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="px-5 pb-5 space-y-4 border-t border-slate-100 pt-4">
 {/* Açıklama */}
 <p className="text-sm text-slate-700 leading-relaxed">{res.description}</p>

 {/* Düzenleyici Referans */}
 {res.regulatory_ref && (
 <div className="flex items-center gap-2 text-xs text-slate-500 bg-canvas px-3 py-2 rounded-lg border border-slate-100">
 <Scale size={12} className="text-slate-400 shrink-0" />
 <span className="font-medium">{res.regulatory_ref}</span>
 </div>
 )}

 {/* Teklif Eden */}
 {res.proposed_by && (
 <div className="flex items-center gap-2 text-xs text-slate-500">
 <Users size={12} />
 <span>Teklif Eden: <strong className="text-slate-700">{res.proposed_by}</strong></span>
 </div>
 )}

 {/* Oy Listesi */}
 {(res.votes || []).length > 0 && (
 <div>
 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bireysel Oylar</p>
 <div className="space-y-1.5">
 {(res.votes || []).map(v => {
 const vcfg = VOTE_CONFIG[v.vote] ?? VOTE_CONFIG.ABSTAIN;
 const VIcon = vcfg.icon;
 return (
 <div key={v.id} className={clsx('flex items-center gap-3 px-3 py-2 rounded-lg border text-xs', vcfg.bg, `ring-1 ${vcfg.ring}`)}>
 <VIcon size={14} className={vcfg.color} />
 <div className="flex-1 min-w-0">
 <span className="font-semibold text-primary">{v.member_name}</span>
 <span className="text-slate-400 ml-2">{v.member_title}</span>
 {v.rationale && <p className="text-slate-500 mt-0.5 truncate">{v.rationale}</p>}
 </div>
 <span className={clsx('font-bold text-[10px] uppercase', vcfg.color)}>{vcfg.label}</span>
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* Oy Kullan Paneli — yalnızca OPEN kararlar */}
 {res.status === 'OPEN' && (
 <div className="border-t border-slate-100 pt-4">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Oyunuzu Kullanın (Demo)</p>
 <div className="flex gap-2 flex-wrap">
 {(['FOR', 'AGAINST', 'ABSTAIN'] as VoteChoice[]).map(choice => {
 const vcfg = VOTE_CONFIG[choice];
 const VIcon = vcfg.icon;
 return (
 <button
 key={choice}
 onClick={() => handleVote(choice)}
 disabled={isPending}
 className={clsx(
 'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all',
 vcfg.bg, vcfg.color, `ring-1 ${vcfg.ring}`,
 'hover:opacity-80 disabled:opacity-50',
 )}
 >
 {isPending ? <Loader2 size={12} className="animate-spin" /> : <VIcon size={12} />}
 {vcfg.label}
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}

/* ──────────────────────────────────────────────────────────
 Ana Widget — ResolutionDeck
 ────────────────────────────────────────────────────────── */
export function ResolutionDeck() {
 const { data: resolutions = [], isLoading, isError } = useResolutions();

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-16">
 <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
 </div>
 );
 }

 if (isError) {
 return (
 <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-center">
 <AlertTriangle className="mx-auto w-8 h-8 text-amber-400 mb-2" />
 <p className="text-sm text-amber-800">Karar verileri yüklenirken bir hata oluştu.</p>
 </div>
 );
 }

 if (resolutions.length === 0) {
 return (
 <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-10 text-center">
 <Vote className="mx-auto w-10 h-10 text-slate-300 mb-3" />
 <p className="text-sm text-slate-600 font-medium">Gündemde bekleyen karar bulunmamaktadır.</p>
 </div>
 );
 }

 const open = (resolutions || []).filter(r => r.status === 'OPEN');
 const closed = (resolutions || []).filter(r => r.status !== 'OPEN');
 const quorumReached = (resolutions || []).filter(r => r.quorum_reached).length;

 return (
 <div className="space-y-5">
 {/* İstatistik Şeridi */}
 <div className="flex flex-wrap gap-3 p-4 bg-surface rounded-xl border border-slate-200 shadow-sm">
 {[
 { label: 'Açık Gündem', value: open.length, cls: 'text-blue-700' },
 { label: 'Kapatılan', value: closed.length, cls: 'text-emerald-600' },
 { label: 'Yeter Sayı Tam', value: quorumReached, cls: 'text-violet-600' },
 ].map(s => (
 <div key={s.label} className="flex items-center gap-3">
 <span className={clsx('text-xl font-black tabular-nums', s.cls)}>{s.value}</span>
 <span className="text-xs text-slate-500">{s.label}</span>
 <div className="w-px h-5 bg-slate-200 last:hidden" />
 </div>
 ))}
 <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
 <ShieldCheck size={11} />
 Canlı Veri
 </div>
 </div>

 {/* Karar Kartları */}
 <div className="space-y-3">
 {(resolutions || []).map(res => (
 <ResolutionCard key={res.id} res={res} />
 ))}
 </div>
 </div>
 );
}
