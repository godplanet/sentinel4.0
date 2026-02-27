import { useState, useEffect } from 'react';
import { Users, Loader2, AlertTriangle, Flame, Battery } from 'lucide-react';
import clsx from 'clsx';
import { supabase } from '@/shared/api/supabase';

interface TalentRow {
  full_name: string;
  department: string;
  fatigue_score: number;
  burnout_zone: string;
  active_hours_last_3_weeks: number;
  consecutive_high_stress_projects: number;
  is_available: boolean;
}

const ZONE_CONFIG: Record<string, { bg: string; bar: string; text: string; label: string }> = {
  GREEN: { bg: 'bg-emerald-100', bar: 'bg-emerald-500', text: 'text-emerald-700', label: 'Saglikli' },
  AMBER: { bg: 'bg-amber-100', bar: 'bg-amber-500', text: 'text-amber-700', label: 'Dikkat' },
  RED: { bg: 'bg-red-100', bar: 'bg-red-500', text: 'text-red-700', label: 'Kritik' },
};

export function TalentCard() {
  const [profiles, setProfiles] = useState<TalentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('talent_profiles')
        .select('full_name, department, fatigue_score, burnout_zone, active_hours_last_3_weeks, consecutive_high_stress_projects, is_available');
      if (data) setProfiles(data);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 flex items-center justify-center min-h-[320px]">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const zones = { GREEN: 0, AMBER: 0, RED: 0 };
  profiles.forEach((p) => {
    if (p.burnout_zone in zones) zones[p.burnout_zone as keyof typeof zones]++;
  });

  const total = profiles.length;
  const avgFatigue = total > 0
    ? Math.round(profiles.reduce((s, p) => s + p.fatigue_score, 0) / total)
    : 0;

  const redZoneAuditors = profiles.filter((p) => p.burnout_zone === 'RED');
  const available = profiles.filter((p) => p.is_available).length;

  return (
    <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/50 border-2 border-amber-200/60 rounded-2xl overflow-hidden transition-all hover:shadow-lg hover:shadow-amber-100/50">
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Ekip Sagligi</h3>
              <p className="text-[10px] text-slate-500 font-medium">Insan Kaynagi Nabzi</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
            <Battery size={12} />
            {available}/{total}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {(['GREEN', 'AMBER', 'RED'] as const).map((zone) => {
            const cfg = ZONE_CONFIG[zone];
            const count = zones[zone];
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={zone}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={clsx('w-2 h-2 rounded-full', cfg.bar)} />
                    <span className={clsx('text-[11px] font-bold', cfg.text)}>{cfg.label}</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700">{count} kisi</span>
                </div>
                <div className="h-3 bg-white/70 border border-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full transition-all duration-700', cfg.bar)}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-white/70 border border-amber-100 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Flame size={11} className="text-amber-500" />
              <p className="text-[9px] text-slate-500 font-medium">Ort. Yorgunluk</p>
            </div>
            <p className={clsx(
              'text-xl font-bold',
              avgFatigue >= 70 ? 'text-red-600' : avgFatigue >= 45 ? 'text-amber-600' : 'text-emerald-600',
            )}>
              {avgFatigue}%
            </p>
          </div>
          <div className="bg-white/70 border border-amber-100 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle size={11} className="text-red-500" />
              <p className="text-[9px] text-slate-500 font-medium">Red Zone</p>
            </div>
            <p className={clsx(
              'text-xl font-bold',
              redZoneAuditors.length > 0 ? 'text-red-600' : 'text-emerald-600',
            )}>
              {redZoneAuditors.length}
            </p>
          </div>
        </div>
      </div>

      {redZoneAuditors.length > 0 && (
        <div className="px-6 py-3 bg-red-100/40 border-t border-red-200/40">
          <div className="flex items-start gap-2">
            <AlertTriangle size={12} className="text-red-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-bold text-red-700">{redZoneAuditors.length} personel</span> tukenme riski altinda:{' '}
              {redZoneAuditors.map((a) => a.full_name).join(', ')}.
              Dinlenme rotasyonu oneriliyor.
            </p>
          </div>
        </div>
      )}

      {redZoneAuditors.length === 0 && (
        <div className="px-6 py-3 bg-emerald-100/40 border-t border-emerald-200/40">
          <div className="flex items-start gap-2">
            <Users size={12} className="text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tum ekip uyelerinin yorgunluk seviyeleri kabul edilebilir duzeyde.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
