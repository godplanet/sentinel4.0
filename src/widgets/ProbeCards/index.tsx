import { motion } from 'framer-motion';
import {
  Database, Globe, Webhook, Play, Pause, ShieldAlert, Shield, ShieldCheck,
  Clock, AlertTriangle, CheckCircle2, XCircle, Loader2, MoreVertical,
} from 'lucide-react';
import clsx from 'clsx';
import type { ProbeWithStats, ProbeCategory, ProbeSeverity, ProbeStatus } from '@/entities/probe/model/types';

interface ProbeCardsProps {
  probes: ProbeWithStats[];
  runningIds: Set<string>;
  onRun: (probe: ProbeWithStats) => void;
  onToggle: (probe: ProbeWithStats) => void;
  onEdit: (probe: ProbeWithStats) => void;
  onDelete: (id: string) => void;
}

const QUERY_ICONS = { SQL: Database, API: Globe, WEBHOOK: Webhook };

const CATEGORY_CONFIG: Record<ProbeCategory, { label: string; color: string; bg: string; border: string }> = {
  FRAUD: { label: 'Fraud', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  OPS: { label: 'Ops', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  COMPLIANCE: { label: 'Compliance', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-200' },
};

const SEVERITY_CONFIG: Record<ProbeSeverity, { icon: typeof ShieldAlert; color: string; bg: string }> = {
  HIGH: { icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-100' },
  MEDIUM: { icon: Shield, color: 'text-amber-600', bg: 'bg-amber-100' },
  LOW: { icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

const STATUS_COLORS: Record<string, string> = {
  PASS: 'bg-emerald-500',
  FAIL: 'bg-red-500',
  ERROR: 'bg-amber-500',
  RUNNING: 'bg-blue-500',
};

function StatusDot({ status, isActive }: { status?: ProbeStatus; isActive: boolean }) {
  if (!isActive) return <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />;

  const color = STATUS_COLORS[status || 'PASS'] || 'bg-emerald-500';
  const isAlert = status === 'FAIL' || status === 'ERROR';

  return (
    <motion.div
      animate={isAlert ? {
        scale: [1, 1.4, 1],
        opacity: [1, 0.6, 1],
      } : {
        scale: [1, 1.15, 1],
      }}
      transition={{ duration: isAlert ? 0.8 : 2, repeat: Infinity, ease: 'easeInOut' }}
      className={clsx('w-2.5 h-2.5 rounded-full', color)}
    />
  );
}

export function ProbeCards({ probes, runningIds, onRun, onToggle, onEdit, onDelete }: ProbeCardsProps) {
  if (probes.length === 0) {
    return (
      <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
        <Database className="mx-auto text-slate-300 mb-3" size={40} />
        <h3 className="text-lg font-bold text-slate-700 mb-1">Henuz Probe Yok</h3>
        <p className="text-sm text-slate-500">Wizard ile ilk probe'unuzu olusturun</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {probes.map((probe, i) => {
        const QIcon = QUERY_ICONS[probe.query_type];
        const cat = CATEGORY_CONFIG[probe.category];
        const sev = SEVERITY_CONFIG[probe.severity];
        const SevIcon = sev.icon;
        const isRunning = runningIds.has(probe.id);
        const hasRecentAnomaly = probe.stats?.last_anomaly_at &&
          new Date(probe.stats.last_anomaly_at) > new Date(Date.now() - 24 * 3600000);

        return (
          <motion.div
            key={probe.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={clsx(
              'bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden group',
              hasRecentAnomaly ? 'border-red-200' : 'border-slate-200'
            )}
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    probe.is_active
                      ? hasRecentAnomaly ? 'bg-red-100' : 'bg-emerald-100'
                      : 'bg-slate-100'
                  )}>
                    <QIcon size={20} className={clsx(
                      probe.is_active
                        ? hasRecentAnomaly ? 'text-red-600' : 'text-emerald-600'
                        : 'text-slate-400'
                    )} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{probe.title}</h4>
                      <StatusDot status={probe.last_result_status} isActive={probe.is_active} />
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={clsx(
                        'text-[9px] font-bold px-1.5 py-0.5 rounded-md border',
                        cat.bg, cat.color, cat.border
                      )}>
                        {cat.label}
                      </span>
                      <span className={clsx(
                        'inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md',
                        sev.bg, sev.color
                      )}>
                        <SevIcon size={9} />
                        {probe.severity}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => onEdit(probe)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <MoreVertical size={16} className="text-slate-400" />
                </button>
              </div>

              {probe.description && (
                <p className="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">{probe.description}</p>
              )}

              {probe.stats && probe.stats.total_runs > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3 bg-slate-50 rounded-xl p-2.5">
                  <div className="text-center">
                    <p className="text-lg font-black text-slate-900">{probe.stats.total_runs}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Calisma</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-red-600">{probe.stats.anomaly_runs}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Anomali</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-black text-amber-600">{probe.stats.anomaly_rate.toFixed(0)}%</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Oran</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3">
                <Clock size={12} />
                <span className="font-mono">{probe.schedule_cron || 'Manuel'}</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{probe.query_type}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggle(probe)}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors',
                    probe.is_active
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {probe.is_active ? <Pause size={12} /> : <Play size={12} />}
                  {probe.is_active ? 'Aktif' : 'Pasif'}
                </button>

                <button
                  onClick={() => onRun(probe)}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  {isRunning ? 'Calisiyor' : 'Calistir'}
                </button>

                <button
                  onClick={() => onDelete(probe.id)}
                  className="ml-auto p-1.5 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                >
                  <XCircle size={14} className="text-red-400 hover:text-red-600" />
                </button>
              </div>
            </div>

            {hasRecentAnomaly && (
              <div className="bg-red-50 border-t border-red-200 px-5 py-2 flex items-center gap-2">
                <AlertTriangle size={12} className="text-red-500" />
                <span className="text-[11px] font-bold text-red-700">Son 24 saatte anomali tespit edildi</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
