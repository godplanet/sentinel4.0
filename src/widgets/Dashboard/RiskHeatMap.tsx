import { useState, useMemo } from 'react';
import { Grid3x3, TrendingDown, Loader2, Brain } from 'lucide-react';
import clsx from 'clsx';
import { useHeatmapData, type AssessmentWithDetails } from '@/entities/risk/heatmap-api';
import {
  useTalentSkillAverages,
  computeTalentAdjustment,
  getDomainKeyword,
} from '@/features/risk-engine/talent-nexus';
import type { TalentAdjustment } from '@/features/risk-engine/methodology-types';

type MatrixMode = 'inherent' | 'residual';

const CELL_COLORS: Record<number, string> = {
  1:  'bg-emerald-100 hover:bg-emerald-200',
  2:  'bg-emerald-100 hover:bg-emerald-200',
  3:  'bg-yellow-100  hover:bg-yellow-200',
  4:  'bg-yellow-100  hover:bg-yellow-200',
  5:  'bg-amber-100   hover:bg-amber-200',
  6:  'bg-amber-200   hover:bg-amber-300',
  8:  'bg-orange-200  hover:bg-orange-300',
  9:  'bg-orange-200  hover:bg-orange-300',
  10: 'bg-orange-300  hover:bg-orange-400',
  12: 'bg-red-200     hover:bg-red-300',
  15: 'bg-red-300     hover:bg-red-400',
  16: 'bg-red-400     hover:bg-red-500',
  20: 'bg-red-500     hover:bg-red-600',
  25: 'bg-red-600     hover:bg-red-700',
};

function getCellColor(score: number): string {
  const keys = Object.keys(CELL_COLORS).map(Number).sort((a, b) => a - b);
  for (let i = keys.length - 1; i >= 0; i--) {
    if (score >= keys[i]) return CELL_COLORS[keys[i]];
  }
  return 'bg-slate-50';
}

function getTalentBorderClass(band: TalentAdjustment['band'] | null): string {
  if (!band) return '';
  switch (band) {
    case 'WEAK':    return 'ring-2 ring-red-500 ring-inset';
    case 'STRONG':  return 'ring-2 ring-emerald-500 ring-inset';
    case 'AVERAGE': return 'ring-1 ring-sky-400 ring-inset';
    default:        return '';
  }
}

function getTalentBandColor(band: TalentAdjustment['band'] | null): string {
  if (!band) return 'text-slate-400';
  switch (band) {
    case 'WEAK':    return 'text-red-400';
    case 'STRONG':  return 'text-emerald-400';
    case 'AVERAGE': return 'text-sky-400';
    default:        return 'text-slate-400';
  }
}

