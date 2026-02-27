import { Shield, AlertTriangle, CheckCircle, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import type { FrameworkCoverageStats } from '@/features/compliance';

const AUTHORITY_CONFIG: Record<string, { color: string; bg: string; ring: string; icon: string }> = {
  BDDK: { color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-200', icon: 'bg-red-600' },
  'KVK Kurumu': { color: 'text-blue-700', bg: 'bg-blue-50', ring: 'ring-blue-200', icon: 'bg-blue-600' },
  ISO: { color: 'text-emerald-700', bg: 'bg-emerald-50', ring: 'ring-emerald-200', icon: 'bg-emerald-600' },
  ISACA: { color: 'text-amber-700', bg: 'bg-amber-50', ring: 'ring-amber-200', icon: 'bg-amber-600' },
};

const DEFAULT_CFG = { color: 'text-slate-700', bg: 'bg-slate-50', ring: 'ring-slate-200', icon: 'bg-slate-600' };

interface Props {
  stat: FrameworkCoverageStats;
  onClick: () => void;
}

export const FrameworkCard = ({ stat, onClick }: Props) => {
  const cfg = AUTHORITY_CONFIG[stat.authority] || DEFAULT_CFG;
  const pct = Number(stat.coverage_pct);
  const isHealthy = pct >= 70;

  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative w-full text-left rounded-2xl border p-5 transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300',
        'bg-white border-slate-200/80 shadow-sm',
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shadow-sm', cfg.icon)}>
          <Shield size={20} className="text-white" />
        </div>
        <span
          className={clsx(
            'inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ring-1',
            cfg.bg, cfg.color, cfg.ring,
          )}
        >
          {stat.short_code}
        </span>
      </div>

      <h3 className="text-sm font-bold text-slate-800 mb-1 line-clamp-2 leading-snug group-hover:text-slate-900">
        {stat.name}
      </h3>
      <p className="text-xs text-slate-400 mb-4">{stat.authority} | v{stat.short_code?.split('-')[1] || '1.0'}</p>

      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-500">Kapsam Orani</span>
          <span className={clsx('text-sm font-black', pct >= 70 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-600')}>
            %{pct}
          </span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full transition-all duration-700',
              pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-600 font-medium">
            <CheckCircle size={13} />
            {stat.covered_requirements} Kapsanan
          </span>
          {stat.gap_count > 0 && (
            <span className="flex items-center gap-1 text-red-500 font-medium">
              <AlertTriangle size={13} />
              {stat.gap_count} Gap
            </span>
          )}
        </div>
        <ChevronRight
          size={16}
          className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </button>
  );
};
