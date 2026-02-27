import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useRiskConstitution } from '@/features/risk-constitution';

interface Props {
  findingCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  baseScore?: number;
}

interface WaterfallStep {
  label: string;
  value: number;
  cumulativeValue: number;
  color: string;
  isDeduction: boolean;
}

export function GradingWaterfall({ findingCounts, baseScore = 100 }: Props) {
  const { constitution } = useRiskConstitution();

  const waterfallData: WaterfallStep[] = useMemo(() => {
    if (!constitution) {
      return [];
    }

    const steps: WaterfallStep[] = [];
    let runningScore = baseScore;

    steps.push({
      label: 'Başlangıç',
      value: baseScore,
      cumulativeValue: baseScore,
      color: '#22c55e',
      isDeduction: false,
    });

    const deductions = [
      { label: 'Kritik', count: findingCounts.critical, points: 25, color: '#800000' },
      { label: 'Yüksek', count: findingCounts.high, points: 10, color: '#dc2626' },
      { label: 'Orta', count: findingCounts.medium, points: 3, color: '#f97316' },
      { label: 'Düşük', count: findingCounts.low, points: 1, color: '#eab308' },
    ];

    for (const { label, count, points, color } of deductions) {
      if (count > 0) {
        const totalDeduction = count * points;
        runningScore = Math.max(0, runningScore - totalDeduction);
        steps.push({
          label: `${label} (${count}x)`,
          value: -totalDeduction,
          cumulativeValue: runningScore,
          color,
          isDeduction: true,
        });
      }
    }

    const activeVeto = constitution.veto_rules.find(v => v.enabled);
    if (activeVeto && findingCounts.critical > 0) {
      const cappedScore = Math.min(runningScore, activeVeto.override_score);
      if (cappedScore < runningScore) {
        steps.push({
          label: 'Veto Limiti',
          value: -(runningScore - cappedScore),
          cumulativeValue: cappedScore,
          color: '#dc2626',
          isDeduction: true,
        });
        runningScore = cappedScore;
      }
    }

    steps.push({
      label: 'Final Skor',
      value: runningScore,
      cumulativeValue: runningScore,
      color: '#3b82f6',
      isDeduction: false,
    });

    return steps;
  }, [constitution, findingCounts, baseScore]);

  const chartData = useMemo(() => {
    return waterfallData.map((step, idx) => {
      if (idx === 0 || !step.isDeduction) {
        return {
          name: step.label,
          value: step.cumulativeValue,
          start: 0,
          color: step.color,
        };
      }

      const prevCumulative = waterfallData[idx - 1].cumulativeValue;
      return {
        name: step.label,
        value: Math.abs(step.value),
        start: step.cumulativeValue,
        color: step.color,
      };
    });
  }, [waterfallData]);

  if (!constitution) {
    return (
      <div className="text-center py-12 text-slate-400">
        Anayasa yükleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Puan Şelalesi (Waterfall)</h3>
        <div className="text-sm text-slate-400">
          Başlangıç: <span className="text-white font-bold">{baseScore}</span> → Final: <span className="text-green-400 font-bold">{waterfallData[waterfallData.length - 1]?.cumulativeValue || 0}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis
            domain={[0, baseScore]}
            tick={{ fill: '#94a3b8' }}
            label={{ value: 'Puan', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`${value.toFixed(0)} puan`, 'Değer']}
          />
          <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
          <Bar dataKey="value" stackId="a" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
          <Bar dataKey="start" stackId="a" fill="transparent" />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {waterfallData.map((step, idx) => (
          <div
            key={idx}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3"
          >
            <div className="text-xs text-slate-400 mb-1">{step.label}</div>
            <div className="flex items-baseline gap-2">
              {step.isDeduction && step.value < 0 && (
                <span className="text-red-400 font-bold text-lg">{step.value}</span>
              )}
              {!step.isDeduction && (
                <span className="text-white font-bold text-lg">{step.cumulativeValue}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
