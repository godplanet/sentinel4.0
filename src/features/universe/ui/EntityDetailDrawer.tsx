import { useEntityRiskSummary } from '@/entities/universe/api/universe-api';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle,
 BarChart3,
 Building2,
 Calendar,
 CheckCircle2,
 ChevronRight,
 Clock,
 Cpu,
 DollarSign,
 Loader2,
 Scale,
 Shield,
 TrendingUp,
 X,
 Zap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

// ─── Tür Tanımları ─────────────────────────────────────────────────────────────

interface EntityDetailDrawerProps {
 entityId: string | null;
 onClose: () => void;
}

// ─── Yardımcı Bileşenler ───────────────────────────────────────────────────────

function RiskScoreBadge({ score, label = '' }: { score: number; label?: string }) {
 const cfg = useMemo(() => {
 const s = score ?? 0;
 if (s >= 80) return { bg: 'bg-red-600', text: 'text-white', ring: 'ring-red-300', tier: 'KRİTİK' };
 if (s >= 60) return { bg: 'bg-orange-500', text: 'text-white', ring: 'ring-orange-200', tier: 'YÜKSEK' };
 if (s >= 40) return { bg: 'bg-amber-400', text: 'text-white', ring: 'ring-amber-200', tier: 'ORTA' };
 return { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-200', tier: 'DÜŞÜK' };
 }, [score]);

 return (
 <div className={clsx(
 'flex flex-col items-center justify-center w-20 h-20 rounded-2xl shadow-lg ring-4',
 cfg.bg, cfg.ring
 )}>
 <span className={clsx('text-2xl font-black tabular-nums', cfg.text)}>
 {(score ?? 0).toFixed(0)}
 </span>
 <span className={clsx('text-[9px] font-bold tracking-widest mt-0.5', cfg.text)}>
 {cfg.tier}
 </span>
 {label && (
 <span className={clsx('text-[8px] opacity-80 mt-0.5', cfg.text)}>{label}</span>
 )}
 </div>
 );
}

function RiskComponentBar({
 label,
 value,
 icon: Icon,
 color,
}: {
 label: string;
 value: number;
 icon: typeof BarChart3;
 color: string;
}) {
 const pct = Math.min(100, Math.max(0, (value ?? 0)));
 return (
 <div className="space-y-1.5">
 <div className="flex items-center justify-between text-xs">
 <div className="flex items-center gap-1.5">
 <Icon size={11} className={color} />
 <span className="text-slate-600 font-medium">{label}</span>
 </div>
 <span className="font-bold text-slate-800 tabular-nums">{pct.toFixed(0)}</span>
 </div>
 <div className="w-full bg-slate-100 rounded-full h-1.5">
 <motion.div
 className={clsx('h-1.5 rounded-full', color.replace('text-', 'bg-'))}
 initial={{ width: 0 }}
 animate={{ width: `${pct}%` }}
 transition={{ duration: 0.6, ease: 'easeOut' }}
 />
 </div>
 </div>
 );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
 return (
 <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
 <span className="text-xs text-slate-500">{label}</span>
 <span className="text-xs font-semibold text-slate-800">{value ?? '—'}</span>
 </div>
 );
}

// ─── Ana Bileşen ───────────────────────────────────────────────────────────────

export function EntityDetailDrawer({ entityId, onClose }: EntityDetailDrawerProps) {
 const [activeTab, setActiveTab] = useState<'overview' | 'risk' | 'audit'>('overview');

 const {
 data: summary,
 isLoading,
 isError,
 error,
 refetch,
 } = useEntityRiskSummary(entityId);

 return (
 <AnimatePresence>
 {entityId && (
 <>
 {/* Backdrop */}
 <motion.div
 key="backdrop"
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={onClose}
 className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40"
 />

 {/* Drawer Panel */}
 <motion.div
 key="drawer"
 initial={{ x: '100%' }}
 animate={{ x: 0 }}
 exit={{ x: '100%' }}
 transition={{ type: 'spring', damping: 30, stiffness: 300 }}
 className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
 >
 {/* ─── Header ─────────── */}
 <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-4 py-5 flex-shrink-0">
 <div className="flex items-start justify-between">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
 <Building2 size={18} className="text-white" />
 </div>
 <div>
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
 Denetim Evreni
 </p>
 <h2 className="text-base font-bold text-white leading-tight">
 {isLoading ? 'Yükleniyor...' : (summary?.name ?? '—')}
 </h2>
 <span className="text-[10px] text-slate-300 font-medium">
 {summary?.type ?? ''}
 </span>
 </div>
 </div>
 <button
 onClick={onClose}
 className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
 >
 <X size={16} className="text-white" />
 </button>
 </div>

 {/* Risk Score Badges Row */}
 {!isLoading && !isError && summary && (
 <div className="mt-4 flex gap-3 justify-center">
 <div className="text-center">
 <RiskScoreBadge score={summary.inherent_risk} label="Doğal" />
 </div>
 <div className="flex flex-col items-center justify-center">
 <TrendingUp size={16} className="text-slate-500" />
 </div>
 <div className="text-center">
 <RiskScoreBadge score={summary.residual_risk} label="Artık" />
 </div>
 </div>
 )}
 </div>

 {/* ─── Quick Stats ─────── */}
 {!isLoading && !isError && summary && (
 <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100 flex-shrink-0">
 {[
 { label: 'Açık Bulgu', value: summary.open_finding_count ?? 0, color: (summary.open_finding_count ?? 0) > 0 ? 'text-red-600' : 'text-emerald-600' },
 { label: 'Alt Birim', value: summary.descendant_count ?? 0, color: 'text-blue-600' },
 { label: 'Hız ×', value: (summary.risk_velocity ?? 1).toFixed(1), color: 'text-amber-600' },
 ].map((stat) => (
 <div key={stat.label} className="px-4 py-3 text-center">
 <p className={clsx('text-lg font-black tabular-nums', stat.color)}>{stat.value}</p>
 <p className="text-[10px] text-slate-500">{stat.label}</p>
 </div>
 ))}
 </div>
 )}

 {/* ─── Tabs ────────────── */}
 <div className="flex border-b border-slate-200 flex-shrink-0">
 {(['overview', 'risk', 'audit'] as const).map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={clsx(
 'flex-1 py-3 text-xs font-bold transition-colors',
 activeTab === tab
 ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
 : 'text-slate-500 hover:text-slate-700'
 )}
 >
 {tab === 'overview' ? 'Genel' : tab === 'risk' ? 'Risk' : 'Denetim'}
 </button>
 ))}
 </div>

 {/* ─── Content ─────────── */}
 <div className="flex-1 overflow-y-auto">
 {/* Loading State */}
 {isLoading && (
 <div className="flex items-center justify-center h-48">
 <Loader2 className="animate-spin text-slate-400" size={28} />
 </div>
 )}

 {/* Error State — BDDK ciddiyetinde */}
 {isError && !isLoading && (
 <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-xl">
 <div className="flex items-center gap-2 mb-2">
 <AlertTriangle size={16} className="text-red-500" />
 <p className="text-sm font-bold text-red-700">Varlık Verisi Yüklenemedi</p>
 </div>
 <p className="text-xs text-red-600 mb-3">
 {(error as Error)?.message ?? 'Bilinmeyen veritabanı hatası. Lütfen sistem yöneticinizle iletişime geçin.'}
 </p>
 <button
 onClick={() => refetch()}
 className="text-xs font-bold text-red-600 underline"
 >
 Yeniden Dene
 </button>
 </div>
 )}

 {/* Content — Overview Tab */}
 {!isLoading && !isError && summary && activeTab === 'overview' && (
 <div className="p-5 space-y-4">
 <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
 <InfoRow label="Tür" value={summary.type} />
 <InfoRow
 label="Son Denetim"
 value={summary.last_audit_date
 ? new Date(summary.last_audit_date).toLocaleDateString('tr-TR')
 : <span className="text-slate-400">Henüz Denetlenmedi</span>
 }
 />
 <InfoRow
 label="Sonraki Denetim"
 value={summary.next_audit_due
 ? new Date(summary.next_audit_due).toLocaleDateString('tr-TR')
 : <span className="text-slate-400">—</span>
 }
 />
 <InfoRow label="Denetim Sıklığı" value={summary.audit_frequency ?? '—'} />
 </div>

 {/* Status Cards */}
 <div className="grid grid-cols-2 gap-3">
 <div className={clsx(
 'p-3 rounded-xl border',
 (summary.open_finding_count ?? 0) > 0
 ? 'bg-red-50 border-red-200'
 : 'bg-emerald-50 border-emerald-200'
 )}>
 {(summary.open_finding_count ?? 0) > 0
 ? <AlertTriangle size={18} className="text-red-500 mb-1" />
 : <CheckCircle2 size={18} className="text-emerald-500 mb-1" />
 }
 <p className="text-sm font-black text-slate-800">{summary.open_finding_count ?? 0}</p>
 <p className="text-[10px] text-slate-500">Açık Bulgu</p>
 </div>
 <div className="p-3 rounded-xl border bg-blue-50 border-blue-200">
 <ChevronRight size={18} className="text-blue-500 mb-1" />
 <p className="text-sm font-black text-slate-800">{summary.descendant_count ?? 0}</p>
 <p className="text-[10px] text-slate-500">Alt Birim</p>
 </div>
 </div>
 </div>
 )}

 {/* Content — Risk Tab */}
 {!isLoading && !isError && summary && activeTab === 'risk' && (
 <div className="p-5 space-y-5">
 {/* Risk Bileşenleri */}
 <div>
 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
 Risk Bileşenleri
 </h4>
 <div className="space-y-3">
 <RiskComponentBar label="Operasyonel" value={summary.risk_operational ?? 0} icon={BarChart3} color="text-orange-500" />
 <RiskComponentBar label="Bilgi Teknolojileri" value={summary.risk_it ?? 0} icon={Cpu} color="text-violet-500" />
 <RiskComponentBar label="Uyum / Mevzuat" value={summary.risk_compliance ?? 0} icon={Scale} color="text-blue-500" />
 <RiskComponentBar label="Finansal" value={summary.risk_financial ?? 0} icon={DollarSign} color="text-emerald-500" />
 </div>
 </div>

 {/* Hız çarpanı */}
 <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
 <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
 <Zap size={18} className="text-amber-600" />
 </div>
 <div>
 <p className="text-xs text-amber-700 font-medium">Risk Hız Çarpanı</p>
 <p className="text-xl font-black text-amber-800">×{(summary.risk_velocity ?? 1).toFixed(2)}</p>
 <p className="text-[10px] text-amber-600">
 {(summary.risk_velocity ?? 1) > 1.5
 ? 'Yüksek hız — acil müdahale gerektirebilir'
 : (summary.risk_velocity ?? 1) > 1
 ? 'Orta hız — izleme altında tutulmalı'
 : 'Normal hız'}
 </p>
 </div>
 </div>

 {/* Artık - Doğal karşılaştırma */}
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-slate-800 rounded-xl p-3 text-center">
 <Shield size={16} className="text-slate-400 mx-auto mb-1" />
 <p className="text-2xl font-black text-white tabular-nums">
 {(summary.inherent_risk ?? 0).toFixed(0)}
 </p>
 <p className="text-[10px] text-slate-400">Doğal Risk</p>
 </div>
 <div className="bg-blue-600 rounded-xl p-3 text-center">
 <TrendingUp size={16} className="text-blue-200 mx-auto mb-1" />
 <p className="text-2xl font-black text-white tabular-nums">
 {(summary.residual_risk ?? 0).toFixed(0)}
 </p>
 <p className="text-[10px] text-blue-200">Artık Risk</p>
 </div>
 </div>
 </div>
 )}

 {/* Content — Audit Tab */}
 {!isLoading && !isError && summary && activeTab === 'audit' && (
 <div className="p-5 space-y-4">
 <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
 <div className="flex items-center gap-2 mb-3">
 <Calendar size={14} className="text-blue-500" />
 <h4 className="text-xs font-bold text-slate-700">Denetim Döngüsü</h4>
 </div>
 <InfoRow label="Denetim Sıklığı" value={summary.audit_frequency ?? '—'} />
 <InfoRow
 label="Son Denetim"
 value={summary.last_audit_date
 ? new Date(summary.last_audit_date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
 : '—'
 }
 />
 <InfoRow
 label="Sonraki Denetim"
 value={summary.next_audit_due
 ? new Date(summary.next_audit_due).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })
 : '—'
 }
 />
 </div>

 {/* Takvim uyarısı */}
 {summary.next_audit_due && (
 (() => {
 const daysUntil = Math.round(
 (new Date(summary.next_audit_due).getTime() - Date.now()) / 86400000
 );
 return (
 <div className={clsx(
 'p-4 rounded-xl border flex items-center gap-3',
 daysUntil < 0
 ? 'bg-red-50 border-red-200'
 : daysUntil <= 30
 ? 'bg-amber-50 border-amber-200'
 : 'bg-emerald-50 border-emerald-200'
 )}>
 <Clock size={18} className={
 daysUntil < 0 ? 'text-red-500' : daysUntil <= 30 ? 'text-amber-500' : 'text-emerald-500'
 } />
 <div>
 <p className="text-sm font-bold text-slate-800">
 {daysUntil < 0
 ? `${Math.abs(daysUntil)} Gün Gecikmiş`
 : `${daysUntil} Gün Kaldı`}
 </p>
 <p className="text-[10px] text-slate-500">
 {daysUntil < 0 ? 'Denetim planlanmalı' : 'Sonraki denetim tarihi'}
 </p>
 </div>
 </div>
 );
 })()
 )}
 </div>
 )}
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
