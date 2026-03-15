import { PageHeader } from '@/shared/ui/PageHeader';
import { Building2, Leaf, Network, Users } from 'lucide-react';

export default function EcosystemPage() {
 return (
 <div className="flex flex-col h-full bg-canvas">
 <PageHeader
 title="Ekosistem Görünümü"
 subtitle="Denetim ekosistemi ve paydaş haritası"
 icon={Network}
 />

 <div className="flex-1 p-4 overflow-auto">
 <div className="w-full px-4 sm:px-4 lg:px-4">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
 <div className="bg-surface rounded-xl p-4 shadow-sm border border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 bg-blue-50 rounded-lg">
 <Building2 className="w-6 h-6 text-blue-600" />
 </div>
 <h3 className="font-semibold text-slate-700">Denetlenenler</h3>
 </div>
 <p className="text-3xl font-bold text-primary">24</p>
 <p className="text-sm text-slate-500 mt-1">Aktif denetlenen</p>
 </div>

 <div className="bg-surface rounded-xl p-4 shadow-sm border border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 bg-green-50 rounded-lg">
 <Users className="w-6 h-6 text-green-600" />
 </div>
 <h3 className="font-semibold text-slate-700">Tedarikçiler</h3>
 </div>
 <p className="text-3xl font-bold text-primary">156</p>
 <p className="text-sm text-slate-500 mt-1">TPRM kapsamında</p>
 </div>

 <div className="bg-surface rounded-xl p-4 shadow-sm border border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 bg-emerald-50 rounded-lg">
 <Leaf className="w-6 h-6 text-emerald-600" />
 </div>
 <h3 className="font-semibold text-slate-700">ESG Skorları</h3>
 </div>
 <p className="text-3xl font-bold text-primary">B+</p>
 <p className="text-sm text-slate-500 mt-1">Ortalama skor</p>
 </div>

 <div className="bg-surface rounded-xl p-4 shadow-sm border border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 bg-purple-50 rounded-lg">
 <Network className="w-6 h-6 text-purple-600" />
 </div>
 <h3 className="font-semibold text-slate-700">Bağlantılar</h3>
 </div>
 <p className="text-3xl font-bold text-primary">342</p>
 <p className="text-sm text-slate-500 mt-1">Toplam ilişki</p>
 </div>
 </div>

 <div className="bg-surface rounded-xl p-5 shadow-sm border border-slate-200">
 <h2 className="text-xl font-bold text-slate-800 mb-4">Ekosistem Haritası</h2>
 <p className="text-slate-600">
 Bu sayfa ekosistem görünümü, denetlenenler, tedarikçiler ve ESG verilerini içerecektir.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
