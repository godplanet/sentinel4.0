import { useState, useMemo } from 'react';
import {
  Gauge, TrendingUp, TrendingDown, AlertTriangle,
  Clock, CheckCircle2, BarChart3, ArrowDown, ArrowUp
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell
} from 'recharts';
import clsx from 'clsx';

interface AdherenceData {
  totalPlanned: number;
  totalCompleted: number;
  totalInProgress: number;
  totalDelayed: number;
  plannedHours: number;
  actualHours: number;
  engagements: EngagementVariance[];
}

interface EngagementVariance {
  id: string;
  name: string;
  plannedStart: string;
  plannedEnd: string;
  actualStart: string | null;
  actualEnd: string | null;
  plannedHours: number;
  actualHours: number;
  status: 'ON_TRACK' | 'DELAYED' | 'CRITICAL' | 'COMPLETED' | 'NOT_STARTED';
  varianceDays: number;
  varianceHours: number;
}

const DEMO_DATA: AdherenceData = {
  totalPlanned: 24,
  totalCompleted: 8,
  totalInProgress: 10,
  totalDelayed: 4,
  plannedHours: 4800,
  actualHours: 3200,
  engagements: [
    { id: '1', name: 'Kredi Surecleri Denetimi', plannedStart: '2026-01-15', plannedEnd: '2026-03-15', actualStart: '2026-01-20', actualEnd: null, plannedHours: 480, actualHours: 350, status: 'ON_TRACK', varianceDays: -5, varianceHours: -130 },
    { id: '2', name: 'BT Altyapi Denetimi', plannedStart: '2026-02-01', plannedEnd: '2026-04-01', actualStart: '2026-02-01', actualEnd: null, plannedHours: 560, actualHours: 420, status: 'DELAYED', varianceDays: 12, varianceHours: 80 },
    { id: '3', name: 'MASAK Uyumluluk Denetimi', plannedStart: '2026-01-01', plannedEnd: '2026-02-28', actualStart: '2026-01-05', actualEnd: '2026-03-10', plannedHours: 320, actualHours: 380, status: 'COMPLETED', varianceDays: 10, varianceHours: 60 },
    { id: '4', name: 'Hazine Islemleri Denetimi', plannedStart: '2026-03-01', plannedEnd: '2026-05-01', actualStart: null, actualEnd: null, plannedHours: 400, actualHours: 0, status: 'NOT_STARTED', varianceDays: 0, varianceHours: -400 },
    { id: '5', name: 'Operasyonel Risk Denetimi', plannedStart: '2026-02-15', plannedEnd: '2026-04-15', actualStart: '2026-02-20', actualEnd: null, plannedHours: 440, actualHours: 280, status: 'CRITICAL', varianceDays: 22, varianceHours: 120 },
    { id: '6', name: 'Sube Denetimleri (Toplu)', plannedStart: '2026-01-10', plannedEnd: '2026-06-30', actualStart: '2026-01-10', actualEnd: null, plannedHours: 800, actualHours: 450, status: 'ON_TRACK', varianceDays: -2, varianceHours: -50 },
    { id: '7', name: 'KVKK Uyumluluk Incelemesi', plannedStart: '2026-03-15', plannedEnd: '2026-05-15', actualStart: '2026-03-20', actualEnd: null, plannedHours: 280, actualHours: 180, status: 'DELAYED', varianceDays: 8, varianceHours: 40 },
    { id: '8', name: 'Siber Guvenlik Denetimi', plannedStart: '2026-01-01', plannedEnd: '2026-02-15', actualStart: '2026-01-01', actualEnd: '2026-02-10', plannedHours: 360, actualHours: 320, status: 'COMPLETED', varianceDays: -5, varianceHours: -40 },
  ],
};

