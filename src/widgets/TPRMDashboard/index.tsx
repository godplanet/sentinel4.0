import { useMemo } from 'react';
import { useVendors, type TPRMVendorSummary } from '@/features/tprm';
import { VendorCard } from './VendorCard';
import {
  Building2, AlertTriangle, Shield, Activity, Loader2, AlertCircle, Database,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  onVendorClick: (id: string) => void;
}

export const TPRMDashboard = ({ onVendorClick }: Props) => {
  const { data: vendors, isLoading, error } = useVendors();

  const metrics = useMemo(() => {
    if (!vendors?.length) return { total: 0, tier1: 0, tier2: 0, tier3: 0, underReview: 0, avgCriticality: 0, fullAccess: 0, tierData: [] };
    const tier1 = vendors.filter((v) => v.risk_tier === 'Tier 1').length;
    const tier2 = vendors.filter((v) => v.risk_tier === 'Tier 2').length;
    const tier3 = vendors.filter((v) => v.risk_tier === 'Tier 3').length;
    return {
      total: vendors.length,
      tier1,
      tier2,
      tier3,
      underReview: vendors.filter((v) => v.status === 'Under Review').length,
      avgCriticality: Math.round(vendors.reduce((s, v) => s + v.criticality_score, 0) / vendors.length),
      fullAccess: vendors.filter((v) => v.data_access_level === 'Full').length,
      tierData: [
        { name: 'Tier 1', value: tier1, color: '#ef4444' },
        { name: 'Tier 2', value: tier2, color: '#f59e0b' },
        { name: 'Tier 3', value: tier3, color: '#10b981' },
      ],
    };
  }, [vendors]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-3 text-sm text-slate-500">Yukleniyor...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="text-sm">Veri yuklenirken hata olustu</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={Building2} label="Toplam Tedarikcier" value={metrics.total} color="bg-slate-600" />
        <MetricCard icon={AlertTriangle} label="Tier 1 (Kritik)" value={metrics.tier1} color="bg-red-600" />
        <MetricCard icon={Shield} label="Tier 2 (Yuksek)" value={metrics.tier2} color="bg-amber-600" />
        <MetricCard icon={Activity} label="Ort. Kritiklik" value={metrics.avgCriticality} color="bg-blue-600" />
        <MetricCard icon={Database} label="Tam Erisim" value={metrics.fullAccess} color="bg-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-700 mb-1">Risk Tier Dagilimi</h3>
          <p className="text-xs text-slate-400 mb-4">Tedarikciler seviyeye gore</p>
          <div className="relative w-36 h-36 mx-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={42}
                  outerRadius={60}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {metrics.tierData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-800">{metrics.total}</span>
              <span className="text-[9px] font-semibold text-slate-400 uppercase">Toplam</span>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {metrics.tierData.map((t) => (
              <div key={t.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  <span className="font-medium text-slate-600">{t.name}</span>
                </div>
                <span className="font-bold text-slate-700">{t.value}</span>
              </div>
            ))}
          </div>

          {metrics.underReview > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-amber-600 text-xs font-bold bg-amber-50 rounded-lg px-3 py-2">
                <AlertTriangle size={14} />
                {metrics.underReview} tedarikcier gozden gecirme bekliyor
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(vendors || []).map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onClick={() => onVendorClick(vendor.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

function MetricCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} shadow-sm`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-lg font-black text-slate-800">{value}</div>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}
