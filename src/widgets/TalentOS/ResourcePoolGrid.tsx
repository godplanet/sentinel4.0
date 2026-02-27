import { useState, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, Users, AlertTriangle, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import type { TalentProfileWithSkills, BurnoutZone } from '@/features/talent-os/types';
import { SKILL_LABELS } from '@/features/talent-os/types';
import { TalentCard } from './TalentCard';

interface ResourcePoolGridProps {
  profiles: TalentProfileWithSkills[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

type AvailabilityFilter = 'all' | 'available' | 'unavailable';
type ZoneFilter = 'all' | BurnoutZone;

const ALL_SKILLS = Object.keys(SKILL_LABELS);

export function ResourcePoolGrid({ profiles, selectedId, onSelect }: ResourcePoolGridProps) {
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [availFilter, setAvailFilter] = useState<AvailabilityFilter>('all');
  const [zoneFilter, setZoneFilter] = useState<ZoneFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let result = profiles;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.full_name.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.title.toLowerCase().includes(q)
      );
    }

    if (skillFilter !== 'all') {
      result = result.filter((p) =>
        p.skills.some((s) => s.skill_name === skillFilter && s.proficiency_level >= 3)
      );
    }

    if (availFilter === 'available') result = result.filter((p) => p.is_available);
    if (availFilter === 'unavailable') result = result.filter((p) => !p.is_available);

    if (zoneFilter !== 'all') result = result.filter((p) => p.burnout_zone === zoneFilter);

    return result;
  }, [profiles, search, skillFilter, availFilter, zoneFilter]);

  const stats = useMemo(() => ({
    total: profiles.length,
    available: profiles.filter((p) => p.is_available).length,
    red: profiles.filter((p) => p.burnout_zone === 'RED').length,
    green: profiles.filter((p) => p.burnout_zone === 'GREEN').length,
  }), [profiles]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatChip icon={Users} label="Toplam" value={stats.total} color="bg-blue-50 text-blue-700" />
        <StatChip icon={CheckCircle2} label="Musait" value={stats.available} color="bg-emerald-50 text-emerald-700" />
        <StatChip icon={AlertTriangle} label="Kritik" value={stats.red} color="bg-red-50 text-red-700" />
        <StatChip icon={Filter} label="Saglikli" value={stats.green} color="bg-teal-50 text-teal-700" />
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Denetci ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors',
            showFilters
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          )}
        >
          <SlidersHorizontal size={16} />
          Filtreler
        </button>
      </div>

      {showFilters && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 mb-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Beceri Filtresi</label>
            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tumu</option>
              {ALL_SKILLS.map((s) => (
                <option key={s} value={s}>{SKILL_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Durum</label>
            <select
              value={availFilter}
              onChange={(e) => setAvailFilter(e.target.value as AvailabilityFilter)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tumu</option>
              <option value="available">Musait</option>
              <option value="unavailable">Mesgul</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Yorgunluk Bolge</label>
            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value as ZoneFilter)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tumu</option>
              <option value="GREEN">Yesil (Normal)</option>
              <option value="AMBER">Sari (Dikkat)</option>
              <option value="RED">Kirmizi (Kritik)</option>
            </select>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
          <Users className="mx-auto text-slate-400 mb-4" size={48} />
          <p className="text-slate-600 font-medium">Eslesen denetci bulunamadi</p>
          <p className="text-slate-500 text-sm mt-2">Filtreleri degistirmeyi deneyin</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <TalentCard
              key={p.id}
              profile={p}
              selected={selectedId === p.id}
              onClick={() => onSelect(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={clsx('flex items-center gap-3 px-4 py-3 rounded-lg', color)}>
      <Icon size={18} />
      <div>
        <p className="text-lg font-bold leading-none">{value}</p>
        <p className="text-xs opacity-75 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
