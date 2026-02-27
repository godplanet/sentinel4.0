import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import type { AuditTask } from '@/features/audit-creation/types';
import { calculateFileHealth, type FileHealthResult } from '@/features/qaip/HealthEngine';

interface FileHealthCardProps {
  tasks: AuditTask[];
}

const ZONE_CONFIG = {
  GREEN: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'stroke-emerald-500', icon: ShieldCheck, label: 'Kalite Uygun' },
  YELLOW: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', ring: 'stroke-amber-500', icon: AlertTriangle, label: 'Iyilestirme Gerekli' },
  RED: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', ring: 'stroke-red-500', icon: XCircle, label: 'Kalite Yetersiz' },
} as const;

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function ProgressRing({ score, zone }: { score: number; zone: FileHealthResult['zone'] }) {
  const offset = CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE;
  const config = ZONE_CONFIG[zone];

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={RADIUS} fill="none" strokeWidth="6" className="stroke-slate-200" />
        <motion.circle
          cx="48" cy="48" r={RADIUS} fill="none" strokeWidth="6"
          strokeLinecap="round"
          className={config.ring}
          initial={{ strokeDashoffset: CIRCUMFERENCE }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeDasharray={CIRCUMFERENCE}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={clsx('text-xl font-bold', config.color)}>{score}</span>
        <span className="text-[9px] text-slate-400 font-medium">/100</span>
      </div>
    </div>
  );
}

function ComponentBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const barColor = score >= 85 ? 'bg-emerald-500' : score >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-slate-600 w-28 truncate">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <motion.div
          className={clsx('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-[10px] font-semibold text-slate-500 w-8 text-right">{score}</span>
      <span className="text-[9px] text-slate-400 w-6 text-right">x{weight}</span>
    </div>
  );
}

export function FileHealthCard({ tasks }: FileHealthCardProps) {
  const [expanded, setExpanded] = useState(false);
  const health = useMemo(() => calculateFileHealth(tasks), [tasks]);
  const config = ZONE_CONFIG[health.zone];
  const ZoneIcon = config.icon;

  return (
    <div className={clsx('border rounded-lg transition-all', config.border, config.bg)}>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 p-4"
      >
        <ProgressRing score={health.score} zone={health.zone} />

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 mb-1">
            <ZoneIcon size={14} className={config.color} />
            <span className={clsx('text-xs font-bold', config.color)}>{config.label}</span>
          </div>
          <h4 className="text-sm font-semibold text-slate-900">Dosya Saglik Skoru</h4>
          {health.qualityGaps.length > 0 && (
            <p className="text-[11px] text-slate-500 mt-1 truncate">
              {health.qualityGaps.length} kalite acigi tespit edildi
            </p>
          )}
        </div>

        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4 space-y-4"
        >
          <div className="space-y-2">
            <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">Bilesen Detay</h5>
            {health.components.map((c) => (
              <ComponentBar key={c.key} label={c.label} score={c.score} weight={c.weight} />
            ))}
          </div>

          {health.qualityGaps.length > 0 && (
            <div className="space-y-1.5">
              <h5 className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">En Onemli Kalite Aciklari</h5>
              {health.qualityGaps.map((gap) => (
                <div key={gap.key} className="flex items-start gap-2 text-[11px]">
                  <AlertTriangle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-700">{gap.label}:</span>{' '}
                    <span className="text-slate-500">{gap.gap}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!health.passesGate && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-100 border border-red-200 rounded-lg">
              <XCircle size={14} className="text-red-600 flex-shrink-0" />
              <p className="text-[11px] text-red-700 font-medium">
                Kalite Skoru Yetersiz: {health.score}. En az 85 olmali.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
