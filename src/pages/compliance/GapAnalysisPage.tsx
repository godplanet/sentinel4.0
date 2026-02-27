import { PageHeader } from '@/shared/ui/PageHeader';
import { Target, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

export default function GapAnalysisPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Gap Analizi"
        subtitle="Uyum açıkları ve iyileştirme planları"
        icon={Target}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Kritik Gap</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">8</p>
              <p className="text-sm text-slate-500 mt-1">Acil aksiyon gerekli</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Target className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Orta Öncelik</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">24</p>
              <p className="text-sm text-slate-500 mt-1">Planlama gerekli</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Kapatılan</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">142</p>
              <p className="text-sm text-slate-500 mt-1">Bu yıl</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-700">İlerleme</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">78%</p>
              <p className="text-sm text-slate-500 mt-1">Kapatma oranı</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Gap Analizi ve İyileştirme</h2>
            <p className="text-slate-600">
              Bu sayfa uyum açıklarının tespit edilmesi, önceliklendirilmesi ve kapatılması süreçlerini içerecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
