import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
  ReferenceLine,
} from 'recharts';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import clsx from 'clsx';
import type { BenfordDigitResult } from '@/features/ccm/types';

interface Props {
  digits: BenfordDigitResult[];
  chiSquared: number;
  isAnomaly: boolean;
  totalInvoices: number;
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: BenfordDigitResult }> }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  const isDeviant = Math.abs(d.deviation) > 5;
  return (
    <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl">
      <div className="font-bold mb-1">Rakam {d.digit}</div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Beklenen:</span>
        <span>%{d.expected}</span>
      </div>
      <div className="flex justify-between gap-4">
        <span className="text-slate-400">Gercek:</span>
        <span className={isDeviant ? 'text-red-400 font-bold' : ''}>%{d.actual}</span>
      </div>
      <div className="flex justify-between gap-4 border-t border-slate-700 mt-1 pt-1">
        <span className="text-slate-400">Sapma:</span>
        <span className={isDeviant ? 'text-red-400 font-bold' : 'text-emerald-400'}>
          {d.deviation > 0 ? '+' : ''}{d.deviation}%
        </span>
      </div>
      <div className="text-slate-500 mt-1">{d.count} fatura</div>
    </div>
  );
}

export function BenfordChart({ digits, chiSquared, isAnomaly, totalInvoices }: Props) {
  const maxDeviatingDigit = digits.reduce(
    (max, d) => (Math.abs(d.deviation) > Math.abs(max.deviation) ? d : max),
    digits[0],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-200 rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Benford Yasasi Analizi</h3>
            <p className="text-xs text-slate-500">
              {totalInvoices} faturanin ilk basamak dagilimi
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-bold',
              isAnomaly
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
            )}
          >
            Chi-kare = {chiSquared.toFixed(1)}
          </div>
          <div
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-bold',
              isAnomaly
                ? 'bg-red-600 text-white'
                : 'bg-emerald-600 text-white',
            )}
          >
            {isAnomaly ? 'SAPMA TESPIT EDILDI' : 'NORMAL DAGILIM'}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={digits} barGap={6} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="digit"
            tick={{ fontSize: 12, fontWeight: 600 }}
            axisLine={{ stroke: '#e2e8f0' }}
            tickLine={false}
          />
          <YAxis
            unit="%"
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            iconType="square"
            iconSize={8}
          />
          <ReferenceLine y={0} stroke="#e2e8f0" />
          <Bar
            dataKey="expected"
            name="Beklenen (%)"
            fill="#cbd5e1"
            radius={[3, 3, 0, 0]}
            opacity={0.6}
          />
          <Bar dataKey="actual" name="Gercek (%)" radius={[3, 3, 0, 0]}>
            {digits.map((d, i) => (
              <Cell
                key={i}
                fill={Math.abs(d.deviation) > 5 ? '#ef4444' : '#0d9488'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {isAnomaly && maxDeviatingDigit && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
            !
          </div>
          <div className="text-xs text-red-800">
            <span className="font-bold">Anomali:</span> Rakam {maxDeviatingDigit.digit} beklenen
            %{maxDeviatingDigit.expected} yerine %{maxDeviatingDigit.actual} oraninda goruldu
            ({maxDeviatingDigit.deviation > 0 ? '+' : ''}{maxDeviatingDigit.deviation}% sapma).
            Bu dagilim dogal fatura verilerinde beklenmez.
          </div>
        </div>
      )}
    </motion.div>
  );
}
