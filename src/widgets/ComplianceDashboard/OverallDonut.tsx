import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { FrameworkCoverageStats } from '@/features/compliance';

interface Props {
  stats: FrameworkCoverageStats[];
}

export const OverallDonut = ({ stats }: Props) => {
  const totalReqs = stats.reduce((s, f) => s + f.total_requirements, 0);
  const coveredReqs = stats.reduce((s, f) => s + f.covered_requirements, 0);
  const gapReqs = totalReqs - coveredReqs;
  const pct = totalReqs > 0 ? Math.round((coveredReqs / totalReqs) * 100) : 0;

  const data = [
    { name: 'Kapsanan', value: coveredReqs },
    { name: 'Acik', value: gapReqs },
  ];

  const COLORS = ['#10b981', '#e2e8f0'];

  const getGradeColor = (p: number) => {
    if (p >= 80) return 'text-emerald-600';
    if (p >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getGradeLabel = (p: number) => {
    if (p >= 90) return 'Mukemmel';
    if (p >= 75) return 'Iyi';
    if (p >= 50) return 'Orta';
    return 'Kritik';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-700 mb-1">Genel Uyum Skoru</h3>
      <p className="text-xs text-slate-400 mb-4">Tum cerceveler genelinde</p>

      <div className="relative w-44 h-44 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${getGradeColor(pct)}`}>%{pct}</span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {getGradeLabel(pct)}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-center">
        <div className="bg-emerald-50 rounded-lg p-2">
          <div className="text-lg font-black text-emerald-700">{coveredReqs}</div>
          <div className="text-[10px] text-emerald-600 font-medium">Kapsanan</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <div className="text-lg font-black text-slate-500">{gapReqs}</div>
          <div className="text-[10px] text-slate-400 font-medium">Acik Gap</div>
        </div>
      </div>
    </div>
  );
};
