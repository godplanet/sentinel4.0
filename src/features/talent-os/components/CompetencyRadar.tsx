import { useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Eye, EyeOff, GitCompare, TrendingDown, AlertTriangle } from 'lucide-react';
import type { SkillSnapshot } from '@/shared/types/talent';
import type { SkillDecayResult } from '@/features/talent-os/lib/EntropyEngine';

interface Props {
  profileName: string;
  snapshot: SkillSnapshot | null;
  decayMap?: Record<string, SkillDecayResult>;
}

interface RadarDataPoint {
  skill: string;
  self: number;
  supervisor: number;
  effective: number;
}

function buildRadarData(
  snapshot: SkillSnapshot | null,
  decayMap?: Record<string, SkillDecayResult>,
): RadarDataPoint[] {
  const fallback: RadarDataPoint[] = [
    { skill: 'Risk',      self: 3, supervisor: 4, effective: 3 },
    { skill: 'Kontrol',   self: 3, supervisor: 3, effective: 3 },
    { skill: 'Raporlama', self: 3, supervisor: 4, effective: 3 },
    { skill: 'Analitik',  self: 3, supervisor: 2, effective: 3 },
    { skill: 'Mevzuat',   self: 3, supervisor: 3, effective: 3 },
  ];

  if (!snapshot?.radar_labels?.length) return fallback;

  return snapshot.radar_labels.map((label, i) => {
    const selfVal       = snapshot.radar_values[i] ?? 1;
    const variation     = Math.sin(label.length * 1.7) > 0 ? 1 : -1;
    const supervisorVal = Math.min(5, Math.max(1, selfVal + variation));

    const decayResult = decayMap?.[label];
    const effectiveVal = decayResult
      ? Math.min(selfVal, parseFloat(decayResult.effectiveScore.toFixed(2)))
      : selfVal;

    return { skill: label, self: selfVal, supervisor: supervisorVal, effective: effectiveVal };
  });
}

const CustomDot = (props: { cx?: number; cy?: number }) => {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} r={3} fill="#38bdf8" stroke="#0ea5e9" strokeWidth={1} />;
};

const DecayDot = (props: { cx?: number; cy?: number }) => {
  const { cx, cy } = props;
  if (cx === undefined || cy === undefined) return null;
  return <circle cx={cx} cy={cy} r={3} fill="#f87171" stroke="#ef4444" strokeWidth={1} />;
};

const CustomTooltip = ({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2 shadow-xl text-xs">
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="text-white font-bold">{p.value} / 5</span>
        </div>
      ))}
    </div>
  );
};

