import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui';
import { Building2, TrendingUp, AlertTriangle, CheckCircle2, Calendar, FileText, Users } from 'lucide-react';
import { fetchBoardMembers } from '@/entities/governance/api';
import type { BoardMember } from '@/entities/governance/model/types';

const BOARD_MEETINGS = [
  {
    id: '1',
    title: 'Q1 2024 Yönetim Kurulu Sunumu',
    date: '2024-03-25',
    status: 'completed',
    attendees: 12,
    topics: ['Denetim Plan Durum', 'Kritik Bulgular', 'Risk Haritası'],
  },
  {
    id: '2',
    title: 'Q2 2024 İç Denetim Raporu',
    date: '2024-06-20',
    status: 'planned',
    attendees: 12,
    topics: ['Yıllık Değerlendirme', 'EQA Hazırlık', 'Kaynak Planı'],
  },
];

export default function BoardReportingPage() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBoardMembers();
  }, []);

  const loadBoardMembers = async () => {
    try {
      const data = await fetchBoardMembers();
      setBoardMembers(data);
    } catch (error) {
      console.error('Failed to load board members:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="p-8 space-y-6">
      <PageHeader
        title="YK Raporlama"
        description="Yönetim Kurulu'na sunulan raporlar ve stratejik bilgilendirme"
        badge="MODÜL 3: YÖNETİŞİM & ETİK"
      />

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">AI-Powered Executive Summaries</h3>
            <p className="text-slate-600 text-sm">
              Sentinel, Yönetim Kurulu sunumlarını otomatik olarak hazırlar. AI destekli özet raporlar,
              trend analizleri ve risk haritaları ile stratejik kararları destekler.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: 'Toplam Sunum', value: '8', icon: FileText, color: 'blue' },
          { label: 'Açık Kritik Bulgu', value: '4', icon: AlertTriangle, color: 'red' },
          { label: 'Kapanma Oranı', value: '87%', icon: CheckCircle2, color: 'green' },
          { label: 'Risk Skoru', value: '72/100', icon: TrendingUp, color: 'amber' },
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
            <Calendar size={20} className="text-blue-600" />
            Yönetim Kurulu Toplantıları
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {BOARD_MEETINGS.map((meeting) => (
            <div key={meeting.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center text-white shrink-0">
                <div className="text-xs font-bold">{new Date(meeting.date).toLocaleDateString('tr-TR', { month: 'short' }).toUpperCase()}</div>
                <div className="text-2xl font-bold">{new Date(meeting.date).getDate()}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold text-slate-800">{meeting.title}</h3>
                  {meeting.status === 'completed' ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                      Tamamlandı
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      Planlandı
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-600 mb-2">
                  {meeting.attendees} katılımcı • {new Date(meeting.date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {meeting.topics.map((topic, i) => (
                    <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Önümüzdeki Sunumlar</h3>
          <div className="space-y-3">
            {[
              { title: 'Q2 Risk Güncellemesi', date: '15 Nisan 2024', status: 'draft' },
              { title: 'Siber Güvenlik Raporu', date: '22 Mayıs 2024', status: 'pending' },
              { title: 'BDDK Uyum Raporu', date: '10 Haziran 2024', status: 'pending' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">{item.title}</div>
                  <div className="text-xs text-slate-600 mt-1">{item.date}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  item.status === 'draft' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  {item.status === 'draft' ? 'Taslak' : 'Bekliyor'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Standart Rapor Şablonları</h3>
          <div className="space-y-2">
            {[
              'Üç Aylık İç Denetim Raporu',
              'Yıllık Risk Değerlendirmesi',
              'Stratejik Plan Uyum Raporu',
              'QAIP Performans Raporu',
              'Kritik Bulgu Özet Raporu',
            ].map((template, i) => (
              <button key={i} className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{template}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users size={20} className="text-purple-600" />
            Yönetim Kurulu Üyeleri
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-600">Yükleniyor...</div>
          ) : boardMembers.length === 0 ? (
            <div className="text-center py-8 text-slate-600">Yönetim Kurulu üyesi bulunamadı</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boardMembers.map((member) => (
                <div key={member.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold shrink-0">
                      {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">{member.full_name}</div>
                      <div className="text-sm text-slate-600 truncate">{member.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{member.role}</div>
                      {member.is_independent && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                          Bağımsız
                        </span>
                      )}
                      {member.committees && member.committees.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {member.committees.slice(0, 2).map((committee, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs truncate">
                              {committee}
                            </span>
                          ))}
                          {member.committees.length > 2 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-xs">
                              +{member.committees.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
