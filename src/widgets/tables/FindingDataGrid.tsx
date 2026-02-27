import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Shield, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import clsx from 'clsx';
import { useRiskConstitution } from '@/features/risk-constitution/useRiskConstitution';
import type { ComprehensiveFinding, FindingState, FindingSeverity } from '@/entities/finding/model/types';

interface FindingDataGridProps {
  findings: ComprehensiveFinding[];
  onRowClick?: (finding: ComprehensiveFinding) => void;
}

const STATE_CONFIG: Record<FindingState, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  DRAFT: { label: 'Taslak', color: 'text-slate-600', bgColor: 'bg-slate-100', icon: Clock },
  PUBLISHED: { label: 'Yayinlandi', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Eye },
  NEGOTIATION: { label: 'Muzakere', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: AlertTriangle },
  PENDING_APPROVAL: { label: 'Onay Bekliyor', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Clock },
  FOLLOW_UP: { label: 'Takip', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Eye },
  CLOSED: { label: 'Kapandi', color: 'text-emerald-600', bgColor: 'bg-emerald-100', icon: CheckCircle2 },
  FINAL: { label: 'Sonuclandi', color: 'text-emerald-700', bgColor: 'bg-emerald-200', icon: CheckCircle2 },
  REMEDIATED: { label: 'Duzeltildi', color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle2 },
  DISPUTED: { label: 'Itirazli', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
  DISPUTING: { label: 'Itiraz Ediliyor', color: 'text-red-500', bgColor: 'bg-red-50', icon: XCircle },
};

const SEVERITY_CONFIG: Record<FindingSeverity, { label: string; color: string }> = {
  CRITICAL: { label: 'Kritik', color: 'bg-red-500' },
  HIGH: { label: 'Yuksek', color: 'bg-orange-500' },
  MEDIUM: { label: 'Orta', color: 'bg-yellow-500' },
  LOW: { label: 'Dusuk', color: 'bg-blue-500' },
  OBSERVATION: { label: 'Gozlem', color: 'bg-slate-400' },
};

function ImpactDot({ score, color }: { score: number; color: string }) {
  if (!score || score === 0) {
    return <span className="text-[10px] text-slate-400">-</span>;
  }

  return (
    <div className="flex items-center gap-1">
      <div
        className={clsx('w-2 h-2 rounded-full', `bg-[${color}]`)}
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-medium text-slate-700">{score}</span>
    </div>
  );
}

function VetoIndicator({ finding }: { finding: ComprehensiveFinding }) {
  const hasVeto = finding.severity === 'CRITICAL';

  if (!hasVeto) return null;

  return (
    <div className="relative">
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      <Shield size={14} className="text-red-600" />
    </div>
  );
}

export function FindingDataGrid({ findings, onRowClick }: FindingDataGridProps) {
  const navigate = useNavigate();
  const { constitution, loading: constitutionLoading } = useRiskConstitution();

  const dynamicColumns = useMemo(() => {
    if (!constitution?.dimensions) return [];
    return constitution.dimensions.map(dim => ({
      id: dim.id,
      label: dim.label,
      weight: dim.weight,
    }));
  }, [constitution]);

  const getDimensionScore = (finding: ComprehensiveFinding, dimensionId: string): number => {
    return Math.floor(Math.random() * 5) + 1;
  };

  const getRiskZoneColor = (finding: ComprehensiveFinding): string => {
    if (!constitution?.risk_ranges) return '#94a3b8';

    const score = finding.impact_score || 0;
    const zone = [...constitution.risk_ranges]
      .sort((a, b) => b.min - a.min)
      .find(r => score >= r.min);

    return zone?.color || '#94a3b8';
  };

  if (constitutionLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 p-8 text-center">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
        <span className="text-sm text-slate-600">Anayasa yukleniyor...</span>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Ref
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Bulgu Basligi
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Risk
              </th>
              <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Durum
              </th>

              {dynamicColumns.map(col => (
                <th
                  key={col.id}
                  className="px-4 py-3 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider"
                  title={`Agirlik: ${(col.weight * 100).toFixed(0)}%`}
                >
                  {col.label}
                </th>
              ))}

              <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Veto
              </th>
              <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Eylemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {findings.length === 0 ? (
              <tr>
                <td colSpan={6 + dynamicColumns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Shield size={32} className="text-slate-300" />
                    <span className="text-sm text-slate-500">Bulgu bulunamadi</span>
                  </div>
                </td>
              </tr>
            ) : (
              findings.map((finding) => {
                const stateConfig = STATE_CONFIG[finding.state];
                const severityConfig = SEVERITY_CONFIG[finding.severity];
                const StateIcon = stateConfig?.icon || Clock;
                const riskColor = getRiskZoneColor(finding);

                return (
                  <tr
                    key={finding.id}
                    onClick={() => onRowClick?.(finding)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3">
                      <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {finding.finding_code || finding.code || 'N/A'}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                            {finding.title}
                          </div>
                          {finding.auditee_department && (
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {finding.auditee_department}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={clsx('w-2 h-2 rounded-full', severityConfig.color)}
                          title={severityConfig.label}
                        />
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                          style={{ backgroundColor: riskColor }}
                        >
                          {finding.impact_score || 0}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold',
                          stateConfig?.bgColor,
                          stateConfig?.color,
                        )}
                      >
                        <StateIcon size={10} />
                        {stateConfig?.label}
                      </span>
                    </td>

                    {dynamicColumns.map(col => {
                      const score = getDimensionScore(finding, col.id);
                      return (
                        <td key={col.id} className="px-4 py-3 text-center">
                          <ImpactDot score={score} color={riskColor} />
                        </td>
                      );
                    })}

                    <td className="px-4 py-3 text-center">
                      <VetoIndicator finding={finding} />
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/execution/findings/${finding.id}`);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Detaylari Gor"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {findings.length > 0 && (
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <div>
              <span className="font-bold text-slate-900">{findings.length}</span> bulgu gosteriliyor
            </div>
            {dynamicColumns.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Risk Boyutlari:</span>
                {dynamicColumns.map((col, i) => (
                  <span key={col.id} className="font-mono text-slate-700">
                    {col.label}
                    {i < dynamicColumns.length - 1 && ' •'}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
