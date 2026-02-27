import { PageHeader } from '@/shared/ui/PageHeader';
import { TrendingUp, BarChart3, LineChart, Activity } from 'lucide-react';

export default function MarketMonitoringPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Piyasa İzleme"
        subtitle="Piyasa riski ve finansal gösterge izleme"
        icon={TrendingUp}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Piyasa Değeri</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">8.2B</p>
              <p className="text-sm text-slate-500 mt-1">TRY</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <LineChart className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-700">VaR (95%)</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">124M</p>
              <p className="text-sm text-slate-500 mt-1">Günlük risk</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Volatilite</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">18.4%</p>
              <p className="text-sm text-slate-500 mt-1">30 günlük</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Activity className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Beta</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">1.24</p>
              <p className="text-sm text-slate-500 mt-1">Piyasa korelasyonu</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Piyasa Risk İzleme</h2>
            <p className="text-slate-600">
              Bu sayfa piyasa riski izleme, VaR hesaplamaları ve stress test sonuçlarını içerecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
