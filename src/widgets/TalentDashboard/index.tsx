/**
 * TalentDashboard — Organizasyon Şeması
 * Teftiş Kurulu Başkanlığı altında Bankacılık ve Bilgi Sistemleri
 * başkan yardımcılıklarına göre denetçileri gruplar.
 */

import { supabase } from '@/shared/api/supabase';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { Monitor, Shield, User } from 'lucide-react';

interface TalentRow {
  id: string;
  full_name: string;
  title: string | null;
  department: string | null;
  is_available: boolean;
  burnout_zone: 'GREEN' | 'AMBER' | 'RED' | null;
  current_level: number;
  total_xp: number;
}

const IT_DEPT_KEYWORDS = [
  'bilgi sistem', 'bilgi teknoloji', 'bt ', ' bt', 'siber', 'teknoloji',
  'yazilim', 'network', 'sistem', 'data', 'dijital', 'it ', ' it',
];

function isItDepartment(dept: string | null): boolean {
  if (!dept) return false;
  const lower = dept.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c');
  return IT_DEPT_KEYWORDS.some(kw => lower.includes(kw));
}

const BURNOUT_COLORS: Record<string, string> = {
  GREEN: 'bg-emerald-400',
  AMBER: 'bg-amber-400',
  RED:   'bg-red-500',
};

const BURNOUT_LABELS: Record<string, string> = {
  GREEN: 'İyi',
  AMBER: 'Dikkat',
  RED:   'Stresli',
};

const LEVEL_LABELS: Record<number, string> = {
  1: 'Associate', 2: 'Analist', 3: 'Kıdemli Analist', 4: 'Baş Denetçi', 5: 'Uzman',
};

// ─── Inspector Card ───────────────────────────────────────────────────────────

function InspectorCard({ p, isIt }: { p: TalentRow; isIt: boolean }) {
  const initials = p.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const burnout = p.burnout_zone ?? 'GREEN';

  return (
    <div className={clsx(
      'flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all w-[130px] shrink-0',
      isIt
        ? 'bg-cyan-50/80 border-cyan-200 hover:border-cyan-400 hover:shadow-md hover:shadow-cyan-100'
        : 'bg-indigo-50/80 border-indigo-200 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100',
    )}>
      {/* Avatar */}
      <div className="relative">
        <div className={clsx(
          'w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white shadow-sm',
          isIt ? 'bg-gradient-to-br from-cyan-500 to-teal-600' : 'bg-gradient-to-br from-indigo-500 to-violet-600',
        )}>
          {initials}
        </div>
        <span className={clsx(
          'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
          BURNOUT_COLORS[burnout],
        )} title={BURNOUT_LABELS[burnout]} />
      </div>

      {/* Name */}
      <div className="text-center">
        <div className="text-xs font-bold text-slate-800 leading-tight text-center line-clamp-2">{p.full_name}</div>
        <div className={clsx('text-[9px] font-semibold mt-0.5', isIt ? 'text-cyan-600' : 'text-indigo-600')}>
          {p.title ?? (LEVEL_LABELS[p.current_level] ?? 'Denetçi')}
        </div>
      </div>

      {/* Availability */}
      <span className={clsx(
        'text-[8px] font-bold px-1.5 py-0.5 rounded-full',
        p.is_available
          ? 'bg-emerald-100 text-emerald-700'
          : 'bg-amber-100 text-amber-700',
      )}>
        {p.is_available ? 'Müsait' : 'Meşgul'}
      </span>
    </div>
  );
}

// ─── Connector line SVG ───────────────────────────────────────────────────────

function VConnector({ color }: { color: string }) {
  return <div className={clsx('w-px h-8 mx-auto', color)} />;
}

function HConnector({ color }: { color: string }) {
  return <div className={clsx('h-px flex-1', color)} />;
}

// ─── VP Node ─────────────────────────────────────────────────────────────────

