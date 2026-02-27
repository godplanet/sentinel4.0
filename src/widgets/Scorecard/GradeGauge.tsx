import { useMemo } from 'react';

interface Props {
  score: number;
  grade: string;
  opinion: string;
  capped: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  'A+': '#059669', A: '#10b981',
  'B+': '#3b82f6', B: '#60a5fa',
  'C+': '#f59e0b', C: '#f97316', 'C-': '#ea580c',
  D: '#dc2626', E: '#991b1b', F: '#450a0a',
};

export function GradeGauge({ score, grade, opinion, capped }: Props) {
  const color = GRADE_COLORS[grade] ?? '#64748b';

  const { circumference, dashOffset, rotation } = useMemo(() => {
    const radius = 80;
    const c = 2 * Math.PI * radius;
    const arcLength = c * 0.75;
    const filled = arcLength * (score / 100);
    return {
      circumference: c,
      dashOffset: arcLength - filled,
      rotation: 135,
    };
  }, [score]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-52 h-52">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            transform={`rotate(${rotation} 100 100)`}
          />
          <circle
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(${rotation} 100 100)`}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-slate-800 tabular-nums">{score}</span>
          <span
            className="text-2xl font-black mt--1"
            style={{ color }}
          >
            {grade}
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs font-bold text-slate-600">{opinion}</p>
        {capped && (
          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
            SINIRLANDIRILDI
          </span>
        )}
      </div>
    </div>
  );
}
