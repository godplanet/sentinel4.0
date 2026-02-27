import { ShieldAlert, Plus, Trash2, Zap } from 'lucide-react';
import type { VetoRule } from '@/features/risk-constitution/types';

interface Props {
  rules: VetoRule[];
  onChange: (rules: VetoRule[]) => void;
}

export function VetoTab({ rules, onChange }: Props) {
  const handleToggle = (idx: number) => {
    const next = [...rules];
    next[idx] = { ...next[idx], enabled: !next[idx].enabled };
    onChange(next);
  };

  const handleFieldChange = (idx: number, field: keyof VetoRule, value: string | number) => {
    const next = [...rules];
    next[idx] = { ...next[idx], [field]: value };
    onChange(next);
  };

  const handleAdd = () => {
    const newRule: VetoRule = {
      id: `veto_${Date.now()}`,
      name: 'Yeni Veto Kurali',
      condition: 'field >= 1',
      override_score: 100,
      enabled: false,
    };
    onChange([...rules, newRule]);
  };

  const handleRemove = (idx: number) => {
    onChange(rules.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-slate-800">Veto Kurallari (Kill-Switch)</h3>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Kural Ekle
        </button>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <Zap className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-red-700">
          <p className="font-semibold mb-1">Veto = Agirlikli Hesaplamayi Bypass Eder</p>
          <p className="text-red-600">
            Kosul saglandiginda risk skoru otomatik olarak override edilir.
            Ornek: Seri Hassasiyet = 5 ise skor direkt 100 olur. CVSS 9+ ve kritik varlik ise skor direkt 100 olur.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {rules.map((rule, idx) => (
          <div
            key={rule.id}
            className={`p-5 border rounded-xl transition-all ${rule.enabled ? 'bg-white border-red-300 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-70'}`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => handleToggle(idx)}
                className={`relative mt-1 w-11 h-6 rounded-full transition-colors flex-shrink-0 ${rule.enabled ? 'bg-red-500' : 'bg-slate-300'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${rule.enabled ? 'translate-x-5' : ''}`}
                />
              </button>

              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                  className="w-full text-sm font-semibold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-500 focus:outline-none px-1 py-0.5"
                />

                <div className="flex items-end gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-slate-500 mb-1 block">Kosul Ifadesi</label>
                    <input
                      type="text"
                      value={rule.condition}
                      onChange={(e) => handleFieldChange(idx, 'condition', e.target.value)}
                      className="w-full text-sm font-mono text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400"
                      placeholder="shariah_sensitivity == 5"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">{'Desteklenen: ==, !=, >=, <=, >, < ve && (VE)'}</p>
                  </div>
                  <div className="w-32">
                    <label className="text-xs text-slate-500 mb-1 block">Override Skor</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={rule.override_score}
                      onChange={(e) => handleFieldChange(idx, 'override_score', Number(e.target.value))}
                      className="w-full text-sm font-mono text-slate-700 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRemove(idx)}
                className="p-1.5 text-slate-400 hover:text-red-500 transition-colors mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {rules.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            Henuz veto kurali eklenmedi.
          </div>
        )}
      </div>
    </div>
  );
}
