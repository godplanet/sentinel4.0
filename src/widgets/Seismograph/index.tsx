import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { SeismographPoint } from '@/entities/probe/model/types';

interface SeismographProps {
  data: SeismographPoint[];
  loading?: boolean;
}

function PulsingDot({ color }: { color: string }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.6, 1], opacity: [1, 0.5, 1] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className="w-2.5 h-2.5 rounded-full"
      style={{ backgroundColor: color }}
    />
  );
}

export function Seismograph({ data, loading }: SeismographProps) {
  const [animatedData, setAnimatedData] = useState<SeismographPoint[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      const items: SeismographPoint[] = [];
      data.forEach((pt, i) => {
        setTimeout(() => {
          items.push(pt);
          setAnimatedData([...items]);
        }, i * 30);
      });
    }
  }, [data]);

  const totalExceptions = data.reduce((s, d) => s + d.exceptions, 0);
  const peakHour = data.reduce((max, d) => (d.exceptions > max.exceptions ? d : max), data[0] || { label: '-', exceptions: 0 });
  const isAlertActive = totalExceptions > 20;

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-2xl p-6 animate-pulse h-[320px]" />
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />
      </div>

      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Activity className="text-emerald-400" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Canli Sismograf
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Son 24 saat istisna akisi</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-1.5">
              <PulsingDot color={isAlertActive ? '#ef4444' : '#22c55e'} />
              <span className={`text-xs font-bold ${isAlertActive ? 'text-red-400' : 'text-emerald-400'}`}>
                {isAlertActive ? 'ALARM AKTIF' : 'NORMAL'}
              </span>
            </div>

            <div className="text-right">
              <p className="text-2xl font-black text-white tabular-nums">{totalExceptions}</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Istisna</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="flex-1 bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={13} className="text-emerald-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Zirve Saati</span>
            </div>
            <p className="text-sm font-bold text-white">{peakHour?.label || '-'}</p>
          </div>
          <div className="flex-1 bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={13} className="text-amber-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Zirve Istisna</span>
            </div>
            <p className="text-sm font-bold text-white">{peakHour?.exceptions ?? 0}</p>
          </div>
          <div className="flex-1 bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <Activity size={13} className="text-blue-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ort / Saat</span>
            </div>
            <p className="text-sm font-bold text-white">
              {data.length > 0 ? (totalExceptions / data.length).toFixed(1) : '0'}
            </p>
          </div>
        </div>

        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={animatedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="seismoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                  <stop offset="50%" stopColor="#eab308" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="seismoLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#eab308" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                interval={2}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f1f5f9',
                }}
                formatter={(value: number) => [`${value} istisna`, 'Tespit']}
              />
              <Area
                type="monotone"
                dataKey="exceptions"
                stroke="url(#seismoLine)"
                strokeWidth={2.5}
                fill="url(#seismoGradient)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
