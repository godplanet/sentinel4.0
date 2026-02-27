import { useState, useEffect } from 'react';
import { PageHeader } from '@/shared/ui';
import { fetchRkmCategories, fetchRkmRisksByProcess, fetchRkmTotalRiskCount } from '@/entities/rkm/api';
import { RKMLibrary } from '@/widgets/RKMLibrary';
import { RKMMasterGrid } from '@/widgets/RKMMasterGrid';
import { RiskNetworkLoader } from '@/widgets/RiskNetwork/RiskNetworkLoader';
import { AdHocRiskWizard } from '@/features/risk-engine/AdHocRiskWizard';
import { ExcelImportModal } from '@/features/excel-import/ExcelImportModal';
import { RKMWizard } from '@/features/rkm-library/ui/RKMWizard';
import { RiskCardGrid } from '@/features/rkm-library/ui/RiskCardGrid';
import { useRiskLibraryStore } from '@/entities/risk';
import {
  Database,
  Plus,
  Layers,
  TrendingUp,
  AlertTriangle,
  Shield,
  Network,
  List,
  LayoutGrid,
  Table2,
  Upload,
  CreditCard,
} from 'lucide-react';
import clsx from 'clsx';

interface ProcessCategory {
  id: string;
  process_code: string;
  process_name: string;
  description: string;
  path: string;
  risk_count?: number;
  critical_risks?: number;
  high_risks?: number;
}

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
  const [categories, setCategories] = useState<ProcessCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRisks, setTotalRisks] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [showAdHocWizard, setShowAdHocWizard] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showRkmWizard, setShowRkmWizard] = useState(false);
  const { risks, deleteRisk } = useRiskLibraryStore();

  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchRkmCategories();
      const categoriesWithStats = await Promise.all(
        data.map(async (cat) => {
          const risks = await fetchRkmRisksByProcess(cat.process_name);
          return {
            ...cat,
            risk_count: risks.length,
            critical_risks: risks.filter((r) => r.residual_rating === 'KRITIK').length,
            high_risks: risks.filter((r) => r.residual_rating === 'YUKSEK').length,
          };
        })
      );
      setCategories(categoriesWithStats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const count = await fetchRkmTotalRiskCount();
      setTotalRisks(count);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const viewTabs = [
    { id: 'overview' as const, label: 'Genel Bakış', icon: LayoutGrid },
    { id: 'library' as const, label: 'Kütüphane', icon: List },
    { id: 'cards' as const, label: 'Kart Görünümü', icon: CreditCard },
    { id: 'master-grid' as const, label: 'Master Grid', icon: Table2 },
    { id: 'network' as const, label: 'Risk Ağı', icon: Network },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Kontrol Matrisi (RKM) Kutuphanesi"
        description="Süreç Bazlı Risk Kontrol Matrisi Yönetimi"
        icon={Database}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExcelImport(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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
              className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Plus size={14} />
              Ad-Hoc Risk
            </button>
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1">
              {viewTabs.map((tab) => {
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
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase text-slate-600 font-bold tracking-wider">Toplam Risk</div>
                <Shield size={20} className="text-slate-400" />
              </div>
              <div className="text-4xl font-bold text-slate-900">{totalRisks}</div>
              <p className="text-xs text-slate-500 mt-1">Tum surecler</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase text-slate-600 font-bold tracking-wider">Surec Kategorisi</div>
                <Layers size={20} className="text-slate-400" />
              </div>
              <div className="text-4xl font-bold text-slate-900">{categories.length}</div>
              <p className="text-xs text-slate-500 mt-1">Ana kategori</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase text-red-600 font-bold tracking-wider">Kritik Riskler</div>
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <div className="text-4xl font-bold text-red-700">
                {Array.isArray(categories) ? categories.reduce((sum, cat) => sum + (cat?.critical_risks || 0), 0) : 0}
              </div>
              <p className="text-xs text-red-500 mt-1">Acil mudahale gerekli</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">Ana Surec Kategorileri</h2>
            {loading ? (
              <div className="text-center py-12 text-slate-500">Yukleniyor...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.isArray(categories) && categories.filter(Boolean).map((category) => {
                  const iconConfig = categoryIcons[category.process_code] || { icon: Database, color: 'from-slate-600 to-slate-700' };
                  const Icon = iconConfig.icon;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setViewMode('library')}
                      className="group relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 text-left hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${iconConfig.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="text-white" size={28} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2 line-clamp-2">{category.process_name}</h3>
                      <p className="text-xs text-slate-600 mb-4 line-clamp-2">{category.description}</p>
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xs text-slate-500">Riskler</div>
                          <div className="text-lg font-bold text-slate-900">{category.risk_count || 0}</div>
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
          onImport={async (data) => {
            console.log('Imported data:', data);
            setShowExcelImport(false);
          }}
          defaultTarget="RISK"
        />
      )}
    </div>
  );
}
