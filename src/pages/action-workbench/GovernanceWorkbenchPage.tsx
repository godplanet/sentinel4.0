import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Zap, Database, AlertTriangle,
  CheckCircle2, RefreshCw, BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import { GovernanceWorkbench } from '@/widgets/GovernanceWorkbench/ui/GovernanceWorkbench';
import type { ActionAgingMetrics } from '@/entities/action/model/types';

type FilterMode = 'all' | 'bddk' | 'critical' | 'overdue';

const INITIAL: ActionAgingMetrics[] = [];

export default function GovernanceWorkbenchPage() {
  const [dataset,     setDataset]     = useState<ActionAgingMetrics[]>(INITIAL);
  const [filterMode,  setFilterMode]  = useState<FilterMode>('all');
  const [simulating,  setSimulating]  = useState(false);

  const handleSimulate = useCallback(() => {
    setSimulating(true);
    setTimeout(() => {
      setDataset([]);
      setSimulating(false);
    }, 0);
  }, []);

  const handleReset = useCallback(() => {
    setDataset([]);
    setFilterMode('all');
  }, []);

  const filtered = useMemo(() => {
    switch (filterMode) {
      case 'bddk':     return dataset.filter((a) => a.is_bddk_breach);
      case 'critical': return dataset.filter((a) =>
        a.aging_tier === 'TIER_3_CRITICAL' || a.aging_tier === 'TIER_4_BDDK_RED_ZONE',
      );
      case 'overdue':  return dataset.filter((a) =>
        a.operational_delay_days > 0 && a.status !== 'closed',
      );
      default:         return dataset;
    }
  }, [dataset, filterMode]);

  const stats = useMemo(() => ({
    total:    dataset.length,
    bddk:     dataset.filter((a) => a.is_bddk_breach).length,
    critical: dataset.filter((a) =>
      a.aging_tier === 'TIER_3_CRITICAL' || a.aging_tier === 'TIER_4_BDDK_RED_ZONE',
    ).length,
    closed:   dataset.filter((a) => a.status === 'closed').length,
  }), [dataset]);

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <div className="bg-white/70 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-start justify-between gap-6 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-sm">
              <ShieldCheck size={19} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-black text-slate-900 leading-tight">
                Yönetim Kurulu Gözetim Merkezi
              </h1>
              <p className="text-xs text-slate-500">
                Aksiyon &amp; Düzeltici Faaliyet Denetimi · Yönetim Kurulu Görünümü
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <FilterBar
              mode={filterMode}
              onChange={setFilterMode}
              bddkCount={stats.bddk}
              critCount={stats.critical}
            />
            <div className="h-6 w-px bg-slate-200" />
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={11} />
              Sıfırla
            </button>
            <button
              onClick={handleSimulate}
              disabled={simulating}
              className={clsx(
                'flex items-center gap-1.5 px-4 py-2 text-[11px] font-black rounded-lg transition-all shadow-sm',
                simulating
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-slate-900 text-white hover:bg-slate-700',
              )}
            >
              {simulating
                ? <RefreshCw size={12} className="animate-spin" />
                : <Zap size={12} />}
              {simulating ? 'Oluşturuluyor…' : '5.000 Aksiyon Simüle Et'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard icon={Database}      label="Toplam Aksiyon"  value={filtered.length.toLocaleString('tr-TR')} sub="görüntülenen"               color="slate"  />
          <KpiCard icon={AlertTriangle} label="BDDK İhlali"     value={filtered.filter((a) => a.is_bddk_breach).length.toLocaleString('tr-TR')} sub="365+ gün vadesi aşıldı" color="maroon" pulse={stats.bddk > 0} />
          <KpiCard icon={BarChart3}     label="Kritik / T4"     value={filtered.filter((a) => a.aging_tier === 'TIER_3_CRITICAL' || a.aging_tier === 'TIER_4_BDDK_RED_ZONE').length.toLocaleString('tr-TR')} sub="90+ gün gecikmiş" color="red" />
          <KpiCard icon={CheckCircle2}  label="Kapatılan"       value={filtered.filter((a) => a.status === 'closed').length.toLocaleString('tr-TR')} sub="doğrulanmış kapandı" color="green" />
        </div>

        <motion.div
          key={`${dataset.length}-${filterMode}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <GovernanceWorkbench actions={filtered} />
        </motion.div>
      </div>
    </div>
  );
}

function FilterBar({
  mode,
  onChange,
  bddkCount,
  critCount,
}: {
  mode:       FilterMode;
  onChange:   (m: FilterMode) => void;
  bddkCount:  number;
  critCount:  number;
}) {
  const items: { m: FilterMode; label: string; badge?: number; dot?: string }[] = [
    { m: 'all',      label: 'Tümü'            },
    { m: 'bddk',     label: 'BDDK',     badge: bddkCount, dot: 'bg-[#700000]' },
    { m: 'critical', label: 'Kritik',   badge: critCount, dot: 'bg-[#eb0000]' },
    { m: 'overdue',  label: 'Vadesi Geçmiş'   },
  ];

  return (
    <div className="flex items-center gap-1">
      {items.map(({ m, label, badge, dot }) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all',
            mode === m
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
          )}
        >
          {dot && badge !== undefined && badge > 0 && (
            <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', dot)} />
          )}
          {label}
          {badge !== undefined && (
            <span className={clsx(
              'px-1.5 rounded text-[10px]',
              mode === m ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
            )}>
              {badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

const KPI_COLORS = {
  slate:  { bg: 'bg-slate-100',    icon: 'text-slate-600',    val: 'text-slate-900'   },
  maroon: { bg: 'bg-[#700000]/10', icon: 'text-[#700000]',   val: 'text-[#700000]'   },
  red:    { bg: 'bg-rose-100',     icon: 'text-rose-600',     val: 'text-rose-700'    },
  green:  { bg: 'bg-emerald-100',  icon: 'text-emerald-600',  val: 'text-emerald-700' },
};

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  pulse = false,
}: {
  icon:   React.ElementType;
  label:  string;
  value:  string;
  sub?:   string;
  color:  keyof typeof KPI_COLORS;
  pulse?: boolean;
}) {
  const cfg = KPI_COLORS[color];
  return (
    <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center mb-3', cfg.bg)}>
        <Icon size={14} className={clsx(cfg.icon, pulse && 'animate-pulse')} />
      </div>
      <p className={clsx('text-2xl font-black', cfg.val)}>{value}</p>
      <p className="text-[11px] font-bold text-slate-600 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}
