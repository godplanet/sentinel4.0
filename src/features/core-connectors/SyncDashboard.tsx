/**
 * SyncDashboard — Core Banking API Connectors Ana Paneli
 * features/core-connectors/SyncDashboard.tsx (Wave 44)
 *
 * C-Level ciddiyetinde, Apple Glassmorphism, %100 Light Mode
 * Gerçek Supabase verisi · Sıfır sahte data
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
 Activity,
 AlertTriangle,
 CheckCircle2,
 ChevronRight,
 Clock,
 Database,
 Loader2,
 Pause,
 Play,
 Server,
 Wifi, WifiOff,
 XCircle
} from 'lucide-react';
import React, { useState } from 'react';
import {
 usePipelines, usePipelineSummary, useSyncLogs,
 useTogglePipeline,
 useTriggerSync,
 type ExternalPipeline,
} from './api';
import { DataPipelineMonitor } from './DataPipelineMonitor';

// ─── Yardımcılar ──────────────────────────────────────────────────────────────

const SOURCE_COLORS: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
 CORE_BANKING: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Database },
 SWIFT: { bg: 'bg-purple-100', text: 'text-purple-700', icon: Server },
 MIS: { bg: 'bg-teal-100', text: 'text-teal-700', icon: Activity },
 COMPLIANCE_SYSTEM: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertTriangle },
};

function getSourceCfg(source: string) {
 return SOURCE_COLORS[source] ?? { bg: 'bg-slate-100', text: 'text-slate-600', icon: Database };
}

function lastSyncLabel(iso: string | null): string {
 if (!iso) return 'Hiç çalışmadı';
 const diff = Date.now() - new Date(iso).getTime();
 if (diff < 60000) return 'Az önce';
 if (diff < 3600000) return `${Math.round(diff / 60000)} dk önce`;
 if (diff < 86400000) return `${Math.round(diff / 3600000)} saat önce`;
 return `${Math.round(diff / 86400000)} gün önce`;
}

// ─── Pipeline Kart Bileşeni ───────────────────────────────────────────────────

function PipelineCard({
 pipeline,
 onSelect,
}: {
 pipeline: ExternalPipeline;
 onSelect: (p: ExternalPipeline) => void;
}) {
 const triggerSync = useTriggerSync();
 const togglePipeline = useTogglePipeline();
 const cfg = getSourceCfg(pipeline.system_source);
 const Icon = cfg.icon;

 const isSyncing = triggerSync.isPending;
 const hasError = !!pipeline.last_error_at;

 return (
 <motion.div
 initial={{ opacity: 0, y: 8 }}
 animate={{ opacity: 1, y: 0 }}
 className={`bg-white/70 backdrop-blur border rounded-2xl shadow-sm overflow-hidden transition-shadow hover:shadow-md ${
 !pipeline.is_active ? 'opacity-60' : ''
 }`}
 style={{ borderColor: hasError ? '#fca5a5' : '#e2e8f0' }}
 >
 {/* Kart Başlığı */}
 <div
 className="px-5 py-4 cursor-pointer"
 onClick={() => onSelect(pipeline)}
 >
 <div className="flex items-start justify-between gap-3 mb-3">
 <div className="flex items-start gap-3">
 <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
 <Icon size={16} className={cfg.text} />
 </div>
 <div className="min-w-0">
 <p className="font-bold text-slate-800 text-sm truncate">{pipeline.name}</p>
 <p className="text-[10px] font-mono text-slate-400 mt-0.5">{pipeline.pipeline_code}</p>
 </div>
 </div>

 {/* Durum Badgei */}
 <div className="flex items-center gap-1.5 shrink-0">
 {pipeline.is_active ? (
 hasError ? (
 <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-[9px] font-black border border-red-200">
 <XCircle size={9} /> Hata
 </span>
 ) : (
 <span className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black border border-emerald-200">
 <Wifi size={9} /> Aktif
 </span>
 )
 ) : (
 <span className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 rounded-full text-[9px] font-black border border-slate-200">
 <WifiOff size={9} /> Pasif
 </span>
 )}
 <ChevronRight size={14} className="text-slate-300" />
 </div>
 </div>

 {/* Kayıt sayısı ve son sync */}
 <div className="flex items-center justify-between text-[10px] text-slate-500">
 <div className="flex items-center gap-1">
 <Activity size={10} />
 <span>{pipeline.record_count.toLocaleString('tr-TR')} kayıt</span>
 </div>
 <div className="flex items-center gap-1">
 <Clock size={10} />
 <span>{lastSyncLabel(pipeline.last_success_at)}</span>
 </div>
 </div>

 {/* Format + Auth Badge satırı */}
 <div className="flex items-center gap-1.5 mt-2">
 {[pipeline.data_format, pipeline.auth_type, pipeline.sync_type].map((tag) => (
 <span
 key={tag}
 className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold font-mono"
 >
 {tag}
 </span>
 ))}
 </div>
 </div>

 {/* Aksiyon Çubuğu */}
 <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-200 flex items-center gap-2">
 <button
 onClick={(e) => {
 e.stopPropagation();
 triggerSync.mutate(pipeline);
 }}
 disabled={!pipeline.is_active || isSyncing}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
 >
 {isSyncing ? (
 <Loader2 size={10} className="animate-spin" />
 ) : (
 <Play size={10} />
 )}
 {isSyncing ? 'Çalışıyor…' : 'Manuel Sync'}
 </button>

 <button
 onClick={(e) => {
 e.stopPropagation();
 togglePipeline.mutate({ id: pipeline.id, is_active: !pipeline.is_active });
 }}
 disabled={togglePipeline.isPending}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-300 disabled:opacity-50 transition-colors"
 >
 {pipeline.is_active ? <Pause size={10} /> : <Play size={10} />}
 {pipeline.is_active ? 'Duraklat' : 'Etkinleştir'}
 </button>

 <div className="ml-auto">
 {pipeline.schedule_cron && (
 <span className="text-[9px] font-mono text-slate-400">{pipeline.schedule_cron}</span>
 )}
 </div>
 </div>
 </motion.div>
 );
}

