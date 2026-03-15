/**
 * Wave 90: Shariah-AI Algorithmic Filter & Shield (AlgorithmicShield)
 * Apple Glassmorphism stili, %100 Light Mode, Null (?. || []) guard'lı uyum kalkanı.
 */

import {
 useShariahShieldDashboard,
 type AIDecision,
 type BlockedTransaction
} from '@/features/shariah-ai-filter/api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 Database,
 Info,
 Loader2,
 Scale,
 ScrollText,
 ShieldCheck,
 ShieldX
} from 'lucide-react';
import { useState } from 'react';

/* ──────────────────────────────────────────────────────────
 Config & Mappings
 ────────────────────────────────────────────────────────── */

function formatCurrency(val: number) {
 return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val);
}

const CATEGORY_ICONS: Record<string, any> = {
 Gambling: <Activity size={16} className="text-red-500" />,
 'Riba (Interest)': <Scale size={16} className="text-orange-500" />,
 Alcohol: <AlertTriangle size={16} className="text-purple-500" />,
 Pork: <AlertTriangle size={16} className="text-pink-500" />,
 Weapons: <ShieldX size={16} className="text-slate-800" />,
 default: <AlertTriangle size={16} className="text-red-500" />
};

/* ──────────────────────────────────────────────────────────
 Components
 ────────────────────────────────────────────────────────── */

