/**
 * SENTINEL v3.0 - RISK HEATMAP BLOCK
 *
 * Live SVG risk heatmap (Comet Chart) embedded in report.
 * Pulls real-time data from audit_universe table.
 *
 * DESIGN STANDARD: Report Studio - Apple Glass / Remarkable Paper
 */

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/shared/api/supabase';
import { Loader2, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFindingStore } from '@/entities/finding/model/store';
import type { LiveChartBlock } from '@/entities/report';

interface RiskEntity {
  entity_name: string;
  risk_score: number;
  path: string;
  risk_velocity?: number;
  strategic_zone?: string;
}

interface RiskHeatmapBlockProps {
  width?: number;
  height?: number;
  showTitle?: boolean;
}

export function RiskHeatmapBlock({
  width = 800,
  height = 600,
  showTitle = true,
}: RiskHeatmapBlockProps) {
  const [entities, setEntities] = useState<RiskEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRiskData();
  }, []);

  const fetchRiskData = async () => {
    try {
      setIsLoading(true);
      const { data, error: err } = await supabase
        .from('audit_universe')
        .select('entity_name, risk_score, path, risk_velocity, strategic_zone')
        .gte('risk_score', 40)
        .order('risk_score', { ascending: false })
        .limit(20);

      if (err) throw err;

      setEntities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load risk data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-600">Loading Risk Heatmap...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 border-2 border-dashed border-red-300 rounded-lg"
        style={{ width, height }}
      >
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const maxScore = Math.max(...entities.map((e) => e.risk_score));
  const minScore = Math.min(...entities.map((e) => e.risk_score));

  const getRiskColor = (score: number): string => {
    if (score >= 90) return '#dc2626';
    if (score >= 70) return '#f97316';
    if (score >= 40) return '#fbbf24';
    return '#22c55e';
  };

  const getScaledRadius = (score: number): number => {
    const minRadius = 8;
    const maxRadius = 24;
    const normalized = (score - minScore) / (maxScore - minScore);
    return minRadius + normalized * (maxRadius - minRadius);
  };

  const margin = { top: 40, right: 60, bottom: 60, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xScale = (index: number) => (index / (entities.length - 1)) * chartWidth;
  const yScale = (score: number) => chartHeight - (score / 100) * chartHeight;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
      {showTitle && (
        <div className="px-4 py-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white">
          <h3 className="font-bold text-sm">Strategic Risk Heatmap</h3>
          <p className="text-xs text-slate-400">
            Top {entities.length} entities by risk score (as of {new Date().toLocaleDateString()})
          </p>
        </div>
      )}

      <svg width={width} height={height} className="bg-gradient-to-br from-slate-50 to-white">
        <defs>
          <linearGradient id="gridGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${margin.left},${margin.top})`}>
          {[0, 25, 50, 75, 100].map((val) => (
            <g key={val}>
              <line
                x1={0}
                y1={yScale(val)}
                x2={chartWidth}
                y2={yScale(val)}
                stroke="url(#gridGradient)"
                strokeWidth={val === 0 ? 2 : 1}
              />
              <text
                x={-10}
                y={yScale(val)}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-slate-500"
              >
                {val}
              </text>
              {val === 40 && (
                <line
                  x1={0}
                  y1={yScale(val)}
                  x2={chartWidth}
                  y2={yScale(val)}
                  stroke="#fbbf24"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
              {val === 70 && (
                <line
                  x1={0}
                  y1={yScale(val)}
                  x2={chartWidth}
                  y2={yScale(val)}
                  stroke="#f97316"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
              {val === 90 && (
                <line
                  x1={0}
                  y1={yScale(val)}
                  x2={chartWidth}
                  y2={yScale(val)}
                  stroke="#dc2626"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
              )}
            </g>
          ))}

          {entities.map((entity, index) => {
            const cx = xScale(index);
            const cy = yScale(entity.risk_score);
            const radius = getScaledRadius(entity.risk_score);
            const color = getRiskColor(entity.risk_score);

            return (
              <g key={entity.path}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={radius + 4}
                  fill={color}
                  opacity={0.2}
                  filter="url(#glow)"
                />
                <circle cx={cx} cy={cy} r={radius} fill={color} opacity={0.8} />
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  className="text-[10px] font-bold fill-white"
                >
                  {entity.risk_score}
                </text>
              </g>
            );
          })}

          <text
            x={chartWidth / 2}
            y={chartHeight + 40}
            textAnchor="middle"
            className="text-xs fill-slate-600 font-medium"
          >
            Entities (Sorted by Risk Score)
          </text>

          <text
            x={-30}
            y={chartHeight / 2}
            textAnchor="middle"
            transform={`rotate(-90, -30, ${chartHeight / 2})`}
            className="text-xs fill-slate-600 font-medium"
          >
            Risk Score (0-100)
          </text>
        </g>

        <g transform={`translate(${width - margin.right + 10}, ${margin.top})`}>
          <text x={0} y={0} className="text-xs font-bold fill-slate-700">
            Risk Zones
          </text>
          {[
            { label: 'Critical', color: '#dc2626', range: '90-100' },
            { label: 'High', color: '#f97316', range: '70-89' },
            { label: 'Medium', color: '#fbbf24', range: '40-69' },
            { label: 'Low', color: '#22c55e', range: '0-39' },
          ].map((zone, i) => (
            <g key={zone.label} transform={`translate(0, ${20 + i * 20})`}>
              <circle cx={5} cy={0} r={4} fill={zone.color} />
              <text x={12} y={0} alignmentBaseline="middle" className="text-[10px] fill-slate-600">
                {zone.label} ({zone.range})
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div>
            <div className="text-slate-500">Total Entities</div>
            <div className="font-bold text-slate-900">{entities.length}</div>
          </div>
          <div>
            <div className="text-slate-500">Avg Risk Score</div>
            <div className="font-bold text-slate-900">
              {(entities.reduce((sum, e) => sum + e.risk_score, 0) / entities.length).toFixed(1)}
            </div>
          </div>
          <div>
            <div className="text-slate-500">Critical (≥90)</div>
            <div className="font-bold text-red-600">
              {entities.filter((e) => e.risk_score >= 90).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LIVE CHART BLOCK VIEW (Faz 3 — Canlı Bulgu Dağılım Grafiği) ─────────────

const CHART_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#10b981',
  OBSERVATION: '#94a3b8',
};

const CHART_LABELS: Record<string, string> = {
  CRITICAL: 'Kritik',
  HIGH: 'Yüksek',
  MEDIUM: 'Orta',
  LOW: 'Düşük',
  OBSERVATION: 'Gözlem',
};

const CHART_TITLE: Record<string, string> = {
  risk_heatmap: 'Risk Dağılımı',
  severity_distribution: 'Bulgu Önem Dağılımı',
  wif_trend: 'WIF Trend Analizi',
};

export function LiveChartBlockView({ block }: { block: LiveChartBlock }) {
  const findings = useFindingStore((s) => s.findings);

  const data = useMemo(() => {
    const groups: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
      OBSERVATION: 0,
    };
    findings.forEach((f) => {
      const key = (f.severity ?? 'LOW').toUpperCase();
      if (key in groups) groups[key]++;
    });
    return Object.entries(groups)
      .filter(([, count]) => count > 0)
      .map(([key, count]) => ({
        name: CHART_LABELS[key] ?? key,
        value: count,
        color: CHART_COLORS[key] ?? '#94a3b8',
      }));
  }, [findings]);

  const total = data.reduce((acc, d) => acc + d.value, 0);

  if (total === 0) {
    return (
      <div className="border border-dashed border-slate-300 bg-slate-50 rounded-xl p-8 flex items-center justify-center mb-4">
        <p className="text-sm font-sans text-slate-400">Görüntülenecek bulgu verisi yok</p>
      </div>
    );
  }

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm mb-4 overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-100">
        <h4 className="font-sans text-sm font-semibold text-slate-700">
          {CHART_TITLE[block.content.chartType] ?? 'Grafik'}
        </h4>
        <p className="font-sans text-xs text-slate-400 mt-0.5">Toplam {total} bulgu · Canlı veri</p>
      </div>

      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={88}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [`${value} bulgu`, name]}
              contentStyle={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#475569' }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex flex-wrap gap-3 pt-3 border-t border-slate-100 mt-1">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: d.color }}
              />
              <span className="font-sans text-xs text-slate-600">
                {d.name}:{' '}
                <strong className="text-slate-800">{d.value}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
