/**
 * TalentDashboard — Organizasyon Şeması
 * Teftiş Kurulu Başkanlığı → Bankacılık / Bilgi Sistemleri Başkan Yardımcılıkları
 * Denetçiler kıdem sırasına göre alt alta listelenir.
 */

import { supabase } from '@/shared/api/supabase';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Monitor, Shield, User } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TalentRow {
  id: string;
  full_name: string;
  title: string | null;         // Junior | Senior | Manager | Expert
  department: string | null;
  is_available: boolean;
  burnout_zone: 'GREEN' | 'AMBER' | 'RED' | null;
  current_level: number;        // 1–5
}

// ─── Title mapping (kıdem sırası: 1 = en kıdemli) ────────────────────────────

const TITLE_MAP: Record<number, { label: string; rank: number; color: string; bg: string; border: string }> = {
  5: { label: 'Başmüfettiş',                rank: 1, color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300' },
  4: { label: 'Kıdemli Müfettiş',           rank: 2, color: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-300' },
  3: { label: 'Müfettiş',                   rank: 3, color: 'text-indigo-700',  bg: 'bg-indigo-50',   border: 'border-indigo-300' },
  2: { label: 'Yetkili Müfettiş Yardımcısı', rank: 4, color: 'text-teal-700',  bg: 'bg-teal-50',     border: 'border-teal-300' },
  1: { label: 'Müfettiş Yardımcısı',        rank: 5, color: 'text-slate-600',  bg: 'bg-slate-50',    border: 'border-slate-300' },
};

// Also map from string title as fallback
const TITLE_FROM_STR: Record<string, number> = {
  expert: 5, manager: 4, senior: 3, junior: 1,
};

function resolveLevel(p: TalentRow): number {
  if (p.current_level >= 1 && p.current_level <= 5) return p.current_level;
  if (p.title) {
    const mapped = TITLE_FROM_STR[p.title.toLowerCase()];
    if (mapped) return mapped;
  }
  return 1;
}

// ─── IT / İdari branch detection ─────────────────────────────────────────────

const IT_KEYWORDS = [
  'bilgi sistem', 'bilgi teknoloji', 'bt', 'siber', 'teknoloji',
  'yazilim', 'network', 'sistem', 'data', 'dijital',
];

function isItBranch(p: TalentRow): boolean {
  const src = ((p.department ?? '') + ' ' + (p.title ?? '')).toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
  return IT_KEYWORDS.some(kw => src.includes(kw));
}

// ─── Sort by seniority (highest level first) ──────────────────────────────────

function bySeniority(a: TalentRow, b: TalentRow): number {
  return resolveLevel(b) - resolveLevel(a);
}

// ─── Burnout ──────────────────────────────────────────────────────────────────

const BURNOUT_DOT: Record<string, string> = {
  GREEN: 'bg-emerald-400', AMBER: 'bg-amber-400', RED: 'bg-red-500',
};
const BURNOUT_LABEL: Record<string, string> = {
  GREEN: 'İyi', AMBER: 'Dikkat', RED: 'Stresli',
};

// ─── Inspector Row (vertical list item) ──────────────────────────────────────

function InspectorRow({ p, isIt, rank }: { p: TalentRow; isIt: boolean; rank: number }) {
  const level  = resolveLevel(p);
  const meta   = TITLE_MAP[level] ?? TITLE_MAP[1];
  const burnout = p.burnout_zone ?? 'GREEN';
  const initials = p.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className={clsx(
      'flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all hover:shadow-sm',
      isIt
        ? 'bg-cyan-50/60 border-cyan-200 hover:border-cyan-300'
        : 'bg-indigo-50/60 border-indigo-200 hover:border-indigo-300',
    )}>
      {/* Rank number */}
      <span className="text-[10px] font-black text-slate-400 w-4 text-right shrink-0">{rank}</span>

      {/* Avatar */}
      <div className="relative shrink-0">
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white',
          isIt ? 'bg-gradient-to-br from-cyan-500 to-teal-600' : 'bg-gradient-to-br from-indigo-500 to-violet-600',
        )}>
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
        {p.department && <div className="text-[9px] text-slate-400 truncate">{p.department}</div>}
      </div>

      {/* Title badge */}
      <span className={clsx('shrink-0 text-[9px] font-bold px-2 py-0.5 rounded-full border', meta.color, meta.bg, meta.border)}>
        {meta.label}
      </span>

      {/* Availability */}
      <span className={clsx(
        'shrink-0 text-[8px] font-bold px-1.5 py-0.5 rounded-full',
        p.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
      )}>
        {p.is_available ? 'Müsait' : 'Meşgul'}
      </span>
    </div>
  );
}

