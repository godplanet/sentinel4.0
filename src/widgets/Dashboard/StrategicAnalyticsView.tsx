import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Shield,
  FileText,
  AlertCircle,
  Database,
  LayoutTemplate,
  Target,
  Layers,
} from 'lucide-react';
import { RiskSimulator } from '@/features/risk-scoring/ui/RiskSimulator';

export const StrategicAnalyticsView = () => {
  const quickAccessCards = [
    {
      title: 'Risk Kütüphanesi (RKM)',
      description: 'Kurumsal risk kataloğu ve değerlendirme merkezi',
      icon: Shield,
      path: '/rkm-library',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Stratejik Yönetim',
      description: 'Kurumsal hedefler ve denetim stratejisi uyumu',
      icon: Target,
      path: '/strategy',
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Denetim Evreni',
      description: 'Hiyerarşik risk haritası ve entity grafiği',
      icon: Layers,
      path: '/universe',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Çalışma Kağıtları',
      description: 'Denetim icrası ve workpaper yönetimi',
      icon: FileText,
      path: '/audit-workspace',
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
    },
    {
      title: 'Bulgu Yönetimi',
      description: 'Tespit edilen bulgular ve aksiyon takibi',
      icon: AlertCircle,
      path: '/findings',
      color: 'from-rose-500 to-red-600',
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
    },
  ];

  const adminCards = [
    {
      title: 'Şablon Yöneticisi',
      description: 'Dinamik form şablonları (RKM, Bulgu, Aksiyon)',
      icon: LayoutTemplate,
      path: '/settings/templates',
      color: 'from-indigo-500 to-blue-600',
    },
    {
      title: 'Risk Metodolojisi',
      description: 'Risk ağırlıkları ve hesaplama parametreleri',
      icon: Database,
      path: '/settings/risk',
      color: 'from-violet-500 to-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative neon-border-blue group">
          <div className="relative z-10 glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Toplam Risk</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">247</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative neon-border-emerald group">
          <div className="relative z-10 glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Aktif Denetim</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">12</p>
              </div>
              <div className="rounded-full bg-emerald-100 p-3">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative neon-border-orange group">
          <div className="relative z-10 glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Açık Bulgu</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">38</p>
              </div>
              <div className="rounded-full bg-rose-100 p-3">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="relative neon-border-purple group">
          <div className="relative z-10 glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Plan Uyum</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">94%</p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Hızlı Erişim</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickAccessCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="group relative overflow-hidden rounded-xl glass-card p-6 transition-all hover:-translate-y-1"
              >
                <div
                  className={`absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${card.color} opacity-10 transition-transform group-hover:scale-150`}
                />

                <div className="relative">
                  <div className={`inline-flex rounded-lg ${card.bgColor} p-3`}>
                    <Icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{card.description}</p>

                  <div className={`mt-4 inline-flex items-center text-sm font-medium ${card.textColor}`}>
                    Aç
                    <svg
                      className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Risk Simülatörü</h2>
        <RiskSimulator />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">Yönetim Araçları</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.path}
                to={card.path}
                className="group relative overflow-hidden rounded-xl glass-card p-6 transition-all hover:-translate-y-1"
              >
                <div
                  className={`absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-gradient-to-br ${card.color} opacity-10 transition-transform group-hover:scale-150`}
                />

                <div className="relative flex items-start gap-4">
                  <div className="rounded-lg bg-slate-100 p-3">
                    <Icon className="h-6 w-6 text-slate-700" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-slate-900">{card.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">{card.description}</p>
                  </div>

                  <svg
                    className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
