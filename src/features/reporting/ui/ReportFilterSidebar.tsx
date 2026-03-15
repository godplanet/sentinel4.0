import clsx from 'clsx';
import { BarChart2, Calendar, ChevronDown, Filter, Layers } from 'lucide-react';

/** Filtreler — reports + engagement_risk_score bandı */
export interface ReportFilters {
 year: string;
 status: string;
 riskBand: string;
}

interface ReportFilterSidebarProps {
 filters: ReportFilters;
 onChange: (filters: ReportFilters) => void;
 statusCounts: Record<string, number>;
 totalCount: number;
}

const STATUSES = [
 { value: 'all', label: 'Tümü' },
 { value: 'draft', label: 'Taslak' },
 { value: 'review', label: 'İncelemede' },
 { value: 'published', label: 'Yayınlandı' },
 { value: 'archived', label: 'Arşiv' },
 { value: 'revoked_amended', label: 'İptal — Zeyilname' },
];

const YEARS = ['Tüm Yıllar', '2026', '2025', '2024'];

const RISK_BANDS = [
 { value: 'all', label: 'Tüm risk seviyeleri' },
 { value: 'high', label: 'Yüksek risk (70+)' },
 { value: 'medium', label: 'Orta (40–70)' },
 { value: 'low', label: 'Düşük (0–40)' },
];

export function ReportFilterSidebar({
 filters,
 onChange,
 statusCounts,
 totalCount,
}: ReportFilterSidebarProps) {
 const set = (key: keyof ReportFilters, value: string) =>
 onChange({ ...filters, [key]: value });

 return (
 <aside className="w-72 flex-shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur-sm h-full overflow-y-auto shadow-sm">
 <div className="p-5">
 <div className="flex items-center gap-2.5 mb-3">
 <div className="p-2 bg-slate-100 rounded-lg">
 <Filter size={16} className="text-slate-600" />
 </div>
 <span className="font-sans font-bold text-slate-800 text-sm">Filtreler</span>
 </div>

 {/* Yıl */}
 <div className="mb-3">
 <div className="flex items-center gap-2 mb-2.5">
 <Calendar size={14} className="text-slate-500" />
 <p className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
 Yıl
 </p>
 </div>
 <div className="relative">
 <select
 value={filters.year}
 onChange={(e) => set('year', e.target.value)}
 className="w-full appearance-none border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-sans text-slate-700 bg-surface focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors pr-9"
 >
 {(YEARS || []).map((y) => (
 <option key={y} value={y}>
 {y}
 </option>
 ))}
 </select>
 <ChevronDown
 size={14}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
 />
 </div>
 </div>

 {/* Risk bandı (engagement_risk_score) */}
 <div className="mb-3">
 <div className="flex items-center gap-2 mb-2.5">
 <BarChart2 size={14} className="text-slate-500" />
 <p className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
 Risk seviyesi
 </p>
 </div>
 <div className="space-y-1">
 {(RISK_BANDS || []).map((band) => {
 const isActive = filters.riskBand === band.value;
 return (
 <button
 key={band.value}
 onClick={() => set('riskBand', band.value)}
 className={clsx(
 'w-full flex items-center px-3 py-2 rounded-xl text-sm font-sans transition-colors text-left',
 isActive
 ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
 : 'text-slate-600 hover:bg-slate-50 border border-transparent',
 )}
 >
 {band.label}
 </button>
 );
 })}
 </div>
 </div>

 {/* Durum */}
 <div>
 <div className="flex items-center gap-2 mb-2.5">
 <Layers size={14} className="text-slate-500" />
 <p className="text-[11px] font-sans font-semibold text-slate-500 uppercase tracking-wider">
 Durum
 </p>
 </div>
 <div className="space-y-1">
 {(STATUSES || []).map((s) => {
 const count = s.value === 'all' ? totalCount : (statusCounts[s.value.toLowerCase()] ?? statusCounts[s.value] ?? 0);
 const isActive = filters.status === s.value;
 return (
 <button
 key={s.value}
 onClick={() => set('status', s.value)}
 className={clsx(
 'w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-sans transition-colors text-left',
 isActive
 ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-200'
 : 'text-slate-600 hover:bg-slate-50 border border-transparent',
 )}
 >
 <span>{s.label}</span>
 <span
 className={clsx(
 'text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.5rem] text-center',
 isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500',
 )}
 >
 {count}
 </span>
 </button>
 );
 })}
 </div>
 </div>
 </div>
 </aside>
 );
}
