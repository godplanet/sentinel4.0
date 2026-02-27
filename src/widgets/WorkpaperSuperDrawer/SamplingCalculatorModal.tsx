import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, Zap, Info } from 'lucide-react';
import clsx from 'clsx';
import type { RiskLevel, ConfidenceLevel, SamplingResult } from '@/entities/workpaper/model/detail-types';

interface SamplingCalculatorModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (result: SamplingResult) => void;
}

const RISK_OPTIONS: { value: RiskLevel; label: string; color: string; bg: string }[] = [
  { value: 'HIGH', label: 'Yuksek', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  { value: 'MEDIUM', label: 'Orta', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  { value: 'LOW', label: 'Dusuk', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
];

const CONFIDENCE_OPTIONS: { value: ConfidenceLevel; label: string }[] = [
  { value: 90, label: '%90' },
  { value: 95, label: '%95' },
];

const SAMPLING_TABLE: Record<RiskLevel, Record<ConfidenceLevel, { base: number; factor: number }>> = {
  HIGH: { 90: { base: 45, factor: 0.015 }, 95: { base: 60, factor: 0.02 } },
  MEDIUM: { 90: { base: 30, factor: 0.010 }, 95: { base: 40, factor: 0.013 } },
  LOW: { 90: { base: 15, factor: 0.005 }, 95: { base: 25, factor: 0.008 } },
};

function calculateSampleSize(population: number, risk: RiskLevel, confidence: ConfidenceLevel): number {
  const params = SAMPLING_TABLE[risk][confidence];
  const raw = params.base + Math.floor(population * params.factor);
  return Math.min(raw, population);
}

export function SamplingCalculatorModal({ open, onClose, onApply }: SamplingCalculatorModalProps) {
  const [population, setPopulation] = useState<string>('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('MEDIUM');
  const [confidence, setConfidence] = useState<ConfidenceLevel>(95);
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const pop = parseInt(population, 10);
    if (isNaN(pop) || pop <= 0) return;
    const size = calculateSampleSize(pop, riskLevel, confidence);
    setResult(size);
  };

  const handleApply = () => {
    if (result === null) return;
    onApply({
      populationSize: parseInt(population, 10),
      riskLevel,
      confidenceLevel: confidence,
      sampleSize: result,
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setPopulation('');
    setRiskLevel('MEDIUM');
    setConfidence(95);
    setResult(null);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[110]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[110] p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Calculator size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Orneklem Hesaplayici</h3>
                    <p className="text-[10px] text-white/60">Attribute Sampling</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={16} className="text-white/60" />
                </button>
              </div>

              <div className="px-6 py-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Populasyon Buyuklugu
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={population}
                    onChange={(e) => { setPopulation(e.target.value); setResult(null); }}
                    placeholder="orn. 5000"
                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Risk Seviyesi</label>
                  <div className="grid grid-cols-3 gap-2">
                    {RISK_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setRiskLevel(opt.value); setResult(null); }}
                        className={clsx(
                          'px-3 py-2.5 text-xs font-bold rounded-xl border-2 transition-all',
                          riskLevel === opt.value
                            ? `${opt.bg} ${opt.color} ring-2 ring-offset-1 ring-current`
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2">Guven Duzeyi</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONFIDENCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => { setConfidence(opt.value); setResult(null); }}
                        className={clsx(
                          'px-3 py-2.5 text-xs font-bold rounded-xl border-2 transition-all',
                          confidence === opt.value
                            ? 'bg-blue-50 border-blue-200 text-blue-700 ring-2 ring-offset-1 ring-blue-500'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={!population || parseInt(population, 10) <= 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 text-white text-sm font-bold rounded-xl hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Zap size={16} />
                  Hesapla
                </button>

                <AnimatePresence>
                  {result !== null && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                        <div className="text-center mb-3">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                            Hesaplanan Orneklem
                          </p>
                          <p className="text-4xl font-black text-emerald-800">{result}</p>
                          <p className="text-xs text-emerald-600 mt-1">
                            / {population} populasyondan
                          </p>
                        </div>

                        <div className="flex items-start gap-2 px-3 py-2 bg-emerald-100/50 rounded-lg mb-3">
                          <Info size={12} className="text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-emerald-700 leading-relaxed">
                            {riskLevel === 'HIGH' ? 'Yuksek' : riskLevel === 'MEDIUM' ? 'Orta' : 'Dusuk'} risk, %{confidence} guven duzeyi ile
                            attribute sampling yontemi kullanildi.
                          </p>
                        </div>

                        <button
                          onClick={handleApply}
                          className="w-full px-4 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                          Uygula
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
