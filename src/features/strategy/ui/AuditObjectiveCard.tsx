import { AuditObjectiveSimple } from '@/entities/strategy/model/types';
import clsx from 'clsx';
import { CheckCircle2, Users } from 'lucide-react';

interface Props {
  objective: AuditObjectiveSimple;
}

export const AuditObjectiveCard = ({ objective }: Props) => {
  const getTypeIcon = (type: string) => {
    return type === 'Assurance' ? CheckCircle2 : Users;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
      case 'At Risk': return 'text-rose-600 bg-rose-500/10 border-rose-500/20';
      default: return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
    }
  };

  const Icon = getTypeIcon(objective.type);

  return (
    <div className="glass-panel px-3 py-2.5 rounded-lg hover:scale-[1.01] transition-all duration-200 group relative overflow-hidden">
      <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-10 bg-teal-500" />

      <div className="flex items-center gap-2 relative z-10">
        <div className="flex-shrink-0 p-1.5 rounded-md bg-surface/50 backdrop-blur-md border border-white/20">
          <Icon className="w-3.5 h-3.5 text-teal-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-slate-800 leading-tight line-clamp-1 mb-1">
            {objective.title}
          </h4>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] bg-canvas text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
              {objective.type}
            </span>
            <span className={clsx('text-[9px] px-1.5 py-0.5 rounded border font-semibold', getStatusColor(objective.status))}>
              {objective.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
