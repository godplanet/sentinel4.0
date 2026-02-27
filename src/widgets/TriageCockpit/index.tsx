import { useState, useEffect, useMemo } from 'react';
import {
  Shield, AlertTriangle, Search, Filter,
  RefreshCw, Loader2, Eye, Radio, BarChart3,
} from 'lucide-react';
import clsx from 'clsx';
import { fetchTips, updateTipStatus } from '@/features/investigation/api';
import type { WhistleblowerTip, TipAnalysis, TipStatus, TriageCategory } from '@/features/investigation/types';
import { CATEGORY_LABELS, STATUS_LABELS } from '@/features/investigation/types';
import { supabase } from '@/shared/api/supabase';
import { TipRow } from './TipRow';

type FilterCategory = 'ALL' | TriageCategory;
type FilterStatus = 'ALL' | TipStatus;

export function TriageCockpit() {
  const [tips, setTips] = useState<WhistleblowerTip[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, TipAnalysis>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const tipsData = await fetchTips();
      setTips(tipsData);

      const { data: analysisData } = await supabase
        .from('tip_analysis')
        .select('*');

      const map: Record<string, TipAnalysis> = {};
      for (const a of (analysisData || [])) {
        map[a.tip_id] = a as TipAnalysis;
      }
      setAnalyses(map);
    } catch (err) {
      console.error('Failed to load tips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (tipId: string, status: string) => {
    await updateTipStatus(tipId, status as TipStatus);
    setTips((prev) =>
      prev.map((t) => (t.id === tipId ? { ...t, status: status as TipStatus } : t)),
    );
  };

  const filtered = useMemo(() => {
    return tips.filter((t) => {
      if (filterCategory !== 'ALL' && t.triage_category !== filterCategory) return false;
      if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.tracking_code.toLowerCase().includes(q) ||
          t.content.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tips, filterCategory, filterStatus, search]);

  const stats = useMemo(() => {
    const critical = tips.filter((t) => t.triage_category === 'CRITICAL_FRAUD').length;
    const investigating = tips.filter((t) => t.status === 'INVESTIGATING').length;
    const newCount = tips.filter((t) => t.status === 'NEW').length;
    const avgScore = tips.length > 0
      ? tips.reduce((s, t) => s + t.ai_credibility_score, 0) / tips.length
      : 0;
    return { critical, investigating, newCount, avgScore, total: tips.length };
  }, [tips]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard label="Toplam Bildirim" value={stats.total} icon={Shield} />
        <StatCard label="Kritik Suistimal" value={stats.critical} icon={AlertTriangle} variant="danger" />
        <StatCard label="Inceleniyor" value={stats.investigating} icon={Eye} variant="warning" />
        <StatCard label="Yeni" value={stats.newCount} icon={Radio} variant="info" />
        <StatCard label="Ort. Skor" value={stats.avgScore.toFixed(1)} icon={BarChart3} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Takip kodu veya icerik ara..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter size={12} className="text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as FilterCategory)}
            className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="ALL">Tum Kategoriler</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="text-[11px] bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="ALL">Tum Durumlar</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          Yenile
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-slate-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400">
          Bildirim bulunamadi.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((tip) => (
            <TipRow
              key={tip.id}
              tip={tip}
              analysis={analyses[tip.id] || null}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, variant,
}: {
  label: string;
  value: string | number;
  icon: typeof Shield;
  variant?: 'danger' | 'warning' | 'info';
}) {
  const colors = {
    danger: 'bg-red-50 border-red-200 text-red-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  return (
    <div className={clsx(
      'rounded-xl border p-4',
      variant ? colors[variant] : 'bg-white border-slate-200',
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className={variant ? undefined : 'text-slate-400'} />
        <span className={clsx('text-[10px] font-medium', variant ? undefined : 'text-slate-500')}>{label}</span>
      </div>
      <span className={clsx('text-xl font-black', variant ? undefined : 'text-slate-900')}>{value}</span>
    </div>
  );
}
