/**
 * Shadow Board & AI Strategy Simulator
 * Wave 83: Gölge Yönetim Kurulu (Strategy / Execution)
 *
 * FSD: pages/strategy/ShadowBoardPage.tsx
 * Veri: features/shadow-board/api.ts
 * Tasarım: %100 Light Mode | Apple Glass
 */

import {
 useBoardResponses,
 useRiskScores,
 useStrategies,
 type SimulatedStrategy
} from '@/features/shadow-board/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 Bot,
 BrainCircuit,
 ChevronRight,
 GitPullRequestDraft,
 MessageSquare,
 Minus,
 PlayCircle,
 TrendingDown, TrendingUp,
 Users
} from 'lucide-react';
import { useState } from 'react';

// ─── Formatting ─────────────────────────────────────────────────────────────

const formatCurrency = (val: number | null) => {
 const num = val ?? 0;
 if (num >= 1_000_000) return `₺${(num / 1_000_000).toFixed(2)}M`;
 if (num >= 1_000) return `₺${(num / 1_000).toFixed(0)}K`;
 return `₺${num}`;
};

const STRATEGY_STATUS_MAP = {
 'Draft': { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
 'Simulating': { color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
 'Completed': { color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
 'Approved': { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
 'Rejected': { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
} as const;

const SENTIMENT_MAP = {
 'Positive': { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
 'Neutral': { icon: Minus, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
 'Cautious': { icon: AlertTriangle,color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
 'Negative': { icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' }
} as const;


// ─── Strategy Card ──────────────────────────────────────────────────────────

function StrategyCard({ item, onSelect, isSelected }: { item: SimulatedStrategy, onSelect: () => void, isSelected: boolean }) {
 const stColor = STRATEGY_STATUS_MAP[item?.status as keyof typeof STRATEGY_STATUS_MAP] ?? STRATEGY_STATUS_MAP['Draft'];

 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={onSelect}
 className={clsx(
 'cursor-pointer rounded-xl border p-4 transition-all relative overflow-hidden',
 'bg-white/70 backdrop-blur-lg shadow-sm',
 isSelected
 ? 'border-purple-400 ring-2 ring-purple-100 shadow-md'
 : 'border-slate-200 hover:border-purple-200 hover:shadow-sm'
 )}
 >
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex flex-col gap-1.5 flex-1 pr-4">
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className={clsx('text-[9px] font-bold px-1.5 py-0.5 rounded border border-current', stColor.bg, stColor.color, stColor.border)}>
 {item?.status}
 </span>
 <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-mono">
 {new Date(item?.simulation_date).toLocaleDateString()}
 </span>
 </div>
 <h3 className="text-sm font-bold text-slate-800 leading-snug truncate">
 {item?.strategy_name}
 </h3>
 </div>
 <ChevronRight size={14} className={clsx('text-slate-300 flex-shrink-0 mt-5 absolute right-4 transition-transform z-10', isSelected && 'rotate-90')} />
 </div>

 <div className="flex items-center justify-between mt-3 mb-1 text-[10px] text-slate-500 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
 <span className="font-medium truncate flex-1 block">{item?.description}</span>
 <div className="flex flex-col gap-0.5 text-right pl-3 border-l border-slate-200 ml-2">
 <span className="font-bold text-[9px] uppercase tracking-wider text-slate-400">Tahsis Edilen</span>
 <span className="font-mono font-bold text-slate-700">{formatCurrency(item?.capital_allocation)}</span>
 </div>
 </div>
 </motion.div>
 );
}

// ─── Risk Scores Panel ──────────────────────────────────────────────────────

function RiskScoresPanel({ strategyId }: { strategyId: string }) {
 const { data: scores, isLoading } = useRiskScores(strategyId);

 if (isLoading) return <div className="text-xs text-slate-400 py-3">Risk simülasyonu çalışıyor...</div>;
 if (!scores || scores.length === 0) return null;

 return (
 <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
 {(scores || []).map((sc, i) => {
 const isNeg = sc.impact_direction === 'Negative';
 const isPos = sc.impact_direction === 'Positive';
 
 return (
 <div key={sc.id ?? i} className={clsx(
 "p-3 rounded-xl border flex flex-col justify-between",
 isNeg ? "bg-rose-50/50 border-rose-100" : 
 isPos ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-200"
 )}>
 <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex justify-between">
 {sc.risk_category}
 <span className="text-slate-400 text-[8px]">% {sc.confidence_score} Güven</span>
 </div>
 <div className="flex items-end gap-1">
 <span className={clsx(
 "text-lg font-black font-mono tracking-tight",
 isNeg ? "text-rose-700" : isPos ? "text-emerald-700" : "text-slate-700"
 )}>
 {sc.projected_impact! > 0 ? '+' : ''}{sc.projected_impact}%
 </span>
 <span className="text-[10px] pb-0.5 text-slate-400">Etki</span>
 </div>
 </div>
 );
 })}
 </div>
 );
}

// ─── AI Board Chatter Panel ─────────────────────────────────────────────────

function BoardChatterPanel({ strategyId }: { strategyId: string }) {
 const { data: responses, isLoading } = useBoardResponses(strategyId);

 if (isLoading) return <div className="text-xs text-slate-400 py-3 flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-purple-300 border-t-purple-600 animate-spin" /> Gölge Yönetim Kurulu toplanıyor...</div>;

 if (!responses || responses.length === 0) {
 return (
 <div className="text-center py-4 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
 <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
 <p className="text-xs font-semibold">Simülasyon sonuçları henüz konseye sunulmadı.</p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5 uppercase tracking-wider mb-3">
 <MessageSquare size={13} className="text-purple-500" />
 Gölge Yönetim Kurulu (Live Debate)
 </h4>
 
 <div className="relative pl-4 border-l-2 border-purple-100 space-y-5">
 {(responses || []).map((resp, i) => {
 const sent = SENTIMENT_MAP[resp.sentiment as keyof typeof SENTIMENT_MAP] ?? SENTIMENT_MAP['Neutral'];
 const Icon = sent.icon;

 return (
 <motion.div 
 key={resp.id ?? i}
 initial={{ opacity: 0, x: -10 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.15 }}
 className="relative"
 >
 {/* Timeline Dot */}
 <div className={clsx("absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white", sent.border, sent.color)}></div>
 
 <div className={clsx("bg-white border rounded-xl p-3 shadow-sm", sent.border)}>
 <div className="flex items-center gap-2 mb-1.5">
 <div className={clsx("w-6 h-6 rounded bg-slate-100 flex items-center justify-center")}>
 <Bot size={12} className="text-slate-600" />
 </div>
 <div>
 <div className="text-[10px] font-bold text-slate-800 leading-tight">{resp.avatar_name}</div>
 <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{resp.avatar_role}</div>
 </div>
 <div className={clsx("ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold border", sent.bg, sent.color, sent.border)}>
 <Icon size={8} /> {resp.sentiment}
 </div>
 </div>
 
 <p className="text-xs text-slate-600 leading-relaxed font-medium pl-5">
 "{resp.response}"
 </p>
 </div>
 </motion.div>
 );
 })}
 </div>
 </div>
 );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ShadowBoardPage() {
 const { data: strategies, isLoading } = useStrategies();
 const [selectedId, setSelectedId] = useState<string | null>(null);

 const selected = (strategies || []).find(s => s.id === selectedId) ?? null;

 return (
 <div className="min-h-screen p-4">
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
 <div className="flex items-center gap-3 mb-1">
 <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center shadow-sm border border-purple-900/50">
 <BrainCircuit className="w-5 h-5 text-purple-100" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-900 tracking-tight">Shadow Board & AI Strategy Simulator</h1>
 <p className="text-xs text-slate-500">Stratejik hamleleri canlı simüle eden AI Gölge Yönetim Kurulu Avatarları</p>
 </div>
 </div>
 </motion.div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
 
 {/* Sol Kolon: Stratejiler Listesi */}
 <div className="space-y-4">
 <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
 <GitPullRequestDraft size={11} className="text-purple-500" /> Aktif Simülasyonlar
 </div>
 {isLoading ? (
 <div className="text-xs text-slate-400">Yükleniyor...</div>
 ) : (
 <div className="space-y-2">
 {(strategies || []).map(s => (
 <StrategyCard 
 key={s.id} 
 item={s} 
 onSelect={() => setSelectedId(s.id === selectedId ? null : s.id)} 
 isSelected={s.id === selectedId} 
 />
 ))}
 {(strategies || []).length === 0 && (
 <div className="text-xs text-slate-400 py-4 pl-2 font-medium italic">Kayıtlı simülasyon bulunamadı.</div>
 )}
 </div>
 )}
 </div>

 {/* Sağ Kolon: Detay ve Münazara (Debate) */}
 <div>
 <AnimatePresence mode="wait">
 {selected ? (
 <motion.div
 key={selected.id}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: 20 }}
 transition={{ duration: 0.2 }}
 className="sticky top-6 space-y-4"
 >
 {/* Ozet Paneli */}
 <div className="bg-white/80 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
 <div className="bg-purple-900 px-5 py-3 flex items-center justify-between">
 <h2 className="text-sm font-black text-white flex items-center gap-2">
 <PlayCircle size={14} className="text-purple-300" />
 {selected.strategy_name}
 </h2>
 <span className="text-[10px] font-mono text-purple-200">
 ALLOCATION: {formatCurrency(selected.capital_allocation)}
 </span>
 </div>
 <div className="p-5">
 {/* Skorlar */}
 <RiskScoresPanel strategyId={selected.id} />
 
 <hr className="my-4 border-slate-100" />
 
 {/* Avatarlar Tartışması */}
 <BoardChatterPanel strategyId={selected.id} />
 </div>
 </div>
 </motion.div>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 className="flex flex-col items-center justify-center h-64 text-slate-400 rounded-2xl border-2 border-dashed border-slate-200 bg-white/40 sticky top-6"
 >
 <BrainCircuit className="w-10 h-10 mb-3 opacity-20" />
 <p className="text-sm font-medium">Soldan bir strateji simülasyonu seçin</p>
 <p className="text-xs mt-1">Yapay Zeka avatarlarının risk değerlendirmeleri burada akacaktır</p>
 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </div>
 </div>
 );
}
