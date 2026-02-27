import { ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { useUIStore } from '@/shared/stores/ui-store';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  viewControls?: ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  icon: Icon,
  action,
  viewControls,
  className,
}: PageHeaderProps) => {
  const { sidebarColor } = useUIStore();

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-2xl px-6 py-4 mb-6',
        'bg-white/70 backdrop-blur-xl border border-slate-200/80 shadow-sm',
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${sidebarColor} 0%, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-4 flex-col md:flex-row">
        <div className="flex items-center gap-3 flex-1">
          {Icon && (
            <div
              className="flex items-center justify-center rounded-xl p-2.5 shadow-sm border border-white/60"
              style={{ backgroundColor: sidebarColor }}
            >
              <Icon size={20} className="text-white" strokeWidth={2} />
            </div>
          )}

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h1>
            {description && (
              <p className="text-xs font-medium text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {viewControls && <div className="flex-1 md:flex-initial">{viewControls}</div>}
          {action && <div className="flex-1 md:flex-initial">{action}</div>}
        </div>
      </div>
    </div>
  );
};
