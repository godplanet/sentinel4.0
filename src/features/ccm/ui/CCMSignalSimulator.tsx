import { usePlanningStore } from '@/entities/planning/model/store';
import { Activity, AlertTriangle, Radio, Zap } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const SIGNALS = [
 {
 id: 'teverruk-kci',
 label: 'Dijital Teverruk KCI İhlali Simüle Et',
 description: 'Şer\'i uyumsuzluk gecikmesi — Hız: Aşırı',
 color: 'red',
 engagement: {
 id: `ccm-trigger-${Date.now()}`,
 universeNodeId: 'node-teverruk-ccm',
 universeNodeName: 'Dijital Teverruk Şer\'i Uyumluluk (Gecikme Sorunu)',
 cascadeRisk: 95,
 requiredSkills: ['Şer\'i Denetim', 'API Adli Analiz', 'AAOIFI'],
 addedAt: new Date().toISOString(),
 baseRisk: 95,
 velocity: 'HIGH' as const,
 shariah: true,
 esg: false,
 isCCMTriggered: true,
 },
 toastMsg: 'KCI eşiği aşıldı (Şer\'i risk — Hız: Aşırı). 9 aylık iş listesinin başına otomatik eklendi.',
 },
 {
 id: 'fx-var-kri',
 label: 'FX VaR KRI İhlali Simüle Et',
 description: 'FX oynaklığı 3-sigma eşiğini aşıyor',
 color: 'amber',
 engagement: {
 id: `ccm-trigger-fx-${Date.now()}`,
 universeNodeId: 'node-fx-var-ccm',
 universeNodeName: 'FX VaR İhlali — 3-Sigma Eşiği Aşıldı',
 cascadeRisk: 88,
 requiredSkills: ['Piyasa Riski', 'VaR Modelleme', 'BDDK'],
 addedAt: new Date().toISOString(),
 baseRisk: 88,
 velocity: 'HIGH' as const,
 shariah: false,
 esg: false,
 isCCMTriggered: true,
 },
 toastMsg: 'KRI eşiği aşıldı (FX VaR — 3-Sigma). 9 aylık iş listesinin başına otomatik eklendi.',
 },
];

export function CCMSignalSimulator() {
 const injectCCMTrigger = usePlanningStore((s) => s.injectCCMTrigger);
 const [firedIds, setFiredIds] = useState<Set<string>>(new Set());

 const handleFire = (signal: typeof SIGNALS[0]) => {
 const freshEngagement = {
 ...signal.engagement,
 id: `ccm-trigger-${crypto.randomUUID()}`,
 addedAt: new Date().toISOString(),
 };
 injectCCMTrigger(freshEngagement);
 setFiredIds((prev) => new Set(prev).add(signal.id));
 toast.error(signal.toastMsg, { duration: 6000, icon: '🚨' });
 setTimeout(() => {
 setFiredIds((prev) => {
 const next = new Set(prev);
 next.delete(signal.id);
 return next;
 });
 }, 3000);
 };

 return (
 <div className="bg-surface border border-slate-200 shadow-sm rounded-xl p-4">
 <div className="flex items-center gap-3 mb-5">
 <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
 <Radio size={16} className="text-white" />
 </div>
 <div>
 <h3 className="text-sm font-bold text-slate-800">Canlı Risk Sinyalleri (CCM)</h3>
 <p className="text-xs text-slate-500">Otomatik eklemeyi test etmek için KCI/KRI eşik ihlallerini simüle edin</p>
 </div>
 <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
 <span className="text-xs font-semibold text-emerald-700">Canlı</span>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {(SIGNALS || []).map((signal) => {
 const fired = firedIds.has(signal.id);
 const isRed = signal.color === 'red';

 return (
 <button
 key={signal.id}
 onClick={() => handleFire(signal)}
 disabled={fired}
 className={[
 'flex items-start gap-3 p-3.5 rounded-lg border text-left transition-all duration-150',
 isRed
 ? fired
 ? 'bg-red-50 border-red-200 opacity-60 cursor-not-allowed'
 : 'bg-surface border-slate-200 hover:bg-red-50 hover:border-red-300 hover:shadow-sm'
 : fired
 ? 'bg-amber-50 border-amber-200 opacity-60 cursor-not-allowed'
 : 'bg-surface border-slate-200 hover:bg-amber-50 hover:border-amber-300 hover:shadow-sm',
 ].join(' ')}
 >
 <div className={[
 'mt-0.5 w-7 h-7 rounded-md flex items-center justify-center shrink-0',
 isRed ? 'bg-red-100' : 'bg-amber-100',
 ].join(' ')}>
 {fired
 ? <Activity size={13} className={isRed ? 'text-red-500 animate-pulse' : 'text-amber-500 animate-pulse'} />
 : <AlertTriangle size={13} className={isRed ? 'text-red-500' : 'text-amber-500'} />
 }
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-semibold text-slate-800 leading-snug">
 {fired ? 'İş listesine eklendi' : signal.label}
 </p>
 <p className="text-xs text-slate-500 mt-0.5 leading-snug">{signal.description}</p>
 </div>
 {!fired && (
 <Zap size={12} className={isRed ? 'text-red-400 shrink-0 mt-1' : 'text-amber-400 shrink-0 mt-1'} />
 )}
 </button>
 );
 })}
 </div>
 </div>
 );
}