// ─── Ana SyncDashboard Bileşeni ───────────────────────────────────────────────

export function SyncDashboard() {
 const [selectedPipeline, setSelectedPipeline] = useState<ExternalPipeline | null>(null);
 const [filterSource, setFilterSource] = useState<string>('ALL');

 const { data: pipelines = [], isLoading } = usePipelines();
 const { data: summary } = usePipelineSummary();
 const { data: recentLogs = [] } = useSyncLogs(null, 10);

 // Kaynak listesini dinamik oluştur
 const sources = ['ALL', ...Array.from(new Set((pipelines || []).map((p) => p.system_source)))];

 const filtered = (pipelines || []).filter(
 (p) => filterSource === 'ALL' || p.system_source === filterSource
 );

 return (
 <div className="h-full flex flex-col bg-slate-50/50">
 {/* Üst Başlık */}
 <div className="px-6 pt-6 pb-5 bg-white/70 backdrop-blur-lg border-b border-slate-200 shadow-sm">
 <div className="flex items-center gap-3 mb-5">
 <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
 <Server size={20} className="text-white" />
 </div>
 <div>
 <h1 className="text-xl font-black text-slate-800 tracking-tight">
 Core Banking Entegrasyon Merkezi
 </h1>
 <p className="text-xs text-slate-500 mt-0.5">
 Dış sistemlerle anlık veri senkronizasyon izleme · Wave 44
 </p>
 </div>
 </div>

 {/* Özet Metrikler */}
 <div className="grid grid-cols-5 gap-3">
 {[
 { label: 'Toplam Pipeline', value: summary?.total ?? '—', icon: Database, color: 'text-slate-700' },
 { label: 'Aktif', value: summary?.active ?? '—', icon: Wifi, color: 'text-emerald-600' },
 { label: 'Pasif', value: summary?.inactive ?? '—', icon: WifiOff, color: 'text-slate-400' },
 { label: 'Başarılı (24s)', value: summary?.successLast24h ?? '—', icon: CheckCircle2, color: 'text-emerald-600' },
 { label: 'Başarısız (24s)', value: summary?.failedLast24h ?? '—', icon: XCircle, color: 'text-red-600' },
 ].map(({ label, value, icon: Icon, color }) => (
 <div key={label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-center">
 <Icon size={16} className={`${color} mx-auto mb-1`} />
 <p className="text-lg font-black text-slate-800">{value}</p>
 <p className="text-[9px] text-slate-400 font-bold uppercase leading-tight">{label}</p>
 </div>
 ))}
 </div>
 </div>

 {/* İçerik */}
 <div className="flex-1 overflow-hidden flex gap-0">
 {/* Sol: Pipeline Listesi */}
 <div className="flex-1 overflow-y-auto p-6">
 {/* Kaynak Filtreleri */}
 <div className="flex items-center gap-2 mb-5 flex-wrap">
 {(sources || []).map((src) => (
 <button
 key={src}
 onClick={() => setFilterSource(src)}
 className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
 filterSource === src
 ? 'bg-blue-600 text-white shadow-sm'
 : 'bg-white/70 text-slate-600 border border-slate-200 hover:border-blue-300'
 }`}
 >
 {src === 'ALL' ? 'Tümü' : src}
 </button>
 ))}
 </div>

 {isLoading ? (
 <div className="flex items-center justify-center py-20">
 <Loader2 size={24} className="animate-spin text-slate-400" />
 <span className="ml-2 text-sm text-slate-500">Pipeline verileri yükleniyor…</span>
 </div>
 ) : filtered.length === 0 ? (
 <div className="text-center py-16">
 <Database size={40} className="text-slate-300 mx-auto mb-3" />
 <p className="text-sm font-semibold text-slate-500">Pipeline bulunamadı.</p>
 </div>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {(filtered || []).map((pipeline) => (
 <PipelineCard
 key={pipeline.id}
 pipeline={pipeline}
 onSelect={setSelectedPipeline}
 />
 ))}
 </div>
 )}
 </div>

 {/* Sağ: Son Aktivite Şeridi */}
 <div className="w-72 shrink-0 border-l border-slate-200 bg-white/60 backdrop-blur overflow-y-auto p-4">
 <div className="flex items-center gap-2 mb-4">
 <Activity size={14} className="text-slate-400" />
 <p className="text-xs font-black text-slate-600 uppercase tracking-wider">Son Aktivite</p>
 </div>

 <div className="space-y-2">
 {(recentLogs || []).length === 0 ? (
 <p className="text-xs text-slate-400 text-center py-5">Henüz aktivite yok.</p>
 ) : (
 (recentLogs || []).map((log) => {
 const isOk = log.status === 'SUCCESS';
 const isFail = log.status === 'FAILED';
 return (
 <div
 key={log.id}
 className={`flex items-start gap-2 p-2.5 rounded-xl border text-[10px] ${
 isOk ? 'bg-emerald-50 border-emerald-200' :
 isFail ? 'bg-red-50 border-red-200' :
 'bg-amber-50 border-amber-200'
 }`}
 >
 {isOk
 ? <CheckCircle2 size={12} className="text-emerald-600 mt-0.5 shrink-0" />
 : isFail
 ? <XCircle size={12} className="text-red-600 mt-0.5 shrink-0" />
 : <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
 }
 <div className="min-w-0">
 <p className="font-bold text-slate-700 font-mono">{log.pipeline_code}</p>
 <p className="text-slate-500 mt-0.5">
 {log.records_written.toLocaleString('tr-TR')} kayıt
 </p>
 </div>
 </div>
 );
 })
 )}
 </div>
 </div>
 </div>

 {/* Pipeline Detay Modal */}
 <AnimatePresence>
 {selectedPipeline && (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-6"
 onClick={() => setSelectedPipeline(null)}
 >
 <motion.div
 initial={{ scale: 0.95, y: 20 }}
 animate={{ scale: 1, y: 0 }}
 exit={{ scale: 0.95, y: 20 }}
 onClick={(e) => e.stopPropagation()}
 className="w-full max-w-2xl"
 >
 <DataPipelineMonitor
 pipeline={selectedPipeline}
 onClose={() => setSelectedPipeline(null)}
 />
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
