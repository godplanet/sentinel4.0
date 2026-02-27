import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Users, Zap, MessageSquare } from 'lucide-react';
import { fetchTeamPulse, getISOWeekKey } from '@/features/talent-os/api/pulse-api';
import { detectQuietQuittingRisk } from '@/features/talent-os/fatigue';
import type { PulseResponse } from '@/features/talent-os/api/pulse-api';

// ─── Energy metadata ──────────────────────────────────────────────────────────

const ENERGY_META: Record<number, { emoji: string; label: string; color: string; bar: string }> = {
  1: { emoji: '💀', label: 'Tükendim',   color: '#ef4444', bar: 'bg-red-400'    },
  2: { emoji: '😓', label: 'Yoruldum',   color: '#f97316', bar: 'bg-orange-400' },
  3: { emoji: '😐', label: 'İdare eder', color: '#eab308', bar: 'bg-yellow-400' },
  4: { emoji: '😊', label: 'İyi',         color: '#22c55e', bar: 'bg-green-400'  },
  5: { emoji: '⚡', label: 'Enerjiyim!', color: '#06b6d4', bar: 'bg-cyan-400'   },
};

function avgEnergy(rows: PulseResponse[]): number {
  if (!rows.length) return 0;
  return rows.reduce((s, r) => s + r.energy_level, 0) / rows.length;
}

function energyDistribution(rows: PulseResponse[]): Record<number, number> {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  rows.forEach((r) => { if (r.energy_level in dist) dist[r.energy_level]++; });
  return dist;
}

function quietQuittingCount(rows: PulseResponse[]): number {
  return rows.filter((r) =>
    detectQuietQuittingRisk(
      50,
      r.energy_level,
      r.stress_factor,
    )
  ).length;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TeamPulseWidget() {
  const [rows, setRows]       = useState<PulseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekKey]             = useState(getISOWeekKey);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchTeamPulse(weekKey);
      setRows(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const avg           = avgEnergy(rows);
  const dist          = energyDistribution(rows);
  const blockers      = rows.filter((r) => r.notes && r.notes.trim());
  const qqRisk        = quietQuittingCount(rows);
  const maxDist       = Math.max(...Object.values(dist), 1);

  const avgMeta = avg > 0
    ? ENERGY_META[Math.round(avg)] ?? ENERGY_META[3]
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">Ekip Nabzı</p>
            <p className="text-xs text-slate-400">{weekKey} · {rows.length} yanıt</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <RefreshCw size={20} className="animate-spin" />
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-6">
          <Users size={24} className="text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Bu hafta henüz yanıt yok</p>
          <p className="text-xs text-slate-400">Ekip üyeleri nabız kontrolünü tamamladığında veriler burada görünecek</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="p-5 space-y-5">
          {/* ── Quiet Quitting Risk Banner ─────────────────── */}
          {qqRisk > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-200 bg-amber-50"
            >
              <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-700">Sessiz Çekilme Riski Tespit Edildi</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  {qqRisk} ekip üyesi düşük enerji + yüksek stres kombinasyonu bildirdi.
                  Bire bir görüşme önerilir.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Average energy score ───────────────────────── */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-sm"
              style={{ background: avgMeta ? `${avgMeta.color}15` : '#f1f5f9' }}
            >
              <span className="text-2xl leading-none">{avgMeta?.emoji ?? '—'}</span>
              <span className="text-xs font-bold mt-0.5" style={{ color: avgMeta?.color ?? '#94a3b8' }}>
                {avg > 0 ? avg.toFixed(1) : '—'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">
                Ortalama Enerji: {avgMeta?.label ?? 'Veri Yok'}
              </p>
              <p className="text-xs text-slate-400 mb-2">{rows.length} denetçinin bu haftaki nabzı</p>
              {/* Energy bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: avgMeta?.color ?? '#94a3b8' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(avg / 5) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* ── Distribution bars ─────────────────────────── */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">Dağılım</p>
            <div className="flex items-end gap-1.5 h-14">
              {[1, 2, 3, 4, 5].map((level) => {
                const count   = dist[level];
                const meta    = ENERGY_META[level];
                const pct     = Math.round((count / maxDist) * 100);
                return (
                  <div key={level} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-slate-500">{count > 0 ? count : ''}</span>
                    <div className="w-full bg-slate-100 rounded-t-md overflow-hidden relative" style={{ height: 32 }}>
                      <motion.div
                        className={`absolute bottom-0 w-full rounded-t-md ${meta.bar}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ duration: 0.6, delay: level * 0.05, ease: 'easeOut' }}
                        style={{ opacity: count === 0 ? 0.2 : 1 }}
                      />
                    </div>
                    <span className="text-base leading-none">{meta.emoji}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Anonymous blockers ────────────────────────── */}
          {blockers.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <MessageSquare size={13} className="text-slate-400" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Anonim Engelleyiciler ({blockers.length})
                </p>
              </div>
              <div className="space-y-2">
                {blockers.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{ENERGY_META[r.energy_level]?.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-600 leading-snug">{r.notes}</p>
                      <span
                        className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          color:      r.stress_factor === 'HIGH' ? '#ef4444' : r.stress_factor === 'NORMAL' ? '#eab308' : '#22c55e',
                          background: r.stress_factor === 'HIGH' ? '#fef2f2' : r.stress_factor === 'NORMAL' ? '#fefce8' : '#f0fdf4',
                        }}
                      >
                        {r.stress_factor === 'HIGH' ? '🔥 Yüksek Stres' : r.stress_factor === 'NORMAL' ? '⚖️ Normal' : '🌊 Sakin'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
