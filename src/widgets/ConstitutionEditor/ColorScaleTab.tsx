import { Palette, Plus, Trash2 } from 'lucide-react';
import type { RiskRange } from '@/features/risk-constitution/types';

interface Props {
  ranges: RiskRange[];
  onChange: (ranges: RiskRange[]) => void;
}

export function ColorScaleTab({ ranges, onChange }: Props) {
  const sorted = [...ranges].sort((a, b) => a.min - b.min);

  const handleFieldChange = (idx: number, field: keyof RiskRange, value: string | number) => {
    const next = [...ranges];
    next[idx] = { ...next[idx], [field]: value };
    onChange(next);
  };

  const handleAdd = () => {
    const last = sorted[sorted.length - 1];
    const newRange: RiskRange = {
      label: 'Yeni Aralik',
      min: last ? last.max : 0,
      max: last ? Math.min(last.max + 20, 100) : 25,
      color: '#94a3b8',
    };
    onChange([...ranges, newRange]);
  };

  const handleRemove = (idx: number) => {
    if (ranges.length <= 2) return;
    onChange(ranges.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">BDDK Risk Renk Skalasi</h3>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Aralik Ekle
        </button>
      </div>

      <div className="h-10 rounded-xl overflow-hidden flex shadow-inner border border-slate-200">
        {sorted.map((range) => (
          <div
            key={`bar-${range.label}`}
            className="h-full transition-all duration-300 relative group"
            style={{
              backgroundColor: range.color,
              width: `${range.max - range.min}%`,
            }}
          >
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
              {range.label}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {ranges.map((range, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div className="relative">
              <input
                type="color"
                value={range.color}
                onChange={(e) => handleFieldChange(idx, 'color', e.target.value)}
                className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
              />
            </div>

            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={range.label}
                onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                className="w-full text-sm font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-500 focus:outline-none px-1 py-0.5"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="text-center">
                <label className="text-xs text-slate-400 block mb-1">Min</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={range.min}
                  onChange={(e) => handleFieldChange(idx, 'min', Number(e.target.value))}
                  className="w-16 text-sm text-center font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
              <span className="text-slate-300 mt-5">-</span>
              <div className="text-center">
                <label className="text-xs text-slate-400 block mb-1">Max</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={range.max}
                  onChange={(e) => handleFieldChange(idx, 'max', Number(e.target.value))}
                  className="w-16 text-sm text-center font-mono text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>
            </div>

            <button
              onClick={() => handleRemove(idx)}
              disabled={ranges.length <= 2}
              className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
