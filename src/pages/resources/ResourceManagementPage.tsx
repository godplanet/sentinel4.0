import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/shared/ui';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  Clock,
  BarChart3
} from 'lucide-react';
import clsx from 'clsx';
import { AuditorProfilesView } from '@/features/resources/profiles/AuditorProfilesView';
import { TalentMatrixView } from '@/features/resources/talent/TalentMatrixView';
import { ResourceAllocationView } from '@/features/resources/allocation/ResourceAllocationView';
import { TimesheetView } from '@/features/resources/timesheets/TimesheetView';
import { CapacityPlanningView } from '@/features/resources/capacity/CapacityPlanningView';

type TabKey = 'profiles' | 'talent' | 'allocation' | 'timesheets' | 'capacity';

const RESOURCE_TABS = [
  {
    key: 'profiles' as TabKey,
    label: 'Profiller',
    icon: Users,
  },
  {
    key: 'talent' as TabKey,
    label: 'Yetenek Matrisi',
    icon: GraduationCap,
  },
  {
    key: 'allocation' as TabKey,
    label: 'Kaynak Tahsisi',
    icon: CalendarCheck,
  },
  {
    key: 'timesheets' as TabKey,
    label: 'Zaman Çizelgeleri',
    icon: Clock,
  },
  {
    key: 'capacity' as TabKey,
    label: 'Kapasite Planlama',
    icon: BarChart3,
  },
];

export default function ResourceManagementPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as TabKey | null;
  const [activeTab, setActiveTab] = useState<TabKey>(tabFromUrl || 'profiles');

  useEffect(() => {
    if (tabFromUrl && RESOURCE_TABS.some(t => t.key === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profiles':
        return <AuditorProfilesView />;
      case 'talent':
        return <TalentMatrixView />;
      case 'allocation':
        return <ResourceAllocationView />;
      case 'timesheets':
        return <TimesheetView />;
      case 'capacity':
        return <CapacityPlanningView />;
      default:
        return <AuditorProfilesView />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <PageHeader
        title="Kaynak Yönetimi"
        subtitle="Denetçi Yönetimi, Yetkinlikler, Atama ve Kapasite Planlama"
        icon={Users}
      />

      <div className="border-b border-slate-200 bg-white px-6">
        <div className="flex gap-1">
          {RESOURCE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={clsx(
                  'flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all relative',
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {renderTabContent()}
      </div>
    </div>
  );
}
