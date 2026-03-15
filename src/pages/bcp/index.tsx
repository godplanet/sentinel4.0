import { useBcpScenarios, useCrisisHistory } from '@/features/bcp/api';
import { PageHeader } from '@/shared/ui/PageHeader';
import { CrisisCockpit } from '@/widgets/CrisisCockpit';
import clsx from 'clsx';
import {
 AlertTriangle,
 ArrowRight,
 BookOpen,
 CheckCircle2,
 Clock, History,
 XCircle
} from 'lucide-react';
import { useState } from 'react';

type Tab = 'cockpit' | 'scenarios' | 'history';

export default function BCPCrisisPage() {
 const [tab, setTab] = useState<Tab>('cockpit');
 const { data: scenarios = [], isLoading: scenLoading } = useBcpScenarios();
 const { data: history = [], isLoading: histLoading } = useCrisisHistory();

 const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
 { id: 'cockpit', label: 'Kriz Kokpiti', icon: AlertTriangle },
 { id: 'scenarios', label: 'BCP Senaryoları', icon: BookOpen },
 { id: 'history', label: 'Tarihçe', icon: History },
 ];

 return (
 <div className="space-y-4">
 <PageHeader
 title="BCP & Kriz Yönetimi"
 description="İş Sürekliliği Planı — Aktif Kriz İzleme ve Kurtarma Koordinasyonu"
 />

 {/* Tab Navigation */}
 <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
 {(tabs || []).map(t => {
 const Icon = t.icon;
 return (
 <button
 key={t.id}
 onClick={() => setTab(t.id)}
 className={clsx(
 'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all',
 tab === t.id
 ? 'bg-white shadow text-slate-800'
 : 'text-slate-500 hover:text-slate-700'
 )}
 >
 <Icon size={14} />
 {t.label}
 </button>
 );
 })}
 </div>

 {/* TAB: Kriz Kokpiti */}
 {tab === 'cockpit' && <CrisisCockpit />}

 {/* TAB: BCP Senaryoları */}
 {tab === 'scenarios' && (
 <div className="space-y-3">
 {scenLoading ? (
 <div className="flex items-center justify-center h-40">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
 </div>
 ) : (scenarios ?? []).length === 0 ? (
 <div className="flex flex-col items-center justify-center h-40 text-center">
 <BookOpen size={32} className="text-slate-300 mb-2" />
 <p className="text-sm text-slate-500">BCP senaryosu bulunamadı.</p>
 </div>
 ) : (scenarios ?? []).map(scen => (
 <div key={scen.id} className="bg-white border border-slate-200 rounded-xl p-4">
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className={clsx(
 'text-[10px] font-bold px-2 py-0.5 rounded border uppercase',
 scen.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-200' :
 scen.severity === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200' :
 'bg-amber-100 text-amber-700 border-amber-200'
 )}>{scen.severity}</span>
 <span className="text-[10px] text-slate-500 font-mono">{scen.scenario_code}</span>
 <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">{scen.category}</span>
 </div>
 <h3 className="text-sm font-bold text-slate-800">{scen.title}</h3>
 {scen.description && (
 <p className="text-xs text-slate-500 mt-0.5">{scen.description}</p>
 )}
 </div>
 <div className="text-right shrink-0">
 <div className="flex items-center gap-1 text-xs text-slate-500 justify-end">
 <Clock size={11} />
 <span>RTO: {scen.rto_minutes}dk</span>
 </div>
 <div className="text-xs text-slate-400 mt-0.5">RPO: {scen.rpo_minutes}dk</div>
 <div className="mt-1">
 {scen.is_tested ? (
 scen.test_result === 'PASSED' ? (
 <span className="flex items-center gap-1 text-[10px] text-emerald-600 justify-end">
 <CheckCircle2 size={10} /> Test: Başarılı
 </span>
 ) : scen.test_result === 'FAILED' ? (
 <span className="flex items-center gap-1 text-[10px] text-red-600 justify-end">
 <XCircle size={10} /> Test: Başarısız
 </span>
 ) : (
 <span className="text-[10px] text-slate-400">Test: Kısmî</span>
 )
 ) : (
 <span className="text-[10px] text-slate-400">Test edilmedi</span>
 )}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* TAB: Tarihçe */}
 {tab === 'history' && (
 <div className="space-y-2">
 {histLoading ? (
 <div className="flex items-center justify-center h-40">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400" />
 </div>
 ) : (history ?? []).length === 0 ? (
 <div className="text-center py-12 text-slate-400 text-sm">Kriz tarihçesi bulunamadı.</div>
 ) : (history ?? []).map(ev => (
 <div key={ev.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
 <div className={clsx(
 'w-2 h-2 rounded-full shrink-0',
 ev.status === 'RESOLVED' ? 'bg-emerald-500' :
 ev.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-amber-500'
 )} />
 <div className="flex-1 min-w-0">
 <p className="text-xs font-semibold text-slate-700 truncate">{ev.title}</p>
 <p className="text-[10px] text-slate-400">
 {new Date(ev.activated_at).toLocaleString('tr-TR')}
 {ev.resolved_at && (
 <>
 <ArrowRight size={10} className="inline mx-1" />
 {new Date(ev.resolved_at).toLocaleString('tr-TR')}
 </>
 )}
 </p>
 </div>
 <span className={clsx(
 'text-[10px] font-bold px-2 py-0.5 rounded border shrink-0',
 ev.status === 'RESOLVED' ? 'bg-green-50 text-green-700 border-green-200' :
 'bg-amber-50 text-amber-700 border-amber-200'
 )}>{ev.status}</span>
 </div>
 ))}
 </div>
 )}
 </div>
 );
}
