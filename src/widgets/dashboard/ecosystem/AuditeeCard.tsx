import { supabase } from '@/shared/api/supabase';
import clsx from 'clsx';
import { AlertCircle, Building2, CheckCircle2, Clock, Loader2, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface FindingRow {
 id: string;
 title: string;
 severity: string;
 status: string;
 created_at: string;
 remediation_date: string | null;
}


const SEVERITY_COLORS: Record<string, string> = {
 CRITICAL: '#ef4444',
 HIGH: '#f59e0b',
 MEDIUM: '#3b82f6',
 LOW: '#10b981',
};

export function AuditeeCard() {
 const [findings, setFindings] = useState<FindingRow[]>([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 (async () => {
 const { data } = await supabase
 .from('audit_findings')
 .select('id, title, severity, status, created_at, remediation_date')
 .order('created_at', { ascending: false });
 if (data) setFindings(data);
 setLoading(false);
 })();
 }, []);

 if (loading) {
 return (
 <div className="bg-surface border-2 border-slate-200 rounded-2xl p-6 flex items-center justify-center min-h-[320px]">
 <Loader2 size={20} className="animate-spin text-slate-400" />
 </div>
 );
 }

 const total = findings.length;
 const remediated = (findings || []).filter((f) => f.status === 'REMEDIATED' || f.status === 'CLOSED').length;
 const responseRate = total > 0 ? Math.round((remediated / total) * 100) : 0;
 const pendingAction = (findings || []).filter((f) =>
 ['FINAL', 'SENT_TO_AUDITEE', 'AUDITEE_REVIEWING'].includes(f.status),
 ).length;

 const sevCounts = findings.reduce<Record<string, number>>((acc, f) => {
 acc[f.severity] = (acc[f.severity] || 0) + 1;
 return acc;
 }, {});

 const sevData = Object.entries(sevCounts).map(([sev, count]) => ({
 severity: sev === 'CRITICAL' ? 'Kritik' : sev === 'HIGH' ? 'Yuksek' : sev === 'MEDIUM' ? 'Orta' : 'Dusuk',
 count,
 color: SEVERITY_COLORS[sev] || '#94a3b8',
 }));

 const avgAge = findings.length > 0
 ? Math.round(
 (findings || []).reduce((s, f) => {
 const created = new Date(f.created_at);
 const now = new Date();
 return s + (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
 }, 0) / findings.length,
 )
 : 0;

 return (
 <div className="bg-gradient-to-br from-rose-50/80 to-slate-50/50 border-2 border-rose-200/60 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-rose-100/50">
 <div className="px-6 pt-5 pb-3">
 <div className="flex items-center justify-between mb-4">
 <div className="flex items-center gap-2.5">
 <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center">
 <Building2 size={18} className="text-rose-600" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-slate-800">Saha Nabzi</h3>
 <p className="text-[10px] text-slate-500 font-medium">Denetlenen Yanit Hizi</p>
 </div>
 </div>
 <div className={clsx(
 'px-3 py-1.5 rounded-lg text-xs font-bold border',
 responseRate >= 60
 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
 : responseRate >= 30
 ? 'bg-amber-100 text-amber-700 border-amber-200'
 : 'bg-red-100 text-red-700 border-red-200',
 )}>
 {responseRate}% Giderim
 </div>
 </div>

 <div className="grid grid-cols-3 gap-2 mb-4">
 <div className="bg-surface/70 border border-rose-100 rounded-xl p-2.5 text-center">
 <div className="flex justify-center mb-1">
 <AlertCircle size={12} className="text-rose-500" />
 </div>
 <p className="text-lg font-bold text-slate-800">{total}</p>
 <p className="text-[9px] text-slate-500">Toplam</p>
 </div>
 <div className="bg-surface/70 border border-rose-100 rounded-xl p-2.5 text-center">
 <div className="flex justify-center mb-1">
 <Clock size={12} className="text-amber-500" />
 </div>
 <p className={clsx('text-lg font-bold', pendingAction > 0 ? 'text-amber-600' : 'text-slate-800')}>
 {pendingAction}
 </p>
 <p className="text-[9px] text-slate-500">Aksiyonda</p>
 </div>
 <div className="bg-surface/70 border border-rose-100 rounded-xl p-2.5 text-center">
 <div className="flex justify-center mb-1">
 <CheckCircle2 size={12} className="text-emerald-500" />
 </div>
 <p className="text-lg font-bold text-emerald-600">{remediated}</p>
 <p className="text-[9px] text-slate-500">Giderildi</p>
 </div>
 </div>

 <div className="mb-2">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Ciddiyet Dagilimi</p>
 <div className="h-[70px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={sevData} barSize={24}>
 <XAxis dataKey="severity" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
 <YAxis hide />
 <Tooltip
 contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
 formatter={(v: number) => [v, 'Bulgu']}
 />
 <Bar dataKey="count" radius={[6, 6, 0, 0]}>
 {(sevData || []).map((entry, i) => (
 <Cell key={i} fill={entry.color} />
 ))}
 </Bar>
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 <div className="px-6 py-3 bg-rose-100/40 border-t border-rose-200/40">
 <div className="flex items-start gap-2">
 <Timer size={12} className="text-slate-500 mt-0.5 shrink-0" />
 <p className="text-[11px] text-slate-600 leading-relaxed">
 Ortalama bulgu yasi <span className="font-bold text-slate-800">{avgAge} gun</span>.
 {pendingAction > 0
 ? ` ${pendingAction} bulgu saha yanitini bekliyor.`
 : ' Tum bulgular icin yanit alindi.'}
 </p>
 </div>
 </div>
 </div>
 );
}
