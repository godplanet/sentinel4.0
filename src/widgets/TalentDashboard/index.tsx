import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Award, GraduationCap, TrendingUp, Star, BookOpen } from 'lucide-react';
import { supabase } from '@/shared/api/supabase';
import { fetchProfilesWithSkills } from '@/features/talent-os/api';
import type { TalentProfileWithSkills as AuditorProfile } from '@/features/talent-os/types';
export interface TrainingRecord { id: string; user_id: string; training_title: string; training_type: string; hours: number; cpe_credits: number; completed_date: string | null; }

export function TalentDashboard() {
  const [profiles, setProfiles] = useState<AuditorProfile[]>([]);
  const [training, setTraining] = useState<TrainingRecord[]>([]);
  const [stats, setStats] = useState({ totalAuditors: 0, totalCPE: 0, totalTrainingHours: 0, avgCertifications: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<AuditorProfile | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const rawProfiles = await fetchProfilesWithSkills();
      const profilesData = rawProfiles.map(p => ({
        ...p, user_id: p.id, certifications: [], cpe_credits: p.total_xp || 0,
        skills_matrix: p.skills.reduce((acc, s) => ({ ...acc, [s.skill_name]: s.proficiency_level }), {} as Record<string, number>)
      })) as any;

      const { data: trainingRes } = await supabase.from('training_records').select('*').order('completed_date', { ascending: false });
      const trainingData = trainingRes || [];

      const statsData = {
        totalAuditors: profilesData.length,
        totalCPE: profilesData.reduce((sum: number, p: any) => sum + p.cpe_credits, 0),
        totalTrainingHours: trainingData.reduce((sum: number, t: any) => sum + t.hours, 0),
        avgCertifications: 0
      };
      setProfiles(profilesData);
      setTraining(trainingData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load talent data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Toplam Denetçi</span>
            <Users className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-3xl font-bold text-slate-900">{stats.totalAuditors}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Toplam CPE Kredisi</span>
            <Award className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.totalCPE}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Eğitim Saati</span>
            <GraduationCap className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{stats.totalTrainingHours}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">Ort. Sertifika</span>
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-bold text-amber-600">{stats.avgCertifications.toFixed(1)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Denetçi Profilleri
          </h3>

          <div className="space-y-4">
            {profiles.map((profile) => (
              <div
                key={profile.user_id}
                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => setSelectedProfile(profile)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{profile.title || 'İç Denetçi'}</h4>
                    <p className="text-sm text-slate-600">{profile.department || 'İç Denetim'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-purple-600">{profile.cpe_credits} CPE</p>
                  </div>
                </div>

                {profile.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {profile.certifications.map((cert) => (
                      <span
                        key={cert}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                )}

                {profile.skills_matrix && Object.keys(profile.skills_matrix).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(profile.skills_matrix).slice(0, 3).map(([skill, level]) => (
                      <div key={skill} className="text-xs text-slate-600">
                        {skill}: {level}/5 ⭐
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Son Eğitimler
          </h3>

          <div className="space-y-4">
            {training.slice(0, 6).map((record) => {
              const profile = profiles.find(p => p.user_id === record.user_id);

              return (
                <div
                  key={record.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">
                        {record.training_title}
                      </h4>
                      <p className="text-xs text-slate-600">
                        {profile?.title || 'Denetçi'}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      record.training_type === 'EXTERNAL' ? 'bg-green-100 text-green-700' :
                      record.training_type === 'CERTIFICATION' ? 'bg-purple-100 text-purple-700' :
                      record.training_type === 'ONLINE' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {record.training_type}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>{record.hours} saat</span>
                    <span className="font-semibold text-purple-600">{record.cpe_credits} CPE</span>
                    <span>{record.completed_date ? new Date(record.completed_date).toLocaleDateString('tr-TR') : '-'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedProfile(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {selectedProfile.title || 'Denetçi Profili'}
            </h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Sertifikalar</p>
                <div className="flex flex-wrap gap-2">
                  {selectedProfile.certifications.map((cert) => (
                    <span key={cert} className="px-3 py-1.5 bg-blue-100 text-blue-700 font-semibold rounded-lg">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700 mb-2">Yetenek Matrisi</p>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(selectedProfile.skills_matrix || {}).map(([skill, level]) => (
                    <div key={skill} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <span className="text-sm text-slate-700">{skill}</span>
                      <span className="text-sm font-semibold text-purple-600">{level}/5</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div>
                  <p className="text-sm text-slate-600">CPE Kredisi</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedProfile.cpe_credits}</p>
                </div>
                <button
                  onClick={() => setSelectedProfile(null)}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
