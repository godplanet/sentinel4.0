import clsx from 'clsx';
import type { DeductionStep, CappingResult } from '@/features/grading-engine/types';

interface Props {
  baseScore: number;
  waterfall: DeductionStep[];
  capping: CappingResult;
  finalScore: number;
}

// Rule: Severity colors matching SENTINEL v4.0 taxonomy
const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#800000', // Maroon/Bordo
  Kritik: '#800000',
  High: '#dc2626', // Red
  Yuksek: '#dc2626',
  Yüksek: '#dc2626',
  Medium: '#f97316', // Orange
  Orta: '#f97316',
  Low: '#eab308', // Yellow
  Dusuk: '#eab308',
  Düşük: '#eab308',
};

export function WaterfallChart({ baseScore, waterfall, capping, finalScore }: Props) {
  const maxWidth = baseScore;

  const barWidth = (value: number) =>
    `${Math.max(1, (value / maxWidth) * 100)}%`;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 px-1">
        <div className="w-20 text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Baslangic</span>
        </div>
        <div className="flex-1 relative h-8">
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-emerald-500 flex items-center justify-end pr-2"
            style={{ width: barWidth(baseScore) }}
          >
            <span className="text-xs font-black text-white tabular-nums">{baseScore}</span>
          </div>
        </div>
      </div>

      {waterfall.map((step, idx) => (
        <WaterfallRow key={idx} step={step} maxWidth={maxWidth} />
      ))}

      {capping.triggered && capping.cappedFrom !== null && capping.cappedTo !== null && (
        <div className="flex items-center gap-3 px-1">
          <div className="w-20 text-right">
            <span className="text-[10px] font-bold text-red-600 uppercase">Sinir</span>
          </div>
          <div className="flex-1 relative h-8">
            <div
              className="absolute inset-y-0 left-0 rounded-md bg-slate-200"
              style={{ width: barWidth(capping.cappedFrom) }}
            />
            <div
              className="absolute inset-y-0 left-0 rounded-md flex items-center justify-end pr-2"
              style={{
                width: barWidth(capping.cappedTo),
                background: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 4px, #dc2626 4px, #dc2626 8px)',
              }}
            >
              <span className="text-xs font-black text-white tabular-nums">{capping.cappedTo}</span>
            </div>
            <div
              className="absolute inset-y-0 rounded-md bg-red-200/50 border border-dashed border-red-300"
              style={{
                left: barWidth(capping.cappedTo),
                width: `${((capping.cappedFrom - capping.cappedTo) / maxWidth) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="border-t border-slate-200 pt-2 mt-1">
        <div className="flex items-center gap-3 px-1">
          <div className="w-20 text-right">
            <span className="text-[10px] font-bold text-slate-700 uppercase">Sonuc</span>
          </div>
          <div className="flex-1 relative h-10">
            <div
              className="absolute inset-y-0 left-0 rounded-lg flex items-center justify-end pr-3 shadow-sm"
              style={{
                width: barWidth(finalScore),
                background: finalScore >= 80 ? '#059669' : finalScore >= 60 ? '#f97316' : '#dc2626',
              }}
            >
              <span className="text-sm font-black text-white tabular-nums">{finalScore}</span>
            </div>
          </div>
        </div>
      </div>

      {capping.triggered && capping.reason && (
        <div className="bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-1">
          <p className="text-[11px] font-bold text-red-700">{capping.reason}</p>
        </div>
      )}
    </div>
  );
}

function WaterfallRow({ step, maxWidth }: { step: DeductionStep; maxWidth: number }) {
  const color = SEVERITY_COLORS[step.severity] ?? '#64748b';
  const deductionWidth = `${Math.max(1, (step.totalDeduction / maxWidth) * 100)}%`;
  const remainingWidth = `${Math.max(1, (step.runningScore / maxWidth) * 100)}%`;

  return (
    <div className="flex items-center gap-3 px-1">
      <div className="w-20 text-right space-y-0">
        <span className="text-[10px] font-bold block" style={{ color }}>
          {step.severity}
        </span>
        <span className="text-[9px] text-slate-400 block">
          {step.count} x {step.pointsEach}
        </span>
      </div>
      <div className="flex-1 relative h-8">
        <div
          className="absolute inset-y-0 left-0 rounded-md flex items-center justify-end pr-2"
          style={{ width: remainingWidth, backgroundColor: '#e2e8f0' }}
        >
          <span className="text-[10px] font-bold text-slate-500 tabular-nums">{step.runningScore}</span>
        </div>
        <div
          className={clsx(
            'absolute inset-y-0 rounded-md opacity-70 flex items-center justify-center',
          )}
          style={{
            left: remainingWidth,
            width: deductionWidth,
            backgroundColor: color,
          }}
        >
          <span className="text-[9px] font-black text-white tabular-nums">-{step.totalDeduction}</span>
        </div>
      </div>
    </div>
  );
}
