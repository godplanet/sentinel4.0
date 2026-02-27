import { Filter, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

export interface ReportFilters {
  year: string;
  reportType: string;
  riskLevel: string;
  status: string;
}

interface ReportTypeStat {
  value: string;
  label: string;
  count: number;
}

interface ReportFilterSidebarProps {
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  typeCounts: Record<string, number>;
  totalCount: number;
}

const REPORT_TYPES: ReportTypeStat[] = [
  { value: 'all', label: 'Tümü', count: 0 },
  { value: 'branch_audit', label: 'Şube Denetimi', count: 0 },
  { value: 'investigation', label: 'Soruşturma', count: 0 },
  { value: 'compliance', label: 'Uyum Raporu', count: 0 },
  { value: 'executive', label: 'Yönetici Sunumu', count: 0 },
  { value: 'blank', label: 'Diğer', count: 0 },
];

const RISK_LEVELS = [
  { value: 'all', label: 'Tümü' },
  { value: 'critical', label: 'Kritik' },
  { value: 'high', label: 'Yüksek' },
  { value: 'medium', label: 'Orta' },
  { value: 'low', label: 'Düşük' },
];

const STATUSES = [
  { value: 'all', label: 'Tümü' },
  { value: 'draft', label: 'Taslak' },
  { value: 'in_review', label: 'İncelemede' },
  { value: 'published', label: 'Yayınlandı' },
  { value: 'archived', label: 'Arşiv' },
];

const YEARS = ['Tüm Yıllar', '2026', '2025', '2024'];

export function ReportFilterSidebar({
  filters,
  onChange,
  typeCounts,
  totalCount,
}: ReportFilterSidebarProps) {
  const set = (key: keyof ReportFilters, value: string) =>
    onChange({ ...filters, [key]: value });

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white h-full overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-5">
          <Filter size={15} className="text-slate-500" />
          <span className="font-sans font-semibold text-slate-700 text-sm">Filtreler</span>
        </div>

        <div className="mb-5">
          <p className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider mb-2">
            YIL
          </p>
          <div className="relative">
            <select
              value={filters.year}
              onChange={(e) => set('year', e.target.value)}
              className="w-full appearance-none border border-slate-200 rounded-lg px-3 py-2 text-sm font-sans text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors pr-8"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider mb-2">
            RAPOR TİPİ
          </p>
          <div className="space-y-0.5">
            {REPORT_TYPES.map((rt) => {
              const count = rt.value === 'all' ? totalCount : (typeCounts[rt.value] ?? 0);
              const isActive = filters.reportType === rt.value;
              return (
                <button
                  key={rt.value}
                  onClick={() => set('reportType', rt.value)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-sans transition-colors text-left',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  <span>{rt.label}</span>
                  <span
                    className={clsx(
                      'text-xs px-1.5 py-0.5 rounded-full',
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500',
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider mb-2">
            RİSK SEVİYESİ
          </p>
          <div className="space-y-0.5">
            {RISK_LEVELS.map((rl) => {
              const isActive = filters.riskLevel === rl.value;
              return (
                <button
                  key={rl.value}
                  onClick={() => set('riskLevel', rl.value)}
                  className={clsx(
                    'w-full px-3 py-1.5 rounded-lg text-sm font-sans transition-colors text-left',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {rl.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-[11px] font-sans font-semibold text-slate-400 uppercase tracking-wider mb-2">
            DURUM
          </p>
          <div className="space-y-0.5">
            {STATUSES.map((s) => {
              const isActive = filters.status === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => set('status', s.value)}
                  className={clsx(
                    'w-full px-3 py-1.5 rounded-lg text-sm font-sans transition-colors text-left',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50',
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
