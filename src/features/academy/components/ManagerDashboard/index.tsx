import { useState, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, Minus, AlertCircle,
  RefreshCw, Users, BarChart2, Shield,
} from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { fetchTeamTrainingROI } from '@/features/academy/api/trainingRoi';
import { XPEngine } from '@/features/talent-os/lib/XPEngine';
import type { TeamROIRow } from '@/features/academy/api/trainingRoi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuditorMeta {
  user_id:   string;
  full_name: string;
}

interface EnrichedROIRow extends TeamROIRow {
  auditorName:      string;
  isDiminishing:    boolean;
}

// ─── ROI badge ────────────────────────────────────────────────────────────────

function ROIBadge({ label, score }: { label: TeamROIRow['label']; score: number }) {
  if (label === 'INSUFFICIENT_DATA') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-xs font-medium">
        <Minus size={10} />
        No data
      </span>
    );
  }

  if (label === 'POSITIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
        <TrendingUp size={11} />
        +{score}% effective
      </span>
    );
  }

  if (label === 'NEGATIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-semibold">
        <TrendingDown size={11} />
        {score}% regression
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-xs font-medium">
      <Minus size={10} />
      Neutral ({score > 0 ? '+' : ''}{score}%)
    </span>
  );
}

// ─── Summary KPI cards ────────────────────────────────────────────────────────

function SummaryCards({ rows }: { rows: EnrichedROIRow[] }) {
  const effectiveCount    = rows.filter((r) => r.label === 'POSITIVE').length;
  const regressionCount   = rows.filter((r) => r.label === 'NEGATIVE').length;
  const diminishingCount  = rows.filter((r) => r.isDiminishing).length;
  const avgROI = rows.length
    ? Math.round(rows.filter((r) => r.label !== 'INSUFFICIENT_DATA')
        .reduce((s, r) => s + r.roiScore, 0) /
        Math.max(1, rows.filter((r) => r.label !== 'INSUFFICIENT_DATA').length) * 10) / 10
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={14} className="text-emerald-600" />
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Effective Trainings</span>
        </div>
        <p className="text-2xl font-bold text-emerald-700 tabular-nums">{effectiveCount}</p>
        <p className="text-xs text-emerald-500 mt-0.5">measurably improved quality</p>
      </div>

      <div className="rounded-xl border border-red-100 bg-red-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown size={14} className="text-red-500" />
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">Regressions</span>
        </div>
        <p className="text-2xl font-bold text-red-600 tabular-nums">{regressionCount}</p>
        <p className="text-xs text-red-400 mt-0.5">quality dropped post-training</p>
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 size={14} className="text-blue-600" />
          <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Avg ROI</span>
        </div>
        <p className="text-2xl font-bold text-blue-700 tabular-nums">{avgROI > 0 ? '+' : ''}{avgROI}%</p>
        <p className="text-xs text-blue-500 mt-0.5">QAIP score change</p>
      </div>

      <div className={`rounded-xl border p-4 ${diminishingCount > 0 ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={14} className={diminishingCount > 0 ? 'text-amber-600' : 'text-slate-400'} />
          <span className={`text-xs font-semibold uppercase tracking-wide ${diminishingCount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
            DR Cooldown
          </span>
        </div>
        <p className={`text-2xl font-bold tabular-nums ${diminishingCount > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
          {diminishingCount}
        </p>
        <p className={`text-xs mt-0.5 ${diminishingCount > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
          auditors farming XP
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ManagerDashboard() {
  const [rows, setRows]       = useState<EnrichedROIRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'ALL' | 'POSITIVE' | 'NEGATIVE' | 'DR'>('ALL');

  const load = async () => {
    setLoading(true);
    try {
      const [roiRows, profilesRes] = await Promise.all([
        fetchTeamTrainingROI(),
        supabase.from('auditor_profiles').select('user_id, full_name').limit(100),
      ]);

      const profiles: AuditorMeta[] = (profilesRes.data ?? []) as AuditorMeta[];
      const nameMap: Record<string, string> = {};
      for (const p of profiles) nameMap[p.user_id] = p.full_name;

      const uniqueUserIds = [...new Set(roiRows.map((r) => r.userId))];
      const drMap: Record<string, boolean> = {};

      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          drMap[uid] = await XPEngine.isDiminishingActive(uid);
        }),
      );

      const enriched: EnrichedROIRow[] = roiRows.map((r) => ({
        ...r,
        auditorName:   nameMap[r.userId] ?? r.userId.slice(0, 8) + '…',
        isDiminishing: drMap[r.userId] ?? false,
      }));

      setRows(enriched);
    } catch {
      /* silent — non-critical panel */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (filter === 'POSITIVE')  return r.label === 'POSITIVE';
    if (filter === 'NEGATIVE')  return r.label === 'NEGATIVE';
    if (filter === 'DR')        return r.isDiminishing;
    return true;
  });

  const filterBtns: Array<{ id: typeof filter; label: string }> = [
    { id: 'ALL',      label: `All (${rows.length})` },
    { id: 'POSITIVE', label: `Effective (${rows.filter((r) => r.label === 'POSITIVE').length})` },
    { id: 'NEGATIVE', label: `Regression (${rows.filter((r) => r.label === 'NEGATIVE').length})` },
    { id: 'DR',       label: `DR Cooldown (${rows.filter((r) => r.isDiminishing).length})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Training Effectiveness — Kirkpatrick Level 4</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Measures field impact: QAIP workpaper quality before vs after training completion
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {!loading && <SummaryCards rows={rows} />}

      {/* Filter bar */}
      <div className="flex gap-1.5 flex-wrap">
        {filterBtns.map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilter(btn.id)}
            className={[
              'px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors',
              filter === btn.id
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
            ].join(' ')}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-xl bg-slate-100" />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
            <Users size={22} className="text-slate-300" />
          </div>
          <p className="text-slate-600 font-semibold text-sm">No data for this filter</p>
          <p className="text-slate-400 text-xs">
            ROI data accumulates as auditors complete exams and workpapers.
          </p>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Auditor</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Course</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Training Date</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">Samples</th>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">Training Effectiveness (ROI)</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-slate-500">XP Guard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((row, idx) => (
                <tr key={`${row.userId}-${row.courseId}-${idx}`} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-800">{row.auditorName}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px] truncate">
                    {row.courseTitle || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {row.trainingDate
                      ? new Date(row.trainingDate).toLocaleDateString('en-GB')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-xs text-slate-500 font-mono">{row.sampleSize}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ROIBadge label={row.label} score={row.roiScore} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.isDiminishing ? (
                      <span
                        title="Under Diminishing Returns cooldown — XP farming detected"
                        className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 border border-amber-300"
                      >
                        <Shield size={11} className="text-amber-600" />
                      </span>
                    ) : (
                      <span className="text-slate-200">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <AlertCircle size={11} />
              ROI uses QAIP-proxied XP amounts. Requires ≥3 workpaper samples each side for significance.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
