import { Plus, Trash2, Scale } from 'lucide-react';
import type { Dimension } from '@/features/risk-constitution/types';

interface Props {
  dimensions: Dimension[];
  onChange: (dims: Dimension[]) => void;
}

function rebalanceWeights(dims: Dimension[], changedIdx: number, newWeight: number): Dimension[] {
  const clamped = Math.min(1, Math.max(0, newWeight));
  const remaining = 1 - clamped;
  const othersTotal = dims.reduce((sum, d, i) => i === changedIdx ? sum : sum + d.weight, 0);

  return dims.map((d, i) => {
    if (i === changedIdx) return { ...d, weight: Number(clamped.toFixed(2)) };
    if (othersTotal === 0) return { ...d, weight: Number((remaining / (dims.length - 1)).toFixed(2)) };
    return { ...d, weight: Number(((d.weight / othersTotal) * remaining).toFixed(2)) };
  });
}

export function DimensionsTab({ dimensions, onChange }: Props) {
  const totalWeight = dimensions.reduce((s, d) => s + d.weight, 0);
  const isBalanced = Math.abs(totalWeight - 1) < 0.02;

  const handleWeightChange = (idx: number, val: number) => {
    onChange(rebalanceWeights(dimensions, idx, val));
  };

  const handleLabelChange = (idx: number, label: string) => {
    const next = [...dimensions];
    next[idx] = { ...next[idx], label };
    onChange(next);
  };

  const handleAdd = () => {
    const id = `dim_${Date.now()}`;
    const newDim: Dimension = { id, label: 'Yeni Boyut', weight: 0 };
    onChange([...dimensions, newDim]);
  };

  const handleRemove = (idx: number) => {
    if (dimensions.length <= 2) return;
    const next = dimensions.filter((_, i) => i !== idx);
    const total = next.reduce((s, d) => s + d.weight, 0);
    if (total > 0) {
      onChange(next.map(d => ({ ...d, weight: Number((d.weight / total).toFixed(2)) })));
    } else {
      onChange(next.map(d => ({ ...d, weight: Number((1 / next.length).toFixed(2)) })));
    }
  };

  const barColors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-teal-500'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-slate-600" />
          <h3 className="text-lg font-semibold text-slate-800">Risk Boyutlari & Agirliklar</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium px-3 py-1 rounded-full ${isBalanced ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            Toplam: {(totalWeight * 100).toFixed(0)}%
          </span>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Boyut Ekle
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {dimensions.map((dim, idx) => (
          <div
            key={dim.id}
            className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
          >
            <div className={`w-1 h-10 rounded-full ${barColors[idx % barColors.length]}`} />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={dim.label}
                onChange={(e) => handleLabelChange(idx, e.target.value)}
                className="w-full text-sm font-medium text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-slate-500 focus:outline-none px-1 py-0.5 transition-colors"
              />
              <span className="text-xs text-slate-400 px-1">ID: {dim.id}</span>
            </div>

            <div className="flex items-center gap-3 w-64">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={dim.weight}
                onChange={(e) => handleWeightChange(idx, parseFloat(e.target.value))}
                className="flex-1 h-2 accent-slate-700"
              />
              <span className="text-sm font-mono font-semibold text-slate-700 w-14 text-right">
                {(dim.weight * 100).toFixed(0)}%
              </span>
            </div>

            <button
              onClick={() => handleRemove(idx)}
              disabled={dimensions.length <= 2}
              className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
        {dimensions.map((dim, idx) => (
          <div
            key={dim.id}
            className={`${barColors[idx % barColors.length]} transition-all duration-300`}
            style={{ width: `${dim.weight * 100}%` }}
            title={`${dim.label}: ${(dim.weight * 100).toFixed(0)}%`}
          />
        ))}
      </div>
    </div>
  );
}