function DecisionRow({ decision }: { decision: AIDecision }) {
 const isBlocked = decision.status === 'BLOCKED_BY_SHIELD';
 return (
 <div className={clsx(
 'flex flex-col md:flex-row md:items-center justify-between p-3 rounded-xl border mb-2 transition-all',
 isBlocked ? 'bg-red-50/30 border-red-100 hover:bg-red-50/50' : 'bg-surface border-slate-100 hover:bg-slate-50'
 )}>
 <div className="flex items-center gap-3">
 <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center shrink-0 border', isBlocked ? 'bg-red-100 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600')}>
 {isBlocked ? <ShieldX size={18} /> : <ShieldCheck size={18} />}
 </div>
 <div>
 <div className="font-bold text-sm text-primary flex items-center gap-2">
 {decision.ticker}
 <span className={clsx('px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider', isBlocked ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700')}>{decision.action_type}</span>
 </div>
 <div className="text-xs text-slate-500 line-clamp-1">{decision.company_name} • {decision.sector}</div>
 </div>
 </div>

 <div className="text-right mt-2 md:mt-0 flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end w-full md:w-auto">
 <div className="font-mono text-sm font-bold text-slate-800">{formatCurrency(decision.proposed_amount)}</div>
 <div className={clsx('text-[10px] font-bold uppercase tracking-wider', isBlocked ? 'text-red-600' : 'text-emerald-600')}>
 {decision.status.replace(/_/g, ' ')}
 </div>
 </div>
 </div>
 );
}

function BlockedCard({ blocked }: { blocked: BlockedTransaction }) {
 const Icon = CATEGORY_ICONS[blocked.violation_category] || CATEGORY_ICONS['default'];

 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className="p-4 rounded-2xl border border-red-200 bg-red-50/30 relative overflow-hidden group"
 >
 <div className="absolute -top-10 -right-10 opacity-[0.03] text-red-900 pointer-events-none">
 <ShieldX size={150} />
 </div>

 <div className="flex justify-between items-start mb-3 relative z-10">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-full bg-white border border-red-100 flex items-center justify-center shadow-sm">
 {Icon}
 </div>
 <div>
 <h4 className="font-bold text-sm text-slate-800 font-mono bg-white px-1.5 rounded">{blocked.violating_ticker}</h4>
 <span className="text-[10px] uppercase font-bold text-red-600">{blocked.violation_category}</span>
 </div>
 </div>
 </div>

 <div className="relative z-10">
 <div className="text-xs font-bold text-slate-700 mb-2 truncate">{blocked.company_name}</div>
 <p className="text-[11px] text-red-900/80 font-medium leading-relaxed bg-white/60 p-2.5 rounded-lg border border-red-100/50 mb-3 line-clamp-3 group-hover:line-clamp-none transition-all">
 {blocked.block_reason}
 </p>

 <div className="grid grid-cols-2 gap-2 text-[10px]">
 {blocked.haram_income_ratio !== null && (
 <div className="bg-white border border-slate-200 rounded p-1.5 text-center">
 <span className="text-slate-500 block">Haram Gelir Oranı</span>
 <span className="font-bold text-red-600">%{(blocked.haram_income_ratio ?? 0).toFixed(1)}</span>
 </div>
 )}
 {blocked.debt_to_asset_ratio !== null && (
 <div className="bg-white border border-slate-200 rounded p-1.5 text-center">
 <span className="text-slate-500 block">Borç / Varlık</span>
 <span className="font-bold text-orange-600">%{(blocked.debt_to_asset_ratio ?? 0).toFixed(1)}</span>
 </div>
 )}
 <div className="col-span-full border border-blue-100 bg-blue-50/50 rounded p-1.5 flex items-center gap-1.5 text-blue-800 mt-1">
 <ScrollText size={12} className="shrink-0" />
 <span className="font-medium truncate" title={blocked.aaoifi_rule_ref}>{blocked.aaoifi_rule_ref}</span>
 </div>
 </div>
 </div>
 </motion.div>
 );
}

/* ──────────────────────────────────────────────────────────
 Main Widget Export
 ────────────────────────────────────────────────────────── */

export function AlgorithmicShield() {
 const { data, isLoading, isError } = useShariahShieldDashboard();
 const [activeTab, setActiveTab] = useState<'BLOCKED' | 'ALL_DECISIONS'>('BLOCKED');

 if (isLoading) {
 return (
 <div className="flex items-center justify-center py-24">
 <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
 </div>
 );
 }

 if (isError || !data) {
 return (
 <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-center gap-3">
 <AlertTriangle className="text-red-500 w-6 h-6" />
 <p className="text-red-800 text-sm">Shariah-AI Filtresine (Algorithmic Shield) erişilirken veri hatası oluştu.</p>
 </div>
 );
 }

 const { decisions, blockedTxs, totalBlocked, totalProposedValue, blockedValue } = data;

 return (
 <div className="space-y-4">
 
 {/* Overview Banner (Apple Glass) */}
 <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 rounded-3xl p-4 text-white shadow-xl relative overflow-hidden border border-emerald-700/50">
 <div className="absolute right-0 top-0 opacity-[0.05] pointer-events-none transform translate-x-1/4 -translate-y-1/4">
 <ShieldX size={280} />
 </div>
 
 <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between relative z-10">
 <div>
 <div className="flex items-center gap-2 mb-2">
 <Scale className="text-emerald-400" />
 <h2 className="text-xl font-bold tracking-tight">Shariah-AI Uyum Kalkanı</h2>
 </div>
 <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
 Otonom alım-satım botlarının ve Robo-Danışmanların ürettiği yatırım kararlarını AAOIFI İslami finans standartlarına göre (Haram gelir, faiz marjı, kumar vd.) mili-saniyede denetleyen ve bloke eden kalkan.
 </p>
 </div>

 <div className="flex gap-4">
 <div className="bg-slate-900/40 p-4 rounded-xl border border-white/10 min-w-[110px] backdrop-blur-md">
 <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Toplam İşlem</div>
 <div className="flex items-baseline gap-1">
 <span className="text-2xl font-black text-slate-200">{decisions.length}</span>
 <span className="text-[10px] text-slate-400">Emir</span>
 </div>
 </div>

 <div className="bg-red-900/40 p-4 rounded-xl border border-red-500/30 min-w-[120px] backdrop-blur-md shadow-[0_0_15px_rgba(239,68,68,0.2)]">
 <div className="text-[10px] text-red-300 uppercase tracking-widest font-bold mb-1">Bloke Edilen</div>
 <div className="flex items-baseline gap-2">
 <span className={clsx('text-3xl font-black', totalBlocked > 0 ? 'text-red-400' : 'text-slate-200')}>
 {totalBlocked}
 </span>
 <span className="text-[10px] text-red-500/80">İhlal</span>
 </div>
 </div>
 </div>
 </div>
 
 {/* Progress Bar for Blocked Value */}
 {totalProposedValue > 0 && (
 <div className="mt-6 relative z-10">
 <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
 <span>Piyasa Hacmi: {formatCurrency(totalProposedValue)}</span>
 <span className="text-red-300">Bloke Hacim: {formatCurrency(blockedValue)}</span>
 </div>
 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
 <motion.div 
 initial={{ width: 0 }}
 animate={{ width: `${(blockedValue / totalProposedValue) * 100}%` }}
 transition={{ duration: 1, ease: 'easeOut' }}
 className="h-full bg-red-500 rounded-full"
 />
 </div>
 </div>
 )}
 </div>

 {/* Tabs Layout */}
 <div className="bg-surface border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
 {/* Tab Header */}
 <div className="flex border-b border-slate-100 bg-slate-50/50 px-2 pt-2">
 <button
 onClick={() => setActiveTab('BLOCKED')}
 className={clsx(
 'px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
 activeTab === 'BLOCKED' ? 'border-red-500 text-red-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
 )}
 >
 <ShieldX size={16} /> Engellenen İşlemler ({totalBlocked})
 </button>
 <button
 onClick={() => setActiveTab('ALL_DECISIONS')}
 className={clsx(
 'px-5 py-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors',
 activeTab === 'ALL_DECISIONS' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
 )}
 >
 <Database size={16} /> AI Emir Logları
 </button>
 </div>

 {/* Tab Body */}
 <div className="p-5">
 <AnimatePresence mode="wait">
 {activeTab === 'BLOCKED' && (
 <motion.div
 key="blocked"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <div className="flex items-center justify-between mb-4 bg-red-50/50 p-3 rounded-lg border border-red-100 text-sm text-red-800">
 <div className="flex items-center gap-2 font-medium">
 <Info size={16} /> Robotik ağ tarafından onaylanmasına rağmen, İslami yasal uyum matrisine (AAOIFI) takılan emirler listelenir.
 </div>
 </div>
 {blockedTxs.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm">
 <ShieldCheck size={48} className="text-emerald-300 mb-2" />
 Dini uyumluluk ihlali engellemesi bulunmuyor. Sistem temiz.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {(blockedTxs || []).map(b => <BlockedCard key={b.id} blocked={b} />)}
 </div>
 )}
 </motion.div>
 )}

 {activeTab === 'ALL_DECISIONS' && (
 <motion.div
 key="all"
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 >
 <div className="max-h-[500px] overflow-y-auto pr-2 space-y-1">
 {(decisions || []).map(d => <DecisionRow key={d.id} decision={d} />)}
 {decisions.length === 0 && <div className="text-center py-10 text-slate-400 text-sm">Hiçbir emir loglanmamış.</div>}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 </div>

 </div>
 );
}
