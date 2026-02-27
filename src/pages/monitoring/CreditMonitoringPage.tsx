import { PageHeader } from '@/shared/ui/PageHeader';
import { CreditCard, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

export default function CreditMonitoringPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Kredi İzleme"
        subtitle="Kredi portföyü ve risk izleme sistemi"
        icon={CreditCard}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Toplam Portföy</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">2.4B</p>
              <p className="text-sm text-slate-500 mt-1">TRY</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Sağlıklı Krediler</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">92%</p>
              <p className="text-sm text-slate-500 mt-1">Portföy oranı</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Risk Altında</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">8%</p>
              <p className="text-sm text-slate-500 mt-1">İzleme gerekli</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-700">NPL Oranı</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">3.2%</p>
              <p className="text-sm text-slate-500 mt-1">Sorunlu alacaklar</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Kredi İzleme Sistemi</h2>
            <p className="text-slate-600">
              Bu sayfa kredi portföyü izleme, risk analizi ve erken uyarı sistemlerini içerecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
