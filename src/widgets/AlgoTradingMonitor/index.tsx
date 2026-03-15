/**
 * AlgoTradingMonitor — Piyasa Manipülasyon ve Spoofing Radarı
 * widgets/AlgoTradingMonitor/index.tsx (Wave 63)
 *
 * C-Level Apple Glassmorphism tasarım, 100% Light Mode.
 */

import {
 formatUSD,
 useMarketAlerts, useUpdateAlertStatus,
 type AlertStatus,
 type MarketRiskAlert
} from '@/features/market-risk/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity, AlertOctagon,
 BarChart4,
 CheckCircle2,
 ChevronRight,
 Cpu,
 ShieldAlert,
 TrendingDown,
 Zap
} from 'lucide-react';
import { useState } from 'react';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const SEVERITY_CFG = {
 CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: ShieldAlert, label: 'Kritik Risk' },
 HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertOctagon, label: 'Yüksek Risk' },
 MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Activity, label: 'Orta Risk' },
 LOW: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Zap, label: 'Düşük Risk' },
};

const STATUS_CFG: Record<AlertStatus, { label: string, color: string }> = {
 OPEN: { label: 'Açık', color: 'text-red-600' },
 INVESTIGATING: { label: 'İnceleniyor', color: 'text-amber-600' },
 FALSE_POSITIVE: { label: 'Asılsız (False POS)', color: 'text-slate-500' },
 REPORTED_TO_REGULATOR: { label: 'Regülatöre Bildirildi', color: 'text-purple-600' },
 RESOLVED: { label: 'Çözüldü', color: 'text-emerald-600' },
};

// ─── Alert Satırı ────────────────────────────────────────────────────────────

