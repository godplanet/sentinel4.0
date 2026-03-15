import {
 useAPIBreaches,
 useAPILogs, usePSD2Tokens,
 useUpdateAPIBreachStatus,
 type ApiBreach
} from '@/features/open-banking/api';
import clsx from 'clsx';
import { Activity, AlertTriangle, Globe, Key, Server, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSeverityColor(sev: string) {
 switch (sev) {
 case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
 case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
 case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
 default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
 }
}

function BreachCard({ breach }: { breach: ApiBreach }) {
 const { mutate: updateStatus } = useUpdateAPIBreachStatus();

 return (
 <div className="border border-red-200 bg-red-50 p-4 rounded-xl relative overflow-hidden">
 <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full flex items-start justify-end p-2 opacity-50">
 <AlertTriangle size={24} className="text-red-300" />
 </div>
 
 <div className="flex items-start justify-between mb-2">
 <div>
 <span className={clsx('text-[10px] uppercase font-bold px-2 py-0.5 rounded border', getSeverityColor(breach.severity))}>
 {breach.severity} RİSK
 </span>
 <span className="text-[10px] ml-2 text-red-600 font-mono border border-red-200 bg-white px-1.5 py-0.5 rounded">
 {breach.anomaly_type}
 </span>
 </div>
 <span className="text-[10px] text-red-700 font-bold bg-white px-2 py-0.5 border border-red-200 rounded uppercase">
 {breach.status.replace('_', ' ')}
 </span>
 </div>

 <p className="text-xs text-red-800 font-medium leading-tight mt-2 mb-3 pr-8">
 {breach.description}
 </p>

 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto text-[10px] text-red-600 font-medium border-t border-red-200/50 pt-2">
 {breach.tpp_name && <span className="flex items-center gap-1"><Server size={12}/> TPP: {breach.tpp_name}</span>}
 {breach.source_ip && <span className="flex items-center gap-1"><Globe size={12}/> IP: {breach.source_ip}</span>}
 <span>Tespit: {new Date(breach.detected_at).toLocaleString('tr-TR')}</span>
 </div>

 {breach.status === 'OPEN' || breach.status === 'INVESTIGATING' ? (
 <div className="mt-3 flex gap-2">
 <button onClick={() => updateStatus({ id: breach.id, status: 'BLOCKED' })} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold rounded shadow-sm transition">
 Erişimi Kapat (Block)
 </button>
 <button onClick={() => updateStatus({ id: breach.id, status: 'FALSE_POSITIVE' })} className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-[10px] font-bold rounded shadow-sm transition">
 False Positive (İptal)
 </button>
 </div>
 ) : null}
 </div>
 );
}

// ---------------------------------------------------------------------------
// MAIN: API Gateway Radar Widget
// ---------------------------------------------------------------------------
export function APIGatewayRadar() {
 const { data: logs = [], isLoading: loadingLogs } = useAPILogs();
 const { data: tokens = [] } = usePSD2Tokens();
 const { data: breaches = [] } = useAPIBreaches();

 // Metrics with Division by Zero Protection
 const metrics = useMemo(() => {
 const totalRequests = logs.length;
 const rateLimitedCount = (logs || []).filter(l => l.is_rate_limited || l.status_code === 429).length;
 const errorsCount = (logs || []).filter(l => l.status_code >= 500).length;

 // Defense: `(totalRequests || 1)` ensures we NEVER divide by zero.
 const rateLimitRatio = totalRequests > 0 ? ((rateLimitedCount / (totalRequests || 1)) * 100).toFixed(1) : '0.0';
 const errorRatio = totalRequests > 0 ? ((errorsCount / (totalRequests || 1)) * 100).toFixed(1) : '0.0';

 const avgResponse = totalRequests > 0 
 ? Math.round((logs || []).reduce((acc, curr) => acc + curr.response_time_ms, 0) / (totalRequests || 1)) 
 : 0;

 const activeTokens = (tokens || []).filter(t => t.status === 'ACTIVE').length;
 const revokedTokens = (tokens || []).filter(t => t.status === 'REVOKED' || t.status === 'SUSPENDED').length;

 return { totalRequests, rateLimitRatio, errorRatio, avgResponse, activeTokens, revokedTokens };
 }, [logs, tokens]);

 if (loadingLogs) {
 return (
 <div className="flex items-center justify-center p-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
 </div>
 );
 }

 return (
 <div className="space-y-4">
 
 {/* Metrics Row */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-center">
 <Activity className="mx-auto text-blue-500 mb-2" size={20} />
 <div className="text-2xl font-black text-slate-800">{metrics.avgResponse}<span className="text-sm font-medium text-slate-500 ml-1">ms</span></div>
 <div className="text-[10px] font-bold text-slate-500 uppercase mt-1">Ort. Yanıt Süresi</div>
 </div>
 <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl text-center">
 <ShieldAlert className="mx-auto text-orange-500 mb-2" size={20} />
 <div className="text-2xl font-black text-orange-700">%{metrics.rateLimitRatio}</div>
 <div className="text-[10px] font-bold text-orange-700 uppercase mt-1">Rate Limit Kesintisi</div>
 </div>
 <div className={clsx('border p-4 rounded-xl text-center', Number(metrics.errorRatio) > 2 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200')}>
 <ShieldCheck className={clsx('mx-auto mb-2', Number(metrics.errorRatio) > 2 ? 'text-red-500' : 'text-slate-400')} size={20} />
 <div className={clsx('text-2xl font-black', Number(metrics.errorRatio) > 2 ? 'text-red-700' : 'text-slate-800')}>%{metrics.errorRatio}</div>
 <div className={clsx('text-[10px] font-bold uppercase mt-1', Number(metrics.errorRatio) > 2 ? 'text-red-700' : 'text-slate-500')}>API Hata Oranı (5xx)</div>
 </div>
 <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl text-center relative overflow-hidden">
 <Key className="mx-auto text-indigo-500 mb-2" size={20} />
 <div className="text-2xl font-black text-indigo-700">{metrics.activeTokens}</div>
 <div className="text-[10px] font-bold text-indigo-700 uppercase mt-1">Aktif PSD2 Token</div>
 <div className="text-[10px] text-indigo-500 font-medium absolute bottom-1 right-2">İptal: {metrics.revokedTokens}</div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 
 {/* Left Col: Open Breaches */}
 <div className="lg:col-span-2 space-y-4">
 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
 <AlertTriangle size={18} className="text-red-500" /> Aktif Güvenlik İhlal Alarmları
 </h3>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {breaches.length === 0 ? (
 <div className="col-span-2 text-center py-5 border border-dashed border-emerald-200 bg-emerald-50 rounded-xl">
 <ShieldCheck size={32} className="mx-auto text-emerald-500 mb-2"/>
 <p className="font-bold text-emerald-700">Güvenlik İhlali Bulunmuyor</p>
 <p className="text-xs text-emerald-600 mt-1">Tüm API Gateway trafiği güvenli parametreler içinde.</p>
 </div>
 ) : (breaches || []).map(b => (
 <BreachCard key={b.id} breach={b} />
 ))}
 </div>
 </div>

 {/* Right Col: Live Traffic Stream Log */}
 <div className="lg:col-span-1 space-y-4">
 <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
 <Server size={18} className="text-slate-500" /> API Gateway Canlı Akış
 </h3>
 <div className="bg-slate-900 rounded-xl p-4 h-[400px] overflow-y-auto custom-scrollbar border border-slate-800 shadow-inner">
 <div className="space-y-2 font-mono text-[10px]">
 {logs.length === 0 ? (
 <div className="text-slate-500 text-center py-4">Trafik yok...</div>
 ) : (logs || []).map(log => (
 <div key={log.id} className="flex flex-col border-b border-slate-800 pb-2">
 <div className="flex items-center justify-between mb-1">
 <span className={clsx(
 'font-bold px-1.5 py-0.5 rounded',
 log.method === 'GET' ? 'text-emerald-400 bg-emerald-400/10' :
 log.method === 'POST' ? 'text-blue-400 bg-blue-400/10' :
 log.method === 'DELETE' ? 'text-red-400 bg-red-400/10' : 'text-slate-400 bg-slate-400/10'
 )}>
 {log.method}
 </span>
 <span className={clsx(
 'font-bold',
 log.status_code >= 500 ? 'text-red-400' :
 log.status_code >= 400 ? 'text-orange-400' : 'text-emerald-400'
 )}>
 {log.status_code}
 </span>
 </div>
 <span className="text-slate-300 truncate">{log.endpoint}</span>
 <div className="flex justify-between items-center mt-1 text-slate-500 px-1">
 <span>{log.response_time_ms}ms | {log.consumer_app.slice(0, 10)}</span>
 <span className="text-[9px]">{new Date(log.timestamp).toLocaleTimeString('tr-TR')}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>

 </div>
 );
}