/** Picks the most-frequent risk category within a cell. */
function dominantCategory(risks: AssessmentWithDetails[]): string {
  if (risks.length === 0) return 'General';
  const freq: Record<string, number> = {};
  for (const r of risks) {
    const cat = r.risk_category || 'General';
    freq[cat] = (freq[cat] ?? 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}

export function RiskHeatMap() {
  const { data: assessments = [], isLoading } = useHeatmapData();
  const { data: talentAvgMap }                = useTalentSkillAverages();

  const [mode, setMode]               = useState<MatrixMode>('inherent');
  const [talentContext, setTalentContext] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  const cellMap = useMemo(() => {
    const map: Record<string, AssessmentWithDetails[]> = {};
    for (const a of assessments) {
      const key = `${a.impact}-${a.likelihood}`;
      if (!map[key]) map[key] = [];
      map[key].push(a);
    }
    return map;
  }, [assessments]);

  /**
   * For every heatmap cell that contains risks, pre-compute the dominant
   * talent adjustment so we can render colours + tooltips without re-deriving
   * on every render pass.
   */
  const cellTalentMap = useMemo<Record<string, TalentAdjustment | null>>(() => {
    if (!talentContext || !talentAvgMap) return {};
    const result: Record<string, TalentAdjustment | null> = {};
    for (const [key, risks] of Object.entries(cellMap)) {
      const [xStr, yStr] = key.split('-');
      const baseScore    = Number(xStr) * Number(yStr);
      const category     = dominantCategory(risks);
      const domain       = getDomainKeyword(category);
      result[key]        = computeTalentAdjustment(domain, baseScore, talentAvgMap);
    }
    return result;
  }, [talentContext, talentAvgMap, cellMap]);

  const stats = useMemo(() => {
    let critical = 0, high = 0, medium = 0, low = 0;
    for (const a of assessments) {
      const score = mode === 'inherent' ? a.inherent_risk_score : Math.round(a.residual_score);
      if (score >= 15) critical++;
      else if (score >= 10) high++;
      else if (score >= 5) medium++;
      else low++;
    }
    return { critical, high, medium, low };
  }, [assessments, mode]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center">
              <Grid3x3 size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Risk Isi Haritasi</h3>
              <p className="text-[10px] text-slate-500">{assessments.length} canli degerlendirme</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Talent Context Toggle */}
            <button
              onClick={() => setTalentContext(v => !v)}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                talentContext
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm shadow-sky-200'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300 hover:text-sky-600'
              )}
              title="GIAS Strategic Nexus: Ekip yetkinlik skorunu risk hesabına dahil et"
            >
              <Brain size={12} />
              Yetenek Baglami
              <span className={clsx(
                'ml-1 w-7 h-4 rounded-full relative transition-all',
                talentContext ? 'bg-sky-300' : 'bg-slate-200'
              )}>
                <span className={clsx(
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-all',
                  talentContext ? 'left-3.5' : 'left-0.5'
                )} />
              </span>
            </button>

            {/* Mode toggle */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setMode('inherent')}
                className={clsx(
                  'px-3 py-1.5 text-xs font-bold rounded-md transition-all',
                  mode === 'inherent'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                Dogal Risk
              </button>
              <button
                onClick={() => setMode('residual')}
                className={clsx(
                  'px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1',
                  mode === 'residual'
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                <TrendingDown size={12} />
                Artik Risk
              </button>
            </div>
          </div>
        </div>

        {/* Talent context hint bar */}
        {talentContext && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-sky-50 rounded-lg border border-sky-100 text-[10px]">
            <Brain size={11} className="text-sky-500 flex-shrink-0" />
            <span className="text-sky-700 font-medium">
              Yetenek Baglami aktif.
            </span>
            <span className="text-sky-600">
              Zayif ekip (avg&lt;40) → +%20 risk&nbsp;|&nbsp;Guclu ekip (avg&gt;80) → -%10 risk.
              <span className="ml-2 inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-sm ring-2 ring-red-500 inline-block" />
                Zayif&nbsp;
                <span className="w-2 h-2 rounded-sm ring-2 ring-emerald-500 inline-block" />
                Guclu&nbsp;
                <span className="w-2 h-2 rounded-sm ring-1 ring-sky-400 inline-block" />
                Ortalama
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <StatBadge label="Kritik" count={stats.critical} color="bg-red-600" />
          <StatBadge label="Yuksek" count={stats.high}     color="bg-orange-500" />
          <StatBadge label="Orta"   count={stats.medium}   color="bg-yellow-500" />
          <StatBadge label="Dusuk"  count={stats.low}      color="bg-emerald-500" />
        </div>

        <div className="flex">
          <div className="flex flex-col justify-between pr-2 pt-0 pb-0">
            <span className="text-[9px] text-slate-400 font-bold -rotate-90 whitespace-nowrap origin-center translate-y-24">
              ETKI
            </span>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-6 gap-px bg-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50" />
              {[1, 2, 3, 4, 5].map(x => (
                <div key={x} className="bg-slate-50 p-1.5 text-center">
                  <span className="text-[9px] font-bold text-slate-500">{x}</span>
                </div>
              ))}

              {[5, 4, 3, 2, 1].map(y => (
                <div key={`row-${y}`} className="contents">
                  <div className="bg-slate-50 p-1.5 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-slate-500">{y}</span>
                  </div>
                  {[1, 2, 3, 4, 5].map(x => {
                    const key          = `${x}-${y}`;
                    const baseScore    = x * y;
                    const risksInCell  = cellMap[key] || [];
                    const isHovered    = hoveredCell === key;
                    const talentAdj    = cellTalentMap[key] ?? null;
                    const displayScore = talentContext && talentAdj
                      ? Math.round(talentAdj.adjustedScore)
                      : baseScore;

                    return (
                      <div
                        key={key}
                        className={clsx(
                          'relative p-1 min-h-[44px] flex items-center justify-center cursor-pointer transition-all',
                          getCellColor(displayScore),
                          isHovered && 'z-10',
                          talentContext && talentAdj && risksInCell.length > 0
                            ? getTalentBorderClass(talentAdj.band)
                            : isHovered && 'ring-2 ring-slate-800 ring-inset'
                        )}
                        onMouseEnter={() => setHoveredCell(key)}
                        onMouseLeave={() => setHoveredCell(null)}
                      >
                        {risksInCell.length > 0 && (
                          <div className={clsx(
                            'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm transition-transform',
                            displayScore >= 15 ? 'bg-red-700'
                              : displayScore >= 10 ? 'bg-orange-600'
                              : displayScore >= 5  ? 'bg-yellow-600'
                              : 'bg-emerald-600',
                            isHovered && 'scale-110'
                          )}>
                            {risksInCell.length}
                          </div>
                        )}

                        {/* Talent band micro-indicator */}
                        {talentContext && talentAdj && risksInCell.length > 0 && talentAdj.band !== 'NO_DATA' && (
                          <span className={clsx(
                            'absolute top-0.5 right-0.5 text-[8px] font-black',
                            getTalentBandColor(talentAdj.band)
                          )}>
                            {talentAdj.band === 'WEAK' ? '+20%' : talentAdj.band === 'STRONG' ? '-10%' : '~'}
                          </span>
                        )}

                        {/* Tooltip */}
                        {isHovered && risksInCell.length > 0 && (
                          <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white rounded-lg shadow-xl p-2.5 pointer-events-none">
                            <div className="text-[10px] font-bold text-slate-300 mb-1.5">
                              Etki: {x} / Olasilik: {y} — Temel Skor: {baseScore}
                              {talentContext && talentAdj && (
                                <span className={clsx('ml-1.5 font-black', getTalentBandColor(talentAdj.band))}>
                                  → Yetenek Ayarli: {displayScore}
                                </span>
                              )}
                            </div>

                            {talentContext && talentAdj && (
                              <div className={clsx(
                                'mb-2 px-2 py-1.5 rounded text-[10px] font-medium border',
                                talentAdj.band === 'WEAK'
                                  ? 'bg-red-900/40 border-red-700 text-red-300'
                                  : talentAdj.band === 'STRONG'
                                  ? 'bg-emerald-900/40 border-emerald-700 text-emerald-300'
                                  : talentAdj.band === 'AVERAGE'
                                  ? 'bg-sky-900/40 border-sky-700 text-sky-300'
                                  : 'bg-slate-700 border-slate-600 text-slate-400'
                              )}>
                                <div className="font-bold mb-0.5">{talentAdj.label}</div>
                                <div className="leading-relaxed opacity-90">{talentAdj.tooltip}</div>
                              </div>
                            )}

                            {risksInCell.slice(0, 4).map(r => {
                              const rDomain = getDomainKeyword(r.risk_category);
                              const rAdj    = talentContext && talentAvgMap
                                ? computeTalentAdjustment(rDomain, baseScore, talentAvgMap)
                                : null;
                              return (
                                <div key={r.id} className="flex items-start gap-1.5 py-0.5">
                                  <span className="text-[9px] text-slate-200 truncate flex-1">
                                    {r.risk_title} — {r.entity_name}
                                  </span>
                                  {rAdj && (
                                    <span className={clsx(
                                      'text-[9px] font-black flex-shrink-0',
                                      getTalentBandColor(rAdj.band)
                                    )}>
                                      {rAdj.band === 'WEAK' ? '+20%' : rAdj.band === 'STRONG' ? '-10%' : ''}
                                    </span>
                                  )}
                                </div>
                              );
                            })}

                            {risksInCell.length > 4 && (
                              <div className="text-[10px] text-slate-400 mt-1">
                                +{risksInCell.length - 4} daha
                              </div>
                            )}

                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="text-center mt-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                OLASILIK
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
      <div className={clsx('w-2.5 h-2.5 rounded-full', color)} />
      <span className="text-[10px] font-bold text-slate-600">{label}</span>
      <span className="text-sm font-black text-slate-800 ml-auto tabular-nums">{count}</span>
    </div>
  );
}
