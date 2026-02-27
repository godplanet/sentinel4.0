import { useState, useEffect } from 'react';
import { supabase } from '@/shared/api/supabase';
import { GraduationCap, Award, Plus } from 'lucide-react';
import { SkillMatrix } from '@/widgets/SkillMatrix';
import clsx from 'clsx';

interface CPERecord {
  id: string;
  user_id: string;
  activity_name: string;
  cpe_points: number;
  completion_date: string;
}

type SubTab = 'matrix' | 'cpe';

export function TalentMatrixView() {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('matrix');
  const [cpeRecords, setCpeRecords] = useState<CPERecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeSubTab === 'cpe') {
      loadCPERecords();
    }
  }, [activeSubTab]);

  const loadCPERecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cpe_records')
        .select('*')
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setCpeRecords(data || []);
    } catch (error) {
      console.error('Failed to load CPE records:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Yetenek Matrisi</h2>
        <p className="text-slate-600 mt-1">
          Ekip yetkinlikleri, sertifikalar ve eğitim takibi
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveSubTab('matrix')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                activeSubTab === 'matrix'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <GraduationCap size={16} />
              Yetenek Matrisi
            </button>
            <button
              onClick={() => setActiveSubTab('cpe')}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                activeSubTab === 'cpe'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Award size={16} />
              Eğitim (CPE)
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeSubTab === 'matrix' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                  <GraduationCap size={20} className="text-blue-600" />
                  Denetçi Yetenek Matrisi
                </h3>
                <p className="text-slate-600 text-sm">
                  Ekip üyelerinin yetkinlik ve sertifika bilgileri.
                </p>
              </div>
              <SkillMatrix />
            </div>
          )}

          {activeSubTab === 'cpe' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
                    <Award size={20} className="text-green-600" />
                    Sürekli Mesleki Eğitim (CPE)
                  </h3>
                  <p className="text-slate-600 text-sm">
                    Denetçilerin katıldığı eğitimler ve kazanılan CPE puanları.
                  </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                  <Plus size={16} />
                  CPE Ekle
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : cpeRecords.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                  <Award className="mx-auto text-slate-400 mb-4" size={48} />
                  <p className="text-slate-600 font-medium">Henüz CPE kaydı yok</p>
                  <p className="text-slate-500 text-sm mt-2">İlk eğitim kaydınızı ekleyin</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Eğitim Adı</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">CPE Puanı</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Tamamlanma</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cpeRecords.map((record) => (
                        <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4 text-sm text-slate-900">{record.activity_name}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                              <Award size={12} />
                              {record.cpe_points}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {new Date(record.completion_date).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Award className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Toplam CPE</p>
                      <p className="text-2xl font-bold text-green-900">
                        {cpeRecords.reduce((sum, r) => sum + r.cpe_points, 0)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <GraduationCap className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Tamamlanan</p>
                      <p className="text-2xl font-bold text-blue-900">{cpeRecords.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Award className="text-amber-600" size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-amber-700 font-medium">Ort. Puan</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {cpeRecords.length > 0
                          ? Math.round(cpeRecords.reduce((sum, r) => sum + r.cpe_points, 0) / cpeRecords.length)
                          : 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
