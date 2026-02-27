import { useMemo } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { CometPoint } from '@/entities/risk/velocity-types';

interface CometChartProps {
  data: CometPoint[];
  timeProgress?: number;
}

const ZONE_COLORS = [
  ['#dcfce7', '#dcfce7', '#fef9c3', '#fef9c3', '#fee2e2'],
  ['#dcfce7', '#fef9c3', '#fef9c3', '#fee2e2', '#fee2e2'],
  ['#fef9c3', '#fef9c3', '#fed7aa', '#fed7aa', '#fecaca'],
  ['#fef9c3', '#fed7aa', '#fed7aa', '#fecaca', '#fca5a5'],
  ['#fed7aa', '#fed7aa', '#fecaca', '#fca5a5', '#f87171'],
];

function getDirectionColor(d: CometPoint['direction']) {
  if (d === 'worsening') return '#ef4444';
  if (d === 'improving') return '#22c55e';
  return '#94a3b8';
}

function getBubbleSize(score: number): number {
  if (score >= 80) return 300;
  if (score >= 60) return 220;
  if (score >= 40) return 160;
  return 100;
}

function interpolate(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload as CometPoint & { ix: number; iy: number };
  if (!d) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs max-w-[220px]">
      <p className="font-bold text-sm mb-1">{d.name}</p>
      <div className="space-y-1">
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Onceki</span>
          <span>({d.px}, {d.py})</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Guncel</span>
          <span>({d.cx}, {d.cy})</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Hiz</span>
          <span className="font-bold" style={{ color: getDirectionColor(d.direction) }}>
            {d.velocity.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400">Yon</span>
          <span className="font-bold" style={{ color: getDirectionColor(d.direction) }}>
            {d.direction === 'worsening' ? 'Kotu' : d.direction === 'improving' ? 'Iyi' : 'Stabil'}
          </span>
        </div>
      </div>
    </div>
  );
};

export function CometChart({ data, timeProgress = 1 }: CometChartProps) {
  const interpolatedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      ix: interpolate(d.px, d.cx, timeProgress),
      iy: interpolate(d.py, d.cy, timeProgress),
      size: getBubbleSize(d.riskScore),
    }));
  }, [data, timeProgress]);

  return (
    <div className="relative w-full h-[520px]">
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 500 500" preserveAspectRatio="none">
        {ZONE_COLORS.map((row, yi) =>
          row.map((color, xi) => (
            <rect
              key={`${xi}-${yi}`}
              x={60 + xi * 86}
              y={10 + yi * 92}
              width={86}
              height={92}
              fill={color}
              opacity={0.5}
            />
          ))
        )}
      </svg>

      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
          <XAxis
            type="number"
            dataKey="ix"
            domain={[0.5, 5.5]}
            ticks={[1, 2, 3, 4, 5]}
            name="Olasilik"
            label={{ value: 'OLASILIK', position: 'insideBottom', offset: -10, style: { fontSize: 11, fontWeight: 700, fill: '#64748b' } }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <YAxis
            type="number"
            dataKey="iy"
            domain={[0.5, 5.5]}
            ticks={[1, 2, 3, 4, 5]}
            name="Etki"
            label={{ value: 'ETKI', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11, fontWeight: 700, fill: '#64748b' } }}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <ReferenceLine x={3} stroke="#e2e8f0" strokeDasharray="3 3" />
          <ReferenceLine y={3} stroke="#e2e8f0" strokeDasharray="3 3" />
          <Tooltip content={<CustomTooltip />} />
          <Scatter data={interpolatedData} shape="circle">
            {interpolatedData.map((entry) => (
              <Cell
                key={entry.id}
                fill={getDirectionColor(entry.direction)}
                fillOpacity={0.85}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
        {interpolatedData.map(d => {
          const chartW = 460;
          const chartH = 460;
          const offsetX = 60;
          const offsetY = 20;
          const scaleX = (v: number) => offsetX + ((v - 0.5) / 5) * chartW;
          const scaleY = (v: number) => offsetY + chartH - ((v - 0.5) / 5) * chartH;

          const x1 = scaleX(d.px);
          const y1 = scaleY(d.py);
          const x2 = scaleX(d.ix);
          const y2 = scaleY(d.iy);

          if (Math.abs(x2 - x1) < 2 && Math.abs(y2 - y1) < 2) return null;

          return (
            <line
              key={`trail-${d.id}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={getDirectionColor(d.direction)}
              strokeWidth={2}
              strokeDasharray="4 2"
              opacity={0.6}
            />
          );
        })}
      </svg>
    </div>
  );
}