// ─── Branch Column ────────────────────────────────────────────────────────────

function BranchColumn({ people, isIt }: { people: TalentRow[]; isIt: boolean }) {
  const sorted = [...people].sort(bySeniority);

  return (
    <div className="flex flex-col items-center gap-0 flex-1 min-w-[320px] max-w-[520px]">

      {/* VP Node */}
      <div className={clsx(
        'w-full flex flex-col items-center gap-1 px-5 py-3.5 rounded-2xl border-2 shadow-md',
        isIt
          ? 'bg-gradient-to-br from-cyan-600 to-teal-700 border-cyan-400'
          : 'bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400',
      )}>
        {isIt ? <Monitor size={16} className="text-white/70" /> : <Shield size={16} className="text-white/70" />}
        <div className="text-white font-black text-xs text-center leading-snug">
          {isIt ? 'Bilgi Sistemleri Denetimleri' : 'Bankacılık Denetimleri'}
        </div>
        <div className="text-white/60 text-[10px] font-semibold">Başkan Yardımcısı</div>
        <div className="text-white/40 text-[9px]">{sorted.length} denetçi</div>
      </div>

      {/* Connector */}
      <div className={clsx('w-px h-6', isIt ? 'bg-cyan-300' : 'bg-indigo-300')} />

      {/* Inspector list */}
      {sorted.length === 0 ? (
        <div className="w-full text-xs text-slate-400 italic text-center py-4 border border-dashed border-slate-200 rounded-xl">
          Henüz denetçi yok
        </div>
      ) : (
        <div className="w-full space-y-1.5">
          {sorted.map((p, idx) => (
            <InspectorRow key={p.id} p={p} isIt={isIt} rank={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function TalentDashboard() {
  const { data: profiles = [], isLoading } = useQuery<TalentRow[]>({
    queryKey: ['talent-profiles-orgchart'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_profiles')
        .select('id, full_name, title, department, is_available, burnout_zone, current_level')
        .order('current_level', { ascending: false });
      if (error) throw error;
      return (data ?? []) as TalentRow[];
    },
    staleTime: 60_000,
  });

  const itPeople    = profiles.filter(p => isItBranch(p));
  const idariPeople = profiles.filter(p => !isItBranch(p));
  const available   = profiles.filter(p => p.is_available).length;

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
        {[
          { label: `${profiles.length} denetçi`, cls: 'bg-slate-100 border-slate-200 text-slate-600', icon: <User size={12} /> },
          { label: `${available} müsait`, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" /> },
          { label: `${itPeople.length} BT`, cls: 'bg-cyan-50 border-cyan-200 text-cyan-700', icon: <Monitor size={12} /> },
          { label: `${idariPeople.length} Bankacılık`, cls: 'bg-indigo-50 border-indigo-200 text-indigo-700', icon: <Shield size={12} /> },
        ].map(item => (
          <div key={item.label} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold', item.cls)}>
            {item.icon}{item.label}
          </div>
        ))}
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
        <div className="relative flex w-full max-w-[900px] items-start justify-center">
          {/* horizontal bar */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-slate-300" />
          {/* left drop */}
          <div className="absolute top-0 left-1/4 w-px h-8 bg-slate-300" style={{ left: 'calc(25% - 0.5px)' }} />
          {/* right drop */}
          <div className="absolute top-0 right-1/4 w-px h-8 bg-slate-300" style={{ right: 'calc(25% - 0.5px)' }} />
        </div>

        {/* Spacer for branch drops */}
        <div className="h-8" />

        {/* Branch columns */}
        <div className="flex gap-8 w-full max-w-[900px] items-start justify-center">
          <BranchColumn people={idariPeople} isIt={false} />
          <BranchColumn people={itPeople} isIt />
        </div>

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
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Müsait</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Dikkat (burnout)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Stresli (burnout)</span>
          <span className="ml-2">· Nokta = burnout durumu (kart sol alt köşe)</span>
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
