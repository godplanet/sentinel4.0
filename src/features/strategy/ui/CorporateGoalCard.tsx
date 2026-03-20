import { StrategicGoal } from '@/entities/strategy/model/types';
import clsx from 'clsx';
import { ArrowRight, ShieldCheck, Target } from 'lucide-react';

interface Props {
  goal: StrategicGoal;
}

export const CorporateGoalCard = ({ goal }: Props) => {
  const getTheme = (appetite: string) => {
    switch (appetite) {
      case 'High':
        return {
          bg: 'bg-gradient-to-br from-white to-rose-50',
          border: 'border-rose-100',
          iconBg: 'bg-rose-100 text-rose-600',
          progress: 'from-rose-500 to-orange-500',
          badge: 'bg-rose-100 text-rose-700 border-rose-200',
        };
      case 'Medium':
        return {
          bg: 'bg-gradient-to-br from-white to-amber-50',
          border: 'border-amber-100',
          iconBg: 'bg-amber-100 text-amber-600',
          progress: 'from-amber-500 to-yellow-500',
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-white to-emerald-50',
          border: 'border-emerald-100',
          iconBg: 'bg-emerald-100 text-emerald-600',
          progress: 'from-emerald-500 to-teal-500',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
    }
  };

  const theme = getTheme(goal.riskAppetite);

  return (
    <div className={clsx(
      'group relative rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300 border flex flex-col h-full',
      theme.bg, theme.border
    )}>
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div className={clsx('p-1.5 rounded-lg shadow-sm', theme.iconBg)}>
          <Target className="w-4 h-4" />
        </div>
        <div className={clsx('px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border', theme.badge)}>
          {goal.riskAppetite} Risk
        </div>
      </div>

      {/* Content */}
      <h3 className="text-sm font-bold text-slate-800 mb-1 leading-tight group-hover:text-indigo-900 transition-colors line-clamp-2">
        {goal.title}
      </h3>
      <p className="text-xs text-slate-500 mb-2 flex-1 line-clamp-2">
        {goal.description}
      </p>

      {/* Progress Section */}
      <div className="space-y-1 mt-auto">
        <div className="flex justify-between text-[10px] font-semibold text-slate-600">
          <span>Gerçekleşme</span>
          <span>{goal.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-surface/60 rounded-full overflow-hidden border border-slate-200/60">
          <div
            className={clsx('h-full rounded-full bg-gradient-to-r shadow-sm', theme.progress)}
            style={{ width: `${goal.progress}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-1 text-slate-500">
          <ShieldCheck size={11} className="text-indigo-500" />
          <span className="font-medium">{goal.linkedAuditObjectives?.length || 0} Denetim Hedefi</span>
        </div>
        <ArrowRight size={12} className="text-slate-400 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
      </div>
    </div>
  );
};
