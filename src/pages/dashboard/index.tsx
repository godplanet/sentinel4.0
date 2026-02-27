import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Sparkles, PieChart, Radar } from 'lucide-react';
import { PageHeader } from '@/shared/ui/PageHeader';
import { MissionControlHero } from '@/widgets/dashboard/MissionControlHero';
import { KPITicker } from '@/widgets/dashboard/KPITicker';
import { TaskWorkbench } from '@/widgets/dashboard/TaskWorkbench';
import { LivePulse } from '@/widgets/dashboard/LivePulse';
import { SystemHealthWidget } from '@/widgets/SystemHealth';
import { StrategicAnalyticsView } from '@/widgets/dashboard/StrategicAnalyticsView';
import { EcosystemView } from '@/widgets/dashboard/EcosystemView';
import { RiskHeatMap } from '@/widgets/dashboard/RiskHeatMap';
import { PredictiveRadar } from '@/widgets/PredictiveRadar';
import { TeamPulseWidget } from '@/widgets/dashboard/TeamPulseWidget';
import { PulseCheckModal, usePulseCheck } from '@/features/talent-os/components/PulseCheckModal';
import { supabase } from '@/shared/api/supabase';
import { useDashboardStats, buildKPICards } from './useDashboardStats';
import { useDashboardLiveData } from './useDashboardLiveData';
import clsx from 'clsx';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

type TabKey = 'mission-control' | 'strategic-analysis' | 'ecosystem';

const TABS = [
  { key: 'mission-control' as TabKey, label: 'Genel Bakis', icon: LayoutDashboard },
  { key: 'strategic-analysis' as TabKey, label: 'Stratejik Analiz', icon: PieChart },
  { key: 'ecosystem' as TabKey, label: 'Ekosistem & Gozetim', icon: Radar },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('mission-control');
  const [userId, setUserId]       = useState<string>(DEMO_USER_ID);

  const { data: stats }    = useDashboardStats();
  const { data: liveData } = useDashboardLiveData();
  const kpiCards           = buildKPICards(stats);
  const { show, dismiss }  = usePulseCheck(userId);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) setUserId(data.user.id);
    });
  }, []);

  const welcome    = liveData?.welcome    ?? { userName: 'Kullanici', role: 'Denetci', welcomeMessage: 'Hos geldiniz.', systemHealth: 0, lastLogin: '-' };
  const aiBrief    = liveData?.aiBrief    ?? { headline: 'Veriler yukleniyor...', summary: '', context: 'Sentinel Brain', sentiment: 'positive' as const };
  const tasks      = liveData?.tasks      ?? [];
  const activities = liveData?.activities ?? [];

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Yönetim Özeti"
          description="Sentinel GRC v3.0 - AI-Native Banking Audit Platform"
          icon={LayoutDashboard}
          action={
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-sm">
              <Sparkles size={16} />
              AI Asistani
            </button>
          }
        />

        <div className="border-b border-slate-200 bg-white rounded-xl shadow-sm">
          <div className="flex gap-1 px-6">
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

        {activeTab === 'mission-control' && (
          <div className="space-y-6">
            <MissionControlHero welcome={welcome} aiBrief={aiBrief} />

            <KPITicker kpis={kpiCards} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TaskWorkbench tasks={tasks} />
              </div>

              <div className="space-y-6">
                <SystemHealthWidget />
                <LivePulse activities={activities} />
                <TeamPulseWidget />
              </div>
            </div>

            <PredictiveRadar />

            <RiskHeatMap />
          </div>
        )}

        {activeTab === 'strategic-analysis' && <StrategicAnalyticsView />}

        {activeTab === 'ecosystem' && <EcosystemView />}
      </div>

      {/* Pulse Check Modal — rendered outside main layout to escape stacking contexts */}
      <AnimatePresence>
        {show && (
          <PulseCheckModal key="pulse-modal" userId={userId} onClose={dismiss} />
        )}
      </AnimatePresence>
    </>
  );
}
