import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Clock, RotateCcw, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import type { SimulationScenario } from '@/entities/risk/api/scenario-api';

interface TimeTravelSliderProps {
  onProgressChange: (progress: number) => void;
  /** Opsiyonel: Supabase'den gelen stres testi senaryoları */
  scenarios?: SimulationScenario[];
  /** Anlık aktif senaryo (dışarıdan kontrol için) */
  activeScenario?: SimulationScenario | null;
}

const QUARTERS = [
  { label: 'Q1 2025', value: 0 },
  { label: 'Q2 2025', value: 0.25 },
  { label: 'Q3 2025', value: 0.5 },
  { label: 'Q4 2025', value: 0.75 },
  { label: 'Q1 2026', value: 1.0 },
];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LOW:      { bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200' },
  MEDIUM:   { bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200' },
  HIGH:     { bg: 'bg-orange-50',  text: 'text-orange-700', border: 'border-orange-200' },
  CRITICAL: { bg: 'bg-red-50',     text: 'text-red-700',    border: 'border-red-200' },
};

export function TimeTravelSlider({ onProgressChange, scenarios = [], activeScenario }: TimeTravelSliderProps) {
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
    <div className="bg-surface border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Başlık */}
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-blue-600" />
        <h4 className="text-sm font-bold text-slate-800">Zaman Yolculuğu</h4>
        <span className="ml-auto px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-md text-xs font-bold text-blue-700">
          {currentQuarter.label}
        </span>
      </div>

      {/* Slider İzi */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={progress}
          onChange={handleSliderChange}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        {/* Senaryo Marker İşaretçileri */}
        {scenarios.map((s) => {
          const pct = s.quarter_slot * 100;
          return (
            <div
              key={s.id}
              className="absolute top-[-6px] flex flex-col items-center pointer-events-none"
              style={{ left: `calc(${pct}% - 4px)` }}
            >
              <div className={clsx(
                'w-2.5 h-2.5 rounded-full border-2 shadow-sm',
                s.severity === 'CRITICAL' ? 'bg-red-500 border-red-700' :
                s.severity === 'HIGH'     ? 'bg-orange-500 border-orange-700' :
                s.severity === 'MEDIUM'   ? 'bg-amber-400 border-amber-600' :
                                            'bg-blue-400 border-blue-600'
              )} />
            </div>
          );
        })}

        {/* Çeyrek Etiketleri */}
        <div className="flex justify-between mt-2.5">
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

      {/* Aktif Senaryo Bandı */}
      {activeScenario && (
        <div className={clsx(
          'flex items-start gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium',
          SEVERITY_COLORS[activeScenario.severity]?.bg ?? 'bg-slate-50',
          SEVERITY_COLORS[activeScenario.severity]?.text ?? 'text-slate-700',
          SEVERITY_COLORS[activeScenario.severity]?.border ?? 'border-slate-200',
        )}>
          <AlertTriangle size={13} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-black tracking-wide uppercase text-[10px]">
              Aktif Stres Senaryosu
            </p>
            <p className="text-[11px] font-semibold mt-0.5 leading-snug">
              {activeScenario.title}
            </p>
          </div>
        </div>
      )}

      {/* Kontroller */}
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
          Sıfırla
        </button>
        <span className="ml-auto text-[10px] text-slate-400 font-mono">
          {(progress * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}
