import clsx from 'clsx';

interface ProgressBarProps {
  tested: number;
  total: number;
  effective: number;
  ineffective: number;
}

export function ProgressBar({ tested, total, effective, ineffective }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((tested / total) * 100) : 0;
  const effectivePct = total > 0 ? Math.round((effective / total) * 100) : 0;
  const ineffectivePct = total > 0 ? Math.round((ineffective / total) * 100) : 0;

  return (
    <div className="flex items-center gap-6">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-bold text-slate-800">
            Bulk Progress
          </span>
          <span className="text-sm font-bold text-slate-800">
            {tested}/{total} Controls Tested ({pct}%)
          </span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
          {effectivePct > 0 && (
            <div
              className="bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${effectivePct}%` }}
            />
          )}
          {ineffectivePct > 0 && (
            <div
              className="bg-red-500 transition-all duration-500 ease-out"
              style={{ width: `${ineffectivePct}%` }}
            />
          )}
          {(pct - effectivePct - ineffectivePct) > 0 && (
            <div
              className="bg-slate-300 transition-all duration-500 ease-out"
              style={{ width: `${pct - effectivePct - ineffectivePct}%` }}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Effective ({effective})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="text-slate-600">Ineffective ({ineffective})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="text-slate-600">Not Started ({total - tested})</span>
        </div>
      </div>
    </div>
  );
}
