import { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  TrendingUp,
  Award,
  Activity,
  Target,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
} from 'lucide-react';
import clsx from 'clsx';
import { QAIPReviewWidget } from '@/widgets/QAIPReview';
import { KPIGrid } from '@/widgets/dashboard/KPIGrid';
import type { DashboardKPI } from '@/entities/dashboard/model/types';

type TabId = 'internal' | 'kpi' | 'external';

const TABS: { id: TabId; label: string; icon: typeof FileCheck }[] = [
  { id: 'internal', label: 'İç Değerlendirme', icon: FileCheck },
  { id: 'kpi', label: 'KPI İzleme', icon: TrendingUp },
  { id: 'external', label: 'Dış Değerlendirme', icon: Award },
];

const KPI_DATA: DashboardKPI[] = [
  { id: '1', label: 'Denetim Tamamlama Oranı', value: '87%', trendValue: '+5%', trendDirection: 'up', trendColor: 'green' },
  { id: '2', label: 'Ortalama Denetim Süresi', value: '42 gün', trendValue: '-8 gün', trendDirection: 'down', trendColor: 'green' },
  { id: '3', label: 'Bulgu Çözüm Oranı', value: '73%', trendValue: '+12%', trendDirection: 'up', trendColor: 'green' },
  { id: '4', label: 'Aksiyon Zamanında Kapanma', value: '68%', trendValue: '-4%', trendDirection: 'down', trendColor: 'red' },
  { id: '5', label: 'Risk Kapsamı (Risk Coverage)', value: '92%', trendValue: '+3%', trendDirection: 'up', trendColor: 'green' },
  { id: '6', label: 'Paydaş Memnuniyeti', value: '4.3/5', trendValue: '+0.2', trendDirection: 'up', trendColor: 'green' },
  { id: '7', label: 'Ortalama Ekip Kullanım Oranı', value: '76%', trendValue: '0%', trendDirection: 'flat', trendColor: 'gray' },
  { id: '8', label: 'Rapor Kalite Skoru', value: '8.7/10', trendValue: '+0.5', trendDirection: 'up', trendColor: 'green' },
];

const EXTERNAL_REVIEWS = [
  { id: '1', reviewer: 'Deloitte Türkiye', type: 'External Quality Assessment (EQA)', date: '2023-11-15', status: 'completed', rating: 'Genel Olarak Uyumlu', findings: 3 },
  { id: '2', reviewer: 'Ernst & Young', type: 'ISO 27001 Denetimi', date: '2024-01-22', status: 'completed', rating: 'Sertifikalandırıldı', findings: 1 },
  { id: '3', reviewer: 'KPMG', type: 'QAIP Akran Değerlendirmesi', date: '2024-06-10', status: 'planned', rating: '-', findings: 0 },
];

const BENCHMARK_ITEMS = [
  { metric: 'Denetim Tamamlama Oranı', our: 87, sector: 82, unit: '%' },
  { metric: 'Ortalama Denetim Süresi', our: 42, sector: 55, unit: ' gün' },
  { metric: 'Bulgu Çözüm Oranı', our: 73, sector: 68, unit: '%' },
  { metric: 'Risk Kapsamı', our: 92, sector: 85, unit: '%' },
];

const IIA_STANDARDS = [
  { standard: 'Standart 1000: Amaç & Yetki', score: 9.2 },
  { standard: 'Standart 1100: Bağımsızlık', score: 8.8 },
  { standard: 'Standart 1200: Yeterlilik', score: 8.1 },
  { standard: 'Standart 2000: İç Denetim Yönetimi', score: 8.5 },
  { standard: 'Standart 2100: İşin Niteliği', score: 7.9 },
];

const STAT_CARDS = [
  { label: 'Toplam Denetim', value: '48', icon: Target, color: 'blue' },
  { label: 'Devam Eden', value: '12', icon: Clock, color: 'amber' },
  { label: 'Tamamlanan', value: '36', icon: CheckCircle2, color: 'green' },
  { label: 'Gecikmeli', value: '3', icon: Activity, color: 'red' },
];

const PREPARATION_CHECKLIST = [
  { item: 'QAIP dokümantasyonu güncellemesi', done: true },
  { item: 'İç değerlendirme raporları', done: true },
  { item: 'KPI raporları ve trend analizleri', done: false },
  { item: 'Denetim planı ve risk değerlendirmesi', done: false },
];

