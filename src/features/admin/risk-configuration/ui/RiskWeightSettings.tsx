import { useRiskConfigStore } from '../model/store';
import { Sliders, Save, RefreshCw } from 'lucide-react';

export const RiskWeightSettings = () => {
  const { weights, thresholds, updateWeight, updateThreshold } = useRiskConfigStore();

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800">Risk Motoru Katsayıları</h3>
            <p className="text-xs text-slate-500">Basel IV uyumlu logaritmik hesaplama ağırlıkları.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-slate-600">Etki Çarpanı (Impact)</label>
              <span className="text-indigo-600 font-mono font-bold">{weights.impact.toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.5" max="3.0" step="0.1"
              value={weights.impact}
              onChange={(e) => updateWeight('impact', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-slate-600">Hacim Logaritması</label>
              <span className="text-indigo-600 font-mono font-bold">{weights.volume.toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.5" max="2.0" step="0.1"
              value={weights.volume}
              onChange={(e) => updateWeight('volume', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-slate-600">Kontrol Etkinliği</label>
              <span className="text-indigo-600 font-mono font-bold">{weights.control.toFixed(1)}x</span>
            </div>
            <input
              type="range" min="0.5" max="2.0" step="0.1"
              value={weights.control}
              onChange={(e) => updateWeight('control', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border-l-4 border-l-rose-500">
        <h3 className="font-bold text-lg text-slate-800 mb-6">Risk Seviye Eşikleri (Thresholds)</h3>

        <div className="space-y-6">
          <div className="relative pt-6 pb-2">
            <div className="h-4 bg-slate-100 rounded-full w-full flex overflow-hidden">
              <div style={{ width: `${(thresholds.medium / 20) * 100}%` }} className="bg-emerald-400 transition-all" />
              <div style={{ width: `${((thresholds.high - thresholds.medium) / 20) * 100}%` }} className="bg-yellow-400 transition-all" />
              <div style={{ width: `${((thresholds.critical - thresholds.high) / 20) * 100}%` }} className="bg-orange-400 transition-all" />
              <div className="flex-1 bg-rose-500 transition-all" />
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div>
                <label className="text-xs font-bold text-emerald-600 uppercase block mb-1">Orta Risk Sınırı</label>
                <input
                  type="number" value={thresholds.medium}
                  onChange={(e) => updateThreshold('medium', parseFloat(e.target.value))}
                  className="input-solid w-full text-center font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-yellow-600 uppercase block mb-1">Yüksek Risk Sınırı</label>
                <input
                  type="number" value={thresholds.high}
                  onChange={(e) => updateThreshold('high', parseFloat(e.target.value))}
                  className="input-solid w-full text-center font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-rose-600 uppercase block mb-1">Kritik Risk Sınırı</label>
                <input
                  type="number" value={thresholds.critical}
                  onChange={(e) => updateThreshold('critical', parseFloat(e.target.value))}
                  className="input-solid w-full text-center font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} />
          Varsayılanlara Dön
        </button>
        <button className="btn-primary flex items-center gap-2">
          <Save size={16} />
          Ayarları Kaydet
        </button>
      </div>
    </div>
  );
};
