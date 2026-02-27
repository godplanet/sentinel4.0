import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  date: string;
  plannedHours: number;
  actualHours: number;
  cumulativePlanned: number;
  cumulativeActual: number;
}

interface PlanVsActualChartProps {
  data: ChartDataPoint[];
  height?: number;
}

export function PlanVsActualChart({ data, height = 400 }: PlanVsActualChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full bg-white/90 backdrop-blur-xl rounded-xl border border-slate-200 p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-900">Plan vs. Actual Progress</h3>
        <p className="text-sm text-slate-600 mt-1">
          Weekly resource consumption and cumulative progress tracking
        </p>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />

          <YAxis
            yAxisId="left"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            label={{ value: 'Hours (Weekly)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#64748b"
            style={{ fontSize: '12px' }}
            label={{ value: 'Cumulative Hours', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value.toFixed(0)} hrs`, '']}
            labelFormatter={(label) => `Week of ${formatDate(label)}`}
          />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />

          <Bar
            yAxisId="left"
            dataKey="plannedHours"
            name="Planned (Weekly)"
            fill="#94a3b8"
            radius={[4, 4, 0, 0]}
            opacity={0.7}
          />

          <Bar
            yAxisId="left"
            dataKey="actualHours"
            name="Actual (Weekly)"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativePlanned"
            name="Cumulative Planned"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#94a3b8', r: 4 }}
            activeDot={{ r: 6 }}
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulativeActual"
            name="Cumulative Actual"
            stroke="#6366f1"
            strokeWidth={3}
            dot={{ fill: '#6366f1', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-slate-400"></div>
          <span className="text-slate-600">Planned (Ghost)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          <span className="text-slate-600">Actual (Neon)</span>
        </div>
      </div>
    </div>
  );
}
