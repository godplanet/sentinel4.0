import { PageHeader } from '@/shared/ui/PageHeader';
import { Activity, BarChart3, Target, TrendingUp } from 'lucide-react';

export default function StrategicAnalysisPage() {
 return (
 <div className="flex flex-col h-full bg-canvas">
 <PageHeader
 title="Stratejik Analiz"
 subtitle="Stratejik görünüm ve analiz merkezi"
 icon={TrendingUp}
 />

 <div className="flex-1 p-4 overflow-auto">
 <div className="w-full px-4 sm:px-6 lg:px-6">
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
 <div className="bg-surface rounded-xl p-4 shadow-sm border border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 bg-blue-50 rounded-lg">
 <Target className="w-6 h-6 text-blue-600" />
 </div>
 <h3 className="font-semibold text-slate-700">Stratejik Hedefler</h3>
 </div>
 <p className="text-3xl font-bold text-primary">12</p>
 <p className="text-sm text-slate-500 mt-1">Aktif hedef</p>
 </div>

 <div className="bg-surface rounded-xl p-4 shadow-sm border border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 bg-green-50 rounded-lg">
 <Activity className="w-6 h-6 text-green-600" />
 </div>
 <h3 className="font-semibold text-slate-700">Risk Kapsamı</h3>
 </div>
 <p className="text-3xl font-bold text-primary">87%</p>
 <p className="text-sm text-slate-500 mt-1">Risk evreni kapsamı</p>
 </div>

 <div className="bg-surface rounded-xl p-4 shadow-sm border border-slate-200">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-3 bg-purple-50 rounded-lg">
 <BarChart3 className="w-6 h-6 text-purple-600" />
 </div>
 <h3 className="font-semibold text-slate-700">Plan Uyumu</h3>
 </div>
 <p className="text-3xl font-bold text-primary">94%</p>
 <p className="text-sm text-slate-500 mt-1">Yıllık plan uyum oranı</p>
 </div>
 </div>

 <div className="bg-surface rounded-xl p-5 shadow-sm border border-slate-200">
 <h2 className="text-xl font-bold text-slate-800 mb-4">Stratejik Analiz Merkezi</h2>
 <p className="text-slate-600">
 Bu sayfa stratejik görünüm, hedef takibi ve analiz araçlarını içerecektir.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
