import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flame,
  TrendingUp,
  User,
} from 'lucide-react';
import type { BudgetSummary } from '../time-tracking';

export interface AuditorCostEntry {
  id: string;
  name: string;
  title: string;
  hoursLogged: number;
  hourlyRate: number;
}

export interface CostEngineProps {
  budget?: BudgetSummary;
  auditorCosts?: AuditorCostEntry[];
  allocatedBudgetOverride?: number;
  currency?: string;
}

const DEFAULT_AUDITORS: AuditorCostEntry[] = [
  { id: 'a1', name: 'Hilmi Duru',    title: 'Baş Denetçi',       hoursLogged: 100, hourlyRate: 600 },
  { id: 'a2', name: 'Ayşe Kaya',    title: 'Kıdemli Analist',   hoursLogged: 85,  hourlyRate: 400 },
  { id: 'a3', name: 'Emre Şahin',   title: 'Analist',           hoursLogged: 70,  hourlyRate: 300 },
  { id: 'a4', name: 'Zeynep Arslan', title: 'Asistan Denetçi',  hoursLogged: 40,  hourlyRate: 250 },
];

const MOCK_BUDGET: BudgetSummary = {
  engagement_id: 'mock',
  title: 'Finansal Maliyet Motoru',
  estimated_hours: 250,
  actual_hours: 295,
  variance_hours: -45,
  utilization_percent: 83,
  budget_status: 'ON_BUDGET',
};

const DEFAULT_ALLOCATED = 150_000;

function formatTRY(value: number): string {
  return `₺${value.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);
  const animRef = useRef<ReturnType<typeof requestAnimationFrame>>();

  useEffect(() => {
    const start = displayed;
    const end   = value;
    const dur   = 900;
    const t0    = performance.now();
    const tick  = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(start + (end - start) * e));
      if (p < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [value]);

  return <>{formatTRY(displayed)}</>;
}

export function BudgetTrackerCard({
  budget        = MOCK_BUDGET,
  auditorCosts  = DEFAULT_AUDITORS,
  allocatedBudgetOverride = DEFAULT_ALLOCATED,
}: CostEngineProps) {
  const [expanded, setExpanded] = useState(false);

  const totalBurn = auditorCosts.reduce(
    (sum, a) => sum + a.hoursLogged * a.hourlyRate,
    0,
  );

  const allocated    = allocatedBudgetOverride;
  const remaining    = Math.max(0, allocated - totalBurn);
  const burnPercent  = allocated > 0 ? Math.min((totalBurn / allocated) * 100, 200) : 0;

  const isOverBudget = burnPercent >= 100;
  const isWarning    = burnPercent >= 80 && !isOverBudget;

  const barColor = isOverBudget
    ? 'from-red-500 to-rose-500'
    : isWarning
    ? 'from-amber-400 to-orange-400'
    : 'from-emerald-500 to-teal-400';

  const totalHours    = auditorCosts.reduce((s, a) => s + a.hoursLogged, 0);
  const burnPerHour   = totalHours > 0 ? totalBurn / totalHours : 0;

  return (
    <div className="bg-white shadow-sm border border-slate-200 rounded-xl overflow-hidden">
      {isOverBudget && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-200"
        >
          <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-mono font-bold tracking-widest text-red-700 uppercase">
            BÜTÇE AŞIMI — Acil Eskalasyon Gerekiyor
          </span>
        </motion.div>
      )}

      {isWarning && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <span className="text-[11px] font-mono font-semibold tracking-wider text-amber-700 uppercase">
            Harcama Uyarısı — Bütçenin %{Math.round(burnPercent)}'i kullanıldı
          </span>
        </motion.div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400">
                Maliyet Motoru
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              Finansal Maliyet Motoru (Cost Engine)
            </h3>
          </div>

          <div className={`
            flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border
            ${isOverBudget
              ? 'bg-red-50 border-red-200 text-red-700'
              : isWarning
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'}
          `}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              isOverBudget ? 'bg-red-500 animate-ping' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
            {isOverBudget ? 'Aşım' : isWarning ? 'Uyarı' : 'Sağlıklı'}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mb-1">
              Ayrılan Bütçe
            </p>
            <p className="text-base font-black text-slate-900 font-mono leading-none">
              <AnimatedNumber value={allocated} />
            </p>
          </div>

          <div className={`rounded-lg border p-3 ${
            isOverBudget ? 'bg-red-50 border-red-200' : isWarning ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mb-1">
              Kullanılan
            </p>
            <p className={`text-base font-black font-mono leading-none ${
              isOverBudget ? 'text-red-700' : isWarning ? 'text-amber-700' : 'text-slate-900'
            }`}>
              <AnimatedNumber value={totalBurn} />
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono mb-1">
              Kalan
            </p>
            <p className="text-base font-black text-slate-900 font-mono leading-none">
              <AnimatedNumber value={remaining} />
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              Harcama Oranı
            </span>
            <span className={`text-xs font-black font-mono ${
              isOverBudget ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-emerald-600'
            }`}>
              {Math.round(burnPercent)}%
            </span>
          </div>

          <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min(burnPercent, 100)}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-slate-400 font-mono">₺0</span>
            <span className="text-[9px] text-slate-400 font-mono">
              80% = {formatTRY(allocated * 0.8)}
            </span>
            <span className="text-[9px] text-slate-400 font-mono">{formatTRY(allocated)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-3.5 h-3.5 ${isOverBudget ? 'text-red-500' : 'text-slate-400'}`} />
            <span className="text-[10px] text-slate-500 font-mono">Saatlik Harcama</span>
          </div>
          <span className={`text-xs font-black font-mono ${
            isOverBudget ? 'text-red-600' : isWarning ? 'text-amber-700' : 'text-slate-700'
          }`}>
            {formatTRY(burnPerHour)}/sa
          </span>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest"
        >
          <div className="flex items-center gap-1.5">
            <User className="w-3 h-3" />
            Denetçi Dağılımı ({auditorCosts.length})
          </div>
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="pt-2 space-y-1.5">
                {auditorCosts.map((a) => {
                  const cost  = a.hoursLogged * a.hourlyRate;
                  const share = totalBurn > 0 ? (cost / totalBurn) * 100 : 0;
                  return (
                    <div key={a.id} className="rounded-lg bg-slate-50 border border-slate-100 px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-600">
                            {a.name.split(' ').map((n) => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold text-slate-800 leading-none">{a.name}</p>
                            <p className="text-[9px] text-slate-400">{a.title}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black font-mono text-slate-700">
                            {formatTRY(cost)}
                          </p>
                          <p className="text-[9px] text-slate-400 font-mono">
                            {a.hoursLogged}sa × {formatTRY(a.hourlyRate)}
                          </p>
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-400"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