export function PlanAdherence({ data = DEMO_DATA }: { data?: AdherenceData }) {
  const [sortBy, setSortBy] = useState<'variance' | 'name'>('variance');

  const adherenceRate = data.totalPlanned > 0
    ? Math.round(((data.totalCompleted + data.totalInProgress * 0.5) / data.totalPlanned) * 100)
    : 0;

  const schedulePI = data.plannedHours > 0
    ? (data.actualHours / data.plannedHours)
    : 1;

  const sorted = useMemo(() => {
    return [...data.engagements].sort((a, b) =>
      sortBy === 'variance'
        ? b.varianceDays - a.varianceDays
        : a.name.localeCompare(b.name)
    );
  }, [data.engagements, sortBy]);

  const chartData = data.engagements.map(e => ({
    name: e.name.length > 20 ? e.name.slice(0, 20) + '...' : e.name,
    variance: e.varianceDays,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GaugeCard
          label="Plan Uyum Orani"
          value={adherenceRate}
          suffix="%"
          icon={Gauge}
          color={adherenceRate >= 80 ? 'green' : adherenceRate >= 60 ? 'amber' : 'red'}
        />
        <GaugeCard
          label="Takvim Performans Endeksi"
          value={Number(schedulePI.toFixed(2))}
          icon={BarChart3}
          color={schedulePI >= 0.9 ? 'green' : schedulePI >= 0.7 ? 'amber' : 'red'}
        />
        <GaugeCard
          label="Gecikmeli Gorev"
          value={data.totalDelayed}
          suffix={`/ ${data.totalPlanned}`}
          icon={AlertTriangle}
          color={data.totalDelayed <= 2 ? 'green' : data.totalDelayed <= 5 ? 'amber' : 'red'}
        />
        <GaugeCard
          label="Tamamlanan"
          value={data.totalCompleted}
          suffix={`/ ${data.totalPlanned}`}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-blue-600" />
          Takvim Sapma Grafigi (Gun)
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData} layout="vertical" margin={{ left: 120, right: 20, top: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
            <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '11px' }} />
            <YAxis type="category" dataKey="name" stroke="#94a3b8" style={{ fontSize: '10px' }} width={120} />
            <Tooltip
              formatter={(value: number) => [`${value > 0 ? '+' : ''}${value} gun`, 'Sapma']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Bar dataKey="variance" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.variance > 10 ? '#ef4444' : entry.variance > 0 ? '#f59e0b' : '#22c55e'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">Gorev Bazli Sapma Tablosu</h3>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as 'variance' | 'name')}
            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="variance">Sapmaya Gore</option>
            <option value="name">Isme Gore</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Denetim Gorevi</th>
                <th className="px-5 py-3 text-center font-semibold">Durum</th>
                <th className="px-5 py-3 text-center font-semibold">Plan Tarihi</th>
                <th className="px-5 py-3 text-center font-semibold">Gerceklesen</th>
                <th className="px-5 py-3 text-center font-semibold">Gun Sapma</th>
                <th className="px-5 py-3 text-center font-semibold">Saat Sapma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map(eng => {
                const statusCfg = {
                  ON_TRACK: { label: 'Yolunda', cls: 'bg-green-100 text-green-700' },
                  DELAYED: { label: 'Gecikmeli', cls: 'bg-amber-100 text-amber-700' },
                  CRITICAL: { label: 'Kritik', cls: 'bg-red-100 text-red-700' },
                  COMPLETED: { label: 'Tamamlandi', cls: 'bg-blue-100 text-blue-700' },
                  NOT_STARTED: { label: 'Baslamadi', cls: 'bg-slate-100 text-slate-600' },
                }[eng.status];

                return (
                  <tr key={eng.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{eng.name}</td>
                    <td className="px-5 py-3 text-center">
                      <span className={clsx('text-[10px] font-bold px-2.5 py-1 rounded-lg', statusCfg.cls)}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-slate-500">
                      {new Date(eng.plannedStart).toLocaleDateString('tr-TR')} - {new Date(eng.plannedEnd).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-5 py-3 text-center text-xs text-slate-500">
                      {eng.actualStart ? new Date(eng.actualStart).toLocaleDateString('tr-TR') : '-'}
                      {eng.actualEnd ? ` - ${new Date(eng.actualEnd).toLocaleDateString('tr-TR')}` : ''}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={clsx(
                        'text-xs font-bold flex items-center justify-center gap-1',
                        eng.varianceDays > 0 ? 'text-red-600' : eng.varianceDays < 0 ? 'text-green-600' : 'text-slate-500'
                      )}>
                        {eng.varianceDays > 0 ? <ArrowUp size={12} /> : eng.varianceDays < 0 ? <ArrowDown size={12} /> : null}
                        {eng.varianceDays > 0 ? '+' : ''}{eng.varianceDays}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={clsx(
                        'text-xs font-bold',
                        eng.varianceHours > 0 ? 'text-red-600' : eng.varianceHours < 0 ? 'text-green-600' : 'text-slate-500'
                      )}>
                        {eng.varianceHours > 0 ? '+' : ''}{eng.varianceHours}h
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function GaugeCard({ label, value, suffix, icon: Icon, color }: {
  label: string;
  value: number;
  suffix?: string;
  icon: typeof Gauge;
  color: 'green' | 'amber' | 'red';
}) {
  const colorMap = {
    green: 'text-green-600 bg-green-50 border-green-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    red: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <div className={clsx('rounded-xl border p-5', colorMap[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium opacity-80">{label}</span>
        <Icon size={18} />
      </div>
      <p className="text-2xl font-black">
        {value}
        {suffix && <span className="text-sm font-medium opacity-60 ml-1">{suffix}</span>}
      </p>
    </div>
  );
}
