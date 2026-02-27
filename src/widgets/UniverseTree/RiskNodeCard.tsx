/**
 * RISK NODE CARD - Interactive Risk Parameter Editor
 * Real-time constitutional risk calculation with neon glow
 */

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, TrendingUp, Zap, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TaxonomyEntity } from '@/entities/universe/api/taxonomy-api';
import {
  calculateConstitutionalRisk,
  getRiskScales,
  getNeonGlowClass,
  getPulseClass,
  type RiskInput,
} from '@/features/strategy/risk-engine';
import { useUpdateEntity } from '@/entities/universe/api/taxonomy-hooks';
import { SENTINEL_CONSTITUTION } from '@/shared/config';

interface RiskNodeCardProps {
  entity: TaxonomyEntity;
  onClose: () => void;
}

export function RiskNodeCard({ entity, onClose }: RiskNodeCardProps) {
  // Extract initial values from entity
  const initialImpact = Math.min(Math.ceil((entity.risk_weight || 1) / 5), 5);
  const initialLikelihood = Math.min(Math.ceil((entity.risk_weight || 1) / 3), 5);

  const [impact, setImpact] = useState(initialImpact);
  const [likelihood, setLikelihood] = useState(initialLikelihood);
  const [velocity, setVelocity] = useState(1.0);
  const [controlEffectiveness, setControlEffectiveness] = useState(0);

  const updateMutation = useUpdateEntity();
  const scales = getRiskScales();

  // Calculate risk in real-time
  const riskInput: RiskInput = {
    impact,
    likelihood,
    velocity,
    control_effectiveness: controlEffectiveness,
  };

  const riskResult = calculateConstitutionalRisk(riskInput);

  // Save changes
  const handleSave = async () => {
    const newRiskWeight = riskResult.inherent_risk_score;

    await updateMutation.mutateAsync({
      id: entity.id,
      updates: {
        risk_weight: newRiskWeight,
        description: entity.description,
      },
    });

    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed right-0 top-0 h-full w-[480px] backdrop-blur-2xl bg-white/80 border-l border-white/30 shadow-2xl z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 backdrop-blur-xl bg-white/90 border-b border-white/30 p-6 z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{entity.name}</h3>
            <p className="text-sm text-slate-600 mt-1">{entity.type}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/80 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Live Risk Score - Neon Glow */}
        <motion.div
          key={riskResult.inherent_risk_score}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`
            mt-4 p-6 rounded-2xl
            backdrop-blur-xl border-2
            ${getNeonGlowClass(riskResult.risk_zone)}
            ${getPulseClass(riskResult.risk_zone)}
            transition-all duration-500
          `}
          style={{
            backgroundColor: `${riskResult.risk_color}15`,
            borderColor: riskResult.risk_color,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-600 font-medium">Inherent Risk Score</div>
              <div className="text-4xl font-bold mt-1" style={{ color: riskResult.risk_color }}>
                {riskResult.inherent_risk_score.toFixed(1)}
              </div>
              <div className="text-sm mt-1" style={{ color: riskResult.risk_color }}>
                {riskResult.risk_label}
              </div>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ backgroundColor: `${riskResult.risk_color}30` }}
            >
              <AlertCircle className="w-8 h-8" style={{ color: riskResult.risk_color }} />
            </div>
          </div>

          {/* Formula Breakdown */}
          <div className="mt-4 p-3 bg-white/50 rounded-lg">
            <div className="text-xs text-slate-600 font-semibold mb-1">Formula:</div>
            <code className="text-xs text-slate-700">{riskResult.formula_breakdown}</code>
          </div>
        </motion.div>
      </div>

      {/* Parameters */}
      <div className="p-6 space-y-6">
        {/* Impact Slider */}
        <div className="backdrop-blur-lg bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <label className="font-semibold text-slate-800">Impact</label>
            <span className="ml-auto text-2xl font-bold text-red-600">{impact}</span>
          </div>

          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={impact}
            onChange={(e) => setImpact(parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-600 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-red-600
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />

          <p className="text-xs text-slate-600 mt-2">
            {scales.impact.descriptions[impact as keyof typeof scales.impact.descriptions]}
          </p>
        </div>

        {/* Likelihood Slider */}
        <div className="backdrop-blur-lg bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <label className="font-semibold text-slate-800">Likelihood</label>
            <span className="ml-auto text-2xl font-bold text-blue-600">{likelihood}</span>
          </div>

          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={likelihood}
            onChange={(e) => setLikelihood(parseInt(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-600 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-blue-600
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />

          <p className="text-xs text-slate-600 mt-2">
            {scales.likelihood.descriptions[likelihood as keyof typeof scales.likelihood.descriptions]}
          </p>
        </div>

        {/* Velocity Slider */}
        <div className="backdrop-blur-lg bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-600" />
            <label className="font-semibold text-slate-800">Velocity Multiplier</label>
            <span className="ml-auto text-2xl font-bold text-yellow-600">{velocity.toFixed(1)}x</span>
          </div>

          <input
            type="range"
            min={0.8}
            max={1.5}
            step={0.1}
            value={velocity}
            onChange={(e) => setVelocity(parseFloat(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-slate-300 via-yellow-400 to-orange-600 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-yellow-600
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />

          <p className="text-xs text-slate-600 mt-2">
            Speed at which risk materializes (0.8 = slow, 1.5 = instant)
          </p>
        </div>

        {/* Control Effectiveness Slider */}
        <div className="backdrop-blur-lg bg-white/60 rounded-xl p-4 border border-white/30">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-green-600" />
            <label className="font-semibold text-slate-800">Control Effectiveness</label>
            <span className="ml-auto text-2xl font-bold text-green-600">{(controlEffectiveness * 100).toFixed(0)}%</span>
          </div>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={controlEffectiveness}
            onChange={(e) => setControlEffectiveness(parseFloat(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-red-400 via-yellow-400 to-green-600 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-6
              [&::-webkit-slider-thumb]:h-6
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:border-2
              [&::-webkit-slider-thumb]:border-green-600
              [&::-webkit-slider-thumb]:cursor-pointer
            "
          />

          <p className="text-xs text-slate-600 mt-2">
            How well controls mitigate this risk (0% = no controls, 100% = perfect)
          </p>
        </div>

        {/* Residual Risk */}
        {controlEffectiveness > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="backdrop-blur-lg bg-green-50/80 rounded-xl p-4 border border-green-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-green-800 font-semibold">Residual Risk</div>
                <div className="text-2xl font-bold text-green-700 mt-1">
                  {riskResult.residual_risk_score.toFixed(1)}
                </div>
              </div>
              <div className="text-right text-xs text-green-700">
                <div>After Controls:</div>
                <div className="font-bold text-lg">
                  {((riskResult.residual_risk_score / riskResult.inherent_risk_score) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Constitutional Reference */}
        <div className="backdrop-blur-lg bg-blue-50/80 rounded-xl p-4 border border-blue-200">
          <div className="text-xs font-semibold text-blue-800 mb-2">📜 Constitutional Reference</div>
          <div className="space-y-1 text-xs text-blue-700">
            <div>Formula: {SENTINEL_CONSTITUTION.RISK.FORMULA}</div>
            <div>Max Score: {SENTINEL_CONSTITUTION.RISK.MAX_SCORE}</div>
            <div>Risk Zones: GREEN (1-4) | YELLOW (5-9) | ORANGE (10-15) | RED (16-25)</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 backdrop-blur-xl bg-white/90 border-t border-white/30 p-6">
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
