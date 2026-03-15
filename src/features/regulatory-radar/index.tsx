/**
 * RegulatoryRadar — Tam Sayfa Regülasyon Radarı
 * features/regulatory-radar/index.tsx (Wave 47)
 *
 * C-Level · %100 Light Mode · Apple Glassmorphism
 * Gerçek Supabase verisi – Sıfır mock
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
 AlertTriangle, CheckCircle2,
 ChevronRight,
 Clock,
 Globe,
 Loader2,
 ScanLine,
 Target, TrendingDown,
 X,
 Zap
} from 'lucide-react';
import { useState } from 'react';
import {
 useAllImpactAlerts,
 useImpactAnalysis,
 useRadarSignals,
 useRadarSummary, useUpdateAlertStatus,
 type PolicyImpactAlert,
 type RegulatoryBulletin,
} from './api/radar';

// ─── Sabitler ─────────────────────────────────────────────────────────────────

const IMPACT_CFG = {
 CRITICAL: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', bar: 'bg-red-500', dot: 'bg-red-500', label: 'Kritik' },
 HIGH: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', bar: 'bg-orange-500', dot: 'bg-orange-500', label: 'Yüksek' },
 MEDIUM: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', bar: 'bg-amber-500', dot: 'bg-amber-500', label: 'Orta' },
 LOW: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', bar: 'bg-slate-400', dot: 'bg-slate-400', label: 'Düşük' },
} as const;

const ALERT_STATUS_CFG = {
 OPEN: { label: 'Açık', bg: 'bg-red-100 text-red-700 border-red-200' },
 IN_PROGRESS: { label: 'Devam Ediyor', bg: 'bg-blue-100 text-blue-700 border-blue-200' },
 RESOLVED: { label: 'Çözüldü', bg: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
 ACCEPTED: { label: 'Kabul Edildi', bg: 'bg-slate-100 text-slate-600 border-slate-200' },
} as const;

const AUTHORITY_COLORS: Record<string, string> = {
 BDDK: 'bg-blue-100 text-blue-700',
 MASAK: 'bg-red-100 text-red-700',
 FATF: 'bg-purple-100 text-purple-700',
 SPK: 'bg-teal-100 text-teal-700',
 KVKK: 'bg-amber-100 text-amber-700',
 EBA: 'bg-indigo-100 text-indigo-700',
};

function authorityClass(a: string) {
 return AUTHORITY_COLORS[a] ?? 'bg-slate-100 text-slate-600';
}

function daysUntil(dateStr: string | null) {
 if (!dateStr) return '—';
 const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
 if (days < 0) return 'Geçti';
 if (days === 0) return 'Bugün';
 return `${days} gün`;
}

// ─── Etki Uyarısı Satırı ─────────────────────────────────────────────────────

function ImpactAlertRow({ alert }: { alert: PolicyImpactAlert }) {
 const updateStatus = useUpdateAlertStatus();
 const cfg = IMPACT_CFG[alert.priority] ?? IMPACT_CFG.LOW;
 const statusCfg = ALERT_STATUS_CFG[alert.status] ?? ALERT_STATUS_CFG.OPEN;

 return (
 <div className={`rounded-xl border p-4 space-y-2 ${cfg.bg} ${cfg.border}`}>
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap mb-0.5">
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${statusCfg.bg}`}>
 {statusCfg.label}
 </span>
 <span className="text-[9px] font-bold text-slate-500 font-mono">{alert.internal_policy_ref}</span>
 </div>
 <p className="text-xs font-semibold text-slate-800">{alert.department}</p>
 <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">{alert.impact_description}</p>
 </div>

 {alert.action_deadline && (
 <div className="text-right shrink-0">
 <p className="text-sm font-black text-slate-700">{daysUntil(alert.action_deadline)}</p>
 <p className="text-[9px] text-slate-400">son tarih</p>
 </div>
 )}
 </div>

 {/* Tamamlanma Barı */}
 <div>
 <div className="flex items-center justify-between text-[9px] text-slate-500 mb-1">
 <span>Tamamlanma</span>
 <span className="font-bold">{alert.completion_pct}%</span>
 </div>
 <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${alert.completion_pct}%` }}
 transition={{ duration: 0.7, ease: 'easeOut' }}
 className={`h-full rounded-full ${cfg.bar}`}
 />
 </div>
 </div>

 {/* Aksiyon Düğmeleri */}
 {alert.status !== 'RESOLVED' && (
 <div className="flex items-center gap-2 pt-1">
 <button
 onClick={() => updateStatus.mutate({ id: alert.id, status: 'IN_PROGRESS' })}
 disabled={alert.status === 'IN_PROGRESS' || updateStatus.isPending}
 className="text-[9px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-40 transition-colors"
 >
 Devam Ediyor
 </button>
 <button
 onClick={() => updateStatus.mutate({ id: alert.id, status: 'RESOLVED', completion_pct: 100 })}
 disabled={updateStatus.isPending}
 className="text-[9px] font-bold px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-40 transition-colors"
 >
 Çözüldü
 </button>

 {alert.assigned_to && (
 <span className="ml-auto text-[9px] text-slate-400 font-mono">{alert.assigned_to}</span>
 )}
 </div>
 )}
 </div>
 );
}

// ─── Bülten Detay Paneli ──────────────────────────────────────────────────────

function BulletinDetailPanel({
 bulletin,
 onClose,
}: {
 bulletin: RegulatoryBulletin;
 onClose: () => void;
}) {
 const { data: impacts = [], isLoading } = useImpactAnalysis(bulletin.id);
 const cfg = IMPACT_CFG[bulletin.impact_level] ?? IMPACT_CFG.LOW;

 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4"
 onClick={onClose}
 >
 <motion.div
 initial={{ scale: 0.96, y: 16 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.96, y: 16 }}
 onClick={(e) => e.stopPropagation()}
 className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/90 backdrop-blur-lg rounded-2xl border border-slate-200 shadow-2xl"
 >
 {/* Modal Başlık */}
 <div className={`px-4 py-5 border-b border-slate-200 ${cfg.bg}`}>
 <div className="flex items-start justify-between gap-3">
 <div>
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className={`text-[9px] font-black px-2 py-0.5 rounded ${authorityClass(bulletin.source_authority)}`}>
 {bulletin.source_authority}
 </span>
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${cfg.text} ${cfg.bg} border ${cfg.border}`}>
 {cfg.label}
 </span>
 <span className="text-[9px] font-mono text-slate-400">{bulletin.bulletin_code}</span>
 </div>
 <h2 className="text-base font-bold text-slate-800 leading-snug">{bulletin.title}</h2>
 </div>
 <button
 onClick={onClose}
 className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors shrink-0"
 >
 <X size={16} />
 </button>
 </div>
 </div>

 <div className="p-4 space-y-5">
 {/* Özet */}
 {bulletin.summary && (
 <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border border-slate-200">
 {bulletin.summary}
 </div>
 )}

 {/* Tarih Bilgileri */}
 <div className="grid grid-cols-3 gap-3">
 {[
 { label: 'Yayım', value: bulletin.published_at ?? '—' },
 { label: 'Yürürlük', value: bulletin.effective_date ? daysUntil(bulletin.effective_date) : '—' },
 { label: 'Yorum Son', value: bulletin.comment_deadline ? daysUntil(bulletin.comment_deadline) : '—' },
 ].map(({ label, value }) => (
 <div key={label} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
 <p className="text-sm font-black text-slate-700">{value}</p>
 <p className="text-[9px] text-slate-400 font-bold uppercase">{label}</p>
 </div>
 ))}
 </div>

 {/* Etiketler */}
 {(bulletin.tags || []).length > 0 && (
 <div className="flex flex-wrap gap-1.5">
 {(bulletin.tags || []).map((tag) => (
 <span key={tag} className="text-[9px] px-2 py-1 bg-slate-100 text-slate-600 rounded-lg font-mono border border-slate-200">
 {tag}
 </span>
 ))}
 </div>
 )}

 {/* Politika Etki Uyarıları */}
 <div>
 <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
 <Target size={14} />
 İç Politika Etki Analizi
 {isLoading && <Loader2 size={12} className="animate-spin text-slate-400" />}
 </h3>

 {(impacts || []).length === 0 && !isLoading ? (
 <p className="text-xs text-slate-400 text-center py-4">
 Bu bülten için henüz etki analizi kaydı oluşturulmamış.
 </p>
 ) : (
 <div className="space-y-3">
 {(impacts || []).map((alert) => (
 <ImpactAlertRow key={alert.id} alert={alert} />
 ))}
 </div>
 )}
 </div>
 </div>
 </motion.div>
 </motion.div>
 );
}

