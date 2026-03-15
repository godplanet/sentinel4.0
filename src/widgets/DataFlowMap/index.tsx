import { useDataFlows, type PiiDataFlow } from '@/features/data-privacy/api';
import clsx from 'clsx';
import { AlertTriangle, ArrowRight, CloudOff, Database, Globe, Lock, ShieldAlert, Unlock } from 'lucide-react';
import { useMemo } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getRiskColor(risk: string) {
 switch (risk) {
 case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
 case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
 case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
 default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
 }
}

// ---------------------------------------------------------------------------
// Flow Node Component
// ---------------------------------------------------------------------------
function FlowCard({ flow }: { flow: PiiDataFlow }) {
 // Defensive check for data_categories
 const categories = flow.data_categories ?? [];

 return (
 <div className={clsx(
 'border rounded-xl p-4 transition-all hover:shadow-md bg-white flex flex-col',
 flow.is_cross_border ? 'border-orange-300' : 'border-slate-200'
 )}>
 {/* Header part */}
 <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
 <div className="flex items-center gap-2">
 <Database size={16} className="text-slate-400" />
 <span className="font-semibold text-slate-700 text-sm">{flow.system_source}</span>
 </div>
 <ArrowRight size={16} className={flow.is_encrypted ? 'text-emerald-500' : 'text-red-400'} />
 <div className="flex items-center gap-2">
 {flow.is_cross_border ? <Globe size={16} className="text-orange-500" /> : <CloudOff size={16} className="text-slate-400" />}
 <span className="font-semibold text-slate-700 text-sm">{flow.system_destination}</span>
 </div>
 </div>

 {/* Metadata part */}
 <div className="grid grid-cols-2 gap-y-2 text-xs mb-3 flex-1">
 <div className="text-slate-500">Kapsam:</div>
 <div className="font-medium text-slate-800 flex flex-wrap gap-1">
 {categories.length > 0 ? (categories || []).map(c => (
 <span key={c} className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">{c}</span>
 )) : <span className="text-slate-400 italic">Belirtilmedi</span>}
 </div>
 
 <div className="text-slate-500">Yurtdışı Ak.:</div>
 <div className="font-medium">
 {flow.is_cross_border ? <span className="text-orange-600 font-bold flex items-center gap-1"><AlertTriangle size={12}/> Evet</span> : <span className="text-emerald-600">Hayır</span>}
 </div>

 <div className="text-slate-500">Şifreleme:</div>
 <div className="font-medium">
 {flow.is_encrypted ? <span className="text-emerald-600 flex items-center gap-1"><Lock size={12}/> Şifreli</span> : <span className="text-red-600 font-bold flex items-center gap-1"><Unlock size={12}/> Şifresiz</span>}
 </div>

 <div className="text-slate-500">Hukuki Sebep:</div>
 <div className="font-medium text-indigo-600">{flow.legal_basis.replace('_', ' ')}</div>
 </div>

 <div className="border-t border-slate-100 pt-3 flex justify-between items-center mt-auto">
 <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded border uppercase', getRiskColor(flow.risk_level))}>
 {flow.risk_level} RİSK
 </span>
 <span className="text-[10px] text-slate-400">
 Metot: {flow.transfer_method}
 </span>
 </div>
 </div>
 );
}

// ---------------------------------------------------------------------------
// MAIN: Data Flow Map Widget
// ---------------------------------------------------------------------------
export function DataFlowMap() {
 const { data: flows = [], isLoading } = useDataFlows();

 // Aggregate stats
 const stats = useMemo(() => {
 const unencrypted = (flows || []).filter(f => !f.is_encrypted).length;
 const crossBorder = (flows || []).filter(f => f.is_cross_border).length;
 return {
 total: flows.length,
 unencrypted,
 crossBorder
 };
 }, [flows]);

 if (isLoading) {
 return (
 <div className="flex items-center justify-center p-12">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
 </div>
 );
 }

 return (
 <div className="space-y-4">
 {/* Quick Stats Overlay */}
 <div className="grid grid-cols-3 gap-4 mb-4">
 <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
 <div className="text-2xl font-black text-slate-700">{stats.total}</div>
 <div className="text-[10px] font-bold text-slate-500 uppercase">Aktif Veri Akışı</div>
 </div>
 <div className={clsx('border rounded-lg p-3 text-center transition-colors', stats.unencrypted > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200')}>
 <div className={clsx('text-2xl font-black', stats.unencrypted > 0 ? 'text-red-600' : 'text-emerald-600')}>{stats.unencrypted}</div>
 <div className={clsx('text-[10px] font-bold uppercase', stats.unencrypted > 0 ? 'text-red-700' : 'text-emerald-700')}>Şifresiz Aktarım</div>
 </div>
 <div className={clsx('border rounded-lg p-3 text-center transition-colors', stats.crossBorder > 0 ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200')}>
 <div className={clsx('text-2xl font-black', stats.crossBorder > 0 ? 'text-orange-600' : 'text-slate-700')}>{stats.crossBorder}</div>
 <div className={clsx('text-[10px] font-bold uppercase', stats.crossBorder > 0 ? 'text-orange-700' : 'text-slate-500')}>Yurtdışı Çıkış</div>
 </div>
 </div>

 {flows.length === 0 ? (
 <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl bg-slate-50">
 <ShieldAlert size={32} className="mx-auto text-slate-400 mb-2" />
 <h3 className="font-bold text-slate-600">Veri Akışı Bulunamadı</h3>
 <p className="text-sm text-slate-500">Sistemde kayıtlı PII veri akışı tanımlanmamış.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 {(flows || []).map(f => (
 <FlowCard key={f.id} flow={f} />
 ))}
 </div>
 )}
 </div>
 );
}
