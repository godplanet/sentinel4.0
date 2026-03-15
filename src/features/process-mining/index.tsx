/**
 * ProcessMiningPage — Ana Sayfa (Wave 66)
 * features/process-mining/index.tsx
 *
 * Kurumsal Dijital İkiz (üstte) + Gerçekleşen Vakalar Listesi (altta)
 * C-Level · Apple Glassmorphism · %100 Light Mode
 */

import { DigitalTwinViewer } from '@/widgets/DigitalTwinViewer';
import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 CheckCircle2,
 Clock,
 GitMerge,
 Network,
 Search,
 ShieldAlert
} from 'lucide-react';
import React, { useState } from 'react';
import {
 useAuditCase,
 useDigitalTwins,
 useProcessKPI,
 useProcessLogs,
 type ProcessMiningLog
} from './api';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const COMPLIANCE_CFG: Record<string, { bg: string, text: string, label: string, icon: React.ElementType }> = {
 COMPLIANT: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Uyumlu', icon: CheckCircle2 },
 MINOR_DEVIATION: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Minör Sapma', icon: Activity },
 BYPASS_DETECTED: { bg: 'bg-red-50', text: 'text-red-700', label: 'KRİTİK BYPASS', icon: ShieldAlert },
 BOTTLENECK: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Darboğaz / Gecikme', icon: Clock },
};

// ─── Process Log Tablosu Satırı ───────────────────────────────────────────────

