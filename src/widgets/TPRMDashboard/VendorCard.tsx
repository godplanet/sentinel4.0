import {
  Building2, ChevronRight, AlertTriangle, CheckCircle, Clock,
  Shield, Globe, Database,
} from 'lucide-react';
import clsx from 'clsx';
import type { TPRMVendorSummary } from '@/features/tprm';

const TIER_CFG: Record<string, { bg: string; text: string; ring: string; label: string }> = {
  'Tier 1': { bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200', label: 'Kritik' },
  'Tier 2': { bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200', label: 'Yuksek' },
  'Tier 3': { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', label: 'Dusuk' },
};

const STATUS_CFG: Record<string, { icon: React.ElementType; color: string }> = {
  Active: { icon: CheckCircle, color: 'text-emerald-500' },
  'Under Review': { icon: Clock, color: 'text-amber-500' },
  Inactive: { icon: AlertTriangle, color: 'text-slate-400' },
  Terminated: { icon: AlertTriangle, color: 'text-red-500' },
};

const ACCESS_CFG: Record<string, string> = {
  Full: 'text-red-600 bg-red-50',
  Limited: 'text-amber-600 bg-amber-50',
  None: 'text-emerald-600 bg-emerald-50',
};

interface Props {
  vendor: TPRMVendorSummary;
  onClick: () => void;
}

export const VendorCard = ({ vendor, onClick }: Props) => {
  const tier = TIER_CFG[vendor.risk_tier] || TIER_CFG['Tier 3'];
  const statusCfg = STATUS_CFG[vendor.status] || STATUS_CFG.Active;
  const StatusIcon = statusCfg.icon;
  const accessClass = ACCESS_CFG[vendor.data_access_level] || ACCESS_CFG.None;

  const scoreColor = vendor.criticality_score >= 80
    ? 'text-red-600'
    : vendor.criticality_score >= 50
      ? 'text-amber-600'
      : 'text-emerald-600';

  return (
    <button
      onClick={onClick}
      className={clsx(
        'group relative w-full text-left rounded-2xl border p-5 transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5 hover:border-slate-300',
        'bg-white border-slate-200/80 shadow-sm',
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            <Building2 size={20} className="text-slate-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 group-hover:text-slate-900 line-clamp-1">
              {vendor.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusIcon size={12} className={statusCfg.color} />
              <span className="text-[10px] font-medium text-slate-400">{vendor.status}</span>
              {vendor.country && (
                <>
                  <Globe size={10} className="text-slate-300" />
                  <span className="text-[10px] text-slate-400">{vendor.country}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full ring-1', tier.bg, tier.text, tier.ring)}>
          {vendor.risk_tier}
        </span>
      </div>

      {vendor.category && (
        <span className="inline-block text-[10px] font-medium text-slate-500 bg-slate-50 rounded px-2 py-0.5 mb-3">
          {vendor.category}
        </span>
      )}

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className={clsx('text-lg font-black', scoreColor)}>{vendor.criticality_score}</div>
          <div className="text-[9px] font-semibold text-slate-400 uppercase">Kritiklik</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="text-lg font-black text-slate-700">{vendor.total_assessments}</div>
          <div className="text-[9px] font-semibold text-slate-400 uppercase">Anket</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-2 text-center">
          <div className="text-lg font-black text-slate-700">
            {vendor.avg_risk_score > 0 ? `%${vendor.avg_risk_score}` : '-'}
          </div>
          <div className="text-[9px] font-semibold text-slate-400 uppercase">Risk Skor</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={clsx('flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded', accessClass)}>
            <Database size={10} />
            {vendor.data_access_level} Erisim
          </span>
          {vendor.active_assessments > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              <Clock size={10} />
              {vendor.active_assessments} Devam Eden
            </span>
          )}
        </div>
        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
};
