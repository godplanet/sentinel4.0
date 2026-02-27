import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  CalendarDays,
  GitCommitHorizontal,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users,
} from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { AnnualPlanner } from '@/widgets/AnnualPlanner';

type ViewTab = 'gantt' | 'timeline' | 'calendar' | 'summary';

interface EngagementRow {
  id: string;
  title: string;
  audit_type: 'COMPREHENSIVE' | 'TARGETED' | 'FOLLOW_UP';
  start_date: string;
  end_date: string;
  status: string;
  estimated_hours: number;
  actual_hours: number;
  risk_snapshot_score: number;
  entity_id: string;
  audit_entities?: { entity_name: string } | null;
}

const MONTHS_TR = [
  'Ocak','Şubat','Mart','Nisan','Mayıs','Haziran',
  'Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık',
];

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  PLANNED:    { label: 'Planlandı',    className: 'bg-blue-50 text-blue-700 border-blue-200',    icon: Clock },
  IN_PROGRESS:{ label: 'Devam Ediyor', className: 'bg-amber-50 text-amber-700 border-amber-200',  icon: TrendingUp },
  COMPLETED:  { label: 'Tamamlandı',   className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  FINALIZED:  { label: 'Raporlandı',   className: 'bg-teal-50 text-teal-700 border-teal-200',   icon: CheckCircle2 },
  CLOSED:     { label: 'Kapalı',       className: 'bg-slate-100 text-slate-500 border-slate-200', icon: XCircle },
  CANCELLED:  { label: 'İptal',        className: 'bg-red-50 text-red-600 border-red-200',       icon: AlertCircle },
};

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  COMPREHENSIVE: { label: 'Kapsamlı',    color: 'text-blue-700',   bg: 'bg-blue-500' },
  TARGETED:      { label: 'Hedefli',     color: 'text-orange-700', bg: 'bg-orange-500' },
  FOLLOW_UP:     { label: 'Takip',       color: 'text-teal-700',   bg: 'bg-teal-500' },
};

function getBarColor(status: string) {
  switch (status) {
    case 'IN_PROGRESS': return 'bg-amber-500';
    case 'COMPLETED':
    case 'FINALIZED':   return 'bg-emerald-500';
    case 'CANCELLED':   return 'bg-slate-400';
    default:            return 'bg-blue-500';
  }
}

function engagementSpansMonth(eng: EngagementRow, year: number, monthIndex: number): boolean {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd   = new Date(year, monthIndex + 1, 0, 23, 59, 59);
  const start = new Date(eng.start_date);
  const end   = new Date(eng.end_date);
  return start <= monthEnd && end >= monthStart;
}

function dateRangeLabel(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (d: Date) =>
    d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  return `${fmt(s)} – ${fmt(e)}`;
}

