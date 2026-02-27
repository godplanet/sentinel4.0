import { useMemo } from 'react';
import {
  useEsgPillarSummary, useEnrichedDataPoints, useEsgSocialMetrics, useEsgGreenAssets,
} from '@/entities/esg';
import { ValidationBadge } from '@/features/esg';
import {
  Leaf, TrendingDown, TrendingUp, Users, Building2, Globe,
  ShieldCheck, AlertTriangle, Loader2, Lock, Droplets, Zap,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const PERIOD = '2026-Q1';

export const PlanetPulse = () => {
  const { data: pillars, isLoading } = useEsgPillarSummary(PERIOD);
  const { data: enriched } = useEnrichedDataPoints(PERIOD);
  const { data: socialMetrics } = useEsgSocialMetrics();
  const { data: greenAssets } = useEsgGreenAssets();

  const envMetrics = useMemo(() =>
    (enriched || []).filter((d) => d.metric.pillar === 'E'), [enriched]);
  const flagged = useMemo(() =>
    (enriched || []).filter((d) => d.ai_validation_status === 'Flagged'), [enriched]);

  const carbonData = useMemo(() => {
    const scope1 = envMetrics.find((m) => m.metric.code === 'GRI 305-1');
    const scope2 = envMetrics.find((m) => m.metric.code === 'GRI 305-2');
    if (!scope1 || !scope2) return [];
    return [
      { period: 'Onceki', scope1: scope1.previous_value || 0, scope2: scope2.previous_value || 0 },
      { period: PERIOD, scope1: scope1.value, scope2: scope2.value },
    ];
  }, [envMetrics]);

  const garData = useMemo(() =>
    (greenAssets || []).map((g) => ({
      period: g.period,
      gar: g.taxonomy_aligned_pct,
      greenLoans: +(g.green_loans_try / 1e9).toFixed(1),
      greenBonds: +(g.green_bonds_try / 1e9).toFixed(1),
    })),
  [greenAssets]);

  const diversityData = useMemo(() => {
    const latest = socialMetrics?.length ? socialMetrics[socialMetrics.length - 1] : null;
    if (!latest) return null;
    const womenMgmtPct = latest.total_employees > 0
      ? Math.round((latest.women_management / latest.total_employees) * 100 * 10) / 10
      : 0;
    return { ...latest, womenMgmtPct };
  }, [socialMetrics]);

  const socialTrend = useMemo(() =>
    (socialMetrics || []).map((s) => ({
      period: s.period,
      gap: s.gender_pay_gap_pct,
      training: s.training_hours_per_employee,
      turnover: s.employee_turnover_pct,
    })),
  [socialMetrics]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-950 p-8 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-cyan-400/10 to-transparent rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Planet Pulse</h2>
              <span className="text-xs text-emerald-300/80">ESG & Surdurulebilirlik Gozetim Merkezi - {PERIOD}</span>
            </div>
          </div>

          {pillars && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              {pillars.map((p) => (
                <div key={p.pillar} className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    {p.pillar === 'E' && <Leaf size={16} className="text-emerald-400" />}
                    {p.pillar === 'S' && <Users size={16} className="text-cyan-400" />}
                    {p.pillar === 'G' && <Building2 size={16} className="text-amber-400" />}
                    <span className="text-xs font-bold text-white/70">
                      {p.pillar === 'E' ? 'CEVRE' : p.pillar === 'S' ? 'SOSYAL' : 'YONETISIM'}
                    </span>
                  </div>
                  <div className="text-3xl font-black">{p.validated}/{p.totalMetrics}</div>
                  <div className="text-[10px] text-white/50 mt-1">Dogrulanan Metrik</div>
                  <div className="flex items-center gap-2 mt-2">
                    {p.flagged > 0 && (
                      <span className="text-[9px] font-bold bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">{p.flagged} Bayrakli</span>
                    )}
                    <span className="text-[9px] font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">{p.onTarget} Hedefe Uygun</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Zap size={14} className="text-emerald-600" />
            Karbon Ayak Izi (Kapsam 1 vs 2)
          </h3>
          {carbonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={carbonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="scope1" name="Kapsam 1" stroke="#059669" fill="#059669" fillOpacity={0.15} strokeWidth={2} />
                <Area type="monotone" dataKey="scope2" name="Kapsam 2" stroke="#0891b2" fill="#0891b2" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Veri bulunamadi</p>
          )}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-slate-500">Kapsam 1 (Dogrudan)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-cyan-500" />
              <span className="text-[10px] text-slate-500">Kapsam 2 (Enerji)</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Leaf size={14} className="text-teal-600" />
            Yesil Varlik Orani (GAR) Trendi
          </h3>
          {garData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={garData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="gar" name="GAR %" stroke="#0d9488" strokeWidth={3} dot={{ r: 5, fill: '#0d9488' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Veri bulunamadi</p>
          )}
          {garData.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-teal-50 rounded-lg p-2.5 text-center">
                <div className="text-lg font-black text-teal-700">{garData[garData.length - 1].greenLoans}B</div>
                <div className="text-[9px] text-teal-600">Yesil Kredi (TRY)</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-2.5 text-center">
                <div className="text-lg font-black text-emerald-700">{garData[garData.length - 1].greenBonds}B</div>
                <div className="text-[9px] text-emerald-600">Yesil Tahvil (TRY)</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Users size={14} className="text-cyan-600" />
            Cesitlilik & Sosyal Etki
          </h3>
          {diversityData && (
            <div className="space-y-4">
              <DiversityGauge label="Ust Yonetimde Kadin" value={diversityData.womenMgmtPct} target={35} />
              <DiversityGauge
                label="YK'da Kadin"
                value={diversityData.women_board > 0 ? Math.round((diversityData.women_board / 9) * 100) : 0}
                target={30}
              />
              <div className="grid grid-cols-3 gap-3 mt-4">
                <MiniStat label="Ucret Farki" value={`%${diversityData.gender_pay_gap_pct}`} target="%5" icon={TrendingDown} good={diversityData.gender_pay_gap_pct <= 5} />
                <MiniStat label="Egitim Saati" value={`${diversityData.training_hours_per_employee}h`} target="40h" icon={TrendingUp} good={diversityData.training_hours_per_employee >= 40} />
                <MiniStat label="Is Kazasi" value={String(diversityData.workplace_injuries)} target="0" icon={ShieldCheck} good={diversityData.workplace_injuries === 0} />
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <TrendingDown size={14} className="text-blue-600" />
            Sosyal Gosterge Trendi
          </h3>
          {socialTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={socialTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="gap" name="Ucret Farki %" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="training" name="Egitim Saati" stroke="#0891b2" strokeWidth={2} />
                <Line type="monotone" dataKey="turnover" name="Isgucu Devri %" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-xs text-slate-400 text-center py-8">Veri bulunamadi</p>
          )}
        </motion.div>
      </div>

      {flagged.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-red-50/80 backdrop-blur-xl rounded-2xl border border-red-200/60 shadow-lg p-6"
        >
          <h3 className="text-sm font-bold text-red-700 mb-4 flex items-center gap-2">
            <AlertTriangle size={14} />
            Green Skeptic Alarmlari ({flagged.length})
          </h3>
          <div className="space-y-3">
            {flagged.map((dp) => (
              <div key={dp.id} className="bg-white rounded-lg border border-red-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700">{dp.metric.code}</span>
                    <span className="text-xs text-slate-500">{dp.metric.name}</span>
                  </div>
                  <ValidationBadge status={dp.ai_validation_status} confidence={dp.ai_confidence} />
                </div>
                <div className="text-[10px] text-red-700 font-mono whitespace-pre-wrap bg-red-50 rounded p-2">
                  {dp.ai_notes}
                </div>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                  <span>Beyan: {dp.value} {dp.metric.unit}</span>
                  {dp.previous_value != null && <span>Onceki: {dp.previous_value} {dp.metric.unit}</span>}
                  <span>Gonderen: {dp.submitted_by}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Lock size={14} className="text-slate-400" />
          Tum Veri Kayitlari (Cryo-Chamber)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Kod</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Metrik</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Deger</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Hedef</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Durum</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Guven</th>
                <th className="px-3 py-2 text-[10px] font-bold text-slate-500 uppercase">Hash</th>
              </tr>
            </thead>
            <tbody>
              {(enriched || []).map((dp) => {
                const isOnTarget = dp.metric.target_value != null && dp.metric.target_direction
                  ? dp.metric.target_direction === 'below' ? dp.value <= dp.metric.target_value
                    : dp.metric.target_direction === 'above' ? dp.value >= dp.metric.target_value
                    : dp.value === dp.metric.target_value
                  : null;

                return (
                  <tr key={dp.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-3 py-2.5">
                      <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded',
                        dp.metric.pillar === 'E' ? 'bg-emerald-50 text-emerald-700' :
                        dp.metric.pillar === 'S' ? 'bg-cyan-50 text-cyan-700' :
                        'bg-amber-50 text-amber-700',
                      )}>{dp.metric.code}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-600 max-w-[200px] truncate">{dp.metric.name}</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-slate-700">
                      {dp.value} {dp.metric.unit}
                      {dp.previous_value != null && (
                        <span className={clsx('ml-1 text-[9px]',
                          dp.value < dp.previous_value ? 'text-emerald-600' : 'text-red-500',
                        )}>
                          {dp.value < dp.previous_value ? <TrendingDown size={9} className="inline" /> : <TrendingUp size={9} className="inline" />}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-slate-400">
                      {dp.metric.target_value != null ? `${dp.metric.target_direction === 'below' ? '<' : '>'} ${dp.metric.target_value}` : '-'}
                      {isOnTarget != null && (
                        <span className={clsx('ml-1', isOnTarget ? 'text-emerald-600' : 'text-red-500')}>
                          {isOnTarget ? 'OK' : 'X'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5"><ValidationBadge status={dp.ai_validation_status} confidence={dp.ai_confidence} /></td>
                    <td className="px-3 py-2.5">
                      {dp.ai_confidence != null ? (
                        <span className={clsx('text-[10px] font-bold',
                          dp.ai_confidence >= 70 ? 'text-emerald-600' : dp.ai_confidence >= 40 ? 'text-amber-600' : 'text-red-600',
                        )}>%{dp.ai_confidence}</span>
                      ) : <span className="text-[10px] text-slate-300">-</span>}
                    </td>
                    <td className="px-3 py-2.5 text-[9px] font-mono text-slate-400 flex items-center gap-1">
                      {dp.is_frozen && <Lock size={8} className="text-slate-300" />}
                      {dp.record_hash?.slice(0, 10)}...
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

function DiversityGauge({ label, value, target }: { label: string; value: number; target: number }) {
  const pct = Math.min(value, 100);
  const onTarget = value >= target;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-slate-600">{label}</span>
        <div className="flex items-center gap-2">
          <span className={clsx('text-sm font-black', onTarget ? 'text-emerald-600' : 'text-amber-600')}>%{value}</span>
          <span className="text-[10px] text-slate-400">/ Hedef %{target}</span>
        </div>
      </div>
      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={clsx('h-full rounded-full transition-all', onTarget ? 'bg-emerald-500' : 'bg-amber-500')}
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 bg-slate-400"
          style={{ left: `${Math.min(target, 100)}%` }}
        />
      </div>
    </div>
  );
}

function MiniStat({ label, value, target, icon: Icon, good }: {
  label: string; value: string; target: string; icon: React.ElementType; good: boolean;
}) {
  return (
    <div className={clsx('rounded-lg p-3 text-center', good ? 'bg-emerald-50' : 'bg-amber-50')}>
      <Icon size={14} className={clsx('mx-auto mb-1', good ? 'text-emerald-600' : 'text-amber-600')} />
      <div className={clsx('text-lg font-black', good ? 'text-emerald-700' : 'text-amber-700')}>{value}</div>
      <div className="text-[9px] text-slate-500">{label} (Hedef: {target})</div>
    </div>
  );
}
