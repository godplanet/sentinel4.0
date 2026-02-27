import { useMemo } from 'react';
import clsx from 'clsx';
import type { AssessmentWithDetails } from '@/entities/risk/heatmap-types';

interface ClassicGridProps {
  assessments: AssessmentWithDetails[];
  mode: 'inherent' | 'residual';
  onCellClick?: (key: string, risks: AssessmentWithDetails[]) => void;
  selectedCell?: string | null;
}

const CELL_COLORS: Record<number, string> = {
  1: 'bg-emerald-100',
  2: 'bg-emerald-100',
  3: 'bg-yellow-100',
  4: 'bg-yellow-100',
  5: 'bg-amber-100',
  6: 'bg-amber-200',
  8: 'bg-orange-200',
  9: 'bg-orange-200',
  10: 'bg-orange-300',
  12: 'bg-red-200',
  15: 'bg-red-300',
  16: 'bg-red-400',
  20: 'bg-red-500',
  25: 'bg-red-600',
};

function getCellColor(score: number): string {
  const keys = Object.keys(CELL_COLORS).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (score >= keys[i]) return CELL_COLORS[keys[i]];
  }
  return 'bg-slate-50';
}

export function ClassicGrid({ assessments, mode, onCellClick, selectedCell }: ClassicGridProps) {
  const cellMap = useMemo(() => {
    const map: Record<string, AssessmentWithDetails[]> = {};
    for (const a of assessments) {
      const imp = a.impact;
      const lik = a.likelihood;
      const residualImp = Math.max(1, Math.round(imp * (1 - a.control_effectiveness)));
      const residualLik = Math.max(1, Math.round(lik * (1 - a.control_effectiveness)));
      const mImp = mode === 'inherent' ? imp : residualImp;
      const mLik = mode === 'inherent' ? lik : residualLik;
      const key = `${mImp}-${mLik}`;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [assessments, mode]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-400 -rotate-90 whitespace-nowrap">ETKI</span>
      <div className="flex-1">
        <div className="grid grid-cols-6 gap-px bg-slate-200 rounded-lg overflow-hidden">
          <div className="bg-slate-50" />
          {[1, 2, 3, 4, 5].map(x => (
            <div key={x} className="bg-slate-50 p-2 text-center">
              <span className="text-xs font-bold text-slate-500">{x}</span>
            </div>
          ))}

          {[5, 4, 3, 2, 1].map(y => (
            <div key={`row-${y}`} className="contents">
              <div className="bg-slate-50 p-2 flex items-center justify-center">
                <span className="text-xs font-bold text-slate-500">{y}</span>
              </div>
              {[1, 2, 3, 4, 5].map(x => {
                const key = `${x}-${y}`;
                const score = x * y;
                const risksInCell = cellMap[key] || [];
                const isSelected = selectedCell === key;

                return (
                  <div
                    key={key}
                    onClick={() => onCellClick?.(key, risksInCell)}
                    className={clsx(
                      'relative p-1 min-h-[60px] flex items-center justify-center cursor-pointer transition-all hover:brightness-95',
                      getCellColor(score),
                      isSelected && 'ring-3 ring-slate-800 ring-inset z-10 scale-105'
                    )}
                  >
                    {risksInCell.length > 0 ? (
                      <div className={clsx(
                        'w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shadow-md transition-transform',
                        score >= 15 ? 'bg-red-700' : score >= 10 ? 'bg-orange-600' : score >= 5 ? 'bg-yellow-600' : 'bg-emerald-600',
                        isSelected && 'scale-110'
                      )}>
                        {risksInCell.length}
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">{score}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">OLASILIK</span>
        </div>
      </div>
    </div>
  );
}
