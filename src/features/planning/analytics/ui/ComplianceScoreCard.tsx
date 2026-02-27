import { TrendingUp, TrendingDown, Minus, Target, Clock, DollarSign } from 'lucide-react';
import { getComplianceStatus } from '../logic';

interface ComplianceScoreCardProps {
  planRealizationRate: number;
  schedulePerformanceIndex: number;
  costPerformanceIndex: number;
  resourceUtilization: number;
}

export function ComplianceScoreCard({
  planRealizationRate,
  schedulePerformanceIndex,
  costPerformanceIndex,
  resourceUtilization,
}: ComplianceScoreCardProps) {
  const complianceStatus = getComplianceStatus(planRealizationRate);

  const getTrendIcon = (value: number, threshold = 1) => {
    if (value > threshold) return <TrendingUp size={18} className="text-green-600" />;
    if (value < threshold * 0.9) return <TrendingDown size={18} className="text-red-600" />;
    return <Minus size={18} className="text-yellow-600" />;
  };

  const getGlowClass = () => {
    if (planRealizationRate >= 90) {
      return 'shadow-[0_0_20px_rgba(34,197,94,0.4)] border-green-400';
    } else if (planRealizationRate >= 75) {
      return 'shadow-[0_0_20px_rgba(99,102,241,0.4)] border-indigo-400';
    } else if (planRealizationRate >= 60) {
      return 'shadow-[0_0_15px_rgba(234,179,8,0.4)] border-yellow-400';
    } else {
      return 'shadow-[0_0_20px_rgba(239,68,68,0.4)] border-red-400';
    }
  };

  return (
    <div className={`
      bg-white/90 backdrop-blur-xl rounded-xl border-2 p-8 transition-all
      ${getGlowClass()}
    `}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
          <Target size={40} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Plan Compliance Score</h2>
        <p className="text-sm text-slate-600">Overall audit plan realization metric</p>
      </div>

      <div className="text-center mb-8">
        <div className={`text-7xl font-bold mb-2 ${complianceStatus.color}`}>
          {planRealizationRate.toFixed(1)}%
        </div>
        <div className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm
          ${complianceStatus.severity === 'success' ? 'bg-green-100 text-green-700' :
            complianceStatus.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'}
        `}>
          {complianceStatus.label}
        </div>
      </div>

      <div className="space-y-4">
        <MetricRow
          icon={<Clock size={18} className="text-indigo-600" />}
          label="Schedule Performance Index"
          value={schedulePerformanceIndex}
          format={(v) => v.toFixed(2)}
          trend={getTrendIcon(schedulePerformanceIndex, 1)}
          description={schedulePerformanceIndex >= 1 ? 'On or ahead of schedule' : 'Behind schedule'}
        />

        <MetricRow
          icon={<DollarSign size={18} className="text-green-600" />}
          label="Cost Performance Index"
          value={costPerformanceIndex}
          format={(v) => v.toFixed(2)}
          trend={getTrendIcon(costPerformanceIndex, 1)}
          description={costPerformanceIndex >= 1 ? 'Under or on budget' : 'Over budget'}
        />

        <MetricRow
          icon={<TrendingUp size={18} className="text-purple-600" />}
          label="Resource Utilization"
          value={resourceUtilization}
          format={(v) => `${v.toFixed(0)}%`}
          trend={getTrendIcon(resourceUtilization / 100, 0.85)}
          description={`${resourceUtilization > 100 ? 'Over' : 'Within'} planned capacity`}
        />
      </div>

      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="text-xs text-slate-500 space-y-1">
          <p><span className="font-semibold">SPI:</span> Earned Value / Planned Value</p>
          <p><span className="font-semibold">CPI:</span> Earned Value / Actual Cost</p>
          <p><span className="font-semibold">Utilization:</span> Actual Hours / Planned Hours</p>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  icon,
  label,
  value,
  format,
  trend,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  format: (v: number) => string;
  trend: React.ReactNode;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <div className="flex-shrink-0">{icon}</div>
        <div className="flex-1">
          <div className="font-medium text-slate-900 text-sm">{label}</div>
          <div className="text-xs text-slate-500">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold text-slate-900">{format(value)}</div>
        {trend}
      </div>
    </div>
  );
}
