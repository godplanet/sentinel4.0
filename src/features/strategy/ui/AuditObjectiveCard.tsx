import { AuditObjectiveSimple } from '@/entities/strategy/model/types';
import { CheckCircle2, Users } from 'lucide-react';
import clsx from 'clsx';

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
    <div className="glass-panel p-4 rounded-lg hover:scale-[1.01] transition-all duration-200 group relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 bg-teal-500" />

      <div className="flex items-start gap-3 relative z-10">
        <div className="flex-shrink-0 p-2 rounded-lg bg-white/50 backdrop-blur-md border border-white/20">
          <Icon className="w-5 h-5 text-teal-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-slate-800 leading-tight">
              {objective.title}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
              {objective.type}
            </span>
            <span className={clsx("text-[10px] px-2 py-0.5 rounded border font-semibold", getStatusColor(objective.status))}>
              {objective.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