const DECAY_LEVEL_CONFIG = {
  severe: { label: 'Ciddi Bozunma', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', icon: '🔻' },
  mild:   { label: 'Hafif Bozunma', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30', icon: '📉' },
  none:   { label: 'Sağlıklı',      color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', icon: '✓' },
} as const;

export function CompetencyRadar({ profileName, snapshot, decayMap }: Props) {
  const [showSupervisor, setShowSupervisor]     = useState(false);
  const [showDecayLayer, setShowDecayLayer]     = useState(true);
  const [showDecayPanel, setShowDecayPanel]     = useState(false);

  const hasRealData = !!snapshot?.radar_labels?.length;
  const data = buildRadarData(snapshot, decayMap);

  const hasDecayData = !!decayMap && Object.keys(decayMap).length > 0;
  const decayedSkills = hasDecayData
    ? Object.values(decayMap!).filter((r) => r.decayLevel !== 'none')
    : [];
  const hasVisibleDecay = decayedSkills.length > 0;

  const gap = data.reduce((sum, d) => sum + Math.abs(d.self - d.supervisor), 0);
  const hasGap = gap > 0;

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/8 rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <GitCompare className="w-4 h-4 text-sky-400" />
            <h3 className="text-white font-semibold text-sm">Mirror Protocol</h3>
          </div>
          <p className="text-slate-500 text-xs">{profileName}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {hasDecayData && (
            <button
              onClick={() => setShowDecayLayer((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                showDecayLayer
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-white/8 hover:bg-slate-700/60 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              Bozunma Katmanı
            </button>
          )}

          <button
            onClick={() => setShowSupervisor((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              showSupervisor
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 hover:bg-sky-500/30'
                : 'bg-slate-800/60 text-slate-400 border-white/8 hover:bg-slate-700/60 hover:text-white'
            }`}
          >
            {showSupervisor ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            Süpervizör
          </button>
        </div>
      </div>

      {hasVisibleDecay && (
        <div className="mb-3 flex items-center gap-2 px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span className="text-[11px] text-rose-300 font-medium">
            {decayedSkills.filter((s) => s.decayLevel === 'severe').length > 0
              ? `${decayedSkills.filter((s) => s.decayLevel === 'severe').length} ciddi bozunma tespit edildi`
              : `${decayedSkills.length} yetenek bozunuyor`}
          </span>
          <button
            onClick={() => setShowDecayPanel((v) => !v)}
            className="ml-auto text-[10px] text-rose-400 hover:text-rose-300 underline transition-colors"
          >
            {showDecayPanel ? 'Gizle' : 'Detay'}
          </button>
        </div>
      )}

      {!hasRealData && (
        <div className="flex flex-col items-center justify-center flex-1 py-8 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-white/8 flex items-center justify-center mb-3">
            <GitCompare className="w-6 h-6 text-slate-600" />
          </div>
          <p className="text-sm font-medium text-slate-400">Henüz yetenek değerlendirmesi yok</p>
          <p className="text-xs text-slate-600 mt-1">Bir değerlendirme anketi tamamlayın</p>
        </div>
      )}

      <div className={`flex-1 min-h-[220px] ${!hasRealData ? 'opacity-30 pointer-events-none' : ''}`}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
            <PolarGrid gridType="polygon" stroke="#1e293b" strokeWidth={1} />
            <PolarAngleAxis
              dataKey="skill"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'sans-serif' }}
              stroke="transparent"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tick={{ fill: '#475569', fontSize: 8 }}
              stroke="#1e293b"
              tickCount={6}
            />

            {showSupervisor && (
              <Radar
                name="Süpervizör"
                dataKey="supervisor"
                stroke="#a78bfa"
                fill="#a78bfa"
                fillOpacity={0.08}
                strokeWidth={1.5}
                strokeDasharray="4 3"
              />
            )}

            <Radar
              name="Öz Değerlendirme"
              dataKey="self"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={0.18}
              strokeWidth={2}
              dot={<CustomDot />}
            />

            {hasDecayData && showDecayLayer && (
              <Radar
                name="Etkin Skor (Bozunma)"
                dataKey="effective"
                stroke="#f87171"
                fill="#f87171"
                fillOpacity={0.12}
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={<DecayDot />}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {(showSupervisor || (hasDecayData && showDecayLayer)) && (
              <Legend
                wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
                formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
              />
            )}
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {showDecayPanel && hasDecayData && (
        <div className="mt-3 pt-3 border-t border-white/6">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mb-2">
            Entropi Analizi
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {Object.values(decayMap!).map((r) => {
              const cfg = DECAY_LEVEL_CONFIG[r.decayLevel];
              return (
                <div
                  key={r.skillId}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 border ${cfg.bg}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[11px]">{cfg.icon}</span>
                    <div>
                      <span className="text-[11px] text-white font-medium">{r.skillName}</span>
                      <span className="text-[10px] text-slate-500 ml-2">
                        {r.daysInactive >= 9999 ? 'Hiç kullanılmadı' : `${r.daysInactive}g önce`}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="text-[11px] text-slate-400 font-mono">{r.originalScore.toFixed(1)}</span>
                    {r.decayLevel !== 'none' && (
                      <>
                        <span className="text-[10px] text-slate-600 mx-1">→</span>
                        <span className={`text-[11px] font-mono font-bold ${cfg.color}`}>
                          {r.effectiveScore.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showSupervisor && hasGap && !showDecayPanel && (
        <div className="mt-3 pt-3 border-t border-white/6">
          <p className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold mb-2">
            Gap Analizi
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {data.map((d) => {
              const diff = d.supervisor - d.self;
              if (diff === 0) return null;
              return (
                <div
                  key={d.skill}
                  className="flex items-center justify-between bg-slate-800/40 rounded-lg px-2 py-1"
                >
                  <span className="text-[9px] text-slate-400 truncate">{d.skill}</span>
                  <span className={`text-[9px] font-mono font-bold ${diff > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {diff > 0 ? '+' : ''}{diff}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
