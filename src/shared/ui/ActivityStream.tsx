import { motion } from 'framer-motion';
import {
  CheckCircle2, AlertTriangle, Edit3, Send, User,
  FileText, Clock, MessageSquare, ArrowRight, Shield
} from 'lucide-react';
import clsx from 'clsx';

export interface ActivityEvent {
  id: string;
  type: 'status_change' | 'comment' | 'assignment' | 'edit' | 'approval' | 'rejection' | 'creation' | 'upload';
  actor: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

interface ActivityStreamProps {
  events: ActivityEvent[];
  maxItems?: number;
  compact?: boolean;
}

const EVENT_CONFIG = {
  status_change: { icon: ArrowRight, color: 'bg-blue-100 text-blue-600' },
  comment: { icon: MessageSquare, color: 'bg-slate-100 text-slate-600' },
  assignment: { icon: User, color: 'bg-cyan-100 text-cyan-600' },
  edit: { icon: Edit3, color: 'bg-amber-100 text-amber-600' },
  approval: { icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
  rejection: { icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  creation: { icon: FileText, color: 'bg-blue-100 text-blue-600' },
  upload: { icon: Shield, color: 'bg-teal-100 text-teal-600' },
} as const;

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Az once';
  if (diffMins < 60) return `${diffMins} dk once`;
  if (diffHours < 24) return `${diffHours} saat once`;
  if (diffDays < 7) return `${diffDays} gun once`;
  return then.toLocaleDateString('tr-TR');
}

export function ActivityStream({ events, maxItems, compact = false }: ActivityStreamProps) {
  const displayed = maxItems ? events.slice(0, maxItems) : events;

  if (displayed.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto text-slate-300 mb-2" size={32} />
        <p className="text-sm text-slate-500">Henuz aktivite yok</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-200" />

      <div className="space-y-1">
        {displayed.map((event, idx) => {
          const config = EVENT_CONFIG[event.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="relative flex items-start gap-3 pl-0"
            >
              <div className={clsx(
                'relative z-10 rounded-full flex items-center justify-center flex-shrink-0',
                compact ? 'w-7 h-7' : 'w-9 h-9',
                config.color
              )}>
                <Icon size={compact ? 12 : 14} />
              </div>

              <div className={clsx('flex-1 min-w-0', compact ? 'py-1' : 'py-2')}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={clsx('font-semibold text-slate-900', compact ? 'text-[11px]' : 'text-xs')}>
                    {event.actor}
                  </span>
                  <span className={clsx('text-slate-500', compact ? 'text-[10px]' : 'text-xs')}>
                    {event.description}
                  </span>
                </div>

                {event.metadata && !compact && (
                  <div className="flex items-center gap-2 mt-1">
                    {Object.entries(event.metadata).map(([key, val]) => (
                      <span key={key} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                )}

                <p className={clsx('text-slate-400 mt-0.5', compact ? 'text-[9px]' : 'text-[10px]')}>
                  {formatRelativeTime(event.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
