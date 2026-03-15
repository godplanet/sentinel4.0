/**
 * Wave 74: BurnoutRadar — Tükenmişlik Radarı
 * Apple Glassmorphism tasarımı, matematiksel bölme korumaları ve null safety.
 */

import {
 useWellBeingDashboard,
 type BurnoutScore,
 type RiskStatusLabel,
 type WorkloadLog
} from '@/features/auditor-wellbeing/api';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import {
 Activity, AlertTriangle,
 Brain,
 Briefcase,
 Coffee,
 HeartPulse,
 Info,
 Loader2,
 Plane,
 ShieldCheck,
 Zap
} from 'lucide-react';
import { useState } from 'react';

/* ──────────────────────────────────────────────────────────
 Config
 ────────────────────────────────────────────────────────── */

const RISK_COLORS: Record<RiskStatusLabel, string> = {
 NORMAL: 'bg-emerald-50 text-emerald-700 border-emerald-200',
 ELEVATED: 'bg-amber-50 text-amber-700 border-amber-200',
 HIGH: 'bg-orange-50 text-orange-700 border-orange-300',
 CRITICAL: 'bg-red-50 text-red-700 border-red-300',
};

const RISK_BADGE: Record<RiskStatusLabel, string> = {
 NORMAL: 'bg-emerald-500 text-white',
 ELEVATED: 'bg-amber-500 text-white',
 HIGH: 'bg-orange-500 text-white',
 CRITICAL: 'bg-red-600 text-white',
};

const RISK_LABELS: Record<RiskStatusLabel, string> = {
 NORMAL: 'Normal',
 ELEVATED: 'Dikkat',
 HIGH: 'Yüksek',
 CRITICAL: 'Kritik',
};

function getRiskIcon(status: RiskStatusLabel) {
 switch (status) {
 case 'CRITICAL': return <AlertTriangle size={18} className="text-red-600 animate-pulse" />;
 case 'HIGH': return <Zap size={18} className="text-orange-600" />;
 case 'ELEVATED': return <Activity size={18} className="text-amber-600" />;
 default: return <ShieldCheck size={18} className="text-emerald-600" />;
 }
}

/* ──────────────────────────────────────────────────────────
 Components
 ────────────────────────────────────────────────────────── */

function BurnoutCard({ score, workload }: { score: BurnoutScore; workload?: WorkloadLog }) {
 const isCritical = score.risk_status === 'CRITICAL' || score.risk_status === 'HIGH';

 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 className={clsx(
 'relative bg-surface rounded-2xl border p-5 shadow-sm overflow-hidden flex flex-col',
 isCritical ? 'border-red-200/50' : 'border-slate-200'
 )}
 >
 {/* Background Gradient & Icon for Criticals */}
 {isCritical && (
 <div className="absolute -top-10 -right-10 opacity-[0.03] text-red-900 pointer-events-none">
 <AlertTriangle size={180} />
 </div>
 )}

 {/* Header */}
 <div className="flex justify-between items-start mb-4 z-10">
 <div>
 <h4 className="font-bold text-primary flex items-center gap-2">
 {score.auditor_name}
 </h4>
 <span className="text-xs text-slate-500 font-medium">{score.department}</span>
 </div>
 <div className={clsx('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm', RISK_BADGE[score.risk_status])}>
 {getRiskIcon(score.risk_status)}
 {RISK_LABELS[score.risk_status]}
 </div>
 </div>

 {/* Metrics Grid */}
 <div className="grid grid-cols-2 gap-3 mb-4 z-10">
 <div className={clsx('p-3 rounded-xl border', RISK_COLORS[score.risk_status])}>
 <div className="text-[10px] uppercase font-bold opacity-70 mb-1 flex items-center gap-1">
 <Brain size={12} /> Stres Skoru
 </div>
 <div className="text-2xl font-black">
 {score.risk_score?.toFixed(1) ?? '0.0'} <span className="text-xs opacity-60 font-medium">/ 100</span>
 </div>
 </div>
 
 <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
 <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
 <Coffee size={12} /> Fazla Mesai
 </div>
 <div className={clsx('text-xl font-bold', score.overtime_percentage > 15 ? 'text-orange-600' : 'text-slate-700')}>
 %{(score.overtime_percentage ?? 0).toFixed(1)}
 </div>
 </div>
 </div>

 {/* Workload Details (if matched) */}
 {workload && (
 <div className="flex gap-4 text-xs text-slate-600 mb-4 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 z-10">
 <div className="flex items-center gap-1.5">
 <Briefcase size={14} className="text-blue-500" />
 <span className="font-semibold">{workload.total_projects} Proje</span>
 </div>
 <div className="flex items-center gap-1.5">
 <Plane size={14} className="text-slate-400" />
 <span>{workload.travel_days} Gün Seyahat</span>
 </div>
 </div>
 )}

 {/* AI Recommendation */}
 <div className="mt-auto z-10">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Yapay Zeka Önerisi</div>
 <p className="text-sm text-slate-700 leading-relaxed font-medium bg-gradient-to-r from-blue-50/50 to-transparent p-3 rounded-xl border-l-2 border-blue-400">
 {score.ai_recommendation || 'Veri yetersizliğinden öneri üretilemedi.'}
 </p>
 </div>
 </motion.div>
 );
}

