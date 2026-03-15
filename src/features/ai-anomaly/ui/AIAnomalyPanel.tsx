import { useCCMAlerts, type CCMAlert } from '@/features/ai-anomaly/api/useCCMAlerts';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Eye, Loader2, Sparkles, TrendingUp, Wrench, Zap } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface AIAnomalyPanelProps {
 onCreateProbe?: (suggestion: AISuggestion) => void;
}

export interface AISuggestion {
 id: string;
 title: string;
 description: string;
 pattern: string;
 confidence: number;
 severity: 'HIGH' | 'MEDIUM' | 'LOW';
 suggestedQuery: string;
 detectedCount: number;
}

function alertToSuggestion(alert: CCMAlert): AISuggestion {
 return {
 id: alert.id,
 title: alert.alert_title,
 description: alert.alert_description,
 pattern: alert.rule_id || 'CCM Kuralı',
 confidence: alert.ai_confidence_score,
 severity: (alert.severity === 'CRITICAL' ? 'HIGH' : alert.severity) as 'HIGH' | 'MEDIUM' | 'LOW',
 suggestedQuery: '',
 detectedCount: 0,
 };
}

export function AIAnomalyPanel({ onCreateProbe }: AIAnomalyPanelProps) {
 const [expandedId, setExpandedId] = useState<string | null>(null);
 const [createdIds, setCreatedIds] = useState<Set<string>>(new Set());
 const [resolvedId, setResolvedId] = useState<string | null>(null);

 const { alerts, isLoading, refetch, resolveAnomaly, isResolving } = useCCMAlerts();

 const handleResolve = async (e: React.MouseEvent, alertId: string) => {
 e.stopPropagation();
 try {
 await resolveAnomaly({ alertId });
 setResolvedId(alertId);
 toast.success('Anomali Kapatıldı');
 setTimeout(() => setResolvedId(null), 3000);
 } catch {
 toast.error('Anomali kapatılamadı.');
 }
 };

 const handleCreate = (alert: CCMAlert) => {
 const suggestion = alertToSuggestion(alert);
 onCreateProbe?.(suggestion);
 setCreatedIds((prev) => new Set(prev).add(alert.id));
 };

 const severityColor = (severity: string) => {
 if (severity === 'CRITICAL' || severity === 'HIGH')
 return 'border-red-500/30 bg-red-500/5';
 if (severity === 'MEDIUM') return 'border-amber-500/30 bg-amber-500/5';
 return 'border-blue-500/30 bg-blue-500/5';
 };

 const severityIcon = (severity: string) => {
 if (severity === 'CRITICAL' || severity === 'HIGH') return 'text-red-400';
 if (severity === 'MEDIUM') return 'text-amber-400';
 return 'text-blue-400';
 };

 return (
 <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
 <div className="p-4">
 <div className="flex items-center justify-between mb-5">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-blue-500/20 border border-blue-500/30 rounded-xl">
 <Sparkles size={20} className="text-blue-400" />
 </div>
 <div>
 <h3 className="text-base font-bold text-white">Sentinel AI Anomali Tarama</h3>
 <p className="text-xs text-slate-400 mt-0.5">Yapay zeka islem akisini analiz eder ve supheli desenleri tespit eder</p>
 </div>
 </div>

 <button
 onClick={() => refetch()}
 disabled={isLoading}
 className={clsx(
 'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
 isLoading
 ? 'bg-blue-500/20 text-blue-300 cursor-not-allowed'
 : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/20'
 )}
 >
 {isLoading ? (
 <>
 <Loader2 size={16} className="animate-spin" />
 Yukleniyor...
 </>
 ) : (
 <>
 <Sparkles size={16} />
 Listeyi Yenile
 </>
 )}
 </button>
 </div>

 <AnimatePresence>
 {isLoading && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="mb-4"
 >
 <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
 <div className="flex items-center gap-3">
 <Loader2 size={20} className="text-blue-400 animate-spin" />
 <p className="text-sm font-bold text-blue-300">Uyarilar yukleniyor...</p>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {!isLoading && alerts.length > 0 && (
 <div className="space-y-3">
 <div className="flex items-center gap-2 mb-1">
 <CheckCircle2 size={14} className="text-emerald-400" />
 <span className="text-xs font-bold text-emerald-400">
 {alerts.length} acik anomali
 </span>
 </div>

 {(alerts || []).map((alert, i) => {
 const isExpanded = expandedId === alert.id;
 const isCreated = createdIds.has(alert.id);
 const justResolved = resolvedId === alert.id;

 return (
 <motion.div
 key={alert.id}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 className={clsx('border rounded-xl overflow-hidden transition-all', severityColor(alert.severity))}
 >
 <div
 onClick={() => setExpandedId(isExpanded ? null : alert.id)}
 className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <AlertTriangle size={14} className={severityIcon(alert.severity)} />
 <h4 className="text-sm font-bold text-white">{alert.alert_title}</h4>
 </div>
 <p className="text-xs text-slate-400 leading-relaxed">{alert.alert_description}</p>
 </div>
 <div className="shrink-0 flex items-center gap-2">
 <div className="text-right">
 <div className="flex items-center gap-1">
 <TrendingUp size={11} className="text-blue-400" />
 <span className="text-xs font-black text-white">{alert.ai_confidence_score}%</span>
 </div>
 <p className="text-[9px] text-slate-500">Risk</p>
 </div>
 </div>
 </div>
 </div>

 <AnimatePresence>
 {isExpanded && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: 'auto', opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 className="overflow-hidden"
 >
 <div className="px-4 pb-4 space-y-3">
 {alert.rule_id && (
 <div className="bg-slate-900/80 rounded-lg p-3">
 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Kural</p>
 <p className="text-xs text-emerald-400 font-mono">{alert.rule_id}</p>
 </div>
 )}
 <div className="flex items-center gap-2 flex-wrap">
 {justResolved ? (
 <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/30">
 <CheckCircle2 size={14} />
 Anomali Kapatildi
 </div>
 ) : (
 <button
 type="button"
 onClick={(e) => handleResolve(e, alert.id)}
 disabled={isResolving}
 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg text-xs font-bold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50"
 >
 <Wrench size={14} />
 Oto-Onarim Baslat
 </button>
 )}
 {onCreateProbe && (
 isCreated ? (
 <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">
 <CheckCircle2 size={14} />
 Probe Olusturuldu
 </div>
 ) : (
 <button
 type="button"
 onClick={(e) => { e.stopPropagation(); handleCreate(alert); }}
 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-xs font-bold hover:from-blue-700 hover:to-cyan-700 transition-all"
 >
 <Zap size={14} />
 Bu Monitor'u Olustur
 </button>
 )
 )}
 <button
 type="button"
 className="flex items-center gap-2 px-4 py-2 bg-white/5 text-slate-400 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors"
 >
 <Eye size={14} />
 Detay
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
 })}
 </div>
 )}

 {!isLoading && alerts.length === 0 && (
 <div className="text-center py-5">
 <motion.div
 animate={{ y: [0, -5, 0] }}
 transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
 className="inline-block"
 >
 <div className="w-16 h-16 mx-auto bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
 <Sparkles size={28} className="text-blue-400" />
 </div>
 </motion.div>
 <p className="text-sm font-medium text-slate-400">Acik anomali yok</p>
 <p className="text-xs text-slate-500 mt-1">CCM kurallari tetiklendiginde uyarilar burada listelenir</p>
 </div>
 )}
 </div>
 </div>
 );
}
