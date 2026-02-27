import { ArrowRight, Leaf, ShieldCheck, TrendingUp, TrendingDown, Minus, Zap, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { DraftEngagement, RiskVelocity } from '@/entities/planning/model/types';
import { usePlanningStore } from '@/entities/planning/model/store';

interface PlanCardProps {
  engagement: DraftEngagement;
  isBacklog?: boolean;
}

const riskLabel = (score: number) => {
  if (score >= 75) return { label: 'Kritik', className: 'bg-red-50 text-red-700 border border-red-200' };
  if (score >= 50) return { label: 'Yüksek', className: 'bg-amber-50 text-amber-700 border border-amber-200' };
  return { label: 'Orta', className: 'bg-blue-50 text-blue-700 border border-blue-200' };
};

const velocityConfig: Record<RiskVelocity, { icon: typeof TrendingUp; label: string; className: string }> = {
  HIGH: { icon: TrendingUp, label: 'Hızlı', className: 'bg-rose-50 text-rose-700 border border-rose-200' },
  MEDIUM: { icon: Minus, label: 'Sabit', className: 'bg-slate-100 text-slate-600 border border-slate-200' },
  LOW: { icon: TrendingDown, label: 'Yavaş', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
};

export function PlanCard({ engagement, isBacklog = false }: PlanCardProps) {
  const pullToSprint = usePlanningStore((s) => s.pullToSprint);
  const navigate = useNavigate();

  const risk = riskLabel(engagement.baseRisk);
  const vel = velocityConfig[engagement.velocity];
  const VelIcon = vel.icon;
  const isCCM = engagement.isCCMTriggered === true;

  const headerClass = isCCM
    ? 'bg-gradient-to-r from-red-50 to-rose-50 border-b border-red-100'
    : isBacklog
      ? 'bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200'
      : 'bg-gradient-to-r from-indigo-50/90 to-blue-50/60 border-b border-indigo-100';

  const titleClass = isCCM
    ? 'text-red-900 font-semibold'
    : isBacklog
      ? 'text-slate-800 font-semibold'
      : 'text-indigo-900 font-medium';

  const containerClass = isCCM
    ? 'border-2 border-red-400/60 ring-2 ring-red-300/40 animate-pulse'
    : isBacklog
      ? 'border border-slate-200/80'
      : 'border border-indigo-200/70';

  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col ${containerClass}`}>
      <div className={`px-4 pt-3.5 pb-3 flex items-start justify-between gap-2 ${headerClass}`}>
        <div className="flex-1 min-w-0">
          {isCCM && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap size={11} className="text-red-500 shrink-0" />
              <span className="text-xs font-bold text-red-600 leading-none tracking-wide uppercase">
                KCI Breach — Auto-Triggered
              </span>
            </div>
          )}
          <h3 className={`text-sm leading-snug truncate ${titleClass}`}>
            {engagement.universeNodeName}
          </h3>
        </div>
        <span className={`text-xs font-bold tabular-nums shrink-0 mt-0.5 px-1.5 py-0.5 rounded ${isCCM ? 'bg-red-100 text-red-700' : isBacklog ? 'bg-slate-200/70 text-slate-600' : 'bg-indigo-100/80 text-indigo-700'}`}>
          {engagement.baseRisk}
        </span>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3 bg-white">
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${risk.className}`}>
            Risk: {risk.label}
          </span>

          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${vel.className}`}>
            <VelIcon size={10} />
            V: {vel.label}
          </span>

          {engagement.shariah && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200">
              <ShieldCheck size={10} />
              Şer. Uyum
            </span>
          )}

          {engagement.esg && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
              <Leaf size={10} />
              ESG
            </span>
          )}
        </div>

        {engagement.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {engagement.requiredSkills.slice(0, 3).map((skill) => (
              <span key={skill} className="text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5">
                {skill}
              </span>
            ))}
            {engagement.requiredSkills.length > 3 && (
              <span className="text-xs text-slate-400">+{engagement.requiredSkills.length - 3}</span>
            )}
          </div>
        )}

        {isBacklog && (
          <button
            onClick={() => pullToSprint(engagement.id)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 hover:border-indigo-300 transition-colors duration-150"
          >
            Q-Sprint'e Al
            <ArrowRight size={13} />
          </button>
        )}

        {!isBacklog && (
          <button
            onClick={() => navigate('/execution/sprint-board')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:from-blue-700 hover:to-blue-600 transition-all duration-150"
          >
            <Rocket size={13} />
            Sahaya Git (Execute)
          </button>
        )}
      </div>
    </div>
  );
}