function ProcessLogRow({ log }: { log: ProcessMiningLog }) {
 const [expanded, setExpanded] = useState(false);
 const auditMutation = useAuditCase();
 const cfg = COMPLIANCE_CFG[log.compliance_status] ?? COMPLIANCE_CFG.COMPLIANT;
 const Icon = cfg.icon;

 return (
 <>
 <motion.tr
 initial={{ opacity: 0, y: 5 }}
 animate={{ opacity: 1, y: 0 }}
 onClick={() => setExpanded(!expanded)}
 className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer"
 >
 <td className="px-4 py-3">
 <p className="text-[11px] font-black text-slate-700 font-mono tracking-tight">{log.case_id}</p>
 <p className="text-[9px] text-slate-400 mt-0.5">{new Date(log.start_time).toLocaleString('tr-TR')}</p>
 </td>
 <td className="px-4 py-3">
 <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${cfg.bg} ${cfg.text} border-${cfg.bg.replace('bg-', '')}`}>
 <Icon size={12} />
 <span className="text-[10px] font-black">{cfg.label}</span>
 </div>
 {log.risk_score > 0 && <span className="ml-2 text-[10px] font-bold text-red-600">Risk: {log.risk_score}</span>}
 </td>
 <td className="px-4 py-3 text-center">
 <span className="text-sm font-black text-slate-700 tabular-nums">{log.actual_steps}</span>
 <span className="text-[9px] text-slate-400 ml-1">adım</span>
 </td>
 <td className="px-4 py-3 text-center">
 <span className={`text-sm font-black tabular-nums ${log.actual_duration_hrs! > 24 ? 'text-amber-600' : 'text-emerald-600'}`}>
 {log.actual_duration_hrs}
 </span>
 <span className="text-[9px] text-slate-400 ml-1">saat</span>
 </td>
 <td className="px-4 py-3 text-right">
 {log.is_audited ? (
 <span className="text-[9px] font-black text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-200">Denetlendi</span>
 ) : (
 <button
 onClick={(e) => { e.stopPropagation(); auditMutation.mutate({ id: log.id }); }}
 disabled={auditMutation.isPending}
 className="text-[9px] font-bold px-3 py-1.5 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 rounded shadow-sm transition-all"
 >
 Denetime Al
 </button>
 )}
 </td>
 </motion.tr>

 <AnimatePresence>
 {expanded && (log.bypass_details || log.bottleneck_node_id) && (
 <tr>
 <td colSpan={5} className="px-4 pb-3">
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="bg-red-50/50 rounded-xl border border-red-100 p-3"
 >
 {log.bypass_details && (
 <div className="mb-2">
 <p className="text-[10px] font-black text-red-800 uppercase flex items-center gap-1"><AlertTriangle size={12}/> Bypass Tespit Detayı</p>
 <p className="text-xs text-red-700 leading-relaxed mt-1 font-medium">{log.bypass_details}</p>
 </div>
 )}
 {log.bottleneck_node_id && (
 <div>
 <p className="text-[10px] font-black text-amber-800 uppercase flex items-center gap-1"><Clock size={12}/> Darboğaz</p>
 <p className="text-xs text-amber-700 leading-relaxed mt-1 font-medium">{log.bottleneck_node_id} numaralı adımda yığılma yaşandı.</p>
 </div>
 )}
 {log.handled_by && (
 <p className="text-[9px] font-black text-slate-500 mt-2 text-right">Müdahale Eden/Sorumlu: {log.handled_by}</p>
 )}
 </motion.div>
 </td>
 </tr>
 )}
 </AnimatePresence>
 </>
 );
}

// ─── Ana Sayfa ────────────────────────────────────────────────────────────────

export function ProcessMiningPage() {
 const { data: models = [], isLoading: modelsLoading } = useDigitalTwins();
 // Varsayılan olarak ilk modeli seçiyoruz
 const activeModel = models.length > 0 ? models[0] : null;

 const { data: logs = [], isLoading: logsLoading } = useProcessLogs(activeModel?.id);
 const { data: kpi } = useProcessKPI(activeModel?.id, logs);

 return (
 <div className="h-full flex flex-col bg-slate-50/50 overflow-auto">
 {/* Header */}
 <div className="px-4 pt-4 pb-4 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm z-10">
 <div className="flex items-center gap-3 mb-4">
 <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-500/20">
 <Network size={22} className="text-white" />
 </div>
 <div>
 <h1 className="text-2xl font-black text-slate-800 tracking-tight">Process Mining & Digital Twin</h1>
 <p className="text-xs text-slate-500 mt-0.5">Süreç Sapmaları ve Darboğaz Tespiti · Wave 66</p>
 </div>
 </div>

 {/* C-Level KPI Bant */}
 <div className="grid grid-cols-5 gap-3">
 {[
 { label: 'İncelenen Vaka', value: kpi?.totalCases ?? '—', icon: Search, color: 'text-blue-700', bg: 'bg-blue-50' },
 { label: 'Ortalama Süre', value: `${kpi?.avgDurationHrs ?? 0} Saat`,icon: Clock, color: 'text-indigo-700', bg: 'bg-indigo-50' },
 { label: 'Bypass (Risk)', value: kpi?.bypassCount ?? '—', icon: ShieldAlert,color: 'text-red-700', bg: 'bg-red-50' },
 { label: 'Darboğaz Sayısı', value: kpi?.bottleneckCount ?? '—', icon: Activity, color: 'text-amber-700', bg: 'bg-amber-50' },
 { label: 'Uyum Oranı', value: `%${kpi?.complianceRatio ?? 0}`, icon: CheckCircle2,color: 'text-emerald-700', bg: 'bg-emerald-50' },
 ].map(({ label, value, icon: Icon, color, bg }) => (
 <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center flex flex-col items-center justify-center">
 <div className={`p-1.5 rounded-lg ${bg} mb-1.5`}>
 <Icon size={14} className={color} />
 </div>
 <p className="text-lg font-black text-slate-800 tabular-nums leading-none">{value}</p>
 <p className="text-[9px] text-slate-500 font-bold uppercase leading-tight mt-1">{label}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Left: Digital Twin Model */}
 <div className="flex flex-col">
 <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
 <GitMerge size={16} className="text-indigo-500" />
 Dijital İkiz (Hedef Model)
 </h2>
 {modelsLoading ? (
 <div className="h-[500px] bg-white/50 rounded-2xl flex items-center justify-center animate-pulse border border-slate-200"><Network size={40} className="text-slate-300"/></div>
 ) : (
 <DigitalTwinViewer model={activeModel} logs={logs} />
 )}
 </div>

 {/* Right: Actual Cases List */}
 <div className="flex flex-col h-[500px]">
 <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2 mt-4 lg:mt-0">
 <Search size={16} className="text-blue-500" />
 Gerçekleşen Vakalar (Varyantlar)
 </h2>
 
 <div className="bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
 <div className="overflow-x-auto">
 <table className="w-full text-left">
 <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
 <tr>
 {['Case ID / Başlangıç', 'Uyum & Risk', 'Gerçek Adım', 'Fiili Süre', 'Aksiyon'].map((h, i) => (
 <th key={h} className={`px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-wider ${i > 1 && i < 4 ? 'text-center' : i === 4 ? 'text-right' : ''}`}>
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {logsLoading ? (
 <tr><td colSpan={5} className="text-center py-20 text-slate-400">Akış Bekleniyor...</td></tr>
 ) : (logs || []).length === 0 ? (
 <tr><td colSpan={5} className="text-center py-20 text-slate-400">Proses kaydı bulunamadı.</td></tr>
 ) : (
 (logs || []).map((log) => <ProcessLogRow key={log.id} log={log} />)
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
