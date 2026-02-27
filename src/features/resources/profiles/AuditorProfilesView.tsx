import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { Users, Mail, Phone, Award, Search, Plus } from 'lucide-react';

interface AuditorProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  title?: string;
  certifications?: string[];
  specializations?: string[];
  years_of_experience?: number;
}

export function AuditorProfilesView() {
  const [profiles, setProfiles] = useState<AuditorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auditor_profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Failed to load profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(p =>
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Denetçi Profilleri</h2>
          <p className="text-slate-600 mt-1">
            Ekip üyelerinin profil ve iletişim bilgileri
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={16} />
          Yeni Profil
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Denetçi ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Users size={16} />
            <span className="font-medium">{filteredProfiles.length} Denetçi</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
            <Users className="mx-auto text-slate-400 mb-4" size={48} />
            <p className="text-slate-600 font-medium">Henüz denetçi profili yok</p>
            <p className="text-slate-500 text-sm mt-2">İlk profili ekleyin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {profile.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{profile.full_name}</h3>
                    <p className="text-xs text-slate-500">{profile.title || 'Denetçi'}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  {profile.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate">{profile.email}</span>
                    </div>
                  )}
                  {profile.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} className="text-slate-400" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                </div>

                {profile.certifications && profile.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-slate-100">
                    {profile.certifications.slice(0, 3).map((cert, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded"
                      >
                        <Award size={10} />
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Toplam Denetçi</p>
              <p className="text-2xl font-bold text-slate-900">{profiles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Award className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Sertifikalı</p>
              <p className="text-2xl font-bold text-slate-900">
                {profiles.filter(p => p.certifications && p.certifications.length > 0).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Award className="text-amber-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-slate-600">Ort. Tecrübe</p>
              <p className="text-2xl font-bold text-slate-900">
                {profiles.length > 0
                  ? Math.round(profiles.reduce((sum, p) => sum + (p.years_of_experience || 0), 0) / profiles.length)
                  : 0} Yıl
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
