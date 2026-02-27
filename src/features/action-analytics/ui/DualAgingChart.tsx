import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import type { ActionAgingMetrics } from '@/entities/action/model/types';
import { DEPT_ID_TO_NAME } from '../lib/departments';

interface DeptRow {
  dept:        string;
  operational: number;
  performance: number;
  count:       number;
}

function buildChartData(actions: ActionAgingMetrics[]): DeptRow[] {
  const map = new Map<string, { op: number; perf: number; n: number }>();

  for (const a of actions) {
    const key = a.assignee_unit_id ?? 'other';
    const cur = map.get(key) ?? { op: 0, perf: 0, n: 0 };
    cur.op   += Math.max(0, a.operational_delay_days);
    cur.perf += Math.max(0, a.performance_delay_days);
    cur.n    += 1;
    map.set(key, cur);
  }

  return Array.from(map.entries())
    .map(([id, v]) => ({
      dept:        DEPT_ID_TO_NAME[id] ?? id.slice(0, 12),
      operational: v.n > 0 ? Math.round(v.op   / v.n) : 0,
      performance: v.n > 0 ? Math.round(v.perf / v.n) : 0,
      count:       v.n,
    }))
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 8);
}

interface TooltipEntry {
  value: number;
  name:  string;
  color: string;
}

interface CustomTipProps {
  active?:  boolean;
  payload?: TooltipEntry[];
  label?:   string;
}

function GlassTooltip({ active, payload, label }: CustomTipProps) {
  if (!active || !payload?.length) return null;

  const op   = payload.find((p) => p.name === 'Operasyonel Gecikme');
  const perf = payload.find((p) => p.name === 'Performans Gecikmesi');
  const masked = perf && op ? Math.max(0, perf.value - op.value) : 0;

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl p-4 shadow-xl min-w-[220px]">
      <p className="text-[11px] font-black text-slate-700 pb-2 mb-2 border-b border-slate-100 truncate">
        {label}
      </p>
      <div className="space-y-1.5 text-xs">
        {op && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ff960a] shrink-0" />
              Yönetim raporları
            </span>
            <span className="font-black text-amber-700">{op.value}g</span>
          </div>
        )}
        {perf && (
          <div className="flex items-center justify-between gap-6">
            <span className="flex items-center gap-1.5 text-slate-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#700000] shrink-0" />
              Gerçek gecikme
            </span>
            <span className="font-black text-[#700000]">{perf.value}g</span>
          </div>
        )}
      </div>
      {masked > 0 && (
        <p className="mt-2.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1.5">
          Uzatmalarla gizlenen risk: <span className="font-black">{masked} gün</span>
        </p>
      )}
    </div>
  );
}

interface Props {
  actions: ActionAgingMetrics[];
}

export function DualAgingChart({ actions }: Props) {
  const data = buildChartData(actions);

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
        Ortalama gecikme · birim bazında
      </p>
      <p className="text-xs text-slate-500 mb-4">
        Sarı/turuncu = yönetim tablosu &nbsp;·&nbsp; Koyu kırmızı = gerçek performans
      </p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, left: -4, bottom: 52 }}
            barCategoryGap="28%"
            barGap={2}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="dept"
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Inter,sans-serif' }}
              tickLine={false}
              axisLine={false}
              angle={-28}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Inter,sans-serif' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}g`}
              width={36}
            />
            <Tooltip content={<GlassTooltip />} cursor={{ fill: 'rgba(148,163,184,0.06)' }} />
            <Legend
              wrapperStyle={{ fontSize: '11px', fontFamily: 'Inter,sans-serif', paddingTop: '6px' }}
              iconType="square"
              iconSize={10}
            />
            <ReferenceLine
              y={365}
              stroke="#700000"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: 'BDDK 365g', fontSize: 9, fill: '#700000', position: 'insideTopRight' }}
            />
            <Bar
              dataKey="operational"
              name="Operasyonel Gecikme"
              fill="#ff960a"
              radius={[3, 3, 0, 0]}
              maxBarSize={26}
              opacity={0.85}
            />
            <Bar
              dataKey="performance"
              name="Performans Gecikmesi"
              fill="#700000"
              radius={[3, 3, 0, 0]}
              maxBarSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
