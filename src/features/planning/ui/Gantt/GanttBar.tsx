import { useMemo, useState } from 'react';

interface AuditorDisplay {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  capacity: number;
}

interface GanttBarProps {
  start: Date;
  end: Date;
  title: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  riskScore: number;
  entityName: string;
  yearStart: Date;
  assignedAuditor?: AuditorDisplay;
  onClick?: () => void;
}

const STATUS_STYLES = {
  PLANNED: {
    bg: 'from-blue-500/80 to-blue-600/80',
    border: 'border-blue-400/30',
    text: 'text-blue-50',
  },
  IN_PROGRESS: {
    bg: 'from-amber-500/80 to-amber-600/80',
    border: 'border-amber-400/30',
    text: 'text-amber-50',
  },
  COMPLETED: {
    bg: 'from-emerald-500/80 to-emerald-600/80',
    border: 'border-emerald-400/30',
    text: 'text-emerald-50',
  },
  CANCELLED: {
    bg: 'from-slate-400/60 to-slate-500/60',
    border: 'border-slate-400/30',
    text: 'text-slate-200',
  },
};

export function GanttBar({
  start,
  end,
  title,
  status,
  riskScore,
  entityName,
  yearStart,
  assignedAuditor,
  onClick,
}: GanttBarProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const position = useMemo(() => {
    const yearStartTime = yearStart.getTime();
    const yearEndTime = new Date(yearStart.getFullYear(), 11, 31).getTime();
    const yearDuration = yearEndTime - yearStartTime;

    const startTime = start.getTime();
    const endTime = end.getTime();

    const left = ((startTime - yearStartTime) / yearDuration) * 100;
    const width = ((endTime - startTime) / yearDuration) * 100;

    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.min(100 - left, width)}%`,
    };
  }, [start, end, yearStart]);

  const styles = STATUS_STYLES[status];

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  const getRiskColor = (score: number) => {
    if (score >= 150) return 'text-red-400';
    if (score >= 100) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <div
      className="absolute top-1 bottom-1 cursor-pointer group"
      style={{
        left: position.left,
        width: position.width,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div
        className={`
          h-full rounded-md px-2 py-1
          bg-gradient-to-r ${styles.bg}
          backdrop-blur-sm
          border ${styles.border}
          ${styles.text}
          font-medium text-xs
          transition-all duration-200
          group-hover:shadow-lg group-hover:scale-105
          flex items-center justify-between gap-2
          overflow-hidden
        `}
      >
        <span className="truncate flex-1 text-center">{title}</span>
        {assignedAuditor && (
          <img
            src={assignedAuditor.avatarUrl}
            alt={assignedAuditor.name}
            className="w-6 h-6 rounded-full border border-white shadow-sm flex-shrink-0"
            title={assignedAuditor.name}
          />
        )}
      </div>

      {showTooltip && (
        <div className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 pointer-events-none">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-lg border border-white/10 p-3 shadow-2xl">
            <div className="space-y-2">
              <div>
                <div className="text-xs text-slate-400 mb-1">Denetim</div>
                <div className="text-sm font-semibold text-white">{title}</div>
              </div>

              <div>
                <div className="text-xs text-slate-400 mb-1">Birim</div>
                <div className="text-sm text-slate-200">{entityName}</div>
              </div>

              <div className="flex justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Başlangıç</div>
                  <div className="text-sm text-white">{formatDate(start)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Bitiş</div>
                  <div className="text-sm text-white">{formatDate(end)}</div>
                </div>
              </div>

              <div className="flex justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Durum</div>
                  <div className={`text-sm font-medium ${styles.text}`}>
                    {status.replace('_', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">Risk Skoru</div>
                  <div className={`text-sm font-bold ${getRiskColor(riskScore)}`}>
                    {riskScore.toFixed(1)}
                  </div>
                </div>
              </div>

              {assignedAuditor && (
                <div className="pt-2 mt-2 border-t border-white/10">
                  <div className="text-xs text-slate-400 mb-1">Denetçi</div>
                  <div className="flex items-center gap-2">
                    <img
                      src={assignedAuditor.avatarUrl}
                      alt={assignedAuditor.name}
                      className="w-6 h-6 rounded-full border border-white/20"
                    />
                    <div>
                      <div className="text-sm font-medium text-white">
                        {assignedAuditor.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {assignedAuditor.role}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900/95 rotate-45 border-r border-b border-white/10" />
          </div>
        </div>
      )}
    </div>
  );
}
