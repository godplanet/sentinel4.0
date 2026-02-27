import { useMethodologyStore } from '../model/store';
import { Gauge, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';

export const MethodologySettings = () => {
  const { gradingScale, gradeThresholds, setGradingScale, updateThreshold } = useMethodologyStore();

  const SCALES = [
    { id: '4-POINT', label: '4\'lü Skala (1-4)', desc: 'Geleneksel İç Denetim standardı.' },
    { id: '5-POINT', label: '5\'li Skala (1-5)', desc: 'Risk yönetimi ile uyumlu.' },
    { id: 'PERCENTAGE', label: 'Yüzdelik (%0-100)', desc: 'Hassas puanlama için.' },
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      <div className="glass-panel p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
            <Gauge size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Derecelendirme Skalası</h3>
            <p className="text-xs text-slate-500">Denetim sonuçlarının nasıl puanlanacağını seçin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCALES.map((scale) => (
            <button
              key={scale.id}
              onClick={() => setGradingScale(scale.id)}
              className={clsx(
                "relative p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.02]",
                gradingScale === scale.id
                  ? "border-purple-600 bg-purple-50/50"
                  : "border-slate-100 bg-white hover:border-purple-200"
              )}
            >
              {gradingScale === scale.id && (
                <div className="absolute top-3 right-3 text-purple-600">
                  <CheckCircle2 size={18} />
                </div>
              )}
              <div className="font-bold text-slate-900">{scale.label}</div>
              <div className="text-xs text-slate-500 mt-1">{scale.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl">
        <h3 className="font-bold text-lg text-slate-800 mb-6">Not Aralıkları (Thresholds)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-100">
            <label className="text-xs font-bold text-emerald-700 uppercase">A (Mükemmel)</label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-slate-500">&gt;</span>
              <input
                type="number" step="0.1"
                value={gradeThresholds.A}
                onChange={(e) => updateThreshold('A', parseFloat(e.target.value))}
                className="w-full bg-white border-emerald-200 rounded px-2 py-1 text-emerald-900 font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
            <label className="text-xs font-bold text-blue-700 uppercase">B (Yeterli)</label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-slate-500">&gt;</span>
              <input
                type="number" step="0.1"
                value={gradeThresholds.B}
                onChange={(e) => updateThreshold('B', parseFloat(e.target.value))}
                className="w-full bg-white border-blue-200 rounded px-2 py-1 text-blue-900 font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-100">
            <label className="text-xs font-bold text-yellow-700 uppercase">C (Gelişime Açık)</label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-slate-500">&gt;</span>
              <input
                type="number" step="0.1"
                value={gradeThresholds.C}
                onChange={(e) => updateThreshold('C', parseFloat(e.target.value))}
                className="w-full bg-white border-yellow-200 rounded px-2 py-1 text-yellow-900 font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 opacity-60 grayscale">
            <label className="text-xs font-bold text-rose-700 uppercase">D (Yetersiz)</label>
            <div className="mt-2 text-xs text-rose-900 font-mono">
              Kalan Aralık
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