// ────────────────────────────────────────────────────────────────────────────────
// Light-mode Timeline (grouped by entity)
// ────────────────────────────────────────────────────────────────────────────────
function LightTimeline({ engagements, year }: { engagements: EngagementRow[]; year: number }) {
  const navigate = useNavigate();
  const yearStart = new Date(year, 0, 1);
  const yearEnd   = new Date(year, 11, 31, 23, 59, 59);
  const totalMs   = yearEnd.getTime() - yearStart.getTime();

  const grouped = new Map<string, { entityName: string; items: EngagementRow[] }>();
  for (const eng of engagements) {
    const key  = eng.entity_id || 'unknown';
    const name = eng.audit_entities?.entity_name ?? 'Bilinmeyen Birim';
    if (!grouped.has(key)) grouped.set(key, { entityName: name, items: [] });
    grouped.get(key)!.items.push(eng);
  }
  const rows = Array.from(grouped.values());

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <GitCommitHorizontal size={36} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-400">{year} yılı için planlı denetim yok</p>
      </div>
    );
  }

  const pct = (date: Date) =>
    Math.min(100, Math.max(0,
      ((date.getTime() - yearStart.getTime()) / totalMs) * 100
    ));

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[220px_1fr] text-xs font-bold text-slate-500 uppercase tracking-wide border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="px-4 py-2.5 border-r border-slate-200">Denetim Birimi</div>
          <div className="grid grid-cols-12">
            {MONTHS_TR.map((m, i) => (
              <div key={m} className={`px-1 py-2.5 text-center ${i < 11 ? 'border-r border-slate-100' : ''}`}>
                {m.slice(0, 3)}
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {rows.map(({ entityName, items }) => (
            <div key={entityName} className="grid grid-cols-[220px_1fr] group hover:bg-slate-50/60 transition-colors">
              <div className="border-r border-slate-100 px-4 py-4 flex flex-col justify-center">
                <p className="text-sm font-semibold text-slate-700 truncate">{entityName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{items.length} denetim</p>
              </div>
              <div className="relative h-16">
                <div className="absolute inset-0 grid grid-cols-12 pointer-events-none">
                  {MONTHS_TR.map((_, i) => (
                    <div key={i} className={`h-full ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'} ${i < 11 ? 'border-r border-slate-100' : ''}`} />
                  ))}
                </div>

                {items.map((eng) => {
                  const start = new Date(eng.start_date);
                  const end   = new Date(eng.end_date);
                  const left  = pct(start);
                  const width = Math.max(0.5, pct(end) - left);

                  return (
                    <button
                      key={eng.id}
                      title={`${eng.title}\n${dateRangeLabel(eng.start_date, eng.end_date)}`}
                      onClick={() => navigate(`/execution/my-engagements/${eng.id}`)}
                      className={`
                        absolute top-1/2 -translate-y-1/2 h-7 rounded-full
                        ${getBarColor(eng.status)} text-white text-xs font-medium
                        flex items-center px-2 overflow-hidden whitespace-nowrap
                        shadow-sm hover:shadow-md transition-all duration-150 hover:-translate-y-[calc(50%+2px)]
                        z-10 cursor-pointer
                      `}
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      <span className="truncate drop-shadow-sm">{eng.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between px-2 text-xs text-slate-500">
          <div className="flex items-center gap-5">
            {[
              { status: 'PLANNED', label: 'Planlandı', cls: 'bg-blue-500' },
              { status: 'IN_PROGRESS', label: 'Devam Ediyor', cls: 'bg-amber-500' },
              { status: 'COMPLETED', label: 'Tamamlandı', cls: 'bg-emerald-500' },
              { status: 'CANCELLED', label: 'İptal', cls: 'bg-slate-400' },
            ].map(({ label, cls }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded-full ${cls}`} />
                {label}
              </div>
            ))}
          </div>
          <span>{engagements.length} denetim · {rows.length} birim</span>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Calendar View (12-month grid)
// ────────────────────────────────────────────────────────────────────────────────
function CalendarView({ engagements, year }: { engagements: EngagementRow[]; year: number }) {
  const navigate = useNavigate();

  if (engagements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <CalendarDays size={36} className="text-slate-300" />
        <p className="text-sm font-medium text-slate-400">{year} yılı için planlı denetim yok</p>
      </div>
    );
  }

  const months = MONTHS_TR.map((name, idx) => ({
    name,
    idx,
    items: engagements.filter((e) => engagementSpansMonth(e, year, idx)),
  }));

  return (
    <div className="grid grid-cols-3 gap-4">
      {months.map(({ name, idx, items }) => {
        const isCurrentMonth =
          new Date().getFullYear() === year && new Date().getMonth() === idx;

        return (
          <div
            key={name}
            className={`rounded-xl border overflow-hidden ${isCurrentMonth ? 'border-indigo-200 ring-2 ring-indigo-100' : 'border-slate-200'}`}
          >
            <div className={`px-4 py-2.5 flex items-center justify-between ${isCurrentMonth ? 'bg-indigo-50 border-b border-indigo-100' : 'bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200'}`}>
              <span className={`text-sm font-bold ${isCurrentMonth ? 'text-indigo-800' : 'text-slate-700'}`}>
                {name}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isCurrentMonth ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-500 border border-slate-200'
              }`}>
                {items.length}
              </span>
            </div>

            <div className="p-2 bg-white min-h-[100px] flex flex-col gap-1">
              {items.length === 0 ? (
                <p className="text-xs text-slate-300 text-center py-4">Denetim yok</p>
              ) : (
                items.map((eng) => (
                  <button
                    key={eng.id}
                    onClick={() => navigate(`/execution/my-engagements/${eng.id}`)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors hover:opacity-80 ${getBarColor(eng.status)} text-white`}
                  >
                    <span className="truncate">{eng.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Summary / KPI View
// ────────────────────────────────────────────────────────────────────────────────
function SummaryView({ engagements, year }: { engagements: EngagementRow[]; year: number }) {
  const total       = engagements.length;
  const planned     = engagements.filter((e) => e.status === 'PLANNED').length;
  const inProgress  = engagements.filter((e) => e.status === 'IN_PROGRESS').length;
  const completed   = engagements.filter((e) => ['COMPLETED', 'FINALIZED', 'CLOSED'].includes(e.status)).length;
  const cancelled   = engagements.filter((e) => e.status === 'CANCELLED').length;

  const totalEst    = engagements.reduce((s, e) => s + (e.estimated_hours || 0), 0);
  const totalActual = engagements.reduce((s, e) => s + (e.actual_hours || 0), 0);

  const comprehensive = engagements.filter((e) => e.audit_type === 'COMPREHENSIVE').length;
  const targeted      = engagements.filter((e) => e.audit_type === 'TARGETED').length;
  const followUp      = engagements.filter((e) => e.audit_type === 'FOLLOW_UP').length;

  const avgRisk = total > 0
    ? (engagements.reduce((s, e) => s + (e.risk_snapshot_score || 0), 0) / total).toFixed(1)
    : '0';

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const statusRows = [
    { label: 'Planlandı',    count: planned,    cls: 'bg-blue-500',    bar: 'bg-blue-100',    text: 'text-blue-700' },
    { label: 'Devam Ediyor', count: inProgress, cls: 'bg-amber-500',   bar: 'bg-amber-100',   text: 'text-amber-700' },
    { label: 'Tamamlandı',   count: completed,  cls: 'bg-emerald-500', bar: 'bg-emerald-100', text: 'text-emerald-700' },
    { label: 'İptal',        count: cancelled,  cls: 'bg-slate-400',   bar: 'bg-slate-100',   text: 'text-slate-600' },
  ];

  const typeRows = [
    { ...TYPE_CONFIG.COMPREHENSIVE, count: comprehensive },
    { ...TYPE_CONFIG.TARGETED,      count: targeted },
    { ...TYPE_CONFIG.FOLLOW_UP,     count: followUp },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Toplam Denetim', value: total, sub: `${year} yılı`, icon: Users, iconClass: 'bg-indigo-100', iconColor: 'text-indigo-600' },
          { label: 'Tamamlanma Oranı', value: `${completionRate}%`, sub: `${completed} / ${total}`, icon: CheckCircle2, iconClass: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { label: 'Tahmini Saat', value: `${totalEst.toLocaleString('tr-TR')}s`, sub: `Fiili: ${totalActual.toLocaleString('tr-TR')}s`, icon: Clock, iconClass: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: 'Ort. Risk Skoru', value: avgRisk, sub: 'Tüm denetimler', icon: BarChart2, iconClass: 'bg-amber-100', iconColor: 'text-amber-600' },
        ].map(({ label, value, sub, icon: Icon, iconClass, iconColor }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl ${iconClass} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={iconColor} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700">Statüye Göre Dağılım</h3>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {statusRows.map(({ label, count, cls, bar, text }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${cls}`} />
                <span className="text-sm text-slate-600 w-28">{label}</span>
                <div className={`flex-1 h-5 ${bar} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${cls} rounded-full transition-all duration-500`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className={`text-sm font-bold w-8 text-right ${text}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-700">Denetim Türüne Göre</h3>
          </div>
          <div className="p-5 flex flex-col gap-3">
            {typeRows.map(({ label, bg, count }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${bg}`} />
                <span className="text-sm text-slate-600 w-28">{label}</span>
                <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${bg} rounded-full transition-all duration-500`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="text-sm font-bold w-8 text-right text-slate-700">{count}</span>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 bg-slate-50/60 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Toplam Tahmini Bütçe</span>
              <span className="font-bold text-slate-700">{totalEst.toLocaleString('tr-TR')} adam-saat</span>
            </div>
            <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                style={{ width: totalEst > 0 ? `${Math.min(100, (totalActual / totalEst) * 100)}%` : '0%' }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Fiili: {totalActual.toLocaleString('tr-TR')} saat ·{' '}
              {totalEst > 0 ? `${Math.round((totalActual / totalEst) * 100)}%` : '0%'} kullanım
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">Aylık Denetim Dağılımı</h3>
          <span className="text-xs text-slate-400">{year}</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-12 gap-1 items-end h-24">
            {MONTHS_TR.map((m, idx) => {
              const count = engagements.filter((e) => engagementSpansMonth(e, year, idx)).length;
              const maxCount = Math.max(...MONTHS_TR.map((_, i) => engagements.filter((e) => engagementSpansMonth(e, year, i)).length), 1);
              const heightPct = Math.max(4, (count / maxCount) * 100);
              const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() === idx;

              return (
                <div key={m} className="flex flex-col items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-600">{count > 0 ? count : ''}</span>
                  <div
                    className={`w-full rounded-t-sm transition-all ${isCurrentMonth ? 'bg-indigo-500' : 'bg-blue-400'}`}
                    style={{ height: `${heightPct}%` }}
                    title={`${m}: ${count} denetim`}
                  />
                  <span className="text-xs text-slate-400 text-center">{m.slice(0, 3)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// Main AnnualPlanView
// ────────────────────────────────────────────────────────────────────────────────
export function AnnualPlanView() {
  const [viewTab, setViewTab] = useState<ViewTab>('gantt');
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: engagements = [], isLoading } = useQuery({
    queryKey: ['audit-engagements-annual-view', year],
    queryFn: async () => {
      const { data } = await supabase
        .from('audit_engagements')
        .select('*, audit_entities!inner(entity_name)')
        .lte('start_date', `${year}-12-31`)
        .gte('end_date', `${year}-01-01`)
        .order('start_date');
      return (data || []) as EngagementRow[];
    },
  });

  const viewTabs: { id: ViewTab; label: string; icon: typeof BarChart2 }[] = [
    { id: 'gantt',    label: 'Gantt Chart',    icon: GitCommitHorizontal },
    { id: 'timeline', label: 'Zaman Çizelgesi', icon: LayoutGrid },
    { id: 'calendar', label: 'Takvim',          icon: CalendarDays },
    { id: 'summary',  label: 'Özet & KPI',      icon: BarChart2 },
  ];

  return (
    <div className="flex flex-col gap-0">
      <div className="px-6 py-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-slate-200 shadow-sm">
          {viewTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                viewTab === id
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear((y) => y - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-sm font-bold text-indigo-900 min-w-[44px] text-center">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="p-6">
        {isLoading && viewTab !== 'gantt' ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="ml-3 text-sm text-slate-500">Yükleniyor...</span>
          </div>
        ) : (
          <>
            {viewTab === 'gantt'    && <AnnualPlanner />}
            {viewTab === 'timeline' && <LightTimeline engagements={engagements} year={year} />}
            {viewTab === 'calendar' && <CalendarView engagements={engagements} year={year} />}
            {viewTab === 'summary'  && <SummaryView  engagements={engagements} year={year} />}
          </>
        )}
      </div>
    </div>
  );
}
