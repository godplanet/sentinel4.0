import { useMemo } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { useRiskConstitution } from '@/features/risk-constitution';

interface Props {
  currentScore: number;
}

export function GradingScaleTable({ currentScore }: Props) {
  const { constitution } = useRiskConstitution();

  const scaleRows = useMemo(() => {
    if (!constitution) return [];

    const sorted = [...constitution.risk_ranges].sort((a, b) => b.min - a.min);

    return sorted.map(range => ({
      min: range.min,
      max: range.max,
      label: range.label,
      color: range.color,
      isActive: currentScore >= range.min && currentScore <= range.max,
    }));
  }, [constitution, currentScore]);

  if (!constitution) {
    return (
      <div className="text-center py-12 text-slate-400">
        Anayasa yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Award className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Not Cetveli (Grading Scale)</h3>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Aralık</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Tanım</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase">Renk</th>
              <th className="text-center px-4 py-3 text-xs font-bold text-slate-400 uppercase">Durum</th>
            </tr>
          </thead>
          <tbody>
            {scaleRows.map((row, idx) => (
              <tr
                key={idx}
                className={`
                  border-b border-white/5 transition-all
                  ${row.isActive
                    ? 'bg-blue-500/20 ring-2 ring-blue-400/50'
                    : 'hover:bg-white/5'
                  }
                `}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{row.min}</span>
                    <span className="text-slate-400">-</span>
                    <span className="text-white font-bold">{row.max}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-white font-medium">{row.label}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-lg shadow-lg"
                      style={{ backgroundColor: row.color }}
                    />
                    <span className="text-xs text-slate-400 font-mono">{row.color}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.isActive && (
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <span className="text-xs font-bold text-green-400">AKTİF</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <Award className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white mb-1">
              Mevcut Skorunuz: {currentScore.toFixed(1)}
            </div>
            <div className="text-xs text-slate-400">
              {scaleRows.find(r => r.isActive)?.label || 'Tanımsız'}
            </div>
          </div>
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
            style={{ backgroundColor: scaleRows.find(r => r.isActive)?.color || '#64748b' }}
          >
            {currentScore.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
}
