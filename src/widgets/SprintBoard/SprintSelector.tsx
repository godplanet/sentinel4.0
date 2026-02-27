import { ChevronDown, Target } from 'lucide-react';
import clsx from 'clsx';
import type { AuditSprint } from '@/features/audit-creation/types';
import { SPRINT_STATUS_LABELS } from '@/features/audit-creation/types';

interface SprintSelectorProps {
  sprints: AuditSprint[];
  activeSprint: AuditSprint | null;
  onSelect: (sprint: AuditSprint) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PLANNED: 'bg-slate-100 text-slate-600',
  ACTIVE: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
};

export function SprintSelector({ sprints, activeSprint, onSelect }: SprintSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {sprints.map((sprint) => {
        const isActive = activeSprint?.id === sprint.id;
        return (
          <button
            key={sprint.id}
            onClick={() => onSelect(sprint)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all whitespace-nowrap',
              isActive
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            )}
          >
            <Target size={14} />
            <span>Sprint {sprint.sprint_number}</span>
            <span className={clsx(
              'text-[10px] px-1.5 py-0.5 rounded font-semibold',
              isActive ? 'bg-white/20 text-white' : STATUS_COLORS[sprint.status]
            )}>
              {SPRINT_STATUS_LABELS[sprint.status]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
