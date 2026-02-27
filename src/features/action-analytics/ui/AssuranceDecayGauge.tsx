import { useMemo } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import type { ActionAgingMetrics } from '@/entities/action/model/types';

const CX         = 120;
const CY         = 112;
const R          = 88;
const TOTAL_ARC  = Math.PI * R;
const CAP_PCT    = 0.60;

function toRad(deg: number) { return (deg * Math.PI) / 180; }

function ptOnArc(pct: number, radius = R) {
  const angleDeg = 180 - pct * 180;
  const rad = toRad(angleDeg);
  return {
    x: CX + radius * Math.cos(rad),
    y: CY - radius * Math.sin(rad),
  };
}

function scoreToColor(s: number, breach: boolean): string {
  if (breach && s >= 60) return '#700000';
  if (s >= 75) return '#28a745';
  if (s >= 50) return '#ff960a';
  return '#eb0000';
}

function computeScore(actions: ActionAgingMetrics[]): number {
  if (actions.length === 0) return 100;
  const n      = actions.length;
  const closed = actions.filter((a) => a.status === 'closed').length;
  const t4     = actions.filter((a) => a.aging_tier === 'TIER_4_BDDK_RED_ZONE').length;
  const t3     = actions.filter((a) => a.aging_tier === 'TIER_3_CRITICAL').length;
  const raw    = (closed / n) * 100 + (1 - t4 / n) * 40 + (1 - t3 / n) * 20 - 60;
  return Math.round(Math.max(0, Math.min(100, raw)));
}

interface Props {
  actions:    ActionAgingMetrics[];
  unitLabel?: string;
}

export function AssuranceDecayGauge({ actions, unitLabel = 'Tüm Birimler' }: Props) {
  const score      = useMemo(() => computeScore(actions), [actions]);
  const hasBreach  = actions.some((a) => a.is_bddk_breach);
  const effective  = hasBreach ? Math.min(score, 60) : score;
  const decay      = 100 - effective;

  const fillColor  = scoreToColor(effective, hasBreach);
  const scoreArc   = (effective / 100) * TOTAL_ARC;
  const decayArc   = (decay / 100) * TOTAL_ARC;

  const capInner   = ptOnArc(CAP_PCT, R - 13);
  const capOuter   = ptOnArc(CAP_PCT, R + 13);
  const needle     = ptOnArc(effective / 100);

  const trackPath  = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

  const counts = useMemo(() => ({
    open:    actions.filter((a) => a.status !== 'closed').length,
    crit:    actions.filter((a) => ['TIER_3_CRITICAL','TIER_4_BDDK_RED_ZONE'].includes(a.aging_tier)).length,
    bddk:    actions.filter((a) => a.is_bddk_breach).length,
  }), [actions]);

  return (
    <div className="flex flex-col items-center h-full">
      <div className="text-center mb-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Güvence Bütünlüğü
        </p>
        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{unitLabel}</p>
      </div>

      <svg viewBox="0 0 240 138" className="w-full max-w-[280px]">
        <defs>
          <filter id="adg-glow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <path d={trackPath} fill="none" stroke="#f1f5f9" strokeWidth={18} strokeLinecap="round" />

        {decay > 2 && (
          <path
            d={trackPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={18}
            strokeLinecap="round"
            strokeDasharray={`${decayArc} ${TOTAL_ARC}`}
            strokeDashoffset={-scoreArc}
            opacity={0.55}
          />
        )}

        <motion.path
          d={trackPath}
          fill="none"
          stroke={fillColor}
          strokeWidth={18}
          strokeLinecap="round"
          filter="url(#adg-glow)"
          initial={{ strokeDasharray: `0 ${TOTAL_ARC}` }}
          animate={{ strokeDasharray: `${scoreArc} ${TOTAL_ARC}` }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        />

        {hasBreach && (
          <>
            <line
              x1={capInner.x} y1={capInner.y}
              x2={capOuter.x} y2={capOuter.y}
              stroke="#700000" strokeWidth={3} strokeLinecap="round"
            />
            <text
              x={capOuter.x + (capOuter.x > CX ? 5 : -5)}
              y={capOuter.y - 3}
              fontSize={8}
              fontFamily="Inter,sans-serif"
              fontWeight={800}
              fill="#700000"
              textAnchor={capOuter.x > CX ? 'start' : 'end'}
            >
              60 TAVAN
            </text>
          </>
        )}

        <motion.circle
          cx={needle.x} cy={needle.y} r={5.5}
          fill="white" stroke={fillColor} strokeWidth={2.5}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        />

        <text x={CX} y={CY + 2} textAnchor="middle" fontSize={30} fontWeight={900} fontFamily="Inter,sans-serif" fill={fillColor}>
          {effective}
        </text>
        <text x={CX} y={CY + 16} textAnchor="middle" fontSize={9} fontFamily="Inter,sans-serif" fill="#94a3b8">
          / 100 puan
        </text>
        <text x={CX - R + 2} y={CY + 18} fontSize={8} fill="#94a3b8" fontFamily="Inter,sans-serif">0</text>
        <text x={CX + R - 2} y={CY + 18} fontSize={8} fill="#94a3b8" fontFamily="Inter,sans-serif" textAnchor="end">100</text>
      </svg>

      <div className="w-full mt-auto space-y-2.5 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Güvence Bozunması</span>
          <span className={clsx(
            'font-black',
            decay > 40 ? 'text-rose-600' : decay > 20 ? 'text-amber-600' : 'text-emerald-600',
          )}>
            -{decay}%
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: decay > 40 ? '#eb0000' : decay > 20 ? '#ff960a' : '#28a745' }}
            initial={{ width: 0 }}
            animate={{ width: `${decay}%` }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
        </div>

        {hasBreach && (
          <div className="flex items-center gap-2 p-2.5 bg-[#700000]/5 border border-[#700000]/20 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-[#700000] animate-pulse shrink-0" />
            <p className="text-[10px] font-bold text-[#700000]">BDDK İhlali — Tavan: 60 puan</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Açık',   val: counts.open, color: 'text-slate-700' },
            { label: 'Kritik', val: counts.crit, color: 'text-rose-600'  },
            { label: 'BDDK',   val: counts.bddk, color: 'text-[#700000]' },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center p-2 bg-slate-50 rounded-lg border border-slate-100">
              <p className={clsx('text-sm font-black', color)}>{val}</p>
              <p className="text-[9px] text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
