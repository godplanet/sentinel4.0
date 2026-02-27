import { Grid3X3 } from 'lucide-react';
import type { Dimension, ImpactLevel } from '@/features/risk-constitution/types';

interface Props {
  dimensions: Dimension[];
  matrix: ImpactLevel[];
  onChange: (matrix: ImpactLevel[]) => void;
}

const LEVEL_COLORS = [
  'bg-red-50 border-red-200',
  'bg-orange-50 border-orange-200',
  'bg-amber-50 border-amber-200',
  'bg-lime-50 border-lime-200',
  'bg-emerald-50 border-emerald-200',
];

export function MatrixTab({ dimensions, matrix, onChange }: Props) {
  const sorted = [...matrix].sort((a, b) => Number(b.level) - Number(a.level));

  const handleCellChange = (level: number, key: string, value: string) => {
    const next = matrix.map(row =>
      row.level === level ? { ...row, [key]: value } : row
    );
    onChange(next);
  };

  const handleLabelChange = (level: number, label: string) => {
    const next = matrix.map(row =>
      row.level === level ? { ...row, label } : row
    );
    onChange(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Grid3X3 className="w-5 h-5 text-slate-600" />
        <h3 className="text-lg font-semibold text-slate-800">Etki Matrisi (5 Seviye)</h3>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-16 border-b border-slate-200">
                Svy
              </th>
              <th className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-40 border-b border-slate-200">
                Etiket
              </th>
              {dimensions.map(dim => (
                <th
                  key={dim.id}
                  className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200"
                >
                  {dim.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, rowIdx) => (
              <tr key={row.level} className={`${LEVEL_COLORS[rowIdx] || 'bg-white'} border-b border-slate-100 last:border-b-0`}>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white text-sm font-bold text-slate-700 shadow-sm border border-slate-200">
                    {row.level}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => handleLabelChange(row.level, e.target.value)}
                    className="w-full text-sm font-medium text-slate-700 bg-white/80 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </td>
                {dimensions.map(dim => {
                  const descKey = `${dim.id}_desc`;
                  return (
                    <td key={dim.id} className="px-3 py-3">
                      <textarea
                        value={String(row[descKey] ?? '')}
                        onChange={(e) => handleCellChange(row.level, descKey, e.target.value)}
                        rows={2}
                        className="w-full text-sm text-slate-600 bg-white/80 border border-slate-200 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-slate-400"
                        placeholder={`${dim.label} - Seviye ${row.level}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        {'Her hucre, ilgili boyut icin o seviyenin anlamini tanimlar. Ornek: Seviye 5 Finansal = "> 0.5% Ozkaynak Kaybi"'}
      </p>
    </div>
  );
}
