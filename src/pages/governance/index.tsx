import { useState } from 'react';
import { PageHeader } from '@/shared/ui';
import { Shield, FileText, Users, BookOpen, ScrollText } from 'lucide-react';
import clsx from 'clsx';
import { PolicyLibrary } from '@/widgets/PolicyLibrary';
import { CharterViewer } from '@/widgets/CharterViewer';
import { DeclarationsPanel } from '@/widgets/DeclarationsPanel';
import { GovernanceVault } from '@/widgets/GovernanceVault';

type TabKey = 'charter' | 'declarations' | 'committee' | 'policies';

const TABS = [
  { key: 'charter' as TabKey, label: 'Denetim Yonetmeligi', icon: ScrollText },
  { key: 'declarations' as TabKey, label: 'Bagimsizlik Beyanlari', icon: FileText },
  { key: 'committee' as TabKey, label: 'Denetim Komitesi', icon: Users },
  { key: 'policies' as TabKey, label: 'Politika Kutuphanesi', icon: BookOpen },
];

export default function GovernancePage() {
  const [activeTab, setActiveTab] = useState<TabKey>('charter');

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Yonetisim Kasasi"
        subtitle="Denetim Yonetmeligi, Politikalar ve Beyanlar"
        icon={Shield}
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
        {activeTab === 'charter' && <CharterViewer />}

        {activeTab === 'declarations' && <DeclarationsPanel />}

        {activeTab === 'committee' && <GovernanceVault />}

        {activeTab === 'policies' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-orange-600" />
              Kurumsal Politika Kutuphanesi
            </h3>
            <p className="text-slate-600 mb-6">
              Sirket politika, prosedur ve talimatlarinin merkezi deposu.
            </p>
            <PolicyLibrary />
          </div>
        )}
      </div>
    </div>
  );
}
