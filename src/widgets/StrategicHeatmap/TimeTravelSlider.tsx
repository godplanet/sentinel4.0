import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Clock, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

interface TimeTravelSliderProps {
  onProgressChange: (progress: number) => void;
}

const QUARTERS = [
  { label: 'Q1 2025', value: 0 },
  { label: 'Q2 2025', value: 0.25 },
  { label: 'Q3 2025', value: 0.5 },
  { label: 'Q4 2025', value: 0.75 },
  { label: 'Q1 2026', value: 1.0 },
];

export function TimeTravelSlider({ onProgressChange }: TimeTravelSliderProps) {
  const [progress, setProgress] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<number>();

  useEffect(() => {
    if (!isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let start: number | null = null;
    const duration = 3000;
    const startVal = 0;

    const animate = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = t < 0.5
        ? 2 * t * t
        : -1 + (4 - 2 * t) * t;

      const val = startVal + eased * (1 - startVal);
      setProgress(val);
      onProgressChange(val);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
      }
    };

    setProgress(0);
    onProgressChange(0);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, onProgressChange]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    onProgressChange(val);
    setIsPlaying(false);
  };

  const handleReset = () => {
    setProgress(1.0);
    onProgressChange(1.0);
    setIsPlaying(false);
  };

  const currentQuarter = QUARTERS.reduce((prev, curr) =>
    Math.abs(curr.value - progress) < Math.abs(prev.value - progress) ? curr : prev
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Clock size={16} className="text-blue-600" />
        <h4 className="text-sm font-bold text-slate-800">Zaman Yolculugu</h4>
        <span className="ml-auto px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-bold text-blue-700">
          {currentQuarter.label}
        </span>
      </div>

      <div className="relative mb-3">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-1.5">
          {QUARTERS.map(q => (
            <button
              key={q.label}
              onClick={() => {
                setProgress(q.value);
                onProgressChange(q.value);
                setIsPlaying(false);
              }}
              className={clsx(
                'text-[9px] font-bold transition-colors',
                Math.abs(q.value - progress) < 0.06
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            isPlaying
              ? 'bg-red-50 text-red-600 border border-red-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          {isPlaying ? 'Durdur' : 'Oynat'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
        >
          <RotateCcw size={12} />
          Sifirla
        </button>
      </div>
    </div>
  );
}
