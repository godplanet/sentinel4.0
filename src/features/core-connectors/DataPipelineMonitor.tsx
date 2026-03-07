/**
 * DataPipelineMonitor — Bireysel Pipeline Detay & Geçmiş Loglar
 * features/core-connectors/DataPipelineMonitor.tsx (Wave 44)
 *
 * C-Level, Apple Glassmorphism, %100 Light Mode
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, Clock,
  Loader2, RefreshCw, Database, ArrowUpDown,
} from 'lucide-react';
import { useSyncLogs, type ExternalPipeline, type SyncLog } from './api';

// ─── Durum Konfigürasyonu ─────────────────────────────────────────────────────

const STATUS_CFG: Record<SyncLog['status'], {
  label: string; icon: React.ElementType; bg: string; text: string; border: string;
}> = {
  SUCCESS:   { label: 'Başarılı',   icon: CheckCircle2,   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  RUNNING:   { label: 'Çalışıyor', icon: Loader2,         bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  FAILED:    { label: 'Başarısız',  icon: XCircle,        bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  PARTIAL:   { label: 'Kısmi',      icon: AlertTriangle,  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  CANCELLED: { label: 'İptal',      icon: XCircle,        bg: 'bg-slate-50',   text: 'text-slate-500',   border: 'border-slate-200' },
};

function formatDuration(ms: number | null): string {
  if (!ms) return '—';
  // Sıfıra bölünme koruması gerekmez, sadece null guard
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.round(ms / 60000)}dk`;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'Az önce';
  if (diff < 3600000) return `${Math.round(diff / 60000)} dk önce`;
  if (diff < 86400000) return `${Math.round(diff / 3600000)} saat önce`;
  return `${Math.round(diff / 86400000)} gün önce`;
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

interface DataPipelineMonitorProps {
  pipeline: ExternalPipeline;
  onClose?: () => void;
}

export function DataPipelineMonitor({ pipeline, onClose }: DataPipelineMonitorProps) {
  const { data: logs = [], isLoading } = useSyncLogs(pipeline.id, 15);

  const successRate = (() => {
    const total = logs.length;                  // Sıfıra bölünme → || 1
    const success = logs.filter((l) => l.status === 'SUCCESS').length;
    return Math.round((success / (total || 1)) * 100);
  })();

  const avgDurationMs = (() => {
    const timed = logs.filter((l) => l.duration_ms != null);
    const sum = timed.reduce((s, l) => s + (l.duration_ms || 0), 0);
    return sum / (timed.length || 1);           // Sıfıra bölünme koruması
  })();

  return (
    <div className="bg-white/80 backdrop-blur-lg border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
      {/* Başlık */}
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Database size={18} className="text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">{pipeline.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono font-bold text-slate-400">{pipeline.pipeline_code}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">
                  {pipeline.system_source}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">
                  {pipeline.sync_type}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-2xl font-black text-slate-800">{successRate}%</p>
            <p className="text-[9px] text-slate-400 uppercase font-bold">Başarı Oranı</p>
          </div>
        </div>

        {/* Metrik Bant */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: 'Son Kayıt', value: pipeline.record_count.toLocaleString('tr-TR') },
            { label: 'Ort. Süre', value: formatDuration(Math.round(avgDurationMs)) },
            { label: 'Çalıştırma', value: `${logs.length} adet` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/70 rounded-xl border border-slate-200 px-3 py-2 text-center">
              <p className="text-sm font-black text-slate-700">{value}</p>
              <p className="text-[9px] text-slate-400 font-bold uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Log Listesi */}
      <div className="p-4 max-h-80 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} className="text-slate-400" />
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Son Çalıştırmalar</p>
          {isLoading && <Loader2 size={12} className="animate-spin text-slate-400 ml-auto" />}
        </div>

        {logs.length === 0 && !isLoading ? (
          <p className="text-sm text-slate-400 text-center py-8">Henüz log kaydı yok.</p>
        ) : (
          <div className="space-y-2">
            {(logs || []).map((log, i) => {
              const cfg = STATUS_CFG[log.status] ?? STATUS_CFG.CANCELLED;
              const Icon = cfg.icon;
              const isRunning = log.status === 'RUNNING';

              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}
                >
                  <Icon
                    size={14}
                    className={`shrink-0 ${cfg.text} ${isRunning ? 'animate-spin' : ''}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase ${cfg.text}`}>{cfg.label}</span>
                      <span className="text-[10px] text-slate-400">
                        {log.records_written.toLocaleString('tr-TR')} kayıt
                      </span>
                      {log.records_failed > 0 && (
                        <span className="text-[10px] font-bold text-red-600">
                          {log.records_failed} hata
                        </span>
                      )}
                    </div>
                    {log.error_detail && (
                      <p className="text-[10px] text-red-600 mt-0.5 line-clamp-1">{log.error_detail}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-mono text-slate-500">
                      {formatDuration(log.duration_ms)}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {formatRelative(log.started_at)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
