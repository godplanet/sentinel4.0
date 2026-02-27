import { motion } from 'framer-motion';
import { Server, Wifi, WifiOff, Database, Clock } from 'lucide-react';
import clsx from 'clsx';
import type { DataSource } from '@/entities/ccm/types';

interface SourceCardsProps {
  sources: DataSource[];
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  ERP: Server,
  CORE_BANKING: Database,
  HR: Database,
  ACCESS_CONTROL: Server,
  INVOICE_SYSTEM: Database,
};

function timeSince(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}sn once`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}dk once`;
  const hours = Math.floor(minutes / 60);
  return `${hours}sa once`;
}

export function SourceCards({ sources }: SourceCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {sources.map((src, i) => {
        const Icon = TYPE_ICONS[src.source_type] || Server;
        const isActive = src.status === 'ACTIVE';

        return (
          <motion.div
            key={src.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={clsx(
              'border rounded-lg p-4 transition-all',
              isActive
                ? 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                : 'bg-slate-50 border-slate-200 opacity-60'
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={clsx(
                  'w-9 h-9 rounded-lg flex items-center justify-center',
                  isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                )}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{src.name}</h4>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{src.source_type.replace(/_/g, ' ')}</p>
                </div>
              </div>
              {isActive ? (
                <Wifi size={14} className="text-emerald-500" />
              ) : (
                <WifiOff size={14} className="text-red-400" />
              )}
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-slate-500">
                <Database size={11} />
                <span>{src.record_count.toLocaleString('tr-TR')} kayit</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Clock size={11} />
                <span>{timeSince(src.last_sync_at)}</span>
              </div>
            </div>

            <div className="mt-2.5 h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={clsx('h-full rounded-full', isActive ? 'bg-emerald-400' : 'bg-slate-300')}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.5, delay: i * 0.1 }}
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
