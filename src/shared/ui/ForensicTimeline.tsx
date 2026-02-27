import clsx from 'clsx';
import { LucideIcon } from 'lucide-react';

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'amber' | 'red' | 'slate' | 'maroon';
  isLast?: boolean;
}

const COLOR_MAP: Record<
  TimelineEvent['color'],
  { ring: string; bg: string; icon: string; title: string; dot: string }
> = {
  blue:   { ring: 'ring-blue-200',    bg: 'bg-blue-50',    icon: 'text-blue-600',    title: 'text-slate-800',   dot: 'bg-blue-500'    },
  green:  { ring: 'ring-emerald-200', bg: 'bg-emerald-50', icon: 'text-emerald-600', title: 'text-slate-800',   dot: 'bg-emerald-500' },
  amber:  { ring: 'ring-amber-200',   bg: 'bg-amber-50',   icon: 'text-amber-600',   title: 'text-slate-800',   dot: 'bg-amber-500'   },
  red:    { ring: 'ring-red-200',     bg: 'bg-red-50',     icon: 'text-red-600',     title: 'text-slate-800',   dot: 'bg-red-500'     },
  slate:  { ring: 'ring-slate-200',   bg: 'bg-slate-50',   icon: 'text-slate-500',   title: 'text-slate-700',   dot: 'bg-slate-400'   },
  maroon: { ring: 'ring-[#700000]/30',bg: 'bg-[#700000]/5',icon: 'text-[#700000]',   title: 'text-[#700000]',   dot: 'bg-[#700000]'   },
};

interface Props {
  events: TimelineEvent[];
  emptyMessage?: string;
}

export function ForensicTimeline({ events, emptyMessage = 'Kayıt bulunamadı.' }: Props) {
  if (events.length === 0) {
    return (
      <div className="text-center py-10 text-slate-400 text-sm">{emptyMessage}</div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {events.map((event, index) => {
        const cfg = COLOR_MAP[event.color];
        const isLast = index === events.length - 1;
        const Icon = event.icon;

        return (
          <li key={event.id} className="relative flex gap-4 pb-6">
            <div className="flex flex-col items-center">
              <div className={clsx(
                'w-9 h-9 rounded-full ring-2 flex items-center justify-center shrink-0 z-10',
                cfg.bg,
                cfg.ring,
              )}>
                <Icon size={16} className={cfg.icon} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 border-l-2 border-dashed border-slate-200 mt-1" />
              )}
            </div>

            <div className="flex-1 min-w-0 pt-1 pb-2">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={clsx('text-sm font-bold', cfg.title)}>{event.title}</p>
                <time className="text-[11px] text-slate-400 shrink-0 font-mono mt-0.5">
                  {event.date}
                </time>
              </div>
              {event.description && (
                <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
