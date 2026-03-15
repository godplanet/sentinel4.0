/**
 * RegulatorPortalPage — Ana Sayfa (Wave 86)
 * features/regulator-portal/index.tsx
 *
 * Dış Regülatör (BDDK/TCMB vb) Guest Portalı Ana Ekranı.
 * C-Level · Apple Glassmorphism · %100 Light Mode · READ-ONLY
 */

import { ExternalAssuranceBoard } from '@/widgets/ExternalAssuranceBoard';
import { motion } from 'framer-motion';
import {
 Activity,
 AlertCircle,
 EyeOff,
 Globe,
 KeyRound,
 Lock,
 MapPin,
 MonitorSmartphone,
 ShieldCheck
} from 'lucide-react';
import {
 useAssuranceReports,
 useRegulatorLogs, useRegulatorPortalKPI,
 useSharedDossiers,
 type RegulatorAccessLog
} from './api';

// ─── Murakıp/Denetçi Erişim Log Satırı ───────────────────────────────────────

function AccessLogRow({ log, index }: { log: RegulatorAccessLog; index: number }) {
 const isFailed = !log.is_success;
 
 return (
 <motion.tr
 initial={{ opacity: 0, x: -5 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: Math.min(index * 0.03, 0.4) }}
 className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${isFailed ? 'bg-red-50/20' : ''}`}
 >
 <td className="px-3 py-2.5">
 <p className="text-[10px] font-black text-slate-600 font-mono tracking-tight">
 {new Date(log.access_time).toLocaleTimeString('tr-TR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
 </p>
 <p className="text-[9px] text-slate-400 mt-0.5">{new Date(log.access_time).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</p>
 </td>
 <td className="px-3 py-2.5">
 <div className="flex items-center gap-1.5 border border-slate-200 px-1.5 py-0.5 rounded shadow-sm w-max bg-white">
 <Globe size={10} className="text-indigo-400" />
 <span className="text-[10px] font-black text-slate-700">{log.regulator_agency}</span>
 </div>
 </td>
 <td className="px-3 py-2.5">
 <p className="text-[10px] font-bold text-slate-700">{log.regulator_name}</p>
 <p className="text-[8px] text-slate-400 mt-0.5 flex items-center gap-0.5 font-mono"><MapPin size={8}/> {log.ip_address}</p>
 </td>
 <td className="px-3 py-2.5">
 <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">
 {log.action_type.replace('_', ' ')}
 </span>
 {log.target_resource && (
 <p className="text-[9px] text-slate-500 mt-1 line-clamp-1 italic">"{log.target_resource}"</p>
 )}
 </td>
 <td className="px-3 py-2.5 text-right w-16">
 {isFailed ? (
 <span className="inline-flex p-1 rounded-md bg-rose-50 border border-rose-200">
 <AlertCircle size={14} className="text-rose-600"/>
 </span>
 ) : (
 <span className="inline-flex p-1 rounded-md bg-emerald-50 border border-emerald-200">
 <ShieldCheck size={14} className="text-emerald-600"/>
 </span>
 )}
 </td>
 </motion.tr>
 );
}

// ─── Ana Dashboard ────────────────────────────────────────────────────────────

export function RegulatorPortalPage() {
 const { data: reports = [] } = useAssuranceReports();
 const { data: dossiers = [] } = useSharedDossiers();
 const { data: logs = [], isLoading: logsLoading } = useRegulatorLogs();
 
 const kpi = useRegulatorPortalKPI(reports, dossiers, logs);

 return (
 <div className="h-full flex flex-col bg-slate-50/50 overflow-auto">
 {/* C-Level Header */}
 <div className="px-4 pt-4 pb-4 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm z-10 flex justify-between items-start">
 <div className="flex items-center gap-4">
 <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-800 to-black flex items-center justify-center border border-slate-300 shadow-lg relative">
 <Lock size={24} className="text-indigo-300 relative z-10" />
 <div className="absolute inset-x-0 bottom-1 flex justify-center">
 <span className="text-[7px] font-black tracking-widest text-indigo-200/50 font-mono">GUEST</span>
 </div>
 </div>
 <div>
 <div className="flex items-center gap-2 mb-0.5">
 <h1 className="text-2xl font-black text-slate-800 tracking-tight">External Regulator Portal</h1>
 <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-inner">
 <EyeOff size={10} /> Read-Only Mode
 </span>
 </div>
 <p className="text-xs text-slate-500">BDDK, SPK, TCMB ve Bağımsız Dış Denetçiler İçin Sürekli Güvence Sunumu · Wave 86</p>
 </div>
 </div>

 {/* Live Status Indicators */}
 <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
 <div className="flex flex-col items-center px-4 border-r border-slate-100">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><MonitorSmartphone size={10}/> Canlı Logins</p>
 <div className="flex items-center gap-1.5">
 {kpi.recentLogins > 0 && <span className="animate-ping h-2 w-2 rounded-full bg-emerald-400 opacity-75" />}
 <p className="text-lg font-black text-emerald-600 leading-none">{kpi.recentLogins}</p>
 <span className="text-[9px] text-slate-500 font-bold ml-1 border-l pl-1 border-slate-200">24 Saat</span>
 </div>
 </div>
 <div className="flex flex-col items-center px-4">
 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Activity size={10}/> Ort. Güvence Skoru</p>
 <p className="text-lg font-black text-indigo-700 leading-none">%{kpi.avgAssuranceScore}</p>
 </div>
 </div>
 </div>

 <div className="flex-1 overflow-hidden flex flex-col xl:flex-row gap-4 p-4">
 
 {/* Left: Assurance Board Widget */}
 <div className="flex-1 xl:w-2/3 h-full overflow-hidden">
 <ExternalAssuranceBoard />
 </div>

 {/* Right: Audit Trail of Auditors (Regulator Logs) */}
 <div className="w-full xl:w-[380px] shrink-0 flex flex-col h-full bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
 <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
 <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
 <KeyRound size={16} className="text-slate-500" />
 Guest Activity Radar
 </h2>
 <span className="text-[9px] font-mono text-slate-400">Canlı İzleme</span>
 </div>
 
 <div className="flex-1 overflow-x-auto">
 <table className="w-full text-left whitespace-nowrap">
 <thead className="bg-slate-50/50 sticky top-0 z-10 border-b border-slate-100 shadow-sm">
 <tr>
 {['Zaman', 'Kurum', 'Denetçi / IP', 'Eylem', ''].map((h, i) => (
 <th key={h} className={`px-3 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-wider ${i === 4 ? 'w-10' : ''}`}>
 {h}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className="bg-white">
 {logsLoading ? (
 <tr><td colSpan={5} className="text-center py-10 text-slate-400">Hareket Günlüğü Bekleniyor...</td></tr>
 ) : (logs || []).length === 0 ? (
 <tr><td colSpan={5} className="text-center py-10 text-slate-400">Son 24 saatte erişim tespit edilmedi.</td></tr>
 ) : (
 (logs || []).slice(0, 15).map((log, i) => <AccessLogRow key={log.id} log={log} index={i} />)
 )}
 </tbody>
 </table>
 </div>
 
 <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
 <p className="text-[9px] text-slate-400 italic">"Gözlemleyenleri Gözlemle" — Olay müdahale timi için erişim izi sadece 15 kayıt ile sınırlandırılmıştır.</p>
 </div>
 </div>
 
 </div>
 </div>
 );
}
