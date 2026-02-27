import { useStrategyStore } from '@/entities/strategy/model/store';
import { Settings2 } from 'lucide-react';

export const RiskWeightSimulator = () => {
  const { riskWeights, updateRiskWeights } = useStrategyStore();

  const handleChange = (key: keyof typeof riskWeights, value: number) => {
    updateRiskWeights({ ...riskWeights, [key]: value });
  };

  return (
    <div className="glass-panel p-6 rounded-xl border-l-4 border-l-indigo-500">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
          <Settings2 size={20} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800">Risk Ağırlık Simülatörü</h3>
          <p className="text-xs text-slate-500">Metodoloji parametrelerini simüle et.</p>
        </div>
      </div>

      <div className="space-y-6">
        {[
          { label: 'Etki (Impact)', key: 'impact', color: 'accent-rose-500' },
          { label: 'Olasılık (Likelihood)', key: 'likelihood', color: 'accent-orange-500' },
          { label: 'Hız (Velocity)', key: 'velocity', color: 'accent-cyan-500' }
        ].map((item) => (
          <div key={item.key}>
            <div className="flex justify-between mb-2 text-sm">
              <span className="font-medium text-slate-700">{item.label}</span>
              <span className="font-bold font-mono bg-slate-100 px-2 rounded text-slate-600">
                {riskWeights[item.key as keyof typeof riskWeights]}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={riskWeights[item.key as keyof typeof riskWeights]}
              onChange={(e) => handleChange(item.key as keyof typeof riskWeights, parseInt(e.target.value))}
              className={`w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer ${item.color}`}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-200 text-[10px] text-slate-400 text-center">
        * Bu ayarlar sadece simülasyon amaçlıdır. Ana metodolojiyi etkilemez.
      </div>
    </div>
  );
};
