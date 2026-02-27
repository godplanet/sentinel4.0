import { useState, useEffect } from 'react';
import { Globe, Loader2, ShieldAlert, Clock, CheckCircle2, Send } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';

interface VendorRow {
  name: string;
  risk_tier: string;
  criticality_score: number;
  status: string;
}

interface AssessmentRow {
  status: string;
  risk_score: number | null;
  vendor_id: string;
}

const STATUS_COLORS: Record<string, { color: string; label: string; icon: typeof CheckCircle2 }> = {
  Completed: { color: '#10b981', label: 'Tamamlandi', icon: CheckCircle2 },
  'In Progress': { color: '#3b82f6', label: 'Devam Ediyor', icon: Clock },
  Sent: { color: '#f59e0b', label: 'Gonderildi', icon: Send },
  Pending: { color: '#94a3b8', label: 'Bekliyor', icon: Clock },
};

export function VendorCard() {
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [assessments, setAssessments] = useState<AssessmentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [vRes, aRes] = await Promise.all([
        supabase.from('tprm_vendors').select('name, risk_tier, criticality_score, status'),
        supabase.from('tprm_assessments').select('status, risk_score, vendor_id'),
      ]);
      if (vRes.data) setVendors(vRes.data);
      if (aRes.data) setAssessments(aRes.data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center justify-center min-h-[320px]">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const tier1 = vendors.filter((v) => v.risk_tier === 'Tier 1');
  const criticalVendors = vendors.filter((v) => v.criticality_score >= 85);
  const activeAssessments = assessments.filter((a) => a.status !== 'Completed');

  const statusCounts = assessments.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  const donutData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_COLORS[status]?.label || status,
    value: count,
    color: STATUS_COLORS[status]?.color || '#94a3b8',
  }));

  const avgRisk = assessments.filter((a) => a.risk_score !== null);
  const avgRiskScore = avgRisk.length > 0
    ? Math.round(avgRisk.reduce((s, a) => s + (a.risk_score || 0), 0) / avgRisk.length)
    : 0;

  return (
    <div className="bg-gradient-to-br from-sky-50/80 to-blue-50/50 border-2 border-sky-200/60 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-sky-100/50">
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-sky-100 rounded-xl flex items-center justify-center">
              <Globe size={18} className="text-sky-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tedarikci Ekosistemi</h3>
              <p className="text-[10px] text-slate-500 font-medium">Dis Dunya Radari</p>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-100 text-sky-700 border border-sky-200">
            {vendors.length} Tedarikci
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-[100px] h-[100px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#fff"
                >
                  {donutData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={(v: number, name: string) => [v, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-1.5">
            {donutData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                <span className="text-[11px] text-slate-600 flex-1">{item.name}</span>
                <span className="text-[11px] font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-white/70 border border-sky-100 rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-slate-500 font-medium">Tier 1</p>
            <p className="text-lg font-bold text-slate-800">{tier1.length}</p>
          </div>
          <div className="bg-white/70 border border-sky-100 rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-slate-500 font-medium">Kritik Risk</p>
            <p className={clsx('text-lg font-bold', criticalVendors.length > 0 ? 'text-red-600' : 'text-slate-800')}>
              {criticalVendors.length}
            </p>
          </div>
          <div className="bg-white/70 border border-sky-100 rounded-xl p-2.5 text-center">
            <p className="text-[9px] text-slate-500 font-medium">Ort. Risk</p>
            <p className={clsx('text-lg font-bold', avgRiskScore >= 80 ? 'text-red-600' : avgRiskScore >= 50 ? 'text-amber-600' : 'text-emerald-600')}>
              {avgRiskScore}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-sky-100/40 border-t border-sky-200/40">
        <div className="flex items-start gap-2">
          <ShieldAlert size={12} className={clsx(
            'mt-0.5 shrink-0',
            activeAssessments.length > 0 ? 'text-amber-600' : 'text-emerald-600',
          )} />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {activeAssessments.length > 0
              ? `${activeAssessments.length} degerlendirme tedarikci yanitini bekliyor. ${criticalVendors.length} tedarikci kritik risk seviyesinde.`
              : 'Tum tedarikci degerlendirmeleri tamamlandi.'}
          </p>
        </div>
      </div>
    </div>
  );
}
