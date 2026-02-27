import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui';
import { Users, Building, Mail, Phone, MessageCircle, Star } from 'lucide-react';
import { fetchStakeholders } from '@/entities/governance/api';
import type { Stakeholder } from '@/entities/governance/model/types';

const ENGAGEMENT_TYPES: Record<string, { label: string; color: string }> = {
  HIGH: { label: 'Yüksek', color: 'green' },
  MEDIUM: { label: 'Orta', color: 'amber' },
  LOW: { label: 'Düşük', color: 'red' },
};

const STAKEHOLDER_TYPES: Record<string, { label: string; color: string; icon: typeof Star }> = {
  EXECUTIVE: { label: 'Üst Yönetim', color: 'purple', icon: Star },
  REGULATOR: { label: 'Düzenleyici', color: 'red', icon: Building },
  SHAREHOLDER: { label: 'Hissedar', color: 'blue', icon: Building },
  EXTERNAL: { label: 'Harici', color: 'slate', icon: Users },
  CUSTOMER: { label: 'Müşteri', color: 'green', icon: Users },
  SUPPLIER: { label: 'Tedarikçi', color: 'amber', icon: Building },
};

export default function StakeholderManagementPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStakeholders();
  }, []);

  const loadStakeholders = async () => {
    try {
      const data = await fetchStakeholders();
      setStakeholders(data);
    } catch (error) {
      console.error('Failed to load stakeholders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeInfo = (type: string) => {
    return STAKEHOLDER_TYPES[type] || STAKEHOLDER_TYPES.EXTERNAL;
  };

  const getEngagementInfo = (level: string | null) => {
    return ENGAGEMENT_TYPES[level || 'MEDIUM'] || ENGAGEMENT_TYPES.MEDIUM;
  };
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="Paydaş Yönetimi"
        description="İç ve dış paydaşlarla etkileşim ve iletişim yönetimi"
        badge="MODÜL 3: YÖNETİŞİM & ETİK"
      />

      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Stakeholder Relationship Management</h3>
            <p className="text-slate-600 text-sm">
              Paydaş analizi ve iletişim haritaları ile etkileşim takibi yapın.
              Otomatik hatırlatıcılar, toplantı planları ve memnuniyet anketleri ile paydaş ilişkilerini güçlendirin.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Toplam Paydaş', value: stakeholders.length.toString(), icon: Users, color: 'blue' },
          { label: 'Üst Yönetim', value: stakeholders.filter(s => s.type === 'EXECUTIVE').length.toString(), icon: Star, color: 'purple' },
          { label: 'Düzenleyiciler', value: stakeholders.filter(s => s.type === 'REGULATOR').length.toString(), icon: Building, color: 'red' },
          { label: 'Yüksek Etkileşim', value: stakeholders.filter(s => s.influence_level === 'HIGH').length.toString(), icon: MessageCircle, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon size={20} className={`text-${stat.color}-600`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800 mb-1">{stat.value}</div>
            <div className="text-sm text-slate-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Paydaş Listesi
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Paydaş
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Departman
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Tip
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Etkileşim
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  Son İletişim
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase">
                  İletişim
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-600">
                    Yükleniyor...
                  </td>
                </tr>
              ) : stakeholders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-600">
                    Paydaş bulunamadı
                  </td>
                </tr>
              ) : (
                stakeholders.map((stakeholder) => {
                  const typeInfo = getTypeInfo(stakeholder.type);
                  const engagementInfo = getEngagementInfo(stakeholder.influence_level);
                  const TypeIcon = typeInfo.icon;

                  return (
                    <tr key={stakeholder.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {stakeholder.name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{stakeholder.name}</div>
                            <div className="text-sm text-slate-600">{stakeholder.contact_person || '-'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{stakeholder.organization || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 bg-${typeInfo.color}-100 text-${typeInfo.color}-700 rounded-full text-xs font-semibold inline-flex items-center gap-1`}>
                          <TypeIcon size={12} />
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 bg-${engagementInfo.color}-100 text-${engagementInfo.color}-700 rounded-full text-xs font-semibold`}>
                          {engagementInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {stakeholder.last_engagement_date
                          ? new Date(stakeholder.last_engagement_date).toLocaleDateString('tr-TR')
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {stakeholder.email && (
                            <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors group">
                              <Mail size={16} className="text-slate-400 group-hover:text-blue-600" />
                            </button>
                          )}
                          {stakeholder.phone && (
                            <button className="p-2 hover:bg-green-50 rounded-lg transition-colors group">
                              <Phone size={16} className="text-slate-400 group-hover:text-green-600" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Etkileşim Haritası</h3>
          <div className="space-y-4">
            {Object.entries(STAKEHOLDER_TYPES).map(([key, type]) => {
              const count = stakeholders.filter(s => s.type === key).length;
              const TypeIcon = type.icon;
              return (
                <div key={key} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${type.color}-100 flex items-center justify-center`}>
                      <TypeIcon size={20} className={`text-${type.color}-600`} />
                    </div>
                    <span className="font-semibold text-slate-800">{type.label}</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Yaklaşan Toplantılar</h3>
          <div className="space-y-3">
            {[
              { title: 'CFO ile Aylık Değerlendirme', date: '2024-02-15', attendees: 3 },
              { title: 'BDDK Uyum Toplantısı', date: '2024-02-20', attendees: 8 },
              { title: 'Risk Komitesi Sunumu', date: '2024-02-28', attendees: 12 },
            ].map((meeting, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{meeting.title}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {new Date(meeting.date).toLocaleDateString('tr-TR')} • {meeting.attendees} kişi
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
