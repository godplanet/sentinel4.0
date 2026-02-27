import { AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import type { EngagementAnalytics } from '../logic';

interface DelayRiskTableProps {
  delayRisks: EngagementAnalytics[];
}

export function DelayRiskTable({ delayRisks }: DelayRiskTableProps) {
  const getSeverityColor = (variance: number) => {
    if (variance < -30) return 'text-red-700 bg-red-100';
    if (variance < -15) return 'text-orange-700 bg-orange-100';
    return 'text-yellow-700 bg-yellow-100';
  };

  const getSeverityLabel = (variance: number) => {
    if (variance < -30) return 'Critical';
    if (variance < -15) return 'High';
    return 'Medium';
  };

  if (delayRisks.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-slate-200 p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <Clock size={32} className="text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Delays Detected</h3>
          <p className="text-sm text-slate-600">All engagements are on track or ahead of schedule</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-rose-100">
            <AlertTriangle size={20} className="text-rose-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Delay Risk Analysis</h3>
            <p className="text-sm text-slate-600">
              Engagements with significant schedule slippage ({'>'}10% variance)
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Planned
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actual
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Variance
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Severity
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Days Delay
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {delayRisks.map((risk) => (
              <tr
                key={risk.engagement.id}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-900">{risk.engagement.title}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {risk.engagement.audit_type}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className={`
                    inline-flex px-2 py-1 rounded text-xs font-semibold
                    ${risk.engagement.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      risk.engagement.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'}
                  `}>
                    {risk.engagement.status.replace('_', ' ')}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="text-sm font-medium text-slate-900">
                    {risk.plannedProgress.toFixed(0)}%
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="text-sm font-medium text-slate-900">
                    {risk.actualProgress.toFixed(0)}%
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <TrendingDown size={14} className="text-rose-600" />
                    <span className="text-sm font-bold text-rose-600">
                      {risk.scheduleVariance.toFixed(0)}%
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <span className={`
                    inline-flex px-2 py-1 rounded text-xs font-semibold
                    ${getSeverityColor(risk.scheduleVariance)}
                  `}>
                    {getSeverityLabel(risk.scheduleVariance)}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="text-sm font-medium text-slate-900">
                    {risk.daysDelay > 0 ? (
                      <span className="text-rose-600 font-bold">{risk.daysDelay} days</span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-100"></div>
            <span>Critical ({'<'}-30%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-orange-100"></div>
            <span>High (-30% to -15%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-100"></div>
            <span>Medium (-15% to -10%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