// ─── Ana Sayfa Bileşeni ───────────────────────────────────────────────────────

export function RegulatoryRadar() {
 const [selectedBulletin, setSelectedBulletin] = useState<RegulatoryBulletin | null>(null);
 const [filterImpact, setFilterImpact] = useState<string>('ALL');

 const { data: signals = [], isLoading } = useRadarSignals();
 const { data: kpi } = useRadarSummary();
 const { data: openAlerts = [] } = useAllImpactAlerts('OPEN');

 const filtered = (signals || []).filter(
 (s) => filterImpact === 'ALL' || s.impact_level === filterImpact
 );

 return (
 <div className="h-full flex flex-col bg-slate-50/50">
 {/* Başlık */}
 <div className="px-4 pt-4 pb-5 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm">
 <div className="flex items-center gap-3 mb-5">
 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
 <ScanLine size={20} className="text-white" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-800 tracking-tight">Regulatory Radar</h1>
 <p className="text-xs text-slate-500 mt-0.5">Regülasyon Ufkunu Tara · Politika Etki Analizi · Wave 47</p>
 </div>
 </div>

 {/* KPI Kartlar */}
 <div className="grid grid-cols-4 gap-3">
 {[
 { label: 'Toplam Sinyal', value: kpi?.totalSignals ?? '—', icon: Globe, color: 'text-slate-700' },
 { label: 'Kritik Mevzuat', value: kpi?.criticalCount ?? '—', icon: AlertTriangle, color: 'text-red-600' },
 { label: 'Açık Uyarı', value: kpi?.openAlerts ?? '—', icon: Zap, color: 'text-amber-600' },
 { label: 'Ort. Tamamlanma', value: kpi?.avgCompletionPct !== undefined ? `%${kpi.avgCompletionPct}` : '—', icon: TrendingDown, color: 'text-emerald-600' },
 ].map(({ label, value, icon: Icon, color }) => (
 <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center">
 <Icon size={16} className={`${color} mx-auto mb-1`} />
 <p className="text-lg font-black text-slate-800">{value}</p>
 <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">{label}</p>
 </div>
 ))}
 </div>
 </div>

 {/* İçerik — Sol: Sinyal Listesi, Sağ: Açık Uyarılar */}
 <div className="flex-1 overflow-hidden flex gap-0">
 {/* Sol Panel — Bültenler */}
 <div className="flex-1 overflow-y-auto p-4">
 {/* Filtreler */}
 <div className="flex items-center gap-2 mb-5 flex-wrap">
 {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((level) => {
 const cfg = level === 'ALL'
 ? { label: 'Tümü', active: 'bg-slate-800 text-white', inactive: 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400' }
 : { label: IMPACT_CFG[level as keyof typeof IMPACT_CFG]?.label ?? level, active: 'bg-slate-800 text-white', inactive: 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400' };
 return (
 <button
 key={level}
 onClick={() => setFilterImpact(level)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
 filterImpact === level ? cfg.active : cfg.inactive
 }`}
 >
 {cfg.label}
 </button>
 );
 })}
 </div>

 {isLoading ? (
 <div className="flex items-center justify-center py-20">
 <Loader2 size={24} className="animate-spin text-slate-400" />
 <span className="ml-2 text-sm text-slate-500">Radar taranıyor…</span>
 </div>
 ) : (
 <div className="space-y-3">
 {(filtered || []).map((bulletin, i) => {
 const cfg = IMPACT_CFG[bulletin.impact_level] ?? IMPACT_CFG.LOW;
 const isUrgent = bulletin.impact_level === 'CRITICAL' || bulletin.impact_level === 'HIGH';

 return (
 <motion.div
 key={bulletin.id}
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: i * 0.05 }}
 onClick={() => setSelectedBulletin(bulletin)}
 className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer
 bg-white/70 hover:bg-white/90 hover:shadow-md transition-all border-slate-200`}
 >
 {/* Sol indicator */}
 <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
 <div className="relative">
 <div className={`w-3 h-3 rounded-full ${cfg.dot}`} />
 {isUrgent && (
 <div className={`absolute inset-0 rounded-full ${cfg.dot} opacity-30 animate-ping`} />
 )}
 </div>
 <div className={`w-0.5 h-8 rounded-full ${cfg.bar} opacity-20`} />
 </div>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${authorityClass(bulletin.source_authority)}`}>
 {bulletin.source_authority}
 </span>
 <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${cfg.text} ${cfg.bg} border ${cfg.border}`}>
 {cfg.label}
 </span>
 <span className="text-[9px] text-slate-400 font-mono">{bulletin.bulletin_code}</span>
 </div>

 <p className="text-sm font-bold text-slate-800 leading-snug mb-1.5">
 {bulletin.title}
 </p>

 {bulletin.summary && (
 <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
 {bulletin.summary}
 </p>
 )}

 <div className="flex items-center gap-3 mt-2 flex-wrap">
 {bulletin.effective_date && (
 <div className="flex items-center gap-1 text-[9px] text-slate-500">
 <Clock size={9} />
 <span>Yürürlük: {daysUntil(bulletin.effective_date)}</span>
 </div>
 )}
 {(bulletin.tags || []).slice(0, 3).map((tag) => (
 <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-slate-100 rounded font-mono text-slate-500 border border-slate-200">
 {tag}
 </span>
 ))}
 </div>
 </div>

 <ChevronRight size={14} className="text-slate-300 mt-2 shrink-0" />
 </motion.div>
 );
 })}

 {filtered.length === 0 && !isLoading && (
 <div className="text-center py-16">
 <Globe size={40} className="text-slate-300 mx-auto mb-3" />
 <p className="text-sm font-semibold text-slate-500">Seçilen filtreyle sinyal bulunamadı.</p>
 </div>
 )}
 </div>
 )}
 </div>

 {/* Sağ Panel — Açık Uyarılar */}
 <div className="w-80 shrink-0 border-l border-slate-200 bg-white/60 backdrop-blur overflow-y-auto p-5">
 <div className="flex items-center gap-2 mb-4">
 <AlertTriangle size={14} className="text-red-500" />
 <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Aksiyon Bekleyen Uyarılar</p>
 {openAlerts.length > 0 && (
 <span className="ml-auto px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full text-[9px] font-black">
 {openAlerts.length}
 </span>
 )}
 </div>

 <div className="space-y-3">
 {(openAlerts || []).length === 0 ? (
 <div className="text-center py-10">
 <CheckCircle2 size={28} className="text-emerald-400 mx-auto mb-2" />
 <p className="text-xs text-slate-500 font-semibold">Açık uyarı yok.</p>
 </div>
 ) : (
 (openAlerts || []).map((alert) => (
 <ImpactAlertRow key={alert.id} alert={alert} />
 ))
 )}
 </div>
 </div>
 </div>

 {/* Bülten Detay Modal */}
 <AnimatePresence>
 {selectedBulletin && (
 <BulletinDetailPanel
 bulletin={selectedBulletin}
 onClose={() => setSelectedBulletin(null)}
 />
 )}
 </AnimatePresence>
 </div>
 );
}
