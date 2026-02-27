import { motion } from 'framer-motion';
import { User, Shield, AlertTriangle, Zap, TrendingUp } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';
import type { TalentProfileWithSkills } from '@/features/talent-os/types';
import { SKILL_LABELS, LEVEL_LABELS, TITLE_LABELS } from '@/features/talent-os/types';
import { getFatigueBgColor, getFatigueLabel } from '@/features/talent-os/fatigue';

interface TalentCardProps {
  profile: TalentProfileWithSkills;
  selected?: boolean;
  onClick?: () => void;
}

const LEVEL_COLORS: Record<number, string> = {
  1: 'bg-slate-100 text-slate-700 border-slate-300',
  2: 'bg-sky-100 text-sky-700 border-sky-300',
  3: 'bg-blue-100 text-blue-700 border-blue-300',
  4: 'bg-teal-100 text-teal-700 border-teal-300',
  5: 'bg-amber-100 text-amber-800 border-amber-400',
};

const ZONE_BORDER: Record<string, string> = {
  GREEN: 'border-l-emerald-500',
  AMBER: 'border-l-amber-500',
  RED: 'border-l-red-500',
};

export function TalentCard({ profile, selected, onClick }: TalentCardProps) {
  const radarData = profile.skills.map((s) => ({
    skill: SKILL_LABELS[s.skill_name] || s.skill_name,
    level: s.proficiency_level,
    fullMark: 5,
  }));

  const initials = profile.full_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={clsx(
        'bg-white rounded-xl border-l-4 border border-slate-200 shadow-sm cursor-pointer transition-shadow',
        ZONE_BORDER[profile.burnout_zone],
        selected && 'ring-2 ring-blue-500 shadow-md',
        profile.burnout_zone === 'RED' && 'opacity-80'
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className={clsx(
            'w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0',
            profile.burnout_zone === 'RED'
              ? 'bg-red-100 text-red-700'
              : 'bg-blue-100 text-blue-700'
          )}>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 truncate">{profile.full_name}</h3>
              {profile.burnout_zone === 'RED' && (
                <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-slate-500">{profile.department}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border',
                LEVEL_COLORS[profile.current_level] || LEVEL_COLORS[1]
              )}>
                <Shield size={10} />
                Svy {profile.current_level} - {LEVEL_LABELS[profile.current_level]}
              </span>
              <span className="text-xs text-slate-400">
                {TITLE_LABELS[profile.title]}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 flex-1">
            <Zap size={12} className="text-amber-500" />
            <span className="text-xs text-slate-600 font-medium">{profile.total_xp.toLocaleString()} XP</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={12} className="text-blue-500" />
            <span className="text-xs text-slate-600 font-medium">
              {profile.is_available ? 'Musait' : 'Mesgul'}
            </span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <User size={11} />
              Yorgunluk
            </span>
            <span className={clsx(
              'font-bold text-xs px-1.5 py-0.5 rounded',
              profile.burnout_zone === 'RED' ? 'bg-red-100 text-red-700' :
              profile.burnout_zone === 'AMBER' ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            )}>
              {profile.fatigue_score}% - {getFatigueLabel(profile.burnout_zone)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${profile.fatigue_score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={clsx('h-full rounded-full', getFatigueBgColor(profile.burnout_zone))}
            />
          </div>
        </div>

        {radarData.length > 0 && (
          <div className="h-40 -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="skill"
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 5]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  dataKey="level"
                  stroke={profile.burnout_zone === 'RED' ? '#ef4444' : '#3b82f6'}
                  fill={profile.burnout_zone === 'RED' ? '#ef4444' : '#3b82f6'}
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </motion.div>
  );
}
