import { useApexSummaries } from '@/features/apex/api';
import { Activity, AlertTriangle, Minus, ShieldCheck, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

function CustomTooltip({ active, payload }: any) {
 if (active && payload && payload.length) {
 const data = payload[0].payload;
 return (
 <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-3 rounded-xl shadow-xl text-sm">
 <p className="font-bold text-slate-800 mb-1">{data.date_label}</p>
 <p className="text-indigo-600 font-black">Sağlık Skoru: {data.score}</p>
 </div>
 );
 }
 return null;
}

// ---------------------------------------------------------------------------
// MAIN: Apex Dashboard Widget
// ---------------------------------------------------------------------------
export function ApexDashboard() {
 const { data: summaries = [], isLoading } = useApexSummaries(12);

 const currentSummary = summaries[0];

 const historicalData = useMemo(() => {
 // Reverse summaries for chronologically ascending chart rendering
 return [...summaries].reverse().map(s => ({
 date_label: new Date(s.snapshot_date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
 score: s.grc_health_score
 }));
 }, [summaries]);

 if (isLoading) {
 return (
 <div className="flex items-center justify-center p-24">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
 </div>
 );
 }

 if (!currentSummary) {
 return (
 <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl bg-white/50 backdrop-blur">
 <ShieldCheck size={48} className="mx-auto text-slate-300 mb-4" />
 <h3 className="text-lg font-bold text-slate-700">Henüz Yönetici Özeti Çıkarılmadı</h3>
 <p className="text-slate-500">Sistem metrikleri konsolide ediliyor.</p>
 </div>
 );
 }

 return (
 <div className="space-y-4">
 
 {/* 1. Hero / God's Eye Metric */}
 <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-5 relative overflow-hidden shadow-2xl border border-indigo-500/30">
 
 {/* Background Decorative Rings */}
 <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
 <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

 <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5">
 
 <div className="space-y-4 max-w-lg">
 <h2 className="text-indigo-200 text-sm font-bold uppercase tracking-widest flex items-center gap-2">
 <Target size={16} /> Kurumsal GRC Sağlık Skoru
 </h2>
 <div className="text-6xl font-black text-white tracking-tight flex items-baseline gap-2">
 {currentSummary.grc_health_score}
 <span className="text-2xl text-slate-400 font-medium">/1000</span>
 </div>
 
 <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/5">
 <p className="text-slate-200 text-sm leading-relaxed font-medium">"{currentSummary.executive_message}"</p>
 </div>
 </div>

 <div className="w-full md:w-1/3 flex flex-col items-end gap-4">
 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 w-full flex items-center justify-between">
 <div>
 <div className="text-slate-400 text-xs font-bold uppercase">Uyum (Compliance)</div>
 <div className="text-2xl font-black text-emerald-400">%{currentSummary.compliance_ratio}</div>
 </div>
 <Activity size={32} className="text-emerald-500/50" />
 </div>
 <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-red-500/20 w-full flex items-center justify-between">
 <div>
 <div className="text-slate-400 text-xs font-bold uppercase">Kritik Risk / Vaka</div>
 <div className="text-2xl font-black text-red-400 flex items-center gap-2">
 {currentSummary.active_critical_risks + currentSummary.open_incidents}
 {currentSummary.trend_direction === 'UP' ? <TrendingUp size={16}/> : 
 currentSummary.trend_direction === 'DOWN' ? <TrendingDown size={16} className="text-emerald-400"/> : 
 <Minus size={16} className="text-slate-400"/>}
 </div>
 </div>
 <AlertTriangle size={32} className="text-red-500/50" />
 </div>
 </div>

 </div>
 </div>

 {/* 2. Historical Trend Chart */}
 <div className="bg-white/70 backdrop-blur border border-slate-200 rounded-3xl p-4 shadow-sm">
 <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
 <Activity size={18} className="text-indigo-500" /> Sağlık Skoru Trendi
 </h3>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={historicalData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
 <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <XAxis dataKey="date_label" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
 <Tooltip content={<CustomTooltip />} />
 <Area 
 type="monotone" 
 dataKey="score" 
 stroke="#4f46e5" 
 strokeWidth={3}
 fillOpacity={1} 
 fill="url(#scoreGradient)" 
 />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </div>

 </div>
 );
}
