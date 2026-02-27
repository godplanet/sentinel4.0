import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { Target, Map, PieChart, Calendar, Plus, List, GitBranch, Radar } from 'lucide-react';
import clsx from 'clsx';
import { UniverseScoring } from '@/widgets/UniverseScoring';
import { AnnualPlanner } from '@/widgets/AnnualPlanner';
import { StrategicHeatmap } from '@/widgets/StrategicHeatmap';
import { EntityFormModal, UniverseTree, UniverseListView } from '@/features/universe';

type TabKey = 'universe' | 'risk' | 'plan';
type UniverseView = 'tree' | 'list' | 'scoring';

const TABS = [
  { key: 'universe' as TabKey, label: 'Denetim Evreni', icon: Map },
  { key: 'risk' as TabKey, label: 'Stratejik Radar', icon: Radar },
  { key: 'plan' as TabKey, label: 'Yillik Plan', icon: Calendar },
];

export default function StrategyPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('universe');
  const [showEntityForm, setShowEntityForm] = useState(false);
  const [universeView, setUniverseView] = useState<UniverseView>('tree');

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Strateji Yonetimi"
        subtitle="Denetim Evreni, Risk Degerlendirme ve Yillik Planlama"
        icon={Target}
      />

      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'universe' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Map size={20} className="text-blue-600" />
                  Denetim Evreni Haritasi
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-100 p-0.5 rounded-lg">
                  {([
                    { key: 'tree' as UniverseView, icon: GitBranch, label: 'Agac' },
                    { key: 'list' as UniverseView, icon: List, label: 'Liste' },
                    { key: 'scoring' as UniverseView, icon: PieChart, label: 'Puanlama' },
                  ]).map(v => (
                    <button
                      key={v.key}
                      onClick={() => setUniverseView(v.key)}
                      className={clsx(
                        'px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5',
                        universeView === v.key
                          ? 'bg-white text-slate-800 shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      <v.icon size={13} />
                      {v.label}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowEntityForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
                >
                  <Plus size={16} />
                  Yeni Varlik Ekle
                </button>
              </div>
            </div>

            {universeView === 'tree' && <UniverseTree />}
            {universeView === 'list' && <UniverseListView />}
            {universeView === 'scoring' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
                <UniverseScoring />
              </div>
            )}
          </div>
        )}

        {activeTab === 'risk' && <StrategicHeatmap />}

        {activeTab === 'plan' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-green-600" />
              Yillik Denetim Plani
            </h3>
            <p className="text-slate-600 mb-4">
              Risk bazli yillik denetim takvimi ve kaynak tahsisi.
            </p>
            <div className="mt-6">
              <AnnualPlanner />
            </div>
          </div>
        )}
      </div>

      {showEntityForm && (
        <EntityFormModal onClose={() => setShowEntityForm(false)} />
      )}
    </div>
  );
}
