import { useState, useEffect, useMemo } from 'react';
import { Award, BarChart3, Loader2, RefreshCw, AlertTriangle, Users } from 'lucide-react';
import clsx from 'clsx';
import { GradingCalculator } from '@/features/grading-engine/calculator';
import {
  fetchFindingCounts,
  saveEngagementGrade,
  fetchGroupConsolidation,
} from '@/features/grading-engine/api';
import type { GradingResult, FindingSeverityCounts, GroupConsolidationRow } from '@/features/grading-engine/types';
import { fetchActiveMethodology } from '@/features/risk-engine/methodology-api';
import type { GradingRules } from '@/features/risk-engine/methodology-types';
import { useRiskConstitution } from '@/features/risk-constitution';
import { constitutionToGradingRules } from '@/features/grading-engine/constitution-adapter';
import { GradeGauge } from './GradeGauge';
import { WaterfallChart } from './WaterfallChart';

interface Props {
  engagementId?: string;
  engagementTitle?: string;
  demoMode?: boolean;
}

const DEMO_COUNTS: FindingSeverityCounts = {
  count_critical: 1,
  count_high: 2,
  count_medium: 4,
  count_low: 3,
  total: 10,
};

export function Scorecard({ engagementId, engagementTitle, demoMode = false }: Props) {
  const [gradingRules, setGradingRules] = useState<GradingRules | null>(null);
  const { constitution } = useRiskConstitution();
  const [counts, setCounts] = useState<FindingSeverityCounts | null>(null);
  const [consolidation, setConsolidation] = useState<GroupConsolidationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<'scorecard' | 'consolidation'>('scorecard');

  useEffect(() => {
    loadData();
  }, [engagementId, demoMode, constitution]);

  const loadData = async () => {
    setLoading(true);
    const config = await fetchActiveMethodology();
    const methodologyRules = config?.grading_rules ?? null;
    const constitutionRules = constitutionToGradingRules(constitution);
    setGradingRules(methodologyRules || constitutionRules);

    if (demoMode) {
      setCounts(DEMO_COUNTS);
    } else if (engagementId) {
      const c = await fetchFindingCounts(engagementId);
      setCounts(c);
    }

    const consData = await fetchGroupConsolidation();
    setConsolidation(consData);
    setLoading(false);
  };

  const result: GradingResult | null = useMemo(() => {
    if (!counts) return null;
    const calc = new GradingCalculator(gradingRules);
    return calc.calculate(counts);
  }, [counts, gradingRules]);

  const handleSave = async () => {
    if (!result || !engagementId) return;
    setSaving(true);
    await saveEngagementGrade(engagementId, {
      baseScore: result.baseScore,
      totalDeductions: result.totalDeductions,
      finalScore: result.finalScore,
      finalGrade: result.finalGrade,
      assuranceOpinion: result.assuranceOpinion,
      cappingTriggered: result.capping.triggered,
      cappingReason: result.capping.reason,
      waterfall: result.waterfall,
    });
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveView('scorecard')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all',
            activeView === 'scorecard'
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
          )}
        >
          <Award size={14} />
          Denetim Karnesi
        </button>
        <button
          onClick={() => setActiveView('consolidation')}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg border transition-all',
            activeView === 'consolidation'
              ? 'bg-slate-800 text-white border-slate-800'
              : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
          )}
        >
          <Users size={14} />
          Grup Konsolidasyonu
        </button>
      </div>

      {activeView === 'scorecard' && result && (
        <ScorecardView
          result={result}
          title={engagementTitle}
          engagementId={engagementId}
          saving={saving}
          onSave={handleSave}
          onRefresh={loadData}
        />
      )}

      {activeView === 'consolidation' && (
        <ConsolidationView data={consolidation} />
      )}
    </div>
  );
}

