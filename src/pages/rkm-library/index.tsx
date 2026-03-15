import { useRiskLibraryStore } from '@/entities/risk';
import { fetchRkmCategoriesWithStats, fetchRkmRisksForGrid, fetchRkmTotalRiskCount, importRisksFromExcel } from '@/entities/rkm/api';
import { ExcelImportModal } from '@/features/excel-import/ExcelImportModal';
import { AdHocRiskWizard } from '@/features/risk-engine/AdHocRiskWizard';
import { RKMWizard } from '@/features/rkm-library/ui/RKMWizard';
import { RiskCardGrid } from '@/features/rkm-library/ui/RiskCardGrid';
import { exportRKMToExcel } from '@/shared/lib/excel-utils';
import { PageHeader } from '@/shared/ui';
import { RKMLibrary } from '@/widgets/RKMLibrary';
import { RKMMasterGrid } from '@/widgets/RKMMasterGrid';
import { RiskNetworkLoader } from '@/widgets/RiskNetwork/RiskNetworkLoader';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import {
 AlertTriangle,
 CreditCard,
 Database,
 Download,
 Layers,
 LayoutGrid,
 List,
 Network,
 Plus,
 Shield,
 Table2,
 TrendingUp,
 Upload,
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';


type ViewMode = 'overview' | 'library' | 'master-grid' | 'network' | 'cards';

const categoryIcons: Record<string, any> = {
 'PR-KF-00': { icon: Layers, color: 'from-blue-600 to-blue-700' },
 'PR-FK-00': { icon: TrendingUp, color: 'from-emerald-600 to-teal-600' },
 'PR-MH-00': { icon: Database, color: 'from-slate-600 to-slate-700' },
 'PR-BK-00': { icon: Shield, color: 'from-orange-600 to-red-600' },
 'PR-FR-00': { icon: AlertTriangle, color: 'from-cyan-600 to-blue-600' },
 'PR-OS-00': { icon: Layers, color: 'from-green-600 to-emerald-600' },
 'PR-HZ-00': { icon: TrendingUp, color: 'from-amber-600 to-orange-600' },
 'PR-DG-00': { icon: Database, color: 'from-slate-600 to-slate-700' },
};

export default function RkmLibraryPage() {
 const queryClient = useQueryClient();
 const [viewMode, setViewMode] = useState<ViewMode>('overview');
 const [showAdHocWizard, setShowAdHocWizard] = useState(false);
 const [showExcelImport, setShowExcelImport] = useState(false);
 const [showRkmWizard, setShowRkmWizard] = useState(false);
 const { risks, deleteRisk } = useRiskLibraryStore();

 const { data: totalRisks = 0 } = useQuery({
 queryKey: ['rkm-total-risk-count'],
 queryFn: fetchRkmTotalRiskCount,
 });

 const { data: categories = [], isLoading: loading } = useQuery({
 queryKey: ['rkm-categories-with-stats'],
 queryFn: () => fetchRkmCategoriesWithStats(),
 });

 const viewTabs = [
 { id: 'overview' as const, label: 'Genel Bakış', icon: LayoutGrid },
 { id: 'library' as const, label: 'Kütüphane', icon: List },
 { id: 'cards' as const, label: 'Kart Görünümü', icon: CreditCard },
 { id: 'master-grid' as const, label: 'Master Grid', icon: Table2 },
 { id: 'network' as const, label: 'Risk Ağı', icon: Network },
 ];

 return (
 <div className="space-y-4">
 <PageHeader
 title="Risk Kontrol Matrisi (RKM) Kutuphanesi"
 description="Süreç Bazlı Risk Kontrol Matrisi Yönetimi"
 icon={Database}
 action={
 <div className="flex items-center gap-3">
 <button
 onClick={async () => {
 try {
 const data = await fetchRkmRisksForGrid();
 exportRKMToExcel(data);
 toast.success(data.length ? `${data.length} risk Excel olarak indirildi.` : 'Şablon indirildi. Doldurup Excel Import ile yükleyebilirsiniz.');
 } catch (e) {
 toast.error((e as Error).message || 'İndirme başarısız.');
 }
 }}
 className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
 >
 <Download size={14} />
 Excel İndir
 </button>
 <button
 onClick={() => setShowExcelImport(true)}
 className="flex items-center gap-2 px-3 py-2 bg-surface border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-canvas transition-colors"
 >
 <Upload size={14} />
 Excel Import
 </button>
 <button
 onClick={() => setShowRkmWizard(true)}
 className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
 >
 <Plus size={14} />
 Yeni Risk Ekle
 </button>
 <button
 onClick={() => setShowAdHocWizard(true)}
 className="flex items-center gap-2 px-3 py-2 bg-surface border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-canvas transition-colors"
 >
 <Plus size={14} />
 Ad-Hoc Risk
 </button>
 <div className="flex items-center bg-surface border border-slate-200 rounded-lg p-1">
 {(viewTabs || []).map((tab) => {
 const Icon = tab.icon;
 return (
 <button
 key={tab.id}
 onClick={() => setViewMode(tab.id)}
 className={clsx(
 'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all',
 viewMode === tab.id
 ? 'bg-blue-600 text-white shadow-sm'
 : 'text-slate-600 hover:bg-slate-100'
 )}
 >
 <Icon size={14} />
 {tab.label}
 </button>
 );
 })}
 </div>
 </div>
 }
 />

 {viewMode === 'overview' && (
 <>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="bg-surface rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-2">
 <div className="text-xs uppercase text-slate-600 font-bold tracking-wider">Toplam Risk</div>
 <Shield size={20} className="text-slate-400" />
 </div>
 <div className="text-3xl font-bold text-primary">{totalRisks}</div>
 <p className="text-xs text-slate-500 mt-1">Tum surecler</p>
 </div>
 <div className="bg-surface rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-2">
 <div className="text-xs uppercase text-slate-600 font-bold tracking-wider">Surec Kategorisi</div>
 <Layers size={20} className="text-slate-400" />
 </div>
 <div className="text-3xl font-bold text-primary">{categories.length}</div>
 <p className="text-xs text-slate-500 mt-1">Ana kategori</p>
 </div>
 <div className="bg-surface rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
 <div className="flex items-center justify-between mb-2">
 <div className="text-xs uppercase text-red-600 font-bold tracking-wider">Kritik Riskler</div>
 <AlertTriangle size={20} className="text-red-500" />
 </div>
 <div className="text-3xl font-bold text-red-700">
 {Array.isArray(categories) ? (categories || []).reduce((sum, cat) => sum + (cat?.critical_risks || 0), 0) : 0}
 </div>
 <p className="text-xs text-red-500 mt-1">Acil mudahale gerekli</p>
 </div>
 </div>

 <div>
 <h2 className="text-lg font-bold text-primary mb-4">Ana Surec Kategorileri</h2>
 {loading ? (
 <div className="text-center py-12 text-slate-500">Yukleniyor...</div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 {Array.isArray(categories) && (categories || []).filter(Boolean).map((category) => {
 const iconConfig = categoryIcons[category.process_code] || { icon: Database, color: 'from-slate-600 to-slate-700' };
 const Icon = iconConfig.icon;
 return (
 <button
 key={category.id}
 onClick={() => setViewMode('library')}
 className="group relative overflow-hidden bg-surface border border-slate-200 rounded-2xl p-4 text-left hover:shadow-xl transition-all hover:-translate-y-1"
 >
 <div className={`w-14 h-14 bg-gradient-to-br ${iconConfig.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
 <Icon className="text-white" size={28} />
 </div>
 <h3 className="text-base font-bold text-primary mb-2 line-clamp-2">{category.process_name}</h3>
 <p className="text-xs text-slate-600 mb-4 line-clamp-2">{category.description}</p>
 <div className="flex items-center gap-4">
 <div>
 <div className="text-xs text-slate-500">Riskler</div>
 <div className="text-lg font-bold text-primary">{category.risk_count || 0}</div>
 </div>
 {(category.critical_risks || 0) > 0 && (
 <div>
 <div className="text-xs text-red-500">Kritik</div>
 <div className="text-lg font-bold text-red-700">{category.critical_risks}</div>
 </div>
 )}
 </div>
 {(category.critical_risks || 0) > 0 && (
 <div className="absolute top-4 right-4">
 <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
 <span className="text-xs font-bold text-white">{category.critical_risks}</span>
 </div>
 </div>
 )}
 </button>
 );
 })}
 </div>
 )}
 </div>
 </>
 )}

 {viewMode === 'library' && <RKMLibrary />}

 {viewMode === 'cards' && (
 <RiskCardGrid
 risks={risks}
 onEdit={(risk) => console.log('edit', risk)}
 onDelete={deleteRisk}
 />
 )}

 {viewMode === 'master-grid' && <RKMMasterGrid />}

 {viewMode === 'network' && (
 <div className="h-[calc(100vh-200px)]">
 <RiskNetworkLoader />
 </div>
 )}

 {showAdHocWizard && (
 <AdHocRiskWizard
 isOpen={showAdHocWizard}
 onClose={() => setShowAdHocWizard(false)}
 />
 )}

 <RKMWizard
 isOpen={showRkmWizard}
 onClose={() => setShowRkmWizard(false)}
 />

 {showExcelImport && (
 <ExcelImportModal
 isOpen={showExcelImport}
 onClose={() => setShowExcelImport(false)}
 onImport={async (data, target) => {
 if (target !== 'RISK') {
 toast.error('Sadece Risk (RKM) hedefi destekleniyor.');
 return;
 }
 try {
 const { inserted, errors } = await importRisksFromExcel(data);
 queryClient.invalidateQueries({ queryKey: ['rkm-risks'] });
 queryClient.invalidateQueries({ queryKey: ['rkm-total-risk-count'] });
 queryClient.invalidateQueries({ queryKey: ['rkm-categories-with-stats'] });
 setShowExcelImport(false);
 if (errors.length) {
 toast.error(`${inserted} kayıt eklendi. ${errors.length} hata: ${errors.slice(0, 2).join('; ')}`);
 } else {
 toast.success(`${inserted} risk kaydı başarıyla yüklendi. Excel indir ile tekrar dışa aktarabilirsiniz.`);
 }
 } catch (e) {
 toast.error((e as Error).message || 'Excel yükleme başarısız.');
 }
 }}
 defaultTarget="RISK"
 />
 )}
 </div>
 );
}