function VPNode({ label, count, isIt }: { label: string; count: number; isIt: boolean }) {
  return (
    <div className={clsx(
      'flex flex-col items-center gap-1 px-6 py-3 rounded-2xl border-2 shadow-sm min-w-[220px]',
      isIt
        ? 'bg-gradient-to-br from-cyan-600 to-teal-700 border-cyan-400'
        : 'bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400',
    )}>
      {isIt
        ? <Monitor size={18} className="text-white/80" />
        : <Shield size={18} className="text-white/80" />}
      <div className="text-white font-black text-xs text-center leading-tight">{label}</div>
      <div className="text-white/60 text-[9px] font-semibold">{count} denetçi</div>
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
        .select('id, full_name, title, department, is_available, burnout_zone, current_level, total_xp')
        .order('full_name');
      if (error) throw error;
      return (data ?? []) as TalentRow[];
    },
    staleTime: 60_000,
  });

  const itProfiles    = profiles.filter(p => isItDepartment(p.department));
  const idariProfiles = profiles.filter(p => !isItDepartment(p.department));
  const available     = profiles.filter(p => p.is_available).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-4 px-2 overflow-x-auto min-h-[60vh]">

      {/* ─── Summary badges ─── */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600">
          <User size={13} className="text-slate-400" />
          Toplam {profiles.length} denetçi
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-700">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {available} müsait
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 border border-cyan-200 rounded-xl text-xs font-semibold text-cyan-700">
          <Monitor size={12} />
          {itProfiles.length} BT denetçisi
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-700">
          <Shield size={12} />
          {idariProfiles.length} bankacılık denetçisi
        </div>
      </div>

      {/* ─── Org Chart ─── */}
      <div className="flex flex-col items-center select-none">

        {/* Level 1: Teftiş Kurulu Başkanlığı */}
        <div className="flex flex-col items-center px-8 py-4 rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl min-w-[280px]">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-1">
            <User size={16} className="text-white/80" />
          </div>
          <div className="text-white font-black text-sm text-center">Teftiş Kurulu Başkanlığı</div>
          <div className="text-white/50 text-[9px] mt-0.5 font-semibold uppercase tracking-widest">Genel Müdür Yardımcısı</div>
        </div>

        {/* Vertical connector from top */}
        <VConnector color="bg-slate-400" />

        {/* Horizontal branch line */}
        <div className="flex items-start w-full max-w-5xl">
          {/* Left branch */}
          <div className="flex flex-col items-end flex-1">
            <div className="flex items-center self-end w-full justify-end">
              <HConnector color="bg-slate-300" />
              <div className="w-px h-8 bg-slate-300" />
            </div>
          </div>

          {/* Center spacer */}
          <div className="w-px h-8 bg-slate-300" />

          {/* Right branch */}
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center self-start w-full">
              <div className="w-px h-8 bg-slate-300" />
              <HConnector color="bg-slate-300" />
            </div>
          </div>
        </div>

        {/* Level 2: VPs side by side */}
        <div className="flex items-start gap-16 w-full max-w-5xl justify-center">

          {/* ── Bankacılık Denetimleri ── */}
          <div className="flex flex-col items-center gap-0">
            <VPNode label="Bankacılık Denetimleri Başkan Yardımcılığı" count={idariProfiles.length} isIt={false} />
            <VConnector color="bg-indigo-300" />

            {idariProfiles.length === 0 ? (
              <div className="text-xs text-slate-400 italic px-4 py-3 border border-dashed border-slate-200 rounded-xl">
                Denetçi yok
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                {/* connector to row */}
                <div className="flex flex-wrap gap-2 justify-center max-w-[580px]">
                  {idariProfiles.map((p, idx) => (
                    <div key={p.id} className="flex flex-col items-center gap-0">
                      {idx === 0 && <div className="w-px h-3 bg-indigo-200" />}
                      <InspectorCard p={p} isIt={false} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Bilgi Sistemleri Denetimleri ── */}
          <div className="flex flex-col items-center gap-0">
            <VPNode label="Bilgi Sistemleri Denetimleri Başkan Yardımcılığı" count={itProfiles.length} isIt />
            <VConnector color="bg-cyan-300" />

            {itProfiles.length === 0 ? (
              <div className="text-xs text-slate-400 italic px-4 py-3 border border-dashed border-slate-200 rounded-xl">
                Denetçi yok
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap gap-2 justify-center max-w-[580px]">
                  {itProfiles.map((p, idx) => (
                    <div key={p.id} className="flex flex-col items-center gap-0">
                      {idx === 0 && <div className="w-px h-3 bg-cyan-200" />}
                      <InspectorCard p={p} isIt />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Legend */}
        <div className="mt-8 flex items-center gap-5 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />Müsait
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />Dikkat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />Stresli
          </span>
          <span className="text-slate-300">|</span>
          <span>Nokta = burnout durumu</span>
        </div>

        {profiles.length === 0 && (
          <div className="mt-8 text-center text-slate-400">
            <User size={36} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Henüz denetçi profili yok</p>
            <p className="text-xs mt-1">Kaynak Havuzu sekmesinden denetçi ekleyin</p>
          </div>
        )}

      </div>
    </div>
  );
}
