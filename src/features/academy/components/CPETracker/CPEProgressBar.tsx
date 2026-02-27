import { TrendingUp, AlertTriangle, CheckCircle2, Target } from 'lucide-react';

interface CPEProgressBarProps {
  earnedHours: number;
  goalHours: number;
  pendingHours?: number;
  year?: number;
  onEditGoal?: () => void;
}

export function CPEProgressBar({
  earnedHours,
  goalHours,
  pendingHours = 0,
  year = new Date().getFullYear(),
  onEditGoal,
}: CPEProgressBarProps) {
  const pct           = goalHours > 0 ? Math.min((earnedHours / goalHours) * 100, 100) : 0;
  const pendingPct    = goalHours > 0 ? Math.min((pendingHours / goalHours) * 100, 100 - pct) : 0;
  const remaining     = Math.max(goalHours - earnedHours, 0);
  const isOnTrack     = pct >= 75;
  const isBehind      = pct < 50;
  const isCompleted   = pct >= 100;

  const barColor = isCompleted
    ? 'from-emerald-500 to-emerald-400'
    : isOnTrack
    ? 'from-blue-600 to-cyan-500'
    : isBehind
    ? 'from-rose-600 to-rose-500'
    : 'from-amber-500 to-amber-400';

  const statusConfig = isCompleted
    ? { icon: CheckCircle2, label: 'Goal Completed', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' }
    : isOnTrack
    ? { icon: TrendingUp, label: 'On Track', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' }
    : isBehind
    ? { icon: AlertTriangle, label: 'Behind Schedule', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' }
    : { icon: TrendingUp, label: 'At Risk', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Target size={15} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              CPE Goal — {year}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">
              {earnedHours.toFixed(1)}
            </span>
            <span className="text-slate-400 text-sm font-medium">
              / {goalHours} hours earned
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
            <StatusIcon size={12} />
            {statusConfig.label}
          </div>
          {onEditGoal && (
            <button
              onClick={onEditGoal}
              className="text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
            >
              Edit goal
            </button>
          )}
        </div>
      </div>

      <div className="relative h-3 rounded-full bg-slate-100 overflow-hidden mb-3">
        {pendingPct > 0 && (
          <div
            className="absolute top-0 h-full rounded-full bg-amber-200 transition-all duration-700"
            style={{ left: `${pct}%`, width: `${pendingPct}%` }}
          />
        )}
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-4">
          <span>
            <span className="font-semibold text-slate-700">{earnedHours.toFixed(1)}</span> approved
          </span>
          {pendingHours > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-300 inline-block" />
              <span className="font-semibold text-slate-700">{pendingHours.toFixed(1)}</span> pending
            </span>
          )}
        </div>
        <span>
          {isCompleted ? (
            <span className="text-emerald-600 font-semibold">Goal reached!</span>
          ) : (
            <span>
              <span className="font-semibold text-slate-700">{remaining.toFixed(1)}</span> hours remaining
            </span>
          )}
        </span>
      </div>

      {!isCompleted && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
            <MiniStat label="% Complete" value={`${Math.round(pct)}%`} />
            <MiniStat label="Remaining" value={`${remaining.toFixed(1)} hrs`} />
            <MiniStat label="Pending Review" value={`${pendingHours.toFixed(1)} hrs`} />
          </div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-1">
      <p className="text-slate-900 font-semibold text-sm">{value}</p>
      <p className="text-slate-400 text-xs mt-0.5">{label}</p>
    </div>
  );
}
