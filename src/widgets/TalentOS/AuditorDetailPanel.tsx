import { motion } from 'framer-motion';
import { X, Shield, Zap, Clock, Plane, AlertTriangle, Activity } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import clsx from 'clsx';
import type { TalentProfileWithSkills } from '@/features/talent-os/types';
import { SKILL_LABELS, LEVEL_LABELS, TITLE_LABELS } from '@/features/talent-os/types';
import { calculateFatigue, getFatigueBgColor, getFatigueLabel } from '@/features/talent-os/fatigue';

interface AuditorDetailPanelProps {
  profile: TalentProfileWithSkills;
  onClose: () => void;
}

const SKILL_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AuditorDetailPanel({ profile, onClose }: AuditorDetailPanelProps) {
  const fatigue = calculateFatigue(profile);

  const radarData = profile.skills.map((s) => ({
    skill: SKILL_LABELS[s.skill_name] || s.skill_name,
    level: s.proficiency_level,
    fullMark: 5,
  }));

  const xpData = profile.skills.map((s, i) => ({
    name: SKILL_LABELS[s.skill_name]?.substring(0, 8) || s.skill_name,
    xp: s.earned_xp,
    color: SKILL_COLORS[i % SKILL_COLORS.length],
  }));

  const breakdownData = [
    { label: 'Calisma Saati', value: fatigue.breakdown.hoursComponent, max: 45, color: 'bg-blue-500' },
    { label: 'Seyahat Yuku', value: fatigue.breakdown.travelComponent, max: 25, color: 'bg-teal-500' },
    { label: 'Stres Serisi', value: fatigue.breakdown.stressComponent, max: 20, color: 'bg-amber-500' },
    { label: 'Yakinlik', value: fatigue.breakdown.recencyComponent, max: 10, color: 'bg-slate-500' },
  ];

  const initials = profile.full_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className={clsx(
        'p-5 flex items-start gap-4',
        profile.burnout_zone === 'RED'
          ? 'bg-gradient-to-r from-red-50 to-red-100/50'
          : 'bg-gradient-to-r from-blue-50 to-slate-50'
      )}>
        <div className={clsx(
          'w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0',
          profile.burnout_zone === 'RED' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
        )}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">{profile.full_name}</h2>
            {profile.burnout_zone === 'RED' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                <AlertTriangle size={11} /> DURDUR
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600">
            {TITLE_LABELS[profile.title]} - {profile.department}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
              <Shield size={11} /> Svy {profile.current_level} - {LEVEL_LABELS[profile.current_level]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              <Zap size={11} /> {profile.total_xp.toLocaleString()} XP
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-200/50 text-slate-500 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-5 space-y-6">
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity size={13} /> Yorgunluk Analizi
          </h4>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fatigue.score}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={clsx('h-full rounded-full', getFatigueBgColor(fatigue.zone))}
              />
            </div>
            <span className="text-sm font-bold text-slate-700 w-16 text-right">
              {fatigue.score}%
            </span>
            <span className={clsx(
              'text-xs font-bold px-2 py-0.5 rounded',
              fatigue.zone === 'RED' ? 'bg-red-100 text-red-700' :
              fatigue.zone === 'AMBER' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            )}>
              {getFatigueLabel(fatigue.zone)}
            </span>
          </div>
          <div className="space-y-2">
            {breakdownData.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 w-24 flex-shrink-0">{item.label}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx('h-full rounded-full', item.color)}
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 w-8 text-right">{item.value}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <MiniStat icon={Clock} label="Haftalik Saat" value={`${Math.round(profile.active_hours_last_3_weeks / 3)}s`} />
            <MiniStat icon={Plane} label="Seyahat Yuku" value={`${profile.travel_load}%`} />
            <MiniStat icon={AlertTriangle} label="Stres Serisi" value={`${profile.consecutive_high_stress_projects}`} />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Beceri Radari
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#475569', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                <Radar dataKey="level" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Beceri XP Dagilimi
          </h4>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={xpData} layout="vertical" margin={{ left: 0 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} width={65} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  formatter={(value: number) => [`${value.toLocaleString()} XP`, 'Kazanilan']}
                />
                <Bar dataKey="xp" radius={[0, 4, 4, 0]} barSize={14}>
                  {xpData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Beceri Detaylari
          </h4>
          <div className="space-y-1.5">
            {profile.skills
              .sort((a, b) => b.proficiency_level - a.proficiency_level)
              .map((skill) => (
                <div key={skill.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 w-24 truncate">
                    {SKILL_LABELS[skill.skill_name] || skill.skill_name}
                  </span>
                  <div className="flex gap-0.5 flex-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <div
                        key={i}
                        className={clsx(
                          'h-2 flex-1 rounded-sm',
                          i < skill.proficiency_level ? 'bg-blue-500' : 'bg-slate-200'
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 w-12 text-right">
                    Svy {skill.proficiency_level}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 rounded-lg p-2.5 text-center">
      <Icon size={14} className="text-slate-400 mx-auto mb-1" />
      <p className="text-sm font-bold text-slate-800">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );
}
