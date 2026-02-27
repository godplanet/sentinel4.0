import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Users, Cpu, LayoutGrid, Target } from 'lucide-react';
import clsx from 'clsx';
import { PageHeader } from '@/shared/ui';
import { fetchProfilesWithSkills, fetchServiceTemplates } from '@/features/talent-os/api';
import type { TalentProfileWithSkills, AuditServiceTemplate } from '@/features/talent-os/types';
import { ResourcePoolGrid } from '@/widgets/TalentOS/ResourcePoolGrid';
import { AuditorDetailPanel } from '@/widgets/TalentOS/AuditorDetailPanel';
import { BestFitPanel } from '@/widgets/TalentOS/BestFitPanel';

type TabKey = 'pool' | 'matcher';

const TABS = [
  { key: 'pool' as TabKey, label: 'Kaynak Havuzu', icon: LayoutGrid },
  { key: 'matcher' as TabKey, label: 'Akilli Eslestirme', icon: Target },
];

export default function TalentOSPage() {
  const [profiles, setProfiles] = useState<TalentProfileWithSkills[]>([]);
  const [templates, setTemplates] = useState<AuditServiceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('pool');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [p, t] = await Promise.all([
        fetchProfilesWithSkills(),
        fetchServiceTemplates(),
      ]);
      setProfiles(p);
      setTemplates(t);
    } catch (err) {
      console.error('Failed to load talent data:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedProfile = profiles.find((p) => p.id === selectedId) || null;

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-slate-50">
        <PageHeader
          title="Sentinel Talent OS"
          description="Moneyball - Kaynak Yonetim Sistemi"
          icon={Cpu}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Sentinel Talent OS"
        description="Moneyball - Kaynak Yonetim Sistemi"
        icon={Cpu}
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

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {activeTab === 'pool' && (
            <div className="flex gap-6">
              <div className={clsx('flex-1 min-w-0', selectedProfile && 'max-w-[60%]')}>
                <ResourcePoolGrid
                  profiles={profiles}
                  selectedId={selectedId}
                  onSelect={(id) => setSelectedId(selectedId === id ? null : id)}
                />
              </div>
              <AnimatePresence>
                {selectedProfile && (
                  <div className="w-[400px] flex-shrink-0">
                    <AuditorDetailPanel
                      profile={selectedProfile}
                      onClose={() => setSelectedId(null)}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}

          {activeTab === 'matcher' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-2">Akilli Eslestirme Motoru</h2>
                    <p className="text-teal-100 text-sm">
                      Denetim tipini secin, sistem becerilere, uygunluga ve yorgunluk durumuna gore
                      en uygun denetci adaylarini siralar. Kirmizi bolgede olan denetciler otomatik
                      olarak engellenir.
                    </p>
                  </div>
                </div>
              </div>
              <BestFitPanel profiles={profiles} templates={templates} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
