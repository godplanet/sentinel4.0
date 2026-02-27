import { useState, useEffect } from 'react';
import { Leaf, TrendingDown, TrendingUp, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';

interface EsgRow {
  code: string;
  name: string;
  pillar: string;
  value: number;
  previous_value: number | null;
  target_value: number;
  target_direction: string;
  ai_confidence: number;
  period: string;
}

export function EsgCard() {
  const [data, setData] = useState<EsgRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: rows } = await supabase
        .from('esg_ledger')
        .select(`
          value, previous_value, ai_confidence, period,
          esg_standards!inner(code, name, pillar, target_value, target_direction)
        `)
        .eq('period', '2026-Q1')
        .order('created_at', { ascending: false });

      if (rows) {
        const mapped = rows.map((r: Record<string, unknown>) => {
          const std = r.esg_standards as Record<string, unknown>;
          return {
            code: std.code as string,
            name: std.name as string,
            pillar: std.pillar as string,
            value: Number(r.value),
            previous_value: r.previous_value ? Number(r.previous_value) : null,
            target_value: Number(std.target_value),
            target_direction: std.target_direction as string,
            ai_confidence: Number(r.ai_confidence),
            period: r.period as string,
          };
        });
        setData(mapped);
      }
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

  const avgConfidence = data.length > 0
    ? Math.round(data.reduce((s, d) => s + d.ai_confidence, 0) / data.length)
    : 0;

  const onTarget = data.filter((d) =>
    d.target_direction === 'below' ? d.value <= d.target_value : d.value >= d.target_value,
  ).length;
  const onTargetPct = data.length > 0 ? Math.round((onTarget / data.length) * 100) : 0;

  const scope1 = data.find((d) => d.code === 'GRI 305-1');
  const scope1Change = scope1?.previous_value
    ? Math.round(((scope1.value - scope1.previous_value) / scope1.previous_value) * 100)
    : null;

  const pillarData = ['E', 'S', 'G'].map((p) => {
    const items = data.filter((d) => d.pillar === p);
    const met = items.filter((d) =>
      d.target_direction === 'below' ? d.value <= d.target_value : d.value >= d.target_value,
    ).length;
    return {
      pillar: p === 'E' ? 'Cevre' : p === 'S' ? 'Sosyal' : 'Yonetisim',
      pct: items.length > 0 ? Math.round((met / items.length) * 100) : 0,
    };
  });

  const PILLAR_COLORS = ['#10b981', '#3b82f6', '#6366f1'];

  return (
    <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/50 border-2 border-emerald-200/60 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-emerald-100/50">
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Leaf size={18} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">ESG & Surdurulebilirlik</h3>
              <p className="text-[10px] text-slate-500 font-medium">Vicdan Skoru</p>
            </div>
          </div>
          <div className={clsx(
            'px-3 py-1.5 rounded-lg text-xs font-bold border',
            avgConfidence >= 80
              ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
              : avgConfidence >= 60
              ? 'bg-amber-100 text-amber-700 border-amber-200'
              : 'bg-red-100 text-red-700 border-red-200',
          )}>
            {avgConfidence}/100
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/70 border border-emerald-100 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 font-medium mb-1">Hedef Tutturma</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-emerald-700">{onTargetPct}%</span>
              <CheckCircle2 size={14} className="text-emerald-500" />
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">{onTarget}/{data.length} metrik hedefte</p>
          </div>

          <div className="bg-white/70 border border-emerald-100 rounded-xl p-3">
            <p className="text-[10px] text-slate-500 font-medium mb-1">Kapsam 1 Emisyon</p>
            <div className="flex items-center gap-2">
              {scope1Change !== null && scope1Change < 0 ? (
                <>
                  <TrendingDown size={14} className="text-emerald-500" />
                  <span className="text-xl font-bold text-emerald-700">{Math.abs(scope1Change)}%</span>
                </>
              ) : (
                <>
                  <TrendingUp size={14} className="text-red-500" />
                  <span className="text-xl font-bold text-red-600">{scope1Change ?? 0}%</span>
                </>
              )}
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">{scope1?.value?.toLocaleString('tr-TR')} tCO2e</p>
          </div>
        </div>

        <div className="mb-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">E/S/G Pillar Uyumu</p>
          <div className="h-[80px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pillarData} barSize={28}>
                <XAxis dataKey="pillar" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e2e8f0' }}
                  formatter={(v: number) => [`${v}%`, 'Hedef Uyumu']}
                />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {pillarData.map((_, i) => (
                    <Cell key={i} fill={PILLAR_COLORS[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="px-6 py-3 bg-emerald-100/40 border-t border-emerald-200/40">
        <div className="flex items-start gap-2">
          {scope1Change !== null && scope1Change < 0 ? (
            <CheckCircle2 size={12} className="text-emerald-600 mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
          )}
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {scope1Change !== null && scope1Change < 0
              ? `Scope 1 emisyonlari gecen ceyreige gore %${Math.abs(scope1Change)} dustu. Hedef asiminda ${data.length - onTarget} metrik mevcut.`
              : `${data.length - onTarget} ESG metrigi hedef degerinin ustunde. Aksiyon gerektiren alanlar mevcut.`}
          </p>
        </div>
      </div>
    </div>
  );
}
