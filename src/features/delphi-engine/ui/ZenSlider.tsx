import { useRef, useCallback } from 'react';

interface ZenSliderProps {
  label: string;
  subLabel?: string;
  value: number;
  onChange: (value: number) => void;
}

const SCALE_LABELS: Record<number, string> = {
  1: 'Çok Düşük',
  2: 'Düşük',
  3: 'Orta',
  4: 'Yüksek',
  5: 'Aşırı',
};

const VALUE_COLORS: Record<number, string> = {
  1: 'bg-emerald-400',
  2: 'bg-teal-400',
  3: 'bg-amber-400',
  4: 'bg-orange-400',
  5: 'bg-red-400',
};

const VALUE_TEXT_COLORS: Record<number, string> = {
  1: 'text-emerald-600',
  2: 'text-teal-600',
  3: 'text-amber-600',
  4: 'text-orange-600',
  5: 'text-red-600',
};

export function ZenSlider({ label, subLabel, value, onChange }: ZenSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const getValueFromEvent = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track) return value;
      const rect = track.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return Math.round(pct * 4) + 1;
    },
    [value]
  );

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onChange(getValueFromEvent(e.clientX));
  };

  const fillPct = ((value - 1) / 4) * 100;

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-700">{label}</span>
          {subLabel && (
            <span className="ml-2 text-xs text-slate-400">{subLabel}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${VALUE_TEXT_COLORS[value]}`}>
            {SCALE_LABELS[value]}
          </span>
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
            {value}
          </span>
        </div>
      </div>

      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative h-1.5 rounded-full bg-slate-200 cursor-pointer group"
        role="slider"
        aria-valuemin={1}
        aria-valuemax={5}
        aria-valuenow={value}
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-200 ${VALUE_COLORS[value]}`}
          style={{ width: `${fillPct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white shadow-md border border-slate-200 transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg"
          style={{ left: `${fillPct}%` }}
        />
      </div>

      <div className="flex justify-between px-0.5">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`text-[10px] font-medium transition-colors ${
              n === value
                ? `${VALUE_TEXT_COLORS[n]} font-bold`
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
