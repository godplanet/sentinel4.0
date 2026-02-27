import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui';
import { fetchSystemParameters } from '@/entities/settings/api';
import { Settings, Database, Users as UsersIcon, FileText, Palette, Radio, RefreshCcw, AlertTriangle, ClipboardCheck } from 'lucide-react';
import clsx from 'clsx';
import { SidebarColorPicker } from '@/features/theme-switcher';
import { DataSignalsPanel } from '@/widgets/DataSignals';
import { UniversalSeeder } from '@/shared/data/seed';
import { SurveyBuilder } from '@/features/survey/components/SurveyBuilder';

type TabKey = 'parameters' | 'signals' | 'appearance' | 'users' | 'logs' | 'surveys';

const TABS = [
  { key: 'parameters' as TabKey, label: 'Sistem Parametreleri', icon: Database },
  { key: 'signals' as TabKey, label: 'Entegrasyon & Sinyaller', icon: Radio },
  { key: 'surveys' as TabKey, label: 'Anket Tasarımı', icon: ClipboardCheck },
  { key: 'appearance' as TabKey, label: 'Gorunum', icon: Palette },
  { key: 'users' as TabKey, label: 'Kullanici Yonetimi', icon: UsersIcon },
  { key: 'logs' as TabKey, label: 'Sistem Loglari', icon: FileText },
];

interface SystemParameter {
  key: string;
  value: any;
  description: string;
  category: string;
}

export default function SettingsConsolidatedPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('parameters');
  const [parameters, setParameters] = useState<SystemParameter[]>([]);
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (activeTab === 'parameters') {
      loadParameters();
    }
  }, [activeTab]);

  const loadParameters = async () => {
    try {
      setLoading(true);
      const data = await fetchSystemParameters();
      setParameters(data);
    } catch (error) {
      console.error('Failed to load parameters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFactoryReset = async () => {
    const confirmed = window.confirm(
      '⚠️ TEHLİKELİ İŞLEM!\n\n' +
      'Tüm veriler silinecek ve varsayılan demo veriler yüklenecek.\n\n' +
      '• Tüm bulgular silinecek\n' +
      '• Tüm denetimler silinecek\n' +
      '• Tüm riskler silinecek\n' +
      '• Tüm aksiyonlar silinecek\n\n' +
      'Bu işlem geri alınamaz. Emin misiniz?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsResetting(true);
      console.log('🔄 Factory Reset başlatılıyor...');

      localStorage.removeItem('sentinel_data_seeded');

      console.log('🌱 Demo veriler yeniden yükleniyor...');
      await UniversalSeeder.seed();

      console.log('✅ Sistem fabrika ayarlarına döndürüldü!');

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Factory Reset hatası:', error);
      alert('Sistem sıfırlama sırasında bir hata oluştu. Lütfen konsolu kontrol edin.');
      setIsResetting(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Sistem Ayarları"
        subtitle="Parametre Yönetimi, Kullanıcılar ve Sistem Logları"
        icon={Settings}
      />

      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'parameters' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Database size={20} className="text-blue-600" />
              Sistem Parametreleri
            </h3>
            <p className="text-slate-600 mb-6">
              Risk ağırlıkları, derecelendirme eşikleri ve iş akışı kuralları.
            </p>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {['risk', 'grading', 'workflow', 'notifications'].map((category) => {
                  const categoryParams = parameters.filter((p) => p.category === category);
                  if (categoryParams.length === 0) return null;

                  const categoryLabels: Record<string, string> = {
                    risk: 'Risk Değerlendirme',
                    grading: 'Derecelendirme',
                    workflow: 'İş Akışı',
                    notifications: 'Bildirimler',
                  };

                  return (
                    <div key={category} className="border border-slate-200 rounded-lg p-4">
                      <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        {categoryLabels[category] || category}
                      </h4>
                      <div className="space-y-3">
                        {categoryParams.map((param) => (
                          <div key={param.key} className="flex items-start justify-between p-3 bg-slate-50 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-slate-900 text-sm mb-1">{param.key}</p>
                              <p className="text-xs text-slate-600">{param.description}</p>
                            </div>
                            <div className="ml-4 px-3 py-1 bg-white border border-slate-200 rounded font-mono text-xs text-slate-700">
                              {typeof param.value === 'object'
                                ? JSON.stringify(param.value).substring(0, 50) + '...'
                                : String(param.value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}

                <div className="border-2 border-red-200 bg-red-50 rounded-lg p-6 mt-8">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle className="text-red-600 mt-0.5" size={24} />
                    <div className="flex-1">
                      <h4 className="font-bold text-red-900 text-lg mb-2">Tehlike Bölgesi</h4>
                      <p className="text-red-800 text-sm mb-4">
                        Bu alan geri alınamaz sistem işlemlerini içerir. Dikkatli olun.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-900 mb-2">Fabrika Ayarlarına Dön</h5>
                        <p className="text-sm text-slate-600 mb-3">
                          Tüm verileri sil ve temiz demo verilerini yeniden yükle.
                        </p>
                        <ul className="text-xs text-slate-500 space-y-1 mb-4">
                          <li>• 50 Bulgu (Demo data)</li>
                          <li>• 15 Denetim (2026 Annual Plan)</li>
                          <li>• 61 Entite (HQ + 10 Dept + 50 Branches)</li>
                          <li>• 50 Risk Tanımı ve Değerlendirmesi</li>
                          <li>• 30 Aksiyon Planı</li>
                          <li>• 100 Çalışma Kağıdı</li>
                          <li>• 200+ Zaman Kaydı</li>
                          <li>• Tüm ilişkili veriler</li>
                        </ul>
                      </div>
                      <button
                        onClick={handleFactoryReset}
                        disabled={isResetting}
                        className={clsx(
                          'flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all',
                          isResetting
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md'
                        )}
                      >
                        {isResetting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Sıfırlanıyor...
                          </>
                        ) : (
                          <>
                            <RefreshCcw size={16} />
                            Sistemi Sıfırla
                          </>
                        )}
                      </button>
                    </div>

                    {isResetting && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium">
                          🌱 Demo veriler yükleniyor... Lütfen bekleyin.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <DataSignalsPanel />
          </div>
        )}

        {activeTab === 'surveys' && (
          <div className="rounded-lg shadow-sm border border-slate-200 overflow-hidden" style={{ height: '75vh' }}>
            <SurveyBuilder
              onSave={() => {}}
              onCancel={() => setActiveTab('parameters')}
            />
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Palette size={20} className="text-purple-600" />
              Görünüm Ayarları
            </h3>
            <p className="text-slate-600 mb-6">
              Sidebar rengi ve tema ayarlarını özelleştirin.
            </p>
            <div className="max-w-2xl">
              <SidebarColorPicker />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <UsersIcon size={20} className="text-green-600" />
              Kullanıcı ve Rol Yönetimi
            </h3>
            <p className="text-slate-600 mb-4">
              Denetçiler, yöneticiler ve sistem kullanıcılarının yönetimi.
            </p>
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <UsersIcon className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 font-medium">Kullanıcı Yönetimi Modülü Hazırlanıyor</p>
              <p className="text-slate-500 text-sm mt-2">Yakında kullanıma açılacak</p>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-purple-600" />
              Sistem İşlem Logları
            </h3>
            <p className="text-slate-600 mb-4">
              Kullanıcı aktiviteleri ve sistem değişikliklerinin kaydı.
            </p>
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
              <FileText className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 font-medium">Log Modülü Hazırlanıyor</p>
              <p className="text-slate-500 text-sm mt-2">Yakında kullanıma açılacak</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
