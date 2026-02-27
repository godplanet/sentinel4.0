import { PageHeader } from '@/shared/ui/PageHeader';
import { BookOpen, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegulationsPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Mevzuat Kütüphanesi"
        subtitle="Bankacılık mevzuatı ve düzenlemeler"
        icon={BookOpen}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Toplam Mevzuat</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">486</p>
              <p className="text-sm text-slate-500 mt-1">Aktif düzenleme</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Uyumlu</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">92%</p>
              <p className="text-sm text-slate-500 mt-1">Uyum oranı</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Bekleyen</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">24</p>
              <p className="text-sm text-slate-500 mt-1">İnceleme gerekli</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Güncellemeler</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">12</p>
              <p className="text-sm text-slate-500 mt-1">Son 30 gün</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Mevzuat Kütüphanesi</h2>
            <p className="text-slate-600">
              Bu sayfa BDDK, SPK, MASAK ve diğer düzenleyici otoritelerin mevzuatlarını içerecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
