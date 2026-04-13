/**
 * Kapasite Planlama — Haftalık Müfettiş Müsaitlik Takvimi
 * Her müfettiş için seçili yılda hafta bazında müsaitlik işaretleme.
 * Org chart ile aynı talent_profiles kaynağını ve branch yapısını kullanır.
 */

import { supabase } from '@/shared/api/supabase';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Inspector {
  id: string;
  full_name: string;
  department: string | null;
  current_level: number | null;
}

interface BranchConfig {
  name: string;
  colorIdx: number;
}

type WeekStatus = 'available' | 'off';
type YearAvailability = Record<string, WeekStatus[]>; // inspectorId → 52 statuses

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const MONTHS_FULL  = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

const LEVEL_TITLE: Record<number, string> = {
  5: 'Başmüfettiş',
  4: 'Kıdemli Müfettiş',
  3: 'Müfettiş',
  2: 'Ytkl. Müf. Yrd.',
  1: 'Müfettiş Yrd.',
};

const BRANCH_COLORS = [
  { dot: 'bg-cyan-500',    text: 'text-cyan-700',    border: 'border-cyan-200',    bg: 'bg-cyan-50'    },
  { dot: 'bg-indigo-500',  text: 'text-indigo-700',  border: 'border-indigo-200',  bg: 'bg-indigo-50'  },
  { dot: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', bg: 'bg-emerald-50' },
  { dot: 'bg-rose-500',    text: 'text-rose-700',    border: 'border-rose-200',    bg: 'bg-rose-50'    },
  { dot: 'bg-amber-500',   text: 'text-amber-700',   border: 'border-amber-200',   bg: 'bg-amber-50'   },
];

const DEFAULT_BRANCHES: BranchConfig[] = [
  { name: 'Bankacılık Denetimleri',      colorIdx: 0 },
  { name: 'Bilgi Sistemleri Denetimleri', colorIdx: 1 },
];

const STORAGE_KEY = (year: number) => `sentinel_capacity_${year}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadBranches(): BranchConfig[] {
  try {
    const stored = localStorage.getItem('sentinel_org_branches');
    if (!stored) return DEFAULT_BRANCHES;
    const parsed = JSON.parse(stored) as BranchConfig[];
    const hasDefaults = DEFAULT_BRANCHES.every(d => parsed.some(p => p.name === d.name));
    if (!hasDefaults) return DEFAULT_BRANCHES;
    return parsed;
  } catch {
    return DEFAULT_BRANCHES;
  }
}

function defaultWeeks(n: number): WeekStatus[] {
  return Array(n).fill('available') as WeekStatus[];
}

interface WeekInfo {
  startDate: Date;
  month: number; // 0-11
}

/** Build 52 week slots for a year, starting from Jan 1 going +7 days each. */
function buildWeeks(year: number): WeekInfo[] {
  const result: WeekInfo[] = [];
  let d = new Date(year, 0, 1);
  while (d.getFullYear() === year && result.length < 52) {
    result.push({ startDate: new Date(d), month: d.getMonth() });
    d.setDate(d.getDate() + 7);
  }
  return result;
}

interface MonthGroup {
  month: number;
  startIdx: number;
  count: number;
}

function buildMonthGroups(weeks: WeekInfo[]): MonthGroup[] {
  const groups: MonthGroup[] = [];
  let curMonth = -1;
  let curStart = 0;
  weeks.forEach((w, i) => {
    if (w.month !== curMonth) {
      if (curMonth !== -1) groups.push({ month: curMonth, startIdx: curStart, count: i - curStart });
      curMonth = w.month;
      curStart = i;
    }
  });
  if (curMonth !== -1) groups.push({ month: curMonth, startIdx: curStart, count: weeks.length - curStart });
  return groups;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CapacityPlanningView() {
  const thisYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(thisYear);
  const [availability, setAvailability] = useState<YearAvailability>({});
  const [flashSaved, setFlashSaved] = useState(false);

  // Load inspectors — same source as org chart
  const { data: inspectors = [], isLoading } = useQuery<Inspector[]>({
    queryKey: ['talent-profiles-capacity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('id, full_name, department, current_level')
        .order('current_level', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Inspector[];
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const branches = useMemo(() => loadBranches(), []);
  const weeks = useMemo(() => buildWeeks(selectedYear), [selectedYear]);
  const monthGroups = useMemo(() => buildMonthGroups(weeks), [weeks]);

  // Load availability from localStorage when year changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY(selectedYear));
      setAvailability(stored ? (JSON.parse(stored) as YearAvailability) : {});
    } catch {
      setAvailability({});
    }
  }, [selectedYear]);

  // Save to localStorage
  const save = (next: YearAvailability) => {
    localStorage.setItem(STORAGE_KEY(selectedYear), JSON.stringify(next));
    setFlashSaved(true);
    setTimeout(() => setFlashSaved(false), 1500);
  };

  // Get weeks array for an inspector (defaults to all available)
  const getWeeks = (id: string): WeekStatus[] => {
    const stored = availability[id];
    if (!stored || stored.length !== weeks.length) return defaultWeeks(weeks.length);
    return stored;
  };

  const toggleWeek = (id: string, wIdx: number) => {
    const current = getWeeks(id);
    const updated = [...current];
    updated[wIdx] = updated[wIdx] === 'available' ? 'off' : 'available';
    const next = { ...availability, [id]: updated };
    setAvailability(next);
    save(next);
  };

  const setAllForInspector = (id: string, status: WeekStatus) => {
    const updated = Array(weeks.length).fill(status) as WeekStatus[];
    const next = { ...availability, [id]: updated };
    setAvailability(next);
    save(next);
  };

  const toggleMonthForInspector = (id: string, monthIdx: number) => {
    const current = getWeeks(id);
    const weekIdxs = weeks.map((w, i) => ({ w, i })).filter(x => x.w.month === monthIdx).map(x => x.i);
    const allAvailable = weekIdxs.every(i => current[i] === 'available');
    const updated = [...current];
    weekIdxs.forEach(i => { updated[i] = allAvailable ? 'off' : 'available'; });
    const next = { ...availability, [id]: updated };
    setAvailability(next);
    save(next);
  };

  const resetYear = () => {
    const next: YearAvailability = {};
    setAvailability(next);
    localStorage.removeItem(STORAGE_KEY(selectedYear));
    setFlashSaved(true);
    setTimeout(() => setFlashSaved(false), 1500);
  };

  // Stats
  const availableWeeksFor = (id: string) => getWeeks(id).filter(s => s === 'available').length;
  const totalInspectors = inspectors.length;
  const totalAvailableWeeks = inspectors.reduce((s, p) => s + availableWeeksFor(p.id), 0);
  const avgAvailableWeeks = totalInspectors > 0 ? Math.round(totalAvailableWeeks / totalInspectors) : 0;

  // Group inspectors by branch
  const branchGroups = useMemo(() => {
    const norm = (s: string) => s.trim().toLowerCase();
    return branches.map(b => ({
      branch: b,
      members: inspectors.filter(p => norm(p.department ?? '') === norm(b.name)),
    }));
  }, [branches, inspectors]);

  const unassigned = inspectors.filter(p => !branches.some(b =>
    (p.department ?? '').trim().toLowerCase() === b.name.trim().toLowerCase()
  ));

  const CELL_W = 18; // px per week cell

  return (
    <div className="p-5 space-y-5">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-500" />
            Haftalık Kapasite Takvimi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Her müfettiş için müsait haftaları işaretleyin — bimodal plan bu verileri kullanır
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Year selector */}
          <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setSelectedYear(y => y - 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <ChevronDown size={14} />
            </button>
            <span className="w-14 text-center text-sm font-black text-slate-800">{selectedYear}</span>
            <button
              onClick={() => setSelectedYear(y => y + 1)}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <ChevronUp size={14} />
            </button>
          </div>
          {/* Reset */}
          <button
            onClick={resetYear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <RotateCcw size={12} /> Sıfırla
          </button>
          {/* Save flash */}
          <div className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all',
            flashSaved ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-400 border border-slate-200'
          )}>
            <Check size={12} /> {flashSaved ? 'Kaydedildi' : 'Otomatik kaydediliyor'}
          </div>
        </div>
      </div>

      {/* ── Summary cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Müfettiş', value: totalInspectors, sub: 'kayıtlı', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Ort. Müsait Hafta', value: avgAvailableWeeks, sub: `/ ${weeks.length} hf`, icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Toplam Kapasite', value: totalAvailableWeeks, sub: 'müfettiş-hafta', icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-50' },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
            <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', bg)}>
              <Icon size={16} className={color} />
            </div>
            <div>
              <div className="text-[10px] text-slate-500">{label}</div>
              <div className={clsx('text-xl font-black', color)}>{value} <span className="text-xs font-normal text-slate-400">{sub}</span></div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 text-[11px] text-slate-500">
        <span className="font-semibold text-slate-700">Gösterge:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm bg-emerald-400 inline-block" /> Müsait
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-sm bg-slate-200 inline-block" /> Müsait Değil
        </span>
        <span className="text-slate-400 ml-2">Hücreye tıklayarak değiştirin · Ay başlığına tıklayarak tüm ayı değiştirin</span>
      </div>

      {/* ── Per-branch inspector grids ──────────────────────────────────── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mr-3" />
          <span className="text-sm">Yükleniyor...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {branchGroups.map(({ branch, members }) => {
            const colors = BRANCH_COLORS[branch.colorIdx % BRANCH_COLORS.length];
            if (members.length === 0) return null;
            return (
              <BranchGrid
                key={branch.name}
                branchName={branch.name}
                colors={colors}
                members={members}
                weeks={weeks}
                monthGroups={monthGroups}
                availability={availability}
                getWeeks={getWeeks}
                availableWeeksFor={availableWeeksFor}
                toggleWeek={toggleWeek}
                setAllForInspector={setAllForInspector}
                toggleMonthForInspector={toggleMonthForInspector}
                cellW={CELL_W}
              />
            );
          })}

          {unassigned.length > 0 && (
            <BranchGrid
              branchName="Atanmamış"
              colors={BRANCH_COLORS[4]}
              members={unassigned}
              weeks={weeks}
              monthGroups={monthGroups}
              availability={availability}
              getWeeks={getWeeks}
              availableWeeksFor={availableWeeksFor}
              toggleWeek={toggleWeek}
              setAllForInspector={setAllForInspector}
              toggleMonthForInspector={toggleMonthForInspector}
              cellW={CELL_W}
            />
          )}

          {branchGroups.every(g => g.members.length === 0) && unassigned.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <Users size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Müfettiş bulunamadı</p>
              <p className="text-xs mt-1">Kaynak Havuzu'ndan müfettiş ekleyin</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── BranchGrid sub-component ─────────────────────────────────────────────────

interface BranchGridProps {
  branchName: string;
  colors: typeof BRANCH_COLORS[0];
  members: Inspector[];
  weeks: WeekInfo[];
  monthGroups: MonthGroup[];
  availability: YearAvailability;
  getWeeks: (id: string) => WeekStatus[];
  availableWeeksFor: (id: string) => number;
  toggleWeek: (id: string, wIdx: number) => void;
  setAllForInspector: (id: string, s: WeekStatus) => void;
  toggleMonthForInspector: (id: string, monthIdx: number) => void;
  cellW: number;
}

function BranchGrid({
  branchName,
  colors,
  members,
  weeks,
  monthGroups,
  getWeeks,
  availableWeeksFor,
  toggleWeek,
  setAllForInspector,
  toggleMonthForInspector,
  cellW,
}: BranchGridProps) {
  const NAME_COL = 176; // px
  const STATS_COL = 96; // px

  return (
    <div className={clsx('border rounded-2xl overflow-hidden', colors.border)}>
      {/* Branch header */}
      <div className={clsx('px-4 py-2.5 flex items-center gap-2', colors.bg)}>
        <span className={clsx('w-2.5 h-2.5 rounded-full shrink-0', colors.dot)} />
        <span className={clsx('text-xs font-bold', colors.text)}>{branchName}</span>
        <span className={clsx('text-[10px] ml-1', colors.text, 'opacity-60')}>{members.length} müfettiş</span>
      </div>

      {/* Grid wrapper — horizontal scroll */}
      <div className="overflow-x-auto bg-white">
        <div style={{ minWidth: NAME_COL + cellW * weeks.length + STATS_COL + 16 }}>

          {/* Month header row */}
          <div className="flex border-b border-slate-100" style={{ paddingLeft: NAME_COL }}>
            {monthGroups.map(g => (
              <div
                key={g.month}
                className="text-center border-r border-slate-100 last:border-r-0"
                style={{ width: g.count * cellW }}
              >
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                  {MONTHS_SHORT[g.month]}
                </span>
              </div>
            ))}
            <div style={{ width: STATS_COL }} />
          </div>

          {/* Inspector rows */}
          {members.map((p, pi) => {
            const ws = getWeeks(p.id);
            const avail = availableWeeksFor(p.id);
            const pct = Math.round((avail / weeks.length) * 100);
            const title = LEVEL_TITLE[p.current_level ?? 0] ?? '';

            return (
              <div
                key={p.id}
                className={clsx(
                  'flex items-center border-b border-slate-50 last:border-b-0',
                  pi % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                )}
              >
                {/* Name column */}
                <div
                  className="shrink-0 flex items-center justify-between pr-2 pl-3 py-2 gap-2"
                  style={{ width: NAME_COL }}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate leading-tight">
                      {p.full_name}
                    </div>
                    {title && (
                      <div className="text-[9px] text-slate-400 truncate">{title}</div>
                    )}
                  </div>
                  {/* All/None quick buttons */}
                  <div className="flex gap-0.5 shrink-0">
                    <button
                      onClick={() => setAllForInspector(p.id, 'available')}
                      title="Tümünü müsait yap"
                      className="w-5 h-5 flex items-center justify-center rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors text-[9px] font-black"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setAllForInspector(p.id, 'off')}
                      title="Tümünü kapat"
                      className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors text-[9px] font-black"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Week cells */}
                <div className="flex items-center" style={{ gap: 1 }}>
                  {ws.map((status, wIdx) => {
                    const isMonthBoundary = wIdx > 0 && weeks[wIdx].month !== weeks[wIdx - 1].month;
                    return (
                      <button
                        key={wIdx}
                        title={`H${wIdx + 1} — ${weeks[wIdx].startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}`}
                        onClick={() => toggleWeek(p.id, wIdx)}
                        style={{ width: cellW - 1, height: 22 }}
                        className={clsx(
                          'rounded-sm transition-colors flex-shrink-0',
                          status === 'available'
                            ? 'bg-emerald-400 hover:bg-emerald-500'
                            : 'bg-slate-200 hover:bg-slate-300',
                          isMonthBoundary && 'ml-0.5'
                        )}
                      />
                    );
                  })}
                </div>

                {/* Stats column */}
                <div
                  className="shrink-0 flex flex-col items-center justify-center px-3 py-2"
                  style={{ width: STATS_COL }}
                >
                  <div className={clsx(
                    'text-sm font-black tabular-nums',
                    pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-500'
                  )}>
                    {avail}<span className="text-[10px] font-normal text-slate-400"> hf</span>
                  </div>
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <div
                      className={clsx(
                        'h-full rounded-full',
                        pct >= 80 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Month toggle footer row */}
          <div className={clsx('flex border-t border-slate-100', colors.bg, 'bg-opacity-40')}>
            <div style={{ width: NAME_COL }} className="shrink-0 px-3 py-1.5">
              <span className="text-[9px] text-slate-400 font-semibold">Aya göre toplu değiştir →</span>
            </div>
            {monthGroups.map(g => (
              <div
                key={g.month}
                className="border-r border-slate-100 last:border-r-0 flex items-center justify-center py-1"
                style={{ width: g.count * cellW, gap: 1 }}
              >
                {/* One button per inspector, grouped under month */}
                <span className="text-[8px] text-slate-400 font-semibold">{MONTHS_SHORT[g.month]}</span>
              </div>
            ))}
            <div style={{ width: STATS_COL }} />
          </div>

        </div>
      </div>

      {/* Per-branch month toggle row — compact */}
      <div className={clsx('px-4 py-2 border-t', colors.border, colors.bg, 'flex items-center gap-2 flex-wrap')}>
        <span className={clsx('text-[9px] font-bold uppercase tracking-wide', colors.text, 'opacity-70 mr-1')}>
          Tüm Branş:
        </span>
        {monthGroups.map(g => (
          <button
            key={g.month}
            onClick={() => members.forEach(p => toggleMonthForInspector(p.id, g.month))}
            className={clsx(
              'px-2 py-0.5 rounded text-[9px] font-bold border transition-colors',
              colors.border, colors.text, 'bg-white/60 hover:bg-white'
            )}
          >
            {MONTHS_FULL[g.month]}
          </button>
        ))}
      </div>
    </div>
  );
}
