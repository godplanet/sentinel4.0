import { useMemo } from 'react';
import {
  useSoxCampaigns, useCampaignStats, useControlsWithAttestations, useSoxOutbox,
} from '@/entities/sox';
import {
  ShieldCheck, TrendingUp, AlertTriangle, Clock, CheckCircle, XCircle,
  Lock, Zap, FileCheck, Loader2,
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

export const PresidentDashboard = () => {
  const { data: campaigns, isLoading } = useSoxCampaigns();
  const activeCampaign = campaigns?.find((c) => c.status === 'Active');
  const { data: stats } = useCampaignStats(activeCampaign?.id);
  const { data: controls } = useControlsWithAttestations(activeCampaign?.id);
  const { data: outbox } = useSoxOutbox();

  const pendingEvents = useMemo(() => (outbox || []).filter((e) => e.status === 'Pending').length, [outbox]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!activeCampaign) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">Aktif SOX kampanyasi bulunamadi</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-8 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-teal-500/10 to-transparent rounded-full blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-lg flex items-center justify-center border border-white/10">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-black">{activeCampaign.title}</h2>
                <span className="text-xs text-slate-400">{activeCampaign.period}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/20">
                AKTIF
              </span>
              <span className="text-[10px] text-slate-400">
                {activeCampaign.start_date && new Date(activeCampaign.start_date).toLocaleDateString('tr-TR')}
                {' - '}
                {activeCampaign.end_date && new Date(activeCampaign.end_date).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>

          {stats && (
            <div className="text-right">
              <div className="text-5xl font-black tabular-nums">{stats.completionPercent}%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Tamamlanma</div>
            </div>
          )}
        </div>

        {stats && (
          <div className="relative mt-6">
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionPercent}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
              />
            </div>
          </div>
        )}
      </motion.div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <GlassCard icon={FileCheck} label="Toplam Kontrol" value={stats.total} color="from-blue-500/20 to-blue-600/10" iconColor="text-blue-400" />
          <GlassCard icon={CheckCircle} label="Etkin (Effective)" value={stats.effective} color="from-emerald-500/20 to-emerald-600/10" iconColor="text-emerald-400" />
          <GlassCard icon={XCircle} label="Etkin Degil" value={stats.ineffective} color="from-red-500/20 to-red-600/10" iconColor="text-red-400" />
          <GlassCard icon={Clock} label="Bekleyen" value={stats.pending} color="from-amber-500/20 to-amber-600/10" iconColor="text-amber-400" />
          <GlassCard icon={TrendingUp} label="Risk Agirlikli Skor" value={`${stats.riskWeightedScore}%`} color="from-teal-500/20 to-teal-600/10" iconColor="text-teal-400" />
        </div>
      )}

      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4">Kategori Bazli Durum</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(stats.categoryBreakdown).map(([cat, data]) => {
              const pct = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
              const effPct = data.total > 0 ? Math.round((data.effective / data.total) * 100) : 0;
              return (
                <div key={cat} className="bg-white/80 backdrop-blur rounded-xl border border-slate-200/50 p-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{cat}</div>
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-2xl font-black text-slate-800">{data.completed}</span>
                    <span className="text-sm text-slate-400">/ {data.total}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Etkinlik: <span className="font-bold text-emerald-600">{effPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4">Son Beyanlar (Cryo-Chamber)</h3>
          <div className="space-y-2">
            {(controls || []).filter((c) => c.attestation).map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-slate-100/50">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  c.attestation?.status === 'Effective' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600',
                )}>
                  {c.attestation?.status === 'Effective' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-700">{c.code} - {c.attestation?.attester_name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{c.description}</div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {c.attestation?.ai_challenge && (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">AI</span>
                  )}
                  <Lock size={10} className="text-slate-300" />
                  <span className="text-[10px] text-slate-400 font-mono">{c.attestation?.record_hash?.slice(0, 8)}...</span>
                </div>
              </div>
            ))}
            {(controls || []).filter((c) => c.attestation).length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Henuz beyan yok</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
        >
          <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
            <Zap size={14} className="text-amber-500" />
            Transactional Outbox
            {pendingEvents > 0 && (
              <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{pendingEvents} Bekleyen</span>
            )}
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {(outbox || []).map((evt) => (
              <div key={evt.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/70 border border-slate-100/50">
                <span className={clsx(
                  'text-[9px] font-bold px-1.5 py-0.5 rounded',
                  evt.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' :
                  evt.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700',
                )}>
                  {evt.status}
                </span>
                <span className="text-[10px] font-medium text-slate-600">{evt.event_type}</span>
                <span className="text-[10px] text-slate-400 ml-auto">
                  {new Date(evt.created_at).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-lg shadow-slate-200/30 p-6"
      >
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <AlertTriangle size={14} className="text-red-500" />
          Bekleyen Kontroller
        </h3>
        <div className="space-y-2">
          {(controls || []).filter((c) => !c.attestation).map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-slate-100/50 hover:border-slate-200 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Clock size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">{c.code}</span>
                  {c.is_key_control && <span className="text-[9px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded">KILIT</span>}
                  <span className="text-[10px] text-slate-400">{c.category}</span>
                </div>
                <div className="text-[10px] text-slate-500 truncate">{c.assigned_to} - {c.department}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs font-bold text-slate-600">Agirlik: {c.risk_weight}</div>
                {c.incidents.length > 0 && (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    {c.incidents.length} olay
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

function GlassCard({ icon: Icon, label, value, color, iconColor }: {
  icon: React.ElementType; label: string; value: number | string; color: string; iconColor: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={clsx(
        'relative overflow-hidden rounded-xl p-4',
        'bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg shadow-slate-200/20',
      )}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-60`} />
      <div className="relative">
        <Icon size={18} className={clsx(iconColor, 'mb-2')} />
        <div className="text-2xl font-black text-slate-800">{value}</div>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}
