import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Edit2, Save, X, TrendingUp } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchProfilesWithSkills, upsertTalentSkill } from '@/features/talent-os/api';
import type { TalentProfileWithSkills as AuditorProfile } from '@/features/talent-os/types';

const SKILL_CATEGORIES = [
  'IT Denetimi',
  'Kredi Riski',
  'Operasyonel Risk',
  'Mevzuat Uyum',
  'Finansal Analiz',
  'Siber Güvenlik',
  'Proje Yönetimi',
  'İletişim'
];

export function SkillMatrix() {
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<AuditorProfile | null>(null);
  const [editingCell, setEditingCell] = useState<{ profileId: string; skill: string } | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const { data: rawProfiles = [], isLoading } = useQuery({
    queryKey: ['skill-matrix-profiles'],
    queryFn: fetchProfilesWithSkills,
    select: (data) => data.map((p) => ({
      ...p,
      user_id: p.id,
      skills_matrix: p.skills.reduce(
        (acc, s) => ({ ...acc, [s.skill_name]: s.proficiency_level }),
        {} as Record<string, number>
      ),
    })),
  });

  const profiles = rawProfiles as (AuditorProfile & { user_id: string; skills_matrix: Record<string, number> })[];

  const skillMutation = useMutation({
    mutationFn: (params: { profileId: string; skill: string; value: number; tenantId: string }) =>
      upsertTalentSkill({
        auditorId: params.profileId,
        skillName: params.skill,
        proficiencyLevel: params.value,
        tenantId: params.tenantId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skill-matrix-profiles'] });
      setEditingCell(null);
    },
    onError: (err) => console.error('Failed to update skill:', err),
  });

  const handleCellClick = (profile: AuditorProfile & { user_id: string; skills_matrix: Record<string, number> }, skill: string) => {
    const currentValue = profile.skills_matrix?.[skill] || 0;
    setEditingCell({ profileId: profile.user_id, skill });
    setEditValue(currentValue);
  };

  const handleSaveCell = () => {
    if (!editingCell) return;
    const profile = profiles.find((p) => p.user_id === editingCell.profileId);
    if (!profile) return;

    skillMutation.mutate({
      profileId: editingCell.profileId,
      skill: editingCell.skill,
      value: editValue,
      tenantId: (profile as any).tenant_id || 'default',
    });
  };

  const getSkillColor = (level: number) => {
    if (level === 0) return 'bg-slate-100 text-slate-400';
    if (level === 1) return 'bg-red-100 text-red-700';
    if (level === 2) return 'bg-orange-100 text-orange-700';
    if (level === 3) return 'bg-yellow-100 text-yellow-700';
    if (level === 4) return 'bg-lime-100 text-lime-700';
    return 'bg-green-100 text-green-700';
  };

  const getRadarData = (profile: AuditorProfile & { skills_matrix: Record<string, number> }) => {
    return SKILL_CATEGORIES.map((skill) => ({
      skill: skill.length > 15 ? skill.substring(0, 15) + '...' : skill,
      value: profile.skills_matrix?.[skill] || 0,
      fullMark: 5,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Yetenek Matrisi - Ekip Geneli
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Hücrelere tıklayarak yetenek seviyelerini düzenleyin (0-5 arası)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-canvas border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 sticky left-0 bg-canvas z-10 min-w-[180px]">
                  Denetçi
                </th>
                {SKILL_CATEGORIES.map((skill) => (
                  <th key={skill} className="px-4 py-3 text-center text-xs font-semibold text-slate-700 min-w-[100px]">
                    {skill}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {profiles.map((profile, idx) => (
                <tr
                  key={profile.user_id}
                  className={`hover:bg-canvas transition-colors ${
                    selectedProfile?.id === profile.id ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedProfile(profile)}
                >
                  <td className="px-4 py-3 sticky left-0 bg-surface z-10 border-r border-slate-200">
                    <div className="cursor-pointer">
                      <p className="font-medium text-primary text-sm">
                        {profile.title || `Denetçi ${idx + 1}`}
                      </p>
                      <p className="text-xs text-slate-600">{profile.department || 'İç Denetim'}</p>
                    </div>
                  </td>
                  {SKILL_CATEGORIES.map((skill) => {
                    const level = profile.skills_matrix?.[skill] || 0;
                    const isEditing = editingCell?.profileId === profile.user_id && editingCell?.skill === skill;

                    return (
                      <td key={skill} className="px-2 py-2 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="5"
                              value={editValue}
                              onChange={(e) => setEditValue(Math.min(5, Math.max(0, parseInt(e.target.value) || 0)))}
                              className="w-12 px-2 py-1 text-center border-2 border-blue-500 rounded focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={handleSaveCell}
                              disabled={skillMutation.isPending}
                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingCell(null)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(profile, skill);
                            }}
                            className={`w-full px-3 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105 ${getSkillColor(level)} group relative`}
                          >
                            {level}/5
                            <Edit2 className="w-3 h-3 absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-canvas border-t border-slate-200">
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span className="font-semibold">Seviye Göstergesi:</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-red-100 rounded" />
              <span>1 (Başlangıç)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-orange-100 rounded" />
              <span>2 (Temel)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-yellow-100 rounded" />
              <span>3 (Orta)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-lime-100 rounded" />
              <span>4 (İleri)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-4 bg-green-100 rounded" />
              <span>5 (Uzman)</span>
            </div>
          </div>
        </div>
      </div>

      {selectedProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface rounded-lg border border-slate-200 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Yetenek Profili: {selectedProfile.title || 'Denetçi'}
              </h3>
              <p className="text-sm text-slate-600">{selectedProfile.department || 'İç Denetim'}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600">Toplam CPE</p>
              <p className="text-2xl font-bold text-blue-600">{selectedProfile.cpe_credits}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Radar Analizi</h4>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={getRadarData(selectedProfile as any)}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar
                    name="Yetenek Seviyesi"
                    dataKey="value"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Yetenek Detayları</h4>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {SKILL_CATEGORIES.map((skill) => {
                  const level = (selectedProfile as any).skills_matrix?.[skill] || 0;
                  return (
                    <div key={skill} className="flex items-center justify-between p-2 bg-canvas rounded-lg">
                      <span className="text-sm text-slate-700">{skill}</span>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= level ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <span className={`text-sm font-semibold ${level >= 4 ? 'text-green-600' : 'text-slate-600'}`}>
                          {level}/5
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {selectedProfile.certifications.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">Sertifikalar</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProfile.certifications.map((cert) => (
                  <span key={cert} className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-lg">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
