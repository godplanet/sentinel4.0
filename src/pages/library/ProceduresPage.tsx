import { PageHeader } from '@/shared/ui/PageHeader';
import { ClipboardList, CheckCircle, Folder, Clock } from 'lucide-react';

export default function ProceduresPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Prosedür Kütüphanesi"
        subtitle="Denetim prosedürleri ve test adımları"
        icon={ClipboardList}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Toplam Prosedür</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">426</p>
              <p className="text-sm text-slate-500 mt-1">Aktif prosedür</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Onaylı</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">398</p>
              <p className="text-sm text-slate-500 mt-1">Kullanıma hazır</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Folder className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Kategoriler</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">24</p>
              <p className="text-sm text-slate-500 mt-1">Ana kategori</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Gözden Geçirme</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">28</p>
              <p className="text-sm text-slate-500 mt-1">Güncelleme gerekli</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Prosedür Kütüphanesi</h2>
            <p className="text-slate-600">
              Bu sayfa standart denetim prosedürleri, test adımları ve özelleştirilebilir şablonları içerecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
