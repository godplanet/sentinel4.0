import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import {
  Globe,
  Key,
  Webhook,
  Mail,
  Database,
  Cloud,
  CheckCircle2,
  XCircle,
  Settings,
  Copy,
  Eye,
  EyeOff,
  Plus,
  AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';

interface Integration {
  id: string;
  name: string;
  type: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  icon: any;
  color: string;
  lastSync?: string;
  config?: Record<string, any>;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'sap',
    name: 'SAP ERP',
    type: 'erp',
    description: 'Mali veriler, satın alma süreçleri ve organizasyon yapısı entegrasyonu',
    status: 'inactive',
    icon: Database,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'ldap',
    name: 'Active Directory (LDAP)',
    type: 'identity',
    description: 'Kullanıcı kimlik doğrulama ve organizasyon hiyerarşisi senkronizasyonu',
    status: 'inactive',
    icon: Globe,
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'smtp',
    name: 'E-posta Sunucusu (SMTP)',
    type: 'email',
    description: 'Otomatik bildirimler, rapor gönderimi ve kullanıcı iletişimi',
    status: 'active',
    icon: Mail,
    color: 'from-purple-500 to-purple-600',
    lastSync: new Date().toISOString(),
  },
  {
    id: 'webhook',
    name: 'Webhook Entegrasyonları',
    type: 'webhook',
    description: 'Harici sistemlere gerçek zamanlı olay bildirimleri',
    status: 'active',
    icon: Webhook,
    color: 'from-amber-500 to-amber-600',
    lastSync: new Date().toISOString(),
  },
  {
    id: 'cloud-storage',
    name: 'Cloud Storage',
    type: 'storage',
    description: 'Belge ve kanıt dosyaları için bulut depolama entegrasyonu',
    status: 'inactive',
    icon: Cloud,
    color: 'from-cyan-500 to-cyan-600',
  },
];

export default function IntegrationsPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeys] = useState([
    { id: '1', name: 'Production API Key', key: 'sk_live_abc123...xyz789', created: '2024-01-15', lastUsed: '2 dakika önce' },
    { id: '2', name: 'Development API Key', key: 'sk_test_def456...uvw012', created: '2024-02-10', lastUsed: '5 gün önce' },
  ]);

  const formatLastSync = (dateString?: string) => {
    if (!dateString) return 'Hiç senkronize edilmedi';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    return date.toLocaleString('tr-TR');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API key kopyalandı');
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Entegrasyon"
        description="Kurumsal sistemler ile API entegrasyonları (SAP, LDAP, E-posta)"
        badge="MODÜL 8: AYARLAR"
      />

      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Edge Functions ile Güvenli Bağlantı</h3>
            <p className="text-slate-600 text-sm">
              Sentinel, Supabase Edge Functions ile harici sistemlere güvenli bağlantı ve veri senkronizasyonu sağlar.
              API anahtarları ve hassas bilgiler backend'de saklanır, asla frontend'e iletilmez.
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Database size={20} className="text-blue-600" />
              Sistem Entegrasyonları
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Kurumsal sistemlerle veri alışverişi ve senkronizasyon
            </p>
          </div>
          <div className="p-6 space-y-4">
            {INTEGRATIONS.map((integration) => {
              const Icon = integration.icon;
              return (
                <button
                  key={integration.id}
                  onClick={() => setSelectedIntegration(integration)}
                  className={clsx(
                    'w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:shadow-md',
                    selectedIntegration?.id === integration.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className={clsx('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0', integration.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-800">{integration.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{integration.type.toUpperCase()}</div>
                  </div>
                  <div>
                    {integration.status === 'active' ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        <CheckCircle2 size={12} />
                        Aktif
                      </div>
                    ) : integration.status === 'error' ? (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                        <XCircle size={12} />
                        Hata
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                        <XCircle size={12} />
                        Pasif
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Settings size={20} className="text-purple-600" />
              Entegrasyon Detayları
            </h2>
          </div>
          <div className="p-6">
            {selectedIntegration ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className={clsx('w-16 h-16 rounded-xl bg-gradient-to-br flex items-center justify-center', selectedIntegration.color)}>
                    <selectedIntegration.icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedIntegration.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{selectedIntegration.description}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">Durum</span>
                    {selectedIntegration.status === 'active' ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        <CheckCircle2 size={14} />
                        Aktif
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold">
                        <XCircle size={14} />
                        Pasif
                      </div>
                    )}
                  </div>
                  {selectedIntegration.lastSync && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-slate-600">Son Senkronizasyon</span>
                      <span className="text-sm text-slate-800">{formatLastSync(selectedIntegration.lastSync)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">Tip</span>
                    <span className="text-sm text-slate-800 uppercase font-mono">{selectedIntegration.type}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-700">Yapılandırma</h4>
                  <div className="space-y-2">
                    {selectedIntegration.id === 'smtp' && (
                      <>
                        <input
                          type="text"
                          placeholder="SMTP Sunucusu (smtp.gmail.com)"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="number"
                          placeholder="Port (587)"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="email"
                          placeholder="Gönderen E-posta"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="password"
                          placeholder="Şifre"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    )}
                    {selectedIntegration.id === 'sap' && (
                      <>
                        <input
                          type="text"
                          placeholder="SAP Host URL"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Client ID"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="System Number"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    )}
                    {selectedIntegration.id === 'ldap' && (
                      <>
                        <input
                          type="text"
                          placeholder="LDAP Server (ldap://ad.company.com)"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Base DN (DC=company,DC=com)"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Bind DN"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    )}
                    {selectedIntegration.id === 'webhook' && (
                      <>
                        <input
                          type="url"
                          placeholder="Webhook URL"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          placeholder="Secret Token"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold">
                    Bağlantıyı Test Et
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Kaydet
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>Not:</strong> Entegrasyon ayarları backend'de güvenli bir şekilde saklanır ve
                    Supabase Edge Functions ile işlenir.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Database className="mx-auto text-slate-300 mb-4" size={64} />
                <p className="text-slate-600 font-medium">Bir entegrasyon seçin</p>
                <p className="text-slate-500 text-sm mt-2">
                  Soldan bir entegrasyon seçerek detaylarını görüntüleyin ve yapılandırın
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Key size={20} className="text-green-600" />
              API Anahtarları
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Harici sistemler için API erişim anahtarları
            </p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold shadow-sm">
            <Plus size={18} />
            Yeni API Key
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <Key className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{key.name}</div>
                  <div className="text-sm text-slate-600 font-mono mt-1">
                    {showApiKey ? key.key : '••••••••••••••••••••••••••••'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Oluşturuldu: {key.created} • Son kullanım: {key.lastUsed}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {showApiKey ? <EyeOff size={18} className="text-slate-600" /> : <Eye size={18} className="text-slate-600" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(key.key)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Copy size={18} className="text-blue-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