export default function QAIPPage() {
  const [activeTab, setActiveTab] = useState<TabId>('internal');

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">QAIP ve Kalite Güvence Merkezi</h1>
              <p className="text-sm text-slate-500 mt-0.5">
                GIAS 2024 standartlarına uygun sürekli kalite izleme paneli.
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                GIAS 2024
              </span>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                IIA Uyumlu
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 px-6">
            <div className="flex gap-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'flex items-center gap-2 px-5 py-3.5 font-medium text-sm transition-all relative',
                    activeTab === tab.id
                      ? 'text-emerald-700 border-b-2 border-emerald-600'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  )}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'internal' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <FileCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">QAIP Master — GIAS Standart 12.1</p>
                    <p className="text-sm text-emerald-700 mt-0.5">
                      Kalite Güvence ve İyileştirme Programı kapsamında denetim dosyalarının ve süreçlerinin kalite
                      standartlarına uygunluğunu sistematik olarak değerlendirin.
                    </p>
                  </div>
                </div>
                <QAIPReviewWidget />
              </div>
            )}

            {activeTab === 'kpi' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {STAT_CARDS.map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                      <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                        <stat.icon size={20} className={`text-${stat.color}-600`} />
                      </div>
                      <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Eğitim Tamamlama Oranı</p>
                    <p className="text-4xl font-bold text-emerald-600">%92</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rapor Gecikme Oranı</p>
                    <p className="text-4xl font-bold text-amber-600">%4</p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Saha Bulgu Kabul Oranı</p>
                    <p className="text-4xl font-bold text-blue-600">%88</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Activity size={16} className="text-blue-600" />
                      Ana Performans Göstergeleri (KPI)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">IIA Standartlarına uygun performans metrikleri</p>
                  </div>
                  <div className="p-6">
                    <KPIGrid kpis={KPI_DATA} />
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Sektör Karşılaştırması</h3>
                    <div className="space-y-4">
                      {BENCHMARK_ITEMS.map((item, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-medium text-slate-700">{item.metric}</span>
                            <span className="text-slate-500 text-xs">
                              Biz: <strong className="text-blue-600">{item.our}{item.unit}</strong>
                              {' | '}
                              Sektör: <strong className="text-slate-400">{item.sector}{item.unit}</strong>
                            </span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${item.our}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">IIA Uyum Skoru</h3>
                    <div className="text-center mb-5">
                      <div className="text-5xl font-bold text-emerald-600">8.4/10</div>
                      <div className="text-xs text-slate-500 mt-1">Uluslararası İç Denetim Standartları</div>
                    </div>
                    <div className="space-y-2.5">
                      {IIA_STANDARDS.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <span className="text-slate-600">{item.standard}</span>
                          <span className="font-bold text-blue-600">{item.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'external' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <Award className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Son Bağımsız Dış Değerlendirme</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      12 Kasım 2023 — Derece: <strong>Genel Olarak Uyumlu</strong>. IIA standartlarına göre her 5 yılda bir
                      Dış Kalite Değerlendirmesi (EQA) zorunludur.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: 'Tamamlanan Değerlendirme', value: '2', icon: CheckCircle2, color: 'green' },
                    { label: 'Planlanan Değerlendirme', value: '1', icon: Calendar, color: 'blue' },
                    { label: 'Takip Edilen Bulgu', value: '4', icon: AlertCircle, color: 'amber' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center flex-shrink-0`}>
                        <stat.icon size={20} className={`text-${stat.color}-600`} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                        <div className="text-sm text-slate-500">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileCheck size={16} className="text-blue-600" />
                      Dış Değerlendirmeler
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          {['Değerlendirici', 'Tip', 'Tarih', 'Durum', 'Sonuç', 'Bulgular'].map((h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {EXTERNAL_REVIEWS.map((review) => (
                          <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {review.reviewer[0]}
                                </div>
                                <span className="font-semibold text-slate-800 text-sm">{review.reviewer}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">{review.type}</td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {new Date(review.date).toLocaleDateString('tr-TR')}
                            </td>
                            <td className="px-6 py-4">
                              {review.status === 'completed' ? (
                                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
                                  Tamamlandı
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold">
                                  Planlandı
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-800">{review.rating}</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                                {review.findings} Bulgu
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Award size={16} className="text-amber-600" />
                      IIA Uyum Seviyeleri
                    </h3>
                    <div className="space-y-3">
                      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="font-bold text-emerald-800 text-sm mb-1">Genel Olarak Uyumlu (GC)</div>
                        <div className="text-xs text-emerald-700">En yüksek uyum seviyesi. IIA standartlarına tam uyum gösterir.</div>
                      </div>
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="font-bold text-amber-800 text-sm mb-1">Kısmen Uyumlu (PC)</div>
                        <div className="text-xs text-amber-700">Kısmi uyum. Bazı iyileştirmeler gerektirir.</div>
                      </div>
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="font-bold text-red-800 text-sm mb-1">Uyumsuz (DNC)</div>
                        <div className="text-xs text-red-700">Ciddi iyileştirmeler gereklidir.</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Users size={16} className="text-blue-600" />
                      Sonraki EQA Planı
                    </h3>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="font-bold text-blue-800 text-sm">2024 Q2 — KPMG Akran Değerlendirmesi</div>
                        <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">Planlandı</span>
                      </div>
                      <div className="text-xs text-blue-700 mb-1.5">
                        QAIP süreçlerimizin IIA standartlarına uygunluğu değerlendirilecek.
                      </div>
                      <div className="text-xs text-blue-600">Tarih: 10 Haziran 2024</div>
                    </div>
                    <div className="p-4 border border-slate-200 rounded-xl">
                      <div className="font-semibold text-slate-800 text-sm mb-3">Hazırlık Listesi</div>
                      <div className="space-y-2">
                        {PREPARATION_CHECKLIST.map((task, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm cursor-default">
                            <input
                              type="checkbox"
                              checked={task.done}
                              className="rounded border-slate-300 text-emerald-600"
                              readOnly
                            />
                            <span className={task.done ? 'text-slate-400 line-through' : 'text-slate-700'}>
                              {task.item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