/* ──────────────────────────────────────────────────────────
 Main Widget Export
 ────────────────────────────────────────────────────────── */

export function BurnoutRadar() {
 const { data, isLoading, isError } = useWellBeingDashboard();
 const [filter, setFilter] = useState<'ALL' | 'CRITICAL'>('ALL');

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
 <p className="text-red-800 text-sm">İK ve tükenmişlik verileri yüklenirken bir iletişim hatası oluştu.</p>
 </div>
 );
 }

 const { scores, workloads, totalCriticalAuditors, averageOvertimePercentage } = data;

 const displayedScores = filter === 'CRITICAL' 
 ? (scores || []).filter(s => s.risk_status === 'CRITICAL' || s.risk_status === 'HIGH')
 : scores;

 return (
 <div className="space-y-4">
 
 {/* Overview Banner (Glassmorphism) */}
 <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-4 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-6 md:items-center justify-between border border-slate-700/50">
 <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
 <HeartPulse size={250} />
 </div>
 
 <div className="z-10 flex-1">
 <div className="flex items-center gap-2 mb-2">
 <Activity className="text-emerald-400" />
 <h2 className="text-xl font-bold tracking-tight">Kurumsal Tükenmişlik Radarı</h2>
 </div>
 <p className="text-slate-400 text-sm max-w-xl">
 Müfettiş havuzunun iş yükü, seyahat ve fazla mesai verileri baz alınarak hesaplanan anlık stres ve tükenmişlik risk haritası.
 </p>
 </div>

 <div className="z-10 flex gap-4 md:gap-8">
 <div className="flex flex-col">
 <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Ortalama Fazla Mesai</span>
 <div className="flex items-baseline gap-1">
 <span className="text-3xl font-black">{averageOvertimePercentage.toFixed(1)}</span>
 <span className="text-sm font-medium text-slate-400">%</span>
 </div>
 </div>
 
 <div className="w-px h-12 bg-slate-700/50 hidden md:block self-center"></div>

 <div className="flex flex-col">
 <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Riskli Personel</span>
 <div className="flex items-baseline gap-2">
 <span className={clsx('text-3xl font-black', totalCriticalAuditors > 0 ? 'text-red-400' : 'text-emerald-400')}>
 {totalCriticalAuditors}
 </span>
 <span className="text-sm font-medium text-slate-400">kişi</span>
 </div>
 </div>
 </div>
 </div>

 {/* Toolbar */}
 <div className="flex items-center justify-between bg-surface border border-slate-200 rounded-xl p-3 shadow-sm">
 <div className="flex items-center gap-2 text-sm text-slate-600 font-medium px-2">
 <Info size={16} className="text-blue-500" />
 <span>Toplam {scores.length} profil inceleniyor.</span>
 </div>
 <div className="flex bg-slate-100 p-1 rounded-lg">
 <button 
 onClick={() => setFilter('ALL')}
 className={clsx('px-4 py-1.5 rounded-md text-xs font-bold transition-all', filter === 'ALL' ? 'bg-white shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700')}
 >
 Tüm Havuz
 </button>
 <button 
 onClick={() => setFilter('CRITICAL')}
 className={clsx('px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1', filter === 'CRITICAL' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-red-600')}
 >
 <AlertTriangle size={12} /> Kritik Risk ({totalCriticalAuditors})
 </button>
 </div>
 </div>

 {/* Cards Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {(displayedScores || []).map(score => {
 const workload = workloads.find(w => w.auditor_id === score.auditor_id);
 return <BurnoutCard key={score.id} score={score} workload={workload} />;
 })}

 {displayedScores.length === 0 && (
 <div className="col-span-full py-16 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
 <ShieldCheck size={48} className="text-emerald-400 mb-3" />
 <p className="text-slate-500 font-medium text-center max-w-sm">
 Seçili filtreye uygun personel bulunamadı veya havuzda riskli durum tespit edilmedi.
 </p>
 </div>
 )}
 </div>

 </div>
 );
}
