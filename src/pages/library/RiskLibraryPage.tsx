import { PageHeader } from '@/shared/ui/PageHeader';
import { Library, AlertTriangle, Shield, FileText } from 'lucide-react';

export default function RiskLibraryPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <PageHeader
        title="Risk Kütüphanesi"
        subtitle="Risk tanımları ve kontrol kütüphanesi"
        icon={Library}
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Risk Tanımları</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">248</p>
              <p className="text-sm text-slate-500 mt-1">Master library</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Kontroller</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">512</p>
              <p className="text-sm text-slate-500 mt-1">Kontrol aktivitesi</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-700">RCM Matrisleri</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">86</p>
              <p className="text-sm text-slate-500 mt-1">Risk-kontrol haritası</p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Library className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-700">Kategoriler</h3>
              </div>
              <p className="text-3xl font-bold text-slate-900">18</p>
              <p className="text-sm text-slate-500 mt-1">Risk kategorisi</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Risk ve Kontrol Kütüphanesi</h2>
            <p className="text-slate-600">
              Bu sayfa master risk tanımları, kontrol kütüphanesi ve risk-kontrol matrislerini içerecektir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
