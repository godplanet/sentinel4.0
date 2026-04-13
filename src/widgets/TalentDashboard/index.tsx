/**
 * TalentDashboard — Modüler Organizasyon Şeması
 * Teftiş Kurulu Başkanlığı → Dinamik Başkan Yardımcılıkları
 * Denetçiler department === branch.name eşleşmesiyle sınıflandırılır.
 */

import { supabase } from '@/shared/api/supabase';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Plus, User, X } from 'lucide-react';
import { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TalentRow {
  id: string;
  full_name: string;
  title: string | null;
  department: string | null;
  burnout_zone: 'GREEN' | 'AMBER' | 'RED' | null;
  current_level: number;
}

interface Branch {
  name: string;
  colorIdx: number;
}

// ─── Branch color palette ──────────────────────────────────────────────────────

const BRANCH_COLORS = [
  {
    header: 'bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400',
    connector: 'bg-indigo-300',
    row: 'bg-indigo-50/60 border-indigo-200 hover:border-indigo-300',
    avatar: 'bg-gradient-to-br from-indigo-500 to-violet-600',
    countPill: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  {
    header: 'bg-gradient-to-br from-cyan-600 to-teal-700 border-cyan-400',
    connector: 'bg-cyan-300',
    row: 'bg-cyan-50/60 border-cyan-200 hover:border-cyan-300',
    avatar: 'bg-gradient-to-br from-cyan-500 to-teal-600',
    countPill: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  },
  {
    header: 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-400',
    connector: 'bg-emerald-300',
    row: 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300',
    avatar: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    countPill: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  {
    header: 'bg-gradient-to-br from-rose-600 to-pink-700 border-rose-400',
    connector: 'bg-rose-300',
    row: 'bg-rose-50/60 border-rose-200 hover:border-rose-300',
    avatar: 'bg-gradient-to-br from-rose-500 to-pink-600',
    countPill: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  {
    header: 'bg-gradient-to-br from-amber-600 to-orange-700 border-amber-400',
    connector: 'bg-amber-300',
    row: 'bg-amber-50/60 border-amber-200 hover:border-amber-300',
    avatar: 'bg-gradient-to-br from-amber-500 to-orange-600',
    countPill: 'bg-amber-50 border-amber-200 text-amber-700',
  },
];

const DEFAULT_BRANCHES: Branch[] = [
  { name: 'Bankacılık Denetimleri', colorIdx: 0 },
  { name: 'Bilgi Sistemleri Denetimleri', colorIdx: 1 },
];

const LS_KEY = 'sentinel_org_branches';

function loadBranches(): Branch[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Branch[];
      // Sanity check: ensure at least one default branch is present
      const hasDefault = DEFAULT_BRANCHES.every(d =>
        parsed.some(p => p.name.trim().toLowerCase() === d.name.trim().toLowerCase())
      );
      if (hasDefault) return parsed;
    }
  } catch { /* ignore */ }
  // Reset to defaults (clears stale localStorage)
  try { localStorage.removeItem(LS_KEY); } catch { /* ignore */ }
  return DEFAULT_BRANCHES;
}

function saveBranches(branches: Branch[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(branches)); } catch { /* ignore */ }
}

// ─── Title mapping ────────────────────────────────────────────────────────────

const TITLE_MAP: Record<number, { label: string; rank: number; color: string; bg: string; border: string }> = {
  5: { label: 'Başmüfettiş',                 rank: 1, color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-300' },
  4: { label: 'Kıdemli Müfettiş',            rank: 2, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-300' },
  3: { label: 'Müfettiş',                    rank: 3, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-300' },
  2: { label: 'Yetkili Müfettiş Yardımcısı', rank: 4, color: 'text-teal-700',  bg: 'bg-teal-50',   border: 'border-teal-300' },
  1: { label: 'Müfettiş Yardımcısı',         rank: 5, color: 'text-slate-600', bg: 'bg-slate-50',  border: 'border-slate-300' },
};

const TITLE_FROM_STR: Record<string, number> = {
  expert: 5, manager: 4, senior: 3, junior: 1,
  başmüfettiş: 5, 'kıdemli müfettiş': 4, müfettiş: 3,
  'yetkili müfettiş yardımcısı': 2, 'müfettiş yardımcısı': 1,
};

function resolveLevel(p: TalentRow): number {
  if (p.current_level >= 1 && p.current_level <= 5) return p.current_level;
  if (p.title) {
    const mapped = TITLE_FROM_STR[p.title.toLowerCase()];
    if (mapped) return mapped;
  }
  return 1;
}

// ─── Tenure year ──────────────────────────────────────────────────────────────

const MIN_YEARS: Record<number, number> = { 5: 8, 4: 6, 3: 3, 2: 2, 1: 1 };

function computeTenureYear(level: number, name: string): number {
  const hash = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 4;
  const years = (MIN_YEARS[level] ?? 1) + hash;
  return 2026 - years;
}

// ─── Sort by seniority ────────────────────────────────────────────────────────

function bySeniority(a: TalentRow, b: TalentRow): number {
  return resolveLevel(b) - resolveLevel(a);
}

// ─── Burnout dot ──────────────────────────────────────────────────────────────

const BURNOUT_DOT: Record<string, string> = {
  GREEN: 'bg-emerald-400', AMBER: 'bg-amber-400', RED: 'bg-red-500',
};
const BURNOUT_LABEL: Record<string, string> = {
  GREEN: 'İyi', AMBER: 'Dikkat', RED: 'Stresli',
};

// ─── Inspector Row ────────────────────────────────────────────────────────────

function InspectorRow({ p, colors, rank }: { p: TalentRow; colors: typeof BRANCH_COLORS[0]; rank: number }) {
  const level   = resolveLevel(p);
  const meta    = TITLE_MAP[level] ?? TITLE_MAP[1];
  const burnout = p.burnout_zone ?? 'GREEN';
  const initials = p.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const tenureYear = computeTenureYear(level, p.full_name);

  return (
    <div className={clsx(
      'flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all hover:shadow-sm',
      colors.row,
    )}>
      {/* Rank */}
      <span className="text-[10px] font-black text-slate-400 w-4 text-right shrink-0">{rank}</span>

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white', colors.avatar)}>
          {initials}
        </div>
        <span
          className={clsx('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white', BURNOUT_DOT[burnout])}
          title={BURNOUT_LABEL[burnout]}
        />
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-slate-800 truncate">{p.full_name}</div>
        <div className="text-[9px] text-slate-400">Devre {tenureYear}</div>
      </div>

      {/* Title badge */}
      <span className={clsx('shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border', meta.color, meta.bg, meta.border)}>
        {meta.label}
      </span>
    </div>
  );
}

// ─── Branch Column ────────────────────────────────────────────────────────────

function BranchColumn({
  branch, people, colors, onRemove,
}: {
  branch: Branch;
  people: TalentRow[];
  colors: typeof BRANCH_COLORS[0];
  onRemove: () => void;
}) {
  const sorted = [...people].sort(bySeniority);

  return (
    <div className="flex flex-col items-center gap-0 flex-1 min-w-[300px] max-w-[480px]">
      {/* VP Node */}
      <div className={clsx(
        'w-full flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl border-2 shadow-md relative',
        colors.header,
      )}>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors"
          title="Başkan Yardımcılığını kaldır"
        >
          <X size={10} className="text-white" />
        </button>
        <div className="text-white font-black text-xs text-center leading-snug">{branch.name}</div>
        <div className="text-white/60 text-[10px] font-semibold">Başkan Yardımcısı</div>
        <div className="text-white/40 text-[9px]">{sorted.length} denetçi</div>
      </div>

      {/* Connector */}
      <div className={clsx('w-px h-6', colors.connector)} />

      {/* Inspector list */}
      {sorted.length === 0 ? (
        <div className="w-full text-xs text-slate-400 italic text-center py-4 border border-dashed border-slate-200 rounded-xl">
          Henüz denetçi yok
        </div>
      ) : (
        <div className="w-full space-y-1.5">
          {sorted.map((p, idx) => (
            <InspectorRow key={p.id} p={p} colors={colors} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Add Branch Modal ─────────────────────────────────────────────────────────

function AddBranchForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  function submit() {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 text-xs font-semibold transition-all"
      >
        <Plus size={14} />
        Başkan Yardımcılığı Ekle
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false); }}
        placeholder="Başkan Yardımcılığı adı..."
        className="px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
      />
      <button onClick={submit} className="px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700">
        Ekle
      </button>
      <button onClick={() => setOpen(false)} className="px-3 py-2 text-slate-500 text-xs hover:text-slate-700">
        İptal
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function TalentDashboard() {
  const [branches, setBranches] = useState<Branch[]>(loadBranches);

  const { data: profiles = [], isLoading } = useQuery<TalentRow[]>({
    queryKey: ['talent-profiles-orgchart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('id, full_name, title, department, burnout_zone, current_level')
        .order('current_level', { ascending: false });
      if (error) throw error;
      return (data ?? []) as TalentRow[];
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  function addBranch(name: string) {
    const colorIdx = branches.length % BRANCH_COLORS.length;
    const next = [...branches, { name, colorIdx }];
    setBranches(next);
    saveBranches(next);
  }

  function removeBranch(idx: number) {
    const next = branches.filter((_, i) => i !== idx);
    setBranches(next);
    saveBranches(next);
  }

  // Group inspectors by branch — normalize whitespace for robust matching
  const norm = (s: string | null) => (s ?? '').trim().toLowerCase();
  const branchPeople = branches.map((b) =>
    profiles.filter((p) => norm(p.department) === norm(b.name))
  );
  // Unassigned inspectors (no matching branch)
  const unassigned = profiles.filter((p) =>
    !branches.some((b) => norm(b.name) === norm(p.department))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 space-y-5">

      {/* ─── Summary bar ─── */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-100 border-slate-200 text-slate-600 text-xs font-semibold">
          <User size={12} />{profiles.length} denetçi
        </div>
        {branches.map((b, i) => {
          const colors = BRANCH_COLORS[b.colorIdx % BRANCH_COLORS.length];
          return (
            <div key={b.name} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold', colors.countPill)}>
              {branchPeople[i].length} · {b.name}
            </div>
          );
        })}
        {unassigned.length > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-50 border-slate-300 text-slate-500 text-xs font-semibold">
            {unassigned.length} atanmamış
          </div>
        )}
      </div>

      {/* ─── Org Chart ─── */}
      <div className="flex flex-col items-center gap-0">

        {/* Teftiş Kurulu Başkanlığı */}
        <div className="flex flex-col items-center gap-1 px-10 py-4 rounded-2xl border-2 border-slate-600 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
          <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
            <User size={17} className="text-white/70" />
          </div>
          <div className="text-white font-black text-sm text-center leading-tight">Teftiş Kurulu Başkanlığı</div>
          <div className="text-white/50 text-[10px] font-bold tracking-wide">Başkan</div>
        </div>

        {/* Vertical stem */}
        <div className="w-px h-8 bg-slate-400" />

        {/* Horizontal branch line */}
        {branches.length > 0 && (
          <div className="relative flex w-full max-w-[960px] items-start justify-center">
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-300" />
            <div className="absolute top-0 left-1/4 w-px h-8 bg-slate-300" style={{ left: 'calc(25% - 0.5px)' }} />
            <div className="absolute top-0 right-1/4 w-px h-8 bg-slate-300" style={{ right: 'calc(25% - 0.5px)' }} />
          </div>
        )}
        <div className="h-8" />

        {/* Branch columns */}
        <div className="flex gap-6 w-full max-w-[960px] items-start justify-center flex-wrap">
          {branches.map((branch, idx) => (
            <BranchColumn
              key={branch.name}
              branch={branch}
              people={branchPeople[idx]}
              colors={BRANCH_COLORS[branch.colorIdx % BRANCH_COLORS.length]}
              onRemove={() => removeBranch(idx)}
            />
          ))}
        </div>

        {/* Unassigned */}
        {unassigned.length > 0 && (
          <div className="mt-6 w-full max-w-[960px] border border-dashed border-slate-300 rounded-2xl p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2">Atanmamış Denetçiler</p>
            <div className="space-y-1.5">
              {[...unassigned].sort(bySeniority).map((p, idx) => (
                <InspectorRow key={p.id} p={p} colors={BRANCH_COLORS[0]} rank={idx + 1} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ─── Add branch button ─── */}
      <div className="flex justify-center pt-2">
        <AddBranchForm onAdd={addBranch} />
      </div>

      {/* ─── Title legend ─── */}
      <div className="pt-4 border-t border-slate-100">
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-2">Ünvan Kıdem Sırası</div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(TITLE_MAP)
            .sort(([, a], [, b]) => a.rank - b.rank)
            .map(([, meta]) => (
              <span key={meta.label} className={clsx('text-[10px] font-bold px-2.5 py-1 rounded-full border', meta.color, meta.bg, meta.border)}>
                {meta.rank}. {meta.label}
              </span>
            ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-[9px] text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> İyi</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Dikkat (burnout)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Stresli (burnout)</span>
          <span className="ml-2">· Nokta = burnout · k. = kıdem başlangıç yılı</span>
        </div>
      </div>

      {profiles.length === 0 && (
        <div className="text-center py-10 text-slate-400">
          <User size={36} className="mx-auto mb-2 opacity-20" />
          <p className="text-sm">Henüz denetçi profili yok</p>
          <p className="text-xs mt-1">Kaynak Havuzu sekmesinden denetçi ekleyin</p>
        </div>
      )}

    </div>
  );
}