function AlertRow({ alert }: { alert: MarketRiskAlert }) {
 const [expanded, setExpanded] = useState(false);
 const updateStatus = useUpdateAlertStatus();
 const cfg = SEVERITY_CFG[alert.severity] ?? SEVERITY_CFG.MEDIUM;
 const statusCfg = STATUS_CFG[alert.status];
 const Icon = cfg.icon;

 return (
 <div className={`rounded-xl border mb-2 transition-all hover:shadow-sm ${cfg.bg} ${cfg.border}`}>
 <div
 className="px-4 py-3 cursor-pointer flex items-start gap-3"
 onClick={() => setExpanded(!expanded)}
 >
 <div className={`mt-0.5 p-1.5 rounded-lg bg-white/50 border ${cfg.border} shrink-0`}>
 <Icon size={14} className={cfg.text} />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between mb-1">
 <div className="flex items-center gap-2 flex-wrap">
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${cfg.bg} ${cfg.text} ${cfg.border} bg-white`}>
 {cfg.label}
 </span>
 <span className="text-[9px] font-mono text-slate-500">{alert.alert_code}</span>
 <span className={`text-[9px] font-bold ${statusCfg.color}`}>• {statusCfg.label}</span>
 </div>
 <span className="text-[9px] font-mono text-slate-400">
 {new Date(alert.detection_time).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
 </span>
 </div>

 <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
 <span className="text-blue-600 font-black">{alert.instrument}</span>
 {'—'}
 {alert.anomaly_type}
 </p>
 <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-relaxed">{alert.description}</p>

 <div className="flex items-center gap-4 mt-2">
 <div className="text-[9px] text-slate-500 flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded">
 <TrendingDown size={11} className="text-red-500" />
 Etkilenen Hacim: <span className="font-bold text-slate-700">{formatUSD(alert.affected_volume)}</span>
 </div>
 {(alert.triggering_algo) && (
 <div className="text-[9px] text-slate-500 flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded font-mono">
 <Cpu size={11} className="text-indigo-500" />
 {alert.triggering_algo}
 </div>
 )}
 {alert.investigator && (
 <div className="text-[9px] text-slate-400 ml-auto">
 Dedektif: <span className="font-medium text-slate-600">{alert.investigator}</span>
 </div>
 )}
 </div>
 </div>

 <ChevronRight size={14} className={`text-slate-400 mt-2 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
 </div>

 <AnimatePresence>
 {expanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="border-t overflow-hidden"
 style={{ borderColor: 'var(--tw-border-opacity) ' + cfg.border }}
 >
 <div className="p-4 bg-white/60 space-y-3">
 <p className="text-[11px] text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200">
 {alert.description}
 </p>

 {(['OPEN', 'INVESTIGATING', 'FALSE_POSITIVE', 'REPORTED_TO_REGULATOR', 'RESOLVED'] as AlertStatus[]).length > 0 && (
 <div className="pt-2 flex items-center gap-2 overflow-x-auto pb-1">
 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Aksiyon:</span>
 {(['INVESTIGATING', 'FALSE_POSITIVE', 'REPORTED_TO_REGULATOR', 'RESOLVED'] as AlertStatus[]).map((s) => (
 <button
 key={s}
 onClick={() => updateStatus.mutate({ id: alert.id, status: s })}
 disabled={updateStatus.isPending || alert.status === s}
 className={`text-[9px] font-bold px-2.5 py-1.5 rounded-lg border transition-all shrink-0
 ${alert.status === s ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
 >
 {STATUS_CFG[s].label}
 </button>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}

// ─── Market Manipulation Radar Widget ──────────────────────────────────────────

export function AlgoTradingMonitor() {
 const { data: alerts = [], isLoading } = useMarketAlerts();

 // (alerts || []) koruması
 const safeAlerts = alerts || [];
 const activeAlerts = (safeAlerts || []).filter(a => a.status === 'OPEN' || a.status === 'INVESTIGATING');
 const pastAlerts = (safeAlerts || []).filter(a => a.status !== 'OPEN' && a.status !== 'INVESTIGATING');

 return (
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
 {/* Header */}
 <div className="px-5 py-4 bg-gradient-to-r from-slate-800 to-indigo-900 flex items-center justify-between shadow-inner">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
 <BarChart4 size={16} className="text-indigo-300" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-white">Market Risk Radar</h3>
 <p className="text-[10px] text-indigo-200/70 mt-0.5">HFT Otokontrol & Spoofing Dedektörü</p>
 </div>
 </div>
 <div className="text-right">
 <div className="flex items-baseline gap-1.5 pb-0.5">
 <span className="relative flex h-2 w-2">
 <span className={`${activeAlerts.length > 0 ? 'animate-ping' : ''} absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75`}></span>
 <span className={`relative inline-flex rounded-full h-2 w-2 ${activeAlerts.length > 0 ? 'bg-red-500' : 'bg-slate-500'}`}></span>
 </span>
 <p className="text-xl font-black text-rose-400 tabular-nums">{activeAlerts.length}</p>
 </div>
 <p className="text-[8px] text-indigo-200/50 font-bold tracking-widest text-right">AKTİF ALARM</p>
 </div>
 </div>

 {/* Body */}
 <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
 {isLoading ? (
 <div className="flex justify-center py-10">
 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
 </div>
 ) : safeAlerts.length === 0 ? (
 <div className="text-center py-12">
 <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
 <p className="text-sm font-semibold text-slate-500">Piyasa manipülasyon bulgusu yok.</p>
 </div>
 ) : (
 <div>
 {activeAlerts.length > 0 && (
 <div className="mb-4">
 <p className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
 <Activity size={12} className="animate-pulse" /> Aksiyon Bekleyen Alarmlar
 </p>
 {(activeAlerts || []).map(alert => <AlertRow key={alert.id} alert={alert} />)}
 </div>
 )}
 
 {pastAlerts.length > 0 && (
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
 <CheckCircle2 size={12} /> Kapatılan Vakalar
 </p>
 {(pastAlerts || []).map(alert => <AlertRow key={alert.id} alert={alert} />)}
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 );
}
