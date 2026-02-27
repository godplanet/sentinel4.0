import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, AlertTriangle } from 'lucide-react';
import { computeHybridScore } from '@/features/risk-constitution/useRiskConstitution';
import type { Dimension, VetoRule, RiskRange, ScoreInput } from '@/features/risk-constitution/types';

interface Props {
  dimensions: Dimension[];
  vetoRules: VetoRule[];
  ranges: RiskRange[];
  testInputs: ScoreInput;
  onInputsChange: (inputs: ScoreInput) => void;
}

export function LiveTestPanel({ dimensions, vetoRules, ranges, testInputs, onInputsChange }: Props) {
  const result = useMemo(
    () => computeHybridScore(dimensions, ranges, vetoRules, testInputs),
    [dimensions, ranges, vetoRules, testInputs],
  );

  const handleDimensionScore = (dimId: string, val: number) => {
    onInputsChange({
      ...testInputs,
      dimensionScores: { ...testInputs.dimensionScores, [dimId]: val },
    });
  };

  const handleContextField = (field: string, val: number | string | boolean) => {
    onInputsChange({
      ...testInputs,
      context: { ...testInputs.context, [field]: val },
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-blue-500" />
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Canli Simulator</h3>
      </div>

      <div className="space-y-3">
        {dimensions.map(dim => {
          const val = testInputs.dimensionScores[dim.id] ?? 1;
          return (
            <div key={dim.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500 truncate mr-2">{dim.label}</span>
                <span className="text-xs font-mono font-semibold text-slate-700">{val}/5</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={val}
                onChange={(e) => handleDimensionScore(dim.id, Number(e.target.value))}
                className="w-full h-1.5 accent-slate-600"
              />
            </div>
          );
        })}

        <div className="pt-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Olasilik (Likelihood)</span>
            <span className="text-xs font-mono font-semibold text-slate-700">{testInputs.likelihood}/5</span>
          </div>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={testInputs.likelihood}
            onChange={(e) => onInputsChange({ ...testInputs, likelihood: Number(e.target.value) })}
            className="w-full h-1.5 accent-blue-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Kontrol Etkinligi</span>
            <span className="text-xs font-mono font-semibold text-slate-700">{testInputs.controlEffectiveness}/5</span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={1}
            value={testInputs.controlEffectiveness}
            onChange={(e) => onInputsChange({ ...testInputs, controlEffectiveness: Number(e.target.value) })}
            className="w-full h-1.5 accent-emerald-500"
          />
        </div>

        <div className="pt-3 border-t border-slate-200">
          <p className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wider">Veto Parametreleri</p>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Seri Hassasiyet</span>
              <input
                type="number"
                min={1}
                max={5}
                value={Number(testInputs.context?.shariah_sensitivity ?? 1)}
                onChange={(e) => handleContextField('shariah_sensitivity', Number(e.target.value))}
                className="w-14 text-xs text-center font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">CVSS Skoru</span>
              <input
                type="number"
                min={0}
                max={10}
                step={0.1}
                value={Number(testInputs.context?.cvss ?? 0)}
                onChange={(e) => handleContextField('cvss', Number(e.target.value))}
                className="w-14 text-xs text-center font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Varlik Kritigilik</span>
              <select
                value={String(testInputs.context?.asset_criticality ?? 'normal')}
                onChange={(e) => handleContextField('asset_criticality', e.target.value)}
                className="text-xs font-mono bg-slate-50 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-400"
              >
                <option value="normal">Normal</option>
                <option value="high">Yuksek</option>
                <option value="critical">Kritik</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${result.score}-${result.vetoTriggered}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="p-4 rounded-xl text-center border"
          style={{
            backgroundColor: result.zone?.color ? `${result.zone.color}15` : '#f1f5f9',
            borderColor: result.zone?.color ? `${result.zone.color}30` : '#e2e8f0',
          }}
        >
          <div
            className="text-4xl font-black mb-1"
            style={{ color: result.zone?.color || '#64748b' }}
          >
            {result.score}
          </div>
          <div
            className="text-sm font-semibold"
            style={{ color: result.zone?.color || '#64748b' }}
          >
            {result.zone?.label || 'Hesaplanamadi'}
          </div>

          {result.vetoTriggered && (
            <div className="mt-3 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-100 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-xs font-bold text-red-700">VETO: {result.vetoReason}</span>
            </div>
          )}

          <div className="mt-3 grid grid-cols-3 gap-1 text-[10px] text-slate-500">
            <div>
              <span className="block font-mono font-bold text-slate-700 text-xs">{result.breakdown.weightedImpact}</span>
              Agirlikli
            </div>
            <div>
              <span className="block font-mono font-bold text-slate-700 text-xs">{result.breakdown.likelihoodFactor}</span>
              Olasilik
            </div>
            <div>
              <span className="block font-mono font-bold text-slate-700 text-xs">{result.breakdown.controlFactor}</span>
              Kontrol
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
