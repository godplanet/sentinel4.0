/**
 * SentimentOracle — Duygu Kahini ve Kriz Uyarı Radarı
 * widgets/SentimentOracle/index.tsx (Wave 73)
 *
 * C-Level Apple Glassmorphism tasarım, 100% Light Mode.
 */

import {
 formatCompact,
 useCrisisAlerts, useUpdateCrisisStatus,
 type CrisisAlert, type CrisisStatus
} from '@/features/reputation/api';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 CheckCircle2,
 ChevronRight,
 Megaphone,
 MessageSquareWarning,
 ShieldAlert,
 TrendingDown
} from 'lucide-react';
import { useState } from 'react';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const SEVERITY_CFG = {
 CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', icon: ShieldAlert, label: 'Kritik Kriz' },
 HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', icon: AlertTriangle, label: 'Yüksek Risk' },
 MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: MessageSquareWarning, label: 'Orta Risk' },
 LOW: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', icon: Activity, label: 'Düşük Risk' },
};

const STATUS_CFG: Record<CrisisStatus, { label: string, badge: string }> = {
 MONITORING: { label: 'İzleniyor', badge: 'bg-amber-100 text-amber-700 border-amber-200' },
 PR_RESPONSE_REQUIRED: { label: 'Aksiyom Bekliyor', badge: 'bg-red-100 text-red-700 border-red-200' },
 MITIGATED: { label: 'Yatıştırıldı', badge: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
 FALSE_ALARM: { label: 'Asılsız Söylenti', badge: 'bg-slate-100 text-slate-500 border-slate-200' },
};

// ─── Alert Satırı ────────────────────────────────────────────────────────────

function AlertRow({ alert }: { alert: CrisisAlert }) {
 const [expanded, setExpanded] = useState(false);
 const updateStatus = useUpdateCrisisStatus();
 
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
 <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${statusCfg.badge}`}>
 {statusCfg.label}
 </span>
 </div>
 <span className="text-[9px] font-mono text-slate-400">
 {new Date(alert.alert_date).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>

 <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-1">{alert.alert_title}</p>

 <div className="flex items-center gap-4 mt-2">
 <div className="text-[9px] text-slate-500 flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded border border-white">
 <TrendingDown size={11} className="text-rose-500" />
 Negatif Duygu: <span className="font-black text-rose-600">%{(alert.negative_ratio_pct).toFixed(1)}</span>
 </div>
 <div className="text-[9px] text-slate-500 flex items-center gap-1 bg-white/50 px-1.5 py-0.5 rounded border border-white">
 <Megaphone size={11} className="text-indigo-500" />
 {formatCompact(alert.total_mentions)} Bahsedilme
 </div>
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
 
 <div className="bg-white rounded-lg p-3 border border-slate-200 text-xs shadow-sm">
 <p className="font-black text-indigo-800 mb-1 flex items-center gap-1">
 <Activity size={12} /> Kriz Konusu & Kurumsal Aksiyon
 </p>
 <p className="mb-2 font-semibold text-slate-700">Hedef: {alert.crisis_topic}</p>
 {alert.action_plan ? (
 <div className="bg-slate-50 p-2 rounded border border-slate-100 text-slate-600">
 {alert.action_plan}
 </div>
 ) : (
 <p className="text-slate-400 italic">Henüz bir aksiyon planı belirlenmedi.</p>
 )}
 {alert.assigned_to && (
 <p className="text-[9px] font-bold text-slate-400 mt-2 text-right">Sorumlu: {alert.assigned_to}</p>
 )}
 </div>

 <div className="pt-1 flex items-center gap-2 overflow-x-auto pb-1">
 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">Statü:</span>
 {(['MONITORING', 'PR_RESPONSE_REQUIRED', 'MITIGATED', 'FALSE_ALARM'] as CrisisStatus[]).map((s) => (
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
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}

// ─── Oracle Ana Widget ────────────────────────────────────────────────────────

export function SentimentOracle() {
 const { data: alerts = [], isLoading } = useCrisisAlerts();

 const safeAlerts = alerts || [];
 const activeAlerts = (safeAlerts || []).filter(a => a.status === 'MONITORING' || a.status === 'PR_RESPONSE_REQUIRED');
 const pastAlerts = (safeAlerts || []).filter(a => a.status === 'MITIGATED' || a.status === 'FALSE_ALARM');

 return (
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
 {/* Header */}
 <div className="px-5 py-4 bg-gradient-to-r from-slate-900 to-indigo-900 flex items-center justify-between shadow-inner">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center">
 <MessageSquareWarning size={16} className="text-rose-300" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-white">Sentiment Oracle</h3>
 <p className="text-[10px] text-rose-200/70 mt-0.5">İtibar Krizi Erken Uyarı Sistemi</p>
 </div>
 </div>
 <div className="text-right">
 <div className="flex items-baseline gap-1.5 pb-0.5 justify-end">
 {activeAlerts.length > 0 && (
 <span className="relative flex h-2 w-2">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
 </span>
 )}
 <p className="text-xl font-black text-rose-400 tabular-nums">{activeAlerts.length}</p>
 </div>
 <p className="text-[8px] text-indigo-200/50 font-bold tracking-widest leading-none">AKTİF ALARM</p>
 </div>
 </div>

 {/* Body */}
 <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
 {isLoading ? (
 <div className="flex justify-center py-10">
 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-600"></div>
 </div>
 ) : safeAlerts.length === 0 ? (
 <div className="text-center py-12">
 <CheckCircle2 size={36} className="text-emerald-400 mx-auto mb-3" />
 <p className="text-sm font-semibold text-slate-500">Sosyal medyada olağandışı hareket yok.</p>
 </div>
 ) : (
 <div>
 {activeAlerts.length > 0 && (
 <div className="mb-4">
 <p className="text-[10px] font-black text-rose-700 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
 <AlertTriangle size={12} className={activeAlerts.some(a => a.severity === 'CRITICAL') ? 'animate-pulse' : ''} /> 
 Kriz / Potansiyel Riskler
 </p>
 {(activeAlerts || []).map(alert => <AlertRow key={alert.id} alert={alert} />)}
 </div>
 )}
 
 {pastAlerts.length > 0 && (
 <div>
 <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1 flex items-center gap-1.5">
 <CheckCircle2 size={12} /> Yatıştırılan / Kapatılan
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