function ScorecardView({
  result,
  title,
  engagementId,
  saving,
  onSave,
  onRefresh,
}: {
  result: GradingResult;
  title?: string;
  engagementId?: string;
  saving: boolean;
  onSave: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-slate-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Award size={18} />
          <div>
            <h3 className="text-sm font-bold">
              {title ?? 'Denetim Karnesi'}
            </h3>
            <p className="text-[10px] text-slate-300">KERD-2026 Notlama Motoru</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md hover:bg-slate-700 transition-colors"
          >
            <RefreshCw size={14} />
          </button>
          {engagementId && (
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : null}
              Kaydet
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <div className="flex flex-col items-center justify-center">
          <GradeGauge
            score={result.finalScore}
            grade={result.finalGrade}
            opinion={result.assuranceLabel}
            capped={result.capping.triggered}
          />

          <div className="grid grid-cols-4 gap-3 mt-6 w-full max-w-xs">
            <CountBadge label="Kritik" count={result.counts.count_critical} color="#800000" />
            <CountBadge label="Yuksek" count={result.counts.count_high} color="#dc2626" />
            <CountBadge label="Orta" count={result.counts.count_medium} color="#f97316" />
            <CountBadge label="Dusuk" count={result.counts.count_low} color="#eab308" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={14} className="text-slate-500" />
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Selale Analizi
            </h4>
          </div>
          <WaterfallChart
            baseScore={result.baseScore}
            waterfall={result.waterfall}
            capping={result.capping}
            finalScore={result.finalScore}
          />
        </div>
      </div>
    </div>
  );
}

function CountBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="text-center">
      <div
        className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-black"
        style={{ backgroundColor: count > 0 ? color : '#cbd5e1' }}
      >
        {count}
      </div>
      <span className="text-[9px] font-bold text-slate-500 mt-1 block">{label}</span>
    </div>
  );
}

function ConsolidationView({ data }: { data: GroupConsolidationRow[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <AlertTriangle size={28} className="text-slate-300 mx-auto mb-2" />
        <p className="text-sm text-slate-500">Konsolidasyon verisi bulunamadi.</p>
        <p className="text-xs text-slate-400 mt-1">Tamamlanmis denetim sonuclari gereklidir.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 bg-slate-800 text-white flex items-center gap-3">
        <Users size={18} />
        <div>
          <h3 className="text-sm font-bold">Grup Konsolidasyonu</h3>
          <p className="text-[10px] text-slate-300">Risk-Agirlikli Ortalama</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 font-bold text-slate-600">Plan</th>
              <th className="text-center px-4 py-3 font-bold text-slate-600">Denetim</th>
              <th className="text-center px-4 py-3 font-bold text-slate-600">Agirlikli Ort.</th>
              <th className="text-center px-4 py-3 font-bold text-slate-600">Basit Ort.</th>
              <th className="text-center px-4 py-3 font-bold text-slate-600">Sinirli</th>
              <th className="text-center px-4 py-3 font-bold text-slate-600">Min/Max</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-slate-600 truncate max-w-[200px]">
                  {row.plan_id?.slice(0, 8) ?? '-'}
                </td>
                <td className="text-center px-4 py-3 font-bold text-slate-700">
                  {row.engagement_count}
                </td>
                <td className="text-center px-4 py-3">
                  <span
                    className="inline-block px-2.5 py-1 rounded-full font-black text-white"
                    style={{
                      backgroundColor: row.weighted_average_score >= 80 ? '#059669' : row.weighted_average_score >= 60 ? '#f97316' : '#dc2626',
                    }}
                  >
                    {row.weighted_average_score}
                  </span>
                </td>
                <td className="text-center px-4 py-3 font-bold text-slate-600 tabular-nums">
                  {row.simple_average_score}
                </td>
                <td className="text-center px-4 py-3">
                  {row.capped_count > 0 ? (
                    <span className="text-red-600 font-bold">{row.capped_count}</span>
                  ) : (
                    <span className="text-slate-300">0</span>
                  )}
                </td>
                <td className="text-center px-4 py-3 tabular-nums text-slate-500">
                  {row.min_score} - {row.max_score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
